const { test } = require("node:test");
const assert = require("node:assert");
const { radioOnda } = require("../logica.js");

test("desde el centro llega a las cuatro esquinas", () => {
  assert.equal(radioOnda(80, 60, 40, 30), 50);
});

test("desde una punta tiene que cruzar el botón entero", () => {
  // Copiar es ancho y bajo: pulsado en el borde izquierdo, la esquina lejana está a la derecha.
  assert.equal(radioOnda(120, 32, 0, 16), Math.ceil(Math.hypot(120, 16)));
  assert.equal(radioOnda(120, 32, 120, 0), Math.ceil(Math.hypot(120, 32)));
});

test("redondea hacia arriba, que no quede un pelo sin cubrir", () => {
  assert.equal(radioOnda(10, 10, 0, 0), 15);
});

test("con medidas raras no hay onda", () => {
  assert.equal(radioOnda(0, 30, 0, 0), 0);
  assert.equal(radioOnda(40, 30, NaN, 10), 0);
  assert.equal(radioOnda(undefined, 30, 1, 1), 0);
});
