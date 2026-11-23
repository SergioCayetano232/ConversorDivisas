const { test } = require("node:test");
const assert = require("node:assert");
const { coordenadas, buildPaths, PUNTOS_TRANSFORMAR, remuestrear, curvaEnMedio } = require("../logica.js");

test("buildPaths sigue dando lo mismo de siempre", () => {
  const { line, area } = buildPaths([1, 2]);
  assert.equal(line, "M1.50,25.00L98.50,3.00");
  assert.equal(area, "M1.50,25.00L98.50,3.00L98.50,28L1.50,28Z");
});

test("7 días y un año acaban con los mismos puntos", () => {
  const semana = remuestrear(coordenadas([1, 2, 3, 2, 1, 2, 3]));
  const anio = remuestrear(coordenadas(Array.from({ length: 250 }, (_, i) => Math.sin(i))));
  assert.equal(semana.length, PUNTOS_TRANSFORMAR);
  assert.equal(anio.length, PUNTOS_TRANSFORMAR);
});

test("respeta los extremos y no se sale del gráfico", () => {
  const original = coordenadas([5, 1, 9, 3]);
  const puntos = remuestrear(original, 10);
  assert.deepEqual(puntos[0], original[0]);
  assert.deepEqual(puntos[9], original[3]);
  for (const { x, y } of puntos) {
    assert.ok(x >= 1.5 && x <= 98.5);
    assert.ok(y >= 3 && y <= 25);
  }
});

test("entre dos puntos va en línea recta", () => {
  const [a, medio, b] = remuestrear([{ x: 0, y: 0 }, { x: 10, y: 20 }], 3);
  assert.deepEqual(a, { x: 0, y: 0 });
  assert.deepEqual(medio, { x: 5, y: 10 });
  assert.deepEqual(b, { x: 10, y: 20 });
});

test("la curva en medio empieza en la vieja y acaba en la nueva", () => {
  const vieja = remuestrear(coordenadas([1, 2, 3]), 5);
  const nueva = remuestrear(coordenadas([3, 2, 1, 2]), 5);
  assert.deepEqual(curvaEnMedio(vieja, nueva, 0), curvaEnMedio(vieja, vieja, 1));
  assert.deepEqual(curvaEnMedio(vieja, nueva, 1), curvaEnMedio(nueva, nueva, 0));
  assert.deepEqual(curvaEnMedio(vieja, nueva, 5), curvaEnMedio(vieja, nueva, 1));
});

test("frena al final: a mitad de tiempo ya casi ha llegado", () => {
  const vieja = [{ x: 0, y: 0 }, { x: 10, y: 0 }];
  const nueva = [{ x: 0, y: 20 }, { x: 10, y: 20 }];
  assert.equal(curvaEnMedio(vieja, nueva, 0.5).line, "M0.00,17.50L10.00,17.50");
});
