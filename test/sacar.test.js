const { test } = require("node:test");
const assert = require("node:assert");
const { redondoDeCajero, cuantoSacar } = require("../logica.js");

const HOY = "2026-10-08";
// 1 JPY = 0,00625 EUR: 160 yenes el euro.
const TASA = 1 / 160;
const presupuesto = { importe: 1000, to: "EUR", desde: "2026-10-05", hasta: "2026-10-12" };
const gasto = (valor, pago) => ({ id: `${valor}${pago}`, from: "JPY", to: "EUR", cantidad: valor * 160, valor, concepto: "", cuando: 0, pago });
const retirada = (cantidad) => ({ id: `r${cantidad}`, cantidad, divisa: "JPY", cuando: 0 });

test("redondea hacia arriba a lo que da un cajero", () => {
  assert.equal(redondoDeCajero(11234), 12000);
  assert.equal(redondoDeCajero(12000), 12000);
  assert.equal(redondoDeCajero(87.4), 90);
  assert.equal(redondoDeCajero(1234567), 1300000);
  assert.equal(redondoDeCajero(7.2), 10);
});

test("sin gastos aún, cuenta todo lo que te queda al día", () => {
  // 1000 € en 5 días (del 8 al 12) son 200 al día: 1000 € son 160.000 yenes.
  const r = cuantoSacar(presupuesto, [], [], "JPY", TASA, HOY);
  assert.equal(r.sacar, 160000);
  assert.equal(r.dias, 5);
  assert.equal(r.parte, 1);
});

test("solo la parte que sueles pagar en efectivo", () => {
  // 100 € gastados, 25 en efectivo: quedan 900 €, un cuarto son 225 € = 36.000 JPY.
  const r = cuantoSacar(presupuesto, [gasto(75, "tarjeta"), gasto(25, "efectivo")], [], "JPY", TASA, HOY);
  assert.equal(r.parte, 0.25);
  assert.equal(r.sacar, 36000);
});

test("descuenta lo que aún llevas en la cartera", () => {
  const gastos = [gasto(75, "tarjeta"), gasto(25, "efectivo")];
  // Sacaste 10.000, pagaste 4.000 en efectivo: te quedan 6.000; faltan 30.000.
  const r = cuantoSacar(presupuesto, gastos, [retirada(10000)], "JPY", TASA, HOY);
  assert.equal(r.tienes, 6000);
  assert.equal(r.sacar, 30000);
  assert.equal(cuantoSacar(presupuesto, gastos, [retirada(50000)], "JPY", TASA, HOY).sacar, 0, "con lo que llevas te llega");
});

test("si todo va con tarjeta, o sin presupuesto, o pasado, no dice nada", () => {
  assert.equal(cuantoSacar(presupuesto, [gasto(100, "tarjeta")], [], "JPY", TASA, HOY), null);
  assert.equal(cuantoSacar(null, [], [], "JPY", TASA, HOY), null);
  assert.equal(cuantoSacar(presupuesto, [gasto(1200, "efectivo")], [], "JPY", TASA, HOY), null);
  assert.equal(cuantoSacar({ ...presupuesto, hasta: "2026-10-07" }, [], [], "JPY", TASA, HOY), null);
  assert.equal(cuantoSacar(presupuesto, [], [], "EUR", 1, HOY), null, "el cajero en tu propia divisa no");
  assert.equal(cuantoSacar(presupuesto, [], [], "JPY", null, HOY), null, "sin tasa aún");
});
