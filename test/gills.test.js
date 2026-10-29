const { test } = require("node:test");
const assert = require("node:assert");
const { leerGills, convertirGills, textoGills, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoGills(leerGills(t));

test("lee los gills", () => {
  for (const t of ["2 gills", "2gills", "2 gill", "2 GILLS"]) assert.deepEqual(leerGills(t), { valor: 2, de: "gill" }, t);
  assert.equal(leerGills("0,5 gill").valor, 0.5);
});

test("lo que no son gills, no", () => {
  for (const t of ["gill", "2", "2 gi", "-1 gill", "", undefined]) assert.equal(leerGills(t), null, String(t));
  assert.equal(leerOmnibox("1 gill", { from: "EUR", to: "USD" }), null);
});

test("un gill es un cuarto de pinta, la de cada sitio", () => {
  cerca(convertirGills({ valor: 1 }).valor, 118.29411825);
  cerca(convertirGills({ valor: 1 }).inglesa, 142.0653125);
  assert.equal(convertirGills({ valor: 1 }).a, "ml");
  assert.equal(texto("1 gill"), "1 gill = 🇺🇸 118 ml · 🇬🇧 142 ml");
  assert.equal(texto("2 gills"), "2 gills = 🇺🇸 237 ml · 🇬🇧 284 ml");
  assert.equal(textoGills(null), "");
});

test("en inglés, con coma de miles", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("10 gills"), "10 gills = 🇺🇸 1,183 ml · 🇬🇧 1,421 ml");
  } finally {
    ponerIdioma("es");
  }
});
