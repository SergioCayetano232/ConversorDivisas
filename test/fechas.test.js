const { test } = require("node:test");
const assert = require("node:assert");
const { isoLocal, hoy, isFresh, startDateFor } = require("../logica.js");

test("da el día local, no el de UTC", () => {
  // El fallo original: toISOString pasa a UTC, así que de madrugada en España
  // devolvía el día anterior y el histórico pedía un día de más.
  const medianoche = new Date();
  medianoche.setHours(0, 30, 0, 0);
  assert.equal(isoLocal(medianoche), medianoche.toLocaleDateString("sv-SE"));
});

test("rellena mes y día con cero", () => {
  assert.equal(isoLocal(new Date(2026, 0, 5)), "2026-01-05");
  assert.equal(isoLocal(new Date(2026, 11, 31)), "2026-12-31");
});

test("una entrada de hoy está fresca", () => {
  assert.equal(isFresh({ day: hoy() }), true);
});

test("una entrada vieja o rota no lo está", () => {
  assert.equal(isFresh({ day: "2020-01-01" }), false);
  assert.equal(isFresh({ rate: 1 }), false);
  assert.equal(isFresh(undefined), false);
  assert.equal(isFresh(null), false);
});

test("startDateFor cuenta hacia atrás en formato ISO", () => {
  for (const dias of [7, 30, 90]) {
    const esperado = new Date();
    esperado.setDate(esperado.getDate() - dias);
    assert.equal(startDateFor(dias), isoLocal(esperado));
    assert.match(startDateFor(dias), /^\d{4}-\d{2}-\d{2}$/);
  }
});
