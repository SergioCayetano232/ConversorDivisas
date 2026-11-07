const { test, afterEach } = require("node:test");
const assert = require("node:assert");
const {
  CATEGORIAS, CATEGORIAS_PROPIAS_MAX, esCategoria, leerCategoriasPropias, ponerCategoriasPropias, todasCategorias, nombreCategoria,
  emojiCategoria, crearCategoriaPropia, quitarCategoriaPropia, sinCategoria, crearGasto, leerGastos, leerTopes, desglose,
  leerViajes, archivarViaje, resumenParaCompartir, buscarGastos, crearCopia, leerCopia,
} = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

afterEach(() => ponerCategoriasPropias([]));

const buceo = { id: "p-buceo1", nombre: "Buceo" };
const gasto = (id, valor, categoria, concepto = "") => crearGasto({ id, from: "THB", to: "EUR", cantidad: valor * 38, valor, concepto, cuando: 1, categoria });

test("las de siempre y las tuyas valen; lo demás va a otros", () => {
  assert.ok(esCategoria("comida"));
  assert.ok(esCategoria("p-buceo1"));
  assert.equal(esCategoria("p-"), false);
  assert.equal(esCategoria("P-BUCEO"), false);
  assert.equal(esCategoria("buceo"), false);
  assert.equal(gasto("a", 10, "p-buceo1").categoria, "p-buceo1");
  assert.equal(gasto("a", 10, "buceo").categoria, "otros");
});

test("un gasto con una tuya se lee bien aunque la lista aún no haya llegado", () => {
  assert.equal(leerGastos([gasto("a", 10, "p-buceo1")])[0].categoria, "p-buceo1");
});

test("al leer la lista se tira lo malo, lo repetido y lo que sobra", () => {
  const leidas = leerCategoriasPropias([
    buceo, { id: "p-buceo1", nombre: "Otra" }, { id: "mal", nombre: "Mal" }, { id: "p-x", nombre: "   " },
    { id: "p-a", nombre: "  Regalos   de   Navidad para todos " }, { id: "p-b", nombre: "B" }, { id: "p-c", nombre: "C" },
  ]);
  assert.deepEqual(leidas, [buceo, { id: "p-a", nombre: "Regalos de Nav" }, { id: "p-b", nombre: "B" }]);
  assert.equal(leidas.length, CATEGORIAS_PROPIAS_MAX);
  assert.deepEqual(leerCategoriasPropias("hola"), []);
});

test("crear: sin nombre, repetida, con el nombre de una de siempre o pasada de tres, no", () => {
  ponerIdioma("es");
  let lista = crearCategoriaPropia([], buceo);
  assert.deepEqual(lista, [buceo]);
  assert.deepEqual(crearCategoriaPropia(lista, { id: "p-2", nombre: "buceo" }), lista);
  assert.deepEqual(crearCategoriaPropia(lista, { id: "p-2", nombre: "Comida" }), lista);
  assert.deepEqual(crearCategoriaPropia(lista, { id: "p-2", nombre: "  " }), lista);
  assert.deepEqual(crearCategoriaPropia(lista, { id: "p-buceo1", nombre: "Surf" }), lista);
  lista = crearCategoriaPropia(crearCategoriaPropia(lista, { id: "p-2", nombre: "Surf" }), { id: "p-3", nombre: "Regalos" });
  assert.equal(crearCategoriaPropia(lista, { id: "p-4", nombre: "Masajes" }).length, CATEGORIAS_PROPIAS_MAX);
  assert.deepEqual(quitarCategoriaPropia(lista, "p-2").map((c) => c.id), ["p-buceo1", "p-3"]);
});

test("el nombre y el emoji salen de la lista; la que ya no está, como otros", () => {
  ponerIdioma("es");
  ponerCategoriasPropias([buceo]);
  assert.deepEqual(todasCategorias(), [...CATEGORIAS, "p-buceo1"]);
  assert.equal(nombreCategoria("p-buceo1"), "Buceo");
  assert.equal(emojiCategoria("p-buceo1"), "🏷️");
  assert.equal(nombreCategoria("comida"), "Comida");
  assert.equal(emojiCategoria("comida"), "🍽️");
  assert.equal(nombreCategoria("p-nada"), "Otros");
  assert.equal(emojiCategoria("p-nada"), "📌");
});

test("cuenta en el desglose, en el resumen y en la búsqueda como una más", () => {
  ponerIdioma("es");
  ponerCategoriasPropias([buceo]);
  const gastos = [gasto("a", 60, "p-buceo1", "Inmersión"), gasto("b", 40, "comida", "Cena")];
  assert.deepEqual(desglose(gastos).map((d) => [d.categoria, d.fraccion]), [["p-buceo1", 0.6], ["comida", 0.4]]);
  assert.match(resumenParaCompartir({ nombre: "Tailandia", gastos, presupuesto: null, personas: 1 }, "2026-11-07"), /🏷️ Buceo: 60,00 EUR \(60 %\)/);
  assert.deepEqual(buscarGastos(gastos, "buceo").map((g) => g.id), ["a"]);
});

test("también se le puede poner tope", () => {
  assert.deepEqual(leerTopes({ "p-buceo1": 150, comida: 200, nada: 5, "p-": 3 }), { "p-buceo1": 150, comida: 200 });
});

test("al quitarla, lo suyo pasa a otros en todos los viajes, archivados incluidos, y el tope se suma", () => {
  const viaje = (id) => ({
    id, nombre: id, personas: 1, color: "oro", cajero: [],
    presupuesto: { importe: 1000, to: "EUR", hasta: "2026-12-01", categorias: { "p-buceo1": 150, otros: 50 } },
    gastos: [gasto(`${id}1`, 60, "p-buceo1"), gasto(`${id}2`, 40, "comida")],
    pendientes: [{ id: `${id}p`, from: "THB", to: "EUR", cantidad: 380, valor: 10, concepto: "Barco", cuando: 1, categoria: "p-buceo1" }],
  });
  const viajes = archivarViaje(leerViajes({ activo: "a", lista: [viaje("a"), viaje("b")] }), "b");
  const nuevos = sinCategoria(viajes, "p-buceo1");
  for (const v of [...nuevos.lista, ...nuevos.archivados]) {
    assert.deepEqual(v.gastos.map((g) => g.categoria), ["otros", "comida"]);
    assert.deepEqual(v.presupuesto.categorias, { otros: 200 });
    assert.ok(v.pendientes.every((p) => p.categoria === "otros"));
  }
});

test("la copia de seguridad se lleva tus categorías", () => {
  const { datos } = leerCopia(JSON.stringify(crearCopia({ categoriasPropias: [buceo, { id: "x" }] })));
  assert.deepEqual(datos.categoriasPropias, [buceo]);
  assert.equal("categoriasPropias" in leerCopia(JSON.stringify(crearCopia({}))).datos, false);
});
