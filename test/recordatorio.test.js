const { test } = require("node:test");
const assert = require("node:assert");
const { viajesSinApuntar, tocaRecordar, mensajeRecordatorio, limpiarCopia, CLAVES_COPIA } = require("../logica.js");

const HOY = "2026-10-08";
const a = (dia, hora) => new Date(2026, 9, dia, hora, 30);
const gasto = (id, cuando) => ({ id, from: "JPY", to: "EUR", cantidad: 1600, valor: 10, concepto: "", cuando: cuando.getTime() });
const presupuesto = { importe: 1000, to: "EUR", desde: "2026-10-05", hasta: "2026-10-12" };
const viaje = (id, extra = {}) => ({ id, nombre: "", gastos: [], presupuesto, cajero: [], ...extra });
const viajes = (...lista) => ({ activo: lista[0].id, lista });

test("de viaje y sin nada apuntado hoy, toca recordarlo", () => {
  const v = viaje("j", { nombre: "Japón", gastos: [gasto("a", a(7, 13))] });
  assert.deepEqual(viajesSinApuntar(viajes(v), HOY).map((x) => x.id), ["j"]);
});

test("con un gasto de hoy ya no", () => {
  const v = viaje("j", { gastos: [gasto("a", a(7, 13)), gasto("b", a(8, 9))] });
  assert.deepEqual(viajesSinApuntar(viajes(v), HOY), []);
});

test("sin presupuesto, antes de salir o ya de vuelta, no", () => {
  assert.deepEqual(viajesSinApuntar(viajes(viaje("j", { presupuesto: null, gastos: [gasto("a", a(7, 13))] })), HOY), []);
  assert.deepEqual(viajesSinApuntar(viajes(viaje("j", { presupuesto: { ...presupuesto, desde: "2026-10-20", hasta: "2026-10-25" } })), HOY), []);
  assert.deepEqual(viajesSinApuntar(viajes(viaje("j", { presupuesto: { ...presupuesto, hasta: "2026-10-07" } })), HOY), []);
});

test("con solo la fecha de vuelta, hasta el primer gasto no sé si has salido", () => {
  const soloHasta = { importe: 1000, to: "EUR", hasta: "2026-10-12" };
  assert.deepEqual(viajesSinApuntar(viajes(viaje("j", { presupuesto: soloHasta })), HOY), []);
  const v = viaje("j", { presupuesto: soloHasta, gastos: [gasto("a", a(6, 20))] });
  assert.deepEqual(viajesSinApuntar(viajes(v), HOY).map((x) => x.id), ["j"]);
});

test("con dos viajes a la vez, primero el abierto", () => {
  const lista = viajes(viaje("l"), viaje("j"));
  lista.activo = "j";
  assert.deepEqual(viajesSinApuntar(lista, HOY).map((x) => x.id), ["j", "l"]);
});

test("solo a partir de las nueve, y una vez al día", () => {
  const v = viajes(viaje("j"));
  assert.equal(tocaRecordar(v, null, a(8, 20)), null);
  assert.equal(tocaRecordar(v, null, a(8, 21)).id, "j");
  assert.equal(tocaRecordar(v, "2026-10-08", a(8, 23)), null);
  assert.equal(tocaRecordar(v, "2026-10-07", a(8, 22)).id, "j", "lo de ayer no cuenta");
});

test("el mensaje lleva el nombre del viaje si lo tiene", () => {
  assert.match(mensajeRecordatorio(viaje("j", { nombre: "Japón" })).cuerpo, /Japón/);
  assert.ok(mensajeRecordatorio(viaje("j")).cuerpo.length > 0);
  assert.ok(mensajeRecordatorio(viaje("j")).titulo.length > 0);
});

test("quitarlo va en la copia de seguridad", () => {
  assert.ok(CLAVES_COPIA.includes("recordatorioActivo"));
  assert.equal(limpiarCopia({ recordatorioActivo: false }).recordatorioActivo, false);
  assert.equal("recordatorioActivo" in limpiarCopia({ recordatorioActivo: "no" }), false);
});
