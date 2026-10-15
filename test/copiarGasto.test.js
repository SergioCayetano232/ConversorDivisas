const { test } = require("node:test");
const assert = require("node:assert");
const { gastoParaCopiar } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const gasto = { id: "a", from: "JPY", to: "EUR", cantidad: 4500, valor: 27.6, concepto: "Cena", categoria: "comida", pago: "tarjeta", cuando: 0 };

test("un gasto se copia con lo que vale y lo que pagaste", () => {
  ponerIdioma("es");
  assert.equal(gastoParaCopiar(gasto), "Cena · 27,60 EUR (4.500,00 JPY)");
});

test("sin concepto va la categoría", () => {
  ponerIdioma("es");
  assert.equal(gastoParaCopiar({ ...gasto, concepto: "" }), "Comida · 27,60 EUR (4.500,00 JPY)");
});

test("en la misma divisa no se repite la cifra", () => {
  ponerIdioma("es");
  assert.equal(gastoParaCopiar({ ...gasto, from: "EUR", cantidad: 27.6 }), "Cena · 27,60 EUR");
});

test("en inglés, con los números a la inglesa", () => {
  ponerIdioma("en");
  assert.equal(gastoParaCopiar({ ...gasto, concepto: "" }), "Food · 27.60 EUR (4,500.00 JPY)");
  ponerIdioma("es");
});
