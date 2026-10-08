const { test } = require("node:test");
const assert = require("node:assert");
const { ordenarPorImporte, pesoDeLosGastos } = require("../logica.js");

const gasto = (id, valor, cuando = 1, to = "EUR") => ({ id, from: "JPY", to, cantidad: valor * 175, valor, concepto: id, cuando, categoria: "otros" });
const ids = (lista) => lista.map((g) => g.id);

test("del más caro al más barato", () => {
  const lista = [gasto("cafe", 4.5, 3), gasto("hotel", 300, 2), gasto("cena", 42, 1)];
  assert.deepEqual(ids(ordenarPorImporte(lista)), ["hotel", "cena", "cafe"]);
});

test("no toca la lista de antes, que es la de los días", () => {
  const lista = [gasto("cafe", 4.5), gasto("hotel", 300)];
  ordenarPorImporte(lista);
  assert.deepEqual(ids(lista), ["cafe", "hotel"]);
});

test("a igual importe, el más reciente primero", () => {
  const lista = [gasto("metro1", 2, 1), gasto("metro2", 2, 5), gasto("metro3", 2, 3)];
  assert.deepEqual(ids(ordenarPorImporte(lista)), ["metro2", "metro3", "metro1"]);
});

test("los de otra divisa van detrás, ordenados entre ellos", () => {
  const lista = [gasto("a", 10), gasto("usd1", 50, 1, "USD"), gasto("b", 80), gasto("usd2", 20, 1, "USD")];
  assert.deepEqual(ids(ordenarPorImporte(lista)), ["b", "a", "usd1", "usd2"]);
});

test("sin gastos, nada", () => {
  assert.deepEqual(ordenarPorImporte([]), []);
});

test("el peso de cada uno al lado del más caro de su divisa", () => {
  const lista = [gasto("hotel", 300), gasto("cena", 30), gasto("usd", 50, 1, "USD")];
  assert.deepEqual(pesoDeLosGastos(lista), [1, 0.1, 1]);
});

test("con todo a cero no divide por cero", () => {
  assert.deepEqual(pesoDeLosGastos([gasto("x", 0)]), [0]);
});
