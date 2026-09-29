const { test } = require("node:test");
const assert = require("node:assert");
const {
  CURRENCIES, EXTRAS_MAX, EXTRAS_POR_DEFECTO, leerExtras, anadirExtra, quitarExtra,
  extrasVisibles, disponiblesParaAnadir, convertirExtras,
} = require("../logica.js");

test("sin nada guardado salen las de por defecto", () => {
  // Quien viene de una versión anterior no tiene la clave.
  assert.deepEqual(leerExtras(undefined), EXTRAS_POR_DEFECTO);
  assert.deepEqual(leerExtras(null), EXTRAS_POR_DEFECTO);
  assert.deepEqual(leerExtras("GBP"), EXTRAS_POR_DEFECTO);
});

test("una lista vacía guardada se respeta", () => {
  assert.deepEqual(leerExtras([]), []);
});

test("leerExtras tira lo raro, lo repetido y lo que sobra", () => {
  assert.deepEqual(leerExtras(["GBP", "XXX", "GBP", null, "JPY"]), ["GBP", "JPY"]);
  const muchas = ["USD", "GBP", "JPY", "CHF", "CAD", "AUD", "MXN"];
  assert.equal(leerExtras(muchas).length, EXTRAS_MAX);
});

test("las de por defecto no se modifican al leerlas", () => {
  const lista = leerExtras(undefined);
  lista.push("MXN");
  assert.deepEqual(leerExtras(undefined), EXTRAS_POR_DEFECTO);
});

test("añadir va al final y no repite", () => {
  assert.deepEqual(anadirExtra(["GBP"], "JPY"), ["GBP", "JPY"]);
  assert.deepEqual(anadirExtra(["GBP"], "GBP"), ["GBP"]);
  assert.deepEqual(anadirExtra(["GBP"], "XXX"), ["GBP"]);
});

test("añadir no pasa del máximo", () => {
  const llena = ["USD", "GBP", "JPY", "CHF", "CAD"];
  assert.equal(llena.length, EXTRAS_MAX);
  assert.deepEqual(anadirExtra(llena, "MXN"), llena);
});

test("quitar la saca y deja el resto en su orden", () => {
  assert.deepEqual(quitarExtra(["GBP", "JPY", "CHF"], "JPY"), ["GBP", "CHF"]);
  assert.deepEqual(quitarExtra(["GBP"], "USD"), ["GBP"]);
});

test("no enseña las del par que tienes puesto", () => {
  assert.deepEqual(extrasVisibles(["USD", "GBP", "EUR", "JPY"], "EUR", "USD"), ["GBP", "JPY"]);
});

test("para añadir quedan las que no están ni son del par", () => {
  const quedan = disponiblesParaAnadir(["GBP", "JPY"], "EUR", "USD");
  assert.equal(quedan.length, CURRENCIES.length - 4);
  for (const c of ["GBP", "JPY", "EUR", "USD"]) assert.ok(!quedan.includes(c), c);
  assert.equal(quedan[0], "CHF", "en el orden del array de divisas");
});

test("convierte con las tasas de la base", () => {
  const tasas = { GBP: 0.85, JPY: 160 };
  assert.deepEqual(convertirExtras(10, tasas, ["GBP", "JPY"]), [
    { code: "GBP", valor: 8.5 },
    { code: "JPY", valor: 1600 },
  ]);
});

test("sin tasa o sin cantidad, el valor es null", () => {
  assert.deepEqual(convertirExtras(10, { GBP: 0.85 }, ["CHF"]), [{ code: "CHF", valor: null }]);
  assert.deepEqual(convertirExtras(null, { GBP: 0.85 }, ["GBP"]), [{ code: "GBP", valor: null }]);
  assert.deepEqual(convertirExtras(10, null, ["GBP"]), [{ code: "GBP", valor: null }]);
});

test("cero se convierte en cero, no en null", () => {
  assert.deepEqual(convertirExtras(0, { GBP: 0.85 }, ["GBP"]), [{ code: "GBP", valor: 0 }]);
});
