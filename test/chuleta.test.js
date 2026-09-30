const { test } = require("node:test");
const assert = require("node:assert");
const { CHULETA, escalaChuleta, chuleta } = require("../logica.js");

const cantidades = (filas) => filas.map((f) => f.cantidad);

test("con un par parecido va de 1 a 100", () => {
  assert.equal(escalaChuleta(1.08), 1);
  assert.deepEqual(cantidades(chuleta(1.08)), CHULETA);
});

test("multiplica cada fila por la tasa", () => {
  const filas = chuleta(1.1);
  assert.equal(filas[0].valor, 1.1);
  assert.ok(Math.abs(filas[5].valor - 110) < 1e-9);
});

test("de yenes a euros empieza en 100", () => {
  // 1 JPY son 0,006 €: con 1 a 100 la tabla entera no llegaría a un euro.
  assert.equal(escalaChuleta(0.006), 100);
  assert.deepEqual(cantidades(chuleta(0.006)), [100, 500, 1000, 2000, 5000, 10000]);
});

test("de rupias indonesias sube hasta 10.000", () => {
  assert.equal(escalaChuleta(0.000055), 10000);
});

test("hacia una divisa pequeña no escala", () => {
  assert.equal(escalaChuleta(160), 1, "1 € = 160 JPY ya se lee bien");
});

test("justo en medio no sube", () => {
  assert.equal(escalaChuleta(0.5), 1);
  assert.equal(escalaChuleta(0.049), 100);
});

test("sin tasa salen las cantidades con el valor vacío", () => {
  for (const mala of [null, undefined, 0, -1, NaN, Infinity]) {
    const filas = chuleta(mala);
    assert.deepEqual(cantidades(filas), CHULETA, String(mala));
    assert.ok(filas.every((f) => f.valor === null), String(mala));
  }
});

test("con comisión, cada fila lleva lo que pagarías", () => {
  const filas = chuleta(1.1, 2);
  assert.ok(Math.abs(filas[0].valor - 1.122) < 1e-9);
  assert.ok(Math.abs(filas[5].valor - 112.2) < 1e-9);
});

test("la comisión no cambia la escala", () => {
  // 0,0049 × 1,03 pasaría de 0,005, pero la tabla tiene que seguir siendo la misma.
  assert.deepEqual(cantidades(chuleta(0.0049, 3)), cantidades(chuleta(0.0049)));
});

test("sin tasa, la comisión no inventa nada", () => {
  assert.ok(chuleta(null, 2).every((f) => f.valor === null));
});

test("la misma divisa en los dos lados da la tabla tal cual", () => {
  assert.deepEqual(chuleta(1).map((f) => f.valor), CHULETA);
});
