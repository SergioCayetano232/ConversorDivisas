const { test } = require("node:test");
const assert = require("node:assert");
const { cambioDelViaje, cifraCambio, textoCambio } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const gasto = (from, cantidad, valor, to = "EUR") => ({ id: `${from}${cantidad}`, from, to, cantidad, valor, concepto: "", cuando: 1, categoria: "otros", pago: "tarjeta", comision: 0 });

test("lo pagado allí entre lo que costó aquí, comisión incluida", () => {
  const c = cambioDelViaje([gasto("JPY", 10000, 60), gasto("JPY", 5000, 30.6)]);
  assert.equal(c.from, "JPY");
  assert.equal(c.to, "EUR");
  assert.equal(c.n, 2);
  assert.ok(Math.abs(c.tasa - 90.6 / 15000) < 1e-12);
});

test("solo el par que más pesa", () => {
  const c = cambioDelViaje([gasto("JPY", 10000, 60), gasto("JPY", 5000, 30), gasto("KRW", 50000, 33), gasto("KRW", 1000, 1)]);
  assert.equal(c.from, "JPY");
});

test("con un gasto solo, o sin gastos, no dice nada", () => {
  assert.equal(cambioDelViaje([]), null);
  assert.equal(cambioDelViaje([gasto("JPY", 10000, 60)]), null);
});

test("los de otra divisa de destino no se mezclan", () => {
  const c = cambioDelViaje([gasto("JPY", 10000, 60), gasto("JPY", 5000, 30), gasto("JPY", 1000, 7, "USD")]);
  assert.equal(c.n, 2);
});

test("se escribe del lado que da más de uno", () => {
  ponerIdioma("es");
  assert.equal(textoCambio(0.006, "JPY", "EUR"), "1 EUR = 166,7 JPY");
  assert.equal(textoCambio(1.0845, "EUR", "USD"), "1 EUR = 1,085 USD");
  assert.equal(textoCambio(0.9, "USD", "EUR"), "1 EUR = 1,111 USD");
  assert.equal(textoCambio(0.0000575, "IDR", "EUR"), "1 EUR = 17.391 IDR");
  assert.equal(textoCambio(null, "IDR", "EUR"), "");
});

test("la cifra suelta, para donde no cabe la frase entera", () => {
  ponerIdioma("es");
  assert.deepEqual(cifraCambio(0.006, "JPY", "EUR"), { uno: "EUR", cifra: "166,7", otra: "JPY" });
  assert.deepEqual(cifraCambio(1.0845, "EUR", "USD"), { uno: "EUR", cifra: "1,085", otra: "USD" });
  assert.equal(cifraCambio(0, "EUR", "USD"), null);
});
