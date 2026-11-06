const { test } = require("node:test");
const assert = require("node:assert");
const { crearGasto, moverGasto, GASTOS_MAX } = require("../logica.js");

const gasto = (id, valor = 10) => crearGasto({
  id, from: "JPY", to: "EUR", cantidad: valor * 160, valor, concepto: "Taxi", cuando: Date.now(), categoria: "transporte",
});
const viajes = () => ({
  activo: "japon",
  lista: [
    { id: "japon", nombre: "Japón", gastos: [gasto("a"), gasto("b", 25), gasto("c")] },
    { id: "lisboa", nombre: "Lisboa", gastos: [gasto("x")] },
  ],
});

test("el taxi pasa de Japón a Lisboa tal cual", () => {
  const antes = viajes();
  const despues = moverGasto(antes, "b", "japon", "lisboa");
  assert.deepEqual(despues.lista[0].gastos.map((g) => g.id), ["a", "c"]);
  assert.deepEqual(despues.lista[1].gastos.map((g) => g.id), ["b", "x"]);
  assert.deepEqual(despues.lista[1].gastos[0], antes.lista[0].gastos[1], "con su tasa y su fecha");
  assert.equal(despues.activo, "japon", "sigues en el que estabas");
});

test("deshacerlo lo deja en su sitio", () => {
  const ida = moverGasto(viajes(), "b", "japon", "lisboa");
  const vuelta = moverGasto(ida, "b", "lisboa", "japon", 1);
  assert.deepEqual(vuelta.lista[0].gastos.map((g) => g.id), ["a", "b", "c"]);
  assert.deepEqual(vuelta.lista[1].gastos.map((g) => g.id), ["x"]);
});

test("si no cabe o no tiene sentido, no se mueve nada", () => {
  const v = viajes();
  assert.equal(moverGasto(v, "b", "japon", "japon"), v);
  assert.equal(moverGasto(v, "zz", "japon", "lisboa"), v);
  assert.equal(moverGasto(v, "b", "japon", "nada"), v);
  assert.equal(moverGasto(v, "b", "nada", "lisboa"), v);
  const lleno = { ...v, lista: [v.lista[0], { ...v.lista[1], gastos: Array.from({ length: GASTOS_MAX }, (_, i) => gasto(`l${i}`)) }] };
  assert.equal(moverGasto(lleno, "b", "japon", "lisboa"), lleno);
});

test("si el otro ya tiene uno con ese id, no lo pisa", () => {
  const v = viajes();
  v.lista[1].gastos.push(gasto("b"));
  assert.equal(moverGasto(v, "b", "japon", "lisboa"), v);
});
