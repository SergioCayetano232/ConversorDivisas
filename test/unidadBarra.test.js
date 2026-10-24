const { test } = require("node:test");
const assert = require("node:assert");
const { leerOmnibox, precioUnidadBarra } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const par = { from: "EUR", to: "USD" };

test("la unidad, pegada a la divisa o al número", () => {
  assert.deepEqual(leerOmnibox("3,50 usd/gal", par), { cantidad: 3.5, from: "USD", to: "EUR", unidad: "gal" });
  assert.deepEqual(leerOmnibox("3,50/gal usd", par), { cantidad: 3.5, from: "USD", to: "EUR", unidad: "gal" });
  assert.deepEqual(leerOmnibox("$3,99/lb", par), { cantidad: 3.99, from: "USD", to: "EUR", unidad: "lb" });
  assert.deepEqual(leerOmnibox("1,99 usd per fl oz", par), { cantidad: 1.99, from: "USD", to: "EUR", unidad: "floz" });
});

test("sin unidad, como siempre", () => {
  assert.deepEqual(leerOmnibox("20 usd", par), { cantidad: 20, from: "USD", to: "EUR" });
  assert.deepEqual(leerOmnibox("50 eur a gbp", par), { cantidad: 50, from: "EUR", to: "GBP" });
  assert.deepEqual(leerOmnibox("100-15% jpy", par), { cantidad: 85, from: "JPY", to: "USD" });
  assert.equal(leerOmnibox("gal", par), null);
  // Sin barra, las libras son esterlinas.
  assert.deepEqual(leerOmnibox("20 libras", par), { cantidad: 20, from: "GBP", to: "USD" });
  assert.deepEqual(leerOmnibox("20 lb", par).unidad, undefined);
});

test("el galón en litros y la libra en kilos", () => {
  assert.deepEqual(precioUnidadBarra({ cantidad: 3.5, from: "USD", to: "EUR", unidad: "gal" }, 0.86),
    { principal: "3,50 USD/gal = 0,80 EUR/l", detalle: "3,01 EUR/gal" });
  assert.deepEqual(precioUnidadBarra({ cantidad: 3.99, from: "USD", to: "EUR", unidad: "lb" }, 0.86),
    { principal: "3,99 USD/lb = 7,56 EUR/kg", detalle: "3,43 EUR/lb" });
  assert.equal(precioUnidadBarra({ cantidad: 1.99, from: "USD", to: "EUR", unidad: "floz" }, 1).principal, "1,99 USD/fl oz = 67,29 EUR/l");
});

test("sin unidad no hay nada que decir", () => {
  assert.equal(precioUnidadBarra({ cantidad: 20, from: "USD", to: "EUR" }, 0.86), null);
});

test("en inglés", () => {
  ponerIdioma("en");
  try {
    assert.equal(precioUnidadBarra({ cantidad: 3.5, from: "USD", to: "EUR", unidad: "gal" }, 0.86).principal, "3.50 USD/gal = 0.80 EUR/l");
  } finally {
    ponerIdioma("es");
  }
});
