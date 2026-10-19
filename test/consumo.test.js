const { test } = require("node:test");
const assert = require("node:assert");
const { leerConsumo, convertirConsumo, textoConsumo, leerVolumen, leerVelocidad, leerDistancia } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoConsumo(leerConsumo(t));

test("lee los consumos como se escriben", () => {
  assert.deepEqual(leerConsumo("30mpg"), { valor: 30, de: "mpg" });
  assert.deepEqual(leerConsumo("30 MPG"), { valor: 30, de: "mpg" });
  assert.deepEqual(leerConsumo("30 miles per gallon"), { valor: 30, de: "mpg" });
  assert.deepEqual(leerConsumo("30 millas por galón"), { valor: 30, de: "mpg" });
  assert.deepEqual(leerConsumo("6,5 l/100km"), { valor: 6.5, de: "l/100 km" });
  assert.deepEqual(leerConsumo("6.5 l/100 km"), { valor: 6.5, de: "l/100 km" });
  assert.deepEqual(leerConsumo("7l/100"), { valor: 7, de: "l/100 km" });
});

test("lo que no son consumos, no", () => {
  for (const t of ["mpg", "30", "0mpg", "0 l/100km", "-5 mpg", "10gal", "", undefined]) assert.equal(leerConsumo(t), null, String(t));
});

test("no pisa los litros, las millas ni los km/h", () => {
  assert.equal(leerVolumen("6 l/100km"), null);
  assert.equal(leerDistancia("30mpg"), null);
  assert.equal(leerVelocidad("30mpg"), null);
  assert.ok(leerVolumen("10gal"));
});

test("de mpg a l/100 km y vuelta, con la misma cuenta", () => {
  const ida = convertirConsumo({ valor: 30, de: "mpg" });
  assert.equal(ida.a, "l/100 km");
  cerca(ida.valor, 7.840486102826);
  const vuelta = convertirConsumo({ valor: ida.valor, de: "l/100 km" });
  assert.equal(vuelta.a, "mpg");
  cerca(vuelta.valor, 30);
});

test("el texto, con un decimal", () => {
  assert.equal(texto("30mpg"), "30 mpg = 7,8 l/100 km");
  assert.equal(texto("5 l/100km"), "5 l/100 km = 47 mpg");
  assert.equal(textoConsumo(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("30mpg"), "30 mpg = 7.8 l/100 km");
    assert.equal(texto("6,5 l/100km"), "6.5 l/100 km = 36.2 mpg");
  } finally {
    ponerIdioma("es");
  }
});
