const { test } = require("node:test");
const assert = require("node:assert");
const { parseAmount } = require("../logica.js");

test("lee números normales", () => {
  assert.equal(parseAmount("1"), 1);
  assert.equal(parseAmount("100"), 100);
  assert.equal(parseAmount("0"), 0);
});

test("la coma es el separador decimal", () => {
  assert.equal(parseAmount("1,5"), 1.5);
  assert.equal(parseAmount("0,99"), 0.99);
});

test("el punto separa los miles", () => {
  // Esto se rompió al hacer editable el resultado: al reescribir el campo ya
  // formateado, "1.000" entraba como un 1.
  assert.equal(parseAmount("1.000"), 1000);
  assert.equal(parseAmount("1.084,70"), 1084.7);
  assert.equal(parseAmount("999.999,99"), 999999.99);
});

test("aguanta espacios alrededor", () => {
  assert.equal(parseAmount("  2.500,50  "), 2500.5);
});

test("descarta lo que no es un importe", () => {
  assert.equal(parseAmount(""), null);
  assert.equal(parseAmount("   "), null);
  assert.equal(parseAmount("hola"), null);
  assert.equal(parseAmount("1,,5"), null);
  assert.equal(parseAmount("-5"), null);
});

test("lo que formateo lo sé volver a leer", () => {
  const nf = new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  for (const n of [1, 1.5, 250, 1000, 12345.67, 999999.99]) {
    assert.ok(Math.abs(parseAmount(nf.format(n)) - n) < 0.005, `falla con ${n}`);
  }
});
