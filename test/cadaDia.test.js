const { test } = require("node:test");
const assert = require("node:assert");
const { deCadaDia, crearGasto, repartirNoches } = require("../logica.js");

const el = (dia, hora = 9) => { const [a, m, d] = dia.split("-").map(Number); return new Date(a, m - 1, d, hora).getTime(); };
let n = 0;
const g = (concepto, dia, cantidad = 2.5, extra = {}) => crearGasto({
  id: `g${n++}`, from: "JPY", to: "EUR", cantidad, valor: cantidad / 160, concepto, cuando: el(dia), categoria: "transporte", ...extra,
});
const HOY = "2026-11-19";

test("lo de ayer y anteayer que hoy aún no está", () => {
  const r = deCadaDia([g("Metro", "2026-11-18", 300), g("Metro", "2026-11-17", 280), g("Cena", "2026-11-18")], HOY);
  assert.equal(r.length, 1);
  assert.equal(r[0].gasto.concepto, "Metro");
  assert.equal(r[0].gasto.cantidad, 300, "con el importe de la última vez");
  assert.equal(r[0].clave, "metro|JPY");
});

test("si hoy ya está, o falta ayer, no", () => {
  assert.deepEqual(deCadaDia([g("Metro", HOY), g("Metro", "2026-11-18"), g("Metro", "2026-11-17")], HOY), []);
  assert.deepEqual(deCadaDia([g("Metro", "2026-11-17"), g("Metro", "2026-11-16")], HOY), []);
  assert.deepEqual(deCadaDia([g("Metro", "2026-11-18"), g("Metro", "2026-11-16")], HOY), []);
});

test("el concepto sin mayúsculas ni tildes, pero cada divisa aparte", () => {
  assert.equal(deCadaDia([g("Café", "2026-11-18"), g("cafe", "2026-11-17")], HOY).length, 1);
  const otra = crearGasto({ id: "u", from: "USD", to: "EUR", cantidad: 3, valor: 2.7, concepto: "Café", cuando: el("2026-11-17"), categoria: "comida" });
  assert.equal(deCadaDia([g("Café", "2026-11-18"), otra], HOY).length, 0);
});

test("sin concepto, fijos, devoluciones, lo que pagó otro y las noches, no", () => {
  assert.deepEqual(deCadaDia([g("", "2026-11-18"), g("", "2026-11-17")], HOY), []);
  assert.deepEqual(deCadaDia([g("Seguro", "2026-11-18", 5, { fijo: true }), g("Seguro", "2026-11-17", 5, { fijo: true })], HOY), []);
  assert.deepEqual(deCadaDia([g("Taxi", "2026-11-18", 5, { pagador: 1 }), g("Taxi", "2026-11-17", 5, { pagador: 1 })], HOY), []);
  const hotel = repartirNoches(g("Hotel", "2026-11-17", 300), 3);
  assert.deepEqual(deCadaDia(hotel, HOY), []);
});

test("los que más días llevan primero, y como mucho tres", () => {
  const dias = ["2026-11-18", "2026-11-17"];
  const lista = [
    ...dias.map((d) => g("Agua", d)), ...dias.map((d) => g("Pan", d)), ...dias.map((d) => g("Bus", d)),
    ...[...dias, "2026-11-16", "2026-11-15"].map((d) => g("Desayuno", d)),
  ];
  const r = deCadaDia(lista, HOY);
  assert.equal(r.length, 3);
  assert.equal(r[0].gasto.concepto, "Desayuno");
  assert.equal(r[0].dias, 4);
});

test("lo que descartaste hoy no sale", () => {
  const lista = [g("Metro", "2026-11-18"), g("Metro", "2026-11-17")];
  assert.deepEqual(deCadaDia(lista, HOY, ["metro|JPY"]), []);
});

test("el 1 de mes mira el 31 y el 30", () => {
  assert.equal(deCadaDia([g("Metro", "2026-10-31"), g("Metro", "2026-10-30")], "2026-11-01").length, 1);
});
