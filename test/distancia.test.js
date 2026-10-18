const { test } = require("node:test");
const assert = require("node:assert");
const { leerDistancia, convertirDistancia, textoDistancia, leerOmnibox, leerGrados } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoDistancia(leerDistancia(t));

test("lee las distancias como se escriben", () => {
  assert.deepEqual(leerDistancia("10mi"), { valor: 10, de: "mi" });
  assert.deepEqual(leerDistancia("10 millas"), { valor: 10, de: "mi" });
  assert.deepEqual(leerDistancia("1 mile"), { valor: 1, de: "mi" });
  assert.deepEqual(leerDistancia("5km"), { valor: 5, de: "km" });
  assert.deepEqual(leerDistancia("42,195 kilómetros"), { valor: 42.195, de: "km" });
  assert.deepEqual(leerDistancia("2.5 KM"), { valor: 2.5, de: "km" });
});

test("lo que no son distancias, no", () => {
  for (const t of ["mi", "10", "10 m", "1m", "20 usd", "-5 km", "", undefined]) assert.equal(leerDistancia(t), null, String(t));
});

test("no pisa los millones ni los grados", () => {
  assert.ok(leerOmnibox("1m usd", { from: "EUR", to: "USD" }));
  assert.equal(leerDistancia("75f"), null);
  assert.equal(leerGrados("10mi"), null);
});

test("de millas a km y al revés", () => {
  cerca(convertirDistancia({ valor: 1, de: "mi" }).valor, 1.609344);
  cerca(convertirDistancia({ valor: 1.609344, de: "km" }).valor, 1);
  assert.equal(convertirDistancia({ valor: 5, de: "km" }).a, "mi");
});

test("el texto, con un decimal", () => {
  assert.equal(texto("10mi"), "10 mi = 16,1 km");
  assert.equal(texto("5 km"), "5 km = 3,1 mi");
  assert.equal(texto("0 km"), "0 km = 0 mi");
  assert.equal(textoDistancia(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("10mi"), "10 mi = 16.1 km");
  } finally {
    ponerIdioma("es");
  }
});
