const { test } = require("node:test");
const assert = require("node:assert");
const { leerOmnibox, escaparXml } = require("../logica.js");

const PAR = { from: "EUR", to: "USD" };
const leer = (texto) => leerOmnibox(texto, PAR);

test("solo la cantidad usa tu par", () => {
  assert.deepEqual(leer("20"), { cantidad: 20, from: "EUR", to: "USD" });
  assert.deepEqual(leer("12,50"), { cantidad: 12.5, from: "EUR", to: "USD" });
});

test("con una divisa, la otra sale del par como en la tarjeta", () => {
  assert.deepEqual(leer("20 gbp"), { cantidad: 20, from: "GBP", to: "USD" });
  assert.deepEqual(leer("20 usd"), { cantidad: 20, from: "USD", to: "EUR" }, "si ya es la de destino, al revés");
});

test("con dos divisas manda lo que escribes", () => {
  assert.deepEqual(leer("50 eur gbp"), { cantidad: 50, from: "EUR", to: "GBP" });
  assert.deepEqual(leer("50 eur a gbp"), { cantidad: 50, from: "EUR", to: "GBP" });
  assert.deepEqual(leer("50 EUR to GBP"), { cantidad: 50, from: "EUR", to: "GBP" });
  assert.deepEqual(leer("usd 50 jpy"), { cantidad: 50, from: "USD", to: "JPY" });
});

test("símbolos pegados y nombres", () => {
  assert.deepEqual(leer("20€"), { cantidad: 20, from: "EUR", to: "USD" });
  assert.deepEqual(leer("$20"), { cantidad: 20, from: "USD", to: "EUR" });
  assert.deepEqual(leer("20 libras"), { cantidad: 20, from: "GBP", to: "USD" });
  assert.deepEqual(leer("1000 yenes a euros"), { cantidad: 1000, from: "JPY", to: "EUR" });
});

test("también vale una cuenta", () => {
  assert.deepEqual(leer("100-15% gbp"), { cantidad: 85, from: "GBP", to: "USD" });
  assert.deepEqual(leer("3*12,50 usd"), { cantidad: 37.5, from: "USD", to: "EUR" });
  assert.deepEqual(leer("3 x 4 gbp"), { cantidad: 12, from: "GBP", to: "USD" }, "la x es 'por', no una divisa");
});

test("lo que no se entiende no se convierte", () => {
  assert.equal(leer(""), null);
  assert.equal(leer("usd"), null, "sin cantidad");
  assert.equal(leer("hola 20"), null);
  assert.equal(leer("0 usd"), null);
  assert.equal(leer("20 usd eur gbp"), null, "tres divisas es una de más");
  assert.equal(leer("20 eur eur"), null, "de una a la misma");
  assert.equal(leerOmnibox(null, PAR), null);
});

test("el XML de la sugerencia no se rompe con un &", () => {
  assert.equal(escaparXml("A & B <c>"), "A &amp; B &lt;c&gt;");
});
