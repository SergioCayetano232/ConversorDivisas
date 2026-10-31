const { test } = require("node:test");
const assert = require("node:assert");
const { leerCodo, convertirCodo, textoCodo, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoCodo(leerCodo(t));

test("lee los codos, y los cubits en inglés", () => {
  for (const t of ["300 codos", "300codos", "300 CODOS", "300 codo"]) assert.deepEqual(leerCodo(t), { valor: 300, de: "codo" }, t);
  for (const t of ["300 cubits", "300 cubit", "300 Cubits"]) assert.deepEqual(leerCodo(t), { valor: 300, de: "cubit" }, t);
  assert.equal(leerCodo("1,5 codos").valor, 1.5);
});

test("lo que no son codos, no", () => {
  for (const t of ["codos", "300", "300 cod", "300 cubos", "-3 codos", "", undefined]) assert.equal(leerCodo(t), null, String(t));
  assert.equal(leerOmnibox("300 codos", { from: "EUR", to: "USD" }), null);
});

test("el de la Biblia son 18 pulgadas y el egipcio, 52,36 cm", () => {
  cerca(convertirCodo({ valor: 1 }).valor, 45.72);
  cerca(convertirCodo({ valor: 1 }).egipto, 52.36);
  assert.equal(convertirCodo({ valor: 1 }).a, "cm");
  assert.equal(texto("1 codo"), "1 codo = 📜 45,7 cm · 🇪🇬 52,4 cm");
  assert.equal(texto("300 codos"), "300 codos = 📜 137,2 m · 🇪🇬 157,1 m");
  assert.equal(textoCodo(null), "");
});

test("en inglés, cubits y con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("300 cubits"), "300 cubits = 📜 137.2 m · 🇪🇬 157.1 m");
  } finally {
    ponerIdioma("es");
  }
});
