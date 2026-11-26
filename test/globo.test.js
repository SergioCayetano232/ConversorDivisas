const { test } = require("node:test");
const assert = require("node:assert");
const { LUGAR_DIVISA, proyectar, giroGlobo, reticulaGlobo, CURRENCIES } = require("../logica.js");

const cerca = (a, b) => Math.abs(a - b) < 1e-9;

test("todas las divisas tienen su sitio en el globo", () => {
  for (const { code } of CURRENCIES) assert.ok(LUGAR_DIVISA[code], code);
  assert.equal(Object.keys(LUGAR_DIVISA).length, CURRENCIES.length);
});

test("el punto que miras cae en el centro", () => {
  const p = proyectar([36, 138], [36, 138], 10);
  assert.ok(cerca(p.x, 0) && cerca(p.y, 0) && p.visible);
});

test("el norte sale arriba y el este a la derecha", () => {
  assert.ok(proyectar([30, 0], [0, 0], 10).y < 0);
  assert.ok(proyectar([0, 30], [0, 0], 10).x > 0);
});

test("lo de la otra cara no se ve", () => {
  assert.equal(proyectar([0, 180], [0, 0], 10).visible, false);
  assert.equal(proyectar([-36, -42], [36, 138], 10).visible, false);
});

test("gira por el camino corto", () => {
  const a = giroGlobo([36, 138], [39, -98]);
  assert.deepEqual(a(0), [36, 138]);
  assert.deepEqual(a(1), [39, 262]);
  assert.ok(a(0.5)[1] > 138, "cruza el Pacífico hacia el este");
  const b = giroGlobo([39, -98], [36, 138]);
  assert.ok(b(0.5)[1] < -98, "y de vuelta hacia el oeste");
});

test("la retícula no se sale del círculo", () => {
  const d = reticulaGlobo([40, -3], 12);
  const numeros = d.match(/-?[\d.]+/g).map(Number);
  for (let i = 0; i < numeros.length; i += 2) assert.ok(Math.hypot(numeros[i], numeros[i + 1]) <= 12.05);
  assert.ok(d.startsWith("M"));
});
