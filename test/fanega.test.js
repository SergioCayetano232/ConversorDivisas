const { test } = require("node:test");
const assert = require("node:assert");
const { leerFanega, convertirFanega, textoFanega, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoFanega(leerFanega(t));

test("lee las fanegas y las fanegadas", () => {
  for (const t of ["10 fanegas", "10fanegas", "10 FANEGAS", "10 fanega", "10 fanegada", "10 fanegadas", "10 fan."]) assert.deepEqual(leerFanega(t), { valor: 10, de: "fanega" }, t);
  assert.equal(leerFanega("1,5 fanegas").valor, 1.5);
});

test("lo que no son fanegas, no", () => {
  for (const t of ["fanegas", "10", "10 fan", "10 fans", "-10 fanegas", "", undefined]) assert.equal(leerFanega(t), null, String(t));
  assert.equal(leerOmnibox("10 fanegas", { from: "EUR", to: "USD" }), null);
});

test("la de Castilla, 6.439,56 m²; y una sola, en singular", () => {
  cerca(convertirFanega({ valor: 1 }).valor, 0.643956);
  assert.equal(convertirFanega({ valor: 1 }).a, "ha");
  assert.equal(texto("1 fanega"), "1 fanega = 0,64 ha");
  assert.equal(texto("10 fanegas"), "10 fanegas = 6,44 ha");
  assert.equal(textoFanega(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2.5 fanegas"), "2.5 fanegas = 1.61 ha");
  } finally {
    ponerIdioma("es");
  }
});
