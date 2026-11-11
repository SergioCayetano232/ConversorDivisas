const { test } = require("node:test");
const assert = require("node:assert");
const { PAGO_ALLI, CAJERO_NOTA, leerCajero, textoCajero, CURRENCIES } = require("../logica.js");
const { ponerIdioma, TEXTOS } = require("../textos.js");

test("entiende cajero, atm y pagar, con divisa o sin ella", () => {
  assert.deepEqual(leerCajero("cajero"), { code: null });
  assert.deepEqual(leerCajero(" Cajeros thb "), { code: "THB" });
  assert.deepEqual(leerCajero("atm jpy"), { code: "JPY" });
  assert.deepEqual(leerCajero("pagar cny"), { code: "CNY" });
  assert.equal(leerCajero("cajero xyz"), null);
  assert.equal(leerCajero("efectivo"), null);
  assert.equal(leerCajero("20 cajero"), null);
  assert.equal(leerCajero(""), null);
});

test("están las 55 divisas, cada una una vez", () => {
  const todas = Object.values(PAGO_ALLI).flat();
  assert.equal(new Set(todas).size, todas.length);
  assert.deepEqual(todas.sort(), CURRENCIES.map((c) => c.code).sort());
});

test("cada nota tiene su texto en los dos idiomas", () => {
  for (const code of CAJERO_NOTA) {
    assert.ok(TEXTOS.es[`cajero.nota.${code}`], code);
    assert.ok(TEXTOS.en[`cajero.nota.${code}`], code);
  }
});

test("Tailandia, con lo que cobran los cajeros", () => {
  ponerIdioma("es");
  assert.equal(textoCajero("THB"), "🇹🇭 💳💵 Tarjeta en las ciudades; efectivo para mercados, taxis y puestos · Los cajeros cobran 220 THB cada vez que sacas");
});

test("Reino Unido, tarjeta y nada más", () => {
  ponerIdioma("es");
  assert.equal(textoCajero("GBP"), "🇬🇧 💳 Tarjeta en casi todo");
});

test("Marruecos, efectivo", () => {
  ponerIdioma("es");
  assert.equal(textoCajero("MAD"), "🇲🇦 💵 Lleva efectivo: la tarjeta, solo en hoteles y sitios grandes");
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(textoCajero("SEK"), "🇸🇪 💳 Card almost everywhere · Many places no longer take cash");
  ponerIdioma("es");
});

test("divisa que no conozco, nada", () => {
  assert.equal(textoCajero("XYZ"), "");
});
