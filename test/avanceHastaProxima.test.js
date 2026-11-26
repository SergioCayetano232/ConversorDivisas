const { test } = require("node:test");
const assert = require("node:assert");
const { avanceHastaProxima } = require("../logica.js");

// La del martes 13 de octubre de 2026 sale a las 14:00 UTC (16:00 en Fráncfort)
// y la siguiente, la del miércoles, a la misma hora: 24 horas de camino.
const martes = (h) => Date.UTC(2026, 9, 13, h);

test("recién publicada, el anillo está vacío", () => {
  assert.equal(avanceHastaProxima("2026-10-13", martes(14)), 0);
});

test("a medio camino, por la mitad", () => {
  assert.equal(avanceHastaProxima("2026-10-13", martes(14) + 12 * 3600e3), 0.5);
});

test("el fin de semana alarga el camino: el viernes por la noche apenas ha empezado", () => {
  const viernes = Date.UTC(2026, 9, 9, 20);
  const avance = avanceHastaProxima("2026-10-09", viernes);
  // Del viernes a las 14:00 al lunes a las 14:00 son 72 horas; han pasado 6.
  assert.ok(Math.abs(avance - 6 / 72) < 1e-9);
});

test("sin fecha válida no hay anillo", () => {
  assert.equal(avanceHastaProxima("ayer", martes(14)), null);
});
