const { test } = require("node:test");
const assert = require("node:assert");
const { leerJo, convertirJo, textoJo, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoJo(leerJo(t));

test("lee los jo, con su kanji o como tatamis", () => {
  for (const t of ["6 jo", "6jo", "6 JO", "6 jō", "6 畳", "6畳", "6 帖", "6 tatami", "6 tatamis"]) assert.deepEqual(leerJo(t), { valor: 6, de: "jo" }, t);
  assert.equal(leerJo("4,5 畳").valor, 4.5);
});

test("lo que no son jo, no", () => {
  for (const t of ["jo", "畳", "6", "6 j", "6 joe", "0 jo", "-6 jo", "", undefined]) assert.equal(leerJo(t), null, String(t));
  assert.equal(leerOmnibox("6 jo", { from: "EUR", to: "USD" }), null);
});

test("un jo de anuncio son 1,62 m²", () => {
  cerca(convertirJo({ valor: 1 }).valor, 1.62);
  assert.equal(convertirJo({ valor: 1 }).a, "m²");
  assert.equal(texto("6 jo"), "6 jo = 9,7 m²");
  assert.equal(texto("4,5 畳"), "4,5 jo = 7,3 m²");
  assert.equal(textoJo(null), "");
});

test("en inglés, con el punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("4.5 tatami"), "4.5 jo = 7.3 m²");
  } finally {
    ponerIdioma("es");
  }
});
