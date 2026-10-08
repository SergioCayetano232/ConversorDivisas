const { test } = require("node:test");
const assert = require("node:assert");
const { leerImpuesto, leerImpuestoEscrito, loQuePagas, IMPUESTOS_RAPIDOS, limpiarCopia, CLAVES_COPIA } = require("../logica.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);

test("sin nada guardado, sin impuesto", () => {
  assert.equal(leerImpuesto(undefined), 0);
  assert.equal(leerImpuesto("8"), 0);
  assert.equal(leerImpuesto(-1), 0);
  assert.equal(leerImpuesto(30), 0, "más de un 25 % es un error");
  assert.equal(leerImpuesto(8.875), 8.875);
});

test("lo escrito se entiende con coma, punto o el % detrás, y con tres decimales", () => {
  assert.equal(leerImpuestoEscrito("8,875"), 8.875);
  assert.equal(leerImpuestoEscrito("7.25 %"), 7.25);
  assert.equal(leerImpuestoEscrito("13"), 13);
  assert.equal(leerImpuestoEscrito("8,8754"), 8.875);
});

test("lo que no es un impuesto no vale", () => {
  assert.equal(leerImpuestoEscrito(""), null);
  assert.equal(leerImpuestoEscrito("abc"), null);
  assert.equal(leerImpuestoEscrito("-5"), null);
  assert.equal(leerImpuestoEscrito("26"), null);
});

test("las rápidas empiezan en sin impuesto", () => {
  assert.equal(IMPUESTOS_RAPIDOS[0], 0);
});

test("primero el impuesto y la comisión encima", () => {
  cerca(loQuePagas(100, 0, 0), 100);
  cerca(loQuePagas(100, 0, 8.875), 108.875);
  cerca(loQuePagas(100, 2, 0), 102);
  cerca(loQuePagas(100, 2, 10), 112.2, "el banco cobra también sobre el impuesto");
});

test("sin cifra no hay total", () => {
  assert.equal(loQuePagas(null, 2, 8), null);
  assert.equal(loQuePagas(NaN, 2, 8), null);
});

test("la copia de seguridad guarda el impuesto", () => {
  assert.ok(CLAVES_COPIA.includes("impuestoVenta"));
  assert.equal(limpiarCopia({ impuestoVenta: 8.875 }).impuestoVenta, 8.875);
  assert.equal(limpiarCopia({ impuestoVenta: 99 }).impuestoVenta, 0);
  assert.equal(limpiarCopia({}).impuestoVenta, undefined, "las copias de antes no lo traen");
});
