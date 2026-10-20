const { test } = require("node:test");
const assert = require("node:assert");
const { leerOnzasLiquidas, convertirOnzasLiquidas, textoOnzasLiquidas, leerOnzas, leerTazas } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoOnzasLiquidas(leerOnzasLiquidas(t));

test("lee las onzas líquidas escritas de varias formas", () => {
  for (const t of ["12 fl oz", "12floz", "12 FL OZ", "12 fl. oz", "12 fluid ounces", "12 onzas líquidas", "12 onzas liquidas"]) {
    assert.deepEqual(leerOnzasLiquidas(t), { valor: 12, de: "fl oz" }, t);
  }
  assert.deepEqual(leerOnzasLiquidas("1 fluid ounce"), { valor: 1, de: "fl oz" });
  assert.deepEqual(leerOnzasLiquidas("16,9 fl oz"), { valor: 16.9, de: "fl oz" });
});

test("las onzas de peso no son líquidas, ni al revés", () => {
  for (const t of ["8oz", "8 onzas", "fl oz", "-1 fl oz", "250ml", "", undefined]) assert.equal(leerOnzasLiquidas(t), null, String(t));
  assert.equal(leerOnzas("12 fl oz"), null);
  assert.equal(leerTazas("12 fl oz"), null);
});

test("una onza líquida americana son 29,57 ml", () => {
  cerca(convertirOnzasLiquidas({ valor: 1 }).valor, 29.5735295625);
  assert.equal(convertirOnzasLiquidas({ valor: 1 }).a, "ml");
});

test("el texto, con un decimal", () => {
  assert.equal(texto("12 fl oz"), "12 fl oz = 354,9 ml");
  assert.equal(texto("16,9 fl oz"), "16,9 fl oz = 499,8 ml");
  assert.equal(textoOnzasLiquidas(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("16.9 fl oz"), "16.9 fl oz = 499.8 ml");
  } finally {
    ponerIdioma("es");
  }
});
