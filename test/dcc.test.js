const { test } = require("node:test");
const assert = require("node:assert");
const { leerCobro, analizarCobro, textoCobro } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const par = { from: "USD", to: "EUR" };
const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);

test("el de tu divisa es lo que te cobran, vaya delante o detrás", () => {
  assert.deepEqual(leerCobro("USD 249.99 = EUR 240.50", par), { cantidad: 249.99, from: "USD", cobrado: 240.5, to: "EUR" });
  assert.deepEqual(leerCobro("Pagar 240,50 € en vez de $249.99", par), { cantidad: 249.99, from: "USD", cobrado: 240.5, to: "EUR" });
});

test("si ninguno va en tu divisa, el segundo es el cobro", () => {
  assert.deepEqual(leerCobro("¥3,000 → £16.20", par), { cantidad: 3000, from: "JPY", cobrado: 16.2, to: "GBP" });
});

test("con uno, tres o la misma divisa dos veces, no es una pantalla de DCC", () => {
  assert.equal(leerCobro("$249.99", par), null);
  assert.equal(leerCobro("$10 + $20", par), null);
  assert.equal(leerCobro("$10, 9 € o £8", par), null);
});

test("cuánto te cobran de más sobre el cambio real", () => {
  // 100 USD a 0,90 son 90 EUR; te cobran 95.
  const r = analizarCobro({ cantidad: 100, from: "USD", cobrado: 95, to: "EUR" }, 0.9);
  cerca(r.extra, 5);
  cerca(r.sobrecoste, 5 / 90);
  assert.equal(r.veredicto, "caro");
  assert.equal(r.aceptar, false);
});

test("si tu tarjeta cobra más que la tienda, te vale aceptar", () => {
  const cobro = { cantidad: 100, from: "USD", cobrado: 91.5, to: "EUR" };
  assert.equal(analizarCobro(cobro, 0.9, 2).aceptar, true);
  assert.equal(analizarCobro(cobro, 0.9, 1).aceptar, false);
});

test("lo que se aparta demasiado no es un cambio", () => {
  assert.equal(analizarCobro({ cantidad: 20, from: "USD", cobrado: 10, to: "GBP" }, 0.79), null);
  assert.equal(analizarCobro(null, 0.9), null);
  assert.equal(analizarCobro({ cantidad: 100, from: "USD", cobrado: 90, to: "EUR" }, 0), null);
});

test("los textos según el caso", () => {
  ponerIdioma("es");
  const cobro = (cobrado) => ({ cantidad: 100, from: "USD", cobrado, to: "EUR" });
  assert.equal(textoCobro(analizarCobro(cobro(95), 0.9)), "Cobrándote en EUR pagas 5,00 EUR de más (+5,6 %). Mejor en USD");
  assert.equal(textoCobro(analizarCobro(cobro(90.5), 0.9)), "Cobrándote en EUR, casi al cambio real (+0,6 %)");
  assert.equal(textoCobro(analizarCobro(cobro(91.5), 0.9, 2)), "Cobrándote en EUR pagas 1,50 EUR de más (+1,7 %), menos que tu comisión del 2 %. Te vale");
  assert.equal(textoCobro(analizarCobro(cobro(89), 0.9)), "Cobrándote en EUR sale igual o mejor que el cambio real");
  assert.equal(textoCobro(analizarCobro(cobro(110), 0.9)), "Cobrándote en EUR pagas 20,00 EUR de más (+22 %). Mejor en USD");
  assert.equal(textoCobro(null), "");
  ponerIdioma("en");
  assert.equal(textoCobro(analizarCobro(cobro(95), 0.9)), "Charging you in EUR costs 5.00 EUR more (+5.6%). Better in USD");
  ponerIdioma("es");
});
