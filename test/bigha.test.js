const { test } = require("node:test");
const assert = require("node:assert");
const { leerBigha, convertirBigha, textoBigha, leerAcres, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≠ ${b}`);
const texto = (t) => textoBigha(leerBigha(t));

test("lee los bigha, también en bengalí y en hindi", () => {
  for (const t of ["2 bigha", "2bigha", "2 BIGHA", "2 bighas", "2 বিঘা", "2 बिघा"]) assert.deepEqual(leerBigha(t), { valor: 2, de: "bigha" }, t);
  assert.equal(leerBigha("1,5 bigha").valor, 1.5);
});

test("lo que no son bigha, no", () => {
  for (const t of ["bigha", "2", "2 big", "-2 bigha", "2 acres", "", undefined]) assert.equal(leerBigha(t), null, String(t));
  assert.equal(leerAcres("2 bigha"), null);
  assert.equal(leerOmnibox("2 bigha", { from: "EUR", to: "USD" }), null);
});

test("el de Bangladesh son 14.400 ft² y el de Nepal, 72.900", () => {
  cerca(convertirBigha({ valor: 1 }).valor, 1337.803776);
  cerca(convertirBigha({ valor: 1 }).nepal, 6772.6316160);
  assert.equal(convertirBigha({ valor: 1 }).a, "m²");
  assert.equal(texto("1 bigha"), "1 bigha = 🇧🇩 1.338 m² · 🇳🇵 6.773 m²");
  assert.equal(texto("10 bigha"), "10 bigha = 🇧🇩 1,34 ha · 🇳🇵 6,77 ha");
  assert.equal(textoBigha(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2.5 bigha"), "2.5 bigha = 🇧🇩 3,345 m² · 🇳🇵 1.69 ha");
  } finally {
    ponerIdioma("es");
  }
});
