const { test } = require("node:test");
const assert = require("node:assert");
const {
  crearGasto, leerViajes, pasarAEmpresa, sacarDeEmpresa, notaDeGastos, puedeSerDeEmpresa, sumarPorDivisa, efectivoQueda, cuantoSacar, loQueSobra,
  resumenCopia, sinCategoria, estadoPresupuesto,
} = require("../logica.js");

const gasto = (id, dia, valor, extra = {}) => crearGasto({
  id, from: "JPY", to: "EUR", cantidad: valor * 160, valor, concepto: "Cena", cuando: new Date(`2026-06-${dia}T12:00`).getTime(), categoria: "comida", ...extra,
});
const ids = (lista) => lista.map((g) => g.id);

test("pasa a la lista de empresa y sale de la tuya", () => {
  const r = pasarAEmpresa([gasto("b", "02", 20), gasto("a", "01", 10)], undefined, "a");
  assert.deepEqual(ids(r.gastos), ["b"]);
  assert.deepEqual(ids(r.empresa), ["a"]);
});

test("deja de contar en el total y en el presupuesto", () => {
  const lista = [gasto("b", "02", 20), gasto("a", "01", 10)];
  const r = pasarAEmpresa(lista, [], "a");
  assert.equal(sumarPorDivisa(r.gastos)[0].total, 20);
  const presupuesto = { importe: 100, to: "EUR", desde: "2026-06-01", hasta: "2026-06-05" };
  assert.equal(estadoPresupuesto(presupuesto, r.gastos, "2026-06-02").gastado, 20);
});

test("vuelve a su sitio por la fecha", () => {
  const { gastos, empresa } = pasarAEmpresa([gasto("c", "03", 1), gasto("b", "02", 1), gasto("a", "01", 1)], [], "b");
  assert.deepEqual(ids(sacarDeEmpresa(gastos, empresa, "b").gastos), ["c", "b", "a"]);
  assert.deepEqual(sacarDeEmpresa(gastos, empresa, "b").empresa, []);
});

test("la empresa también va del último al primero", () => {
  const primero = pasarAEmpresa([gasto("b", "02", 1), gasto("a", "01", 1)], [], "a");
  assert.deepEqual(ids(pasarAEmpresa(primero.gastos, primero.empresa, "b").empresa), ["b", "a"]);
});

test("lo que pagó otro no te lo paga tu empresa", () => {
  const suyo = gasto("a", "01", 1, { pagador: 1 });
  assert.equal(puedeSerDeEmpresa(suyo), false);
  assert.equal(pasarAEmpresa([suyo], [], "a"), null);
});

test("un id que no está no hace nada", () => {
  assert.equal(pasarAEmpresa([gasto("a", "01", 1)], [], "zz"), null);
  assert.equal(sacarDeEmpresa([gasto("a", "01", 1)], [], "zz"), null);
});

test("no te pasa de los 200", () => {
  const llena = Array.from({ length: 200 }, (_, i) => gasto(`e${i}`, "01", 1));
  assert.equal(pasarAEmpresa([gasto("a", "01", 1)], llena, "a"), null);
  assert.equal(sacarDeEmpresa(llena, [gasto("a", "01", 1)], "a"), null);
});

test("los viajes de antes no traen el campo", () => {
  const { lista } = leerViajes({ activo: "t", lista: [{ id: "t", gastos: [gasto("a", "01", 1)] }] });
  assert.equal("empresa" in lista[0], false);
});

test("se relee, y lo roto se tira", () => {
  const { lista } = leerViajes({ activo: "t", lista: [{ id: "t", gastos: [], empresa: [gasto("a", "01", 1), { id: 3 }] }] });
  assert.deepEqual(ids(lista[0].empresa), ["a"]);
});

test("el efectivo salió de tu cartera aunque te lo paguen", () => {
  const retiradas = [{ divisa: "JPY", cantidad: 10000 }];
  const delTrabajo = [gasto("a", "01", 10, { pago: "efectivo" })];
  const presupuesto = { importe: 700, to: "EUR", desde: "2026-06-01", hasta: "2026-06-07" };
  assert.equal(cuantoSacar(presupuesto, [gasto("b", "01", 10, { pago: "efectivo" })], retiradas, "JPY", 0.00625, "2026-06-02", delTrabajo).tienes, 6800);
  assert.equal(loQueSobra(presupuesto, [], retiradas, 0.00625, "2026-06-07", delTrabajo).queda, 8400);
  assert.equal(efectivoQueda(retiradas, [...delTrabajo])[0].queda, 8400);
});

test("la nota va del primero al último con sus totales", () => {
  const n = notaDeGastos({ nombre: "Congreso", empresa: [gasto("b", "03", 20, { concepto: "Taxi", pago: "efectivo" }), gasto("a", "01", 10, { concepto: "" })] });
  assert.equal(n.nombre, "Congreso");
  assert.deepEqual([n.desde, n.hasta], ["2026-06-01", "2026-06-03"]);
  assert.deepEqual(n.filas.map((f) => f.concepto), ["Comida", "Taxi"]);
  assert.equal(n.filas[1].pago, "Efectivo");
  assert.deepEqual(n.totales, [{ to: "EUR", total: 30 }]);
});

test("sin gastos de empresa no hay nota", () => {
  assert.equal(notaDeGastos({ nombre: "x" }), null);
  assert.equal(notaDeGastos(undefined), null);
});

test("la copia cuenta también los de la empresa", () => {
  const viajes = leerViajes({ activo: "t", lista: [{ id: "t", gastos: [gasto("a", "01", 1)], empresa: [gasto("b", "01", 1)] }] });
  assert.equal(resumenCopia({ viajes }).gastos, 2);
});

test("al quitar una categoría propia, también aquí pasa a otros", () => {
  const viajes = { activo: "t", lista: [{ id: "t", gastos: [], presupuesto: null, empresa: [{ ...gasto("a", "01", 1), categoria: "buceo" }] }] };
  assert.equal(sinCategoria(viajes, "buceo").lista[0].empresa[0].categoria, "otros");
});
