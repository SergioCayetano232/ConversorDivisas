const { test } = require("node:test");
const assert = require("node:assert");
const { tituloHoy } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const gasto = (valor, dia, to = "EUR") => ({
  id: `${dia}-${valor}`, from: "JPY", to, cantidad: valor * 170, valor, concepto: "", categoria: "comida",
  cuando: new Date(2026, 9, dia, 13).getTime(),
});
const viaje = (gastos, presupuesto = null, nombre = "Japón") => ({ id: "v", nombre, gastos, presupuesto });

test("sin presupuesto, lo gastado hoy", () => {
  const v = viaje([gasto(30, 17), gasto(12, 17), gasto(80, 16)]);
  assert.equal(tituloHoy(v, "2026-10-17"), "Hoy llevas 42,00 EUR en Japón");
});

test("con presupuesto y de viaje, contra lo que toca hoy", () => {
  // 700 del 14 al 20: antes de hoy 300, quedan 400 para 4 días, 100 hoy.
  const p = { importe: 700, to: "EUR", desde: "2026-10-14", hasta: "2026-10-20" };
  const v = viaje([gasto(300, 15), gasto(42, 17)], p);
  assert.equal(tituloHoy(v, "2026-10-17"), "Hoy llevas 42,00 de 100,00 EUR en Japón");
});

test("de viaje sin gastar nada hoy, también lo dice", () => {
  const p = { importe: 700, to: "EUR", desde: "2026-10-14", hasta: "2026-10-20" };
  // Sin nada gastado, los 700 entre los 4 días que quedan.
  assert.equal(tituloHoy(viaje([], p), "2026-10-17"), "Hoy llevas 0,00 de 175,00 EUR en Japón");
});

test("sin nada hoy y sin estar de viaje, no sale", () => {
  assert.equal(tituloHoy(viaje([gasto(80, 16)]), "2026-10-17"), "");
  assert.equal(tituloHoy(viaje([]), "2026-10-17"), "");
  assert.equal(tituloHoy(null), "");
});

test("sin nombre, el de siempre", () => {
  assert.equal(tituloHoy(viaje([gasto(5, 17)], null, ""), "2026-10-17"), "Hoy llevas 5,00 EUR en Mi viaje");
});

test("en inglés", () => {
  ponerIdioma("en");
  try {
    assert.equal(tituloHoy(viaje([gasto(42, 17)], null, "Japan"), "2026-10-17"), "Today: 42.00 EUR on Japan");
  } finally {
    ponerIdioma("es");
  }
});
