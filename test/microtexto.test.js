const { test } = require("node:test");
const assert = require("node:assert");
const { microtexto, MICROTEXTO_LARGO } = require("../logica.js");

test("lleva el par y el nombre, repetidos", () => {
  const texto = microtexto("EUR", "JPY");
  assert.ok(texto.startsWith("EUR · JPY · CONVERSORDIVISAS · EUR · JPY"));
});

test("mide siempre lo mismo, sea cual sea el par", () => {
  assert.equal(microtexto("EUR", "JPY").length, MICROTEXTO_LARGO);
  assert.equal(microtexto("USD", "MXN", 40).length, 40);
});

test("sin par no hay línea", () => {
  assert.equal(microtexto("", "JPY"), "");
  assert.equal(microtexto("EUR", "JPY", 0), "");
});
