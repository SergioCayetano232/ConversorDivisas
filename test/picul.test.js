const { test } = require("node:test");
const assert = require("node:assert");
const { leerPicul, convertirPicul, textoPicul, leerJin, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoPicul(leerPicul(t));

test("lee los picul, también con su carácter", () => {
  for (const t of ["2 picul", "2picul", "2 PICUL", "2 piculs", "2 pikul", "2 担", "2 擔"]) assert.deepEqual(leerPicul(t), { valor: 2, de: "picul" }, t);
  assert.equal(leerPicul("1,5 picul").valor, 1.5);
});

test("lo que no son picul, no; ni los dan del judo", () => {
  for (const t of ["picul", "2", "2 dan", "2 pic", "-2 picul", "", undefined]) assert.equal(leerPicul(t), null, String(t));
  assert.equal(leerJin("2 picul"), null);
  assert.equal(leerOmnibox("2 picul", { from: "EUR", to: "USD" }), null);
});

test("un picul son cien jin, o cien catties en Hong Kong", () => {
  cerca(convertirPicul({ valor: 1 }).valor, 50);
  cerca(convertirPicul({ valor: 1 }).hongKong, 60.478982);
  assert.equal(convertirPicul({ valor: 1 }).a, "kg");
  assert.equal(texto("1 picul"), "1 picul = 🇨🇳 50 kg · 🇭🇰 60,5 kg");
  assert.equal(texto("2 picul"), "2 picul = 🇨🇳 100 kg · 🇭🇰 121 kg");
  assert.equal(textoPicul(null), "");
});

test("en inglés, con punto y coma de miles", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("20 picul"), "20 picul = 🇨🇳 1,000 kg · 🇭🇰 1,209.6 kg");
  } finally {
    ponerIdioma("es");
  }
});
