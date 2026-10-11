const { test } = require("node:test");
const assert = require("node:assert");
const { CURRENCIES, PROPINA_HABITUAL, PROPINA_MAX, propinaHabitual } = require("../logica.js");

test("todas las divisas tienen su propina, y ninguna de más", () => {
  assert.deepEqual(Object.keys(PROPINA_HABITUAL).sort(), CURRENCIES.map((c) => c.code).sort());
});

test("todas caben en lo que deja poner el campo", () => {
  for (const pct of Object.values(PROPINA_HABITUAL)) assert.ok(pct >= 0 && pct <= PROPINA_MAX);
});

test("en Estados Unidos se deja y en Japón no", () => {
  assert.equal(propinaHabitual("USD"), 18);
  assert.equal(propinaHabitual("JPY"), 0);
});

test("una divisa que no conozco no tiene propina, ni siquiera cero", () => {
  assert.equal(propinaHabitual("XXX"), null);
  assert.equal(propinaHabitual(undefined), null);
});
