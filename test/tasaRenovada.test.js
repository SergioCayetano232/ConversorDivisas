const { test } = require("node:test");
const assert = require("node:assert");
const { tasaRenovada } = require("../logica.js");

const ayer = { rate: 1.0921, date: "2026-11-24" };

test("llega la de hoy encima de la de ayer", () => {
  assert.equal(tasaRenovada(ayer, { rate: 1.0935, date: "2026-11-25" }), true);
});

test("el mismo día pero corregida también cuenta", () => {
  assert.equal(tasaRenovada(ayer, { rate: 1.093, date: "2026-11-24" }), true);
});

test("si es la misma no hay nada que enseñar", () => {
  assert.equal(tasaRenovada(ayer, { rate: 1.0921, date: "2026-11-24" }), false);
});

test("sin nada guardado antes es la primera, no una nueva", () => {
  assert.equal(tasaRenovada(undefined, { rate: 1.0935, date: "2026-11-25" }), false);
  assert.equal(tasaRenovada(ayer, null), false);
});
