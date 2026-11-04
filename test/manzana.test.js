const { test } = require("node:test");
const assert = require("node:assert");
const { leerManzana, convertirManzana, textoManzana, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≠ ${b}`);
const texto = (t) => textoManzana(leerManzana(t));

test("lee las manzanas", () => {
  for (const t of ["2 manzanas", "2manzanas", "2 MANZANAS", "2 manzana", "2 mz", "2mz"]) assert.deepEqual(leerManzana(t), { valor: 2, de: "manzana" }, t);
  assert.equal(leerManzana("1,5 manzanas").valor, 1.5);
});

test("lo que no son manzanas, no", () => {
  for (const t of ["manzana", "2", "2 m", "2 manzanilla", "0 manzanas", "-2 manzanas", "", undefined]) assert.equal(leerManzana(t), null, String(t));
  assert.equal(leerOmnibox("2 manzanas", { from: "EUR", to: "USD" }), null);
});

test("una manzana son 10.000 varas cuadradas", () => {
  const una = convertirManzana({ valor: 1 });
  cerca(una.m2, 6987.37169025);
  cerca(una.valor, 0.698737169025);
  assert.equal(una.a, "ha");
  assert.equal(texto("2 manzanas"), "2 manzanas = 1,4 ha · 13.975 m²");
  assert.equal(texto("1 mz"), "1 manzana = 0,7 ha · 6.987 m²");
  assert.equal(textoManzana(null), "");
});

test("en inglés, con el punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("1.5 manzanas"), "1.5 manzanas = 1.05 ha · 10,481 m²");
  } finally {
    ponerIdioma("es");
  }
});
