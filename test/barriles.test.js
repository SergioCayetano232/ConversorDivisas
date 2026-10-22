const { test } = require("node:test");
const assert = require("node:assert");
const { leerBarriles, convertirBarriles, textoBarriles, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoBarriles(leerBarriles(t));

test("lee los barriles", () => {
  for (const t of ["1 bbl", "1bbl", "1 BBL", "1 barrel", "1 barril"]) assert.deepEqual(leerBarriles(t), { valor: 1, de: "bbl" }, t);
  for (const t of ["10 bbls", "10 barrels", "10 barriles"]) assert.deepEqual(leerBarriles(t), { valor: 10, de: "bbl" }, t);
  assert.equal(leerBarriles("2,5 bbl").valor, 2.5);
});

test("lo que no son barriles, no", () => {
  for (const t of ["bbl", "1", "1 bar", "-1 bbl", "", undefined]) assert.equal(leerBarriles(t), null, String(t));
  assert.equal(leerOmnibox("1 bbl", { from: "EUR", to: "USD" }), null);
});

test("un barril son 159 litros", () => {
  cerca(convertirBarriles({ valor: 1 }).valor, 158.987294928);
  assert.equal(convertirBarriles({ valor: 1 }).a, "l");
  assert.equal(texto("1 bbl"), "1 bbl = 159 l");
  assert.equal(texto("100 barriles"), "100 bbl = 15.899 l");
  assert.equal(textoBarriles(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2.5 barrels"), "2.5 bbl = 397 l");
  } finally {
    ponerIdioma("es");
  }
});
