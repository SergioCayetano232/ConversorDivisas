const { test } = require("node:test");
const assert = require("node:assert");
const { aplaste } = require("../logica.js");

test("un botón normal baja tres píxeles y se ensancha dos", () => {
  // 36×42, el de dar la vuelta.
  const a = aplaste(36, 42);
  assert.equal(a.y, +(1 - 3 / 42).toFixed(3));
  assert.equal(a.x, +(1 + 2 / 36).toFixed(3));
});

test("uno ancho casi no se ensancha, que no se salga de la fila", () => {
  const a = aplaste(300, 40);
  assert.ok(a.x < 1.01);
  assert.ok(Math.abs(300 * a.x - 300 - 2) < 0.2);
});

test("en los muy pequeños hay un tope, que no se queden en nada", () => {
  assert.deepEqual(aplaste(12, 12), { x: 1.06, y: 0.86 });
});

test("sin medidas no se aplasta", () => {
  assert.equal(aplaste(0, 40), null);
  assert.equal(aplaste(40, undefined), null);
  assert.equal(aplaste(NaN, 20), null);
});
