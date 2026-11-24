const { test } = require("node:test");
const assert = require("node:assert");
const { anadidoConvertido } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("un precio se escribe con su divisa y dos decimales", () => {
  ponerIdioma("es");
  assert.equal(anadidoConvertido({ valor: 43.1, to: "EUR" }), "(≈ 43,10 EUR)");
  assert.equal(anadidoConvertido({ valor: 12500, to: "JPY" }), "(≈ 12.500,00 JPY)");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  assert.equal(anadidoConvertido({ valor: 1234.5, to: "USD" }), "(≈ 1,234.50 USD)");
  ponerIdioma("es");
});

test("una medida va tal cual llega", () => {
  assert.equal(anadidoConvertido({ texto: " 105 km/h " }), "(≈ 105 km/h)");
});

test("sin nada que escribir, nada", () => {
  assert.equal(anadidoConvertido(), "");
  assert.equal(anadidoConvertido({ valor: NaN, to: "EUR" }), "");
  assert.equal(anadidoConvertido({ valor: 10, to: "XXX" }), "");
  assert.equal(anadidoConvertido({ texto: "  " }), "");
});
