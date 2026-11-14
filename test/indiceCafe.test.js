const { test } = require("node:test");
const assert = require("node:assert");
const { indiceCafe, INDICE_MAX } = require("../logica.js");

const dia = (d) => new Date(2026, 9, d, 12).getTime();
let n = 0;
const gasto = (concepto, valor, extra = {}) => ({
  id: `g${(n += 1)}`, from: "JPY", to: "EUR", cantidad: valor * 160, valor, concepto, cuando: dia(n),
  categoria: "comida", pago: "tarjeta", comision: 0, ...extra,
});
const viaje = (id, gastos) => ({ id, nombre: id, gastos, presupuesto: null, cajero: [], personas: 1 });

test("el café de cada viaje, del más barato al más caro", () => {
  const [cafe] = indiceCafe([
    viaje("tokio", [gasto("Café", 4.1), gasto("Café", 4.1)]),
    viaje("lisboa", [gasto("café", 1.2)]),
  ]);
  assert.equal(cafe.concepto, "café", "como lo escribiste la última vez");
  assert.equal(cafe.to, "EUR");
  assert.equal(cafe.n, 3);
  assert.deepEqual(cafe.viajes.map((v) => [v.id, v.precio, v.veces, v.extremo]), [
    ["lisboa", 1.2, 1, "barato"],
    ["tokio", 4.1, 2, "caro"],
  ]);
  assert.equal(cafe.viajes[1].peso, 1);
  assert.ok(Math.abs(cafe.veces - 4.1 / 1.2) < 1e-9);
});

test("con la mediana: el café de cuatro no sube el precio", () => {
  const [cafe] = indiceCafe([
    viaje("lisboa", [gasto("Café", 1.2), gasto("Café", 1.3), gasto("Café", 5)]),
    viaje("roma", [gasto("Café", 1.5)]),
  ]);
  assert.equal(cafe.viajes.find((v) => v.id === "lisboa").precio, 1.3);
});

test("lo que sale en un viaje solo no se compara", () => {
  assert.deepEqual(indiceCafe([viaje("tokio", [gasto("Ramen", 9)]), viaje("lisboa", [gasto("Pastel de nata", 1.5)])]), []);
});

test("fuera las noches repartidas, lo pagado aparte, las devoluciones y lo de otra divisa", () => {
  const [hotel] = indiceCafe([
    viaje("a", [gasto("Hotel", 100), { ...gasto("Hotel", 80), id: "h-1" }, gasto("Hotel", 500, { fijo: true }), gasto("Hotel", -50, { cantidad: -8000 })]),
    viaje("b", [gasto("Hotel", 90), gasto("Hotel", 1, { to: "USD" })]),
  ]);
  assert.deepEqual(hotel.viajes.map((v) => [v.id, v.precio, v.veces]), [["b", 90, 1], ["a", 100, 1]]);
});

test("sin concepto no hay nada que comparar", () => {
  assert.deepEqual(indiceCafe([viaje("a", [gasto("", 3)]), viaje("b", [gasto("  ", 4)])]), []);
});

test("si cuesta lo mismo, ni caro ni barato", () => {
  const [metro] = indiceCafe([viaje("a", [gasto("Metro", 2)]), viaje("b", [gasto("Metro", 2)])]);
  assert.deepEqual(metro.viajes.map((v) => v.extremo), [null, null]);
  assert.equal(metro.veces, null);
});

test("primero lo que sale en más viajes, y como mucho cinco", () => {
  const conceptos = ["Café", "Metro", "Cerveza", "Agua", "Helado", "Pan"];
  const r = indiceCafe([
    viaje("a", conceptos.map((c) => gasto(c, 2))),
    viaje("b", conceptos.map((c) => gasto(c, 3))),
    viaje("c", [gasto("Pan", 1)]),
  ]);
  assert.equal(r.length, INDICE_MAX);
  assert.equal(r[0].concepto, "Pan");
  assert.equal(r[0].viajes.length, 3);
});

test("en tres viajes, el del medio no es ni caro ni barato", () => {
  const [cafe] = indiceCafe([viaje("a", [gasto("Café", 1)]), viaje("b", [gasto("Café", 2)]), viaje("c", [gasto("Café", 3)])]);
  assert.deepEqual(cafe.viajes.map((v) => v.extremo), ["barato", null, "caro"]);
});

test("sin viajes o sin gastos, nada", () => {
  assert.deepEqual(indiceCafe([]), []);
  assert.deepEqual(indiceCafe([viaje("a", [])]), []);
});
