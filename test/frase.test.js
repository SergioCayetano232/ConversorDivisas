const { test } = require("node:test");
const assert = require("node:assert");
const { fraseParaCopiar, atajoPara } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("la frase lleva las dos cantidades con su divisa", () => {
  ponerIdioma("es");
  assert.equal(fraseParaCopiar({ cantidad: 38.9, from: "EUR", valor: 42.1, to: "USD" }), "38,90 EUR = 42,10 USD");
  assert.equal(fraseParaCopiar({ cantidad: 1299, from: "GBP", valor: 1681.06, to: "USD" }), "1.299,00 GBP = 1.681,06 USD");
  ponerIdioma("en");
  assert.equal(fraseParaCopiar({ cantidad: 1299, from: "GBP", valor: 1681.06, to: "USD" }), "1,299.00 GBP = 1,681.06 USD");
  ponerIdioma("es");
});

test("sin números o con una divisa rara, nada", () => {
  assert.equal(fraseParaCopiar({ cantidad: null, from: "EUR", valor: 1, to: "USD" }), "");
  assert.equal(fraseParaCopiar({ cantidad: 1, from: "EUR", valor: NaN, to: "USD" }), "");
  assert.equal(fraseParaCopiar({ cantidad: 1, from: "XXX", valor: 1, to: "USD" }), "");
});

test("Shift+C copia la frase; las demás letras con Shift siguen igual", () => {
  const tecla = (code, extra = {}) => ({ code, key: code.slice(-1).toLowerCase(), enCampo: false, ...extra });
  assert.equal(atajoPara(tecla("KeyC", { shiftKey: true })), "copiarFrase");
  assert.equal(atajoPara(tecla("KeyC")), "copiar");
  assert.equal(atajoPara(tecla("KeyC", { shiftKey: true, altKey: true, enCampo: true })), "copiarFrase");
  assert.equal(atajoPara(tecla("KeyC", { shiftKey: true, enCampo: true })), null);
  assert.equal(atajoPara(tecla("KeyS", { shiftKey: true })), "intercambiar");
});
