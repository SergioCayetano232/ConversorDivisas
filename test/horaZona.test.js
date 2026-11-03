const { test } = require("node:test");
const assert = require("node:assert");
const { leerHoraZona, convertirHoraZona, textoHoraZona, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

// Madrid en noviembre (UTC+1); allí ya no hay horario de verano en EE. UU. y en Sídney sí.
const invierno = new Date("2026-11-03T12:00:00Z");
const madrid = 60;
const texto = (t, ahora = invierno, local = madrid) => textoHoraZona(leerHoraZona(t), ahora, local);

test("lee la hora con dos puntos, con h o con am/pm", () => {
  assert.deepEqual(leerHoraZona("15:00 pst"), { h: 15, min: 0, zona: "America/Los_Angeles", nombre: "PST" });
  assert.equal(leerHoraZona("15h jst").h, 15);
  assert.equal(leerHoraZona("15h30 jst").min, 30);
  assert.equal(leerHoraZona("3pm est").h, 15);
  assert.equal(leerHoraZona("3 pm est").h, 15);
  assert.equal(leerHoraZona("12am utc").h, 0);
  assert.equal(leerHoraZona("12pm utc").h, 12);
});

test("sin dos puntos, h ni am/pm es dinero, no una hora", () => {
  assert.equal(leerHoraZona("15 usd"), null);
  assert.equal(leerHoraZona("15.30 usd"), null);
  assert.ok(leerOmnibox("15 usd", { from: "EUR", to: "USD" }));
});

test("horas imposibles o zonas que no conozco, nada", () => {
  assert.equal(leerHoraZona("25:00 utc"), null);
  assert.equal(leerHoraZona("10:75 utc"), null);
  assert.equal(leerHoraZona("13pm pst"), null);
  assert.equal(leerHoraZona("0am pst"), null);
  assert.equal(leerHoraZona("15:00 xyz"), null);
});

test("con la divisa, la ciudad de esa divisa", () => {
  ponerIdioma("es");
  assert.equal(leerHoraZona("9:30 jpy").nombre, "Tokio");
  ponerIdioma("en");
  assert.equal(leerHoraZona("9:30 jpy").nombre, "Tokyo");
  ponerIdioma("es");
});

test("de PST a Madrid, ya del día siguiente", () => {
  ponerIdioma("es");
  assert.equal(texto("15:00 pst"), "15:00 PST = 🕐 00:00 tu hora (del día siguiente)");
  assert.equal(texto("3pm est"), "15:00 EST = 🕐 21:00 tu hora");
  assert.equal(texto("9:30 jpy"), "09:30 Tokio = 🕐 01:30 tu hora");
});

test("Sídney, con su horario de verano, cae el día anterior", () => {
  ponerIdioma("es");
  assert.equal(texto("8am aest"), "08:00 AEST = 🕐 22:00 tu hora (del día anterior)");
});

test("en verano cuenta el horario de verano de los dos lados", () => {
  const verano = new Date("2026-07-15T12:00:00Z");
  assert.deepEqual(convertirHoraZona(leerHoraZona("15:00 pst"), verano, 120), { h: 0, min: 0, dia: 1 });
  assert.deepEqual(convertirHoraZona(leerHoraZona("15:00 est"), verano, 120), { h: 21, min: 0, dia: 0 });
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(texto("15:00 pst"), "15:00 PST = 🕐 00:00 your time (next day)");
  ponerIdioma("es");
  assert.equal(textoHoraZona(null), "");
});
