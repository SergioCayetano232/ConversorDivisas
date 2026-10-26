const { test } = require("node:test");
const assert = require("node:assert");
const { leerBrazas, convertirBrazas, textoBrazas, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoBrazas(leerBrazas(t));

test("lee las brazas", () => {
  for (const t of ["10 fathoms", "10fathoms", "10 FATHOMS", "10 ftm", "10 brazas"]) assert.deepEqual(leerBrazas(t), { valor: 10, de: "fathom" }, t);
  assert.deepEqual(leerBrazas("1 fathom"), { valor: 1, de: "fathom" });
  assert.deepEqual(leerBrazas("2,5 braza"), { valor: 2.5, de: "fathom" });
});

test("lo que no son brazas, no", () => {
  for (const t of ["fathoms", "10", "-1 fathom", "10 ft", "10 fath", "", undefined]) assert.equal(leerBrazas(t), null, String(t));
  assert.equal(leerOmnibox("10 fathoms", { from: "EUR", to: "USD" }), null);
});

test("una braza son seis pies, 1,83 m", () => {
  cerca(convertirBrazas({ valor: 1 }).valor, 6 * 0.3048);
  assert.equal(convertirBrazas({ valor: 1 }).a, "m");
});

test("el texto, con un decimal, y en singular con una", () => {
  assert.equal(texto("10 fathoms"), "10 fathoms = 18,3 m");
  assert.equal(texto("1 ftm"), "1 fathom = 1,8 m");
  assert.equal(textoBrazas(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2.5 fathoms"), "2.5 fathoms = 4.6 m");
  } finally {
    ponerIdioma("es");
  }
});
