const { test } = require("node:test");
const assert = require("node:assert");
const { leerLlegar, textoLlegar } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("entiende llegar, llegada, aterrizar y arrival, con divisa o sin ella", () => {
  assert.deepEqual(leerLlegar("llegar"), { code: null });
  assert.deepEqual(leerLlegar(" Llegada jpy "), { code: "JPY" });
  assert.deepEqual(leerLlegar("aterrizar thb"), { code: "THB" });
  assert.deepEqual(leerLlegar("arrival usd"), { code: "USD" });
  assert.equal(leerLlegar("llegar xyz"), null);
  assert.equal(leerLlegar("llegar japón"), null);
  assert.equal(leerLlegar(""), null);
});

test("Japón desde el euro, todo junto", () => {
  ponerIdioma("es");
  assert.equal(textoLlegar("JPY", "EUR"), "🇯🇵 🔌 A/B 100 V (adaptador) · 🚰 agua del grifo · 🚨 110/119 · 🚗 por la izquierda · 📞 +81");
});

test("si el enchufe entra, no pide adaptador", () => {
  ponerIdioma("es");
  assert.equal(textoLlegar("CHF", "EUR"), "🇨🇭 🔌 C/J 230 V · 🚰 agua del grifo · 🚨 112/144 · 🚗 por la derecha · 📞 +41");
});

test("Marruecos, con todo", () => {
  ponerIdioma("es");
  assert.equal(textoLlegar("MAD", "EUR"), "🇲🇦 🔌 C/E 220 V · 🚱 agua embotellada · 🚨 19/15 · 🚗 por la derecha · 📞 +212");
});

test("el euro, sin prefijo", () => {
  ponerIdioma("es");
  assert.doesNotMatch(textoLlegar("EUR", "USD"), /📞/);
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(textoLlegar("THB", "EUR"), "🇹🇭 🔌 A/B/C/O 230 V · 🚱 bottled water · 🚨 191/1669/199 · 🚗 drive on the left · 📞 +66");
  ponerIdioma("es");
});

test("divisa que no conozco, nada", () => {
  assert.equal(textoLlegar("XYZ", "EUR"), "");
});
