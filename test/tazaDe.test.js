const { test } = require("node:test");
const assert = require("node:assert");
const { leerTazaDe, textoTazaDe, leerTazas } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const texto = (t) => textoTazaDe(leerTazaDe(t));

test("una taza de harina en gramos", () => {
  ponerIdioma("es");
  assert.equal(texto("1 cup harina"), "1 taza de harina = 125 g");
  assert.equal(texto("2 cups flour"), "2 tazas de harina = 250 g");
  assert.equal(texto("1 taza de azúcar"), "1 taza de azúcar = 200 g");
  assert.equal(texto("1,5 tazas de leche"), "1,5 tazas de leche = 368 g");
});

test("con fracciones, como vienen en las recetas", () => {
  ponerIdioma("es");
  assert.equal(texto("1/2 taza azúcar"), "1/2 taza de azúcar = 100 g");
  assert.equal(texto("¾ cup flour"), "¾ taza de harina = 94 g");
  assert.equal(texto("1/3 cup cocoa"), "1/3 taza de cacao = 28 g");
});

test("los azúcares no se confunden", () => {
  ponerIdioma("es");
  assert.equal(texto("1 cup of brown sugar"), "1 taza de azúcar moreno = 220 g");
  assert.equal(texto("1 taza azucar glas"), "1 taza de azúcar glas = 120 g");
  assert.equal(texto("1 cup powdered sugar"), "1 taza de azúcar glas = 120 g");
  assert.equal(texto("1 cup sugar"), "1 taza de azúcar = 200 g");
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(texto("1 cup butter"), "1 cup of butter = 227 g");
  assert.equal(texto("2 tazas arroz"), "2 cups of rice = 370 g");
  ponerIdioma("es");
});

test("sin ingrediente sigue siendo cd 2 cups", () => {
  assert.equal(leerTazaDe("2 cups"), null);
  assert.ok(leerTazas("2 cups"));
});

test("lo que no conozco o no es una cantidad, nada", () => {
  assert.equal(leerTazaDe("1 cup pizza"), null);
  assert.equal(leerTazaDe("0/2 cup flour"), null);
  assert.equal(leerTazaDe("1/0 cup flour"), null);
  assert.equal(leerTazaDe("harina"), null);
  assert.equal(textoTazaDe(null), "");
});
