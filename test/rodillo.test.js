const { test } = require("node:test");
const assert = require("node:assert");
const { rodillo, RODILLO_MAX } = require("../logica.js");

const ultimas = (columnas) => columnas.map((c) => c.signo ?? c.cifras.at(-1)).join("");

test("cada columna acaba en el dígito que está escrito", () => {
  assert.equal(ultimas(rodillo(12.5, 1234.56, "1.234,56")), "1.234,56");
  assert.equal(ultimas(rodillo(9, 0.07, "0,07")), "0,07");
});

test("los separadores no giran", () => {
  const columnas = rodillo(1000, 2000, "2.000,00");
  assert.deepEqual(columnas[1], { signo: "." });
  assert.deepEqual(columnas[5], { signo: "," });
});

test("lo que no cambia se queda quieto", () => {
  const columnas = rodillo(10.25, 10.29, "10,29");
  assert.deepEqual(columnas[0].cifras, [1]);
  assert.deepEqual(columnas[1].cifras, [0]);
  assert.deepEqual(columnas[3].cifras, [2]);
  assert.deepEqual(columnas[4].cifras, [5, 6, 7, 8, 9]);
});

test("al pasar de 9 vuelve por el 0 y arrastra a la de al lado", () => {
  const columnas = rodillo(0.98, 1.02, "1,02");
  assert.deepEqual(columnas[0].cifras, [0, 1]);
  assert.deepEqual(columnas[3].cifras, [8, 9, 0, 1, 2]);
});

test("hacia abajo gira al revés", () => {
  const columnas = rodillo(1.02, 0.98, "0,98");
  assert.deepEqual(columnas[0].cifras, [1, 0]);
  assert.deepEqual(columnas[3].cifras, [2, 1, 0, 9, 8]);
});

test("los céntimos no dan cien vueltas: se quedan en una y pico y acaban igual", () => {
  const columnas = rodillo(10, 45.37, "45,37");
  const centimos = columnas.at(-1).cifras;
  assert.ok(centimos.length - 1 <= RODILLO_MAX);
  assert.ok(centimos.length - 1 >= 10);
  assert.equal(centimos[0], 0);
  assert.equal(centimos.at(-1), 7);
  assert.deepEqual(columnas[0].cifras, [1, 2, 3, 4]);
});

test("una cifra que antes no estaba sale de vacío, y su punto de los miles con ella", () => {
  const columnas = rodillo(109.35, 1366.88, "1.366,88");
  assert.deepEqual(columnas[0].cifras, [null, 1]);
  assert.deepEqual(columnas[1], { signo: ".", nuevo: true });
  assert.equal(columnas[2].cifras[0], 1);
  assert.equal(ultimas(columnas), "1.366,88");
});

test("los ceros de delante de los céntimos ya estaban", () => {
  const columnas = rodillo(0.05, 0.5, "0,50");
  assert.deepEqual(columnas[0].cifras, [0]);
  assert.deepEqual(rodillo(99, 100, "100,00")[0].cifras, [null, 1]);
});
