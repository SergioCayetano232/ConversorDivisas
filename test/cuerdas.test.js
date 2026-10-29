const { test } = require("node:test");
const assert = require("node:assert");
const { leerCuerdas, convertirCuerdas, textoCuerdas, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoCuerdas(leerCuerdas(t));

test("lee las cuerdas de leña", () => {
  for (const t of ["2 cords", "2cords", "2 cord", "2 CORDS", "2 cuerdas"]) assert.deepEqual(leerCuerdas(t), { valor: 2, de: "cord" }, t);
  assert.equal(leerCuerdas("0,5 cord").valor, 0.5);
});

test("lo que no son cuerdas, no", () => {
  for (const t of ["cord", "2", "2 cor", "-1 cord", "", undefined]) assert.equal(leerCuerdas(t), null, String(t));
  assert.equal(leerOmnibox("1 cord", { from: "EUR", to: "USD" }), null);
});

test("una cuerda son 128 pies cúbicos, 3,62 m³", () => {
  cerca(convertirCuerdas({ valor: 1 }).valor, 3.624556363776);
  assert.equal(convertirCuerdas({ valor: 1 }).a, "m³");
  assert.equal(texto("1 cord"), "1 cord = 3,62 m³");
  assert.equal(texto("0,5 cords"), "0,5 cords = 1,81 m³");
  assert.equal(textoCuerdas(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("1 cord"), "1 cord = 3.62 m³");
  } finally {
    ponerIdioma("es");
  }
});
