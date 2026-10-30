const { test } = require("node:test");
const assert = require("node:assert");
const { leerThou, convertirThou, textoThou, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoThou(leerThou(t));

test("lee los thou", () => {
  for (const t of ["2 thou", "2thou", "2 THOU"]) assert.deepEqual(leerThou(t), { valor: 2, de: "thou" }, t);
  assert.equal(leerThou("1,5 thou").valor, 1.5);
});

test("lo que no son thou, no, y el mil tampoco", () => {
  for (const t of ["thou", "2", "2 mil", "2 mils", "2 thous", "-1 thou", "", undefined]) assert.equal(leerThou(t), null, String(t));
  assert.equal(leerOmnibox("2 thou", { from: "EUR", to: "USD" }), null);
});

test("un thou es la milésima de pulgada", () => {
  cerca(convertirThou({ valor: 1000 }).valor, 25.4);
  assert.equal(convertirThou({ valor: 1 }).a, "mm");
  assert.equal(texto("2 thou"), "2 thou = 0,051 mm · 51 µm");
  assert.equal(texto("10 thou"), "10 thou = 0,254 mm · 254 µm");
  assert.equal(textoThou(null), "");
});

test("en inglés, con el punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("1.5 thou"), "1.5 thou = 0.038 mm · 38 µm");
  } finally {
    ponerIdioma("es");
  }
});
