const { test } = require("node:test");
const assert = require("node:assert");
const { extrasParaCompartir } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const filas = [{ code: "USD", valor: 56.04 }, { code: "GBP", valor: 43.15 }, { code: "JPY", valor: 9030.06 }];

test("la cantidad arriba y cada divisa con su bandera", () => {
  ponerIdioma("es");
  assert.equal(extrasParaCompartir(50, "EUR", filas), [
    "*💱 50,00 EUR son*",
    "🇺🇸 56,04 USD",
    "🇬🇧 43,15 GBP",
    "🇯🇵 9.030,06 JPY",
  ].join("\n"));
});

test("con comisión lo dice debajo, en cursiva", () => {
  ponerIdioma("es");
  const texto = extrasParaCompartir(50, "EUR", filas, 2);
  assert.match(texto.split("\n").at(-1), /^_Con la comisión del 2\s% de la tarjeta_$/);
});

test("en inglés, con los números a la inglesa", () => {
  ponerIdioma("en");
  assert.equal(extrasParaCompartir(50, "EUR", filas).split("\n").slice(0, 2).join("\n"), "*💱 50.00 EUR is*\n🇺🇸 56.04 USD");
  ponerIdioma("es");
});

test("sin cantidad, sin divisas o con alguna sin tasa, nada", () => {
  assert.equal(extrasParaCompartir(null, "EUR", filas), "");
  assert.equal(extrasParaCompartir(0, "EUR", filas), "");
  assert.equal(extrasParaCompartir(50, "EUR", []), "");
  assert.equal(extrasParaCompartir(50, "EUR", [{ code: "USD", valor: null }]), "");
});
