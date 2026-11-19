const { test } = require("node:test");
const assert = require("node:assert");
const { preguntarGastos, textoPregunta, buscarGastos, trozosResaltados } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const el = (dia, hora = 12) => {
  const [a, m, d] = dia.split("-").map(Number);
  return new Date(a, m - 1, d, hora).getTime();
};
const g = (id, concepto, valor, dia, extra = {}) => ({
  id, from: "JPY", to: "EUR", cantidad: valor * 160, valor, concepto, cuando: el(dia), categoria: "otros", pago: "tarjeta", comision: 0, ...extra,
});
const viaje = {
  tramos: [
    { id: "t", nombre: "Tokio", desde: "2026-11-10" },
    { id: "k", nombre: "Kioto", desde: "2026-11-15" },
    { id: "s", nombre: "Nara Park", desde: "2026-11-18" },
  ],
  gastos: [
    g("1", "Taxi", 12.5, "2026-11-19", { categoria: "transporte" }),
    g("2", "Cena", 40, "2026-11-19", { categoria: "comida", pago: "efectivo" }),
    g("3", "Taxi al hotel", 20, "2026-11-16", { categoria: "transporte" }),
    g("4", "Taxi", 7.5, "2026-11-15", { categoria: "transporte" }),
    g("5", "Hotel", 300, "2026-11-12", { categoria: "alojamiento" }),
    g("6", "Taxi", 9, "2026-11-11", { categoria: "transporte" }),
    g("7", "Ramen", 10, "2026-11-18", { categoria: "comida" }),
  ],
};
const HOY = "2026-11-19";
const total = (r) => r.totales.map((t) => [t.to, t.total]);

test("cuánto en taxis en Kioto: solo los de ese tramo, con el plural", () => {
  const r = preguntarGastos("¿Cuánto llevo en taxis en Kioto?", viaje, HOY);
  assert.equal(r.n, 2);
  assert.deepEqual(total(r), [["EUR", 27.5]]);
});

test("el último tramo llega hasta hoy, y los de nombre largo también valen", () => {
  const r = preguntarGastos("comida nara park", viaje, HOY);
  assert.equal(r.n, 2);
  assert.deepEqual(total(r), [["EUR", 50]]);
});

test("hoy y ayer", () => {
  assert.equal(preguntarGastos("hoy", viaje, HOY).n, 2);
  assert.equal(preguntarGastos("ayer", viaje, HOY).n, 1);
  assert.equal(preguntarGastos("taxi hoy", viaje, HOY).n, 1);
});

test("por cómo pagaste", () => {
  const r = preguntarGastos("cuánto en efectivo", viaje, HOY);
  assert.equal(r.n, 1);
  assert.deepEqual(total(r), [["EUR", 40]]);
});

test("por categoría aunque no la escribieras en el concepto, y con hoteles", () => {
  assert.equal(preguntarGastos("transporte", viaje, HOY).n, 4);
  assert.equal(preguntarGastos("hoteles", viaje, HOY).n, 2);
});

test("en inglés", () => {
  ponerIdioma("en");
  const r = preguntarGastos("how much did I spend on taxis in Kioto", viaje, HOY);
  assert.equal(r.n, 2);
  assert.equal(preguntarGastos("food today", viaje, HOY).n, 1);
  ponerIdioma("es");
});

test("sin nada por lo que filtrar no es una pregunta", () => {
  assert.equal(preguntarGastos("cuánto llevo", viaje, HOY), null);
  assert.equal(preguntarGastos("", viaje, HOY), null);
  assert.equal(preguntarGastos("taxi", { gastos: [] }, HOY), null);
  assert.equal(preguntarGastos("taxi", null, HOY), null);
});

test("lo que no está da cero", () => {
  assert.equal(preguntarGastos("museo", viaje, HOY).n, 0);
});

test("varias divisas, cada una con su total", () => {
  const mezcla = { gastos: [g("a", "Taxi", 10, HOY), { ...g("b", "Taxi", 8, HOY), to: "USD" }] };
  assert.deepEqual(total(preguntarGastos("taxi", mezcla, HOY)), [["EUR", 10], ["USD", 8]]);
});

test("el texto", () => {
  ponerIdioma("es");
  assert.equal(textoPregunta({ n: 2, totales: [{ to: "EUR", total: 27.5 }] }), "2 gastos: 27,50 EUR");
  assert.equal(textoPregunta({ n: 1, totales: [{ to: "EUR", total: 40 }] }), "1 gasto: 40,00 EUR");
  assert.equal(textoPregunta({ n: 0, totales: [] }), "Ningún gasto así");
});

test("la lupa también entiende el plural, y marca lo que hay", () => {
  assert.equal(buscarGastos(viaje.gastos, "taxis").length, 4);
  assert.deepEqual(trozosResaltados("Taxi al hotel", "taxis"), [{ texto: "Taxi", resaltado: true }, { texto: " al hotel", resaltado: false }]);
  assert.deepEqual(trozosResaltados("Hotel", "hoteles"), [{ texto: "Hotel", resaltado: true }]);
});
