const { test } = require("node:test");
const assert = require("node:assert");
const { esAyerBarra, resumenAyerBarra } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const gasto = (valor, dia, concepto = "", mes = 9) => ({
  id: `${dia}-${valor}`, from: "JPY", to: "EUR", cantidad: valor * 170, valor, concepto, categoria: "comida",
  cuando: new Date(2026, mes, dia, 13).getTime(),
});
const viaje = (gastos) => ({ id: "v", nombre: "Japón", gastos, presupuesto: null });

test("entiende ayer y yesterday, y nada más", () => {
  assert.equal(esAyerBarra("ayer"), true);
  assert.equal(esAyerBarra("  Ayer "), true);
  assert.equal(esAyerBarra("yesterday"), true);
  assert.equal(esAyerBarra("ayer 20"), false);
  assert.equal(esAyerBarra("hoy"), false);
  assert.equal(esAyerBarra(""), false);
});

test("lo de ayer, con lo más caro", () => {
  const r = resumenAyerBarra(viaje([gasto(12, 16, "Café"), gasto(27.6, 16, "Cena"), gasto(80, 17), gasto(50, 15)]), "2026-10-17");
  assert.equal(r.principal, "Ayer: 39,60 EUR en 2 gastos");
  assert.deepEqual(r.detalle, ["Lo más caro: Cena 27,60"]);
});

test("con uno solo, sin lo más caro", () => {
  const r = resumenAyerBarra(viaje([gasto(12, 16, "Café")]), "2026-10-17");
  assert.equal(r.principal, "Ayer: 12,00 EUR en 1 gasto");
  assert.deepEqual(r.detalle, []);
});

test("el lo más caro sin concepto", () => {
  const r = resumenAyerBarra(viaje([gasto(5, 16, "Café"), gasto(20, 16)]), "2026-10-17");
  assert.deepEqual(r.detalle, ["Lo más caro: sin concepto 20,00"]);
});

test("el día 1, ayer es el último del mes anterior", () => {
  const r = resumenAyerBarra(viaje([gasto(10, 30, "Taxi", 8)]), "2026-10-01");
  assert.equal(r.principal, "Ayer: 10,00 EUR en 1 gasto");
});

test("sin nada ayer, o sin viaje", () => {
  assert.equal(resumenAyerBarra(viaje([gasto(42, 17)]), "2026-10-17").principal, "Ayer no apuntaste nada");
  assert.equal(resumenAyerBarra(viaje([]), "2026-10-17").principal, "Ayer no apuntaste nada");
  assert.equal(resumenAyerBarra(null), null);
});

test("en inglés", () => {
  ponerIdioma("en");
  try {
    const r = resumenAyerBarra(viaje([gasto(12, 16, "Coffee"), gasto(27.6, 16, "Dinner")]), "2026-10-17");
    assert.equal(r.principal, "Yesterday: 39.60 EUR in 2 expenses");
    assert.deepEqual(r.detalle, ["Priciest: Dinner 27.60"]);
  } finally {
    ponerIdioma("es");
  }
});
