const { test } = require("node:test");
const assert = require("node:assert");
const { compararPrecios, inclinacion } = require("../logica.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);

test("si allí sale más barato, cuánto te ahorras", () => {
  const r = compararPrecios(893.1, 1149);
  assert.equal(r.donde, "alli");
  cerca(r.ahorro, 255.9);
  cerca(r.fraccion, 255.9 / 1149);
});

test("si aquí sale más barato", () => {
  const r = compararPrecios(120, 100);
  assert.equal(r.donde, "aqui");
  cerca(r.ahorro, 20);
  cerca(r.fraccion, 20 / 120, "el porcentaje es sobre el más caro");
});

test("menos de un 1 % es lo mismo", () => {
  assert.equal(compararPrecios(100, 100.5).donde, "igual");
  assert.equal(compararPrecios(100, 99.2).donde, "igual");
  assert.equal(compararPrecios(100, 102).donde, "alli");
});

test("sin los dos precios no hay comparación", () => {
  assert.equal(compararPrecios(null, 100), null);
  assert.equal(compararPrecios(100, 0), null);
  assert.equal(compararPrecios(100, NaN), null);
  assert.equal(compararPrecios(-5, 100), null);
});

test("la balanza baja hacia el lado caro y se queda en el tope", () => {
  assert.equal(inclinacion(null), 0);
  assert.equal(inclinacion(compararPrecios(100, 100.5)), 0);
  cerca(inclinacion(compararPrecios(85, 100)), 7, "un 15 % es la mitad");
  cerca(inclinacion(compararPrecios(100, 85)), -7);
  assert.equal(inclinacion(compararPrecios(10, 100)), 14);
  assert.equal(inclinacion(compararPrecios(100, 10), 20), -20);
});
