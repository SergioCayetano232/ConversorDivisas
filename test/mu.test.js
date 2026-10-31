const { test } = require("node:test");
const assert = require("node:assert");
const { leerMu, convertirMu, textoMu, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoMu(leerMu(t));

test("lee los mu, también con su carácter", () => {
  for (const t of ["10 mu", "10mu", "10 MU", "10 亩", "10亩", "10 畝"]) assert.deepEqual(leerMu(t), { valor: 10, de: "mu" }, t);
  assert.equal(leerMu("1,5 mu").valor, 1.5);
});

test("lo que no son mu, no; ni las micras", () => {
  for (const t of ["mu", "10", "10 µm", "10 mus", "10 mm", "-1 mu", "", undefined]) assert.equal(leerMu(t), null, String(t));
  assert.equal(leerOmnibox("10 mu", { from: "EUR", to: "USD" }), null);
});

test("quince mu son una hectárea", () => {
  cerca(convertirMu({ valor: 15 }).valor, 10000);
  assert.equal(convertirMu({ valor: 1 }).a, "m²");
  assert.equal(texto("1 mu"), "1 mu = 667 m²");
  assert.equal(texto("30 mu"), "30 mu = 2 ha");
  assert.equal(textoMu(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2.5 mu"), "2.5 mu = 1,667 m²");
  } finally {
    ponerIdioma("es");
  }
});
