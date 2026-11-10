const { test } = require("node:test");
const assert = require("node:assert");
const { esCaroBarra, resumenCaroBarra } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const gasto = (valor, dia, concepto = "", to = "EUR") => ({
  id: `${dia}-${valor}`, from: "JPY", to, cantidad: valor * 170, valor, concepto, categoria: "comida",
  cuando: new Date(2026, 9, dia, 13).getTime(),
});
const viaje = (gastos, nombre = "Japón") => ({ id: "v", nombre, gastos, presupuesto: null });

test("entiende caro, lo más caro y priciest, y nada más", () => {
  for (const t of ["caro", " Lo más caro ", "lo mas caro", "priciest", "most expensive"]) assert.equal(esCaroBarra(t), true, t);
  for (const t of ["caro 20", "barato", "", undefined]) assert.equal(esCaroBarra(t), false, String(t));
});

test("el más caro, con su día y lo que pesa en el viaje", () => {
  ponerIdioma("es");
  const r = resumenCaroBarra(viaje([gasto(30, 17, "Cena"), gasto(80, 15, "Hotel"), gasto(90, 16, "Tren")]), "2026-10-17");
  assert.equal(r.principal, "👑 Tren · 90,00 EUR (15.300,00 JPY)");
  assert.deepEqual(r.detalle, ["Ayer", "el 45 % del viaje"]);
});

test("de otro día, la fecha", () => {
  ponerIdioma("es");
  const r = resumenCaroBarra(viaje([gasto(80, 15, "Hotel"), gasto(20, 17)]), "2026-10-17");
  assert.deepEqual(r.detalle, ["15 oct", "el 80 % del viaje"]);
});

test("con uno solo, sin el tanto por ciento", () => {
  ponerIdioma("es");
  assert.deepEqual(resumenCaroBarra(viaje([gasto(12, 17, "Café")]), "2026-10-17").detalle, ["Hoy"]);
});

test("lo de otra divisa no se compara con el resto", () => {
  ponerIdioma("es");
  const r = resumenCaroBarra(viaje([gasto(30, 17, "Cena"), gasto(20, 16, "Taxi"), gasto(45, 16, "Tienda", "USD")]), "2026-10-17");
  assert.equal(r.principal, "👑 Cena · 30,00 EUR (5.100,00 JPY)");
  assert.deepEqual(r.detalle, ["Hoy", "el 60 % del viaje"]);
});

test("sin gastos, que aún no hay nada", () => {
  ponerIdioma("es");
  assert.deepEqual(resumenCaroBarra(viaje([])), { principal: "En Japón aún no has apuntado nada", detalle: [] });
  assert.equal(resumenCaroBarra(null), null);
});

test("en inglés", () => {
  ponerIdioma("en");
  const r = resumenCaroBarra(viaje([gasto(30, 17, "Dinner"), gasto(90, 16, "Train")]), "2026-10-17");
  assert.deepEqual(r.detalle, ["Yesterday", "75% of the trip"]);
  ponerIdioma("es");
});
