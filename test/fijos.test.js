const { test } = require("node:test");
const assert = require("node:assert");
const {
  crearGasto, leerGastos, marcarFijo, delDiaADia, mediaPorDia, gastadoHoy, masCarosDelDia, gastoRaro,
  destacados, loDeHoy, estadoPresupuesto, sumarPorDivisa, desglose, compararViajes, resumenParaCompartir,
} = require("../logica.js");

const dia = (d, h = 12) => new Date(2026, 10, d, h).getTime();
const gasto = (id, valor, d, extra = {}) => crearGasto({
  id, from: "JPY", to: "EUR", cantidad: valor * 160, valor, concepto: id, cuando: dia(d), categoria: "comida", ...extra,
});
const vuelo = () => gasto("vuelo", 900, 1, { categoria: "transporte", fijo: true });

test("fijo solo se guarda si lo es", () => {
  assert.equal(vuelo().fijo, true);
  assert.equal("fijo" in gasto("a", 10, 1), false);
  assert.equal("fijo" in gasto("a", 10, 1, { fijo: "sí" }), false);
  const [leido, viejo] = leerGastos([vuelo(), { ...gasto("b", 10, 1), fijo: 1 }]);
  assert.equal(leido.fijo, true);
  assert.equal("fijo" in viejo, false);
});

test("marcar y desmarcar, sin tocar los demás", () => {
  const lista = [gasto("a", 10, 1), gasto("b", 20, 1)];
  const marcada = marcarFijo(lista, "a", true);
  assert.equal(marcada[0].fijo, true);
  assert.equal(marcada[1], lista[1]);
  assert.equal("fijo" in marcarFijo(marcada, "a", false)[0], false);
  assert.equal(marcarFijo(lista, "a", false)[0], lista[0], "si ya estaba así, el mismo");
});

test("la media al día no cuenta el vuelo", () => {
  // Como en el viaje, del más nuevo al más viejo. 30 + 60 en tres días son 30
  // al día; con el vuelo serían 330.
  const lista = [gasto("b", 60, 5), gasto("a", 30, 3), vuelo()];
  assert.equal(mediaPorDia(lista).media, 30);
  assert.equal(mediaPorDia(lista).dias, 3, "los días empiezan con el primero del día a día");
  assert.equal(mediaPorDia([vuelo()]), null);
});

test("en el total y en las categorías sí cuenta", () => {
  const lista = [vuelo(), gasto("a", 30, 3)];
  assert.equal(sumarPorDivisa(lista)[0].total, 930);
  assert.equal(desglose(lista)[0].categoria, "transporte");
  assert.equal(delDiaADia(lista).length, 1);
});

test("lo de hoy, la corona y el raro se lo saltan", () => {
  const hoyIso = "2026-11-01";
  const lista = [vuelo(), gasto("a", 30, 1), gasto("b", 10, 1)];
  assert.equal(gastadoHoy(lista, hoyIso).total, 40);
  assert.deepEqual([...masCarosDelDia(lista)], ["a"]);
  assert.equal(gastoRaro([...lista, gasto("c", 12, 1), gasto("d", 11, 1)], vuelo()), null);
});

test("el día que más no es el del vuelo", () => {
  const lista = [vuelo(), gasto("a", 30, 2), gasto("b", 80, 3), gasto("c", 20, 4)];
  assert.equal(destacados(lista, "2026-11-10").dia.dia, "2026-11-03");
  assert.equal(destacados(lista, "2026-11-10").caro.id, "b");
});

test("en el presupuesto cuenta entero, y el de hoy como ya pagado", () => {
  const presupuesto = { importe: 1500, to: "EUR", desde: "2026-11-01", hasta: "2026-11-10" };
  const lista = [vuelo(), gasto("a", 30, 1)];
  assert.equal(estadoPresupuesto(presupuesto, lista, "2026-11-01").gastado, 930);
  const deHoy = loDeHoy(presupuesto, lista, "2026-11-01");
  assert.equal(deHoy.gastado, 30);
  // Lo que queda tras el vuelo, entre los diez días: 60 al día.
  assert.equal(deHoy.toca, 60);
});

test("comparar viajes con lo de cada día", () => {
  const japon = { id: "j", gastos: [gasto("b", 30, 4), gasto("a", 30, 3), vuelo()] };
  const [fila] = compararViajes([japon]);
  assert.equal(fila.media, 30);
  assert.equal(fila.dias, 2);
});

test("el resumen los pone aparte", () => {
  const texto = resumenParaCompartir({ nombre: "Japón", gastos: [vuelo(), gasto("a", 30, 3), gasto("b", 60, 5)] }, "2026-11-10");
  assert.match(texto, /📌 Pagado aparte \(vuelos, reservas…\): 900,00 EUR/);
  assert.doesNotMatch(texto.split("Por días")[1] ?? "", /1 nov/);
});

test("el presupuesto llega si lo de cada día es poco, aunque el vuelo fuera caro", () => {
  const { hastaCuandoLlega, previsionViaje, rachaPresupuesto, inicioDelViaje } = require("../logica.js");
  const presupuesto = { importe: 1500, to: "EUR", desde: "2026-11-01", hasta: "2026-11-10" };
  const lista = [gasto("c", 12, 4), gasto("b", 60, 3), gasto("a", 30, 2), vuelo()];
  // Sin marcar, 1.002 en cuatro días sería no llegar; con el vuelo aparte, 25,50 al día.
  assert.equal(hastaCuandoLlega(presupuesto, lista.map((g) => ({ ...g, fijo: undefined })), "2026-11-04"), "2026-11-05");
  assert.equal(hastaCuandoLlega(presupuesto, lista, "2026-11-04"), null);
  // 1.002 ya gastado y 25,50 al día los seis días que faltan.
  assert.equal(previsionViaje(presupuesto, lista, "2026-11-04").total, 1002 + 25.5 * 6);
  // Quedan 600 para diez días: 60 al día, y los tres primeros días cumplen.
  assert.equal(rachaPresupuesto(presupuesto, lista, "2026-11-04").toca, 60);
  assert.equal(inicioDelViaje(null, [gasto("a", 30, 3), { ...vuelo(), cuando: new Date(2026, 6, 1).getTime() }]), "2026-11-03");
});
