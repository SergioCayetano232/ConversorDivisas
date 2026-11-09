const { test } = require("node:test");
const assert = require("node:assert");
const { gastoDeTarjeta } = require("../logica.js");

const par = { from: "JPY", to: "EUR" };
const base = { id: "x", cuando: 0, tasa: 0.006, comision: 2, pago: "efectivo" };
const precio = (extra) => ({ cantidad: 1000, from: "JPY", to: "EUR", concepto: "", ...extra });

test("un precio de allí va a la tasa de hoy y con la comisión", () => {
  const g = gastoDeTarjeta(precio(), par, base);
  assert.equal(g.from, "JPY");
  assert.equal(g.to, "EUR");
  assert.equal(g.cantidad, 1000);
  assert.equal(g.valor, 6.12, "1000 × 0,006 con el 2 %");
  assert.equal(g.comision, 2);
});

test("siempre con tarjeta, aunque lo normal sea el efectivo", () => {
  assert.equal(gastoDeTarjeta(precio(), par, base).pago, "tarjeta");
});

test("el concepto da la categoría, y sin concepto va a otros", () => {
  assert.equal(gastoDeTarjeta(precio({ concepto: "taxi" }), par, base).categoria, "transporte");
  const sin = gastoDeTarjeta(precio(), par, base);
  assert.equal(sin.concepto, "");
  assert.equal(sin.categoria, "otros");
});

test("el concepto ya usado se queda con su categoría", () => {
  const usados = [{ concepto: "Museo", categoria: "compras" }];
  const g = gastoDeTarjeta(precio({ concepto: "museo" }), par, { ...base, usados });
  assert.equal(g.concepto, "Museo");
  assert.equal(g.categoria, "compras");
});

test("un precio en otra divisa entra con la suya", () => {
  const g = gastoDeTarjeta(precio({ cantidad: 50, from: "USD" }), par, { ...base, tasa: 0.9 });
  assert.equal(g.from, "USD");
  assert.equal(g.to, "EUR");
  assert.equal(g.valor, 45.9);
});

test("si ya viene en tu divisa, tu importe exacto y sin comisión", () => {
  const g = gastoDeTarjeta(precio({ cantidad: 100, from: "EUR", to: "JPY" }), par, { ...base, tasa: 162.37 });
  assert.equal(g.from, "JPY", "el gasto sigue siendo del viaje, no en yenes de destino");
  assert.equal(g.to, "EUR");
  assert.equal(g.cantidad, 16237);
  assert.equal(g.valor, 100);
  assert.equal(g.comision, 0);
});

test("la vuelta no pierde céntimos con tasas feas", () => {
  for (const cantidad of [0.07, 19.99, 333.33, 1049.95]) {
    const g = gastoDeTarjeta(precio({ cantidad, from: "EUR", to: "GBP" }), { from: "GBP", to: "EUR" }, { ...base, tasa: 0.8571 });
    assert.equal(g.valor, cantidad);
  }
});

test("lo que no se puede apuntar da null", () => {
  assert.equal(gastoDeTarjeta(precio({ cantidad: 0 }), par, base), null);
  assert.equal(gastoDeTarjeta(precio({ cantidad: -5 }), par, base), null);
  assert.equal(gastoDeTarjeta(precio({ cantidad: "mil" }), par, base), null);
  assert.equal(gastoDeTarjeta(precio({ from: "XXX" }), par, base), null);
  assert.equal(gastoDeTarjeta(precio(), par, { ...base, tasa: 0 }), null);
  assert.equal(gastoDeTarjeta(precio({ from: "EUR", to: "EUR" }), par, { ...base, tasa: 1 }), null);
});
