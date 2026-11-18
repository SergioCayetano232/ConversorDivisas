const { test } = require("node:test");
const assert = require("node:assert");
const { ladeoPostal, LADEO_MAX } = require("../logica.js");

test("en el centro se queda plana, con la luz en medio", () => {
  assert.deepEqual(ladeoPostal(200, 250, 400, 500), { girarY: 0, girarX: 0, luzX: 50, luzY: 50 });
});

test("en las esquinas llega al máximo, hacia donde está el ratón", () => {
  assert.deepEqual(ladeoPostal(400, 0, 400, 500), { girarY: LADEO_MAX, girarX: LADEO_MAX, luzX: 100, luzY: 0 });
  assert.deepEqual(ladeoPostal(0, 500, 400, 500), { girarY: -LADEO_MAX, girarX: -LADEO_MAX, luzX: 0, luzY: 100 });
});

test("fuera de la postal no pasa del máximo", () => {
  const l = ladeoPostal(900, -300, 400, 500);
  assert.equal(l.girarY, LADEO_MAX);
  assert.equal(l.girarX, LADEO_MAX);
});

test("a un cuarto, la mitad del máximo", () => {
  assert.equal(ladeoPostal(300, 250, 400, 500).girarY, LADEO_MAX / 2);
});

test("sin medidas no se ladea", () => {
  assert.equal(ladeoPostal(10, 10, 0, 500), null);
  assert.equal(ladeoPostal(NaN, 10, 400, 500), null);
});
