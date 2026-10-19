const { test } = require("node:test");
const assert = require("node:assert");
const { leerTazas, convertirTazas, textoTazas, leerVolumen, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoTazas(leerTazas(t));

test("lee las tazas y los ml como se escriben", () => {
  assert.deepEqual(leerTazas("2cups"), { valor: 2, de: "cups" });
  assert.deepEqual(leerTazas("1 cup"), { valor: 1, de: "cups" });
  assert.deepEqual(leerTazas("1,5 tazas"), { valor: 1.5, de: "cups" });
  assert.deepEqual(leerTazas("250ml"), { valor: 250, de: "ml" });
  assert.deepEqual(leerTazas("250 ML"), { valor: 250, de: "ml" });
  assert.deepEqual(leerTazas("100 mililitros"), { valor: 100, de: "ml" });
  assert.deepEqual(leerTazas("100 milliliters"), { valor: 100, de: "ml" });
});

test("lo que no son tazas, no", () => {
  for (const t of ["cups", "2", "-1 cup", "2 l", "20 mxn", "", undefined]) assert.equal(leerTazas(t), null, String(t));
});

test("no pisa los litros ni los millones", () => {
  assert.ok(leerVolumen("2 l"));
  assert.equal(leerVolumen("250ml"), null);
  assert.ok(leerOmnibox("2m usd", { from: "EUR", to: "USD" }));
});

test("de tazas a ml y al revés", () => {
  cerca(convertirTazas({ valor: 1, de: "cups" }).valor, 236.5882365);
  cerca(convertirTazas({ valor: 236.5882365, de: "ml" }).valor, 1);
  assert.equal(convertirTazas({ valor: 1, de: "ml" }).a, "cups");
});

test("el texto: ml enteros, tazas con dos decimales y una en singular", () => {
  assert.equal(texto("2 cups"), "2 cups = 473 ml");
  assert.equal(texto("1 taza"), "1 cup = 237 ml");
  assert.equal(texto("250ml"), "250 ml = 1,06 cups");
  assert.equal(textoTazas(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("0,5 cup"), "0.5 cups = 118 ml");
    assert.equal(texto("1000 ml"), "1,000 ml = 4.23 cups");
  } finally {
    ponerIdioma("es");
  }
});
