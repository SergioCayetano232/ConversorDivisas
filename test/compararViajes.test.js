const { test } = require("node:test");
const assert = require("node:assert");
const { compararViajes } = require("../logica.js");

const dia = (d) => new Date(2026, 9, d, 12).getTime();
const gasto = (id, valor, d, categoria = "comida", to = "EUR") => ({ id, from: "JPY", to, cantidad: valor * 160, valor, concepto: "", cuando: dia(d), categoria, pago: "tarjeta", comision: 0 });
const viaje = (id, gastos) => ({ id, nombre: id, gastos, presupuesto: null, cajero: [], personas: 1 });

test("la media cuenta del primer día al último, también los que no gastaste", () => {
  const [j] = compararViajes([viaje("j", [gasto("a", 100, 1), gasto("b", 50, 4, "transporte")])]);
  assert.equal(j.dias, 4);
  assert.equal(j.media, 37.5);
  assert.equal(j.categoria.categoria, "comida");
  assert.equal(j.peso, null, "solo uno no se compara con nada");
});

test("un día solo es un día", () => {
  assert.equal(compararViajes([viaje("l", [gasto("a", 80, 3), gasto("b", 20, 3)])])[0].media, 100);
});

test("la barra va contra el que más gasta al día, y marca el caro y el barato", () => {
  const r = compararViajes([
    viaje("j", [gasto("a", 300, 1), gasto("b", 300, 3)]), // 200 al día
    viaje("l", [gasto("c", 100, 5), gasto("d", 100, 6)]), // 100 al día
    viaje("p", [gasto("e", 150, 7)]), // 150 al día
  ]);
  assert.deepEqual(r.map((f) => f.peso), [1, 0.5, 0.75]);
  assert.deepEqual(r.map((f) => f.extremo), ["caro", "barato", null]);
});

test("sin gastos o en otra divisa, fuera de la comparación", () => {
  const r = compararViajes([
    viaje("j", [gasto("a", 200, 1)]),
    viaje("l", [gasto("b", 100, 2)]),
    viaje("u", [gasto("c", 999, 3, "comida", "USD")]),
    viaje("v", []),
  ]);
  assert.equal(r[2].peso, null);
  assert.equal(r[2].extremo, null);
  assert.equal(r[2].media, 999, "su media sí la tiene");
  assert.equal(r[3].media, null);
  assert.equal(r[0].extremo, "caro");
});

test("si todos gastan lo mismo no hay caro ni barato", () => {
  const r = compararViajes([viaje("j", [gasto("a", 50, 1)]), viaje("l", [gasto("b", 50, 2)])]);
  assert.deepEqual(r.map((f) => f.extremo), [null, null]);
});
