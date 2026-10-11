const { test } = require("node:test");
const assert = require("node:assert");
const { gastoRaro, mediana } = require("../logica.js");

const g = (valor, categoria = "comida", to = "EUR") => ({ valor, categoria, to });
const cafes = [g(3), g(4), g(3.5), g(5)];

test("la mediana, con pares e impares", () => {
  assert.equal(mediana([3, 1, 2]), 2);
  assert.equal(mediana([4, 1, 3, 2]), 2.5);
});

test("un cero de más en la comida salta", () => {
  const r = gastoRaro(cafes, g(40));
  assert.equal(r.veces, 11);
  assert.equal(r.normal, 3.75);
  assert.equal(r.categoria, "comida");
});

test("cuatro veces lo normal todavía no es raro", () => {
  assert.equal(gastoRaro(cafes, g(15)), null);
  assert.ok(gastoRaro(cafes, g(18.75)));
});

test("con menos de tres de su categoría y pocos en el viaje no digo nada", () => {
  assert.equal(gastoRaro([g(3), g(4)], g(400)), null);
});

test("si hay pocos de su categoría, compara con todo el viaje", () => {
  const r = gastoRaro([...cafes, g(2, "transporte")], g(60, "ocio"));
  assert.equal(r.veces, 17);
  assert.equal(r.categoria, null);
});

test("el primer hotel no es raro aunque todo lo demás sean cafés", () => {
  assert.equal(gastoRaro([...cafes, g(4), g(3)], g(120, "alojamiento")), null);
});

test("un hotel caro al lado de otros hoteles sí", () => {
  const hoteles = [g(90, "alojamiento"), g(100, "alojamiento"), g(110, "alojamiento")];
  assert.equal(gastoRaro([...cafes, ...hoteles], g(1000, "alojamiento")).veces, 10);
});

test("solo cuenta los de la misma divisa", () => {
  const dolares = [g(3, "comida", "USD"), g(4, "comida", "USD"), g(3, "comida", "USD")];
  assert.equal(gastoRaro(dolares, g(40)), null);
});

test("sin gasto, o con todo a cero, nada", () => {
  assert.equal(gastoRaro(cafes, null), null);
  assert.equal(gastoRaro([g(0), g(0), g(0)], g(5)), null);
});
