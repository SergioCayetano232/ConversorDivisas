const { test } = require("node:test");
const assert = require("node:assert");
const { leerRopa, textoRopa, leerCamisa } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const texto = (t) => textoRopa(leerRopa(t));

test("de la talla europea de mujer a la inglesa y la americana", () => {
  ponerIdioma("es");
  assert.equal(texto("ropa 38"), "Ropa de mujer 🇪🇺 38 = 🇬🇧 10 · 🇺🇸 6 · M");
  assert.equal(texto("vestido eu 42"), "Ropa de mujer 🇪🇺 42 = 🇬🇧 14 · 🇺🇸 10 · XL");
});

test("desde allí, diciendo de dónde es", () => {
  ponerIdioma("es");
  assert.equal(texto("ropa us 6"), "Ropa de mujer 🇺🇸 6 = 🇪🇺 38 · 🇬🇧 10 · M");
  assert.equal(texto("Ropa UK 10"), "Ropa de mujer 🇬🇧 10 = 🇪🇺 38 · 🇺🇸 6 · M");
  assert.equal(texto("ropa us 0"), "Ropa de mujer 🇺🇸 0 = 🇪🇺 32 · 🇬🇧 4 · XXS");
});

test("por la letra", () => {
  ponerIdioma("es");
  assert.equal(texto("ropa m"), "Ropa de mujer M = 🇪🇺 38 · 🇬🇧 10 · 🇺🇸 6");
  assert.equal(texto("ropa xxxl"), "Ropa de mujer 3XL = 🇪🇺 46 · 🇬🇧 18 · 🇺🇸 14");
});

test("las chaquetas de hombre, por el pecho", () => {
  ponerIdioma("es");
  assert.equal(texto("traje 50"), "Traje 🇪🇺 50 = 🇺🇸🇬🇧 40 · L");
  assert.equal(texto("chaqueta 40"), "Traje 🇺🇸🇬🇧 40 = 🇪🇺 50 · L");
  assert.equal(texto("americana m"), "Traje M = 🇪🇺 48 · 🇺🇸🇬🇧 38");
});

test("en el 44 y el 46 de traje, lo europeo salvo que digas us", () => {
  ponerIdioma("es");
  assert.equal(texto("traje 44"), "Traje 🇪🇺 44 = 🇺🇸🇬🇧 34 · XS");
  assert.equal(texto("traje us 44"), "Traje 🇺🇸🇬🇧 44 = 🇪🇺 54 · XXL");
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(texto("dress 38"), "Women's 🇪🇺 38 = 🇬🇧 10 · 🇺🇸 6 · M");
  assert.equal(texto("suit 40"), "Suit 🇺🇸🇬🇧 40 = 🇪🇺 50 · L");
  ponerIdioma("es");
});

test("lo que no está en la tabla, nada", () => {
  assert.equal(leerRopa("ropa"), null);
  assert.equal(leerRopa("ropa 39"), null);
  assert.equal(leerRopa("ropa 60"), null);
  assert.equal(leerRopa("ropa us m"), null);
  assert.equal(leerRopa("traje 45"), null);
  assert.equal(leerRopa("ropa de abrigo"), null);
});

test("no le quita nada a camisa", () => {
  assert.equal(leerRopa("camisa 40"), null);
  assert.ok(leerCamisa("camisa 40"));
});
