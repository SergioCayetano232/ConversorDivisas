const { test } = require("node:test");
const assert = require("node:assert");
const { buscarGastos } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const gasto = (id, concepto, categoria) => ({ id, from: "JPY", to: "EUR", cantidad: 1000, valor: 6, concepto, cuando: 0, categoria });
const gastos = [
  gasto("1", "Taxi al hotel", "transporte"),
  gasto("2", "Café", "comida"),
  gasto("3", "Cena ramen", "comida"),
  gasto("4", "Taxi aeropuerto", "transporte"),
  gasto("5", "", "otros"),
];
const ids = (lista) => lista.map((g) => g.id);

test("busca en el concepto", () => {
  assert.deepEqual(ids(buscarGastos(gastos, "taxi")), ["1", "4"]);
});

test("da igual la tilde y las mayúsculas", () => {
  assert.deepEqual(ids(buscarGastos(gastos, "CAFE")), ["2"]);
  assert.deepEqual(ids(buscarGastos(gastos, "café")), ["2"]);
});

test("encuentra por la categoría aunque el concepto no la diga", () => {
  assert.deepEqual(ids(buscarGastos(gastos, "comida")), ["2", "3"]);
});

test("con varias palabras tienen que estar todas, en cualquier orden", () => {
  assert.deepEqual(ids(buscarGastos(gastos, "aeropuerto taxi")), ["4"]);
  assert.deepEqual(ids(buscarGastos(gastos, "taxi cena")), []);
  assert.deepEqual(ids(buscarGastos(gastos, "ramen comida")), ["3"]);
});

test("vale un trozo de palabra", () => {
  assert.deepEqual(ids(buscarGastos(gastos, "aero")), ["4"]);
});

test("sin nada escrito, todos tal cual", () => {
  assert.equal(buscarGastos(gastos, ""), gastos);
  assert.equal(buscarGastos(gastos, "   "), gastos);
  assert.equal(buscarGastos(gastos, undefined), gastos);
});

test("en inglés busca por el nombre inglés de la categoría", () => {
  ponerIdioma("en");
  try {
    assert.deepEqual(ids(buscarGastos(gastos, "food")), ["2", "3"]);
  } finally {
    ponerIdioma("es");
  }
});

const { trozosResaltados } = require("../logica.js");
const marcado = (trozos) => trozos.map((t) => (t.resaltado ? `[${t.texto}]` : t.texto)).join("");

test("marca lo que coincide, sin tildes ni mayúsculas", () => {
  assert.equal(marcado(trozosResaltados("Taxi al hotel", "taxi")), "[Taxi] al hotel");
  assert.equal(marcado(trozosResaltados("Café de la mañana", "cafe")), "[Café] de la mañana");
  assert.equal(marcado(trozosResaltados("Café de la mañana", "MANANA")), "Café de la [mañana]");
});

test("cada palabra en su sitio, y todas las veces que salga", () => {
  assert.equal(marcado(trozosResaltados("Taxi aeropuerto", "aero taxi")), "[Taxi] [aero]puerto");
  assert.equal(marcado(trozosResaltados("Cola y cola", "cola")), "[Cola] y [cola]");
});

test("si se pisan, un solo trozo marcado", () => {
  assert.equal(marcado(trozosResaltados("ramen", "ram amen")), "[ramen]");
});

test("sin búsqueda o sin coincidencia, el texto entero sin marcar", () => {
  assert.deepEqual(trozosResaltados("Cena", ""), [{ texto: "Cena", resaltado: false }]);
  assert.deepEqual(trozosResaltados("Cena", "comida"), [{ texto: "Cena", resaltado: false }]);
  assert.deepEqual(trozosResaltados("", "taxi"), []);
});
