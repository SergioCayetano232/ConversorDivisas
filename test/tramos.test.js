const { test } = require("node:test");
const assert = require("node:assert");
const {
  crearGasto, leerViajes, duplicarViaje, TRAMOS_MAX, leerTramos, ponerTramo, quitarTramo, tramoDelDia, resumenTramos,
} = require("../logica.js");

// A mediodía, que con la hora local de medianoche el día podría bailar.
const el = (dia) => new Date(`${dia}T12:00:00`).getTime();
const gasto = (id, dia, valor, extra = {}) => crearGasto({
  id, from: "JPY", to: "EUR", cantidad: valor * 160, valor, concepto: "Ramen", cuando: el(dia), categoria: "comida", ...extra,
});
const tokio = { id: "t", nombre: "Tokio", desde: "2026-11-01" };
const kioto = { id: "k", nombre: "Kioto", desde: "2026-11-04" };

test("se ordenan por fecha y se limpian", () => {
  assert.deepEqual(leerTramos(undefined), []);
  const leidos = leerTramos([kioto, { ...tokio, nombre: "  Tokio   centro " }, { id: "x", nombre: "", desde: "2026-11-02" }, { id: "y", nombre: "Mal", desde: "4 nov" }]);
  assert.deepEqual(leidos.map((t) => t.nombre), ["Tokio centro", "Kioto"]);
});

test("ponerlo el mismo día le cambia el nombre", () => {
  const dos = ponerTramo([tokio], kioto);
  assert.deepEqual(dos.map((t) => t.id), ["t", "k"]);
  const cambiado = ponerTramo(dos, { id: "z", nombre: "Nara", desde: "2026-11-04" });
  assert.deepEqual(cambiado.map((t) => `${t.id}:${t.nombre}`), ["t:Tokio", "k:Nara"]);
  assert.deepEqual(ponerTramo(dos, { id: "z", nombre: "   ", desde: "2026-11-09" }), dos);
});

test("hasta doce, y quitar uno", () => {
  let lista = [];
  for (let i = 1; i <= TRAMOS_MAX + 2; i += 1) lista = ponerTramo(lista, { id: `t${i}`, nombre: `T${i}`, desde: `2026-11-${String(i).padStart(2, "0")}` });
  assert.equal(lista.length, TRAMOS_MAX);
  assert.equal(quitarTramo(lista, "t1").length, TRAMOS_MAX - 1);
});

test("cada día cae en el tramo que había empezado", () => {
  const lista = [tokio, kioto];
  assert.equal(tramoDelDia(lista, "2026-10-31"), null);
  assert.equal(tramoDelDia(lista, "2026-11-03").nombre, "Tokio");
  assert.equal(tramoDelDia(lista, "2026-11-04").nombre, "Kioto");
});

test("Tokio tres días, Kioto lo que llevas hasta hoy", () => {
  const gastos = [
    gasto("a", "2026-11-01", 30), gasto("b", "2026-11-03", 60),
    gasto("c", "2026-11-04", 50), gasto("d", "2026-11-05", 30),
  ];
  const [t, k] = resumenTramos(gastos, [tokio, kioto], { hoyIso: "2026-11-05" });
  assert.deepEqual([t.nombre, t.dias, t.total, t.n, t.alDia, t.fin], ["Tokio", 3, 90, 2, 30, "2026-11-03"]);
  assert.deepEqual([k.nombre, k.dias, k.total, k.alDia, k.actual], ["Kioto", 2, 80, 40, true]);
  assert.equal(t.actual, false);
  assert.equal(k.caro, true);
  assert.equal(t.caro, undefined);
});

test("un día sin gastos en Kioto también cuenta para la media", () => {
  const [, k] = resumenTramos([gasto("c", "2026-11-04", 60)], [tokio, kioto], { hoyIso: "2026-11-06" });
  assert.equal(k.dias, 3);
  assert.equal(k.alDia, 20);
});

test("ya de vuelta, el último acaba con el viaje", () => {
  const [, k] = resumenTramos([gasto("c", "2026-11-04", 60)], [tokio, kioto], { hoyIso: "2026-11-20", hasta: "2026-11-06" });
  assert.equal(k.fin, "2026-11-06");
  assert.equal(k.actual, false);
});

test("lo de antes del primero va aparte, y lo pagado aparte no cuenta", () => {
  const gastos = [gasto("v", "2026-09-10", 900, { fijo: true }), gasto("a", "2026-10-31", 20), gasto("b", "2026-11-01", 10)];
  const salen = resumenTramos(gastos, [tokio], { hoyIso: "2026-11-01" });
  assert.deepEqual(salen.map((g) => [g.nombre, g.total, g.alDia]), [[null, 20, null], ["Tokio", 10, 10]]);
});

test("un tramo que aún no ha empezado sale sin días", () => {
  const [, k] = resumenTramos([gasto("a", "2026-11-01", 10)], [tokio, kioto], { hoyIso: "2026-11-02" });
  assert.deepEqual([k.dias, k.total, k.alDia, k.actual], [0, 0, null, false]);
});

test("sin tramos, nada", () => {
  assert.deepEqual(resumenTramos([gasto("a", "2026-11-01", 10)], []), []);
});

test("se guardan con el viaje y no pasan al duplicado", () => {
  const viajes = leerViajes({ activo: "v", lista: [{ id: "v", gastos: [], tramos: [kioto, tokio] }] });
  assert.deepEqual(viajes.lista[0].tramos, [tokio, kioto]);
  assert.equal("tramos" in duplicarViaje(viajes, "v", "w").lista[1], false);
  assert.equal("tramos" in leerViajes({ activo: "v", lista: [{ id: "v", gastos: [] }] }).lista[0], false);
});
