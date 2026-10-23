const { test } = require("node:test");
const assert = require("node:assert");
const { leerGrados, convertirGrados, textoGrados, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoGrados(leerGrados(t));

test("lee los grados como se escriben", () => {
  assert.deepEqual(leerGrados("75f"), { valor: 75, de: "f" });
  assert.deepEqual(leerGrados("75 °F"), { valor: 75, de: "f" });
  assert.deepEqual(leerGrados("20 celsius"), { valor: 20, de: "c" });
  assert.deepEqual(leerGrados("-5 c"), { valor: -5, de: "c" });
  assert.deepEqual(leerGrados("−40F"), { valor: -40, de: "f" }, "con el menos de verdad");
  assert.deepEqual(leerGrados("98,6f"), { valor: 98.6, de: "f" });
  assert.deepEqual(leerGrados("98.6f"), { valor: 98.6, de: "f" });
});

test("lo que no son grados, no", () => {
  for (const t of ["20 cad", "f", "20", "20 usd", "", "20 fc", undefined]) assert.equal(leerGrados(t), null, String(t));
});

test("las divisas siguen siendo divisas", () => {
  assert.equal(leerGrados("20 chf"), null);
  assert.ok(leerOmnibox("20 chf", { from: "EUR", to: "USD" }));
});

test("de Fahrenheit a Celsius y al revés", () => {
  cerca(convertirGrados({ valor: 32, de: "f" }).valor, 0);
  cerca(convertirGrados({ valor: 212, de: "f" }).valor, 100);
  cerca(convertirGrados({ valor: 100, de: "c" }).valor, 212);
  assert.equal(convertirGrados({ valor: 0, de: "c" }).a, "f");
  cerca(convertirGrados({ valor: -40, de: "f" }).valor, -40);
});

test("el texto, con un decimal", () => {
  assert.equal(texto("75f"), "75 °F = 23,9 °C");
  assert.equal(texto("20c"), "20 °C = 68 °F");
  assert.equal(texto("98,6 f"), "98,6 °F = 37 °C");
  assert.equal(texto("32f"), "32 °F = 0 °C", "sin -0");
  assert.equal(textoGrados(null), "");
});

test("los kelvin, solo con la palabra entera", () => {
  assert.deepEqual(leerGrados("300 kelvin"), { valor: 300, de: "k" });
  assert.deepEqual(leerGrados("300 Kelvins"), { valor: 300, de: "k" });
  assert.equal(leerGrados("300 K"), null);
  assert.equal(leerGrados("-5 kelvin"), null);
  assert.equal(leerOmnibox("300k", { from: "EUR", to: "USD" }).cantidad, 300000);
  assert.equal(textoGrados(leerGrados("300 kelvin")), "300 K = 26,9 °C");
  assert.equal(textoGrados(leerGrados("273,15 kelvin")), "273,2 K = 0 °C");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("75f"), "75 °F = 23.9 °C");
  } finally {
    ponerIdioma("es");
  }
});
