const { test } = require("node:test");
const assert = require("node:assert");
const { lineaTasa, limpiarCopia } = require("../logica.js");

test("al derecho, como siempre, con cuatro decimales", () => {
  assert.equal(lineaTasa(1.0847, "EUR", "USD"), "1 EUR = 1,0847 USD");
  assert.equal(lineaTasa(162.5, "EUR", "JPY"), "1 EUR = 162,5000 JPY");
});

test("al revés se da la vuelta al par", () => {
  assert.equal(lineaTasa(1.0847, "EUR", "USD", true), "1 USD = 0,9219 EUR");
});

test("las tasas muy pequeñas llevan los decimales que hagan falta", () => {
  assert.equal(lineaTasa(162.5, "EUR", "JPY", true), "1 JPY = 0,006154 EUR");
  assert.equal(lineaTasa(17000, "EUR", "IDR", true), "1 IDR = 0,00005882 EUR");
  assert.equal(lineaTasa(1e9, "EUR", "XXX", true), "1 XXX = 0,00000000 EUR", "con ocho se para");
});

test("sin tasa no hay línea", () => {
  assert.equal(lineaTasa(null, "EUR", "USD"), "");
  assert.equal(lineaTasa(0, "EUR", "USD", true), "");
});

test("la copia de seguridad se lleva si la tenías al revés", () => {
  assert.equal(limpiarCopia({ tasaAlReves: true }).tasaAlReves, true);
  assert.equal("tasaAlReves" in limpiarCopia({ tasaAlReves: "sí" }), false);
});
