const { test } = require("node:test");
const assert = require("node:assert");
const { leerPresupuesto, leerMarca, marcarPresupuesto, cambioDesdeMarca, textoCambioMarca } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const base = { importe: 1600, to: "EUR", desde: "2026-12-10", hasta: "2026-12-16" };
const marca = { dia: "2026-11-01", divisa: "JPY", tasa: 0.0060 };

test("los de antes, sin marca, se leen igual", () => {
  assert.deepEqual(leerPresupuesto(base), base);
  assert.equal(leerPresupuesto(base).marca, undefined);
});

test("la marca se guarda, y la rara se tira sin perder el presupuesto", () => {
  assert.deepEqual(leerPresupuesto({ ...base, marca }).marca, marca);
  for (const mal of [{ ...marca, tasa: 0 }, { ...marca, divisa: "EUR" }, { ...marca, divisa: "XXX" }, { ...marca, dia: "ayer" }, "JPY"]) {
    const leido = leerPresupuesto({ ...base, marca: mal });
    assert.equal(leido.marca, undefined, JSON.stringify(mal));
    assert.equal(leido.importe, 1600);
  }
  assert.equal(leerMarca(null, "EUR"), null);
});

test("al ponerlo se marca con la tasa de hoy", () => {
  assert.deepEqual(marcarPresupuesto(base, null, "JPY", 0.0060, "2026-11-01").marca, marca);
});

test("al editarlo se queda la de antes, salvo que cambies de destino", () => {
  const nuevo = { ...base, importe: 2000 };
  assert.deepEqual(marcarPresupuesto(nuevo, { ...base, marca }, "JPY", 0.0058, "2026-11-20").marca, marca);
  assert.deepEqual(marcarPresupuesto(nuevo, { ...base, marca }, "THB", 0.026, "2026-11-20").marca, { dia: "2026-11-20", divisa: "THB", tasa: 0.026 });
});

test("sin destino o sin tasa, sin marca", () => {
  assert.equal(marcarPresupuesto(base, null, null, 0.006).marca, undefined);
  assert.equal(marcarPresupuesto(base, null, "JPY", null).marca, undefined);
  assert.equal(marcarPresupuesto(base, null, "EUR", 1).marca, undefined);
  // Si cambias a uno sin destino, la vieja de otro sitio no se queda.
  assert.equal(marcarPresupuesto(base, { ...base, marca }, null, null).marca, undefined);
});

test("si el yen baja, tu presupuesto da más yenes", () => {
  const r = cambioDesdeMarca({ ...base, marca }, 0.0057, "2026-11-24");
  assert.ok(r.pct > 0);
  assert.ok(Math.abs(r.diferencia - (1600 / 0.0057 - 1600 / 0.0060)) < 1e-6);
  ponerIdioma("es");
  assert.equal(textoCambioMarca(r), "💱 +14.035 JPY desde el 1 nov");
  assert.equal(textoCambioMarca(r, { largo: true }), "Desde el 1 nov, cuando pusiste el presupuesto, te dan un 5,3 % más por lo tuyo: tus 1.600 EUR son 14.035 JPY más");
});

test("y si sube, menos", () => {
  const r = cambioDesdeMarca({ ...base, marca }, 0.0063, "2026-11-24");
  assert.ok(r.pct < 0 && r.diferencia < 0);
  assert.equal(textoCambioMarca(r), "💱 −12.698 JPY desde el 1 nov");
  assert.match(textoCambioMarca(r, { largo: true }), /un 4,8 % menos por lo tuyo: tus 1\.600 EUR son 12\.698 JPY menos$/);
  ponerIdioma("en");
  assert.equal(textoCambioMarca(r), "💱 −12,698 JPY since Nov 1");
  ponerIdioma("es");
});

test("un movimiento pequeño no se dice", () => {
  assert.equal(cambioDesdeMarca({ ...base, marca }, 0.00599, "2026-11-24"), null);
});

test("ni el mismo día, ni ya de viaje, ni sin marca", () => {
  assert.equal(cambioDesdeMarca({ ...base, marca }, 0.0057, "2026-11-01"), null);
  assert.equal(cambioDesdeMarca({ ...base, marca }, 0.0057, "2026-12-11"), null);
  assert.equal(cambioDesdeMarca(base, 0.0057, "2026-11-24"), null);
  assert.equal(cambioDesdeMarca({ ...base, marca }, null, "2026-11-24"), null);
});
