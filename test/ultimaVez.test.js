const { test } = require("node:test");
const assert = require("node:assert");
const { desdeLaUltimaVez, ultimoVisto } = require("../logica.js");

const serie = [
  { fecha: "2026-10-08", valor: 1.1 },
  { fecha: "2026-10-09", valor: 1.11 },
  { fecha: "2026-10-12", valor: 1.12 },
  { fecha: "2026-10-13", valor: 1.122 },
];
const visto = (fecha, valor, par = "EUR-USD") => ({ par, fecha, valor });

test("desde el jueves ha subido un 1 %", () => {
  const r = desdeLaUltimaVez(visto("2026-10-08", 1.1), serie, "EUR-USD");
  assert.equal(r.sentido, "sube");
  assert.equal(r.desde, "2026-10-08");
  assert.ok(Math.abs(r.cambio - 0.02) < 1e-9);
});

test("si lo viste el día de antes, ya lo dice la pastilla", () => {
  assert.equal(desdeLaUltimaVez(visto("2026-10-12", 1.0), serie, "EUR-USD"), null);
  assert.equal(desdeLaUltimaVez(visto("2026-10-13", 1.0), serie, "EUR-USD"), null);
});

test("por debajo de un 0,1 % no digo nada", () => {
  assert.equal(desdeLaUltimaVez(visto("2026-10-08", 1.1215), serie, "EUR-USD"), null);
});

test("al revés, lo que sube el euro lo baja el dólar", () => {
  assert.equal(desdeLaUltimaVez(visto("2026-10-08", 1.1), serie, "EUR-USD", true).sentido, "baja");
});

test("si era otro par, o no hay nada guardado, nada", () => {
  assert.equal(desdeLaUltimaVez(visto("2026-10-08", 1.1, "EUR-GBP"), serie, "EUR-USD"), null);
  assert.equal(desdeLaUltimaVez(null, serie, "EUR-USD"), null);
  assert.equal(desdeLaUltimaVez(visto("2026-10-08", 1.1), [], "EUR-USD"), null);
});

test("lo que se guarda es el último punto de la serie", () => {
  assert.deepEqual(ultimoVisto(serie, "EUR-USD"), visto("2026-10-13", 1.122));
  assert.equal(ultimoVisto([], "EUR-USD"), null);
});
