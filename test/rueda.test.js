const { test } = require("node:test");
const assert = require("node:assert");
const { pasosRueda, RUEDA_PASO } = require("../logica.js");

test("una muesca de ratón es un paso, hacia arriba sube", () => {
  assert.deepEqual(pasosRueda(0, -RUEDA_PASO), { pasos: 1, resto: 0 });
  assert.deepEqual(pasosRueda(0, RUEDA_PASO), { pasos: -1, resto: 0 });
  assert.deepEqual(pasosRueda(0, -250), { pasos: 2, resto: -50 });
});

test("el trackpad va juntando hasta llegar a un paso", () => {
  let acumulado = 0;
  let pasos = 0;
  for (let i = 0; i < 30; i++) {
    const r = pasosRueda(acumulado, -3);
    acumulado = r.resto;
    pasos += r.pasos;
  }
  assert.equal(pasos, 0);
  assert.equal(acumulado, -90);
  assert.deepEqual(pasosRueda(acumulado, -12), { pasos: 1, resto: -2 });
});

test("al cambiar de sentido se empieza de cero", () => {
  assert.deepEqual(pasosRueda(-90, 100), { pasos: -1, resto: 0 });
  assert.deepEqual(pasosRueda(90, -30), { pasos: 0, resto: -30 });
  assert.deepEqual(pasosRueda(0, 0), { pasos: 0, resto: 0 });
});
