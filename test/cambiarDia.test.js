const { test } = require("node:test");
const assert = require("node:assert");
const { cambiarDia, gastosPorDia, isoLocal } = require("../logica.js");

const HOY = "2026-10-08";
const a = (dia, hora) => new Date(`${dia}T${hora}`).getTime();
const gasto = (id, cuando) => ({ id, from: "JPY", to: "EUR", cantidad: 1000, valor: 6, concepto: id, cuando });
const lista = [gasto("cafe", a(HOY, "09:30")), gasto("cena", a("2026-10-07", "21:00")), gasto("taxi", a("2026-10-06", "18:00"))];

test("se va al día que le digas y mantiene la hora", () => {
  const nueva = cambiarDia(lista, "cafe", "2026-10-07", HOY);
  const cafe = nueva.find((g) => g.id === "cafe");
  assert.equal(isoLocal(new Date(cafe.cuando)), "2026-10-07");
  assert.equal(new Date(cafe.cuando).getHours(), 9);
  assert.equal(new Date(cafe.cuando).getMinutes(), 30);
  assert.equal(cafe.valor, 6, "el valor no cambia");
});

test("la lista se reordena para que los días sigan en orden", () => {
  const nueva = cambiarDia(lista, "cafe", "2026-10-05", HOY);
  assert.deepEqual(nueva.map((g) => g.id), ["cena", "taxi", "cafe"]);
  assert.deepEqual(gastosPorDia(nueva).map((d) => d.dia), ["2026-10-07", "2026-10-06", "2026-10-05"]);
});

test("dentro del día queda por su hora", () => {
  const nueva = cambiarDia(lista, "taxi", "2026-10-07", HOY);
  assert.deepEqual(nueva.map((g) => g.id), ["cafe", "cena", "taxi"], "las 18:00 van detrás de las 21:00");
});

test("traer uno de antes a hoy", () => {
  const nueva = cambiarDia(lista, "taxi", HOY, HOY);
  assert.deepEqual(gastosPorDia(nueva)[0].gastos.map((g) => g.id), ["taxi", "cafe"]);
});

test("no deja ponerlo en el futuro ni con una fecha rara", () => {
  assert.equal(cambiarDia(lista, "cafe", "2026-10-09", HOY), lista);
  assert.equal(cambiarDia(lista, "cafe", "ayer", HOY), lista);
  assert.equal(cambiarDia(lista, "cafe", "", HOY), lista);
});

test("el mismo día o un gasto que no está, la lista tal cual", () => {
  assert.equal(cambiarDia(lista, "cafe", HOY, HOY), lista);
  assert.equal(cambiarDia(lista, "nada", "2026-10-07", HOY), lista);
});

test("no toca la lista de antes", () => {
  const copia = structuredClone(lista);
  cambiarDia(lista, "cafe", "2026-10-01", HOY);
  assert.deepEqual(lista, copia);
});
