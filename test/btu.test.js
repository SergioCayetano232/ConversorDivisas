const { test } = require("node:test");
const assert = require("node:assert");
const { leerBtu, convertirBtu, textoBtu, leerPotencia, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoBtu(leerBtu(t));

test("lee los BTU", () => {
  for (const t of ["12000 btu", "12000btu", "12000 BTU", "12000 btus", "12000 btu/h"]) assert.deepEqual(leerBtu(t), { valor: 12000, de: "BTU" }, t);
});

test("12.000 y 12,000 son doce mil, no doce", () => {
  assert.equal(leerBtu("12.000 btu").valor, 12000);
  assert.equal(leerBtu("12,000 btu").valor, 12000);
  assert.equal(leerBtu("1.500.000 btu").valor, 1500000);
  assert.equal(leerBtu("9,5 btu").valor, 9.5);
});

test("lo que no son BTU, no; y la potencia sigue a lo suyo", () => {
  for (const t of ["btu", "12000", "12000 hp", "-1 btu", "", undefined]) assert.equal(leerBtu(t), null, String(t));
  assert.equal(leerPotencia("12000 btu"), null);
  assert.equal(leerOmnibox("12000 btu", { from: "EUR", to: "USD" }), null);
});

test("12.000 BTU son 3,5 kW", () => {
  cerca(convertirBtu({ valor: 1 }).valor, 0.00029307107);
  assert.equal(convertirBtu({ valor: 1 }).a, "kW");
  assert.equal(texto("12000 btu"), "12.000 BTU = 3,5 kW");
  assert.equal(textoBtu(null), "");
});

test("en inglés, con coma de miles", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("12,000 btu"), "12,000 BTU = 3.5 kW");
  } finally {
    ponerIdioma("es");
  }
});
