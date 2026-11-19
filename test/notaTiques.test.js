const { test } = require("node:test");
const assert = require("node:assert");
const { notaDeGastos, crearGasto } = require("../logica.js");

const gasto = (id, dia, valor) => crearGasto({
  id, from: "JPY", to: "EUR", cantidad: valor * 160, valor, concepto: "Taxi", categoria: "transporte", cuando: new Date(`2026-06-${dia}T12:00:00`).getTime(),
});
const viaje = { nombre: "Congreso", empresa: [gasto("c", "05", 30), gasto("a", "01", 10), gasto("b", "03", 20)] };

test("los tiques van numerados en el orden de la nota", () => {
  const n = notaDeGastos(viaje, new Set(["c", "a"]));
  assert.equal(n.tiques, 2);
  assert.deepEqual(n.filas.map((f) => [f.id, f.tique]), [["a", 1], ["b", undefined], ["c", 2]]);
});

test("sin fotos, sin números, como antes", () => {
  const n = notaDeGastos(viaje);
  assert.equal(n.tiques, 0);
  assert.ok(n.filas.every((f) => !("tique" in f)));
});

test("las fotos de gastos que no son de empresa no cuentan", () => {
  assert.equal(notaDeGastos(viaje, new Set(["x"])).tiques, 0);
});
