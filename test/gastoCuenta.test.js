const { test } = require("node:test");
const assert = require("node:assert");
const { repartirCuenta, gastoDeLaCuenta } = require("../logica.js");

const base = { id: "a1", from: "JPY", to: "EUR", rate: 0.006, cuando: 1, concepto: "Cuenta, entre 3" };

test("apunta tu parte con la propina, no la cuenta entera", () => {
  const r = repartirCuenta(9000, 0.006, { propina: 10, personas: 3 });
  const g = gastoDeLaCuenta(r, { ...base, pago: "tarjeta", comision: 0 });
  assert.equal(g.cantidad, 3300);
  assert.equal(g.valor, 19.8);
  assert.equal(g.categoria, "comida");
  assert.equal(g.concepto, "Cuenta, entre 3");
});

test("con tarjeta lleva la comisión y en efectivo no", () => {
  const r = repartirCuenta(10000, 0.006, { propina: 0, personas: 2 });
  const tarjeta = gastoDeLaCuenta(r, { ...base, pago: "tarjeta", comision: 2 });
  assert.equal(tarjeta.valor, 30.6);
  assert.equal(tarjeta.comision, 2);
  const efectivo = gastoDeLaCuenta(r, { ...base, pago: "efectivo", comision: 2 });
  assert.equal(efectivo.valor, 30);
  assert.equal(efectivo.comision, 0);
  assert.equal(efectivo.pago, "efectivo");
});

test("solo, la cuenta entera con su propina", () => {
  const r = repartirCuenta(40, 1.1, { propina: 15, personas: 1 });
  const g = gastoDeLaCuenta(r, { ...base, from: "EUR", to: "USD", rate: 1.1, pago: "tarjeta", comision: 0 });
  assert.equal(g.cantidad, 46);
  assert.equal(g.valor, 50.6);
});

test("redondeando, lo que pagas de verdad", () => {
  const r = repartirCuenta(100, 1.1, { propina: 0, personas: 3, redondear: true });
  const g = gastoDeLaCuenta(r, { ...base, from: "USD", to: "EUR", rate: 1.1, pago: "tarjeta", comision: 0 });
  assert.equal(g.cantidad, 34);
});

test("sin cuenta, sin tasa o con la misma divisa no apunta nada", () => {
  const r = repartirCuenta(50, 1.1, { propina: 0, personas: 2 });
  assert.equal(gastoDeLaCuenta(null, { ...base, pago: "tarjeta", comision: 0 }), null);
  assert.equal(gastoDeLaCuenta(r, { ...base, rate: null, pago: "tarjeta", comision: 0 }), null);
  assert.equal(gastoDeLaCuenta(r, { ...base, to: "JPY", pago: "tarjeta", comision: 0 }), null);
});
