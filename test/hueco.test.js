const { test } = require("node:test");
const assert = require("node:assert");
const { huecoEntre } = require("../logica.js");

test("los días sin nada entre dos con gastos", () => {
  assert.deepEqual(huecoEntre("2026-10-15", "2026-10-12"), { dias: 2, desde: "2026-10-13", hasta: "2026-10-14" });
  assert.deepEqual(huecoEntre("2026-10-15", "2026-10-13"), { dias: 1, desde: "2026-10-14", hasta: "2026-10-14" });
});

test("días seguidos no tienen hueco", () => {
  assert.equal(huecoEntre("2026-10-15", "2026-10-14"), null);
  assert.equal(huecoEntre("2026-10-15", "2026-10-15"), null);
});

test("cruzando de mes y de año", () => {
  assert.deepEqual(huecoEntre("2026-11-02", "2026-10-30"), { dias: 2, desde: "2026-10-31", hasta: "2026-11-01" });
  assert.deepEqual(huecoEntre("2027-01-01", "2026-12-30"), { dias: 1, desde: "2026-12-31", hasta: "2026-12-31" });
});

test("el día del cambio de hora cuenta como uno más", () => {
  assert.deepEqual(huecoEntre("2026-10-27", "2026-10-24"), { dias: 2, desde: "2026-10-25", hasta: "2026-10-26" });
});
