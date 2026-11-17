const { test } = require("node:test");
const assert = require("node:assert");
const { cargoEnDivisa, comisionReal, textoComisionReal } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

// Lo que vale 1 yen y 1 dólar en euros, del BCE. El sábado no hay: vale el viernes.
const tasas = {
  JPY: { "2026-11-02": 0.006, "2026-11-06": 0.0062 },
  USD: { "2026-11-02": 0.9 },
};
const mov = (fecha, concepto, importe) => ({ fecha, concepto, importe });

test("el importe de allí sale del concepto, en las formas de cada banco", () => {
  assert.deepEqual(cargoEnDivisa("COMPRA TARJ. 5402XXXX1234 LAWSON SHIBUYA 3.400,00 JPY"), { cantidad: 3400, divisa: "JPY" });
  assert.deepEqual(cargoEnDivisa("Compra Lawson Tokyo, Tarjeta 1234. Importe origen 45,00 USD"), { cantidad: 45, divisa: "USD" });
  // La tasa del concepto no es la compra.
  assert.deepEqual(cargoEnDivisa("LAWSON TOKYO JP 3400,00 JPY 1 EUR=162,1234 JPY"), { cantidad: 3400, divisa: "JPY" });
  assert.deepEqual(cargoEnDivisa("AMAZON.CO.UK GBP 25.99 tipo cambio 0,8512"), { cantidad: 25.99, divisa: "GBP" });
  assert.equal(cargoEnDivisa("MERCADONA VALENCIA"), null);
  assert.equal(cargoEnDivisa("TRANSFERENCIA A PEPE 50 EUR"), null);
});

test("lo cobrado contra lo justo, con las comisiones de otra línea", () => {
  const r = comisionReal([
    mov("2026-11-02", "LAWSON 10.000 JPY", 61.8), // justo 60
    mov("2026-11-07", "RAMEN 5.000 JPY", 31.93), // sábado: tasa del viernes, justo 31
    mov("2026-11-02", "DELI 100,00 USD", 91.8), // justo 90
    mov("2026-11-02", "COMISION COMPRA EXTRANJERO", 1.5),
    mov("2026-11-03", "MERCADONA", 40),
  ], tasas);
  assert.equal(r.n, 3);
  assert.ok(Math.abs(r.justo - 181) < 1e-9);
  assert.ok(Math.abs(r.pagado - 187.03) < 1e-9);
  assert.equal(r.pct, 3.3);
  assert.deepEqual(r.divisas, ["JPY", "USD"]);
});

test("lo que se aparta demasiado no cuenta, que será un concepto mal leído", () => {
  const r = comisionReal([mov("2026-11-02", "LAWSON 10.000 JPY", 61.2), mov("2026-11-02", "HOTEL 10.000 JPY", 300)], tasas);
  assert.equal(r.n, 1);
  assert.equal(r.pct, 2);
});

test("sin compras fuera o sin tasa, nada; las comisiones sueltas solas no cuentan", () => {
  assert.equal(comisionReal([mov("2026-11-02", "MERCADONA", 40), mov("2026-11-02", "COMISION MANTENIMIENTO", 3)], tasas), null);
  assert.equal(comisionReal([mov("2026-11-02", "TAXI 50 CHF", 54)], tasas), null);
  assert.equal(comisionReal(null, tasas), null);
});

test("los textos y si ya la tienes puesta", () => {
  ponerIdioma("es");
  const r = comisionReal([mov("2026-11-02", "LAWSON 10.000 JPY", 61.8)], tasas);
  assert.deepEqual(textoComisionReal(r, 0), {
    titulo: "Tu tarjeta te cobra un 3\u00a0% sobre el cambio del BCE",
    detalle: "Sale de 1 compra en otra divisa de este extracto: 1,80 EUR de más",
    igual: false,
  });
  assert.equal(textoComisionReal(r, 3).igual, true);
  assert.equal(textoComisionReal(null), null);
  ponerIdioma("en");
  assert.equal(textoComisionReal(r).titulo, "Your card charges you 3% over the ECB rate");
  ponerIdioma("es");
});
