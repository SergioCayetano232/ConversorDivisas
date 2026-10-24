const { test } = require("node:test");
const assert = require("node:assert");
const { leerPulgadasCuadradas, convertirPulgadasCuadradas, textoPulgadasCuadradas, leerLongitud, leerSuperficie, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoPulgadasCuadradas(leerPulgadasCuadradas(t));

test("lee las pulgadas cuadradas", () => {
  for (const t of ["12 sq in", "12sqin", "12 sq. in", "12 sq inches", "12 in²", "12 in2", "12 square inches", "12 pulgadas cuadradas"]) assert.deepEqual(leerPulgadasCuadradas(t), { valor: 12, de: "sq in" }, t);
  assert.deepEqual(leerPulgadasCuadradas("1 square inch"), { valor: 1, de: "sq in" });
});

test("lo que no son pulgadas cuadradas, no; y las otras siguen a lo suyo", () => {
  for (const t of ["sq in", "12", "12 in", "12 sq ft", "-1 sq in", "", undefined]) assert.equal(leerPulgadasCuadradas(t), null, String(t));
  assert.equal(leerLongitud("12 sq in"), null);
  assert.equal(leerSuperficie("12 sq in"), null);
  assert.equal(leerOmnibox("12 sq in", { from: "EUR", to: "USD" }), null);
});

test("una pulgada cuadrada son 6,45 cm²", () => {
  cerca(convertirPulgadasCuadradas({ valor: 1 }).valor, 6.4516);
  assert.equal(convertirPulgadasCuadradas({ valor: 1 }).a, "cm²");
  assert.equal(texto("12 sq in"), "12 sq in = 77,4 cm²");
  assert.equal(textoPulgadasCuadradas(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("1.5 sq in"), "1.5 sq in = 9.7 cm²");
  } finally {
    ponerIdioma("es");
  }
});
