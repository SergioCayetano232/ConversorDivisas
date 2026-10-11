const { test } = require("node:test");
const assert = require("node:assert");
const { rachaPresupuesto } = require("../logica.js");

// Del 1 al 10 con 1.000: tocan 100 al día.
const presupuesto = { importe: 1000, to: "EUR", desde: "2026-10-01", hasta: "2026-10-10" };
const el = (dia, valor, to = "EUR") => ({ to, valor, cuando: new Date(`${dia}T12:00`).getTime() });

test("cuenta los días seguidos por debajo, desde ayer hacia atrás", () => {
  const gastos = [el("2026-10-01", 150), el("2026-10-02", 80), el("2026-10-03", 90), el("2026-10-04", 60)];
  const r = rachaPresupuesto(presupuesto, gastos, "2026-10-05");
  assert.equal(r.dias, 3);
  assert.equal(r.toca, 100);
  assert.equal(r.to, "EUR");
});

test("lo de hoy no cuenta, que el día aún no ha acabado", () => {
  const gastos = [el("2026-10-02", 50), el("2026-10-03", 50), el("2026-10-04", 900)];
  assert.equal(rachaPresupuesto(presupuesto, gastos, "2026-10-04").dias, 3);
});

test("un día sin gastos también es un día por debajo", () => {
  assert.equal(rachaPresupuesto(presupuesto, [el("2026-10-02", 40)], "2026-10-04").dias, 3);
});

test("justo lo que toca también vale", () => {
  const gastos = [el("2026-10-01", 100), el("2026-10-02", 60), el("2026-10-02", 40)];
  assert.equal(rachaPresupuesto(presupuesto, gastos, "2026-10-03").dias, 2);
});

test("con un día solo no es racha", () => {
  assert.equal(rachaPresupuesto(presupuesto, [el("2026-10-01", 300)], "2026-10-03"), null);
});

test("si ayer te pasaste, no hay racha", () => {
  const gastos = [el("2026-10-01", 10), el("2026-10-02", 10), el("2026-10-03", 101)];
  assert.equal(rachaPresupuesto(presupuesto, gastos, "2026-10-04"), null);
});

test("lo de otra divisa no cuenta", () => {
  const gastos = [el("2026-10-02", 5000, "JPY"), el("2026-10-03", 5000, "JPY")];
  assert.equal(rachaPresupuesto(presupuesto, gastos, "2026-10-04").dias, 3);
});

test("antes de salir no hay racha", () => {
  assert.equal(rachaPresupuesto(presupuesto, [], "2026-09-28"), null);
});

test("acabado el viaje, cuenta desde el último día", () => {
  const gastos = [el("2026-10-08", 50), el("2026-10-09", 50), el("2026-10-10", 50)];
  assert.equal(rachaPresupuesto(presupuesto, gastos, "2026-10-20").dias, 10);
});

test("sin día de salida, desde el primer gasto", () => {
  const { desde, ...sinSalida } = presupuesto;
  const gastos = [el("2026-10-03", 20), el("2026-10-04", 20)];
  assert.equal(rachaPresupuesto(sinSalida, gastos, "2026-10-05").dias, 2);
});

test("sin presupuesto, nada", () => {
  assert.equal(rachaPresupuesto(null, [], "2026-10-05"), null);
});
