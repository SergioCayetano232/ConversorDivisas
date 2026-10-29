const { test } = require("node:test");
const assert = require("node:assert");
const { leerRods, convertirRods, textoRods, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoRods(leerRods(t));

test("lee los rods, y los perches y poles", () => {
  for (const t of ["10 rods", "10rods", "10 rod", "10 RODS", "10 perches", "10 perch", "10 poles", "10 pole"]) assert.deepEqual(leerRods(t), { valor: 10, de: "rod" }, t);
  assert.equal(leerRods("1,5 rods").valor, 1.5);
});

test("lo que no son rods, no", () => {
  for (const t of ["10 rd", "rods", "10", "-1 rod", "", undefined]) assert.equal(leerRods(t), null, String(t));
  assert.equal(leerOmnibox("10 rods", { from: "EUR", to: "USD" }), null);
});

test("un rod son 5,03 m", () => {
  cerca(convertirRods({ valor: 1 }).valor, 5.0292);
  cerca(convertirRods({ valor: 4 }).valor, 20.1168);
  assert.equal(convertirRods({ valor: 1 }).a, "m");
  assert.equal(texto("10 rods"), "10 rods = 50,3 m");
  assert.equal(texto("1 perch"), "1 rod = 5 m");
  assert.equal(textoRods(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("10 rods"), "10 rods = 50.3 m");
  } finally {
    ponerIdioma("es");
  }
});
