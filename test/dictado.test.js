const { test } = require("node:test");
const assert = require("node:assert");
const { leerDictado } = require("../logica.js");

const japon = { from: "JPY", to: "EUR" };
const dicho = (texto, par = japon) => {
  const r = leerDictado(texto, par);
  return r && [r.cantidad, r.from, r.concepto, r.pago];
};

test("la cantidad va donde caiga: delante o detrás del concepto", () => {
  assert.deepEqual(dicho("cena 45"), [45, "JPY", "Cena", null]);
  assert.deepEqual(dicho("45 cena"), [45, "JPY", "Cena", null]);
  assert.deepEqual(dicho("taxi 12,50"), [12.5, "JPY", "Taxi", null]);
});

test("los números dichos con palabras", () => {
  assert.deepEqual(dicho("cena cuarenta y cinco"), [45, "JPY", "Cena", null]);
  assert.deepEqual(dicho("dos mil yenes ramen"), [2000, "JPY", "Ramen", null]);
  assert.deepEqual(dicho("ciento veinte de hotel"), [120, "JPY", "Hotel", null]);
  assert.deepEqual(dicho("three hundred and fifty dinner"), [350, "JPY", "Dinner", null]);
  assert.deepEqual(dicho("un millón de cosas"), [1000000, "JPY", "Cosas", null]);
});

test("un café no es un yen", () => {
  assert.deepEqual(dicho("un café 3"), [3, "JPY", "Café", null]);
  assert.equal(dicho("un café"), null, "sin cantidad no hay gasto");
});

test("los decimales: con, y medio", () => {
  assert.deepEqual(dicho("doce con cincuenta de taxi"), [12.5, "JPY", "Taxi", null]);
  assert.deepEqual(dicho("café cuatro y medio"), [4.5, "JPY", "Café", null]);
  assert.deepEqual(dicho("doce con cinco"), [12.05, "JPY", "", null], "con cinco son cinco céntimos");
});

test("el relleno de los bordes fuera: de, la, en", () => {
  assert.deepEqual(dicho("2000 yenes de ramen"), [2000, "JPY", "Ramen", null]);
  assert.deepEqual(dicho("5 de la cena"), [5, "JPY", "Cena", null]);
  assert.deepEqual(dicho("café con leche 3"), [3, "JPY", "Café con leche", null], "el con de dentro se queda");
});

test("cómo pagaste, con su en o su con", () => {
  assert.deepEqual(dicho("500 de metro en efectivo"), [500, "JPY", "Metro", "efectivo"]);
  assert.deepEqual(dicho("cena 20 con tarjeta"), [20, "JPY", "Cena", "tarjeta"]);
});

test("la divisa dicha, y la de allí si el nombre es de varias", () => {
  assert.deepEqual(dicho("dinner 45 dollars"), [45, "USD", "Dinner", null]);
  assert.deepEqual(dicho("taxi 30 francos suizos"), [30, "CHF", "Taxi", null]);
  assert.deepEqual(dicho("cena 30 mil pesos", { from: "COP", to: "EUR" }), [30000, "COP", "Cena", null]);
  assert.deepEqual(dicho("taxi 200 coronas", { from: "CZK", to: "EUR" }), [200, "CZK", "Taxi", null]);
  assert.deepEqual(dicho("taxi 200 coronas checas"), [200, "CZK", "Taxi", null]);
});

test("en tu divisa: lo que costó en euros, para pasarlo abajo", () => {
  const r = leerDictado("12 euros con 50 la cena", japon);
  assert.deepEqual([r.cantidad, r.from, r.concepto], [12.5, "EUR", "Cena"]);
});

test("una palabra que empieza como una divisa no es la divisa", () => {
  assert.deepEqual(dicho("10 libros"), [10, "JPY", "Libros", null]);
});

test("sin número o sin nada, nada", () => {
  assert.equal(dicho("la cena"), null);
  assert.equal(dicho(""), null);
  assert.equal(dicho("   "), null);
  assert.equal(leerDictado(undefined, japon), null);
});
