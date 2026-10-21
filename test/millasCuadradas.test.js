const { test } = require("node:test");
const assert = require("node:assert");
const { leerMillasCuadradas, convertirMillasCuadradas, textoMillasCuadradas, leerSuperficie } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoMillasCuadradas(leerMillasCuadradas(t));

test("lee las millas y los kilómetros cuadrados", () => {
  for (const t of ["5 sq mi", "5sqmi", "5 sq. mi", "5 mi²", "5 mi2", "5 square miles", "5 millas cuadradas"]) assert.deepEqual(leerMillasCuadradas(t), { valor: 5, de: "sq mi" }, t);
  for (const t of ["10 km²", "10km2", "10 kilómetros cuadrados", "10 square kilometers"]) assert.deepEqual(leerMillasCuadradas(t), { valor: 10, de: "km²" }, t);
});

test("lo que no es, no; y los pies y los metros siguen a lo suyo", () => {
  for (const t of ["sq mi", "5", "5 mi", "5 km", "-5 km²", "800 sq ft", "75 m2", "", undefined]) assert.equal(leerMillasCuadradas(t), null, String(t));
  assert.equal(leerSuperficie("5 sq mi"), null);
  assert.equal(leerSuperficie("10 km2"), null);
});

test("una milla cuadrada son 2,59 km², y al revés", () => {
  cerca(convertirMillasCuadradas({ valor: 1, de: "sq mi" }).valor, 1.609344 ** 2);
  cerca(convertirMillasCuadradas({ valor: 1.609344 ** 2, de: "km²" }).valor, 1);
  assert.equal(convertirMillasCuadradas({ valor: 1, de: "km²" }).a, "sq mi");
});

test("el texto, con un decimal", () => {
  assert.equal(texto("5 sq mi"), "5 sq mi = 12,9 km²");
  assert.equal(texto("10 km2"), "10 km² = 3,9 sq mi");
  assert.equal(textoMillasCuadradas(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2.5 square miles"), "2.5 sq mi = 6.5 km²");
  } finally {
    ponerIdioma("es");
  }
});
