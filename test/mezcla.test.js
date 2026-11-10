const { test } = require("node:test");
const assert = require("node:assert");
const { leerMezcla, textoMezcla } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const par = { from: "JPY", to: "EUR" };

test("cada trozo con su divisa, y todo en la de abajo", () => {
  assert.deepEqual(leerMezcla("20 usd + 15 gbp", par), { partes: [{ cantidad: 20, divisa: "USD" }, { cantidad: 15, divisa: "GBP" }], to: "EUR" });
  assert.deepEqual(leerMezcla("$20 + £15 + 1000 jpy", par).partes.map((p) => p.divisa), ["USD", "GBP", "JPY"]);
  assert.equal(leerMezcla("20 mil jpy + 5 €", par).partes[0].cantidad, 20000);
});

test("o en la que digas al final", () => {
  assert.equal(leerMezcla("20 usd + 15 gbp a chf", par).to, "CHF");
  assert.equal(leerMezcla("20 usd + 15 gbp to usd", par).to, "USD");
  assert.equal(leerMezcla("20 usd + 15 gbp a xyz", par), null);
});

test("si a un trozo le falta la divisa, o lleva dos, no me lo invento", () => {
  for (const t of ["20 usd + 15", "20+15 usd", "20 usd gbp + 15 eur", "20 usd", "+ 20 cena", "", undefined]) assert.equal(leerMezcla(t, par), null, String(t));
});

test("el total, con lo que vale cada parte", () => {
  ponerIdioma("es");
  // Las tasas van desde el euro: 1 EUR = 1,12 USD = 0,85 GBP.
  const r = textoMezcla(leerMezcla("20 usd + 15 gbp + 10 eur", par), { USD: 1.12, GBP: 0.85 });
  assert.deepEqual(r, { principal: "20,00 USD + 15,00 GBP + 10,00 EUR = 45,51 EUR", detalle: "17,86 + 17,65 + 10,00 EUR" });
});

test("sin la tasa de alguna, nada", () => {
  assert.equal(textoMezcla(leerMezcla("20 usd + 15 gbp", par), { USD: 1.12 }), null);
  assert.equal(textoMezcla(leerMezcla("20 usd + 15 gbp", par), null), null);
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(textoMezcla(leerMezcla("20 usd + 15 gbp", par), { USD: 1.12, GBP: 0.85 }).principal, "20.00 USD + 15.00 GBP = 35.51 EUR");
  ponerIdioma("es");
});
