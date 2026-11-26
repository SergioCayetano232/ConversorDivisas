const { test } = require("node:test");
const assert = require("node:assert");
const { tonoHolograma, HOLO_VUELTA } = require("../luz.js");

test("de un borde al otro recorre los colores", () => {
  assert.equal(tonoHolograma(0, 300), 0);
  assert.equal(tonoHolograma(150, 300), HOLO_VUELTA / 2);
  assert.equal(tonoHolograma(300, 300), HOLO_VUELTA);
});

test("no da la vuelta entera, que acabaría en el mismo color", () => {
  assert.ok(HOLO_VUELTA < 360);
});

test("fuera de la tarjeta se queda en el borde", () => {
  assert.equal(tonoHolograma(-40, 300), 0);
  assert.equal(tonoHolograma(900, 300), HOLO_VUELTA);
});

test("sin medidas se queda en su color", () => {
  assert.equal(tonoHolograma(10, 0), 0);
  assert.equal(tonoHolograma(NaN, 300), 0);
});
