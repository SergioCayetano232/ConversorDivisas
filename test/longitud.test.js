const { test } = require("node:test");
const assert = require("node:assert");
const { leerLongitud, convertirLongitud, textoLongitud, leerOmnibox, leerAltura, leerDistancia } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoLongitud(leerLongitud(t));

test("lee las longitudes como se escriben", () => {
  assert.deepEqual(leerLongitud("55in"), { valor: 55, de: "in" });
  assert.deepEqual(leerLongitud("55 in"), { valor: 55, de: "in" });
  assert.deepEqual(leerLongitud('32"'), { valor: 32, de: "in" });
  assert.deepEqual(leerLongitud("1 inch"), { valor: 1, de: "in" });
  assert.deepEqual(leerLongitud("6 inches"), { valor: 6, de: "in" });
  assert.deepEqual(leerLongitud("15,6 pulgadas"), { valor: 15.6, de: "in" });
  assert.deepEqual(leerLongitud("40cm"), { valor: 40, de: "cm" });
  assert.deepEqual(leerLongitud("55 centímetros"), { valor: 55, de: "cm" });
  assert.deepEqual(leerLongitud("10 centimeters"), { valor: 10, de: "cm" });
});

test("lo que no son longitudes, no", () => {
  for (const t of ["in", "55", "20 in usd", "6ft", "-5 cm", "", undefined]) assert.equal(leerLongitud(t), null, String(t));
});

test("no pisa las otras medidas ni el \"in\" de las divisas", () => {
  assert.equal(leerOmnibox("20 in usd", { from: "EUR", to: "USD" }).from, "USD");
  assert.equal(leerAltura("55in"), null);
  assert.equal(leerDistancia("40cm"), null);
});

test("de pulgadas a centímetros y al revés", () => {
  cerca(convertirLongitud({ valor: 1, de: "in" }).valor, 2.54);
  cerca(convertirLongitud({ valor: 2.54, de: "cm" }).valor, 1);
  assert.equal(convertirLongitud({ valor: 1, de: "cm" }).a, "in");
});

test("el texto, con un decimal", () => {
  assert.equal(texto("55in"), "55 in = 139,7 cm");
  assert.equal(texto("40cm"), "40 cm = 15,7 in");
  assert.equal(textoLongitud(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("55in"), "55 in = 139.7 cm");
  } finally {
    ponerIdioma("es");
  }
});
