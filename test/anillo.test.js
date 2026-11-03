const { test } = require("node:test");
const assert = require("node:assert");
const { leerAnillo, convertirAnillo, textoAnillo } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("hasta 13,5 es americana; más, española", () => {
  assert.deepEqual(leerAnillo("anillo 7"), { valor: 7, de: "us" });
  assert.deepEqual(leerAnillo("anillo 13,5"), { valor: 13.5, de: "us" });
  assert.deepEqual(leerAnillo("anillo 14"), { valor: 14, de: "es" });
  assert.deepEqual(leerAnillo("Ring size 8.5"), { valor: 8.5, de: "us" });
  assert.deepEqual(leerAnillo("anillo talla 16"), { valor: 16, de: "es" });
});

test("con us o es detrás, manda eso", () => {
  assert.deepEqual(leerAnillo("anillo 7 es"), { valor: 7, de: "es" });
  assert.deepEqual(leerAnillo("anillo 7 eu"), { valor: 7, de: "es" });
  assert.deepEqual(leerAnillo("anillo 14 us"), { valor: 14, de: "us" });
});

test("lo que no es un anillo, nada", () => {
  assert.equal(leerAnillo("anillo"), null);
  assert.equal(leerAnillo("anillo 0"), null);
  assert.equal(leerAnillo("anillo 50"), null);
  assert.equal(leerAnillo("talla 42"), null);
  assert.equal(leerAnillo("7 usd"), null);
});

test("la 7 americana es la 14 española, N½ y 17,3 mm", () => {
  const r = convertirAnillo({ valor: 7, de: "us" });
  assert.equal(r.es, 14);
  assert.equal(r.uk, "N½");
  assert.ok(Math.abs(r.mm - 17.3) < 0.05);
});

test("y de vuelta, la 14 española es la 7", () => {
  assert.equal(convertirAnillo({ valor: 14, de: "es" }).us, 7);
});

test("la 9 americana es R½", () => {
  assert.equal(convertirAnillo({ valor: 9, de: "us" }).uk, "R½");
});

test("el texto", () => {
  ponerIdioma("es");
  assert.equal(textoAnillo(leerAnillo("anillo 7")), "Anillo 🇺🇸 7 = 🇪🇸 14 · 🇬🇧 N½ · ⌀ 17,3 mm");
  assert.equal(textoAnillo(leerAnillo("anillo 14")), "Anillo 🇪🇸 14 = 🇺🇸 7 · 🇬🇧 N · ⌀ 17,2 mm");
  ponerIdioma("en");
  assert.equal(textoAnillo(leerAnillo("ring 7")), "Ring 🇺🇸 7 = 🇪🇸 14 · 🇬🇧 N½ · ⌀ 17.3 mm");
  ponerIdioma("es");
  assert.equal(textoAnillo(null), "");
});
