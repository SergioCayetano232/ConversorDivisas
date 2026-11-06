const { test } = require("node:test");
const assert = require("node:assert");
const {
  crearGasto, leerGastos, repetirGasto, devolucionDe, repartirNoches, leerEntre, entreDe, cambiarEntre, cuentasViaje,
} = require("../logica.js");

const gasto = (id, valor, { pagador, entre } = {}) => crearGasto({
  id, from: "JPY", to: "EUR", cantidad: valor * 160, valor, concepto: "Museo", cuando: Date.now(), categoria: "ocio", pagador, entre,
});

test("sin decir quiénes, no se guarda nada", () => {
  assert.equal("entre" in gasto("a", 10), false);
  assert.equal("entre" in gasto("a", 10, { entre: [] }), false);
  assert.equal("entre" in gasto("a", 10, { entre: "Ana" }), false);
  assert.deepEqual(gasto("a", 10, { entre: [2, 0, 2] }).entre, [0, 2]);
});

test("leerEntre tira lo raro", () => {
  assert.equal(leerEntre(undefined), null);
  assert.deepEqual(leerEntre([1, -1, 1.5, "2", 99, 0]), [0, 1]);
  assert.deepEqual(leerGastos([{ ...gasto("a", 10), entre: [3, 1] }])[0].entre, [1, 3]);
  assert.equal("entre" in leerGastos([{ ...gasto("a", 10), entre: ["x"] }])[0], false);
});

test("el museo de 40 solo entre Ana y tú, de cuatro", () => {
  // Tú pagas una cena de 80 entre todos y el museo de 40 entre Ana (1) y tú.
  const c = cuentasViaje([gasto("a", 80), gasto("b", 40, { entre: [0, 1] })], 4);
  assert.deepEqual(c.gente.map((p) => p.parte), [40, 40, 20, 20]);
  assert.deepEqual(c.gente.map((p) => p.saldo), [80, -40, -20, -20]);
  const pagado = c.pagos.reduce((s, p) => s + p.importe, 0);
  assert.equal(pagado, 80);
});

test("lo de uno solo lo paga él aunque lo pagaras tú", () => {
  // Le pagaste a Luis (2) su entrada: te la debe entera.
  const c = cuentasViaje([gasto("a", 15, { entre: [2] })], 3);
  assert.deepEqual(c.pagos, [{ de: 2, a: 0, importe: 15 }]);
});

test("los de todos dan al céntimo lo mismo que antes", () => {
  const sin = cuentasViaje([gasto("a", 10), gasto("b", 10, { pagador: 1 })], 3);
  const con = cuentasViaje([gasto("a", 10, { entre: [0, 1, 2] }), gasto("b", 10, { pagador: 1, entre: [0, 1, 2] })], 3);
  assert.deepEqual(con, sin);
  assert.deepEqual(sin.gente.map((p) => p.parte), [6.67, 6.67, 6.66]);
});

test("los céntimos de un grupo no descuadran nada", () => {
  const c = cuentasViaje([gasto("a", 10, { entre: [0, 1, 3] })], 4);
  assert.deepEqual(c.gente.map((p) => p.parte), [3.34, 3.33, 0, 3.33]);
  assert.equal(Math.round(c.gente.reduce((s, p) => s + p.saldo, 0) * 100), 0);
});

test("si bajas la gente, el que ya no está cuenta como tú", () => {
  const g = gasto("a", 30, { entre: [1, 3] });
  assert.deepEqual(entreDe(g, 3), [1, 0]);
  // Con dos, Ana y tú sois todos: como si no dijera nada.
  assert.equal(entreDe(g, 2), null);
  assert.equal(entreDe(gasto("a", 30), 3), null);
});

test("cambiarEntre guarda solo cuando no sois todos", () => {
  const lista = [gasto("a", 30), gasto("b", 20)];
  const dos = cambiarEntre(lista, "a", [0, 1], 3);
  assert.deepEqual(dos[0].entre, [0, 1]);
  assert.equal(dos[1], lista[1]);
  const todos = cambiarEntre(dos, "a", [0, 1, 2], 3);
  assert.equal("entre" in todos[0], false);
  assert.equal(cambiarEntre(lista, "a", [0, 1, 2], 3), lista, "sin cambios devuelve la misma lista");
  assert.equal(cambiarEntre(lista, "zz", [0], 3), lista);
});

test("volver a apuntarlo, devolverlo o partirlo en noches mantiene quiénes", () => {
  const g = gasto("a", 30, { entre: [0, 2] });
  assert.deepEqual(repetirGasto(g, { id: "b", cuando: Date.now(), tasa: 0.006 }).entre, [0, 2]);
  assert.deepEqual(devolucionDe(g, { id: "c", cuando: Date.now() }).entre, [0, 2]);
  assert.ok(repartirNoches(g, 3).every((n) => String(n.entre) === "0,2"));
});

test("una devolución del museo vuelve solo a los que entraron", () => {
  const g = gasto("a", 40, { entre: [0, 1] });
  const c = cuentasViaje([gasto("x", 60), g, devolucionDe(g, { id: "d", cuando: Date.now() })], 3);
  assert.deepEqual(c.gente.map((p) => p.parte), [20, 20, 20]);
});

test("la frase de quiénes, contigo al final", () => {
  const { fraseEntre } = require("../logica.js");
  const gente = ["", "Ana", "Luis"];
  assert.equal(fraseEntre([0, 1], gente), "Solo Ana y tú");
  assert.equal(fraseEntre([1, 2], gente), "Solo Ana y Luis");
  assert.equal(fraseEntre([0, 2, 3], gente), "Solo Luis, Persona 4 y tú");
  assert.equal(fraseEntre([2], gente), "Solo Luis");
});
