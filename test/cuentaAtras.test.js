const { test } = require("node:test");
const assert = require("node:assert");
const { cuentaAtras, textoCuentaAtras } = require("../logica.js");

const viaje = { importe: 1000, to: "EUR", desde: "2026-10-24", hasta: "2026-10-31" };

test("cuenta los días que faltan para salir", () => {
  assert.equal(cuentaAtras(viaje, "2026-10-12"), 12);
  assert.equal(cuentaAtras(viaje, "2026-10-23"), 1);
});

test("el mismo día o ya de viaje, no hay cuenta atrás", () => {
  assert.equal(cuentaAtras(viaje, "2026-10-24"), null);
  assert.equal(cuentaAtras(viaje, "2026-10-27"), null);
});

test("sin día de salida o sin presupuesto, tampoco", () => {
  assert.equal(cuentaAtras({ ...viaje, desde: undefined }, "2026-10-12"), null);
  assert.equal(cuentaAtras(null, "2026-10-12"), null);
});

test("cruza el cambio de hora sin perder un día", () => {
  assert.equal(cuentaAtras({ ...viaje, desde: "2026-11-02" }, "2026-10-20"), 13);
});

test("el texto", () => {
  assert.equal(textoCuentaAtras(12), "12 días");
  assert.equal(textoCuentaAtras(1), "Mañana");
  assert.equal(textoCuentaAtras(null), "");
});
