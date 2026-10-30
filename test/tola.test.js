const { test } = require("node:test");
const assert = require("node:assert");
const { leerTola, convertirTola, textoTola, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoTola(leerTola(t));

test("lee las tolas", () => {
  for (const t of ["10 tola", "10tola", "10 TOLA", "10 tolas", "10 tolay", "10 तोला"]) assert.deepEqual(leerTola(t), { valor: 10, de: "tola" }, t);
  assert.equal(leerTola("2,5 tola").valor, 2.5);
});

test("lo que no son tolas, no", () => {
  for (const t of ["tola", "10", "10 tol", "-1 tola", "", undefined]) assert.equal(leerTola(t), null, String(t));
  assert.equal(leerOmnibox("10 tola", { from: "EUR", to: "USD" }), null);
});

test("una tola son 180 granos, tres octavos de onza troy", () => {
  cerca(convertirTola({ valor: 1 }).valor, 11.6638038);
  cerca(convertirTola({ valor: 1 }).troy, 0.375);
  assert.equal(convertirTola({ valor: 1 }).a, "g");
  assert.equal(texto("10 tola"), "10 tola = 116,6 g · 3,75 ozt");
  assert.equal(texto("1 tola"), "1 tola = 11,7 g · 0,38 ozt");
  assert.equal(textoTola(null), "");
});

test("en inglés, con el punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2.5 tolas"), "2.5 tola = 29.2 g · 0.94 ozt");
  } finally {
    ponerIdioma("es");
  }
});
