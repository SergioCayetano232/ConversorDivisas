const { test } = require("node:test");
const assert = require("node:assert");
const { CATEGORIAS, adivinarCategoria, desglose } = require("../logica.js");

test("adivina por el concepto, con tildes o sin ellas", () => {
  assert.equal(adivinarCategoria("Cena en el puerto"), "comida");
  assert.equal(adivinarCategoria("café"), "comida");
  assert.equal(adivinarCategoria("Taxi al aeropuerto"), "transporte");
  assert.equal(adivinarCategoria("Hotel Ritz"), "alojamiento");
  assert.equal(adivinarCategoria("Entradas museo"), "ocio");
  assert.equal(adivinarCategoria("Regalo para mamá"), "compras");
  assert.equal(adivinarCategoria("dinner"), "comida");
  assert.equal(adivinarCategoria("train to Paris"), "transporte");
});

test("las palabras cortas no se cuelan dentro de otras", () => {
  assert.equal(adivinarCategoria("barco a la isla"), "transporte", "barco no es bar");
  assert.equal(adivinarCategoria("algo barato"), null, "barato tampoco");
  assert.equal(adivinarCategoria("bar de tapas"), "comida");
  assert.equal(adivinarCategoria("superhéroe"), null);
});

test("sin pistas no se inventa nada", () => {
  assert.equal(adivinarCategoria(""), null);
  assert.equal(adivinarCategoria(undefined), null);
  assert.equal(adivinarCategoria("cosas"), null);
});

test("lo que adivina es siempre una categoría que existe", () => {
  for (const c of ["cena", "taxi", "hotel", "museo", "tienda"]) assert.ok(CATEGORIAS.includes(adivinarCategoria(c)));
});

const g = (valor, categoria, to = "EUR") => ({ id: `${valor}${categoria}`, from: "USD", to, cantidad: valor, valor, concepto: "", cuando: 0, categoria });

test("el desglose va de lo que más a lo que menos, con su parte", () => {
  const d = desglose([g(30, "comida"), g(60, "alojamiento"), g(10, "comida")]);
  assert.deepEqual(d.map((x) => x.categoria), ["alojamiento", "comida"]);
  assert.equal(d[0].total, 60);
  assert.equal(d[1].total, 40);
  assert.equal(d[0].fraccion, 0.6);
  assert.equal(d[0].to, "EUR");
});

test("solo cuenta la divisa que más suma", () => {
  const d = desglose([g(100, "comida"), g(5, "ocio", "USD")]);
  assert.deepEqual(d.map((x) => x.categoria), ["comida"]);
});

test("sin gastos no hay desglose", () => {
  assert.deepEqual(desglose([]), []);
});
