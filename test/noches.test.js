const { test } = require("node:test");
const assert = require("node:assert");
const { repartirCentimos, repartirNoches, apuntarNoches, isoLocal, CONCEPTO_MAX, NOCHES_MAX } = require("../logica.js");

const hotel = {
  id: "h", from: "JPY", to: "EUR", cantidad: 50000, valor: 400, concepto: "Hotel", categoria: "alojamiento",
  pago: "tarjeta", comision: 0, cuando: new Date("2026-10-12T21:15").getTime(),
};

test("trocea sin perder ni sobrar un céntimo, lo de más a la primera", () => {
  assert.deepEqual(repartirCentimos(100, 3), [33.34, 33.33, 33.33]);
  assert.deepEqual(repartirCentimos(400, 5), [80, 80, 80, 80, 80]);
  assert.equal(Math.round(repartirCentimos(0.1 + 0.2, 2).reduce((a, b) => a + b) * 100), 30);
});

test("un gasto por noche, desde el día que lo pagas y a la misma hora", () => {
  const noches = repartirNoches(hotel, 5);
  assert.equal(noches.length, 5);
  assert.deepEqual(noches.map((g) => isoLocal(new Date(g.cuando))), ["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16"]);
  assert.ok(noches.every((g) => new Date(g.cuando).getHours() === 21));
  assert.deepEqual(noches.map((g) => g.valor), [80, 80, 80, 80, 80]);
  assert.deepEqual(noches.map((g) => g.cantidad), [10000, 10000, 10000, 10000, 10000]);
  assert.equal(new Set(noches.map((g) => g.id)).size, 5);
});

test("cada uno dice qué noche es, y se queda con lo demás", () => {
  const [primera, , tercera] = repartirNoches(hotel, 3);
  assert.equal(primera.concepto, "1/3 · Hotel");
  assert.equal(tercera.concepto, "3/3 · Hotel");
  assert.equal(tercera.categoria, "alojamiento");
  assert.equal(tercera.pago, "tarjeta");
});

test("sin concepto queda solo la noche, y uno largo se recorta", () => {
  assert.equal(repartirNoches({ ...hotel, concepto: "" }, 2)[1].concepto, "2/2");
  const largo = repartirNoches({ ...hotel, concepto: "x".repeat(CONCEPTO_MAX) }, 12)[11].concepto;
  assert.equal(largo.length, CONCEPTO_MAX);
  assert.ok(largo.startsWith("12/12 · x"));
});

test("cruza el cambio de hora sin saltarse un día", () => {
  const noches = repartirNoches({ ...hotel, cuando: new Date("2026-10-24T21:00").getTime() }, 3);
  assert.deepEqual(noches.map((g) => isoLocal(new Date(g.cuando))), ["2026-10-24", "2026-10-25", "2026-10-26"]);
});

test("una noche o un número raro lo deja como estaba", () => {
  assert.deepEqual(repartirNoches(hotel, 1), [hotel]);
  assert.deepEqual(repartirNoches(hotel, NOCHES_MAX + 1), [hotel]);
  assert.deepEqual(repartirNoches(hotel, 2.5), [hotel]);
});

test("al apuntarlas, la lista queda ordenada por fecha", () => {
  const viejo = { ...hotel, id: "v", cuando: new Date("2026-10-13T09:00").getTime() };
  const lista = apuntarNoches([viejo], repartirNoches(hotel, 2));
  assert.deepEqual(lista.map((g) => g.id), ["h-2", "v", "h-1"]);
  assert.deepEqual(apuntarNoches([viejo], []), [viejo]);
});
