const { test } = require("node:test");
const assert = require("node:assert");
const { webDe, crearGuardado, leerGuardado, esElGuardado, compararConGuardado, textoGuardado, GUARDADO_DIAS } = require("../logica.js");

const DIA = 86400000;
const AHORA = Date.UTC(2026, 10, 21);
const uk = { cantidad: 180, from: "GBP", web: "https://www.amazon.co.uk/dp/1" };

test("de la web se queda el nombre, sin www", () => {
  assert.equal(webDe("https://www.amazon.co.uk/dp/1?x=2"), "amazon.co.uk");
  assert.equal(webDe("WWW.Fnac.es"), "fnac.es");
  assert.equal(webDe(null), "");
});

test("guarda el precio con su web y cuándo", () => {
  assert.deepEqual(crearGuardado(uk, AHORA), { cantidad: 180, from: "GBP", web: "amazon.co.uk", cuando: AHORA });
  assert.equal(crearGuardado({ cantidad: 0, from: "GBP" }, AHORA), null);
  assert.equal(crearGuardado({ cantidad: 10, from: "XXX" }, AHORA), null);
  assert.equal(crearGuardado(null, AHORA), null);
});

test("lo guardado caduca al mes", () => {
  const g = crearGuardado(uk, AHORA);
  assert.deepEqual(leerGuardado(g, AHORA + 29 * DIA), g);
  assert.equal(leerGuardado(g, AHORA + (GUARDADO_DIAS + 1) * DIA), null);
  assert.equal(leerGuardado({ cantidad: 180, from: "GBP" }, AHORA), null);
  assert.equal(leerGuardado("basura", AHORA), null);
});

test("sabe cuándo es el mismo precio de la misma web", () => {
  const g = crearGuardado(uk, AHORA);
  assert.equal(esElGuardado(g, { cantidad: 180, from: "GBP", web: "https://amazon.co.uk/otra" }), true);
  assert.equal(esElGuardado(g, { cantidad: 180, from: "GBP", web: "https://www.ebay.co.uk" }), false);
  assert.equal(esElGuardado(g, { cantidad: 179, from: "GBP", web: uk.web }), false);
  assert.equal(esElGuardado(null, uk), false);
});

test("compara los dos en tu divisa", () => {
  const g = crearGuardado(uk, AHORA);
  const de = { cantidad: 189, from: "EUR", web: "https://www.amazon.de/x" };
  const r = compararConGuardado(g, de, 189, 210);
  assert.equal(r.donde, "aqui");
  assert.equal(r.ahorro, 21);
  assert.equal(r.web, "amazon.co.uk");
  assert.equal(textoGuardado(r, "EUR"), "📌 Este sale 21,00 EUR más barato que en amazon.co.uk, un 10 %");

  const caro = compararConGuardado(g, de, 220, 210);
  assert.equal(textoGuardado(caro, "EUR"), "📌 Este sale 10,00 EUR más caro que en amazon.co.uk, un 4,5 %");

  assert.equal(textoGuardado(compararConGuardado(g, de, 210.5, 210), "EUR"), "📌 Sale prácticamente igual que en amazon.co.uk");
});

test("con el guardado mismo no hay nada que comparar", () => {
  const g = crearGuardado(uk, AHORA);
  assert.equal(compararConGuardado(g, uk, 210, 210), null);
  assert.equal(compararConGuardado(null, uk, 210, 210), null);
  assert.equal(textoGuardado(null, "EUR"), "");
});

test("dos de la misma tienda: no repite la web", () => {
  const g = crearGuardado(uk, AHORA);
  const r = compararConGuardado(g, { cantidad: 150, from: "GBP", web: uk.web }, 175, 210);
  assert.equal(textoGuardado(r, "EUR"), "📌 Este sale 35,00 EUR más barato que el que guardaste, un 17 %");
});
