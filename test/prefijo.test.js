const { test } = require("node:test");
const assert = require("node:assert");
const { PREFIJOS, leerPrefijo, textoPrefijo, CURRENCIES } = require("../logica.js");

test("entiende prefijo, prefix y llamar, con divisa o sin ella", () => {
  assert.deepEqual(leerPrefijo("prefijo"), { code: null });
  assert.deepEqual(leerPrefijo(" Prefijo jpy "), { code: "JPY" });
  assert.deepEqual(leerPrefijo("prefix usd"), { code: "USD" });
  assert.deepEqual(leerPrefijo("llamar mad"), { code: "MAD" });
  assert.equal(leerPrefijo("prefijo xyz"), null);
  assert.equal(leerPrefijo("prefijo japón"), null);
  assert.equal(leerPrefijo("34 prefijo"), null);
  assert.equal(leerPrefijo(""), null);
});

test("están las 55 divisas", () => {
  assert.deepEqual(Object.keys(PREFIJOS).sort(), CURRENCIES.map((c) => c.code).sort());
});

test("un país, un prefijo", () => {
  assert.equal(textoPrefijo("JPY"), "🇯🇵 📞 +81");
  assert.equal(textoPrefijo("CZK"), "🇨🇿 📞 +420");
});

test("el euro, con los de cada país", () => {
  assert.match(textoPrefijo("EUR"), /^🇪🇺 📞 🇪🇸 \+34 · 🇫🇷 \+33 · /);
});

test("divisa que no conozco, nada", () => {
  assert.equal(textoPrefijo("XYZ"), "");
});
