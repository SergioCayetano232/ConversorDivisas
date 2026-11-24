const { test } = require("node:test");
const assert = require("node:assert");
const { preguntaOjo, notaOjo, rachaOjo, escalaChuleta } = require("../logica.js");

const fijo = (n) => () => n;

test("el precio va de la escala de la chuleta a cien veces más", () => {
  // Del euro al yen la chuleta empieza en 1; del yen al euro, en 100.
  assert.equal(preguntaOjo(180, fijo(0)), 1);
  assert.equal(preguntaOjo(1 / 180, fijo(0)), 100);
  assert.equal(preguntaOjo(1 / 180, fijo(0.9999)), 10000);
  for (let i = 0; i < 200; i++) {
    const n = preguntaOjo(1 / 180);
    assert.ok(n >= escalaChuleta(1 / 180) && n <= escalaChuleta(1 / 180) * 100, String(n));
  }
});

test("a dos cifras, como un precio de verdad", () => {
  assert.equal(preguntaOjo(1 / 180, fijo(Math.log10(37.18) / 2)), 3700);
  assert.equal(preguntaOjo(1, fijo(Math.log10(8.46) / 2)), 8);
  for (let i = 0; i < 200; i++) {
    const n = preguntaOjo(1 / 30500);
    assert.ok(Number(String(n).replace(/0+$/, "")) < 100, `${n} tiene más de dos cifras`);
  }
});

test("sin tasa no hay pregunta", () => {
  assert.equal(preguntaOjo(null), null);
  assert.equal(preguntaOjo(0), null);
});

test("clavado, cerca o lejos", () => {
  assert.equal(notaOjo(20, 20).tono, "clavado");
  assert.equal(notaOjo(21, 20).tono, "clavado");
  assert.equal(notaOjo(22.5, 20).tono, "cerca");
  assert.equal(notaOjo(17.5, 20).tono, "cerca");
  assert.equal(notaOjo(30, 20).tono, "lejos");
  assert.ok(Math.abs(notaOjo(22, 20).error - 0.1) < 1e-12);
  assert.equal(notaOjo(0, 20), null);
  assert.equal(notaOjo(NaN, 20), null);
});

test("la racha sube acertando y se va al fallar", () => {
  assert.equal(rachaOjo(2, { tono: "clavado" }), 3);
  assert.equal(rachaOjo(2, { tono: "cerca" }), 3);
  assert.equal(rachaOjo(5, { tono: "lejos" }), 0);
  assert.equal(rachaOjo(5, null), 0);
});
