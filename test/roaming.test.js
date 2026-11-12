const { test } = require("node:test");
const assert = require("node:assert");
const { ROAMING, leerRoaming, textoRoaming, CURRENCIES } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("entiende roaming y esim, con divisa o sin ella", () => {
  assert.deepEqual(leerRoaming("roaming"), { code: null });
  assert.deepEqual(leerRoaming(" Roaming gbp "), { code: "GBP" });
  assert.deepEqual(leerRoaming("esim jpy"), { code: "JPY" });
  assert.deepEqual(leerRoaming("e-sim usd"), { code: "USD" });
  assert.equal(leerRoaming("roaming xyz"), null);
  assert.equal(leerRoaming("roaming suiza"), null);
  assert.equal(leerRoaming("20 roaming"), null);
  assert.equal(leerRoaming(""), null);
});

test("las de la lista existen y no se repiten", () => {
  const codigos = CURRENCIES.map((c) => c.code);
  const todas = [...ROAMING.ue, ...ROAMING.cerca];
  assert.equal(new Set(todas).size, todas.length);
  for (const code of todas) assert.ok(codigos.includes(code), code);
});

test("Suecia, como en casa", () => {
  ponerIdioma("es");
  assert.equal(textoRoaming("SEK"), "🇸🇪 📶 Roaming de la UE: llamas y navegas como en casa");
});

test("el euro avisa de Andorra", () => {
  ponerIdioma("es");
  assert.equal(textoRoaming("EUR"), "🇪🇺 📶 Roaming de la UE: llamas y navegas como en casa · Ojo en Andorra, que no entra");
});

test("Reino Unido y Suiza, según la compañía", () => {
  ponerIdioma("es");
  assert.equal(textoRoaming("GBP"), "🇬🇧 📵 Fuera del roaming de la UE: muchas compañías lo incluyen, pero mira tu tarifa");
  assert.match(textoRoaming("CHF"), /^🇨🇭 📵 Fuera del roaming/);
});

test("Japón, mejor una eSIM", () => {
  ponerIdioma("es");
  assert.equal(textoRoaming("JPY"), "🇯🇵 📵 Fuera de la UE: el roaming sale caro, mejor una eSIM o una SIM de allí");
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(textoRoaming("NOK"), "🇳🇴 📶 EU roaming: calls and data like at home");
  assert.match(textoRoaming("THB"), /^🇹🇭 📵 Outside the EU/);
  ponerIdioma("es");
});

test("divisa que no conozco, nada", () => {
  assert.equal(textoRoaming("XYZ"), "");
});
