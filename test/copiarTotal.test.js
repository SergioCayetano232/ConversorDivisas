const { test, afterEach } = require("node:test");
const assert = require("node:assert");
const { totalParaCopiar } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

afterEach(() => ponerIdioma("es"));

const el = (dia, valor, to = "EUR") => ({ id: dia + valor, from: "JPY", to, cantidad: valor * 160, valor, concepto: "", categoria: "comida", cuando: new Date(2026, 9, dia, 13).getTime() });

test("el total con el nombre y los días, del primero al último", () => {
  assert.equal(totalParaCopiar({ nombre: "Japón", gastos: [el(7, 12.5), el(5, 27.96)] }), "Japón: 40,46 EUR en 3 días");
});

test("un día solo, en singular; y sin nombre, el de siempre", () => {
  assert.equal(totalParaCopiar({ nombre: "", gastos: [el(5, 10), el(5, 2)] }), "Mi viaje: 12,00 EUR en 1 día");
});

test("con dos divisas, las dos, de la que más a la que menos", () => {
  assert.equal(totalParaCopiar({ nombre: "Japón", gastos: [el(6, 20), el(5, 5, "USD")] }), "Japón: 20,00 EUR + 5,00 USD en 2 días");
});

test("sin gastos no hay nada que copiar", () => {
  assert.equal(totalParaCopiar({ nombre: "Japón", gastos: [] }), "");
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(totalParaCopiar({ nombre: "Japan", gastos: [el(5, 1234.5)] }), "Japan: 1,234.50 EUR in 1 day");
});
