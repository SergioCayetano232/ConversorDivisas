const { test } = require("node:test");
const assert = require("node:assert");
const { leerChains, convertirChains, textoChains, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoChains(leerChains(t));

test("lee las chains", () => {
  for (const t of ["10 chains", "10chains", "10 chain", "10 CHAINS", "10 cadenas"]) assert.deepEqual(leerChains(t), { valor: 10, de: "chain" }, t);
  assert.equal(leerChains("1,5 chains").valor, 1.5);
});

test("\"ch\" no, que se parece a los francos suizos", () => {
  for (const t of ["10 ch", "10 chf", "chains", "10", "-1 chain", "", undefined]) assert.equal(leerChains(t), null, String(t));
  assert.equal(leerOmnibox("10 chains", { from: "EUR", to: "USD" }), null);
});

test("una chain son 20,1 m", () => {
  cerca(convertirChains({ valor: 1 }).valor, 20.1168);
  assert.equal(convertirChains({ valor: 1 }).a, "m");
  assert.equal(texto("1 chain"), "1 chain = 20,1 m");
  assert.equal(texto("80 chains"), "80 chains = 1.609,3 m");
  assert.equal(textoChains(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("80 chains"), "80 chains = 1,609.3 m");
  } finally {
    ponerIdioma("es");
  }
});
