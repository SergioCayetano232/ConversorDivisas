const { test } = require("node:test");
const assert = require("node:assert");
const { leerPiesCubicos, convertirPiesCubicos, textoPiesCubicos, leerAltura, leerSuperficie, leerVolumen, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoPiesCubicos(leerPiesCubicos(t));

test("lee los pies cúbicos", () => {
  for (const t of ["10 cu ft", "10cuft", "10 cu. ft", "10 cu feet", "10 ft³", "10 cubic feet", "10 pies cúbicos"]) assert.deepEqual(leerPiesCubicos(t), { valor: 10, de: "cu ft" }, t);
  assert.deepEqual(leerPiesCubicos("1 cubic foot"), { valor: 1, de: "cu ft" });
  assert.equal(leerPiesCubicos("2,5 cu ft").valor, 2.5);
});

test("lo que no son pies cúbicos, no; y los otros pies siguen a lo suyo", () => {
  for (const t of ["cu ft", "10", "10 ft", "10 ft3", "10 sq ft", "-1 cu ft", "", undefined]) assert.equal(leerPiesCubicos(t), null, String(t));
  assert.equal(leerAltura("10 cu ft"), null);
  assert.ok(leerAltura("10 ft3"), "10 ft3 son 10 pies y 3 pulgadas");
  assert.equal(leerSuperficie("10 cu ft"), null);
  assert.equal(leerVolumen("10 cu ft"), null);
  assert.equal(leerOmnibox("10 cu ft", { from: "EUR", to: "USD" }), null);
});

test("un pie cúbico son 28,3 litros", () => {
  cerca(convertirPiesCubicos({ valor: 1 }).valor, 28.316846592);
  assert.equal(convertirPiesCubicos({ valor: 1 }).a, "l");
  assert.equal(texto("10 cu ft"), "10 cu ft = 283 l");
  assert.equal(textoPiesCubicos(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("18.5 cubic feet"), "18.5 cu ft = 524 l");
  } finally {
    ponerIdioma("es");
  }
});
