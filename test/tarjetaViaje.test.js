const { test } = require("node:test");
const assert = require("node:assert");
const { datosTarjeta, crearGasto } = require("../logica.js");

const dia = (d) => new Date(2026, 10, d, 12).getTime();
const gasto = (id, valor, d, extra = {}) => crearGasto({
  id, from: "JPY", to: "EUR", cantidad: valor * 160, valor, concepto: id, cuando: dia(d), categoria: "comida", comision: 0, ...extra,
});
const viaje = (extra = {}) => ({
  id: "j", nombre: "Japón", color: "coral", personas: 1, presupuesto: null,
  gastos: [gasto("Café", 12, 4), gasto("Cena", 60, 3), gasto("Taxi", 30, 2, { categoria: "transporte" }), gasto("Vuelo", 900, 1, { categoria: "transporte", fijo: true })],
  ...extra,
});

test("lo principal del viaje", () => {
  const t = datosTarjeta(viaje(), "2026-11-10");
  assert.equal(t.nombre, "Japón");
  assert.equal(t.color, "coral");
  assert.deepEqual(t.total, { to: "EUR", total: 1002 });
  assert.equal(t.n, 4);
  // Del 2 al 4: el vuelo pagado aparte no estira el viaje.
  assert.equal(t.desde, "2026-11-02");
  assert.equal(t.hasta, "2026-11-04");
  assert.equal(t.dias, 3);
  assert.equal(t.media.valor, 34);
  assert.equal(t.caro.concepto, "Cena");
  assert.equal(t.diaMas.dia, "2026-11-03");
  assert.equal(t.categorias[0].categoria, "transporte");
  assert.equal(t.presupuesto, null);
});

test("con presupuesto, sus fechas y lo que sobró", () => {
  const t = datosTarjeta(viaje({ presupuesto: { importe: 1500, to: "EUR", desde: "2026-11-01", hasta: "2026-11-07" } }), "2026-11-10");
  assert.equal(t.dias, 7);
  assert.deepEqual(t.presupuesto, { importe: 1500, to: "EUR", queda: 498 });
});

test("sin gastos no hay tarjeta", () => {
  assert.equal(datosTarjeta(viaje({ gastos: [] })), null);
  assert.equal(datosTarjeta(null), null);
});

test("sin nombre, el de siempre, y la comisión si la hubo", () => {
  const t = datosTarjeta(viaje({ nombre: "", gastos: [gasto("a", 101, 2, { comision: 1 }), gasto("b", 50, 3)] }), "2026-11-10");
  assert.ok(t.nombre.length > 0);
  assert.equal(Math.round(t.comisiones.total * 100), 100);
});
