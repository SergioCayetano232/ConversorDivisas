const { test } = require("node:test");
const assert = require("node:assert");
const { EMERGENCIAS, leerEmergencias, textoEmergencias, CURRENCIES } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("entiende emergencias, emergency y sos, con divisa o sin ella", () => {
  assert.deepEqual(leerEmergencias("emergencias"), { code: null });
  assert.deepEqual(leerEmergencias(" Emergencia jpy "), { code: "JPY" });
  assert.deepEqual(leerEmergencias("emergency usd"), { code: "USD" });
  assert.deepEqual(leerEmergencias("SOS thb"), { code: "THB" });
  assert.equal(leerEmergencias("emergencias xyz"), null);
  assert.equal(leerEmergencias("sos japón"), null);
  assert.equal(leerEmergencias("20 usd"), null);
  assert.equal(leerEmergencias(""), null);
});

test("están las 30 divisas", () => {
  assert.deepEqual(Object.keys(EMERGENCIAS).sort(), CURRENCIES.map((c) => c.code).sort());
});

test("un número para todo", () => {
  ponerIdioma("es");
  assert.equal(textoEmergencias("EUR"), "🇪🇺 🚨 112 para todo");
  assert.equal(textoEmergencias("USD"), "🇺🇸 🚨 911 para todo");
});

test("Japón, por separado", () => {
  ponerIdioma("es");
  assert.equal(textoEmergencias("JPY"), "🇯🇵 🚨 110 policía · 119 ambulancia y bomberos");
});

test("Australia, con el 112 desde el móvil", () => {
  ponerIdioma("es");
  assert.equal(textoEmergencias("AUD"), "🇦🇺 🚨 000 para todo · 112 desde el móvil");
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(textoEmergencias("CNY"), "🇨🇳 🚨 110 police · 120 ambulance · 119 fire");
  ponerIdioma("es");
});

test("divisa que no conozco, nada", () => {
  assert.equal(textoEmergencias("XYZ"), "");
});
