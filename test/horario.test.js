const { test } = require("node:test");
const assert = require("node:assert");
const { HORARIOS, leerHorario, textoHorario, CURRENCIES } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("entiende horario, cenar y hours, con divisa o sin ella", () => {
  assert.deepEqual(leerHorario("horario"), { code: null });
  assert.deepEqual(leerHorario(" Horarios gbp "), { code: "GBP" });
  assert.deepEqual(leerHorario("cenar usd"), { code: "USD" });
  assert.deepEqual(leerHorario("hours jpy"), { code: "JPY" });
  assert.equal(leerHorario("horario xyz"), null);
  assert.equal(leerHorario("horario de verano"), null);
  assert.equal(leerHorario("20 horario"), null);
  assert.equal(leerHorario(""), null);
});

test("están las 55 divisas, con horas que se leen", () => {
  assert.deepEqual(Object.keys(HORARIOS).sort(), CURRENCIES.map((c) => c.code).sort());
  const hora = "\\d{1,2}(?::\\d{2})?";
  for (const [code, [comida, cena, tiendas, domingo]] of Object.entries(HORARIOS)) {
    assert.match(comida, new RegExp(`^${hora}-${hora}$`), code);
    assert.match(cena, new RegExp(`^${hora}-${hora}$`), code);
    assert.match(tiendas, new RegExp(`^${hora}$`), code);
    assert.ok(["abre", "corto", "cierra"].includes(domingo), code);
  }
});

test("Reino Unido", () => {
  ponerIdioma("es");
  assert.equal(textoHorario("GBP"), "🇬🇧 🕐 Comida 12-14 · Cena 18-21 · Tiendas hasta las 20, el domingo menos rato");
});

test("Suiza, con el domingo cerrado", () => {
  ponerIdioma("es");
  assert.equal(textoHorario("CHF"), "🇨🇭 🕐 Comida 12-13:30 · Cena 18:30-20:30 · Tiendas hasta las 18:30, el domingo cerradas");
});

test("Arabia, con lo de los rezos", () => {
  ponerIdioma("es");
  assert.match(textoHorario("SAR"), /también el domingo · Las tiendas cierran un rato en cada rezo$/);
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(textoHorario("USD"), "🇺🇸 🕐 Lunch 11:30-13:30 · Dinner 17:30-20 · Shops until 21, Sundays too");
  ponerIdioma("es");
});

test("divisa que no conozco, nada", () => {
  assert.equal(textoHorario("XYZ"), "");
});
