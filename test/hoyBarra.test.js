const { test } = require("node:test");
const assert = require("node:assert");
const { esHoyBarra, resumenHoyBarra } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const gasto = (valor, dia, to = "EUR") => ({
  id: `${dia}-${valor}`, from: "JPY", to, cantidad: valor * 170, valor, concepto: "", categoria: "comida",
  cuando: new Date(2026, 9, dia, 13).getTime(),
});
const viaje = (gastos, presupuesto = null, nombre = "Japón") => ({ id: "v", nombre, gastos, presupuesto });
const p = { importe: 700, to: "EUR", desde: "2026-10-14", hasta: "2026-10-20" };

test("entiende hoy y today, nada más", () => {
  assert.equal(esHoyBarra("hoy"), true);
  assert.equal(esHoyBarra("  Hoy "), true);
  assert.equal(esHoyBarra("today"), true);
  assert.equal(esHoyBarra("hoy 20"), false);
  assert.equal(esHoyBarra("20 usd"), false);
  assert.equal(esHoyBarra(""), false);
});

test("sin presupuesto, lo de hoy y el total del viaje", () => {
  const r = resumenHoyBarra(viaje([gasto(30, 17), gasto(12, 17), gasto(80, 16)]), "2026-10-17");
  assert.equal(r.principal, "Hoy: 42,00 EUR");
  assert.deepEqual(r.detalle, ["Japón: 122,00 EUR"]);
});

test("con presupuesto, contra lo que toca y lo que queda", () => {
  // Antes de hoy 300: quedan 400 para 4 días, 100 hoy.
  const r = resumenHoyBarra(viaje([gasto(300, 15), gasto(42, 17)], p), "2026-10-17");
  assert.equal(r.principal, "Hoy: 42,00 de 100,00 EUR");
  assert.deepEqual(r.detalle, ["Japón: 342,00 EUR", "Te quedan 358,00 EUR"]);
});

test("pasado del presupuesto, lo dice", () => {
  const r = resumenHoyBarra(viaje([gasto(750, 15)], p), "2026-10-17");
  assert.equal(r.detalle[1], "Te has pasado 50,00 EUR");
});

test("sin nada hoy ni en el viaje", () => {
  const r = resumenHoyBarra(viaje([]), "2026-10-17");
  assert.equal(r.principal, "Hoy aún no has apuntado nada");
  assert.deepEqual(r.detalle, []);
  assert.equal(resumenHoyBarra(null), null);
});

test("en inglés", () => {
  ponerIdioma("en");
  try {
    const r = resumenHoyBarra(viaje([gasto(42, 17)], null, "Japan"), "2026-10-17");
    assert.equal(r.principal, "Today: 42.00 EUR");
    assert.deepEqual(r.detalle, ["Japan: 42.00 EUR"]);
  } finally {
    ponerIdioma("es");
  }
});
