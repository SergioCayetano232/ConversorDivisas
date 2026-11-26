const { test } = require("node:test");
const assert = require("node:assert");
const { sombraDeLuz, SOMBRA_MAX } = require("../luz.js");

test("con el ratón en el centro la sombra cae recta", () => {
  assert.deepEqual(sombraDeLuz(100, 50, 200, 100), { x: 0, y: 0 });
});

test("se va al lado contrario del ratón", () => {
  assert.deepEqual(sombraDeLuz(0, 0, 200, 100), { x: SOMBRA_MAX, y: SOMBRA_MAX });
  assert.deepEqual(sombraDeLuz(200, 100, 200, 100), { x: -SOMBRA_MAX, y: -SOMBRA_MAX });
  assert.deepEqual(sombraDeLuz(150, 50, 200, 100), { x: -4, y: 0 });
});

test("fuera de la tarjeta no pasa del máximo", () => {
  assert.deepEqual(sombraDeLuz(-50, 300, 200, 100), { x: SOMBRA_MAX, y: -SOMBRA_MAX });
});

test("sin tamaño no hay sombra", () => {
  assert.equal(sombraDeLuz(10, 10, 0, 100), null);
  assert.equal(sombraDeLuz(NaN, 10, 200, 100), null);
});
