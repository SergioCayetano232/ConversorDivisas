const { test } = require("node:test");
const assert = require("node:assert");
const { leerMach, convertirMach, textoMach, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoMach(leerMach(t));

test("lee el Mach, delante o detrás", () => {
  for (const t of ["mach 2", "Mach 2", "mach2", "MACH 2", "2 mach", "2mach"]) assert.deepEqual(leerMach(t), { valor: 2, de: "mach" }, t);
  assert.equal(leerMach("Mach 0,85").valor, 0.85);
});

test("lo que no es Mach, no", () => {
  for (const t of ["mach", "2", "mach 0", "mach -1", "m2", "2 machs", "", undefined]) assert.equal(leerMach(t), null, String(t));
  assert.equal(leerOmnibox("mach 2", { from: "EUR", to: "USD" }), null);
});

test("abajo el sonido va más rápido que a 11 km", () => {
  cerca(convertirMach({ valor: 1 }).valor, 1225.0584);
  cerca(convertirMach({ valor: 1 }).arriba, 1062.252);
  assert.equal(convertirMach({ valor: 1 }).a, "km/h");
  assert.equal(texto("mach 2"), "Mach 2 = 🌊 2.450 km/h · ✈️ 2.125 km/h");
  assert.equal(texto("0,85 mach"), "Mach 0,85 = 🌊 1.041 km/h · ✈️ 903 km/h");
  assert.equal(textoMach(null), "");
});

test("en inglés, con el punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("Mach 0.85"), "Mach 0.85 = 🌊 1,041 km/h · ✈️ 903 km/h");
  } finally {
    ponerIdioma("es");
  }
});
