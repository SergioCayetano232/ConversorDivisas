const { test } = require("node:test");
const assert = require("node:assert");
const { presupuestoEnTarjeta, textoPresupuestoTarjeta, crearPendiente } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const presupuesto = { importe: 500, to: "EUR", hasta: "2026-10-10" };
const viaje = (gastado, extra = {}) => ({ presupuesto, gastos: [{ to: "EUR", valor: gastado }], pendientes: [], ...extra });
const gasto = (valor, to = "EUR") => ({ valor, to });

test("qué parte de lo que te queda se lleva", () => {
  // Quedan 300 para 6 días contando hoy: 50 al día.
  const r = presupuestoEnTarjeta(viaje(200), gasto(60), "2026-10-05");
  assert.equal(r.fraccion, 0.2);
  assert.equal(r.dias, 1.2);
  assert.equal(r.tono, "bien");
  assert.equal(r.desde, 0.4);
  assert.equal(r.trozo, 0.12);
});

test("en justo si con esto pasas del 80 %", () => {
  assert.equal(presupuestoEnTarjeta(viaje(350), gasto(60), "2026-10-05").tono, "justo");
});

test("si te pasas, en cuánto", () => {
  const r = presupuestoEnTarjeta(viaje(450), gasto(80), "2026-10-05");
  assert.equal(r.tono, "pasado");
  assert.equal(r.exceso, 30);
  assert.equal(r.yaPasado, false);
});

test("si ya ibas pasado lo dice así", () => {
  assert.equal(presupuestoEnTarjeta(viaje(520), gasto(10), "2026-10-05").yaPasado, true);
});

test("sin presupuesto, en otra divisa, viaje acabado o una miseria, nada", () => {
  assert.equal(presupuestoEnTarjeta(null, gasto(10)), null);
  assert.equal(presupuestoEnTarjeta({ gastos: [] }, gasto(10)), null);
  assert.equal(presupuestoEnTarjeta(viaje(200), gasto(10, "USD"), "2026-10-05"), null);
  assert.equal(presupuestoEnTarjeta(viaje(200), gasto(60), "2026-10-11"), null);
  assert.equal(presupuestoEnTarjeta(viaje(200), gasto(2), "2026-10-05"), null);
  assert.equal(presupuestoEnTarjeta(viaje(200), null, "2026-10-05"), null);
});

test("lo pendiente cuenta para los días, no para lo que queda", () => {
  // 300 de margen, 120 comprometidos: 180 libres en 6 días, 30 al día.
  const r = presupuestoEnTarjeta(viaje(200, { pendientes: [crearPendiente({ id: "hotel", from: "USD", to: "EUR", cantidad: 130, valor: 120, concepto: "Hotel", cuando: Date.UTC(2026, 9, 1) })] }), gasto(60), "2026-10-05");
  assert.equal(r.fraccion, 0.2);
  assert.equal(r.dias, 2);
});

test("antes de salir también sale, que es cuando reservas", () => {
  const p = { importe: 1000, to: "EUR", desde: "2026-11-01", hasta: "2026-11-10" };
  const r = presupuestoEnTarjeta({ presupuesto: p, gastos: [], pendientes: [] }, gasto(250), "2026-10-05");
  assert.equal(r.fraccion, 0.25);
});

test("el texto en los dos idiomas", () => {
  ponerIdioma("es");
  const r = presupuestoEnTarjeta(viaje(200), gasto(60), "2026-10-05");
  assert.equal(textoPresupuestoTarjeta(r), "Se lleva el 20 % de lo que te queda\u00a0· ≈\u00a01,2\u00a0días");
  assert.equal(textoPresupuestoTarjeta(presupuestoEnTarjeta(viaje(450), gasto(80), "2026-10-05")), "Con esto te pasas del presupuesto en 30,00 EUR");
  assert.equal(textoPresupuestoTarjeta(presupuestoEnTarjeta(viaje(520), gasto(10), "2026-10-05")), "Ya vas pasado del presupuesto del viaje");
  assert.equal(textoPresupuestoTarjeta(null), "");
  ponerIdioma("en");
  assert.equal(textoPresupuestoTarjeta(r), "Takes 20% of what you have left\u00a0· ≈\u00a01.2\u00a0days");
  ponerIdioma("es");
});
