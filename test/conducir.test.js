const { test } = require("node:test");
const assert = require("node:assert");
const { leerConducir, textoConducir, POR_LA_IZQUIERDA, CARNE_EUROPEO, isValidCode } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("entiende conducir, coche y drive, con divisa o sin ella", () => {
  assert.deepEqual(leerConducir("conducir"), { code: null });
  assert.deepEqual(leerConducir(" Coche jpy "), { code: "JPY" });
  assert.deepEqual(leerConducir("drive gbp"), { code: "GBP" });
  assert.deepEqual(leerConducir("conduce thb"), { code: "THB" });
  assert.equal(leerConducir("conducir xyz"), null);
  assert.equal(leerConducir("coche japón"), null);
  assert.equal(leerConducir("20 coche"), null);
  assert.equal(leerConducir(""), null);
});

test("las listas solo llevan divisas que existen", () => {
  for (const code of [...POR_LA_IZQUIERDA, ...CARNE_EUROPEO]) assert.ok(isValidCode(code), code);
});

test("Japón, por la izquierda y con permiso", () => {
  ponerIdioma("es");
  assert.equal(textoConducir("JPY"), "🇯🇵 🚗 Por la izquierda · Lleva el permiso internacional");
});

test("Reino Unido, por la izquierda pero con el carné de aquí", () => {
  ponerIdioma("es");
  assert.equal(textoConducir("GBP"), "🇬🇧 🚗 Por la izquierda · Vale tu carné europeo");
});

test("el euro avisa de Irlanda, Malta y Chipre", () => {
  ponerIdioma("es");
  assert.equal(textoConducir("EUR"), "🇪🇺 🚗 Por la derecha · Irlanda, Malta y Chipre, por la izquierda · Vale tu carné europeo");
});

test("Estados Unidos, por la derecha y con permiso", () => {
  ponerIdioma("es");
  assert.equal(textoConducir("USD"), "🇺🇸 🚗 Por la derecha · Lleva el permiso internacional");
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(textoConducir("AUD"), "🇦🇺 🚗 Drive on the left · Bring an international driving permit");
  ponerIdioma("es");
});

test("divisa que no conozco, nada", () => {
  assert.equal(textoConducir("XYZ"), "");
});
