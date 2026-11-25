const { test } = require("node:test");
const assert = require("node:assert");
const { recorridoEnPantalla } = require("../logica.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);

test("empieza en el primer punto y acaba en el último", () => {
  const puntos = [{ x: 2, y: 20 }, { x: 50, y: 4 }, { x: 98, y: 14 }];
  const r = recorridoEnPantalla(puntos, 300, 40, 10);
  assert.equal(r.length, 11);
  assert.deepEqual(r[0], { x: 2, y: 20 });
  cerca(r.at(-1).x, 98);
  cerca(r.at(-1).y, 14);
});

test("en una recta los pasos son iguales", () => {
  const r = recorridoEnPantalla([{ x: 0, y: 10 }, { x: 100, y: 10 }], 200, 40, 4);
  assert.deepEqual(r.map((p) => p.x), [0, 25, 50, 75, 100]);
});

test("mide en pantalla: una subida corta en el viewBox pero larga en píxeles se lleva más pasos", () => {
  // De 0 a 10 en x son 20 px; de 0 a 28 en y son 40 px. Lo vertical pesa más.
  const r = recorridoEnPantalla([{ x: 0, y: 0 }, { x: 0, y: 28 }, { x: 10, y: 28 }], 200, 40, 6);
  // 60 px en 6 pasos de 10: los cuatro primeros en la subida.
  cerca(r[4].y, 28);
  cerca(r[4].x, 0);
  cerca(r[5].x, 5);
});

test("con un solo punto no hay recorrido", () => {
  assert.deepEqual(recorridoEnPantalla([{ x: 50, y: 14 }], 200, 40), [{ x: 50, y: 14 }]);
});
