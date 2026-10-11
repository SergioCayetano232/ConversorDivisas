const { test } = require("node:test");
const assert = require("node:assert");
const { masCarosDelDia } = require("../logica.js");

let n = 0;
const g = (dia, valor, to = "EUR") => ({ id: `g${++n}`, to, valor, cuando: new Date(`${dia}T12:00`).getTime() + n });
const ids = (set) => [...set].sort();

test("uno por día, el que más cuesta", () => {
  const cena = g("2026-10-05", 45);
  const hotel = g("2026-10-06", 120);
  const gastos = [g("2026-10-05", 3), cena, g("2026-10-05", 12), g("2026-10-06", 8), hotel];
  assert.deepEqual(ids(masCarosDelDia(gastos)), ids(new Set([cena.id, hotel.id])));
});

test("un día con un gasto solo no lleva corona", () => {
  assert.equal(masCarosDelDia([g("2026-10-05", 30)]).size, 0);
});

test("si empatan los dos más caros, ninguno", () => {
  assert.equal(masCarosDelDia([g("2026-10-05", 3), g("2026-10-05", 3)]).size, 0);
});

test("lo de la otra divisa no compite", () => {
  const cena = g("2026-10-05", 40);
  const gastos = [cena, g("2026-10-05", 20), g("2026-10-05", 50, "USD")];
  assert.deepEqual([...masCarosDelDia(gastos)], [cena.id]);
});

test("un día solo con la otra divisa se queda sin corona", () => {
  const gastos = [g("2026-10-05", 40), g("2026-10-05", 20), g("2026-10-06", 9, "USD"), g("2026-10-06", 3, "USD")];
  assert.equal(masCarosDelDia(gastos).size, 1);
});

test("sin gastos, nada", () => {
  assert.equal(masCarosDelDia([]).size, 0);
});
