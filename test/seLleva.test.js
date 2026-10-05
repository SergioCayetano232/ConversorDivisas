const { test } = require("node:test");
const assert = require("node:assert");
const { loQueSeLleva, redondearDias } = require("../logica.js");

const presupuesto = { importe: 500, to: "EUR", hasta: "2026-10-10" };
const gastado = (valor) => [{ to: "EUR", valor }];
const gasto = (valor, to = "EUR") => ({ valor, to });

test("cuántos días de lo que te queda al día", () => {
  // Quedan 300 para 6 días contando hoy: 50 al día.
  const r = loQueSeLleva(presupuesto, gastado(200), gasto(30), "2026-10-05");
  assert.equal(r.dias, 0.6);
  assert.equal(r.desde, 0.4);
  assert.ok(Math.abs(r.trozo - 0.06) < 1e-9);
  assert.equal(r.pasaria, false);
});

test("si te pasarías, el trozo llega justo al final", () => {
  const r = loQueSeLleva(presupuesto, gastado(450), gasto(80), "2026-10-05");
  assert.equal(r.pasaria, true);
  assert.ok(Math.abs(r.trozo - 0.1) < 1e-9);
});

test("ya pasado, ni trozo ni días", () => {
  const r = loQueSeLleva(presupuesto, gastado(600), gasto(10), "2026-10-05");
  assert.deepEqual(r, { desde: 1, trozo: 0, pasaria: true, dias: null });
});

test("sin presupuesto, en otra divisa o sin gasto, nada", () => {
  assert.equal(loQueSeLleva(null, [], gasto(10)), null);
  assert.equal(loQueSeLleva(presupuesto, [], gasto(10, "USD")), null);
  assert.equal(loQueSeLleva(presupuesto, [], null), null);
  assert.equal(loQueSeLleva(presupuesto, [], gasto(0)), null);
});

test("los días se redondean según lo grandes que son", () => {
  assert.equal(redondearDias(0.04), null);
  assert.equal(redondearDias(0.64), 0.6);
  assert.equal(redondearDias(2.25), 2.3);
  assert.equal(redondearDias(12.6), 13);
});
