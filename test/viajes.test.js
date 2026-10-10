const { test } = require("node:test");
const assert = require("node:assert");
const {
  VIAJES_MAX, NOMBRE_VIAJE_MAX, leerViajes, viajeActivo, crearViaje, renombrarViaje, elegirViaje, borrarViaje, cambiarViaje,
  resumenViaje, archivoGastos,
} = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const gasto = (id, valor = 10, to = "EUR") => ({
  id, from: "USD", to, cantidad: 12, valor, concepto: "", cuando: 1, categoria: "otros",
});
const presupuesto = { importe: 500, to: "EUR", hasta: "2026-10-10" };
const ids = (viajes) => viajes.lista.map((v) => v.id);

test("sin nada guardado hay un viaje vacío", () => {
  const viajes = leerViajes(undefined);
  assert.deepEqual(viajes, { activo: "primero", lista: [{ id: "primero", nombre: "", gastos: [], presupuesto: null, cajero: [], personas: 1 }] });
});

test("los gastos y el presupuesto de antes pasan al primer viaje", () => {
  const viajes = leerViajes(undefined, [gasto("a"), gasto("b")], presupuesto);
  assert.equal(viajes.lista.length, 1);
  assert.deepEqual(viajeActivo(viajes).gastos.map((g) => g.id), ["a", "b"]);
  assert.deepEqual(viajeActivo(viajes).presupuesto, presupuesto);
});

test("si ya hay viajes, lo suelto de antes no se mezcla", () => {
  const guardado = { activo: "j", lista: [{ id: "j", nombre: "Japón", gastos: [gasto("x")], presupuesto: null }] };
  const viajes = leerViajes(guardado, [gasto("a")], presupuesto);
  assert.deepEqual(ids(viajes), ["j"]);
  assert.deepEqual(viajeActivo(viajes).gastos.map((g) => g.id), ["x"]);
});

test("lo guardado se limpia: sin id, repetidos, gastos malos y nombres largos", () => {
  const viajes = leerViajes({
    activo: "nadie",
    lista: [
      null, { nombre: "sin id" },
      { id: "a", nombre: `  ${"x".repeat(40)}  `, gastos: [gasto("1"), { id: "malo" }], presupuesto: { importe: -1 } },
      { id: "a", nombre: "repetido" },
      { id: "b", nombre: "Lisboa", gastos: "hola" },
    ],
  });
  assert.deepEqual(ids(viajes), ["a", "b"]);
  assert.equal(viajes.activo, "a", "si el activo no existe, el primero");
  assert.equal(viajes.lista[0].nombre.length, NOMBRE_VIAJE_MAX);
  assert.deepEqual(viajes.lista[0].gastos.map((g) => g.id), ["1"]);
  assert.equal(viajes.lista[0].presupuesto, null);
  assert.deepEqual(viajes.lista[1].gastos, []);
});

test("crear uno lo añade al final y te lleva a él", () => {
  const viajes = crearViaje(leerViajes(undefined), "j", "  Japón  2026 ");
  assert.deepEqual(ids(viajes), ["primero", "j"]);
  assert.equal(viajes.activo, "j");
  assert.equal(viajeActivo(viajes).nombre, "Japón 2026");
  assert.deepEqual(viajeActivo(viajes).gastos, []);
});

test("sin nombre, con id repetido o pasado el máximo no se crea", () => {
  const uno = leerViajes(undefined);
  assert.equal(crearViaje(uno, "j", "   "), uno);
  assert.equal(crearViaje(uno, "primero", "Otro"), uno);
  let lleno = uno;
  for (let i = 1; i < VIAJES_MAX; i++) lleno = crearViaje(lleno, `v${i}`, `Viaje ${i}`);
  assert.equal(lleno.lista.length, VIAJES_MAX);
  assert.equal(crearViaje(lleno, "mas", "Uno más"), lleno);
});

test("renombrar cambia solo ese, y en blanco no", () => {
  const viajes = crearViaje(leerViajes(undefined), "j", "Japón");
  const nuevo = renombrarViaje(viajes, "primero", "Lisboa");
  assert.deepEqual(nuevo.lista.map((v) => v.nombre), ["Lisboa", "Japón"]);
  assert.equal(renombrarViaje(viajes, "j", "  "), viajes);
});

test("elegir uno que no existe no cambia nada", () => {
  const viajes = crearViaje(leerViajes(undefined), "j", "Japón");
  assert.equal(elegirViaje(viajes, "primero").activo, "primero");
  assert.equal(elegirViaje(viajes, "nadie"), viajes);
});

test("al borrar el abierto pasas al de al lado, y el último no se borra", () => {
  let viajes = leerViajes(undefined);
  viajes = crearViaje(viajes, "b", "B");
  viajes = crearViaje(viajes, "c", "C");
  viajes = elegirViaje(viajes, "b");
  const sinB = borrarViaje(viajes, "b");
  assert.deepEqual(ids(sinB), ["primero", "c"]);
  assert.equal(sinB.activo, "c");
  const sinC = borrarViaje(elegirViaje(viajes, "c"), "c");
  assert.equal(sinC.activo, "b", "si era el último de la lista, el de antes");
  assert.equal(borrarViaje(viajes, "primero").activo, "b", "borrar otro no te mueve");
  const uno = leerViajes(undefined);
  assert.equal(borrarViaje(uno, "primero"), uno);
});

test("cambiar los gastos de uno no toca los otros", () => {
  const viajes = crearViaje(leerViajes(undefined, [gasto("a")]), "j", "Japón");
  const nuevo = cambiarViaje(viajes, "j", { gastos: [gasto("z")], presupuesto });
  assert.deepEqual(nuevo.lista[0].gastos.map((g) => g.id), ["a"]);
  assert.deepEqual(nuevo.lista[1].gastos.map((g) => g.id), ["z"]);
  assert.deepEqual(nuevo.lista[1].presupuesto, presupuesto);
});

test("el resumen cuenta los gastos y suma la divisa principal", () => {
  const viaje = { id: "a", nombre: "", gastos: [gasto("1", 10), gasto("2", 5.5), gasto("3", 3, "USD")], presupuesto: null };
  assert.deepEqual(resumenViaje(viaje), { n: 3, total: { to: "EUR", total: 15.5 } });
  assert.deepEqual(resumenViaje({ ...viaje, gastos: [] }), { n: 0, total: null });
});

test("el CSV se llama como el viaje, sin tildes ni espacios", () => {
  ponerIdioma("es");
  assert.equal(archivoGastos("Japón 2026"), "gastos-japon-2026");
  assert.equal(archivoGastos("  Nueva York / NYC! "), "gastos-nueva-york-nyc");
  assert.equal(archivoGastos(""), "gastos-viaje", "sin nombre, el de siempre");
  assert.equal(archivoGastos("¡¡!!"), "gastos-viaje");
  ponerIdioma("en");
  assert.equal(archivoGastos("Lisboa"), "expenses-lisboa");
  assert.equal(archivoGastos(""), "trip-expenses");
  ponerIdioma("es");
});
