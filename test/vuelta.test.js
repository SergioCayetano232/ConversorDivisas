const { test } = require("node:test");
const assert = require("node:assert");
const { BILLETES, CURRENCIES, pagosPosibles, vuelta } = require("../logica.js");

test("hay billetes para todas las divisas, de menor a mayor", () => {
  for (const { code } of CURRENCIES) {
    const b = BILLETES[code];
    assert.ok(b?.length, code);
    assert.deepEqual([...b].sort((x, y) => x - y), b, code);
  }
});

test("lo justo hacia arriba con cada billete, sin repetir", () => {
  assert.deepEqual(pagosPosibles(37.2, "EUR"), [40, 50, 100]);
  assert.deepEqual(pagosPosibles(6800, "JPY"), [7000, 10000]);
  assert.deepEqual(pagosPosibles(3.4, "USD"), [4, 5, 10]);
});

test("lo exacto no sale, que no hay vuelta", () => {
  assert.deepEqual(pagosPosibles(20, "EUR"), [50, 100, 200]);
  assert.deepEqual(pagosPosibles(250, "EUR"), [260, 300, 400]);
  assert.deepEqual(pagosPosibles(10000, "JPY"), []);
});

test("sin cantidad o con una divisa rara, nada", () => {
  assert.deepEqual(pagosPosibles(0, "EUR"), []);
  assert.deepEqual(pagosPosibles(NaN, "EUR"), []);
  assert.deepEqual(pagosPosibles(10, "XXX"), []);
});

test("la vuelta, sin restos de decimales", () => {
  assert.equal(vuelta(37.2, 40), 2.8);
  assert.equal(vuelta(6800, 10000), 3200);
  assert.equal(vuelta(0.1 + 0.2, 1), 0.7);
});
