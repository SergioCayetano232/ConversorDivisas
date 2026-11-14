const { test } = require("node:test");
const assert = require("node:assert");
const { esPanel, cambioDeFuera, leerViajes, crearViaje, FUNCIONES } = require("../logica.js");

test("sabe si va en el panel por la URL", () => {
  assert.equal(esPanel("?panel"), true);
  assert.equal(esPanel("?panel=1"), true);
  assert.equal(esPanel("?viaje=abc&panel"), true);
  assert.equal(esPanel(""), false, "el popup de siempre");
  assert.equal(esPanel("?panelito=1"), false);
  assert.equal(esPanel(undefined), false);
});

test("lo que guardé yo no cuenta como cambio", () => {
  const viajes = leerViajes(undefined);
  assert.equal(cambioDeFuera(structuredClone(viajes), viajes), false);
});

test("un gasto apuntado desde la barra sí", () => {
  const viajes = leerViajes(undefined);
  const otro = structuredClone(viajes);
  otro.lista[0].gastos.push({ id: "taxi", concepto: "Taxi" });
  assert.equal(cambioDeFuera(otro, viajes), true);
});

test("y también un viaje nuevo o que hayan borrado la clave", () => {
  const viajes = leerViajes(undefined);
  assert.equal(cambioDeFuera(crearViaje(viajes, "japon", "Japón"), viajes), true);
  assert.equal(cambioDeFuera(undefined, viajes), true);
});

test("el panel se puede abrir desde el buscador de funciones", () => {
  assert.ok(FUNCIONES.some((f) => f.accion === "panel"));
});
