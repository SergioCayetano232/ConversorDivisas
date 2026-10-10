const { test } = require("node:test");
const assert = require("node:assert");
const { leerPersonas, porPersona, leerViajes, crearViaje, resumenParaCompartir } = require("../logica.js");

const gasto = (id, valor, to = "EUR") => ({ id, from: "JPY", to, cantidad: valor * 160, valor, concepto: "", cuando: Date.now(), categoria: "comida", pago: "tarjeta", comision: 0 });

test("lo que no es un número de personas que valga es uno", () => {
  assert.equal(leerPersonas(3), 3);
  assert.equal(leerPersonas(undefined), 1);
  assert.equal(leerPersonas(0), 1);
  assert.equal(leerPersonas(2.5), 1);
  assert.equal(leerPersonas(99), 1);
});

test("los viajes de antes salen con una persona y los nuevos también", () => {
  const viejos = leerViajes({ activo: "j", lista: [{ id: "j", nombre: "Japón", gastos: [], presupuesto: null }] });
  assert.equal(viejos.lista[0].personas, 1);
  assert.equal(crearViaje(viejos, "l", "Lisboa").lista[1].personas, 1);
  assert.equal(leerViajes({ activo: "j", lista: [{ id: "j", nombre: "J", gastos: [], personas: 4 }] }).lista[0].personas, 4);
});

test("por cabeza, en la divisa principal", () => {
  const r = porPersona([gasto("a", 90), gasto("b", 30), gasto("c", 5, "USD")], 3);
  assert.deepEqual(r, { total: 40, to: "EUR", personas: 3 });
  assert.equal(porPersona([gasto("a", 90)], 1), null, "solo, no hace falta");
  assert.equal(porPersona([], 3), null);
});

test("el resumen para compartir lo dice si sois varios", () => {
  const viaje = { nombre: "Japón", gastos: [gasto("a", 90), gasto("b", 30)], presupuesto: null };
  assert.match(resumenParaCompartir({ ...viaje, personas: 3 }), /Entre 3: \*40,00 EUR\* cada uno/);
  assert.doesNotMatch(resumenParaCompartir({ ...viaje, personas: 1 }), /Entre/);
  assert.doesNotMatch(resumenParaCompartir(viaje), /Entre/);
});
