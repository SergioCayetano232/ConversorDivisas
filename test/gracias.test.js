const { test } = require("node:test");
const assert = require("node:assert");
const { FRASES, leerGracias, textoGracias, CURRENCIES } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("entiende gracias, hola, frases y thanks, con divisa o sin ella", () => {
  assert.deepEqual(leerGracias("gracias"), { code: null });
  assert.deepEqual(leerGracias(" Hola jpy "), { code: "JPY" });
  assert.deepEqual(leerGracias("thanks thb"), { code: "THB" });
  assert.deepEqual(leerGracias("frases try"), { code: "TRY" });
  assert.equal(leerGracias("gracias xyz"), null);
  assert.equal(leerGracias("hola japón"), null);
  assert.equal(leerGracias("2 gracias"), null);
  assert.equal(leerGracias(""), null);
});

test("están las 55 divisas", () => {
  assert.deepEqual(Object.keys(FRASES).sort(), CURRENCIES.map((c) => c.code).sort());
});

test("Japón, hola, gracias y la cuenta", () => {
  ponerIdioma("es");
  assert.equal(textoGracias("JPY"), "🇯🇵 💬 👋 Konnichiwa · 🙏 Arigatō · 🧾 Okaikei onegaishimasu");
});

test("donde se habla español, no hace falta tabla", () => {
  ponerIdioma("es");
  assert.equal(textoGracias("MXN"), "🇲🇽 💬 Se habla español, como tú");
  ponerIdioma("en");
  assert.equal(textoGracias("MXN"), "🇲🇽 💬 👋 Hola · 🙏 Gracias · 🧾 La cuenta, por favor");
  ponerIdioma("es");
});

test("y en inglés, al revés", () => {
  ponerIdioma("es");
  assert.equal(textoGracias("GBP"), "🇬🇧 💬 👋 Hello · 🙏 Thank you · 🧾 The bill, please");
  assert.equal(textoGracias("USD"), "🇺🇸 💬 👋 Hello · 🙏 Thank you · 🧾 The check, please");
  ponerIdioma("en");
  assert.equal(textoGracias("GBP"), "🇬🇧 💬 They speak English, like you");
  ponerIdioma("es");
});

test("el euro, el gracias de cada país", () => {
  assert.match(textoGracias("EUR"), /^🇪🇺 💬 🙏 🇫🇷 Merci · 🇩🇪 Danke · /);
});

test("divisa que no conozco, nada", () => {
  assert.equal(textoGracias("XYZ"), "");
});
