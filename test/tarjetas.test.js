const { test } = require("node:test");
const assert = require("node:assert");
const {
  TARJETAS_MAX, anadirTarjeta, leerTarjetas, quitarTarjeta, tarjetaActual, siguientePago, mejorTarjeta,
  limpiarCopia, limpiarSync, CLAVES_COPIA,
} = require("../logica.js");

const revolut = { nombre: "Revolut", comision: 0 };
const n26 = { nombre: "N26", comision: 1.7 };
const bbva = { nombre: "BBVA", comision: 3 };
const dos = [revolut, bbva];
const tres = [revolut, n26, bbva];

test("añadir, con el nombre limpio y el porcentaje redondeado", () => {
  assert.deepEqual(anadirTarjeta([], "  Mi   Visa ", 1.2345), [{ nombre: "Mi Visa", comision: 1.23 }]);
  assert.equal(anadirTarjeta([], "Una tarjeta con un nombre larguísimo", 1)[0].nombre.length, 14);
});

test("no entra sin nombre, sin porcentaje bueno ni repetida", () => {
  assert.equal(anadirTarjeta([], "  ", 1), null);
  assert.equal(anadirTarjeta([], "Visa", "2"), null);
  assert.equal(anadirTarjeta([], "Visa", -1), null);
  assert.equal(anadirTarjeta([], "Visa", 99), null);
  assert.equal(anadirTarjeta([], "Visa", NaN), null);
  assert.equal(anadirTarjeta(dos, "revolut", 2), null, "el mismo nombre");
  assert.equal(anadirTarjeta(dos, "Otra", 3), null, "el mismo porcentaje");
});

test("hasta cuatro", () => {
  let lista = [];
  for (let i = 0; i < TARJETAS_MAX; i += 1) lista = anadirTarjeta(lista, `T${i}`, i);
  assert.equal(lista.length, TARJETAS_MAX);
  assert.equal(anadirTarjeta(lista, "Otra", 9), null);
});

test("leer lo guardado, sin fiarse", () => {
  assert.deepEqual(leerTarjetas(undefined), []);
  assert.deepEqual(leerTarjetas("nada"), []);
  assert.deepEqual(leerTarjetas([revolut, null, { nombre: "" , comision: 1 }, { nombre: "X" }, bbva, { nombre: "BBVA", comision: 2 }]), dos);
});

test("quitar", () => {
  assert.deepEqual(quitarTarjeta(dos, "Revolut"), [bbva]);
  assert.deepEqual(quitarTarjeta(dos, "Otra"), dos);
});

test("la elegida es la que tiene la comisión puesta", () => {
  assert.equal(tarjetaActual(dos, 3), bbva);
  assert.equal(tarjetaActual(dos, 0), revolut);
  assert.equal(tarjetaActual(dos, 2), null, "puesta a mano");
});

test("sin tarjetas o con una, tarjeta y efectivo como siempre", () => {
  for (const lista of [[], [bbva]]) {
    assert.deepEqual(siguientePago({ pago: "tarjeta", comision: 2 }, lista), { pago: "efectivo", comision: 2 });
    assert.deepEqual(siguientePago({ pago: "efectivo", comision: 2 }, lista), { pago: "tarjeta", comision: 2 });
  }
});

test("con varias da la vuelta entera y acaba en efectivo", () => {
  let estado = { pago: "tarjeta", comision: 0 };
  const vistos = [];
  for (let i = 0; i < 4; i += 1) {
    estado = siguientePago(estado, tres);
    vistos.push(`${estado.pago}:${estado.comision}`);
  }
  assert.deepEqual(vistos, ["tarjeta:1.7", "tarjeta:3", "efectivo:3", "tarjeta:0"]);
});

test("con la comisión a mano empieza por la primera", () => {
  assert.deepEqual(siguientePago({ pago: "tarjeta", comision: 2 }, dos), { pago: "tarjeta", comision: 0 });
});

test("cuál sale mejor y cuánto te ahorras", () => {
  const r = mejorTarjeta(dos, 3, 100);
  assert.equal(r.tarjeta, revolut);
  assert.equal(r.ahorro, 3);
  assert.equal(mejorTarjeta(tres, 3, 100).tarjeta, revolut);
  assert.equal(mejorTarjeta(tres, 1.7, 100).ahorro, 1.7);
});

test("no dice nada si ya llevas la mejor, sin base o por menos de un céntimo", () => {
  assert.equal(mejorTarjeta(dos, 0, 100), null);
  assert.equal(mejorTarjeta(dos, 3, 0), null);
  assert.equal(mejorTarjeta(dos, 3, null), null);
  assert.equal(mejorTarjeta(dos, 3, 0.1), null);
  assert.equal(mejorTarjeta([bbva], 5, 100), null, "con una no hay qué comparar");
});

test("van en la copia y en la sincronización, ya limpias", () => {
  const sucio = [revolut, { nombre: "", comision: 1 }, bbva];
  assert.deepEqual(limpiarCopia({ tarjetasBanco: sucio }).tarjetasBanco, dos);
  assert.deepEqual(limpiarSync({ tarjetasBanco: sucio }), { tarjetasBanco: dos });
  assert.ok(CLAVES_COPIA.includes("tarjetasBanco"));
  assert.equal("tarjetasBanco" in limpiarCopia({}), false, "quien no las tiene no estrena una lista vacía");
});
