const { test } = require("node:test");
const assert = require("node:assert");
const { BILLETES, CURRENCIES, pagosPosibles, vuelta, pagoJusto } = require("../logica.js");

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

test("el desglose para pagar justo, de mayor a menor", () => {
  assert.deepEqual(pagoJusto(37.2, "EUR"), { billetes: [{ valor: 20, n: 1 }, { valor: 10, n: 1 }, { valor: 5, n: 1 }], monedas: 2.2 });
  assert.deepEqual(pagoJusto(26800, "JPY"), { billetes: [{ valor: 10000, n: 2 }, { valor: 5000, n: 1 }, { valor: 1000, n: 1 }], monedas: 800 });
  assert.deepEqual(pagoJusto(600, "EUR"), { billetes: [{ valor: 200, n: 3 }], monedas: 0 });
});

test("por debajo del billete más pequeño, todo en monedas", () => {
  assert.deepEqual(pagoJusto(3.4, "EUR"), { billetes: [], monedas: 3.4 });
  assert.equal(pagoJusto(0, "EUR"), null);
  assert.equal(pagoJusto(10, "XXX"), null);
});

test("los céntimos no se pierden por los decimales", () => {
  assert.equal(pagoJusto(0.1 + 0.2 + 5, "EUR").monedas, 0.3);
});
