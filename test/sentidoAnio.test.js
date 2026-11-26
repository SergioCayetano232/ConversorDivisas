const { test } = require("node:test");
const assert = require("node:assert");
const { sentidoAnio } = require("../logica.js");

test("a un año posterior va hacia delante", () => {
  assert.equal(sentidoAnio(2025, 2026), 1);
});

test("a uno anterior, hacia atrás", () => {
  assert.equal(sentidoAnio(2026, 2023), -1);
});

test("el mismo año o sin año, quieto", () => {
  assert.equal(sentidoAnio(2026, 2026), 0);
  assert.equal(sentidoAnio(null, 2026), 0);
});
