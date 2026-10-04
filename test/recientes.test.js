const { test } = require("node:test");
const assert = require("node:assert");
const {
  RECIENTES_MAX, FIJOS_MAX, apuntarReciente, fijarReciente, leerRecientes, recientesVisibles,
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

const fijos = (lista) => lista.filter((p) => p.fijo).map((p) => `${p.from}${p.to}`);

test("fijar un par lo pone delante y quitarlo lo devuelve al resto", () => {
  let lista = [{ from: "EUR", to: "USD" }, { from: "EUR", to: "GBP" }, { from: "EUR", to: "JPY" }];
  lista = fijarReciente(lista, "EUR", "JPY");
  assert.deepEqual(pares(lista), ["EURJPY", "EURUSD", "EURGBP"]);
  assert.deepEqual(fijos(lista), ["EURJPY"]);
  lista = fijarReciente(lista, "EUR", "JPY");
  assert.deepEqual(fijos(lista), []);
  assert.deepEqual(pares(lista), ["EURJPY", "EURUSD", "EURGBP"], "suelto, va el primero del resto");
});

test("un par fijo no se va aunque cambies mucho", () => {
  let lista = fijarReciente([{ from: "EUR", to: "JPY" }], "EUR", "JPY");
  for (const to of ["USD", "GBP", "CHF", "CAD", "AUD", "MXN"]) lista = apuntarReciente(lista, "EUR", to);
  assert.equal(lista.length, RECIENTES_MAX);
  assert.deepEqual(pares(lista), ["EURJPY", "EURMXN", "EURAUD", "EURCAD"]);
});

test("volver a un par fijo no lo mueve ni lo suelta", () => {
  const lista = fijarReciente([{ from: "EUR", to: "USD" }, { from: "EUR", to: "JPY" }], "EUR", "JPY");
  assert.equal(apuntarReciente(lista, "EUR", "JPY"), lista);
});

test("los fijos van en el orden en que los fijaste", () => {
  let lista = [{ from: "EUR", to: "USD" }, { from: "EUR", to: "GBP" }, { from: "EUR", to: "JPY" }];
  lista = fijarReciente(lista, "EUR", "GBP");
  lista = fijarReciente(lista, "EUR", "USD");
  assert.deepEqual(fijos(lista), ["EURGBP", "EURUSD"]);
});

test("como mucho tres fijos, para que quepa uno nuevo", () => {
  let lista = ["USD", "GBP", "JPY", "CHF"].map((to) => ({ from: "EUR", to }));
  for (const to of ["USD", "GBP", "JPY", "CHF"]) lista = fijarReciente(lista, "EUR", to);
  assert.equal(FIJOS_MAX, 3);
  assert.deepEqual(fijos(lista), ["EURUSD", "EURGBP", "EURJPY"]);
  lista = apuntarReciente(lista, "EUR", "MXN");
  assert.deepEqual(pares(lista), ["EURUSD", "EURGBP", "EURJPY", "EURMXN"]);
});

test("fijar un par que no está no hace nada", () => {
  const lista = [{ from: "EUR", to: "USD" }];
  assert.equal(fijarReciente(lista, "EUR", "GBP"), lista);
});

test("leerRecientes se queda con los fijos y no deja pasar de tres", () => {
  const guardado = ["USD", "GBP", "JPY", "CHF"].map((to) => ({ from: "EUR", to, fijo: true }));
  guardado.push({ from: "EUR", to: "MXN", fijo: "sí" });
  const leidos = leerRecientes(guardado);
  assert.deepEqual(fijos(leidos), ["EURUSD", "EURGBP", "EURJPY"]);
  assert.deepEqual(leerRecientes([{ from: "EUR", to: "USD", fijo: "sí" }]), [{ from: "EUR", to: "USD" }]);
});
