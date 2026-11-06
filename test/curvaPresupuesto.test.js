const { test } = require("node:test");
const assert = require("node:assert");
const { crearGasto, curvaPresupuesto } = require("../logica.js");

const el = (dia) => new Date(`${dia}T12:00:00`).getTime();
const gasto = (id, dia, valor, extra = {}) => crearGasto({
  id, from: "JPY", to: "EUR", cantidad: valor * 160, valor, concepto: "Cena", cuando: el(dia), categoria: "comida", ...extra,
});
// 1.000 € en 10 días: lo justo son 100 al día.
const presupuesto = { importe: 1000, to: "EUR", desde: "2026-11-01", hasta: "2026-11-10" };

test("lo gastado se acumula hasta hoy y lo justo sube parejo hasta el final", () => {
  const c = curvaPresupuesto(presupuesto, [gasto("b", "2026-11-02", 50), gasto("a", "2026-11-01", 80)], "2026-11-03");
  assert.equal(c.puntos.length, 10);
  assert.deepEqual(c.puntos.slice(0, 4).map((p) => p.gastado), [80, 130, 130, null]);
  assert.equal(c.puntos[0].ideal, 100);
  assert.equal(c.puntos[9].ideal, 1000);
  assert.equal(c.hoy, 2);
  assert.equal(c.torcio, null, "vas por debajo");
  assert.equal(c.to, "EUR");
});

test("se torció el día que pasaste por encima y ya no bajaste", () => {
  const gastos = [gasto("c", "2026-11-04", 20), gasto("b", "2026-11-03", 200), gasto("x", "2026-11-02", 10), gasto("a", "2026-11-01", 150)];
  // 150 (>100), 160 (<200), 360 (>300), 380 (<400)... el día 4 vuelves por debajo.
  assert.equal(curvaPresupuesto(presupuesto, gastos, "2026-11-04").torcio, null);
  const peor = [gasto("d", "2026-11-04", 150), ...gastos];
  // El 4 sumas 530 (>400): por encima desde el 3.
  assert.equal(curvaPresupuesto(presupuesto, peor, "2026-11-04").torcio, "2026-11-03");
});

test("el vuelo de antes de salir cuenta en el primer día", () => {
  const c = curvaPresupuesto(presupuesto, [gasto("v", "2026-09-10", 300, { fijo: true })], "2026-11-02");
  assert.equal(c.puntos[0].gastado, 300);
  assert.equal(c.torcio, "2026-11-01");
});

test("acabado el viaje, la línea llega al final y ya no hay hoy", () => {
  const c = curvaPresupuesto(presupuesto, [gasto("a", "2026-11-05", 500)], "2026-11-20");
  assert.equal(c.puntos[9].gastado, 500);
  assert.equal(c.hoy, null);
});

test("antes de salir, no hay línea de lo gastado", () => {
  const c = curvaPresupuesto(presupuesto, [], "2026-10-25");
  assert.ok(c.puntos.every((p) => p.gastado === null));
  assert.equal(c.hoy, null);
});

test("en otra divisa no cuenta, y sin presupuesto o de un día no hay curva", () => {
  const c = curvaPresupuesto(presupuesto, [gasto("a", "2026-11-01", 80, { to: "USD" })], "2026-11-01");
  assert.equal(c.puntos[0].gastado, 0);
  assert.equal(curvaPresupuesto(null, [], "2026-11-01"), null);
  assert.equal(curvaPresupuesto({ ...presupuesto, hasta: "2026-11-01" }, [], "2026-11-01"), null);
});

test("lleva la previsión cuando la hay", () => {
  const gastos = [gasto("b", "2026-11-02", 150), gasto("a", "2026-11-01", 150)];
  const c = curvaPresupuesto(presupuesto, gastos, "2026-11-02");
  assert.equal(Math.round(c.prevision), 1500);
});
