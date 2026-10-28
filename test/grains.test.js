const { test } = require("node:test");
const assert = require("node:assert");
const { leerGrains, convertirGrains, textoGrains, leerOnzas, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoGrains(leerGrains(t));

test("lee los grains", () => {
  for (const t of ["5 grains", "5grains", "5 grain", "5 GRAINS", "5 granos"]) assert.deepEqual(leerGrains(t), { valor: 5, de: "grain" }, t);
  assert.equal(leerGrains("1,5 grains").valor, 1.5);
});

test("\"gr\" siguen siendo gramos", () => {
  for (const t of ["5 gr", "5 g", "grains", "5", "-1 grain", "", undefined]) assert.equal(leerGrains(t), null, String(t));
  assert.equal(leerOnzas("5 gr").de, "g");
  assert.equal(leerOnzas("5 grains"), null);
  assert.equal(leerOmnibox("5 grains", { from: "EUR", to: "USD" }), null);
});

test("5 grains son 324 mg, la aspirina de allí", () => {
  cerca(convertirGrains({ valor: 1 }).valor, 64.79891);
  assert.equal(convertirGrains({ valor: 1 }).a, "mg");
  assert.equal(texto("5 grains"), "5 grain = 324 mg");
  assert.equal(texto("1,25 grains"), "1,25 grain = 81 mg");
  assert.equal(textoGrains(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("1.25 grains"), "1.25 grain = 81 mg");
  } finally {
    ponerIdioma("es");
  }
});
