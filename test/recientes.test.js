const { test } = require("node:test");
const assert = require("node:assert");
const {
  RECIENTES_MAX, apuntarReciente, leerRecientes, recientesVisibles,
} = require("../logica.js");

const pares = (lista) => lista.map((p) => `${p.from}${p.to}`);

test("el último par va delante", () => {
  let lista = [];
  lista = apuntarReciente(lista, "EUR", "USD");
  lista = apuntarReciente(lista, "EUR", "GBP");
  assert.deepEqual(pares(lista), ["EURGBP", "EURUSD"]);
});

test("repetir un par lo sube, no lo duplica", () => {
  let lista = [{ from: "EUR", to: "USD" }, { from: "EUR", to: "GBP" }];
  lista = apuntarReciente(lista, "EUR", "GBP");
  assert.deepEqual(pares(lista), ["EURGBP", "EURUSD"]);
});

test("el par dado la vuelta cuenta como otro", () => {
  const lista = apuntarReciente([{ from: "EUR", to: "USD" }], "USD", "EUR");
  assert.deepEqual(pares(lista), ["USDEUR", "EURUSD"]);
});

test("la misma divisa en los dos lados no se apunta", () => {
  const lista = [{ from: "EUR", to: "USD" }];
  assert.deepEqual(apuntarReciente(lista, "EUR", "EUR"), lista);
});

test("no pasa del máximo y tira el más viejo", () => {
  let lista = [];
  for (const to of ["USD", "GBP", "JPY", "CHF", "CAD", "AUD", "MXN"]) {
    lista = apuntarReciente(lista, "EUR", to);
  }
  assert.equal(lista.length, RECIENTES_MAX);
  assert.equal(pares(lista)[0], "EURMXN");
  assert.ok(!pares(lista).includes("EURUSD"), "el más viejo tiene que irse");
});

test("no toca la lista que le paso", () => {
  const lista = [{ from: "EUR", to: "USD" }];
  apuntarReciente(lista, "EUR", "GBP");
  assert.equal(lista.length, 1);
});

test("leerRecientes aguanta lo que no es una lista", () => {
  // Quien venga de una versión anterior no tiene la clave guardada.
  assert.deepEqual(leerRecientes(undefined), []);
  assert.deepEqual(leerRecientes(null), []);
  assert.deepEqual(leerRecientes("EURUSD"), []);
  assert.deepEqual(leerRecientes({ from: "EUR", to: "USD" }), []);
});

test("leerRecientes tira los pares rotos", () => {
  const guardado = [
    { from: "EUR", to: "USD" },
    { from: "EUR", to: "XXX" },
    { from: "GBP", to: "GBP" },
    null,
    { from: "JPY" },
    { from: "CHF", to: "EUR" },
  ];
  assert.deepEqual(pares(leerRecientes(guardado)), ["EURUSD", "CHFEUR"]);
});

test("las pastillas no enseñan el par que tienes puesto", () => {
  const lista = [
    { from: "EUR", to: "USD" },
    { from: "EUR", to: "GBP" },
    { from: "USD", to: "JPY" },
  ];
  assert.deepEqual(pares(recientesVisibles(lista, "EUR", "USD")), ["EURGBP", "USDJPY"]);
});

test("como mucho enseña una menos que el máximo", () => {
  const lista = ["USD", "GBP", "JPY", "CHF", "CAD"].map((to) => ({ from: "EUR", to }));
  assert.equal(recientesVisibles(lista, "EUR", "MXN").length, RECIENTES_MAX - 1);
});
