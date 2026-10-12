const { test } = require("node:test");
const assert = require("node:assert");
const { loDeHoy } = require("../logica.js");

// Del 1 al 10 con 1.000: al empezar, 100 al día.
const presupuesto = { importe: 1000, to: "EUR", desde: "2026-10-01", hasta: "2026-10-10" };
const el = (dia, valor, to = "EUR") => ({ to, valor, cuando: new Date(`${dia}T12:00`).getTime() });

test("lo de hoy contra lo que quedaba al empezar el día", () => {
  // Llevas 400 en cuatro días: quedan 600 para 6 días, 100 hoy.
  const gastos = [el("2026-10-02", 400), el("2026-10-05", 45)];
  const r = loDeHoy(presupuesto, gastos, "2026-10-05");
  assert.equal(r.gastado, 45);
  assert.equal(r.toca, 100);
  assert.equal(r.tono, "bien");
});

test("lo que apuntas hoy no baja la meta de hoy", () => {
  const antes = el("2026-10-02", 400);
  const una = loDeHoy(presupuesto, [antes, el("2026-10-05", 10)], "2026-10-05");
  const otra = loDeHoy(presupuesto, [antes, el("2026-10-05", 90)], "2026-10-05");
  assert.equal(una.toca, otra.toca);
  assert.equal(otra.tono, "justo");
});

test("pasado de lo de hoy, y sin nada que tocar", () => {
  assert.equal(loDeHoy(presupuesto, [el("2026-10-03", 900), el("2026-10-10", 150)], "2026-10-10").tono, "pasado");
  const sinNada = loDeHoy(presupuesto, [el("2026-10-02", 1200), el("2026-10-05", 5)], "2026-10-05");
  assert.equal(sinNada.toca, 0);
  assert.equal(sinNada.fraccion, Infinity);
  assert.equal(sinNada.tono, "pasado");
});

test("los de otra divisa no cuentan", () => {
  assert.equal(loDeHoy(presupuesto, [el("2026-10-05", 30), el("2026-10-05", 5000, "JPY")], "2026-10-05").gastado, 30);
});

test("antes de salir, acabado o sin presupuesto, no hay", () => {
  assert.equal(loDeHoy(presupuesto, [], "2026-09-30"), null);
  assert.equal(loDeHoy(presupuesto, [], "2026-10-11"), null);
  assert.equal(loDeHoy(null, [], "2026-10-05"), null);
});
