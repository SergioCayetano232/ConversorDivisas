const { test } = require("node:test");
const assert = require("node:assert");
const { leerTael, convertirTael, textoTael, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoTael(leerTael(t));

test("lee los taels, también como 兩 o liang", () => {
  for (const t of ["2 tael", "2tael", "2 TAELS", "2 兩", "2 两", "2 liang"]) assert.deepEqual(leerTael(t), { valor: 2, de: "tael" }, t);
  assert.equal(leerTael("0,5 tael").valor, 0.5);
});

test("lo que no son taels, no", () => {
  for (const t of ["tael", "2", "2 ta", "2 liangs", "-1 tael", "", undefined]) assert.equal(leerTael(t), null, String(t));
  assert.equal(leerOmnibox("1 tael", { from: "EUR", to: "USD" }), null);
});

test("en Hong Kong, un dieciseisavo de catty; en China, 50 g; y el del oro, aparte", () => {
  cerca(convertirTael({ valor: 16 }).valor, 604.78982);
  cerca(convertirTael({ valor: 1 }).china, 50);
  cerca(convertirTael({ valor: 1 }).oro, 37.429);
  assert.equal(convertirTael({ valor: 1 }).a, "g");
  assert.equal(texto("1 tael"), "1 tael = 🇭🇰 37,8 g · 🇨🇳 50 g · oro 37,43 g");
  assert.equal(texto("2 兩"), "2 tael = 🇭🇰 75,6 g · 🇨🇳 100 g · oro 74,86 g");
  assert.equal(textoTael(null), "");
});

test("en inglés, con el punto y gold", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("0.5 taels"), "0.5 tael = 🇭🇰 18.9 g · 🇨🇳 25 g · gold 18.71 g");
  } finally {
    ponerIdioma("es");
  }
});
