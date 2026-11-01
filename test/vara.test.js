const { test } = require("node:test");
const assert = require("node:assert");
const { leerVara, convertirVara, textoVara, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoVara(leerVara(t));

test("lee las varas, también las castellanas", () => {
  for (const t of ["10 varas", "10varas", "10 VARAS", "10 varas castellanas", "10 vara"]) assert.deepEqual(leerVara(t), { valor: 10, de: "vara" }, t);
  assert.equal(leerVara("1,5 varas").valor, 1.5);
});

test("lo que no son varas, no", () => {
  for (const t of ["vara", "10", "10 varal", "10 varas de mimbre", "-10 varas", "", undefined]) assert.equal(leerVara(t), null, String(t));
  assert.equal(leerOmnibox("10 varas", { from: "EUR", to: "USD" }), null);
});

test("la castellana y la argentina", () => {
  cerca(convertirVara({ valor: 10 }).valor, 835.905);
  cerca(convertirVara({ valor: 10 }).argentina, 866);
  assert.equal(texto("1 vara"), "1 vara = 🇪🇸 83,6 cm · 🇦🇷 86,6 cm");
  assert.equal(texto("10 varas"), "10 varas = 🇪🇸 8,36 m · 🇦🇷 8,66 m");
  assert.equal(textoVara(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("1.5 varas"), "1.5 varas = 🇪🇸 1.25 m · 🇦🇷 1.3 m");
  } finally {
    ponerIdioma("es");
  }
});
