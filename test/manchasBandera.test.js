const { test } = require("node:test");
const assert = require("node:assert");
const { CURRENCIES, COLORES_BANDERA, manchasBandera } = require("../logica.js");

test("todas las divisas tienen los colores de su bandera", () => {
  const sinColores = CURRENCIES.map((c) => c.code).filter((code) => !COLORES_BANDERA[code]);
  assert.deepEqual(sinColores, []);
});

test("son colores de verdad, sin el blanco y como mucho tres", () => {
  for (const [code, colores] of Object.entries(COLORES_BANDERA)) {
    assert.ok(colores.length >= 1 && colores.length <= 3, code);
    for (const color of colores) {
      assert.match(color, /^#[0-9A-F]{6}$/, code);
      assert.notEqual(color, "#FFFFFF", code);
    }
  }
});

test("una por mancha, y las que sobran se quedan con el cielo", () => {
  assert.deepEqual(manchasBandera("USD"), ["#B22234", "#3C3B6E", null]);
  assert.deepEqual(manchasBandera("JPY"), ["#BC002D", null, null]);
  assert.deepEqual(manchasBandera("INR"), ["#FF9933", "#138808", "#000080"]);
});

test("una divisa que no conozco deja el fondo de siempre", () => {
  assert.deepEqual(manchasBandera("XXX"), [null, null, null]);
});
