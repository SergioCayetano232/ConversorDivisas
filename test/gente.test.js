const { test } = require("node:test");
const assert = require("node:assert");
const {
  crearGasto, leerGastos, leerViajes, duplicarViaje, repetirGasto, leerPagador, leerGente, ponerNombre, nombrePersona,
  inicialPersona, cuentasViaje, frasePago, hayOtrosPagadores, resumenParaCompartir,
} = require("../logica.js");

const gasto = (id, valor, pagador, to = "EUR") => crearGasto({
  id, from: "JPY", to, cantidad: valor * 160, valor, concepto: "Cena", cuando: Date.now(), categoria: "comida", pagador,
});

test("el pagador solo se guarda si no eres tú", () => {
  assert.equal("pagador" in gasto("a", 10), false);
  assert.equal("pagador" in gasto("a", 10, 0), false);
  assert.equal(gasto("a", 10, 2).pagador, 2);
  assert.equal("pagador" in gasto("a", 10, -1), false);
  assert.equal("pagador" in gasto("a", 10, 1.5), false);
});

test("leerGastos tira los pagadores raros y deja los buenos", () => {
  const [bueno, raro, viejo] = leerGastos([{ ...gasto("a", 10), pagador: 1 }, { ...gasto("b", 10), pagador: "Ana" }, gasto("c", 10)]);
  assert.equal(bueno.pagador, 1);
  assert.equal("pagador" in raro, false);
  assert.equal("pagador" in viejo, false);
  assert.equal(leerPagador(99), 0);
});

test("volver a apuntarlo hoy lo deja con el mismo pagador", () => {
  assert.equal(repetirGasto(gasto("a", 10, 2), { id: "b", cuando: Date.now(), tasa: 0.006 }).pagador, 2);
});

test("los nombres se limpian y sin escribir no se guarda nada", () => {
  assert.deepEqual(leerGente(undefined), []);
  assert.deepEqual(leerGente(["", "  Ana  ", 3, ""]), ["", "Ana"]);
  assert.deepEqual(leerGente(["Un nombre larguísimo de verdad"]), ["Un nombre larg"]);
  assert.deepEqual(ponerNombre([], 2, "Luis"), ["", "", "Luis"]);
  assert.deepEqual(ponerNombre(["", "", "Luis"], 2, " "), []);
});

test("sin nombre, tú eres Tú y los demás van por número", () => {
  assert.equal(nombrePersona([], 0), "Tú");
  assert.equal(nombrePersona([], 2), "Persona 3");
  assert.equal(nombrePersona(["", "Ana"], 1), "Ana");
  assert.equal(inicialPersona([], 0), "Tú");
  assert.equal(inicialPersona([], 2), "3");
  assert.equal(inicialPersona(["", "álex"], 1), "Á");
});

test("los viajes guardan la gente si la hay y la copia se la lleva", () => {
  const viajes = leerViajes({ activo: "j", lista: [{ id: "j", nombre: "Japón", gastos: [], personas: 3, gente: ["", "Ana"] }] });
  assert.deepEqual(viajes.lista[0].gente, ["", "Ana"]);
  assert.equal("gente" in leerViajes({ activo: "j", lista: [{ id: "j", nombre: "J", gastos: [] }] }).lista[0], false);
  assert.deepEqual(duplicarViaje(viajes, "j", "k").lista[1].gente, ["", "Ana"]);
});

test("tres, uno lo paga todo: los otros dos le deben su parte", () => {
  const c = cuentasViaje([gasto("a", 90), gasto("b", 30)], 3);
  assert.equal(c.to, "EUR");
  assert.deepEqual(c.gente.map((p) => p.saldo), [80, -40, -40]);
  assert.deepEqual(c.pagos, [{ de: 1, a: 0, importe: 40 }, { de: 2, a: 0, importe: 40 }]);
});

test("cada uno pone algo y salen los pagos justos", () => {
  // 60 + 30 + 0 = 90, a 30 cada uno: el 2 le debe 30 al 0.
  const c = cuentasViaje([gasto("a", 60, 0), gasto("b", 30, 1)], 3);
  assert.deepEqual(c.pagos, [{ de: 2, a: 0, importe: 30 }]);
});

test("los céntimos que no se reparten no descuadran nada", () => {
  const c = cuentasViaje([gasto("a", 100, 1)], 3);
  const partes = c.gente.map((p) => p.parte);
  assert.deepEqual(partes, [33.34, 33.33, 33.33]);
  const pagado = c.pagos.reduce((s, p) => s + p.importe, 0);
  assert.equal(Math.round(pagado * 100), 6667);
});

test("si alguien ya no está en el viaje, lo suyo cuenta como tuyo", () => {
  const c = cuentasViaje([gasto("a", 40, 3)], 2);
  assert.deepEqual(c.pagos, [{ de: 1, a: 0, importe: 20 }]);
});

test("solo cuenta la divisa del total, como el por cabeza", () => {
  const c = cuentasViaje([gasto("a", 90, 1), gasto("b", 5, 0, "USD")], 2);
  assert.deepEqual(c.pagos, [{ de: 0, a: 1, importe: 45 }]);
});

test("solo o sin gastos no hay cuentas", () => {
  assert.equal(cuentasViaje([gasto("a", 90)], 1), null);
  assert.equal(cuentasViaje([], 3), null);
});

test("las frases se cuentan desde ti", () => {
  const gente = ["", "Ana", "Luis"];
  assert.equal(frasePago({ de: 1, a: 0, importe: 40 }, gente, "EUR"), "Ana te debe 40,00 EUR");
  assert.equal(frasePago({ de: 0, a: 2, importe: 12.5 }, gente, "EUR"), "Le debes 12,50 EUR a Luis");
  assert.equal(frasePago({ de: 1, a: 2, importe: 5 }, gente, "EUR"), "Ana le debe 5,00 EUR a Luis");
});

test("el resumen lleva las cuentas solo si alguien más ha pagado algo", () => {
  const viaje = { nombre: "Japón", personas: 2, gente: ["", "Ana"] };
  assert.doesNotMatch(resumenParaCompartir({ ...viaje, gastos: [gasto("a", 90)] }), /debe/);
  assert.match(resumenParaCompartir({ ...viaje, gastos: [gasto("a", 90), gasto("b", 30, 1)] }), /💸 Ana te debe 30,00 EUR/);
  assert.match(resumenParaCompartir({ ...viaje, gastos: [gasto("a", 30), gasto("b", 30, 1)] }), /nadie debe nada/);
  assert.equal(hayOtrosPagadores([gasto("a", 30, 1)], 1), false, "con uno solo no cuenta");
});
