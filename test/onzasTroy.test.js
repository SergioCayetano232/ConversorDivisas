const { test } = require("node:test");
const assert = require("node:assert");
const { leerOnzasTroy, convertirOnzasTroy, textoOnzasTroy, leerOnzas, convertirOnzas } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoOnzasTroy(leerOnzasTroy(t));

test("lee las onzas troy", () => {
  for (const t of ["1 ozt", "1ozt", "1 oz t", "1 oz. t", "1 troy oz", "1 troy ounce", "1 onza troy"]) assert.deepEqual(leerOnzasTroy(t), { valor: 1, de: "ozt" }, t);
  assert.deepEqual(leerOnzasTroy("2,5 onzas troy"), { valor: 2.5, de: "ozt" });
});

test("lo que no son onzas troy, no; y las del súper siguen a lo suyo", () => {
  for (const t of ["ozt", "1", "1 oz", "-1 ozt", "1 fl oz", "", undefined]) assert.equal(leerOnzasTroy(t), null, String(t));
  assert.equal(leerOnzas("1 ozt"), null);
  assert.equal(leerOnzas("1 troy oz"), null);
});

test("una onza troy son 31,1 g, más que la normal", () => {
  cerca(convertirOnzasTroy({ valor: 1 }).valor, 31.1034768);
  assert.equal(convertirOnzasTroy({ valor: 1 }).a, "g");
  assert.ok(convertirOnzasTroy({ valor: 1 }).valor > convertirOnzas({ valor: 1, de: "oz" }).valor);
});

test("el texto, con un decimal", () => {
  assert.equal(texto("1 ozt"), "1 ozt = 31,1 g");
  assert.equal(texto("10 troy oz"), "10 ozt = 311 g");
  assert.equal(textoOnzasTroy(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2.5 troy ounces"), "2.5 ozt = 77.8 g");
  } finally {
    ponerIdioma("es");
  }
});
