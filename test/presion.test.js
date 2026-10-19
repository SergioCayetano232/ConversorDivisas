const { test } = require("node:test");
const assert = require("node:assert");
const { leerPresion, convertirPresion, textoPresion, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoPresion(leerPresion(t));

test("lee las presiones como se escriben", () => {
  assert.deepEqual(leerPresion("35psi"), { valor: 35, de: "psi" });
  assert.deepEqual(leerPresion("35 PSI"), { valor: 35, de: "psi" });
  assert.deepEqual(leerPresion("2,4 bar"), { valor: 2.4, de: "bar" });
  assert.deepEqual(leerPresion("2.2bar"), { valor: 2.2, de: "bar" });
  assert.deepEqual(leerPresion("3 bares"), { valor: 3, de: "bar" });
});

test("lo que no son presiones, no", () => {
  for (const t of ["psi", "35", "-2 bar", "35 brl", "", undefined]) assert.equal(leerPresion(t), null, String(t));
});

test("no pisa los reales", () => {
  assert.equal(leerOmnibox("35 brl", { from: "EUR", to: "USD" }).from, "BRL");
});

test("de psi a bar y al revés", () => {
  cerca(convertirPresion({ valor: 1, de: "psi" }).valor, 0.0689475729);
  cerca(convertirPresion({ valor: 0.0689475729, de: "bar" }).valor, 1);
  assert.equal(convertirPresion({ valor: 1, de: "bar" }).a, "psi");
});

test("el texto: bar con un decimal, psi sin ninguno", () => {
  assert.equal(texto("35psi"), "35 psi = 2,4 bar");
  assert.equal(texto("2,2 bar"), "2,2 bar = 32 psi");
  assert.equal(textoPresion(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("35psi"), "35 psi = 2.4 bar");
    assert.equal(texto("2.5 bar"), "2.5 bar = 36 psi");
  } finally {
    ponerIdioma("es");
  }
});
