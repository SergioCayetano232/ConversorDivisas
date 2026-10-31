const { test } = require("node:test");
const assert = require("node:assert");
const { leerMaund, convertirMaund, textoMaund, leerTola, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoMaund(leerMaund(t));

test("lee los maund, también en hindi, bengalí y urdu", () => {
  for (const t of ["5 maund", "5maund", "5 MAUND", "5 maunds", "5 mund", "5 मन", "5 মণ", "5 من"]) assert.deepEqual(leerMaund(t), { valor: 5, de: "maund" }, t);
  assert.equal(leerMaund("1,5 maund").valor, 1.5);
});

test("lo que no son maund, no; ni los hombres", () => {
  for (const t of ["maund", "5", "5 man", "5 men", "5 mun", "-5 maund", "", undefined]) assert.equal(leerMaund(t), null, String(t));
  assert.equal(leerTola("5 maund"), null);
  assert.equal(leerOmnibox("5 maund", { from: "EUR", to: "USD" }), null);
});

test("un maund son 3.200 tolas, y en Pakistán 40 kg justos", () => {
  cerca(convertirMaund({ valor: 1 }).valor, 37.32417216);
  assert.equal(convertirMaund({ valor: 1 }).pakistan, 40);
  assert.equal(convertirMaund({ valor: 1 }).a, "kg");
  assert.equal(texto("1 maund"), "1 maund = 🇮🇳 37,3 kg · 🇵🇰 40 kg");
  assert.equal(texto("5 maund"), "5 maund = 🇮🇳 186,6 kg · 🇵🇰 200 kg");
  assert.equal(textoMaund(null), "");
});

test("en inglés, con punto y coma de miles", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("100 maund"), "100 maund = 🇮🇳 3,732.4 kg · 🇵🇰 4,000 kg");
  } finally {
    ponerIdioma("es");
  }
});
