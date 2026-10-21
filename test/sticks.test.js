const { test } = require("node:test");
const assert = require("node:assert");
const { leerSticks, convertirSticks, textoSticks, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoSticks(leerSticks(t));

test("lee las barras de mantequilla", () => {
  for (const t of ["1 stick", "1stick", "1 Stick", "1 stick of butter", "1 barra de mantequilla", "1 barra"]) assert.deepEqual(leerSticks(t), { valor: 1 }, t);
  assert.deepEqual(leerSticks("2 sticks"), { valor: 2 });
  for (const t of ["½ stick", "1/2 stick", "0,5 sticks"]) assert.deepEqual(leerSticks(t), { valor: 0.5 }, t);
});

test("lo que no son barras, no", () => {
  for (const t of ["stick", "1", "0 sticks", "-1 stick", "1 stick of cheese", "", undefined]) assert.equal(leerSticks(t), null, String(t));
  assert.equal(leerOmnibox("1 stick", { from: "EUR", to: "USD" }), null);
});

test("una barra es un cuarto de libra", () => {
  cerca(convertirSticks({ valor: 4 }).valor, 453.59237);
  assert.equal(convertirSticks({ valor: 1 }).a, "g");
});

test("el texto, en gramos enteros y con su plural", () => {
  assert.equal(texto("1 stick"), "1 stick = 113 g");
  assert.equal(texto("2 sticks"), "2 sticks = 227 g");
  assert.equal(texto("½ stick"), "½ stick = 57 g");
  assert.equal(texto("1,5 sticks"), "1,5 sticks = 170 g");
  assert.equal(textoSticks(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("1.5 sticks of butter"), "1.5 sticks = 170 g");
  } finally {
    ponerIdioma("es");
  }
});
