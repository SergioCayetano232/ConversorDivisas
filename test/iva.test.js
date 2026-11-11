const { test } = require("node:test");
const assert = require("node:assert");
const { IVA, TAX_FREE, leerIva, textoIva, CURRENCIES } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("entiende iva, vat y gst, con precio, con divisa o con las dos", () => {
  assert.deepEqual(leerIva("iva"), { code: null, precio: null });
  assert.deepEqual(leerIva(" IVA jpy "), { code: "JPY", precio: null });
  assert.deepEqual(leerIva("iva 120"), { code: null, precio: 120 });
  assert.deepEqual(leerIva("vat 1.100 jpy"), { code: "JPY", precio: 1100 });
  assert.deepEqual(leerIva("gst 49,99 nzd"), { code: "NZD", precio: 49.99 });
  assert.equal(leerIva("iva xyz"), null);
  assert.equal(leerIva("iva 0"), null);
  assert.equal(leerIva("iva japón"), null);
  assert.equal(leerIva("120 iva"), null);
  assert.equal(leerIva(""), null);
});

test("están las 55 divisas", () => {
  assert.deepEqual(Object.keys(IVA).sort(), CURRENCIES.map((c) => c.code).sort());
});

test("el mismo IVA que el tax free", () => {
  for (const [code, t] of Object.entries(TAX_FREE)) assert.equal(IVA[code], t.iva, code);
});

test("solo el tipo", () => {
  ponerIdioma("es");
  assert.equal(textoIva("JPY"), "🇯🇵 🧾 IVA del 10 %, ya dentro del precio");
});

test("con precio, lo que es impuesto, y la suma cuadra", () => {
  ponerIdioma("es");
  assert.equal(textoIva("JPY", 1100), "🇯🇵 🧾 IVA del 10 % · 1.100,00 JPY = 1.000,00 + 100,00 de IVA");
  assert.equal(textoIva("GBP", 49.99), "🇬🇧 🧾 IVA del 20 % · 49,99 GBP = 41,66 + 8,33 de IVA");
});

test("Estados Unidos, aparte", () => {
  ponerIdioma("es");
  assert.match(textoIva("USD", 100), /^🇺🇸 🧾 No hay IVA: el sales tax va aparte/);
  assert.match(textoIva("CAD"), /^🇨🇦 🧾 Va aparte .*provincia$/);
});

test("Hong Kong, sin IVA", () => {
  ponerIdioma("es");
  assert.equal(textoIva("HKD", 500), "🇭🇰 🧾 No hay IVA");
});

test("el euro, el de cada país", () => {
  ponerIdioma("es");
  assert.match(textoIva("EUR", 100), /^🇪🇺 🧾 🇪🇸 21 % · 🇫🇷 20 % · /);
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(textoIva("JPY", 1100), "🇯🇵 🧾 10% VAT · 1,100.00 JPY = 1,000.00 + 100.00 VAT");
  ponerIdioma("es");
});

test("divisa que no conozco, nada", () => {
  assert.equal(textoIva("XYZ"), "");
});
