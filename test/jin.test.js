const { test } = require("node:test");
const assert = require("node:assert");
const { leerJin, convertirJin, textoJin, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoJin(leerJin(t));

test("lee los jin, también como catty o 斤", () => {
  for (const t of ["2 jin", "2jin", "2 JIN", "2 jīn", "2 catty", "2 catties", "2 斤", "2斤"]) assert.deepEqual(leerJin(t), { valor: 2, de: "jin" }, t);
  assert.equal(leerJin("1,5 jin").valor, 1.5);
});

test("lo que no son jin, no", () => {
  for (const t of ["jin", "2", "2 gongjin", "2 jins", "-1 jin", "", undefined]) assert.equal(leerJin(t), null, String(t));
  assert.equal(leerOmnibox("2 jin", { from: "EUR", to: "USD" }), null);
});

test("en China es medio kilo; en Hong Kong, el catty de antes", () => {
  cerca(convertirJin({ valor: 1 }).valor, 0.5);
  cerca(convertirJin({ valor: 1 }).hongKong, 0.60478982);
  assert.equal(convertirJin({ valor: 1 }).a, "kg");
  assert.equal(texto("2 jin"), "2 jin = 🇨🇳 1 kg · 🇭🇰 1,21 kg");
  assert.equal(texto("1 斤"), "1 jin = 🇨🇳 0,5 kg · 🇭🇰 0,6 kg");
  assert.equal(textoJin(null), "");
});

test("en inglés, con el punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2.5 catties"), "2.5 jin = 🇨🇳 1.25 kg · 🇭🇰 1.51 kg");
  } finally {
    ponerIdioma("es");
  }
});
