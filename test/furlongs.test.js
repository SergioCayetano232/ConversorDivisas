const { test } = require("node:test");
const assert = require("node:assert");
const { leerFurlongs, convertirFurlongs, textoFurlongs, leerGrados, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoFurlongs(leerFurlongs(t));

test("lee los furlongs", () => {
  for (const t of ["6 furlongs", "6furlongs", "6 furlong", "6 FURLONGS", "6 fur"]) assert.deepEqual(leerFurlongs(t), { valor: 6, de: "furlong" }, t);
  assert.equal(leerFurlongs("1,5 furlongs").valor, 1.5);
});

test("\"6 f\" siguen siendo grados", () => {
  for (const t of ["6 f", "6f", "furlongs", "6", "-1 furlong", "", undefined]) assert.equal(leerFurlongs(t), null, String(t));
  assert.equal(leerGrados("6 f").de, "f");
  assert.equal(leerOmnibox("6 furlongs", { from: "EUR", to: "USD" }), null);
});

test("6 furlongs son 1.207 m", () => {
  cerca(convertirFurlongs({ valor: 1 }).valor, 201.168);
  assert.equal(convertirFurlongs({ valor: 1 }).a, "m");
  assert.equal(texto("6 furlongs"), "6 furlongs = 1.207 m");
  assert.equal(texto("1 furlong"), "1 furlong = 201 m");
  assert.equal(textoFurlongs(null), "");
});

test("en inglés, con coma de miles", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("6 furlongs"), "6 furlongs = 1,207 m");
  } finally {
    ponerIdioma("es");
  }
});
