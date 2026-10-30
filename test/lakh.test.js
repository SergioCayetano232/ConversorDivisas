const { test } = require("node:test");
const assert = require("node:assert");
const { leerLakh, convertirLakh, textoLakh, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const texto = (t) => textoLakh(leerLakh(t));

test("lee los lakh y los crore, con sus otras formas", () => {
  for (const t of ["5 lakh", "5lakh", "5 LAKH", "5 lakhs", "5 lac", "5 lacs"]) assert.deepEqual(leerLakh(t), { valor: 5, de: "lakh" }, t);
  for (const t of ["2 crore", "2 crores", "2 cr", "2Cr"]) assert.deepEqual(leerLakh(t), { valor: 2, de: "crore" }, t);
  assert.equal(leerLakh("1,5 crore").valor, 1.5);
});

test("lo que no son lakh, no", () => {
  for (const t of ["lakh", "5", "5 lk", "5 crs", "-1 lakh", "", undefined]) assert.equal(leerLakh(t), null, String(t));
  assert.equal(leerOmnibox("5 lakh", { from: "EUR", to: "USD" }), null);
});

test("un lakh son cien mil y un crore, diez millones", () => {
  assert.equal(convertirLakh({ valor: 1, de: "lakh" }).valor, 100000);
  assert.equal(convertirLakh({ valor: 1, de: "crore" }).valor, 10000000);
  assert.equal(texto("5 lakh"), "5 lakh = 500.000");
  assert.equal(texto("1,5 cr"), "1,5 crore = 15.000.000");
  assert.equal(texto("2,25 lakh"), "2,25 lakh = 225.000");
  assert.equal(textoLakh(null), "");
});

test("en inglés, con coma de miles", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2.5 crore"), "2.5 crore = 25,000,000");
  } finally {
    ponerIdioma("es");
  }
});
