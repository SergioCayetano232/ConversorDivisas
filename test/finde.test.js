const { test } = require("node:test");
const assert = require("node:assert");
const { findeContraSemana, resumenParaCompartir } = require("../logica.js");

// Octubre de 2026: el 9 es viernes, el 10 y el 11 sábado y domingo.
const g = (dia, valor, to = "EUR") => {
  const [a, m, d] = dia.split("-").map(Number);
  return { id: `${dia}-${valor}`, from: "JPY", to, cantidad: valor * 160, valor, concepto: "", categoria: "comida", cuando: new Date(a, m - 1, d, 13).getTime() };
};
const hoy = "2026-10-14";

test("del jueves al lunes, el finde gasta un 50 % más al día", () => {
  const r = findeContraSemana([g("2026-10-08", 40), g("2026-10-09", 40), g("2026-10-10", 70), g("2026-10-11", 50), g("2026-10-12", 40)], hoy);
  assert.equal(r.gana, "finde");
  assert.equal(r.finde, 60);
  assert.equal(r.semana, 40);
  assert.ok(Math.abs(r.mas - 0.5) < 1e-9);
});

test("los días de en medio sin nada cuentan como cero", () => {
  const r = findeContraSemana([g("2026-10-09", 100), g("2026-10-10", 30), g("2026-10-13", 100)], hoy);
  // Viernes 100, lunes 0, martes 100 → 66,67 al día; sábado 30, domingo 0 → 15.
  assert.equal(r.gana, "semana");
  assert.ok(Math.abs(r.semana - 200 / 3) < 1e-9);
  assert.equal(r.finde, 15);
});

test("hoy no cuenta, que aún no ha acabado", () => {
  const r = findeContraSemana([g("2026-10-10", 50), g("2026-10-12", 50), g("2026-10-14", 500)], hoy);
  assert.equal(r.semana, 50);
});

test("sin finde, o sin entre semana, no hay con qué comparar", () => {
  assert.equal(findeContraSemana([g("2026-10-12", 50), g("2026-10-13", 60)], hoy), null);
  assert.equal(findeContraSemana([g("2026-10-10", 50), g("2026-10-11", 60)], hoy), null);
  assert.equal(findeContraSemana([], hoy), null);
});

test("menos de un 10 % de diferencia es lo mismo", () => {
  assert.equal(findeContraSemana([g("2026-10-09", 100), g("2026-10-10", 105)], hoy), null);
});

test("solo la divisa que más suma", () => {
  const r = findeContraSemana([g("2026-10-09", 100), g("2026-10-10", 50), g("2026-10-10", 90, "USD")], hoy);
  assert.equal(r.gana, "semana");
});

test("va en el resumen para WhatsApp", () => {
  const gastos = [g("2026-10-08", 40), g("2026-10-09", 40), g("2026-10-10", 70), g("2026-10-11", 50), g("2026-10-12", 40)];
  const texto = resumenParaCompartir({ nombre: "Lisboa", gastos, presupuesto: null, personas: 1 }, hoy);
  assert.match(texto, /El finde, un 50 % más al día que entre semana/);
});

test("a partir del doble lo dice en veces, que un 590 % no se entiende", () => {
  // Viernes 100, sábado 10, domingo 10: 100 contra 10 al día.
  const gastos = [g("2026-10-09", 100), g("2026-10-10", 10), g("2026-10-11", 10)];
  assert.equal(findeContraSemana(gastos, hoy).veces, 10);
  const texto = resumenParaCompartir({ nombre: "Lisboa", gastos, presupuesto: null, personas: 1 }, hoy);
  assert.match(texto, /Entre semana, 10 veces lo del finde al día/);
});

test("por debajo del doble sigue en porcentaje", () => {
  const r = findeContraSemana([g("2026-10-09", 100), g("2026-10-10", 199)], hoy);
  assert.equal(r.veces, null);
  assert.ok(r.mas > 0.98);
});
