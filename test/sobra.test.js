const { test } = require("node:test");
const assert = require("node:assert");
const { loQueSobra } = require("../logica.js");

const presupuesto = { importe: 1000, to: "EUR", hasta: "2026-10-10" };
const sacado = [{ id: "r1", cantidad: 20000, divisa: "JPY", cuando: 1 }];
const enEfectivo = (cantidad) => ({ from: "JPY", to: "EUR", cantidad, valor: cantidad * 0.006, pago: "efectivo" });

test("el último día te dice lo que queda y lo que vale", () => {
  const r = loQueSobra(presupuesto, [enEfectivo(17000)], sacado, 0.006, "2026-10-10");
  assert.equal(r.queda, 3000);
  assert.equal(r.divisa, "JPY");
  assert.ok(Math.abs(r.valor - 18) < 1e-9);
  assert.equal(r.to, "EUR");
  assert.equal(r.cuando, "ultimo");
});

test("a la vuelta, que ya ha acabado", () => {
  assert.equal(loQueSobra(presupuesto, [], sacado, 0.006, "2026-10-14").cuando, "acabado");
});

test("en mitad del viaje no, que lo vas a gastar", () => {
  assert.equal(loQueSobra(presupuesto, [], sacado, 0.006, "2026-10-09"), null);
});

test("sin presupuesto no sé cuándo vuelves", () => {
  assert.equal(loQueSobra(null, [], sacado, 0.006, "2026-10-14"), null);
});

test("si no queda nada, o has pagado de más, nada", () => {
  assert.equal(loQueSobra(presupuesto, [enEfectivo(20000)], sacado, 0.006, "2026-10-10"), null);
  assert.equal(loQueSobra(presupuesto, [enEfectivo(25000)], sacado, 0.006, "2026-10-10"), null);
  assert.equal(loQueSobra(presupuesto, [], [], 0.006, "2026-10-10"), null);
});

test("sin tasa te dice lo que queda, pero no lo que vale", () => {
  const r = loQueSobra(presupuesto, [], sacado, null, "2026-10-10");
  assert.equal(r.queda, 20000);
  assert.equal(r.valor, null);
});

test("si el efectivo es de tu divisa, vale lo mismo sin tasa", () => {
  const euros = [{ id: "r1", cantidad: 200, divisa: "EUR", cuando: 1 }];
  assert.equal(loQueSobra(presupuesto, [], euros, null, "2026-10-10").valor, 200);
});
