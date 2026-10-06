const { test } = require("node:test");
const assert = require("node:assert");
const { CURRENCIES, divisaDeIdioma, parPorIdioma, banderaDe, banderaDivisa } = require("../logica.js");

const par = (idiomas) => {
  const { from, to } = parPorIdioma(idiomas);
  return `${from}→${to}`;
};

test("con país, la divisa del país", () => {
  assert.equal(divisaDeIdioma("es-MX"), "MXN");
  assert.equal(divisaDeIdioma("es-ES"), "EUR");
  assert.equal(divisaDeIdioma("en-GB"), "GBP");
  assert.equal(divisaDeIdioma("pt-BR"), "BRL");
  assert.equal(divisaDeIdioma("pt-PT"), "EUR");
  assert.equal(divisaDeIdioma("de-CH"), "CHF");
});

test("el país puede venir detrás del alfabeto", () => {
  assert.equal(divisaDeIdioma("zh-Hant-HK"), "HKD");
  assert.equal(divisaDeIdioma("sr-Latn-ME"), "EUR");
  assert.equal(divisaDeIdioma("en_US"), "USD", "con guion bajo también");
});

test("sin país, solo las lenguas que no dejan duda", () => {
  assert.equal(divisaDeIdioma("ja"), "JPY");
  assert.equal(divisaDeIdioma("pl"), "PLN");
  assert.equal(divisaDeIdioma("es"), null);
  assert.equal(divisaDeIdioma("en"), null);
  assert.equal(divisaDeIdioma("pt"), null);
});

test("un país sin divisa del BCE no da nada", () => {
  assert.equal(divisaDeIdioma("es-AR"), null);
  assert.equal(divisaDeIdioma("es-CO"), null);
});

test("lo raro no rompe", () => {
  for (const malo of ["", null, undefined, 42, "-", "xx-YY"]) assert.equal(divisaDeIdioma(malo), null, String(malo));
});

test("todas las divisas del mapa existen", () => {
  const codigos = CURRENCIES.map((c) => c.code);
  for (const etiqueta of ["es-MX", "en-GB", "ja", "zh-CN", "hi", "he", "en-ZA", "is"]) {
    assert.ok(codigos.includes(divisaDeIdioma(etiqueta)), etiqueta);
  }
});

test("el destino: dólar en general, euro desde Europa", () => {
  assert.equal(par(["es-MX"]), "MXN→USD");
  assert.equal(par(["ja-JP"]), "JPY→USD");
  assert.equal(par(["en-GB"]), "GBP→EUR");
  assert.equal(par(["de-CH"]), "CHF→EUR");
  assert.equal(par(["pl"]), "PLN→EUR");
});

test("euro y dólar van el uno al otro", () => {
  assert.equal(par(["es-ES"]), "EUR→USD");
  assert.equal(par(["en-US"]), "USD→EUR");
});

test("desde la eurozona es el par de siempre, sin idioma", () => {
  assert.deepEqual(parPorIdioma(["es-ES"]), { from: "EUR", to: "USD", idioma: null });
  assert.equal(par(["de-DE", "en-US"]), "EUR→USD", "el primero manda aunque detrás haya otro");
});

test("manda el primer idioma que se entiende", () => {
  assert.equal(par(["es", "es-MX", "en-US"]), "MXN→USD", "'es' solo no dice nada, sigue buscando");
  assert.equal(par(["es-AR", "en-US"]), "USD→EUR");
  assert.equal(parPorIdioma(["es", "es-MX"]).idioma, "es-MX");
});

test("si no se entiende nada, el par de siempre", () => {
  assert.deepEqual(parPorIdioma(["es", "en"]), { from: "EUR", to: "USD", idioma: null });
  assert.deepEqual(parPorIdioma([]), { from: "EUR", to: "USD", idioma: null });
  assert.deepEqual(parPorIdioma(undefined), { from: "EUR", to: "USD", idioma: null });
});

test("la bandera sale del país", () => {
  assert.equal(banderaDe("es-MX"), "🇲🇽");
  assert.equal(banderaDe("zh-Hant-HK"), "🇭🇰");
  assert.equal(banderaDe("ja"), "");
  assert.equal(banderaDe(null), "");
});

test("cada divisa tiene su bandera, y el euro la de la UE", () => {
  assert.equal(banderaDivisa("EUR"), "🇪🇺");
  assert.equal(banderaDivisa("USD"), "🇺🇸");
  assert.equal(banderaDivisa("GBP"), "🇬🇧");
  assert.equal(banderaDivisa("ZAR"), "🇿🇦");
  for (const { code } of CURRENCIES) assert.equal([...banderaDivisa(code)].length, 2, code);
  assert.equal(banderaDivisa("XXX"), "");
  assert.equal(banderaDivisa(undefined), "");
});
