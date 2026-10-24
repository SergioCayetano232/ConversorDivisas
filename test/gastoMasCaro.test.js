const { test } = require("node:test");
const assert = require("node:assert");
const { gastoMasCaro, gastoParaCopiar } = require("../logica.js");

const g = (id, valor, to = "EUR", cuando = 1) => ({ id, from: "JPY", to, cantidad: valor * 170, valor, concepto: id, categoria: "comida", cuando });

test("el más caro del viaje", () => {
  assert.equal(gastoMasCaro([g("café", 3.2), g("hotel", 120), g("cena", 27.6)]).id, "hotel");
});

test("lo que va en otra divisa no cuenta, aunque la cifra sea más alta", () => {
  assert.equal(gastoMasCaro([g("cena", 27.6), g("taxi", 50, "USD"), g("hotel", 40)]).id, "hotel");
});

test("si empatan, el más reciente", () => {
  assert.equal(gastoMasCaro([g("lunes", 50, "EUR", 1), g("martes", 50, "EUR", 2)]).id, "martes");
});

test("sin gastos, nada", () => {
  assert.equal(gastoMasCaro([]), null);
});

test("se copia como el último", () => {
  assert.equal(gastoParaCopiar(gastoMasCaro([g("Cena", 27.6), g("Café", 3.2)])), "Cena · 27,60 EUR (4.692,00 JPY)");
});
