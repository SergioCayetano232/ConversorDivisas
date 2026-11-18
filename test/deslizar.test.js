const { test } = require("node:test");
const assert = require("node:assert");
const { umbralDeslizar, tirarGasto, quitarAlSoltar, DESLIZAR_MIN } = require("../logica.js");

test("el umbral es un tercio largo de la fila, con un mínimo", () => {
  assert.equal(umbralDeslizar(300), 105);
  assert.equal(umbralDeslizar(150), DESLIZAR_MIN);
  assert.equal(umbralDeslizar(undefined), DESLIZAR_MIN);
});

test("hacia la izquierda sigue al dedo y cuenta cuánto falta", () => {
  assert.deepEqual(tirarGasto(-52.5, 300), { x: -52, progreso: 0.5 });
  assert.deepEqual(tirarGasto(-105, 300), { x: -105, progreso: 1 });
  // Pasado el umbral sigue moviéndose, pero ya está lleno.
  assert.deepEqual(tirarGasto(-200, 300), { x: -200, progreso: 1 });
});

test("hacia la derecha apenas se mueve y no llena nada", () => {
  const t = tirarGasto(100, 300);
  assert.equal(t.progreso, 0);
  assert.equal(t.x, 20);
  assert.deepEqual(tirarGasto(NaN, 300), { x: 0, progreso: 0 });
});

test("al soltar se quita si pasa el umbral", () => {
  assert.equal(quitarAlSoltar(-104, 300), false);
  assert.equal(quitarAlSoltar(-105, 300), true);
  assert.equal(quitarAlSoltar(50, 300), false);
});

test("lanzado rápido vale con menos, pero no con un temblor", () => {
  assert.equal(quitarAlSoltar(-40, 300, -0.9), true);
  assert.equal(quitarAlSoltar(-40, 300, -0.3), false);
  assert.equal(quitarAlSoltar(-10, 300, -2), false);
  // Rápido pero volviendo hacia la derecha no cuenta.
  assert.equal(quitarAlSoltar(-40, 300, 0.9), false);
});
