const { test } = require("node:test");
const assert = require("node:assert");
const { cifraCompleta } = require("../logica.js");

test("lo que el redondeo se come, con seis cifras", () => {
  assert.deepEqual(cifraCompleta(0.56501234), { valor: 0.565012, decimales: 6 });
  assert.deepEqual(cifraCompleta(0.004567891), { valor: 0.00456789, decimales: 8 });
  assert.deepEqual(cifraCompleta(12.3456), { valor: 12.3456, decimales: 4 });
});

test("si con dos decimales ya está, nada", () => {
  for (const n of [42.79, 1554.2536, 10, 0.5, 1234567.891, 0, NaN, null]) assert.equal(cifraCompleta(n), null, String(n));
});

test("nunca menos de dos decimales", () => {
  assert.deepEqual(cifraCompleta(0.125), { valor: 0.125, decimales: 3 });
});
