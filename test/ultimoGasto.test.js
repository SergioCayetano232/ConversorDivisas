const { test } = require("node:test");
const assert = require("node:assert");
const { ultimoGasto } = require("../logica.js");

const ahora = new Date(2026, 9, 7, 20).getTime();
const g = (id, dia, hora = 13) => ({ id, cuando: new Date(2026, 9, dia, hora).getTime() });

test("el más reciente por la fecha, no el primero de la lista", () => {
  assert.equal(ultimoGasto([g("ayer", 6), g("hoy", 7), g("antes", 5)], ahora).id, "hoy");
  assert.equal(ultimoGasto([g("comida", 7, 13), g("cena", 7, 19)], ahora).id, "cena");
});

test("las noches de hotel que aún no han llegado no cuentan", () => {
  assert.equal(ultimoGasto([g("2/3", 8), g("3/3", 9), g("1/3", 7)], ahora).id, "1/3");
});

test("sin gastos, o todos por llegar, ninguno", () => {
  assert.equal(ultimoGasto([], ahora), null);
  assert.equal(ultimoGasto([g("mañana", 8)], ahora), null);
});
