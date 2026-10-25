const { test } = require("node:test");
const assert = require("node:assert");
const { leerVolumen, convertirVolumen, textoVolumen, leerOmnibox, quitarUnidad } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoVolumen(leerVolumen(t));

test("lee los volúmenes como se escriben", () => {
  assert.deepEqual(leerVolumen("10gal"), { valor: 10, de: "gal" });
  assert.deepEqual(leerVolumen("10 gallons"), { valor: 10, de: "gal" });
  assert.deepEqual(leerVolumen("1 galón"), { valor: 1, de: "gal" });
  assert.deepEqual(leerVolumen("3 galones"), { valor: 3, de: "gal" });
  assert.deepEqual(leerVolumen("40l"), { valor: 40, de: "l" });
  assert.deepEqual(leerVolumen("1,5 litros"), { valor: 1.5, de: "l" });
  assert.deepEqual(leerVolumen("2 liters"), { valor: 2, de: "l" });
  assert.deepEqual(leerVolumen("2 litres"), { valor: 2, de: "l" });
});

test("con uk detrás, el galón inglés", () => {
  assert.deepEqual(leerVolumen("10 gal uk"), { valor: 10, de: "gal", uk: true });
  assert.deepEqual(leerVolumen("10 gallons (UK)"), { valor: 10, de: "gal", uk: true });
  assert.deepEqual(leerVolumen("40 l imperial"), { valor: 40, de: "l", uk: true });
  cerca(convertirVolumen({ valor: 1, de: "gal", uk: true }).valor, 4.54609);
  assert.equal(texto("10 gal uk"), "10 gal UK = 45,5 l");
  assert.equal(texto("40 litros uk"), "40 l = 8,8 gal UK");
  assert.equal(leerVolumen("10 gal usa"), null);
});

test("con us detrás, el americano de siempre", () => {
  for (const t of ["10 gal us", "10 gal US", "10 gallons (US)", "10gal us"]) assert.deepEqual(leerVolumen(t), { valor: 10, de: "gal" }, t);
  assert.equal(texto("10 gal us"), "10 gal = 37,9 l");
});

test("lo que no son volúmenes, no", () => {
  for (const t of ["gal", "10", "4,59/gal", "4,59 por galón", "10 lb", "20 usd", "-5 l", "", undefined]) assert.equal(leerVolumen(t), null, String(t));
});

test("el precio por galón sigue siendo un precio", () => {
  assert.equal(leerOmnibox("4,59/gal", { from: "USD", to: "EUR" }).cantidad, 4.59);
  assert.equal(quitarUnidad("4,59/gal").unidad, "gal");
});

test("de galones a litros y al revés", () => {
  cerca(convertirVolumen({ valor: 1, de: "gal" }).valor, 3.78541178);
  cerca(convertirVolumen({ valor: 3.78541178, de: "l" }).valor, 1);
  assert.equal(convertirVolumen({ valor: 1, de: "l" }).a, "gal");
});

test("el texto, con un decimal", () => {
  assert.equal(texto("10gal"), "10 gal = 37,9 l");
  assert.equal(texto("40 litros"), "40 l = 10,6 gal");
  assert.equal(textoVolumen(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("10gal"), "10 gal = 37.9 l");
  } finally {
    ponerIdioma("es");
  }
});
