const { test } = require("node:test");
const assert = require("node:assert");
const { leerPegado } = require("../logica.js");

const par = { from: "EUR", to: "USD" };

test("un precio con su divisa cambia el origen", () => {
  assert.deepEqual(leerPegado("1.299,00 £", "amount", par), { cantidad: 1299, from: "GBP", to: "USD" });
  assert.deepEqual(leerPegado("  R$ 10,50 ", "amount", par), { cantidad: 10.5, from: "BRL", to: "USD" });
  assert.deepEqual(leerPegado("20 euros", "amount", par), { cantidad: 20, from: "EUR", to: "USD" });
});

test("si es la divisa de abajo, le da la vuelta al par", () => {
  assert.deepEqual(leerPegado("$1,049.99", "amount", par), { cantidad: 1049.99, from: "USD", to: "EUR" });
});

test("abajo cambia el destino", () => {
  assert.deepEqual(leerPegado("¥ 5,000", "result", par), { cantidad: 5000, from: "EUR", to: "JPY" });
  assert.deepEqual(leerPegado("49,99 €", "result", par), { cantidad: 49.99, from: "USD", to: "EUR" });
  assert.deepEqual(leerPegado("USD 35", "result", par), { cantidad: 35, from: "EUR", to: "USD" });
});

test("sin divisa, una cuenta o con más texto, se pega como siempre", () => {
  assert.equal(leerPegado("49,99", "amount", par), null);
  assert.equal(leerPegado("20+15", "amount", par), null);
  assert.equal(leerPegado("Precio: 49,99 €", "amount", par), null);
  assert.equal(leerPegado("10 € y 5 €", "amount", par), null);
  assert.equal(leerPegado("", "amount", par), null);
});
