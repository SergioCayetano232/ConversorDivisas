const { test } = require("node:test");
const assert = require("node:assert");
const { leerCamisa, textoCamisa } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const texto = (t) => textoCamisa(leerCamisa(t));

test("del cuello europeo a pulgadas", () => {
  ponerIdioma("es");
  assert.equal(texto("camisa 40"), "Camisa 🇪🇺 40 = 🇺🇸🇬🇧 15¾ · M");
  assert.equal(texto("camisa 38"), "Camisa 🇪🇺 38 = 🇺🇸🇬🇧 15 · S");
});

test("de pulgadas al europeo, se escriba como se escriba la fracción", () => {
  ponerIdioma("es");
  assert.equal(texto("camisa 16"), "Camisa 🇺🇸🇬🇧 16 = 🇪🇺 41 · L");
  for (const t of ["camisa 15½", "camisa 15,5", "camisa 15.5", "Camisa 15 ½"]) {
    assert.equal(texto(t), "Camisa 🇺🇸🇬🇧 15½ = 🇪🇺 39 · M", t);
  }
  assert.equal(texto("camisa 15¾"), "Camisa 🇺🇸🇬🇧 15¾ = 🇪🇺 40 · M");
});

test("por la letra, las dos que le tocan", () => {
  ponerIdioma("es");
  assert.equal(texto("camisa L"), "Camisa L = 🇪🇺 41-42 · 🇺🇸🇬🇧 16-16½");
  assert.equal(texto("camisa xxl"), "Camisa XXL = 🇪🇺 45-46 · 🇺🇸🇬🇧 18-18½");
});

test("en inglés, con shirt", () => {
  ponerIdioma("en");
  assert.equal(texto("shirt 16"), "Shirt 🇺🇸🇬🇧 16 = 🇪🇺 41 · L");
  ponerIdioma("es");
});

test("lo que no está en la tabla, nada", () => {
  assert.equal(leerCamisa("camisa"), null);
  assert.equal(leerCamisa("camisa 50"), null);
  assert.equal(leerCamisa("camisa 15,2"), null);
  assert.equal(leerCamisa("camisa xs"), null);
  assert.equal(leerCamisa("talla 42"), null);
  assert.equal(textoCamisa(null), "");
});
