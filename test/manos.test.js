const { test } = require("node:test");
const assert = require("node:assert");
const { leerManos, convertirManos, textoManos, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoManos(leerManos(t));

test("lee la alzada en manos", () => {
  for (const t of ["15 hh", "15hh", "15 HH", "15 hands", "15 hand", "15 manos"]) assert.deepEqual(leerManos(t), { manos: 15, pulgadas: 0, de: "hh" }, t);
  assert.deepEqual(leerManos("15.2 hh"), { manos: 15, pulgadas: 2, de: "hh" });
  assert.deepEqual(leerManos("15,2 hh"), { manos: 15, pulgadas: 2, de: "hh" });
});

test("detrás del punto van pulgadas, de 0 a 3", () => {
  for (const t of ["15.4 hh", "15.5 hh", "15.25 hh", "hh", "15", "0 hh", "-15 hh", "", undefined]) assert.equal(leerManos(t), null, String(t));
  assert.equal(leerOmnibox("15.2 hh", { from: "EUR", to: "USD" }), null);
  assert.equal(leerOmnibox("15 manos", { from: "EUR", to: "USD" }), null);
});

test("15.2 hh son 157 cm, no 154", () => {
  cerca(convertirManos({ manos: 1, pulgadas: 0 }).valor, 10.16);
  cerca(convertirManos({ manos: 15, pulgadas: 2 }).valor, 62 * 2.54);
  assert.equal(convertirManos({ manos: 15, pulgadas: 0 }).a, "cm");
  assert.equal(texto("15.2 hh"), "15.2 hh = 157 cm");
  assert.equal(texto("16 hh"), "16.0 hh = 163 cm");
  assert.equal(textoManos(null), "");
});

test("en inglés igual, con el punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("15.2 hands"), "15.2 hh = 157 cm");
  } finally {
    ponerIdioma("es");
  }
});
