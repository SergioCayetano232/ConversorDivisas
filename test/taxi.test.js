const { test } = require("node:test");
const assert = require("node:assert");
const { APPS_TAXI, leerTaxi, textoTaxi, CURRENCIES } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("entiende taxi y cab, con divisa o sin ella", () => {
  assert.deepEqual(leerTaxi("taxi"), { code: null });
  assert.deepEqual(leerTaxi(" Taxis thb "), { code: "THB" });
  assert.deepEqual(leerTaxi("cab usd"), { code: "USD" });
  assert.equal(leerTaxi("taxi xyz"), null);
  assert.equal(leerTaxi("taxi aeropuerto"), null);
  assert.equal(leerTaxi("20 taxi"), null);
  assert.equal(leerTaxi(""), null);
});

test("están las 55 divisas, y ninguna sin apps", () => {
  assert.deepEqual(Object.keys(APPS_TAXI).sort(), CURRENCIES.map((c) => c.code).sort());
  for (const [code, apps] of Object.entries(APPS_TAXI)) assert.ok(apps.length > 0, code);
});

test("Tailandia, con Grab", () => {
  ponerIdioma("es");
  assert.equal(textoTaxi("THB"), "🇹🇭 🚕 Apps de taxi que funcionan: Grab, Bolt");
});

test("Hungría, sin Uber", () => {
  ponerIdioma("es");
  assert.doesNotMatch(textoTaxi("HUF"), /Uber/);
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(textoTaxi("USD"), "🇺🇸 🚕 Ride apps that work there: Uber, Lyft");
  ponerIdioma("es");
});

test("divisa que no conozco, nada", () => {
  assert.equal(textoTaxi("XYZ"), "");
});
