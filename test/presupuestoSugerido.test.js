const { test } = require("node:test");
const assert = require("node:assert");
const { presupuestoSugerido } = require("../logica.js");

const gasto = (dia, valor, to = "EUR", extra = {}) => ({ to, valor, cuando: new Date(`${dia}T12:00`).getTime(), ...extra });

// Cinco gastos en cinco días, y el total que le digas. Del último al primero,
// que es como los guarda la app.
const viaje = (id, total, to = "EUR") => ({
  id,
  gastos: [5, 4, 3, 2, 1].map((d) => gasto(`2026-06-0${d}`, total / 5, to)),
});
const abierto = { id: "abierto", gastos: [] };
const conLista = (...otros) => ({ activo: "abierto", lista: [abierto, ...otros] });

test("lo de tus otros viajes, por los días de este", () => {
  const r = presupuestoSugerido(conLista(viaje("a", 500)), "EUR", 7);
  assert.deepEqual(r, { porDia: 100, dias: 7, importe: 700, to: "EUR", viajes: 1 });
});

test("uno de lujo no infla la cifra: va por la mediana", () => {
  const r = presupuestoSugerido(conLista(viaje("a", 400), viaje("b", 500), viaje("c", 5000)), "EUR", 5);
  assert.equal(r.porDia, 100);
  assert.equal(r.viajes, 3);
});

test("cuentan también los archivados", () => {
  const r = presupuestoSugerido({ ...conLista(), archivados: [viaje("a", 500)] }, "EUR", 2);
  assert.equal(r.importe, 200);
});

test("el viaje abierto no cuenta: es el del presupuesto", () => {
  const viajes = { activo: "a", lista: [viaje("a", 500)] };
  assert.equal(presupuestoSugerido(viajes, "EUR", 5), null);
});

test("solo los de la misma divisa", () => {
  assert.equal(presupuestoSugerido(conLista(viaje("a", 500, "USD")), "EUR", 5), null);
});

test("un viaje con pocos gastos no dice nada", () => {
  const poco = { id: "a", gastos: [gasto("2026-06-04", 50), gasto("2026-06-01", 50)] };
  assert.equal(presupuestoSugerido(conLista(poco), "EUR", 5), null);
});

test("lo pagado aparte no sube lo de al día", () => {
  const conVuelo = viaje("a", 500);
  conVuelo.gastos.push(gasto("2026-05-01", 900, "EUR", { fijo: true }));
  assert.equal(presupuestoSugerido(conLista(conVuelo), "EUR", 1).porDia, 100);
});

test("redondea a dos cifras", () => {
  assert.equal(presupuestoSugerido(conLista(viaje("a", 553)), "EUR", 5).importe, 550);
  assert.equal(presupuestoSugerido(conLista(viaje("a", 12340)), "EUR", 5).importe, 12000);
  assert.equal(presupuestoSugerido(conLista(viaje("a", 87)), "EUR", 5).importe, 87);
});

test("sin días o con las fechas al revés, nada", () => {
  assert.equal(presupuestoSugerido(conLista(viaje("a", 500)), "EUR", 0), null);
  assert.equal(presupuestoSugerido(conLista(viaje("a", 500)), "EUR", -3), null);
});

test("sin otros viajes, nada", () => {
  assert.equal(presupuestoSugerido(conLista(), "EUR", 5), null);
});
