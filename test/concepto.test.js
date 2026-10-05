const { test } = require("node:test");
const assert = require("node:assert");
const { conceptosUsados, completarConcepto } = require("../logica.js");

const gasto = (concepto, cuando, categoria = "comida") => ({ concepto, cuando, categoria });

test("el más repetido va primero, y si empatan el último", () => {
  const usados = conceptosUsados([
    gasto("Cena", 1), gasto("Café", 2), gasto("café ", 3), gasto("Camiseta", 4, "compras"), gasto("", 5),
  ]);
  assert.deepEqual(usados.map((u) => u.concepto), ["café", "Camiseta", "Cena"]);
});

test("se queda con la categoría del último", () => {
  const usados = conceptosUsados([gasto("Mercado", 1, "compras"), gasto("Mercado", 2, "comida")]);
  assert.deepEqual(usados, [{ concepto: "Mercado", categoria: "comida" }]);
});

test("una categoría rara pasa a otros", () => {
  assert.equal(conceptosUsados([gasto("Cosa", 1, "inventada")])[0].categoria, "otros");
});

test("completa sin mirar mayúsculas ni tildes", () => {
  const usados = conceptosUsados([gasto("Café", 1), gasto("Taxi aeropuerto", 2, "transporte")]);
  assert.deepEqual(completarConcepto("ca", usados), { concepto: "Café", categoria: "comida", resto: "fé" });
  assert.deepEqual(completarConcepto("CAF", usados), { concepto: "Café", categoria: "comida", resto: "é" });
  assert.equal(completarConcepto("taxi a", usados).resto, "eropuerto");
});

test("con una letra, sin parecido o ya completo, nada", () => {
  const usados = conceptosUsados([gasto("Café", 1)]);
  assert.equal(completarConcepto("c", usados), null);
  assert.equal(completarConcepto("  ", usados), null);
  assert.equal(completarConcepto("ce", usados), null);
  assert.equal(completarConcepto("café", usados), null);
  assert.equal(completarConcepto("ca", []), null);
});
