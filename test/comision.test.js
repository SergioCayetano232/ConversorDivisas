const { test } = require("node:test");
const assert = require("node:assert");
const { COMISION_MAX, COMISIONES_RAPIDAS, leerComision, leerPorcentaje, conComision } = require("../logica.js");

test("sin nada guardado no hay comisión", () => {
  assert.equal(leerComision(undefined), 0);
  assert.equal(leerComision(null), 0);
  assert.equal(leerComision("2"), 0, "un texto no vale, solo números");
});

test("lo guardado se respeta si tiene sentido", () => {
  assert.equal(leerComision(2), 2);
  assert.equal(leerComision(1.75), 1.75);
  assert.equal(leerComision(COMISION_MAX), COMISION_MAX);
});

test("lo guardado fuera de rango se descarta", () => {
  assert.equal(leerComision(-1), 0);
  assert.equal(leerComision(COMISION_MAX + 0.01), 0);
  assert.equal(leerComision(NaN), 0);
  assert.equal(leerComision(Infinity), 0);
});

test("entiende el porcentaje escrito de varias formas", () => {
  assert.equal(leerPorcentaje("2"), 2);
  assert.equal(leerPorcentaje("2,5"), 2.5);
  assert.equal(leerPorcentaje("2.5"), 2.5);
  assert.equal(leerPorcentaje(" 1,75 % "), 1.75);
  assert.equal(leerPorcentaje("0"), 0);
});

test("se queda en dos decimales", () => {
  assert.equal(leerPorcentaje("1,999"), 2);
  assert.equal(leerPorcentaje("0,125"), 0.13);
});

test("lo que no es un porcentaje da null", () => {
  for (const malo of ["", "   ", "%", "abc", "-2", "2,5,1", "1e2", "11", null, undefined]) {
    assert.equal(leerPorcentaje(malo), null, String(malo));
  }
});

test("las rápidas empiezan en cero, para poder quitarla", () => {
  assert.equal(COMISIONES_RAPIDAS[0], 0);
  assert.ok(COMISIONES_RAPIDAS.every((p) => p <= COMISION_MAX));
});

test("suma la comisión a lo convertido", () => {
  assert.ok(Math.abs(conComision(100, 2) - 102) < 1e-9);
  assert.ok(Math.abs(conComision(44.03, 2.5) - 45.13075) < 1e-9);
  assert.equal(conComision(50, 0), 50);
});

test("sin cantidad no hay nada que sumar", () => {
  assert.equal(conComision(null, 2), null);
  assert.equal(conComision(NaN, 2), null);
});
