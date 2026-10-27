const { test } = require("node:test");
const assert = require("node:assert");
const { leerMetrosPorSegundo, convertirMetrosPorSegundo, textoMetrosPorSegundo, leerOmnibox, leerVelocidad, leerAltura } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoMetrosPorSegundo(leerMetrosPorSegundo(t));

test("lee los metros por segundo", () => {
  for (const t of ["10 m/s", "10m/s", "10 M/S", "10 mps", "10 metros por segundo", "10 meters per second"]) assert.deepEqual(leerMetrosPorSegundo(t), { valor: 10, de: "m/s" }, t);
  assert.equal(leerMetrosPorSegundo("7,5 m/s").valor, 7.5);
});

test("lo que no son metros por segundo, no", () => {
  for (const t of ["m/s", "10", "-5 m/s", "10 m", "10 km/h", "", undefined]) assert.equal(leerMetrosPorSegundo(t), null, String(t));
  assert.equal(leerOmnibox("10 m/s", { from: "EUR", to: "USD" }), null);
  assert.equal(leerVelocidad("10 m/s"), null);
  assert.equal(leerAltura("10 m/s"), null);
});

test("un metro por segundo son 3,6 km/h", () => {
  cerca(convertirMetrosPorSegundo({ valor: 1 }).valor, 3.6);
  assert.equal(convertirMetrosPorSegundo({ valor: 1 }).a, "km/h");
  assert.equal(texto("10 m/s"), "10 m/s = 36 km/h");
  assert.equal(texto("7,5 m/s"), "7,5 m/s = 27 km/h");
  assert.equal(textoMetrosPorSegundo(null), "");
});

test("los pies por segundo, a m/s", () => {
  for (const t of ["100 ft/s", "100ft/s", "100 FT/S", "100 feet per second", "100 pies por segundo"]) assert.deepEqual(leerMetrosPorSegundo(t), { valor: 100, de: "ft/s" }, t);
  cerca(convertirMetrosPorSegundo({ valor: 1, de: "ft/s" }).valor, 0.3048);
  assert.equal(convertirMetrosPorSegundo({ valor: 1, de: "ft/s" }).a, "m/s");
  assert.equal(texto("100 ft/s"), "100 ft/s = 30,5 m/s");
  for (const t of ["60 fps", "100 ft", "100 f/s"]) assert.equal(leerMetrosPorSegundo(t), null, t);
  assert.equal(leerAltura("100 ft/s"), null);
  assert.equal(leerOmnibox("100 ft/s", { from: "EUR", to: "USD" }), null);
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("4,2 m/s"), "4.2 m/s = 15.1 km/h");
  } finally {
    ponerIdioma("es");
  }
});
