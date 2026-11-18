const { test } = require("node:test");
const assert = require("node:assert");
const { momentoDelDia, cieloAlli } = require("../logica.js");

test("cada hora cae en su momento, con los bordes donde toca", () => {
  assert.equal(momentoDelDia(5), "noche");
  assert.equal(momentoDelDia(6), "amanecer");
  assert.equal(momentoDelDia(8), "amanecer");
  assert.equal(momentoDelDia(9), "dia");
  assert.equal(momentoDelDia(17), "dia");
  assert.equal(momentoDelDia(18), "atardecer");
  assert.equal(momentoDelDia(20), "atardecer");
  assert.equal(momentoDelDia(21), "noche");
  assert.equal(momentoDelDia(0), "noche");
});

test("una hora que no es hora no pinta nada", () => {
  assert.equal(momentoDelDia(24), null);
  assert.equal(momentoDelDia(-1), null);
  assert.equal(momentoDelDia(7.5), null);
  assert.equal(momentoDelDia(undefined), null);
});

test("el cielo va por la hora de la ciudad de la divisa", () => {
  // 12:00 UTC del 18 de noviembre: en Tokio son las 21, en Nueva York las 7.
  const ahora = Date.UTC(2026, 10, 18, 12, 0);
  const madrid = 60;
  assert.equal(cieloAlli("JPY", ahora, madrid), "noche");
  assert.equal(cieloAlli("USD", ahora, madrid), "amanecer");
  assert.equal(cieloAlli("EUR", ahora, madrid), "dia");
  // En Sídney es verano y van con una hora más: las 23.
  assert.equal(cieloAlli("AUD", ahora, madrid), "noche");
});

test("con la misma hora que la tuya también se pinta", () => {
  const ahora = Date.UTC(2026, 10, 18, 18, 30);
  assert.equal(cieloAlli("EUR", ahora, 60), "atardecer");
});

test("sin ciudad para la divisa, la hora tuya", () => {
  const ahora = Date.UTC(2026, 10, 18, 22, 0);
  assert.equal(cieloAlli("XXX", ahora, 60), "noche");
  assert.equal(cieloAlli("XXX", ahora, -600), "dia");
});
