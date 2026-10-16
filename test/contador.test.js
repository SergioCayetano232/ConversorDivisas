const { test } = require("node:test");
const assert = require("node:assert");
const { cifraEnMarcha } = require("../logica.js");

test("empieza en lo de antes y acaba justo en lo nuevo", () => {
  assert.equal(cifraEnMarcha(40, 63, 0), 40);
  assert.equal(cifraEnMarcha(40, 63, 1), 63);
});

test("frena al final: a mitad de tiempo ya lleva casi todo", () => {
  const medio = cifraEnMarcha(0, 100, 0.5);
  assert.equal(medio, 87.5);
  assert.ok(cifraEnMarcha(0, 100, 0.9) > 99);
});

test("también hacia abajo, al quitar un gasto", () => {
  assert.equal(cifraEnMarcha(63, 40, 1), 40);
  assert.ok(cifraEnMarcha(63, 40, 0.5) < 63 && cifraEnMarcha(63, 40, 0.5) > 40);
});

test("al céntimo, y fuera de tiempo se queda en los extremos", () => {
  assert.equal(cifraEnMarcha(10, 10.07, 0.3), 10.05);
  assert.equal(cifraEnMarcha(10, 20, -1), 10);
  assert.equal(cifraEnMarcha(10, 20, 2), 20);
});
