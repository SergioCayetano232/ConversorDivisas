const { test } = require("node:test");
const assert = require("node:assert");
const { leerBilletes, textoBilletes } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("entiende billetes, banknotes y bills, con divisa o sin ella", () => {
  assert.deepEqual(leerBilletes("billetes"), { code: null });
  assert.deepEqual(leerBilletes(" Billete jpy "), { code: "JPY" });
  assert.deepEqual(leerBilletes("bills usd"), { code: "USD" });
  assert.deepEqual(leerBilletes("banknotes vnd"), { code: "VND" });
  for (const t of ["billetes xyz", "billetes de jpy", "20 usd", "", undefined]) assert.equal(leerBilletes(t), null, String(t));
});

test("cada billete con lo que vale en la tuya", () => {
  ponerIdioma("es");
  assert.equal(textoBilletes("JPY", "EUR", 0.00565), "🇯🇵 Billetes: 1.000 ≈ 5,65 · 5.000 ≈ 28,25 · 10.000 ≈ 56,50 EUR");
});

test("sin tasa, o si es tu misma divisa, solo la lista", () => {
  ponerIdioma("es");
  assert.equal(textoBilletes("GBP", "EUR", null), "🇬🇧 Billetes: 5 · 10 · 20 · 50 GBP");
  assert.equal(textoBilletes("GBP", "GBP", 1), "🇬🇧 Billetes: 5 · 10 · 20 · 50 GBP");
  assert.equal(textoBilletes("GBP"), "🇬🇧 Billetes: 5 · 10 · 20 · 50 GBP");
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(textoBilletes("USD", "EUR", 0.9), "🇺🇸 Banknotes: 1 ≈ 0.90 · 5 ≈ 4.50 · 10 ≈ 9.00 · 20 ≈ 18.00 · 50 ≈ 45.00 · 100 ≈ 90.00 EUR");
  ponerIdioma("es");
});

test("de las divisas sin datos, nada", () => {
  assert.equal(textoBilletes("VND", "EUR", 0.000035), "");
});
