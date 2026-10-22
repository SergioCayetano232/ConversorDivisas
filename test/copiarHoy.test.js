const { test, afterEach } = require("node:test");
const assert = require("node:assert");
const { hoyParaCopiar } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

afterEach(() => ponerIdioma("es"));

const hoy = "2026-10-07";
const el = (dia, valor, to = "EUR") => ({ id: dia + valor + to, from: "JPY", to, cantidad: valor * 160, valor, concepto: "", categoria: "comida", cuando: new Date(2026, 9, dia, 13).getTime() });

test("lo de hoy, con el nombre y cuántos gastos", () => {
  assert.equal(hoyParaCopiar({ nombre: "Japón", gastos: [el(7, 12.5), el(7, 29.5), el(6, 100)] }, hoy), "Japón, hoy: 42,00 EUR en 2 gastos");
});

test("uno solo, en singular; y sin nombre, el de siempre", () => {
  assert.equal(hoyParaCopiar({ nombre: "", gastos: [el(7, 8)] }, hoy), "Mi viaje, hoy: 8,00 EUR en 1 gasto");
});

test("lo de otra divisa no cuenta, como en cd hoy", () => {
  assert.equal(hoyParaCopiar({ nombre: "Japón", gastos: [el(6, 50), el(7, 10), el(7, 5, "USD")] }, hoy), "Japón, hoy: 10,00 EUR en 1 gasto");
});

test("si hoy no hay nada, o no hay viaje, nada que copiar", () => {
  assert.equal(hoyParaCopiar({ nombre: "Japón", gastos: [el(6, 20)] }, hoy), "");
  assert.equal(hoyParaCopiar({ nombre: "Japón", gastos: [] }, hoy), "");
  assert.equal(hoyParaCopiar(undefined, hoy), "");
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(hoyParaCopiar({ nombre: "Japan", gastos: [el(7, 1234.5), el(7, 1)] }, hoy), "Japan, today: 1,235.50 EUR in 2 expenses");
});
