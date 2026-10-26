const { test } = require("node:test");
const assert = require("node:assert");
const { leerCuartos, convertirCuartos, textoCuartos, leerVolumen } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoCuartos(leerCuartos(t));

test("lee los cuartos de galón", () => {
  for (const t of ["2 qt", "2qt", "2 QT", "2 quarts", "2 cuartos de galón", "2 cuartos de galon"]) assert.deepEqual(leerCuartos(t), { valor: 2, de: "qt" }, t);
  assert.deepEqual(leerCuartos("1 quart"), { valor: 1, de: "qt" });
  assert.deepEqual(leerCuartos("0,5 qt"), { valor: 0.5, de: "qt" });
});

test("con uk, el cuarto inglés", () => {
  for (const t of ["2 qt uk", "2 qt UK", "2 quarts (uk)", "2qt imperial"]) assert.deepEqual(leerCuartos(t), { valor: 2, de: "qt", uk: true }, t);
  cerca(convertirCuartos({ valor: 4, uk: true }).valor, 4.54609);
  assert.equal(texto("1 qt uk"), "1 qt UK = 1,14 l");
  assert.equal(texto("2 qt uk"), "2 qt UK = 2,27 l");
});

test("con us, el americano de siempre", () => {
  for (const t of ["2 qt us", "2 quarts (US)"]) assert.deepEqual(leerCuartos(t), { valor: 2, de: "qt" }, t);
  assert.equal(texto("2 qt us"), "2 qt = 1,89 l");
  assert.equal(leerCuartos("2 qt usa"), null);
});

test("lo que no son cuartos, no", () => {
  for (const t of ["qt", "2", "-1 qt", "2 cuartos", "2 gal", "", undefined]) assert.equal(leerCuartos(t), null, String(t));
  assert.equal(leerVolumen("2 qt"), null);
});

test("cuatro cuartos son un galón", () => {
  cerca(convertirCuartos({ valor: 4 }).valor, 3.785411784);
  assert.equal(convertirCuartos({ valor: 1 }).a, "l");
});

test("el texto, en litros con dos decimales", () => {
  assert.equal(texto("1 qt"), "1 qt = 0,95 l");
  assert.equal(texto("2 quarts"), "2 qt = 1,89 l");
  assert.equal(textoCuartos(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("0.5 qt"), "0.5 qt = 0.47 l");
  } finally {
    ponerIdioma("es");
  }
});
