const { test } = require("node:test");
const assert = require("node:assert");
const { leerNudos, convertirNudos, textoNudos, leerVelocidad } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoNudos(leerNudos(t));

test("lee los nudos", () => {
  for (const t of ["20 kn", "20kn", "20 KT", "20 kts", "20 knots", "20 nudos"]) assert.deepEqual(leerNudos(t), { valor: 20, de: "kn" }, t);
  assert.deepEqual(leerNudos("1 nudo"), { valor: 1, de: "kn" });
  assert.deepEqual(leerNudos("12,5 knots"), { valor: 12.5, de: "kn" });
});

test("lo que no son nudos, no", () => {
  for (const t of ["kn", "20", "-1 kn", "20 km", "20 km/h", "", undefined]) assert.equal(leerNudos(t), null, String(t));
  assert.equal(leerVelocidad("20 kn"), null);
});

test("un nudo es una milla náutica por hora", () => {
  cerca(convertirNudos({ valor: 1 }).valor, 1.852);
  assert.equal(convertirNudos({ valor: 1 }).a, "km/h");
});

test("el texto, con un decimal", () => {
  assert.equal(texto("20 kn"), "20 kn = 37 km/h");
  assert.equal(texto("12,5 nudos"), "12,5 kn = 23,2 km/h");
  assert.equal(textoNudos(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("12.5 knots"), "12.5 kn = 23.2 km/h");
  } finally {
    ponerIdioma("es");
  }
});
