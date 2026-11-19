const { test } = require("node:test");
const assert = require("node:assert");
const { conceptosFrecuentes } = require("../logica.js");

const gasto = (concepto, cuando, categoria = "comida") => ({ concepto, cuando, categoria });

test("los que más repites, desde dos veces", () => {
  const lista = [
    gasto("Café", 1), gasto("café", 2), gasto("Café", 3),
    gasto("Metro", 4, "transporte"), gasto("Metro", 5, "transporte"),
    gasto("Museo", 6, "ocio"),
  ];
  assert.deepEqual(conceptosFrecuentes(lista), [
    { concepto: "Café", categoria: "comida" },
    { concepto: "Metro", categoria: "transporte" },
  ]);
});

test("como mucho cuatro, y a igual número el último", () => {
  const lista = ["A", "B", "C", "D", "E"].flatMap((c, i) => [gasto(c, i * 10), gasto(c, i * 10 + 1)]);
  assert.deepEqual(conceptosFrecuentes(lista).map((c) => c.concepto), ["E", "D", "C", "B"]);
  assert.equal(conceptosFrecuentes(lista, 2).length, 2);
});

test("sin concepto o con las noches repartidas, no", () => {
  const lista = [gasto("", 1), gasto("", 2), gasto("1/3 · Hotel", 3, "alojamiento"), gasto("1/3 · Hotel", 4, "alojamiento"), gasto("2/2", 5), gasto("2/2", 6)];
  assert.deepEqual(conceptosFrecuentes(lista), []);
  assert.deepEqual(conceptosFrecuentes([]), []);
});
