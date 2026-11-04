const { test } = require("node:test");
const assert = require("node:assert");
const { leerGramaje, convertirGramaje, textoGramaje, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoGramaje(leerGramaje(t));

test("lee el gramaje en gsm y en g/m²", () => {
  for (const t of ["200 gsm", "200gsm", "200 GSM", "200 g/m2", "200 g/m²", "200 g / m2"]) assert.deepEqual(leerGramaje(t), { valor: 200, de: "g/m²" }, t);
  assert.equal(leerGramaje("80,5 gsm").valor, 80.5);
});

test("y en onzas por yarda cuadrada", () => {
  for (const t of ["6 oz/yd2", "6 oz/yd²", "6oz/yd2", "6 OZ / YD2"]) assert.deepEqual(leerGramaje(t), { valor: 6, de: "oz/yd²" }, t);
});

test("lo que no es gramaje, no", () => {
  for (const t of ["gsm", "200", "200 g", "200 m2", "200 oz", "0 gsm", "-200 gsm", "", undefined]) assert.equal(leerGramaje(t), null, String(t));
  assert.equal(leerOmnibox("200 gsm", { from: "EUR", to: "USD" }), null);
});

test("una onza por yarda cuadrada son 33,9 g/m²", () => {
  cerca(convertirGramaje({ valor: 1, de: "oz/yd²" }).valor, 28.349523125 / 0.83612736);
  cerca(convertirGramaje({ valor: 28.349523125 / 0.83612736, de: "g/m²" }).valor, 1);
  assert.equal(texto("200 gsm"), "200 g/m² = 5,9 oz/yd²");
  assert.equal(texto("6 oz/yd2"), "6 oz/yd² = 203 g/m²");
  assert.equal(textoGramaje(null), "");
});

test("en inglés, con el punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("200 gsm"), "200 g/m² = 5.9 oz/yd²");
    assert.equal(texto("1.5 oz/yd2"), "1.5 oz/yd² = 51 g/m²");
  } finally {
    ponerIdioma("es");
  }
});
