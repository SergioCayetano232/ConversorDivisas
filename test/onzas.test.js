const { test } = require("node:test");
const assert = require("node:assert");
const { leerOnzas, convertirOnzas, textoOnzas, leerPeso, leerVolumen, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoOnzas(leerOnzas(t));

test("lee las onzas y los gramos como se escriben", () => {
  assert.deepEqual(leerOnzas("8oz"), { valor: 8, de: "oz" });
  assert.deepEqual(leerOnzas("8 OZ"), { valor: 8, de: "oz" });
  assert.deepEqual(leerOnzas("12 ounces"), { valor: 12, de: "oz" });
  assert.deepEqual(leerOnzas("1 onza"), { valor: 1, de: "oz" });
  assert.deepEqual(leerOnzas("200g"), { valor: 200, de: "g" });
  assert.deepEqual(leerOnzas("250 gr"), { valor: 250, de: "g" });
  assert.deepEqual(leerOnzas("125,5 gramos"), { valor: 125.5, de: "g" });
  assert.deepEqual(leerOnzas("100 grams"), { valor: 100, de: "g" });
});

test("lo que no son onzas, no", () => {
  for (const t of ["oz", "8", "8 fl oz", "3,99/oz", "5lb", "20 gbp", "-5 g", "", undefined]) assert.equal(leerOnzas(t), null, String(t));
});

test("no pisa los kilos, los litros ni las esterlinas", () => {
  assert.ok(leerPeso("5lb"));
  assert.equal(leerPeso("8oz"), null);
  assert.equal(leerVolumen("8oz"), null);
  assert.equal(leerOmnibox("20 gbp", { from: "EUR", to: "USD" }).from, "GBP");
});

test("de onzas a gramos y al revés", () => {
  cerca(convertirOnzas({ valor: 1, de: "oz" }).valor, 28.349523125);
  cerca(convertirOnzas({ valor: 28.349523125, de: "g" }).valor, 1);
  assert.equal(convertirOnzas({ valor: 1, de: "g" }).a, "oz");
});

test("el texto, con un decimal", () => {
  assert.equal(texto("8oz"), "8 oz = 226,8 g");
  assert.equal(texto("200g"), "200 g = 7,1 oz");
  assert.equal(textoOnzas(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("16oz"), "16 oz = 453.6 g");
    assert.equal(texto("1000 g"), "1,000 g = 35.3 oz");
  } finally {
    ponerIdioma("es");
  }
});
