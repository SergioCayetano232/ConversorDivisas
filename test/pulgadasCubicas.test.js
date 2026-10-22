const { test } = require("node:test");
const assert = require("node:assert");
const { leerPulgadasCubicas, convertirPulgadasCubicas, textoPulgadasCubicas, leerLongitud, leerAltura, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoPulgadasCubicas(leerPulgadasCubicas(t));

test("lee las pulgadas cúbicas", () => {
  for (const t of ["350 ci", "350ci", "350 CID", "350 cu in", "350 cu. in.", "350 in³", "350 cubic inches", "350 pulgadas cúbicas"]) assert.deepEqual(leerPulgadasCubicas(t), { valor: 350, de: "ci" }, t);
  assert.deepEqual(leerPulgadasCubicas("1 cubic inch"), { valor: 1, de: "ci" });
});

test("lo que no son pulgadas cúbicas, no; y las pulgadas siguen a lo suyo", () => {
  for (const t of ["ci", "350", "350 in", "350 cu ft", "-1 ci", "", undefined]) assert.equal(leerPulgadasCubicas(t), null, String(t));
  assert.equal(leerLongitud("350 cu in"), null);
  assert.equal(leerAltura("350 cu in"), null);
  assert.equal(leerOmnibox("350 ci", { from: "EUR", to: "USD" }), null);
});

test("un 350 son 5,7 litros", () => {
  cerca(convertirPulgadasCubicas({ valor: 1 }).valor, 0.016387064);
  assert.equal(convertirPulgadasCubicas({ valor: 1 }).a, "l");
  assert.equal(texto("350 ci"), "350 ci = 5,7 l");
  assert.equal(textoPulgadasCubicas(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("427 cubic inches"), "427 ci = 7 l");
  } finally {
    ponerIdioma("es");
  }
});
