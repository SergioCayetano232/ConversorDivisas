const { test } = require("node:test");
const assert = require("node:assert");
const { billeteTarjeta, rosetaBillete, MICROTEXTO_TARJETA } = require("../logica.js");

test("la misma roseta que el resultado del popup", () => {
  assert.deepEqual(billeteTarjeta("EUR", "JPY").trazos, rosetaBillete("JPY").trazos);
});

test("el símbolo de la divisa a la que conviertes", () => {
  assert.equal(billeteTarjeta("EUR", "JPY").simbolo, "¥");
});

test("el microtexto con el par, a la medida de la tarjeta", () => {
  const { micro } = billeteTarjeta("USD", "EUR");
  assert.ok(micro.startsWith("USD · EUR · "));
  assert.equal(micro.length, MICROTEXTO_TARJETA);
});

test("sin divisa válida no hay billete", () => {
  assert.equal(billeteTarjeta("EUR", "xx"), null);
  assert.equal(billeteTarjeta("", "EUR"), null);
});
