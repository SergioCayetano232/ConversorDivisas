const { test } = require("node:test");
const assert = require("node:assert");
const { leerYardasCubicas, convertirYardasCubicas, textoYardasCubicas, leerYardas, leerPiesCubicos, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoYardasCubicas(leerYardasCubicas(t));

test("lee las yardas cúbicas", () => {
  for (const t of ["2 cu yd", "2cuyd", "2 cu. yd", "2 cu yds", "2 cu yards", "2 yd³", "2 cubic yards", "2 yardas cúbicas"]) assert.deepEqual(leerYardasCubicas(t), { valor: 2, de: "cu yd" }, t);
  assert.deepEqual(leerYardasCubicas("1 cubic yard"), { valor: 1, de: "cu yd" });
  assert.equal(leerYardasCubicas("1,5 cu yd").valor, 1.5);
});

test("lo que no son yardas cúbicas, no; y las otras yardas siguen a lo suyo", () => {
  for (const t of ["cu yd", "2", "2 yd", "2 sq yd", "2 cu ft", "-1 cu yd", "", undefined]) assert.equal(leerYardasCubicas(t), null, String(t));
  assert.equal(leerYardas("2 cu yd"), null);
  assert.ok(leerYardas("100 yd"));
  assert.equal(leerPiesCubicos("2 cu yd"), null);
  assert.equal(leerOmnibox("2 cu yd", { from: "EUR", to: "USD" }), null);
});

test("una yarda cúbica son 0,76 m³", () => {
  cerca(convertirYardasCubicas({ valor: 1 }).valor, 0.764554857984);
  assert.equal(convertirYardasCubicas({ valor: 1 }).a, "m³");
  assert.equal(texto("2 cu yd"), "2 cu yd = 1,53 m³");
  assert.equal(textoYardasCubicas(null), "");
});

test("y los m³ al revés", () => {
  for (const t of ["2 m³", "2m3", "2 metros cúbicos", "2 cubic meters", "2 cubic metres"]) assert.deepEqual(leerYardasCubicas(t), { valor: 2, de: "m³" }, t);
  assert.equal(leerYardasCubicas("1 metro cúbico").valor, 1);
  assert.equal(convertirYardasCubicas({ valor: 1, de: "m³" }).a, "cu yd");
  assert.equal(texto("2 m³"), "2 m³ = 2,62 cu yd");
  assert.equal(leerYardasCubicas("2 m"), null);
  assert.equal(leerYardasCubicas("2 m²"), null);
  assert.equal(leerOmnibox("2 m3", { from: "EUR", to: "USD" }), null);
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("1.5 cubic yards"), "1.5 cu yd = 1.15 m³");
  } finally {
    ponerIdioma("es");
  }
});
