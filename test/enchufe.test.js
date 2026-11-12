const { test } = require("node:test");
const assert = require("node:assert");
const { ENCHUFES, leerEnchufe, enchufeDe, textoEnchufe, CURRENCIES } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("entiende enchufe y plug, con divisa o sin ella", () => {
  assert.deepEqual(leerEnchufe("enchufe"), { code: null });
  assert.deepEqual(leerEnchufe(" Enchufe jpy "), { code: "JPY" });
  assert.deepEqual(leerEnchufe("enchufes GBP"), { code: "GBP" });
  assert.deepEqual(leerEnchufe("plug usd"), { code: "USD" });
  assert.equal(leerEnchufe("enchufe xyz"), null);
  assert.equal(leerEnchufe("enchufe japón"), null);
  assert.equal(leerEnchufe("20 usd"), null);
  assert.equal(leerEnchufe(""), null);
});

test("están las 55 divisas, con tipos y voltajes que existen", () => {
  assert.deepEqual(Object.keys(ENCHUFES).sort(), CURRENCIES.map((c) => c.code).sort());
  for (const [code, [tipos, voltios]] of Object.entries(ENCHUFES)) {
    assert.match(tipos, /^[A-O]+$/, code);
    for (const v of voltios) assert.ok(v >= 100 && v <= 240, code);
  }
});

test("de España a Colombia: adaptador y otro voltaje", () => {
  ponerIdioma("es");
  assert.equal(textoEnchufe(enchufeDe("COP", "EUR")), "🇨🇴 Enchufe A/B · 120 V · Necesitas adaptador · Ojo, otro voltaje: enchufa solo lo que ponga 100-240 V");
});

test("de España a Marruecos el tuyo entra", () => {
  ponerIdioma("es");
  assert.equal(textoEnchufe(enchufeDe("MAD", "EUR")), "🇲🇦 Enchufe C/E · 220 V · El tuyo entra");
});

test("Bolivia tiene de los dos voltajes: no aviso", () => {
  assert.equal(enchufeDe("BOB", "USD").otroVoltaje, false);
});

test("de España a Japón: adaptador y otro voltaje", () => {
  ponerIdioma("es");
  const e = enchufeDe("JPY", "EUR");
  assert.equal(e.entra, false);
  assert.equal(e.otroVoltaje, true);
  assert.equal(textoEnchufe(e), "🇯🇵 Enchufe A/B · 100 V · Necesitas adaptador · Ojo, otro voltaje: enchufa solo lo que ponga 100-240 V");
});

test("de España a Suiza el tuyo entra", () => {
  ponerIdioma("es");
  assert.equal(textoEnchufe(enchufeDe("CHF", "EUR")), "🇨🇭 Enchufe C/J · 230 V · El tuyo entra");
});

test("de Reino Unido a Hong Kong, el mismo", () => {
  const e = enchufeDe("HKD", "GBP");
  assert.equal(e.entra, true);
  assert.equal(e.otroVoltaje, false);
});

test("Brasil tiene de los dos voltajes: no aviso", () => {
  assert.equal(enchufeDe("BRL", "USD").otroVoltaje, false);
  assert.equal(enchufeDe("BRL", "EUR").otroVoltaje, false);
});

test("con el euro, aviso de los países de la G", () => {
  ponerIdioma("es");
  assert.equal(textoEnchufe(enchufeDe("EUR", "USD")),
    "🇪🇺 Enchufe C/F · 230 V · Irlanda, Malta y Chipre: G · Necesitas adaptador · Ojo, otro voltaje: enchufa solo lo que ponga 100-240 V");
});

test("si es tu misma divisa, sin comparar", () => {
  ponerIdioma("es");
  assert.equal(textoEnchufe(enchufeDe("GBP", "GBP")), "🇬🇧 Enchufe G · 230 V");
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(textoEnchufe(enchufeDe("USD", "GBP")), "🇺🇸 Plug A/B · 120 V · You need an adapter · Careful, different voltage: only plug in things marked 100-240 V");
  ponerIdioma("es");
});

test("divisa que no conozco, nada", () => {
  assert.equal(enchufeDe("XYZ", "EUR"), null);
  assert.equal(textoEnchufe(null), "");
});
