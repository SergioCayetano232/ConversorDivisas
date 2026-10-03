const { test } = require("node:test");
const assert = require("node:assert");
const {
  PROPINA_MAX, PERSONAS_MAX, CUENTA_POR_DEFECTO, leerCuenta, repartirCuenta, leerPorcentaje,
} = require("../logica.js");

test("sin nada guardado, un 10 % entre dos", () => {
  assert.deepEqual(leerCuenta(undefined), CUENTA_POR_DEFECTO);
  assert.deepEqual(leerCuenta("hola"), CUENTA_POR_DEFECTO);
  assert.deepEqual(CUENTA_POR_DEFECTO, { propina: 10, personas: 2 });
});

test("lo guardado se respeta si tiene sentido", () => {
  assert.deepEqual(leerCuenta({ propina: 18, personas: 4 }), { propina: 18, personas: 4 });
  assert.deepEqual(leerCuenta({ propina: 0, personas: 1 }), { propina: 0, personas: 1 });
});

test("lo que no tiene sentido vuelve a lo de siempre, cada cosa por su lado", () => {
  assert.deepEqual(leerCuenta({ propina: -5, personas: 3 }), { propina: 10, personas: 3 });
  assert.deepEqual(leerCuenta({ propina: PROPINA_MAX + 1, personas: 3 }), { propina: 10, personas: 3 });
  assert.deepEqual(leerCuenta({ propina: 15, personas: 0 }), { propina: 15, personas: 2 });
  assert.deepEqual(leerCuenta({ propina: 15, personas: 2.5 }), { propina: 15, personas: 2 });
  assert.deepEqual(leerCuenta({ propina: 15, personas: PERSONAS_MAX + 1 }), { propina: 15, personas: 2 });
});

test("la propina se escribe como la comisión, pero llega más alto", () => {
  assert.equal(leerPorcentaje("18", PROPINA_MAX), 18);
  assert.equal(leerPorcentaje("12,5 %", PROPINA_MAX), 12.5);
  assert.equal(leerPorcentaje("31", PROPINA_MAX), null);
  assert.equal(leerPorcentaje("18"), null, "sin decir nada sigue siendo el tope de la comisión");
});

test("una cena de 85 dólares con un 15 % entre cuatro", () => {
  const r = repartirCuenta(85, 0.9, { propina: 15, personas: 4 });
  assert.ok(Math.abs(r.total - 97.75) < 1e-9);
  assert.ok(Math.abs(r.propina - 12.75) < 1e-9);
  assert.equal(r.cadaUno, 24.44, "24,4375 se redondea hacia arriba");
  assert.ok(Math.abs(r.totalTuyo - 87.975) < 1e-9);
  assert.equal(r.cadaUnoTuyo, 22);
});

test("si sale justo no se le suma un céntimo", () => {
  assert.equal(repartirCuenta(30, 1, { propina: 0, personas: 3 }).cadaUno, 10);
  assert.equal(repartirCuenta(100, 1, { propina: 10, personas: 2 }).cadaUno, 55);
  assert.equal(repartirCuenta(0.3, 1, { propina: 0, personas: 3 }).cadaUno, 0.1);
});

test("la comisión va sobre lo que pagas en tu divisa", () => {
  const r = repartirCuenta(100, 2, { propina: 0, personas: 2 }, 3);
  assert.equal(r.total, 100);
  assert.ok(Math.abs(r.totalTuyo - 206) < 1e-9);
  assert.equal(r.cadaUnoTuyo, 103);
});

test("sin cantidad no hay cuenta, y sin tasa solo la de la divisa de origen", () => {
  assert.equal(repartirCuenta(0, 1, CUENTA_POR_DEFECTO), null);
  assert.equal(repartirCuenta(null, 1, CUENTA_POR_DEFECTO), null);
  const sinTasa = repartirCuenta(50, null, CUENTA_POR_DEFECTO);
  assert.equal(sinTasa.cadaUno, 27.5);
  assert.equal(sinTasa.totalTuyo, null);
  assert.equal(sinTasa.cadaUnoTuyo, null);
});
