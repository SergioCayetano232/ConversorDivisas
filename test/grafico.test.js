const { test } = require("node:test");
const assert = require("node:assert");
const { buildPaths } = require("../logica.js");

// Saca los pares x,y de un path "M1.50,3.00L6.12,6.18L..."
function puntos(d) {
  const n = d.slice(1).split(/[L,]/).map(Number);
  return { xs: n.filter((_, i) => i % 2 === 0), ys: n.filter((_, i) => i % 2 === 1) };
}

test("todo cae dentro del viewBox", () => {
  // El trazo se pinta centrado sobre la línea, así que pegado al borde se le
  // come la mitad: por eso hay margen.
  const series = {
    subida: [1, 2, 3, 4],
    bajada: [3, 2, 1],
    dosPuntos: [1, 1.5],
    treinta: Array.from({ length: 30 }, (_, i) => 1 + Math.sin(i / 3) * 0.05),
    noventa: Array.from({ length: 66 }, (_, i) => 1 + Math.cos(i / 5) * 0.08),
  };
  for (const [nombre, valores] of Object.entries(series)) {
    const { xs, ys } = puntos(buildPaths(valores).line);
    assert.ok(Math.min(...xs) >= 1.5, `${nombre}: se sale por la izquierda`);
    assert.ok(Math.max(...xs) <= 98.5, `${nombre}: se sale por la derecha`);
    assert.ok(Math.min(...ys) >= 3, `${nombre}: se sale por arriba`);
    assert.ok(Math.max(...ys) <= 25, `${nombre}: se sale por abajo`);
    assert.ok([...xs, ...ys].every(Number.isFinite), `${nombre}: hay algún NaN`);
  }
});

test("una tasa que no se mueve sale centrada", () => {
  const { ys } = puntos(buildPaths([5, 5, 5]).line);
  assert.deepEqual(ys, [14, 14, 14]);
});

test("el área cierra por abajo", () => {
  const { area } = buildPaths([1, 2, 3]);
  assert.ok(area.endsWith("Z"), "el path del área tiene que cerrarse");
  assert.ok(area.includes(",28"), "tiene que bajar hasta el borde inferior");
});

test("los puntos van repartidos de izquierda a derecha", () => {
  const { xs } = puntos(buildPaths([1, 2, 3, 4, 5]).line);
  for (let i = 1; i < xs.length; i++) {
    assert.ok(xs[i] > xs[i - 1], "las x tienen que ir creciendo");
  }
});

test("subir la tasa baja la y, que el SVG cuenta al revés", () => {
  const { ys } = puntos(buildPaths([1, 2, 3]).line);
  assert.ok(ys[0] > ys[2], "el valor más alto debe quedar más arriba");
});
