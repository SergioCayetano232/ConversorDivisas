const { test } = require("node:test");
const assert = require("node:assert");
const { FUNCIONES, FUNCIONES_MAX, buscarFunciones, ATAJOS, atajoPara } = require("../logica.js");

const lista = [
  { accion: "gastos", nombre: "Abrir los gastos del viaje", claves: "cartera expenses" },
  { accion: "presupuesto", nombre: "Poner el presupuesto", claves: "limite budget" },
  { accion: "vista:timo", nombre: "Ver si te cambian bien", claves: "casa de cambio comision" },
  { accion: "comision", nombre: "La comisión del banco", claves: "iva tax free" },
  { accion: "vista:suscripciones", nombre: "Ver las suscripciones", claves: "netflix spotify" },
];
const acciones = (consulta) => buscarFunciones(consulta, lista).map((f) => f.accion);

test("sin escribir nada, las primeras en su orden", () => {
  assert.deepEqual(acciones(""), lista.map((f) => f.accion));
  assert.equal(buscarFunciones("", FUNCIONES.map((f) => ({ ...f, nombre: f.accion }))).length, FUNCIONES_MAX);
});

test("por el principio de cualquier palabra, sin tildes ni mayúsculas", () => {
  assert.deepEqual(acciones("presu"), ["presupuesto"]);
  assert.deepEqual(acciones("COMISION"), ["comision", "vista:timo"], "en el nombre pesa más que en las claves");
  assert.deepEqual(acciones("upuesto"), [], "por el medio no, que sería ruido");
});

test("las claves encuentran lo que no dice el nombre", () => {
  assert.deepEqual(acciones("netflix"), ["vista:suscripciones"]);
  assert.deepEqual(acciones("budget"), ["presupuesto"]);
});

test("todas las palabras tienen que estar", () => {
  assert.deepEqual(acciones("tax free"), ["comision"]);
  assert.deepEqual(acciones("tax netflix"), []);
});

test("lo que empieza por la palabra va primero", () => {
  const [primera] = buscarFunciones("ver", lista);
  assert.equal(primera.accion, "vista:timo", "a igualdad, el orden de la lista");
  assert.deepEqual(acciones("gastos"), ["gastos"]);
});

test("cada función del catálogo es única y tiene sus claves", () => {
  const vistas = new Set();
  for (const f of FUNCIONES) {
    assert.ok(!vistas.has(f.accion), `${f.accion} repetida`);
    vistas.add(f.accion);
    assert.ok(f.claves.length > 0);
  }
});

test("las de los atajos están todas en el buscador", () => {
  const enBuscador = new Set(FUNCIONES.map((f) => f.accion));
  for (const accion of Object.values(ATAJOS)) assert.ok(enBuscador.has(accion), `${accion} no está`);
});

test("Ctrl+K o Cmd+K lo abren, también desde un campo", () => {
  const tecla = (extra) => ({ code: "KeyK", key: "k", altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, enCampo: false, ...extra });
  assert.equal(atajoPara(tecla({ ctrlKey: true })), "funciones");
  assert.equal(atajoPara(tecla({ metaKey: true, enCampo: true })), "funciones");
  assert.equal(atajoPara(tecla({ ctrlKey: true, shiftKey: true })), null);
  assert.equal(atajoPara(tecla({})), "chuleta", "la K sola sigue siendo la chuleta");
});
