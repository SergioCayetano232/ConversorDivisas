const { test } = require("node:test");
const assert = require("node:assert");
const { semanaDe, trazoMini } = require("../logica.js");

// Como llega de la API, y desordenado a propósito: un objeto no promete orden.
const rates = {
  "2026-10-02": { GBP: 0.88, JPY: 160 },
  "2026-09-28": { GBP: 0.8, JPY: 160 },
  "2026-09-30": { GBP: 0.84, JPY: 160 },
};

test("la semana de una divisa va por fechas y dice cuánto se ha movido", () => {
  const gbp = semanaDe(rates, "GBP");
  assert.deepEqual(gbp.valores, [0.8, 0.84, 0.88]);
  assert.ok(Math.abs(gbp.cambio - 0.1) < 1e-9);
  assert.equal(gbp.sentido, "sube");
});

test("si no se ha movido, igual", () => {
  const jpy = semanaDe(rates, "JPY");
  assert.equal(jpy.cambio, 0);
  assert.equal(jpy.sentido, "igual");
});

test("si baja, baja", () => {
  assert.equal(semanaDe({ a: { USD: 1.2 }, b: { USD: 1.1 } }, "USD").sentido, "baja");
});

test("sin dos días con dato no hay semana", () => {
  assert.equal(semanaDe(rates, "CHF"), null);
  assert.equal(semanaDe({ "2026-10-02": { GBP: 0.88 } }, "GBP"), null);
  assert.equal(semanaDe(null, "GBP"), null);
  assert.equal(semanaDe({ a: { GBP: "0.8" }, b: { GBP: 0 }, c: { GBP: 0.9 } }, "GBP"), null);
});

test("el minigráfico ocupa la caja de lado a lado, con aire arriba y abajo", () => {
  const { linea, area } = trazoMini([1, 2, 3]);
  assert.equal(linea, "M0.00,17.00L50.00,10.00L100.00,3.00");
  assert.equal(area, "M0.00,17.00L50.00,10.00L100.00,3.00L100,20L0,20Z");
});

test("una divisa quieta es una línea por el medio", () => {
  assert.equal(trazoMini([5, 5]).linea, "M0.00,10.00L100.00,10.00");
});
