const { test } = require("node:test");
const assert = require("node:assert");
const { exposicionPendientes, textoExposicion, crearPendiente } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const pendiente = (id, cantidad, valor, from = "JPY", to = "EUR") =>
  crearPendiente({ id, from, to, cantidad, valor, concepto: "Hotel", cuando: Date.UTC(2026, 9, 1) });
const lista = [pendiente("a", 60000, 360), pendiente("b", 40000, 240), pendiente("c", 50, 50, "USD")];
const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);

test("lo pendiente del par a la tasa de hoy, y cuánto ha cambiado", () => {
  const r = exposicionPendientes(lista, { from: "JPY", to: "EUR", rate: 0.0062 });
  assert.equal(r.cantidad, 100000);
  assert.equal(r.apuntado, 600);
  cerca(r.hoy, 620);
  cerca(r.diferencia, 20);
  assert.equal(r.baila, null);
});

test("con el ± del gráfico, cuánto puede bailar en un mes", () => {
  cerca(exposicionPendientes(lista, { from: "JPY", to: "EUR", rate: 0.006, pct: 0.025 }).baila, 15);
});

test("sin pendientes de ese par, con la misma divisa o sin tasa, nada", () => {
  assert.equal(exposicionPendientes(lista, { from: "GBP", to: "EUR", rate: 1.2 }), null);
  assert.equal(exposicionPendientes(lista, { from: "EUR", to: "EUR", rate: 1 }), null);
  assert.equal(exposicionPendientes(lista, { from: "JPY", to: "EUR", rate: 0 }), null);
  assert.equal(exposicionPendientes(undefined, { from: "JPY", to: "EUR", rate: 0.006 }), null);
});

test("los textos", () => {
  ponerIdioma("es");
  assert.deepEqual(textoExposicion(exposicionPendientes(lista, { from: "JPY", to: "EUR", rate: 0.0062, pct: 0.025 })), {
    hoy: "A la tasa de hoy son 620,00\u00a0EUR: 20,00 más que al apuntarlo",
    baila: "Si el JPY se mueve como suele, en un mes ±15,50\u00a0EUR. Pagarlo o cambiarlo ya lo deja fijo",
  });
  assert.equal(textoExposicion(exposicionPendientes(lista, { from: "JPY", to: "EUR", rate: 0.0059 })).hoy, "A la tasa de hoy son 590,00\u00a0EUR: 10,00 menos que al apuntarlo");
  assert.deepEqual(textoExposicion(exposicionPendientes(lista, { from: "JPY", to: "EUR", rate: 0.006 })), { hoy: "A la tasa de hoy son 600,00\u00a0EUR, lo mismo que al apuntarlo", baila: "" });
  assert.equal(textoExposicion(null), null);
  ponerIdioma("en");
  assert.equal(textoExposicion(exposicionPendientes(lista, { from: "JPY", to: "EUR", rate: 0.0062 })).hoy, "At today's rate it's 620.00\u00a0EUR: 20.00 more than when you added it");
  ponerIdioma("es");
});
