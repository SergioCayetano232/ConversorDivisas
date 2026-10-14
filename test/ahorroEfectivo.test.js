const { test } = require("node:test");
const assert = require("node:assert");
const { ahorroEnEfectivo } = require("../logica.js");

const g = (valor, pago, to = "EUR") => ({ id: String(valor), from: "JPY", to, cantidad: valor * 160, valor, concepto: "", cuando: 0, pago, comision: 0 });

test("100 en efectivo con un 3 % son 3 que no se ha llevado el banco", () => {
  assert.deepEqual(ahorroEnEfectivo([g(60, "efectivo"), g(40, "efectivo"), g(500, "tarjeta")], 3), { total: 3, to: "EUR" });
});

test("sin comisión puesta no hay ahorro", () => {
  assert.equal(ahorroEnEfectivo([g(60, "efectivo")], 0), null);
  assert.equal(ahorroEnEfectivo([g(60, "efectivo")], undefined), null);
});

test("sin nada en efectivo, tampoco", () => {
  assert.equal(ahorroEnEfectivo([g(60, "tarjeta")], 3), null);
  assert.equal(ahorroEnEfectivo([], 3), null);
});

test("solo cuenta la divisa que más suma, como el total", () => {
  const r = ahorroEnEfectivo([g(500, "tarjeta"), g(10, "efectivo"), g(80, "efectivo", "USD")], 2);
  assert.deepEqual(r, { total: 0.2, to: "EUR" });
});

test("menos de medio céntimo no lo enseño", () => {
  assert.equal(ahorroEnEfectivo([g(0.1, "efectivo")], 1), null);
});
