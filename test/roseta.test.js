const { test } = require("node:test");
const assert = require("node:assert");
const { rosetaBillete, semillaDivisa } = require("../logica.js");

test("la misma divisa da siempre el mismo dibujo", () => {
  assert.deepEqual(rosetaBillete("JPY"), rosetaBillete("JPY"));
  assert.equal(semillaDivisa("JPY"), semillaDivisa("JPY"));
});

test("cada divisa tiene el suyo", () => {
  const vistos = new Set(["EUR", "USD", "JPY", "GBP", "MXN", "THB"].map((c) => rosetaBillete(c).trazos[0]));
  assert.equal(vistos.size, 6);
});

test("los pétalos van de 7 a 15", () => {
  for (const c of ["EUR", "USD", "JPY", "GBP", "CHF", "VND", "ARS", "ZAR"]) {
    const { petalos } = rosetaBillete(c);
    assert.ok(petalos >= 7 && petalos <= 15, `${c}: ${petalos}`);
  }
});

test("tres trazos cerrados que caben en el radio", () => {
  const { trazos } = rosetaBillete("EUR", 60);
  assert.equal(trazos.length, 3);
  for (const d of trazos) {
    assert.match(d, /^M-?[\d.]+ -?[\d.]+(L-?[\d.]+ -?[\d.]+)+Z$/);
    const numeros = d.match(/-?[\d.]+/g).map(Number);
    assert.ok(numeros.every((n) => Math.abs(n) <= 60 * 1.05));
  }
});

test("sin un código de verdad no hay roseta", () => {
  assert.equal(rosetaBillete(""), null);
  assert.equal(rosetaBillete("eur"), null);
  assert.equal(rosetaBillete(undefined), null);
});
