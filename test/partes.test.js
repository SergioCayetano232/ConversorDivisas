const { test } = require("node:test");
const assert = require("node:assert");
const {
  crearGasto, leerGastos, repetirGasto, devolucionDe, repartirNoches, leerPartes, partesDe, repartirPorPartes, cambiarEntre,
  cuentasViaje, consumoGente, fraseEntre, mensajeCobro,
} = require("../logica.js");

const gasto = (id, valor, { pagador, entre, partes } = {}) => crearGasto({
  id, from: "JPY", to: "EUR", cantidad: valor * 160, valor, concepto: "Hotel", cuando: Date.now(), categoria: "alojamiento", pagador, entre, partes,
});

test("90 euros, con Ana doble: 45, 22,50 y 22,50", () => {
  const c = cuentasViaje([gasto("a", 90, { partes: { 1: 2 } })], 3);
  assert.deepEqual(c.gente.map((p) => p.parte), [22.5, 45, 22.5]);
  assert.deepEqual(c.pagos, [{ de: 1, a: 0, importe: 45 }, { de: 2, a: 0, importe: 22.5 }]);
});

test("el ½ cuenta la mitad", () => {
  const c = cuentasViaje([gasto("a", 50, { partes: { 2: 0.5 } })], 3);
  assert.deepEqual(c.gente.map((p) => p.parte), [20, 20, 10]);
});

test("las partes solo entre los que entran", () => {
  const c = cuentasViaje([gasto("a", 30, { entre: [0, 1], partes: { 1: 2 } })], 4);
  assert.deepEqual(c.gente.map((p) => p.parte), [10, 20, 0, 0]);
});

test("el céntimo que sobra no descuadra", () => {
  assert.deepEqual(repartirPorPartes(1000, [1, 2, 1]), [250, 500, 250]);
  const trozos = repartirPorPartes(1001, [1, 2, 0.5]);
  assert.equal(trozos.reduce((a, b) => a + b, 0), 1001);
  const c = cuentasViaje([gasto("a", 10.01, { partes: { 1: 2, 2: 0.5 } }), gasto("b", 7.77, { pagador: 2 })], 3);
  assert.equal(Math.round(c.gente.reduce((s, p) => s + p.saldo, 0) * 100), 0);
});

test("con todos a 1 reparte el céntimo como siempre", () => {
  assert.deepEqual(repartirPorPartes(1000, [1, 1, 1]), [334, 333, 333]);
});

test("también en negativo cuadra", () => {
  assert.equal(repartirPorPartes(-1001, [1, 2, 1]).reduce((a, b) => a + b, 0), -1001);
});

test("los de antes salen al céntimo igual", () => {
  const con = cuentasViaje([gasto("a", 10), gasto("b", 10, { pagador: 1 })], 3);
  assert.deepEqual(con.gente.map((p) => p.parte), [6.67, 6.67, 6.66]);
  assert.equal("partes" in gasto("a", 10), false);
});

test("leerPartes tira lo raro y lo que vale 1", () => {
  assert.equal(leerPartes(undefined), null);
  assert.equal(leerPartes([2, 2]), null);
  assert.equal(leerPartes({ 1: 1 }), null);
  assert.deepEqual(leerPartes({ 1: 2, 2: 7, 3: "2", x: 3, 99: 2, 4: 0.5 }), { 1: 2, 4: 0.5 });
});

test("se guarda y se relee", () => {
  const g = gasto("a", 10, { partes: { 1: 2 } });
  assert.deepEqual(leerGastos([g])[0].partes, { 1: 2 });
  assert.equal("partes" in leerGastos([{ ...g, partes: "mucho" }])[0], false);
});

test("si todos cuentan igual no es desigual", () => {
  assert.equal(partesDe({ partes: { 0: 2, 1: 2 } }, 2), null);
  assert.equal(partesDe({ entre: [0, 1], partes: { 0: 3, 1: 3 } }, 4), null);
});

test("el que no entra no pesa", () => {
  assert.equal(partesDe({ entre: [0, 1], partes: { 2: 3 } }, 4), null);
  assert.deepEqual(partesDe({ entre: [0, 1], partes: { 1: 2, 2: 3 } }, 4), { 1: 2 });
});

test("si bajas la gente, el que ya no está deja de pesar", () => {
  assert.equal(partesDe({ partes: { 3: 2 } }, 3), null);
});

test("cambiarEntre guarda las partes aunque entren todos", () => {
  const lista = [gasto("a", 30)];
  const con = cambiarEntre(lista, "a", [0, 1, 2], 3, { 1: 2 });
  assert.deepEqual(con[0].partes, { 1: 2 });
  assert.equal("entre" in con[0], false);
  assert.equal(cambiarEntre(con, "a", [0, 1, 2], 3, { 1: 2 }), con, "sin cambios devuelve la misma lista");
  assert.equal("partes" in cambiarEntre(con, "a", [0, 1, 2], 3, {})[0], false);
});

test("repetirlo, devolverlo o partirlo en noches mantiene las partes", () => {
  const g = gasto("a", 30, { partes: { 1: 2 } });
  assert.deepEqual(repetirGasto(g, { id: "b", cuando: Date.now(), tasa: 0.006 }).partes, { 1: 2 });
  assert.deepEqual(devolucionDe(g, { id: "c", cuando: Date.now() }).partes, { 1: 2 });
  assert.ok(repartirNoches(g, 3).every((n) => n.partes[1] === 2));
});

test("una devolución vuelve con las mismas partes", () => {
  const g = gasto("a", 30, { partes: { 1: 2 } });
  const c = cuentasViaje([gasto("x", 30), g, devolucionDe(g, { id: "d", cuando: Date.now() })], 2);
  assert.deepEqual(c.gente.map((p) => p.parte), [15, 15]);
});

test("el resumen sabe que no es a partes iguales", () => {
  assert.equal(consumoGente([gasto("a", 90, { partes: { 1: 2 } })], 3).igual, false);
  assert.equal(consumoGente([gasto("a", 90)], 3).igual, true);
});

test("la frase, con lo que cuenta cada uno", () => {
  const gente = ["", "Ana", "Luis"];
  assert.equal(fraseEntre([0, 1, 2], gente, { 1: 2 }, true), "Ana ×2, Luis y tú");
  assert.equal(fraseEntre([0, 1], gente, { 1: 2 }), "Solo Ana ×2 y tú");
  assert.equal(fraseEntre([0, 2], gente, { 2: 0.5 }), "Solo Luis ×½ y tú");
});

test("el mensaje de cobro cuenta sus partes", () => {
  const texto = mensajeCobro({ nombre: "Japón", gastos: [gasto("a", 90, { partes: { 1: 2 } })], personas: 3, gente: ["", "Ana", "Luis"], saldados: [] }, 1);
  assert.match(texto, /Hotel 90,00, 2 de 4 partes/);
  assert.doesNotMatch(texto, /entre 3/);
});
