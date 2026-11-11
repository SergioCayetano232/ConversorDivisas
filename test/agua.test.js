const { test } = require("node:test");
const assert = require("node:assert");
const { AGUA, leerAgua, textoAgua, CURRENCIES } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("entiende agua, grifo y water, con divisa o sin ella", () => {
  assert.deepEqual(leerAgua("agua"), { code: null });
  assert.deepEqual(leerAgua(" Agua mxn "), { code: "MXN" });
  assert.deepEqual(leerAgua("grifo jpy"), { code: "JPY" });
  assert.deepEqual(leerAgua("water thb"), { code: "THB" });
  assert.equal(leerAgua("agua xyz"), null);
  assert.equal(leerAgua("agua méxico"), null);
  assert.equal(leerAgua("2 agua"), null);
  assert.equal(leerAgua(""), null);
});

test("están las 55 divisas, cada una una vez", () => {
  const todas = Object.values(AGUA).flat();
  assert.equal(new Set(todas).size, todas.length);
  assert.deepEqual(todas.sort(), CURRENCIES.map((c) => c.code).sort());
});

test("los tres casos", () => {
  ponerIdioma("es");
  assert.equal(textoAgua("JPY"), "🇯🇵 🚰 Se puede beber la del grifo");
  assert.equal(textoAgua("BRL"), "🇧🇷 🚱 En las ciudades sí; fuera, mejor embotellada");
  assert.equal(textoAgua("MXN"), "🇲🇽 🚱 Mejor embotellada, y ojo con el hielo");
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(textoAgua("THB"), "🇹🇭 🚱 Stick to bottled, and watch the ice");
  ponerIdioma("es");
});

test("divisa que no conozco, nada", () => {
  assert.equal(textoAgua("XYZ"), "");
});
