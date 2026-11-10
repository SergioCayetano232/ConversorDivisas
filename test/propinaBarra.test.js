const { test } = require("node:test");
const assert = require("node:assert");
const { leerPropina, textoPropina } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("entiende propina y tip, con cuenta y divisa o sin ellas", () => {
  assert.deepEqual(leerPropina("propina"), { code: null, cuenta: null });
  assert.deepEqual(leerPropina(" Tip usd "), { code: "USD", cuenta: null });
  assert.deepEqual(leerPropina("propina 60"), { code: null, cuenta: 60 });
  assert.deepEqual(leerPropina("propina 45,50 usd"), { code: "USD", cuenta: 45.5 });
  assert.deepEqual(leerPropina("tips 1.200 jpy"), { code: "JPY", cuenta: 1200 });
  assert.deepEqual(leerPropina("propina vnd"), { code: "VND", cuenta: null });
});

test("lo que no es, nada", () => {
  for (const t of ["propina xyz", "propina 0", "propina usd 60", "propinas de usd", "20 usd", "", undefined]) {
    assert.equal(leerPropina(t), null, String(t));
  }
});

test("sin cuenta, el tanto por ciento", () => {
  ponerIdioma("es");
  assert.equal(textoPropina("USD"), "🇺🇸 Se suele dejar un 18 % de propina");
});

test("con la cuenta, lo que dejar y el total, que cuadra al céntimo", () => {
  ponerIdioma("es");
  assert.equal(textoPropina("USD", 60), "🇺🇸 18 % de propina · 60,00 + 10,80 = 70,80 USD");
  assert.equal(textoPropina("USD", 60.05), "🇺🇸 18 % de propina · 60,05 + 10,81 = 70,86 USD");
});

test("en Reino Unido avisa del service charge", () => {
  ponerIdioma("es");
  assert.equal(textoPropina("GBP"), "🇬🇧 Se suele dejar un 12,5 % de propina · Mira la cuenta, que suele venir ya como service charge");
});

test("en Japón no se deja, ni con cuenta", () => {
  ponerIdioma("es");
  assert.equal(textoPropina("JPY"), "🇯🇵 Allí no se suele dejar propina");
  assert.equal(textoPropina("JPY", 5000), "🇯🇵 Allí no se suele dejar propina");
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(textoPropina("USD", 60), "🇺🇸 18% tip · 60.00 + 10.80 = 70.80 USD");
  ponerIdioma("es");
});

test("de las divisas sin datos, nada", () => {
  assert.equal(textoPropina("VND"), "");
  assert.equal(textoPropina("XYZ"), "");
});
