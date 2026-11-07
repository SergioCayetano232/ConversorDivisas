const { test } = require("node:test");
const assert = require("node:assert");
const {
  VIAJES_MAX, ARCHIVADOS_MAX, leerViajes, crearViaje, duplicarViaje, borrarViaje, moverGasto, cambiarViaje,
  archivarViaje, desarchivarViaje, borrarArchivado, todosLosViajes, crearGasto, crearCopia, leerCopia, resumenCopia,
} = require("../logica.js");

const gasto = (id) => crearGasto({ id, from: "JPY", to: "EUR", cantidad: 1600, valor: 10, concepto: "Cena", cuando: 1, categoria: "comida" });
const viaje = (id, nombre = id) => ({ id, nombre, gastos: [gasto(`g-${id}`)], presupuesto: null, cajero: [], personas: 1, color: "oro" });
const tres = () => leerViajes({ activo: "b", lista: [viaje("a"), viaje("b"), viaje("c")] });

test("lo de antes no trae archivados y sale igual que siempre", () => {
  const viajes = tres();
  assert.equal("archivados" in viajes, false);
  assert.deepEqual(Object.keys(viajes), ["activo", "lista"]);
});

test("archivar el abierto lo saca de la lista y pasas al de al lado", () => {
  const viajes = archivarViaje(tres(), "b");
  assert.deepEqual(viajes.lista.map((v) => v.id), ["a", "c"]);
  assert.equal(viajes.activo, "c");
  assert.deepEqual(viajes.archivados.map((v) => v.id), ["b"]);
  // Con sus gastos, que es para lo que se archiva.
  assert.equal(viajes.archivados[0].gastos.length, 1);
});

test("el último que archivas va el primero", () => {
  const viajes = archivarViaje(archivarViaje(tres(), "a"), "c");
  assert.deepEqual(viajes.archivados.map((v) => v.id), ["c", "a"]);
  assert.equal(viajes.activo, "b");
});

test("el último de la lista no se archiva, como no se borra", () => {
  const solo = leerViajes({ activo: "a", lista: [viaje("a")] });
  assert.equal(archivarViaje(solo, "a"), solo);
  const viajes = tres();
  assert.equal(archivarViaje(viajes, "nada"), viajes);
});

test("con el archivo lleno no cabe otro", () => {
  const archivados = Array.from({ length: ARCHIVADOS_MAX }, (_, i) => viaje(`x${i}`));
  const viajes = leerViajes({ activo: "a", lista: [viaje("a"), viaje("b")], archivados });
  assert.equal(viajes.archivados.length, ARCHIVADOS_MAX);
  assert.equal(archivarViaje(viajes, "b"), viajes);
});

test("archivados no cuentan para los ocho: hay sitio para uno nuevo", () => {
  const lista = Array.from({ length: VIAJES_MAX }, (_, i) => viaje(`v${i}`));
  const lleno = leerViajes({ activo: "v0", lista });
  assert.equal(crearViaje(lleno, "nuevo", "Lisboa"), lleno);
  const conSitio = crearViaje(archivarViaje(lleno, "v3"), "nuevo", "Lisboa");
  assert.equal(conSitio.lista.length, VIAJES_MAX);
  assert.equal(conSitio.activo, "nuevo");
  assert.deepEqual(conSitio.archivados.map((v) => v.id), ["v3"]);
});

test("sacarlo del archivo lo devuelve a la lista y lo abre", () => {
  const viajes = desarchivarViaje(archivarViaje(tres(), "a"), "a");
  assert.deepEqual(viajes.lista.map((v) => v.id), ["b", "c", "a"]);
  assert.equal(viajes.activo, "a");
  assert.equal("archivados" in viajes, false);
});

test("con la lista llena no se puede sacar", () => {
  const lista = Array.from({ length: VIAJES_MAX }, (_, i) => viaje(`v${i}`));
  const viajes = leerViajes({ activo: "v0", lista, archivados: [viaje("viejo")] });
  assert.equal(desarchivarViaje(viajes, "viejo"), viajes);
  assert.equal(desarchivarViaje(viajes, "nada"), viajes);
});

test("borrar un archivado no toca la lista", () => {
  const viajes = borrarArchivado(archivarViaje(archivarViaje(tres(), "a"), "c"), "a");
  assert.deepEqual(viajes.archivados.map((v) => v.id), ["c"]);
  assert.deepEqual(viajes.lista.map((v) => v.id), ["b"]);
  assert.equal("archivados" in borrarArchivado(viajes, "c"), false);
  assert.equal(borrarArchivado(viajes, "b"), viajes);
});

test("crear, duplicar, borrar, mover y cambiar no pierden el archivo", () => {
  let viajes = archivarViaje(tres(), "a");
  viajes = crearViaje(viajes, "d", "Roma");
  viajes = duplicarViaje(viajes, "d", "e", { hoyIso: "2026-11-07" });
  viajes = borrarViaje(viajes, "e");
  viajes = moverGasto(viajes, "g-b", "b", "c");
  viajes = cambiarViaje(viajes, "c", { personas: 2 });
  assert.deepEqual(viajes.archivados.map((v) => v.id), ["a"]);
});

test("un id que ya está en el archivo no se repite al crear", () => {
  const viajes = archivarViaje(tres(), "a");
  assert.equal(crearViaje(viajes, "a", "Otra vez"), viajes);
  assert.equal(duplicarViaje(viajes, "b", "a"), viajes);
});

test("al leer, lo malo se tira y no puede haber el mismo viaje en los dos sitios", () => {
  const viajes = leerViajes({ activo: "a", lista: [viaje("a")], archivados: [viaje("a"), null, { id: "" }, viaje("b"), "x"] });
  assert.deepEqual(viajes.archivados.map((v) => v.id), ["b"]);
  assert.equal(leerViajes({ activo: "a", lista: [viaje("a")], archivados: "x" }).archivados, undefined);
});

test("con todo archivado y la lista vacía, empieza uno limpio sin pisar ningún id", () => {
  const viajes = leerViajes({ activo: "x", lista: [], archivados: [viaje("primero")] });
  assert.equal(viajes.lista.length, 1);
  assert.notEqual(viajes.lista[0].id, "primero");
  assert.equal(viajes.archivados[0].id, "primero");
});

test("la copia de seguridad se lleva el archivo y lo cuenta", () => {
  const viajes = archivarViaje(tres(), "a");
  const { datos } = leerCopia(JSON.stringify(crearCopia({ viajes })));
  assert.deepEqual(datos.viajes.archivados.map((v) => v.id), ["a"]);
  assert.equal(resumenCopia(datos).viajes, 3);
  assert.equal(resumenCopia(datos).gastos, 3);
  assert.equal(todosLosViajes(datos.viajes).length, 3);
});
