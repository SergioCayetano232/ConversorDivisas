const { test } = require("node:test");
const assert = require("node:assert");
const { leerCafe, enCafes, textoCafes, limpiarCopia, CLAVES_COPIA } = require("../logica.js");

const cafe = { precio: 1.5, divisa: "EUR" };

test("lee el café guardado y se queda en el céntimo", () => {
  assert.deepEqual(leerCafe({ precio: 1.499, divisa: "EUR" }), { precio: 1.5, divisa: "EUR" });
});

test("sin precio, a cero o sin divisa buena, no hay café", () => {
  assert.equal(leerCafe(undefined), null);
  assert.equal(leerCafe({ precio: 0, divisa: "EUR" }), null);
  assert.equal(leerCafe({ precio: 2, divisa: "XXX" }), null);
  assert.equal(leerCafe({ precio: "2", divisa: "EUR" }), null);
});

test("cuenta los cafés con el lado que va en su divisa", () => {
  assert.equal(enCafes(cafe, [{ valor: 50, divisa: "USD" }, { valor: 4.6, divisa: "EUR" }]), 3);
  assert.equal(enCafes(cafe, [{ valor: 45, divisa: "EUR" }, { valor: 7000, divisa: "JPY" }]), 30);
});

test("sin ningún lado en su divisa no sé cuántos son", () => {
  assert.equal(enCafes(cafe, [{ valor: 50, divisa: "USD" }, { valor: 7000, divisa: "JPY" }]), null);
  assert.equal(enCafes(null, [{ valor: 50, divisa: "EUR" }]), null);
});

test("menos de medio café no lo digo, y hasta tres cuartos es medio", () => {
  assert.equal(enCafes(cafe, [{ valor: 0.7, divisa: "EUR" }]), null);
  assert.equal(enCafes(cafe, [{ valor: 0.8, divisa: "EUR" }]), 0.5);
  assert.equal(enCafes(cafe, [{ valor: 1.2, divisa: "EUR" }]), 1);
});

test("el texto, en singular, plural y medio", () => {
  assert.equal(textoCafes(0.5), "≈ medio café");
  assert.equal(textoCafes(1), "≈ 1 café");
  assert.equal(textoCafes(1200), "≈ 1.200 cafés");
  assert.equal(textoCafes(null), "");
});

test("va en la copia de seguridad, y uno roto no pasa", () => {
  assert.ok(CLAVES_COPIA.includes("precioCafe"));
  assert.deepEqual(limpiarCopia({ precioCafe: cafe }).precioCafe, cafe);
  assert.equal(limpiarCopia({ precioCafe: { precio: -1 } }).precioCafe, undefined);
  assert.equal(limpiarCopia({}).precioCafe, undefined);
});
