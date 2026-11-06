const { test } = require("node:test");
const assert = require("node:assert");
const {
  crearGasto, leerViajes, duplicarViaje, estadoPresupuesto, previsionViaje, PENDIENTES_MAX,
  leerPendientes, apuntarPendiente, quitarPendiente, totalPendiente, pagarPendiente,
} = require("../logica.js");

const el = (dia) => new Date(`${dia}T12:00:00`).getTime();
const gasto = (id, dia, valor, extra = {}) => crearGasto({
  id, from: "JPY", to: "EUR", cantidad: valor * 160, valor, concepto: "Ramen", cuando: el(dia), categoria: "comida", ...extra,
});
// El hotel de Kioto, 48.000 yenes que se pagan al salir: 300 € al cambio de hoy.
const hotel = gasto("h", "2026-11-02", 300, { concepto: "Hotel Kioto", categoria: "alojamiento" });
const presupuesto = { importe: 1000, to: "EUR", desde: "2026-11-01", hasta: "2026-11-10" };

test("apuntar y quitar, sin repetidos ni negativos", () => {
  const uno = apuntarPendiente([], hotel);
  assert.deepEqual(uno.map((p) => p.id), ["h"]);
  assert.equal(apuntarPendiente(uno, hotel).length, 1);
  assert.equal(apuntarPendiente(uno, gasto("d", "2026-11-02", -10)).length, 1);
  assert.equal(apuntarPendiente(uno, null).length, 1);
  assert.deepEqual(quitarPendiente(uno, "h"), []);
});

test("hasta treinta", () => {
  let lista = [];
  for (let i = 0; i < PENDIENTES_MAX + 3; i += 1) lista = apuntarPendiente(lista, gasto(`p${i}`, "2026-11-02", 1));
  assert.equal(lista.length, PENDIENTES_MAX);
});

test("solo suma lo de la divisa del presupuesto", () => {
  const lista = [hotel, gasto("u", "2026-11-02", 50, { to: "USD" })];
  assert.equal(totalPendiente(lista, "EUR"), 300);
  assert.equal(totalPendiente(lista, "USD"), 50);
  assert.equal(totalPendiente(undefined, "EUR"), 0);
});

test("no cuenta como gastado, pero sí sale del al día", () => {
  const gastos = [gasto("a", "2026-11-01", 100)];
  const sin = estadoPresupuesto(presupuesto, gastos, "2026-11-03");
  const con = estadoPresupuesto(presupuesto, gastos, "2026-11-03", [hotel]);
  assert.equal(con.gastado, 100);
  assert.equal(con.queda, 900);
  assert.equal(con.fraccion, 0.1);
  assert.equal(con.pendiente, 300);
  assert.equal(con.libre, 600);
  assert.equal(con.fraccionPendiente, 0.3);
  // Del 3 al 10 son 8 días: 900 / 8 sin el hotel, 600 / 8 con él.
  assert.equal(sin.porDia, 112.5);
  assert.equal(con.porDia, 75);
  assert.equal(sin.pendiente, 0);
});

test("si lo pendiente se come lo que queda, ya no hay al día", () => {
  const con = estadoPresupuesto(presupuesto, [gasto("a", "2026-11-01", 800)], "2026-11-03", [hotel]);
  assert.equal(con.libre, -100);
  assert.equal(con.porDia, null);
  assert.equal(con.tono, "justo", "el tono sigue siendo el de lo gastado");
});

test("la previsión lo suma tal cual", () => {
  const gastos = [gasto("a", "2026-11-01", 50), gasto("b", "2026-11-02", 50)];
  const sin = previsionViaje(presupuesto, gastos, "2026-11-02");
  const con = previsionViaje(presupuesto, gastos, "2026-11-02", [hotel]);
  assert.equal(Math.round((con.total - sin.total) * 100), 30000);
});

test("al pagarlo pasa a gasto con la tasa y la comisión de ese día", () => {
  const pagado = pagarPendiente(hotel, { id: "g", cuando: el("2026-11-06"), tasa: 1 / 150, comision: 2 });
  assert.equal(pagado.id, "g");
  assert.equal(pagado.cantidad, 48000);
  assert.equal(pagado.concepto, "Hotel Kioto");
  assert.equal(pagado.categoria, "alojamiento");
  assert.equal(pagado.valor, 326.4);
  assert.equal(pagado.cuando, el("2026-11-06"));
  // Sin tasa de hoy, con lo que valía al apuntarlo.
  assert.equal(pagarPendiente(hotel, { id: "g", cuando: el("2026-11-06") }).valor, 300);
});

test("se guardan con el viaje y no pasan al duplicado", () => {
  const viajes = leerViajes({ activo: "v", lista: [{ id: "v", gastos: [], pendientes: [hotel, { id: "malo" }] }] });
  assert.deepEqual(viajes.lista[0].pendientes.map((p) => p.id), ["h"]);
  assert.equal("pendientes" in duplicarViaje(viajes, "v", "w").lista[1], false);
  assert.equal("pendientes" in leerViajes({ activo: "v", lista: [{ id: "v", gastos: [] }] }).lista[0], false);
  assert.deepEqual(leerPendientes("nada"), []);
});

test("hasta cuándo llega cuenta con lo pendiente", () => {
  const { hastaCuandoLlega } = require("../logica.js");
  // 100 al día los dos primeros días: con 800 libres llega de sobra; con el hotel, no.
  const gastos = [gasto("a", "2026-11-01", 100), gasto("b", "2026-11-02", 100)];
  const p = { ...presupuesto, importe: 1100 };
  assert.equal(hastaCuandoLlega(p, gastos, "2026-11-02"), null);
  assert.equal(hastaCuandoLlega(p, gastos, "2026-11-02", [hotel]), "2026-11-08");
});

test("crearPendiente saca la categoría y no admite la misma divisa ni cero", () => {
  const { crearPendiente } = require("../logica.js");
  const p = crearPendiente({ id: "o", from: "JPY", to: "EUR", cantidad: 48000, valor: 300, concepto: "Hotel Kioto", cuando: el("2026-11-02") });
  assert.equal(p.categoria, "alojamiento");
  assert.equal(p.comision, 0);
  assert.equal(crearPendiente({ id: "x", from: "EUR", to: "EUR", cantidad: 240, valor: 240, cuando: 1 }), null);
  assert.equal(crearPendiente({ id: "x", from: "JPY", to: "EUR", cantidad: 0, valor: 0, cuando: 1 }), null);
});
