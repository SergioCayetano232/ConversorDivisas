const { test } = require("node:test");
const assert = require("node:assert");
const { leerSuperficie, convertirSuperficie, textoSuperficie, leerOmnibox, leerAltura } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoSuperficie(leerSuperficie(t));

test("lee las superficies como se escriben", () => {
  assert.deepEqual(leerSuperficie("800sqft"), { valor: 800, de: "sq ft" });
  assert.deepEqual(leerSuperficie("800 sq ft"), { valor: 800, de: "sq ft" });
  assert.deepEqual(leerSuperficie("800 sq. ft"), { valor: 800, de: "sq ft" });
  assert.deepEqual(leerSuperficie("800 ft²"), { valor: 800, de: "sq ft" });
  assert.deepEqual(leerSuperficie("800 square feet"), { valor: 800, de: "sq ft" });
  assert.deepEqual(leerSuperficie("800 pies cuadrados"), { valor: 800, de: "sq ft" });
  assert.deepEqual(leerSuperficie("75m2"), { valor: 75, de: "m²" });
  assert.deepEqual(leerSuperficie("75 m²"), { valor: 75, de: "m²" });
  assert.deepEqual(leerSuperficie("62,5 metros cuadrados"), { valor: 62.5, de: "m²" });
  assert.deepEqual(leerSuperficie("75 square meters"), { valor: 75, de: "m²" });
});

test("lo que no son superficies, no", () => {
  for (const t of ["sqft", "800", "6ft", "2m", "2 metros", "-5 m2", "", undefined]) assert.equal(leerSuperficie(t), null, String(t));
});

test("no pisa las alturas ni los millones", () => {
  assert.ok(leerAltura("6ft"));
  assert.ok(leerAltura("2 metros"));
  assert.equal(leerAltura("800 sq ft"), null);
  assert.ok(leerOmnibox("2m usd", { from: "EUR", to: "USD" }));
});

test("de pies cuadrados a m² y al revés", () => {
  cerca(convertirSuperficie({ valor: 1, de: "sq ft" }).valor, 0.09290304);
  cerca(convertirSuperficie({ valor: 0.09290304, de: "m²" }).valor, 1);
  assert.equal(convertirSuperficie({ valor: 1, de: "m²" }).a, "sq ft");
});

test("el texto: m² con un decimal, pies cuadrados sin ninguno", () => {
  assert.equal(texto("800sqft"), "800 sq ft = 74,3 m²");
  assert.equal(texto("75m2"), "75 m² = 807 sq ft");
  assert.equal(textoSuperficie(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("800sqft"), "800 sq ft = 74.3 m²");
    assert.equal(texto("1000 m2"), "1,000 m² = 10,764 sq ft");
  } finally {
    ponerIdioma("es");
  }
});
