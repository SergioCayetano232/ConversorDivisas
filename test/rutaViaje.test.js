const { test } = require("node:test");
const assert = require("node:assert");
const { rutaViaje } = require("../logica.js");

const puntos = (d) => d.match(/-?[\d.]+/g).map(Number);

test("va de la bandera de casa a la de allí", () => {
  const ruta = rutaViaje("EUR", "JPY", 200, 40);
  assert.equal(ruta.desde, "🇪🇺");
  assert.equal(ruta.hasta, "🇯🇵");
});

test("sale y llega abajo, de punta a punta", () => {
  const [x0, y0, , , x1, y1] = puntos(rutaViaje("EUR", "JPY", 200, 40).d);
  assert.deepEqual([x0, y0, x1, y1], [0, 36, 200, 36]);
});

test("la cima del arco queda a 4 px del techo", () => {
  const [, y0, , cy] = puntos(rutaViaje("EUR", "JPY", 200, 40).d);
  assert.equal((y0 + 2 * cy + y0) / 4, 4);
});

test("sin viaje de verdad no hay ruta", () => {
  assert.equal(rutaViaje("EUR", "EUR", 200, 40), null);
  assert.equal(rutaViaje("EUR", "XXX", 200, 40), null);
  assert.equal(rutaViaje("EUR", "JPY", 0, 40), null);
});
