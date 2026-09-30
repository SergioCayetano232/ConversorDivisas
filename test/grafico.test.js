const { test } = require("node:test");
const assert = require("node:assert");
const {
  buildPaths, coordenadas, indiceCercano, extremos, fechaCorta, largoEnPantalla,
} = require("../logica.js");

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

test("coordenadas y el path dicen lo mismo", () => {
  // El punto del tooltip tiene que caer encima de la línea, no al lado.
  const valores = [1.08, 1.1, 1.09, 1.12];
  const { xs, ys } = puntos(buildPaths(valores).line);
  coordenadas(valores).forEach(({ x, y }, i) => {
    assert.ok(Math.abs(x - xs[i]) < 0.01 && Math.abs(y - ys[i]) < 0.01, `punto ${i}`);
  });
});

test("indiceCercano devuelve el punto que tiene debajo", () => {
  const valores = [1, 2, 3, 4, 5];
  coordenadas(valores).forEach(({ x }, i) => {
    assert.equal(indiceCercano(x, valores.length), i);
    assert.equal(indiceCercano(x + 0.5, valores.length), i, "un poco a la derecha");
    assert.equal(indiceCercano(x - 0.5, valores.length), i, "un poco a la izquierda");
  });
});

test("indiceCercano no se sale por los lados", () => {
  // El ratón puede estar en el margen, fuera de la zona de puntos.
  assert.equal(indiceCercano(0, 30), 0);
  assert.equal(indiceCercano(-10, 30), 0);
  assert.equal(indiceCercano(100, 30), 29);
  assert.equal(indiceCercano(150, 30), 29);
  assert.equal(indiceCercano(50, 1), 0);
});

test("extremos encuentra el máximo y el mínimo", () => {
  assert.deepEqual(extremos([3, 1, 4, 1.5, 9, 2]), { max: 4, min: 1 });
  assert.deepEqual(extremos([5, 4, 3]), { max: 0, min: 2 });
});

test("con valores repetidos se queda con el primero", () => {
  assert.deepEqual(extremos([2, 5, 1, 5, 1]), { max: 1, min: 2 });
  assert.deepEqual(extremos([7, 7, 7]), { max: 0, min: 0 });
});

test("fechaCorta da día y mes, sin punto", () => {
  assert.equal(fechaCorta("2026-01-05", 2026), "5 ene");
  assert.equal(fechaCorta("2026-09-29", 2026), "29 sept");
  assert.ok(!fechaCorta("2026-12-31", 2026).includes("."));
});

test("fechaCorta pone el año solo si no es el de ahora", () => {
  assert.equal(fechaCorta("2025-10-03", 2026), "3 oct 2025");
  assert.equal(fechaCorta("2026-10-03", 2026), "3 oct");
  assert.equal(fechaCorta(`${new Date().getFullYear()}-03-01`), "1 mar", "por defecto, el año de hoy");
});

test("fechaCorta no se va al día anterior", () => {
  // Con new Date(iso) en una zona al oeste de UTC salía el 31 de diciembre.
  for (const iso of ["2026-01-01", "2026-03-01", "2026-10-25"]) {
    assert.ok(fechaCorta(iso, 2026).startsWith(String(Number(iso.slice(8)))), iso);
  }
});

test("largoEnPantalla mide la línea estirada", () => {
  // Plana de x=1.5 a x=98.5: 97 unidades, que en 266 px de ancho son 258 px.
  const plana = coordenadas([5, 5, 5]);
  assert.ok(Math.abs(largoEnPantalla(plana, 266, 40) - 97 * 2.66) < 0.01);
});

test("sin estirar coincide con lo que mide el viewBox", () => {
  const p = [{ x: 0, y: 0 }, { x: 3, y: 4 }, { x: 3, y: 10 }];
  assert.equal(largoEnPantalla(p, 100, 28), 11);
});

test("con una línea que sube, estirar el alto también cuenta", () => {
  const p = [{ x: 0, y: 28 }, { x: 0, y: 0 }];
  assert.equal(largoEnPantalla(p, 266, 40), 40);
});

test("con un solo punto mide cero", () => {
  assert.equal(largoEnPantalla([{ x: 50, y: 14 }], 266, 40), 0);
});
