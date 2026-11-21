const { test } = require("node:test");
const assert = require("node:assert");
const { tuDivisa, leerDivisaCasa, tocaBienvenida, parDeBienvenida, atajosDeBienvenida, limpiarCopia, limpiarSync } = require("../logica.js");

test("solo sale al instalar", () => {
  assert.equal(tocaBienvenida("install"), true);
  assert.equal(tocaBienvenida("update"), false);
  assert.equal(tocaBienvenida("chrome_update"), false);
  assert.equal(tocaBienvenida(undefined), false);
});

test("la divisa que eliges manda sobre los gastos y el idioma", () => {
  const viajes = [{ gastos: [{ to: "EUR" }, { to: "EUR" }] }];
  assert.equal(tuDivisa({ viajes, idiomas: ["es-ES"], elegida: "GBP" }), "GBP");
  assert.equal(tuDivisa({ idiomas: ["es-MX"], elegida: "EUR" }), "EUR");
});

test("sin elegir nada, o con algo que no es una divisa, como antes", () => {
  assert.equal(tuDivisa({ idiomas: ["es-MX"] }), "MXN");
  assert.equal(tuDivisa({ idiomas: ["es-MX"], elegida: "XXX" }), "MXN");
  assert.equal(tuDivisa({ idiomas: ["es-MX"], elegida: null }), "MXN");
  assert.equal(leerDivisaCasa("GBP"), "GBP");
  assert.equal(leerDivisaCasa("euros"), null);
  assert.equal(leerDivisaCasa(undefined), null);
});

test("si tu divisa ya está en el par, no lo toco", () => {
  assert.equal(parDeBienvenida("EUR", { from: "EUR", to: "USD" }), null);
  assert.equal(parDeBienvenida("USD", { from: "EUR", to: "USD" }), null);
  assert.equal(parDeBienvenida("MXN", { from: "MXN", to: "USD" }), null);
});

test("si no está, va abajo y arriba la que más se cruza con ella", () => {
  assert.deepEqual(parDeBienvenida("GBP", { from: "EUR", to: "USD" }), { from: "EUR", to: "GBP" });
  assert.deepEqual(parDeBienvenida("MXN", { from: "EUR", to: "USD" }), { from: "USD", to: "MXN" });
  assert.deepEqual(parDeBienvenida("USD", { from: "MXN", to: "EUR" }), { from: "EUR", to: "USD" });
  assert.deepEqual(parDeBienvenida("EUR", { from: "MXN", to: "USD" }), { from: "USD", to: "EUR" });
  assert.equal(parDeBienvenida("nada", { from: "EUR", to: "USD" }), null);
});

test("las teclas son las que Chrome ha puesto de verdad", () => {
  const comandos = [{ name: "_execute_action", shortcut: "⇧⌘U" }, { name: "convertir-seleccion", shortcut: "" }];
  assert.deepEqual(atajosDeBienvenida(comandos), { abrir: "⇧⌘U", seleccion: "" });
  assert.deepEqual(atajosDeBienvenida(undefined), { abrir: "", seleccion: "" });
});

test("tu divisa va en la copia y a tus otros ordenadores", () => {
  assert.equal(limpiarCopia({ divisaCasa: "GBP" }).divisaCasa, "GBP");
  assert.equal("divisaCasa" in limpiarCopia({ divisaCasa: "libras" }), false);
  assert.equal("divisaCasa" in limpiarCopia({}), false);
  assert.deepEqual(limpiarSync({ divisaCasa: "JPY" }), { divisaCasa: "JPY" });
});
