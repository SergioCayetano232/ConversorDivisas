const { test } = require("node:test");
const assert = require("node:assert");
const { conversionParaCopiar } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const fila = { cantidad: 38.9, from: "EUR", resultado: 42.79, to: "USD", cuando: 1000 };

test("sin nada pulsado, la cifra a secas", () => {
  assert.equal(conversionParaCopiar(fila), "42,79");
});

test("con Shift, la frase; con Alt, el símbolo", () => {
  assert.equal(conversionParaCopiar(fila, { entera: true }), "38,90 EUR = 42,79 USD");
  assert.equal(conversionParaCopiar(fila, { conSimbolo: true }), "42,79\u00a0$");
  assert.equal(conversionParaCopiar(fila, { entera: true, conSimbolo: true }), "38,90\u00a0€ = 42,79\u00a0$");
});

test("una fila rota no copia nada", () => {
  assert.equal(conversionParaCopiar({ ...fila, resultado: null }, { entera: true }), "");
  assert.equal(conversionParaCopiar({ ...fila, from: "XXX" }, { entera: true }), "");
});

test("en inglés, a la inglesa", () => {
  ponerIdioma("en");
  try {
    assert.equal(conversionParaCopiar(fila, { entera: true }), "38.90 EUR = 42.79 USD");
    assert.equal(conversionParaCopiar(fila, { conSimbolo: true }), "$42.79");
  } finally {
    ponerIdioma("es");
  }
});
