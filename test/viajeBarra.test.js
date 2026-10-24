const { test } = require("node:test");
const assert = require("node:assert");
const { esViajeBarra, resumenViajeBarra } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const gasto = (valor, dia) => ({
  id: `${dia}-${valor}`, from: "JPY", to: "EUR", cantidad: valor * 170, valor, concepto: "", categoria: "comida",
  cuando: new Date(2026, 9, dia, 13).getTime(),
});
const viaje = (gastos, presupuesto = null, nombre = "Japón") => ({ id: "v", nombre, gastos, presupuesto });
const p = { importe: 700, to: "EUR", desde: "2026-10-14", hasta: "2026-10-20" };

test("entiende viaje, trip y total, y nada más", () => {
  assert.equal(esViajeBarra("viaje"), true);
  assert.equal(esViajeBarra(" Trip "), true);
  assert.equal(esViajeBarra("total"), true);
  assert.equal(esViajeBarra("viaje 20"), false);
  assert.equal(esViajeBarra("mes"), false);
});

test("el total, los gastos y la media al día", () => {
  // Del 15 al 17 son tres días: 120 entre tres.
  const r = resumenViajeBarra(viaje([gasto(30, 17), gasto(10, 17), gasto(80, 15)]), "2026-10-17");
  assert.equal(r.principal, "Japón: 120,00 EUR en 3 días");
  assert.deepEqual(r.detalle, ["3 gastos", "40,00 al día"]);
});

test("con un solo día, sin media", () => {
  const r = resumenViajeBarra(viaje([gasto(12, 17)]), "2026-10-17");
  assert.equal(r.principal, "Japón: 12,00 EUR en 1 día");
  assert.deepEqual(r.detalle, ["1 gasto"]);
});

test("con presupuesto, lo que queda o lo que te has pasado", () => {
  assert.equal(resumenViajeBarra(viaje([gasto(42, 17), gasto(300, 15)], p), "2026-10-17").detalle[2], "Te quedan 358,00 EUR");
  assert.equal(resumenViajeBarra(viaje([gasto(750, 15)], p), "2026-10-17").detalle[1], "Te has pasado 50,00 EUR");
});

test("sin gastos, o sin viaje", () => {
  assert.deepEqual(resumenViajeBarra(viaje([]), "2026-10-17"), { principal: "En Japón aún no has apuntado nada", detalle: [] });
  assert.equal(resumenViajeBarra(null), null);
});

test("en inglés", () => {
  ponerIdioma("en");
  try {
    const r = resumenViajeBarra(viaje([gasto(30, 17), gasto(10, 17), gasto(80, 15)]), "2026-10-17");
    assert.equal(r.principal, "Japón: 120.00 EUR in 3 days");
    assert.deepEqual(r.detalle, ["3 expenses", "40.00 a day"]);
  } finally {
    ponerIdioma("es");
  }
});
