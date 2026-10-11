// Las horas dependen de dónde esté el ordenador: fijo Madrid para que los
// tests den lo mismo en cualquier sitio.
process.env.TZ = "Europe/Madrid";

const { test } = require("node:test");
const assert = require("node:assert");
const { horaBce, textoActualizado, proximaTasa, textoProximaTasa } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

ponerIdioma("es");
const a = (texto) => new Date(texto).getTime();

test("a las cuatro de Fráncfort, en verano y en invierno", () => {
  assert.equal(horaBce("2026-07-15").toISOString(), "2026-07-15T14:00:00.000Z");
  assert.equal(horaBce("2026-01-15").toISOString(), "2026-01-15T15:00:00.000Z");
});

test("el día que cambian la hora también", () => {
  assert.equal(horaBce("2026-03-30").toISOString(), "2026-03-30T14:00:00.000Z");
});

test("en el pie, hoy, ayer o la fecha, con la hora", () => {
  const ahora = a("2026-10-09T18:00:00+02:00");
  assert.equal(textoActualizado("2026-10-09", ahora), "BCE hoy 16:00");
  assert.equal(textoActualizado("2026-10-08", ahora), "BCE ayer 16:00");
  assert.equal(textoActualizado("2026-10-05", ahora), "BCE 5 oct 16:00");
  assert.equal(textoActualizado(null, ahora), "");
});

test("la siguiente, saltando el fin de semana", () => {
  // Viernes por la tarde: la siguiente es el lunes.
  const viernes = a("2026-10-09T18:00:00+02:00");
  assert.equal(proximaTasa("2026-10-09", viernes).toISOString(), "2026-10-12T14:00:00.000Z");
  assert.equal(textoProximaTasa(proximaTasa("2026-10-09", viernes), viernes), "La siguiente sale el lunes a las 16:00");
});

test("por la mañana, la de hoy", () => {
  const martes = a("2026-10-13T10:00:00+02:00");
  assert.equal(textoProximaTasa(proximaTasa("2026-10-12", martes), martes), "La siguiente sale hoy a las 16:00");
});

test("por la tarde, la de mañana", () => {
  const martes = a("2026-10-13T17:00:00+02:00");
  assert.equal(textoProximaTasa(proximaTasa("2026-10-13", martes), martes), "La siguiente sale mañana a las 16:00");
});

test("si la que tengo es vieja, la siguiente sigue siendo la que viene", () => {
  const martes = a("2026-10-13T10:00:00+02:00");
  assert.equal(proximaTasa("2026-10-05", martes).toISOString(), "2026-10-13T14:00:00.000Z");
});

test("en Semana Santa no publica ni el viernes ni el lunes", () => {
  // 2026: Viernes Santo el 3 de abril, Lunes de Pascua el 6.
  const jueves = a("2026-04-02T18:00:00+02:00");
  assert.equal(proximaTasa("2026-04-02", jueves).toISOString(), "2026-04-07T14:00:00.000Z");
});
