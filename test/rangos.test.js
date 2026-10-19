const { test } = require("node:test");
const assert = require("node:assert");
const { RANGOS, RANGO_POR_DEFECTO, leerRango, siguienteRango } = require("../logica.js");

test("hay periodo de un año", () => {
  assert.ok(RANGOS.includes(365));
});

test("van de menos a más, como los botones", () => {
  assert.deepEqual(RANGOS, [...RANGOS].sort((a, b) => a - b));
});

test("el periodo guardado se respeta", () => {
  for (const r of RANGOS) assert.equal(leerRango(r), r);
});

test("sin nada guardado, o algo raro, el de por defecto", () => {
  assert.ok(RANGOS.includes(RANGO_POR_DEFECTO));
  for (const malo of [undefined, null, 0, 14, "30", 366]) {
    assert.equal(leerRango(malo), RANGO_POR_DEFECTO, String(malo));
  }
});

test("la M va pasando de periodo y del año vuelve a la semana", () => {
  assert.equal(siguienteRango(7), 30);
  assert.equal(siguienteRango(30), 90);
  assert.equal(siguienteRango(90), 365);
  assert.equal(siguienteRango(365), 7);
});

test("con un periodo raro, el siguiente al de por defecto", () => {
  assert.equal(siguienteRango(14), siguienteRango(RANGO_POR_DEFECTO));
});
