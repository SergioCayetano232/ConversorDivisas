const { test } = require("node:test");
const assert = require("node:assert");
const { VISADOS, leerVisado, textoVisado, CURRENCIES } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("entiende visado y visa, con divisa o sin ella", () => {
  assert.deepEqual(leerVisado("visado"), { code: null });
  assert.deepEqual(leerVisado(" Visado usd "), { code: "USD" });
  assert.deepEqual(leerVisado("visa jpy"), { code: "JPY" });
  assert.deepEqual(leerVisado("visas inr"), { code: "INR" });
  assert.equal(leerVisado("visado xyz"), null);
  assert.equal(leerVisado("visado japón"), null);
  assert.equal(leerVisado("20 visa"), null);
  assert.equal(leerVisado(""), null);
});

test("están las 55 divisas, y todas con días salvo las del DNI", () => {
  assert.deepEqual(Object.keys(VISADOS).sort(), CURRENCIES.map((c) => c.code).sort());
  for (const [code, [tipo, dias]] of Object.entries(VISADOS)) {
    if (tipo !== "dni") assert.ok(dias > 0, code);
  }
});

test("Estados Unidos, con el ESTA", () => {
  ponerIdioma("es");
  assert.equal(textoVisado("USD"), "🇺🇸 🛂 Sin visado, hasta 90 días, pero pide antes el ESTA por internet · Con pasaporte español. Compruébalo en exteriores.gob.es");
});

test("Japón, sin visado", () => {
  ponerIdioma("es");
  assert.equal(textoVisado("JPY"), "🇯🇵 🛂 Sin visado, hasta 90 días · Con pasaporte español. Compruébalo en exteriores.gob.es");
});

test("el euro, con el DNI y sin más", () => {
  ponerIdioma("es");
  assert.equal(textoVisado("EUR"), "🇪🇺 🛂 Con el DNI vale, sin visado");
});

test("Indonesia, al llegar", () => {
  ponerIdioma("es");
  assert.match(textoVisado("IDR"), /^🇮🇩 🛂 Visado al llegar, en el aeropuerto: hasta 30 días/);
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.match(textoVisado("INR"), /^🇮🇳 🛂 Visa needed: apply online for the e-Visa, up to 30 days · With a Spanish passport/);
  ponerIdioma("es");
});

test("divisa que no conozco, nada", () => {
  assert.equal(textoVisado("XYZ"), "");
});
