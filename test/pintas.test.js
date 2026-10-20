const { test } = require("node:test");
const assert = require("node:assert");
const { leerPintas, convertirPintas, textoPintas } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoPintas(leerPintas(t));

test("lee las pintas", () => {
  for (const t of ["1 pint", "1pint", "1 PINT", "1 pinta", "1 pt"]) assert.deepEqual(leerPintas(t), { valor: 1, de: "pt" }, t);
  assert.deepEqual(leerPintas("2 pints"), { valor: 2, de: "pt" });
  assert.deepEqual(leerPintas("0,5 pintas"), { valor: 0.5, de: "pt" });
});

test("lo que no son pintas, no", () => {
  for (const t of ["pint", "2", "-1 pint", "2 pinto", "250ml", "", undefined]) assert.equal(leerPintas(t), null, String(t));
});

test("la pinta es la británica", () => {
  cerca(convertirPintas({ valor: 1 }).valor, 568.26125);
  assert.equal(convertirPintas({ valor: 1 }).a, "ml");
});

test("el texto, con los ml enteros", () => {
  assert.equal(texto("1 pint"), "1 pt = 568 ml");
  assert.equal(texto("0,5 pintas"), "0,5 pt = 284 ml");
  assert.equal(texto("2 pints"), "2 pt = 1.137 ml");
  assert.equal(textoPintas(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("0.5 pint"), "0.5 pt = 284 ml");
  } finally {
    ponerIdioma("es");
  }
});
