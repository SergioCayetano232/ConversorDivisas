const { test } = require("node:test");
const assert = require("node:assert");
const { vueloMoneda } = require("../logica.js");

test("sale de donde está y llega a donde va", () => {
  const v = vueloMoneda({ x: 280, y: 40 }, { x: 250, y: 160 });
  assert.deepEqual([v[0].x, v[0].y], [0, 0]);
  assert.deepEqual([v.at(-1).x, v.at(-1).y], [-30, 120]);
  assert.equal(v[0].offset, 0);
  assert.equal(v.at(-1).offset, 1);
});

test("sube antes de bajar, aunque el gasto quede muy abajo", () => {
  for (const dy of [120, 400]) {
    const v = vueloMoneda({ x: 0, y: 0 }, { x: -30, y: dy });
    assert.ok(Math.min(...v.map((p) => p.y)) < 0, `con ${dy} no sube`);
  }
});

test("los pasos van en orden y aparece y se mete", () => {
  const v = vueloMoneda({ x: 0, y: 0 }, { x: 100, y: 100 });
  for (let i = 1; i < v.length; i++) assert.ok(v[i].offset > v[i - 1].offset);
  assert.equal(v[0].opacidad, 0);
  assert.ok(v.at(-1).escala < v[2].escala);
});

test("lejos sube más, pero con tope", () => {
  const cima = (v) => -Math.min(...v.map((p) => p.y));
  const cerca = vueloMoneda({ x: 0, y: 0 }, { x: 20, y: 0 });
  const lejos = vueloMoneda({ x: 0, y: 0 }, { x: 900, y: 0 });
  assert.ok(cima(lejos) > cima(cerca));
  assert.ok(cima(lejos) <= 70);
});

test("sin sitios de verdad no hay vuelo", () => {
  assert.equal(vueloMoneda(null, { x: 1, y: 1 }), null);
  assert.equal(vueloMoneda({ x: NaN, y: 0 }, { x: 1, y: 1 }), null);
});
