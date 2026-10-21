const { test } = require("node:test");
const assert = require("node:assert");
const { leerYardasCuadradas, convertirYardasCuadradas, textoYardasCuadradas, leerYardas, leerSuperficie } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoYardasCuadradas(leerYardasCuadradas(t));

test("lee las yardas cuadradas", () => {
  for (const t of ["10 sq yd", "10sqyd", "10 sq. yds", "10 yd²", "10 yd2", "10 square yards", "10 yardas cuadradas"]) assert.deepEqual(leerYardasCuadradas(t), { valor: 10, de: "sq yd" }, t);
  assert.deepEqual(leerYardasCuadradas("1 yarda cuadrada"), { valor: 1, de: "sq yd" });
});

test("lo que no son yardas cuadradas, no; y las otras siguen a lo suyo", () => {
  for (const t of ["sq yd", "10", "10 yd", "-1 sq yd", "800 sq ft", "", undefined]) assert.equal(leerYardasCuadradas(t), null, String(t));
  assert.equal(leerYardas("10 sq yd"), null);
  assert.equal(leerSuperficie("10 sq yd"), null);
});

test("una yarda cuadrada son 0,84 m²", () => {
  cerca(convertirYardasCuadradas({ valor: 1 }).valor, 0.83612736);
  assert.equal(convertirYardasCuadradas({ valor: 1 }).a, "m²");
});

test("el texto, con un decimal", () => {
  assert.equal(texto("10 sq yd"), "10 sq yd = 8,4 m²");
  assert.equal(textoYardasCuadradas(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("12.5 square yards"), "12.5 sq yd = 10.5 m²");
  } finally {
    ponerIdioma("es");
  }
});
