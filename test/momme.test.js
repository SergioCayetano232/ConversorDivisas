const { test } = require("node:test");
const assert = require("node:assert");
const { leerMomme, convertirMomme, textoMomme, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoMomme(leerMomme(t));

test("lee los momme, con su kanji o como monme", () => {
  for (const t of ["22 momme", "22momme", "22 MOMME", "22 mommes", "22 monme", "22 匁", "22匁"]) assert.deepEqual(leerMomme(t), { valor: 22, de: "momme" }, t);
  assert.equal(leerMomme("19,5 momme").valor, 19.5);
});

test("lo que no son momme, no, y los mm tampoco", () => {
  for (const t of ["momme", "22", "22 mm", "22 mom", "0 momme", "-22 momme", "", undefined]) assert.equal(leerMomme(t), null, String(t));
  assert.equal(leerOmnibox("22 momme", { from: "EUR", to: "USD" }), null);
});

test("un momme son 4,34 g/m² de seda y 3,75 g de perla", () => {
  const uno = convertirMomme({ valor: 1 });
  cerca(uno.valor, 4.34);
  cerca(uno.peso, 3.75);
  assert.equal(uno.a, "g/m²");
  assert.equal(texto("22 momme"), "22 momme = 🧵 95,5 g/m² · ⚖️ 82,5 g");
  assert.equal(texto("10 匁"), "10 momme = 🧵 43,4 g/m² · ⚖️ 37,5 g");
  assert.equal(textoMomme(null), "");
});

test("en inglés, con el punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("19.5 momme"), "19.5 momme = 🧵 84.6 g/m² · ⚖️ 73.1 g");
  } finally {
    ponerIdioma("es");
  }
});
