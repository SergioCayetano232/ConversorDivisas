const { test } = require("node:test");
const assert = require("node:assert");
const { notasDe, SONIDOS, VIBRACIONES, SONIDO_VOLUMEN, SONIDO_VOLUMEN_MAX } = require("../logica.js");

test("cada sonido son notas cortas, que no molesten al repetirse", () => {
  for (const [nombre, notas] of Object.entries(SONIDOS)) {
    const fin = Math.max(...notas.map((n) => n.empieza + n.dura));
    assert.ok(fin <= 0.3, `${nombre} dura ${fin} s`);
    for (const n of notas) assert.ok(n.hz >= 200 && n.hz <= 4000, `${nombre}: ${n.hz} Hz`);
  }
});

test("la moneda sube al final, como al caer en el bote", () => {
  const [a, b] = SONIDOS.moneda;
  assert.ok(b.hz > a.hz);
  assert.ok(b.empieza > a.empieza);
});

test("sin volumen va el de siempre, y nunca pasa del tope", () => {
  assert.ok(notasDe("copiar").every((n) => n.volumen === SONIDO_VOLUMEN));
  assert.ok(notasDe("copiar", 5).every((n) => n.volumen === SONIDO_VOLUMEN_MAX));
  assert.ok(notasDe("copiar", -1).every((n) => n.volumen === 0));
  assert.ok(notasDe("copiar", NaN).every((n) => n.volumen === SONIDO_VOLUMEN));
});

test("un sonido que no existe no suena", () => {
  assert.deepEqual(notasDe("trompeta"), []);
});

test("cada sonido tiene su vibración, muy corta", () => {
  for (const nombre of Object.keys(SONIDOS)) {
    assert.ok(VIBRACIONES[nombre].every((ms) => ms > 0 && ms <= 20));
  }
});

test("no se puede cambiar el sonido guardado desde lo que devuelve", () => {
  notasDe("moneda")[0].hz = 1;
  assert.equal(SONIDOS.moneda[0].hz, 1760);
});
