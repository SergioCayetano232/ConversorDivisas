const { test } = require("node:test");
const assert = require("node:assert");
const { alDiaAlli } = require("../logica.js");

test("en yenes, a dos cifras y hacia abajo", () => {
  assert.equal(alDiaAlli(30, 0.00565), 5300);
  assert.equal(alDiaAlli(250, 0.00565), 44000);
});

test("con divisas parecidas, a la unidad", () => {
  assert.equal(alDiaAlli(30, 0.92), 32);
  assert.equal(alDiaAlli(45.5, 1), 45);
});

test("de cien para arriba ya redondea a la decena", () => {
  assert.equal(alDiaAlli(30, 0.2), 150);
  assert.equal(alDiaAlli(30, 0.1), 300);
});

test("sin lo de al día o sin tasa no dice nada", () => {
  assert.equal(alDiaAlli(null, 0.0056), null);
  assert.equal(alDiaAlli(0, 0.0056), null);
  assert.equal(alDiaAlli(30, null), null);
  assert.equal(alDiaAlli(30, 0), null);
  assert.equal(alDiaAlli(0.4, 1), null, "menos de uno se queda en nada");
});
