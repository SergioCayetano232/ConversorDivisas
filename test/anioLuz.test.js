const { test } = require("node:test");
const assert = require("node:assert");
const { leerAnioLuz, convertirAnioLuz, textoAnioLuz, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) / b < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoAnioLuz(leerAnioLuz(t));

test("lee los años luz, en español y en inglés", () => {
  for (const t of ["4 ly", "4ly", "4 LY", "4 light years", "4 light-years", "4 light year", "4 años luz", "4 año luz", "4 anos luz", "4 años-luz"]) assert.deepEqual(leerAnioLuz(t), { valor: 4, de: "ly" }, t);
  assert.equal(leerAnioLuz("4,2 ly").valor, 4.2);
});

test("y los pársecs, pero no pc", () => {
  for (const t of ["2 parsec", "2 parsecs", "2 pársec", "2 pársecs", "2 PARSEC"]) assert.deepEqual(leerAnioLuz(t), { valor: 2, de: "pc" }, t);
  assert.equal(leerAnioLuz("2 pc"), null);
});

test("lo que no son años luz, no", () => {
  for (const t of ["ly", "4", "4 años", "4 luz", "4 light", "0 ly", "-4 ly", "", undefined]) assert.equal(leerAnioLuz(t), null, String(t));
  assert.equal(leerOmnibox("4 ly", { from: "EUR", to: "USD" }), null);
  assert.equal(leerOmnibox("1 parsec", { from: "EUR", to: "USD" }), null);
});

test("un año luz son 9,46 billones de km, y un pársec 3,26 años luz", () => {
  cerca(convertirAnioLuz({ valor: 1, de: "ly" }).valor, 9.4607304725808e12);
  cerca(convertirAnioLuz({ valor: 1, de: "pc" }).ly, 3.261563777);
  assert.equal(texto("4,2 ly"), "4,2 años luz = 39,7 billones de km");
  assert.equal(texto("1 año luz"), "1 año luz = 9,46 billones de km");
  assert.equal(texto("1 parsec"), "1 pc = 3,26 años luz · 30,9 billones de km");
  assert.equal(textoAnioLuz(null), "");
});

test("en inglés son trillions", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("4.2 light years"), "4.2 light years = 39.7 trillion km");
    assert.equal(texto("1 ly"), "1 light year = 9.46 trillion km");
    assert.equal(texto("1 parsec"), "1 pc = 3.26 light years · 30.9 trillion km");
  } finally {
    ponerIdioma("es");
  }
});
