const { test } = require("node:test");
const assert = require("node:assert");
const { pasoPorDiez } = require("../logica.js");

test("arriba por diez, abajo entre diez", () => {
  assert.equal(pasoPorDiez(50, 1), 500);
  assert.equal(pasoPorDiez(50, -1), 5);
  assert.equal(pasoPorDiez(12.5, 1), 125);
  assert.equal(pasoPorDiez(12.5, -1), 1.25);
});

test("al céntimo, y lo que no llega a uno se queda en cero", () => {
  assert.equal(pasoPorDiez(1.23, -1), 0.12);
  assert.equal(pasoPorDiez(0.03, -1), 0);
  assert.equal(pasoPorDiez(0.1 + 0.2, 1), 3);
});

test("desde cero o vacío, subir empieza en 10", () => {
  assert.equal(pasoPorDiez(0, 1), 10);
  assert.equal(pasoPorDiez(null, 1), 10);
  assert.equal(pasoPorDiez(NaN, -1), 0);
  assert.equal(pasoPorDiez(-5, -1), 0);
});
