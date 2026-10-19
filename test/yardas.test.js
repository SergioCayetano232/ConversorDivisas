const { test } = require("node:test");
const assert = require("node:assert");
const { leerYardas, convertirYardas, textoYardas, leerAltura, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoYardas(leerYardas(t));

test("lee las yardas como se escriben", () => {
  assert.deepEqual(leerYardas("100yd"), { valor: 100, de: "yd" });
  assert.deepEqual(leerYardas("100 yds"), { valor: 100, de: "yd" });
  assert.deepEqual(leerYardas("1 yard"), { valor: 1, de: "yd" });
  assert.deepEqual(leerYardas("2,5 yardas"), { valor: 2.5, de: "yd" });
});

test("lo que no son yardas, no", () => {
  for (const t of ["yd", "100", "-5 yd", "100 metros", "100m", "", undefined]) assert.equal(leerYardas(t), null, String(t));
});

test("los metros siguen siendo alturas y los millones, millones", () => {
  assert.ok(leerAltura("100 metros"));
  assert.ok(leerOmnibox("100m usd", { from: "EUR", to: "USD" }));
});

test("de yardas a metros", () => {
  cerca(convertirYardas({ valor: 1, de: "yd" }).valor, 0.9144);
  assert.equal(convertirYardas({ valor: 1, de: "yd" }).a, "m");
});

test("el texto, con un decimal", () => {
  assert.equal(texto("100yd"), "100 yd = 91,4 m");
  assert.equal(textoYardas(null), "");
  ponerIdioma("en");
  try {
    assert.equal(texto("2,5 yards"), "2.5 yd = 2.3 m");
  } finally {
    ponerIdioma("es");
  }
});
