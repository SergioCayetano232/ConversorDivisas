const { test } = require("node:test");
const assert = require("node:assert");
const { gastosPorDia, pesoDeLosDias } = require("../logica.js");

const dia = (d, h = 12) => new Date(2026, 9, d, h).getTime();
const gasto = (cuando, valor, to = "EUR") => ({ id: String(cuando + valor), from: "USD", to, cantidad: valor, valor, cuando, concepto: "", categoria: "otros" });

test("el día que más es la barra entera y los demás, su parte", () => {
  const dias = gastosPorDia([gasto(dia(3), 20), gasto(dia(2), 30), gasto(dia(2, 9), 50), gasto(dia(1), 40)]);
  assert.deepEqual(pesoDeLosDias(dias), [0.25, 1, 0.5]);
});

test("solo cuenta la divisa que más suma", () => {
  const dias = gastosPorDia([gasto(dia(2), 90, "JPY"), gasto(dia(1), 100), gasto(dia(1, 9), 50, "JPY"), gasto(dia(0), 50)]);
  assert.deepEqual(pesoDeLosDias(dias), [0, 1, 0.5]);
});

test("sin gastos o con todo a cero, no hay barras", () => {
  assert.deepEqual(pesoDeLosDias([]), []);
  assert.deepEqual(pesoDeLosDias(gastosPorDia([gasto(dia(1), 0)])), [0]);
});
