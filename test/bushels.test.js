const { test } = require("node:test");
const assert = require("node:assert");
const { leerBushels, convertirBushels, textoBushels, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoBushels(leerBushels(t));

test("lee los bushels", () => {
  for (const t of ["2 bu", "2bu", "2 BU", "2 bushel", "2 bushels"]) assert.deepEqual(leerBushels(t), { valor: 2, de: "bu" }, t);
  assert.equal(leerBushels("1,5 bu").valor, 1.5);
});

test("lo que no son bushels, no", () => {
  for (const t of ["bu", "2", "2 b", "2 bus", "-1 bu", "", undefined]) assert.equal(leerBushels(t), null, String(t));
  assert.equal(leerOmnibox("2 bu", { from: "EUR", to: "USD" }), null);
});

test("2 bu son 70,5 l", () => {
  cerca(convertirBushels({ valor: 1 }).valor, 35.23907016688);
  assert.equal(convertirBushels({ valor: 1 }).a, "l");
  assert.equal(texto("2 bu"), "2 bu = 70,5 l");
  assert.equal(texto("1000 bushels"), "1.000 bu = 35.239,1 l");
  assert.equal(textoBushels(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2 bu"), "2 bu = 70.5 l");
  } finally {
    ponerIdioma("es");
  }
});
