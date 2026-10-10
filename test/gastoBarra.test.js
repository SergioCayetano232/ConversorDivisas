const { test } = require("node:test");
const assert = require("node:assert");
const { leerGastoBarra, gastoDeBarra } = require("../logica.js");

const par = { from: "JPY", to: "EUR" };
const base = { id: "x", cuando: 0, tasa: 0.006, comision: 2, pago: "tarjeta" };

test("sin el + delante no es un gasto", () => {
  assert.equal(leerGastoBarra("20 cena", par), null);
  assert.equal(leerGastoBarra("+ cena", par), null, "sin cantidad tampoco");
});

test("cantidad, divisa y concepto", () => {
  assert.deepEqual(leerGastoBarra("+ 1500 cena", par), { cantidad: 1500, from: "JPY", to: "EUR", concepto: "cena", pago: null });
  assert.deepEqual(leerGastoBarra("+1.500 jpy taxi al hotel", par), { cantidad: 1500, from: "JPY", to: "EUR", concepto: "taxi al hotel", pago: null });
  const dolares = leerGastoBarra("+ $20 museo", par);
  assert.equal(dolares.from, "USD");
  assert.equal(dolares.concepto, "museo");
  assert.equal(leerGastoBarra("+ 20 usd a gbp cena", par).to, "GBP");
});

test("las cuentas valen como arriba", () => {
  assert.equal(leerGastoBarra("+ 2k cena", par).cantidad, 2000);
  assert.equal(leerGastoBarra("+ 3*400 metro", par).cantidad, 1200);
});

test("efectivo o tarjeta se leen y no van al concepto", () => {
  const r = leerGastoBarra("+ 800 ramen efectivo", par);
  assert.equal(r.pago, "efectivo");
  assert.equal(r.concepto, "ramen");
  assert.equal(leerGastoBarra("+ 20 card dinner", par).pago, "tarjeta");
});

test("el gasto lleva tasa, comisión y categoría", () => {
  const g = gastoDeBarra(leerGastoBarra("+ 1000 taxi", par), base);
  assert.equal(g.valor, 6.12, "1000 × 0,006 con el 2 %");
  assert.equal(g.comision, 2);
  assert.equal(g.categoria, "transporte");
  const efectivo = gastoDeBarra(leerGastoBarra("+ 1000 taxi efectivo", par), base);
  assert.equal(efectivo.valor, 6, "en efectivo sin comisión");
  assert.equal(efectivo.pago, "efectivo");
});

test("un concepto ya usado se queda con su categoría y cómo lo escribiste", () => {
  const usados = [{ concepto: "Café", categoria: "comida" }, { concepto: "Onsen", categoria: "ocio" }];
  const g = gastoDeBarra(leerGastoBarra("+ 500 onsen", par), { ...base, usados });
  assert.equal(g.concepto, "Onsen");
  assert.equal(g.categoria, "ocio");
  assert.equal(gastoDeBarra(leerGastoBarra("+ 500 cosa rara", par), base).categoria, "otros");
});

test("sin tasa no se apunta", () => {
  assert.equal(gastoDeBarra(leerGastoBarra("+ 500 cena", par), { ...base, tasa: null }), null);
});
