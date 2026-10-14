const { test } = require("node:test");
const assert = require("node:assert");
const { gastoRepetido, REPETIDO_MS } = require("../logica.js");

const ahora = Date.UTC(2026, 9, 14, 12, 0, 0);
const g = (cantidad, concepto = "Café", hace = 30000, from = "JPY") =>
  ({ cantidad, concepto, from, to: "EUR", valor: cantidad / 160, cuando: ahora - hace });

test("el mismo café hace 30 segundos salta", () => {
  assert.deepEqual(gastoRepetido([g(500)], g(500, "Café", 0), ahora), { segundos: 30 });
});

test("el concepto da igual en mayúsculas", () => {
  assert.ok(gastoRepetido([g(500, "café")], g(500, "CAFÉ", 0), ahora));
});

test("sin concepto los dos también cuenta", () => {
  assert.ok(gastoRepetido([g(500, "")], g(500, "", 0), ahora));
});

test("pasados dos minutos ya no", () => {
  assert.equal(gastoRepetido([g(500, "Café", REPETIDO_MS)], g(500, "Café", 0), ahora), null);
  assert.ok(gastoRepetido([g(500, "Café", REPETIDO_MS - 1000)], g(500, "Café", 0), ahora));
});

test("otro importe, otro concepto u otra divisa no es el mismo", () => {
  assert.equal(gastoRepetido([g(500)], g(600, "Café", 0), ahora), null);
  assert.equal(gastoRepetido([g(500)], g(500, "Té", 0), ahora), null);
  assert.equal(gastoRepetido([g(500, "Café", 30000, "USD")], g(500, "Café", 0), ahora), null);
});

test("las noches de hotel de días que vienen no cuentan", () => {
  assert.equal(gastoRepetido([g(9000, "Hotel", -86400000)], g(9000, "Hotel", 0), ahora), null);
});

test("sin gasto, nada", () => {
  assert.equal(gastoRepetido([g(500)], null, ahora), null);
});
