const { test } = require("node:test");
const assert = require("node:assert");
const { leerConversionDicha } = require("../logica.js");

const par = { from: "JPY", to: "EUR" };
const leer = (texto, p = par) => {
  const r = leerConversionDicha(texto, p);
  return r && [r.cantidad, r.from, r.to];
};

test("la pregunta de siempre: a tu divisa", () => {
  assert.deepEqual(leer("¿Cuánto son 30 dólares?"), [30, "USD", "EUR"]);
  assert.deepEqual(leer("cuanto es cuarenta y cinco"), [45, "JPY", "EUR"]);
  assert.deepEqual(leer("mil yenes"), [1000, "JPY", "EUR"]);
});

test("con adónde, detrás de a, en o in", () => {
  assert.deepEqual(leer("30 dólares a libras"), [30, "USD", "GBP"]);
  assert.deepEqual(leer("20 libras en yenes"), [20, "GBP", "JPY"]);
  assert.deepEqual(leer("how much is 30 dollars in pounds"), [30, "USD", "GBP"]);
  assert.deepEqual(leer("100 a usd"), [100, "JPY", "USD"]);
  assert.equal(leerConversionDicha("30 dólares a libras", par).conDestino, true);
  assert.equal(leerConversionDicha("30 dólares", par).conDestino, false);
});

test("en tu divisa, al revés", () => {
  assert.deepEqual(leer("doce euros con cincuenta"), [12.5, "EUR", "JPY"]);
  assert.deepEqual(leer("30 euros en euros"), [30, "EUR", "JPY"]);
});

test("los pesos son los del par que tienes puesto", () => {
  assert.deepEqual(leer("50.000 pesos", { from: "COP", to: "EUR" }), [50000, "COP", "EUR"]);
  assert.deepEqual(leer("10 euros en pesos", { from: "COP", to: "EUR" }), [10, "EUR", "COP"]);
});

test("un 'en' que no va a una divisa no corta nada", () => {
  assert.deepEqual(leer("50 dólares en efectivo"), [50, "USD", "EUR"]);
  assert.equal(leer("taxi en el centro"), null);
});

test("sin cantidad, nada", () => {
  assert.equal(leer("cuánto son"), null);
  assert.equal(leer(""), null);
  assert.equal(leer(null), null);
});
