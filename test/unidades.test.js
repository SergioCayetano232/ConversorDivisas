const { test } = require("node:test");
const assert = require("node:assert");
const { quitarUnidad, porUnidadMetrica, leerImporte } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b, margen = 1e-6) => assert.ok(Math.abs(a - b) < margen, `${a} ≠ ${b}`);

test("el precio por libra vale su número para todo lo demás", () => {
  assert.equal(leerImporte("3,99/lb"), 3.99);
  assert.equal(leerImporte("2,49 per lb"), 2.49);
  assert.equal(leerImporte("5 por libra"), 5);
  assert.equal(leerImporte("20+5/lb"), 25, "con una cuenta delante");
});

test("reconoce cada unidad, con barra o sin ella", () => {
  const unidad = (t) => quitarUnidad(t).unidad;
  assert.equal(unidad("3,99/lb"), "lb");
  assert.equal(unidad("12 lbs"), "lb");
  assert.equal(unidad("10 libras"), "lb");
  assert.equal(unidad("0,25/oz"), "oz");
  assert.equal(unidad("100 onzas"), "oz");
  assert.equal(unidad("4,59/gal"), "gal");
  assert.equal(unidad("3,5 gallons"), "gal");
  assert.equal(unidad("1,99/fl oz"), "floz", "no se queda con el oz");
  assert.equal(unidad("1,99 fl. oz"), "floz");
  assert.equal(unidad("3,99/LB"), "lb");
  assert.equal(unidad("6,50/gal uk"), "galuk");
  assert.equal(unidad("6,50 per gal (UK)"), "galuk");
  assert.equal(unidad("6,50/gal imp"), "galuk");
  assert.equal(unidad("6,50 gallons imperial"), "galuk");
});

test("el galón inglés vale su número para todo lo demás", () => {
  assert.equal(leerImporte("6,50/gal uk"), 6.5);
  assert.equal(leerImporte("6,50 per gal (UK)"), 6.5);
});

test("sin unidad, todo como estaba", () => {
  assert.deepEqual(quitarUnidad("20+15"), { texto: "20+15", unidad: null });
  assert.equal(leerImporte("2k"), 2000);
  assert.equal(leerImporte("1,5m"), 1500000, "la m sigue siendo millón");
  assert.equal(leerImporte("20 x 3"), 60);
  assert.equal(quitarUnidad("lb").unidad, null, "la unidad sola no es nada");
  assert.equal(quitarUnidad(undefined).unidad, null);
});

test("de libra a kilo y de galón a litro", () => {
  // 1 kg son 2,2046 lb: 1 por libra son 2,2046 por kilo.
  const kilo = porUnidadMetrica(1, "lb");
  assert.equal(kilo.unidad, "kg");
  cerca(kilo.valor, 2.20462262);
  cerca(porUnidadMetrica(1, "oz").valor, 35.2739619);
  const litro = porUnidadMetrica(3.78541178, "gal");
  assert.equal(litro.unidad, "l");
  cerca(litro.valor, 1);
  cerca(porUnidadMetrica(1, "floz").valor, 33.8140227);
  // El inglés es más grande: el mismo precio sale más barato por litro.
  cerca(porUnidadMetrica(4.54609, "galuk").valor, 1);
});

test("sin unidad o sin valor, nada", () => {
  assert.equal(porUnidadMetrica(5, null), null);
  assert.equal(porUnidadMetrica(5, "km"), null);
  assert.equal(porUnidadMetrica(null, "lb"), null);
});

test("en inglés, con el punto decimal", () => {
  ponerIdioma("en");
  try {
    assert.equal(leerImporte("3.99/lb"), 3.99);
    assert.equal(leerImporte("4.59 / gal"), 4.59);
  } finally {
    ponerIdioma("es");
  }
});
