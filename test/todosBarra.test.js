const { test } = require("node:test");
const assert = require("node:assert");
const { esTodosBarra, resumenTodosBarra } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const dia = (d) => new Date(2026, 9, d, 12).getTime();
const gasto = (id, valor, d, to = "EUR") => ({ id, from: "JPY", to, cantidad: valor * 160, valor, concepto: "", cuando: dia(d), categoria: "comida", pago: "tarjeta", comision: 0 });
const viaje = (id, nombre, gastos) => ({ id, nombre, gastos, presupuesto: null, cajero: [], personas: 1 });
const todos = (...lista) => ({ activo: lista[0]?.id, lista });

test("entiende todos y all, y nada más", () => {
  assert.equal(esTodosBarra("todos"), true);
  assert.equal(esTodosBarra(" All "), true);
  assert.equal(esTodosBarra("todo"), false);
  assert.equal(esTodosBarra("todos 20"), false);
  assert.equal(esTodosBarra("viaje"), false);
});

test("suma los viajes, sus días y marca el caro y el barato", () => {
  const r = resumenTodosBarra(todos(
    viaje("j", "Japón", [gasto("a", 300, 1), gasto("b", 300, 3)]), // 600 en 3 días
    viaje("l", "Lisboa", [gasto("c", 100, 5), gasto("d", 100, 6)]), // 200 en 2 días
  ));
  assert.equal(r.principal, "2 viajes: 800,00 EUR en 5 días");
  assert.deepEqual(r.detalle, ["160,00 al día", "El más caro: Japón, 200,00 al día", "El más barato: Lisboa, 100,00 al día"]);
});

test("con uno solo no hay caro ni barato, y sin nombre sale el de siempre", () => {
  const r = resumenTodosBarra(todos(viaje("j", "", [gasto("a", 12, 1)])));
  assert.equal(r.principal, "1 viaje: 12,00 EUR en 1 día");
  assert.deepEqual(r.detalle, ["12,00 al día"]);
});

test("los viajes vacíos no cuentan y los de otra divisa se avisan", () => {
  const r = resumenTodosBarra(todos(
    viaje("j", "Japón", [gasto("a", 100, 1)]),
    viaje("l", "Lisboa", [gasto("b", 50, 2)]),
    viaje("n", "Nueva York", [gasto("c", 90, 3, "USD")]),
    viaje("v", "Vacío", []),
  ));
  assert.equal(r.principal, "2 viajes: 150,00 EUR en 2 días");
  assert.equal(r.detalle.at(-1), "Sin contar 1 en otra divisa");
});

test("sin nada apuntado, lo dice", () => {
  assert.equal(resumenTodosBarra(todos(viaje("v", "Vacío", []))).principal, "Aún no has apuntado nada en ningún viaje");
  assert.equal(resumenTodosBarra({ activo: null, lista: [] }).principal, "Aún no has apuntado nada en ningún viaje");
});

test("en inglés", () => {
  ponerIdioma("en");
  try {
    const r = resumenTodosBarra(todos(viaje("j", "Japan", [gasto("a", 300, 1), gasto("b", 300, 3)]), viaje("l", "Lisbon", [gasto("c", 100, 5)])));
    assert.equal(r.principal, "2 trips: 700.00 EUR over 4 days");
    assert.equal(r.detalle[1], "Priciest: Japan, 200.00 a day");
  } finally {
    ponerIdioma("es");
  }
});
