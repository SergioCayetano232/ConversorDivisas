const { test } = require("node:test");
const assert = require("node:assert");
const { crearGasto, leerGastos, repetirGasto, leerPago, comisionDelPago, csvGastos } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const gasto = (extra) => crearGasto({ id: "a", from: "USD", to: "EUR", cantidad: 10, valor: 9, cuando: 1, ...extra });

test("sin decir nada, o con algo raro, es con tarjeta", () => {
  assert.equal(gasto().pago, "tarjeta");
  assert.equal(gasto({ pago: "bizum" }).pago, "tarjeta");
  assert.equal(gasto({ pago: "efectivo" }).pago, "efectivo");
  assert.equal(leerPago(undefined), "tarjeta");
});

test("los gastos guardados antes de esto pasan a tarjeta", () => {
  const viejo = { id: "a", from: "USD", to: "EUR", cantidad: 10, valor: 9.18, cuando: 1, concepto: "", categoria: "otros" };
  assert.equal(leerGastos([viejo])[0].pago, "tarjeta");
  assert.equal(leerGastos([{ ...viejo, pago: "efectivo" }])[0].pago, "efectivo");
});

test("en efectivo no hay comisión", () => {
  assert.equal(comisionDelPago("efectivo", 2), 0);
  assert.equal(comisionDelPago("tarjeta", 2), 2);
});

test("repetir uno en efectivo no le suma la comisión, y sigue en efectivo", () => {
  const otro = repetirGasto(gasto({ pago: "efectivo" }), { id: "b", cuando: 2, tasa: 0.9, comision: 2 });
  assert.equal(otro.valor, 9);
  assert.equal(otro.pago, "efectivo");
  assert.equal(repetirGasto(gasto(), { id: "b", cuando: 2, tasa: 0.9, comision: 2 }).valor, 9.18);
});

test("el CSV dice cómo se pagó", () => {
  ponerIdioma("es");
  assert.match(csvGastos([gasto({ pago: "efectivo" })]).split("\r\n")[1], /;Efectivo;0,00$/);
  ponerIdioma("en");
  assert.match(csvGastos([gasto({ pago: "efectivo" })]).split("\r\n")[0], /,Paid with,Fee$/);
  ponerIdioma("es");
});
