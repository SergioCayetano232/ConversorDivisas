const { test } = require("node:test");
const assert = require("node:assert");
const { aniosConGastos, datosAnio } = require("../logica.js");

const el = (a, m, d) => new Date(a, m - 1, d, 12).getTime();
let n = 0;
const gasto = (from, valor, cuando, extra = {}) => ({
  id: `g${(n += 1)}`, from, to: "EUR", cantidad: valor * 2, valor, concepto: "Café", cuando,
  categoria: "comida", pago: "tarjeta", comision: 0, ...extra,
});
const viaje = (id, nombre, gastos) => ({ id, nombre, gastos, presupuesto: null, cajero: [], personas: 1 });

const japon = viaje("j", "Japón", [gasto("JPY", 100, el(2026, 4, 1)), gasto("JPY", 300, el(2026, 4, 4), { concepto: "Ryokan", categoria: "alojamiento" })]);
const lisboa = viaje("l", "Lisboa", [gasto("EUR", 20, el(2026, 6, 10), { to: "USD" }), gasto("USD", 50, el(2026, 6, 10)), gasto("USD", 50, el(2026, 6, 11))]);
const viejo = viaje("v", "Roma", [gasto("EUR", 80, el(2025, 3, 1), { to: "USD" })]);

test("los años con gastos, del más nuevo al más viejo", () => {
  assert.deepEqual(aniosConGastos([japon, lisboa, viejo]), [2026, 2025]);
  assert.deepEqual(aniosConGastos([]), []);
});

test("el año: viajes, días fuera, total y media", () => {
  const d = datosAnio([japon, lisboa, viejo], 2026);
  assert.equal(d.viajes, 2);
  assert.equal(d.dias, 6, "4 en Japón y 2 en Lisboa");
  assert.deepEqual([d.total.total, d.total.to], [500, "EUR"]);
  assert.deepEqual(d.otras.map((o) => [o.total, o.to]), [[20, "USD"]], "lo de otra divisa va aparte");
  assert.equal(d.n, 5);
  assert.ok(Math.abs(d.media.valor - 500 / 6) < 1e-9);
  assert.deepEqual(d.divisas, ["JPY", "USD"], "por orden de llegada, sin la tuya");
});

test("el más caro y el más barato al día, y lo más caro del año", () => {
  const d = datosAnio([japon, lisboa], 2026);
  assert.deepEqual([d.caroDia.nombre, d.caroDia.media], ["Japón", 100]);
  assert.deepEqual([d.baratoDia.nombre, d.baratoDia.media], ["Lisboa", 50]);
  assert.deepEqual([d.caro.concepto, d.caro.valor], ["Ryokan", 300]);
  assert.equal(d.categorias[0].categoria, "alojamiento");
});

test("con un viaje solo no hay más caro ni más barato", () => {
  const d = datosAnio([japon], 2026);
  assert.equal(d.caroDia, null);
  assert.equal(d.baratoDia, null);
});

test("un viaje de Nochevieja cuenta en los dos años, con lo de cada uno", () => {
  const fin = viaje("f", "Berlín", [gasto("EUR", 40, el(2025, 12, 30), { to: "USD" }), gasto("EUR", 60, el(2026, 1, 2), { to: "USD" })]);
  assert.deepEqual(aniosConGastos([fin]), [2026, 2025]);
  assert.equal(datosAnio([fin], 2025).total.total, 40);
  assert.equal(datosAnio([fin], 2026).total.total, 60);
  assert.equal(datosAnio([fin], 2026).dias, 1);
});

test("los días que se solapan cuentan una vez", () => {
  const largo = viaje("a", "Asia", [gasto("THB", 10, el(2026, 2, 1)), gasto("THB", 10, el(2026, 2, 10))]);
  const dentro = viaje("b", "Escapada", [gasto("VND", 10, el(2026, 2, 5)), gasto("VND", 10, el(2026, 2, 6))]);
  assert.equal(datosAnio([largo, dentro], 2026).dias, 10);
});

test("lo pagado aparte cuenta en el total, pero no en lo más caro ni en la media", () => {
  const conVuelo = viaje("j", "Japón", [...japon.gastos, gasto("JPY", 900, el(2026, 1, 15), { concepto: "Vuelo", fijo: true })]);
  const d = datosAnio([conVuelo], 2026);
  assert.equal(d.total.total, 1300);
  assert.equal(d.caro.concepto, "Ryokan");
  assert.equal(d.dias, 4, "el vuelo de enero no te pone de viaje en enero");
  assert.equal(d.media.valor, 100);
});

test("un año sin gastos no tiene tarjeta", () => {
  assert.equal(datosAnio([japon], 2024), null);
  assert.equal(datosAnio([], 2026), null);
});
