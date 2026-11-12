const { test } = require("node:test");
const assert = require("node:assert");
const { CON_TSE, leerSanitaria, textoSanitaria, CURRENCIES } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("entiende sanitaria, seguro y médico, con divisa o sin ella", () => {
  assert.deepEqual(leerSanitaria("sanitaria"), { code: null });
  assert.deepEqual(leerSanitaria(" Seguro usd "), { code: "USD" });
  assert.deepEqual(leerSanitaria("médico jpy"), { code: "JPY" });
  assert.deepEqual(leerSanitaria("medico thb"), { code: "THB" });
  assert.deepEqual(leerSanitaria("tse gbp"), { code: "GBP" });
  assert.equal(leerSanitaria("seguro xyz"), null);
  assert.equal(leerSanitaria("seguro de viaje"), null);
  assert.equal(leerSanitaria("20 seguro"), null);
  assert.equal(leerSanitaria(""), null);
});

test("las de la lista existen", () => {
  const codigos = CURRENCIES.map((c) => c.code);
  for (const code of CON_TSE) assert.ok(codigos.includes(code), code);
});

test("Reino Unido y Suiza, con la tarjeta", () => {
  ponerIdioma("es");
  assert.equal(textoSanitaria("GBP"), "🇬🇧 🏥 Vale la Tarjeta Sanitaria Europea, en la sanidad pública");
  assert.match(textoSanitaria("CHF"), /^🇨🇭 🏥 Vale la Tarjeta/);
});

test("el euro avisa de Andorra", () => {
  ponerIdioma("es");
  assert.equal(textoSanitaria("EUR"), "🇪🇺 🏥 Vale la Tarjeta Sanitaria Europea, en la sanidad pública · En Andorra no vale");
});

test("Japón, con seguro", () => {
  ponerIdioma("es");
  assert.equal(textoSanitaria("JPY"), "🇯🇵 🏥 La Tarjeta Sanitaria Europea no vale: lleva seguro de viaje");
});

test("Estados Unidos avisa de lo que cuesta", () => {
  ponerIdioma("es");
  assert.equal(textoSanitaria("USD"), "🇺🇸 🏥 La Tarjeta Sanitaria Europea no vale: lleva seguro de viaje · Una urgencia puede costar miles, que cubra bastante");
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(textoSanitaria("NOK"), "🇳🇴 🏥 Your European Health Insurance Card works, in public healthcare");
  assert.match(textoSanitaria("MXN"), /^🇲🇽 🏥 The European Health Insurance Card doesn't work/);
  ponerIdioma("es");
});

test("divisa que no conozco, nada", () => {
  assert.equal(textoSanitaria("XYZ"), "");
});
