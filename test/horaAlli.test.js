const { test } = require("node:test");
const assert = require("node:assert");
const { ZONAS, CURRENCIES, desfase, esNoche, horaAlli, textoDiferencia, relojDe, tituloHoraAlli } = require("../logica.js");

const invierno = new Date("2026-01-15T12:00:00Z");
const verano = new Date("2026-07-15T12:00:00Z");

test("hay ciudad para todas las divisas, y su zona existe", () => {
  for (const { code } of CURRENCIES) {
    assert.ok(ZONAS[code], code);
    assert.doesNotThrow(() => desfase(ZONAS[code][0], invierno), code);
  }
});

test("el desfase lleva el horario de verano", () => {
  assert.equal(desfase("Asia/Tokyo", invierno), 540);
  assert.equal(desfase("Europe/Paris", invierno), 60);
  assert.equal(desfase("Europe/Paris", verano), 120);
  assert.equal(desfase("America/New_York", verano), -240);
  assert.equal(desfase("Asia/Kolkata", verano), 330);
});

test("desde Madrid en verano, Tokio va siete horas por delante", () => {
  const h = horaAlli("JPY", verano, 120);
  assert.deepEqual({ ...h, ciudad: undefined }, { ciudad: undefined, horas: 21, minutos: 0, diferencia: 420, dia: 0 });
  assert.equal(h.ciudad, "Tokio");
});

test("con la misma hora que aquí no sale", () => {
  assert.equal(horaAlli("EUR", verano, 120), null);
  assert.equal(horaAlli("XXX", verano, 120), null);
});

test("si allí ya es otro día, lo dice", () => {
  const noche = new Date("2026-07-15T21:30:00Z");
  assert.equal(horaAlli("JPY", noche, 120).dia, 1);
  assert.equal(horaAlli("USD", verano, 120).dia, 0);
  assert.equal(horaAlli("USD", new Date("2026-07-15T23:30:00Z"), 120).dia, -1);
  assert.equal(horaAlli("USD", new Date("2026-07-15T02:00:00Z"), 120).dia, -1);
});

test("la diferencia, con su signo y las medias horas", () => {
  assert.equal(textoDiferencia(420), "+7 h");
  assert.equal(textoDiferencia(-360), "−6 h");
  assert.equal(textoDiferencia(210), "+3 h 30");
  assert.equal(textoDiferencia(-30), "−30 min");
});

test("el reloj y el título", () => {
  const h = { ciudad: "Tokio", horas: 2, minutos: 5, diferencia: 420, dia: 1 };
  assert.equal(relojDe(h), "02:05");
  assert.equal(tituloHoraAlli(h), "En Tokio son las 02:05 de mañana, +7 h respecto a ti");
});

test("de noche, de diez a siete", () => {
  assert.equal(esNoche(22), true);
  assert.equal(esNoche(6), true);
  assert.equal(esNoche(7), false);
  assert.equal(esNoche(21), false);
});
