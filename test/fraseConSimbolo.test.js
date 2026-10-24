const { test } = require("node:test");
const assert = require("node:assert");
const { fraseConSimbolo } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("la frase con el símbolo de cada lado", () => {
  assert.equal(fraseConSimbolo({ cantidad: 38.9, from: "EUR", valor: 42.79, to: "USD" }), "38,90 € = 42,79 $");
  assert.equal(fraseConSimbolo({ cantidad: 100, from: "EUR", valor: 2003.4, to: "MXN" }), "100,00 € = 2.003,40 MX$");
});

test("sin cantidad o sin divisa, nada", () => {
  assert.equal(fraseConSimbolo({ cantidad: null, from: "EUR", valor: 42.79, to: "USD" }), "");
  assert.equal(fraseConSimbolo({ cantidad: 38.9, from: "EUR", valor: 42.79, to: "XXX" }), "");
});

test("en inglés, el símbolo delante", () => {
  ponerIdioma("en");
  try {
    assert.equal(fraseConSimbolo({ cantidad: 38.9, from: "EUR", valor: 42.79, to: "USD" }), "€38.90 = $42.79");
  } finally {
    ponerIdioma("es");
  }
});
