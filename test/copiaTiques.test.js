const { test } = require("node:test");
const assert = require("node:assert");
const { crearCopia, leerCopia, tiquesDeCopia, crearGasto, leerViajes } = require("../logica.js");

const gasto = (id) => crearGasto({ id, from: "JPY", to: "EUR", cantidad: 1600, valor: 10, concepto: "Taxi", cuando: 1, categoria: "transporte" });
const guardado = { viajes: { activo: "a", lista: [{ id: "a", nombre: "Japón", gastos: [gasto("g1")], empresa: [gasto("e1")], cajero: [], personas: 1, color: "oro" }] } };
const FOTO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ==";

test("la copia lleva los tiques de sus gastos, también los de empresa", () => {
  const copia = crearCopia(guardado, new Date(), { g1: FOTO, e1: FOTO, perdido: FOTO });
  assert.deepEqual(Object.keys(copia.tiques).sort(), ["e1", "g1"]);
});

test("sin fotos, la copia es la de siempre", () => {
  assert.equal("tiques" in crearCopia(guardado), false);
  assert.equal("tiques" in crearCopia(guardado, new Date(), {}), false);
});

test("al leerla, vuelven", () => {
  const texto = JSON.stringify(crearCopia(guardado, new Date(), { g1: FOTO }));
  assert.deepEqual(leerCopia(texto).tiques, { g1: FOTO });
  // Una copia de antes, sin tiques.
  assert.equal("tiques" in leerCopia(JSON.stringify(crearCopia(guardado))), false);
});

test("lo que no es una imagen no entra", () => {
  const viajes = leerViajes(guardado.viajes);
  const raros = { g1: "javascript:alert(1)", e1: "data:text/html;base64,PGI+", x: 5 };
  assert.deepEqual(tiquesDeCopia(raros, viajes), {});
  assert.deepEqual(tiquesDeCopia({ g1: "data:image/png;base64,iVBORw0KGgo=" }, viajes), { g1: "data:image/png;base64,iVBORw0KGgo=" });
  assert.deepEqual(tiquesDeCopia(null, viajes), {});
  assert.deepEqual(tiquesDeCopia([FOTO], viajes), {});
});
