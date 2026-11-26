const { test } = require("node:test");
const assert = require("node:assert");
const { descifrado, SIGNOS_DESCIFRAR } = require("../luz.js");

const siempre = (n) => () => n;

test("al final queda el texto tal cual", () => {
  assert.equal(descifrado("Lo que tienes ahora", 1), "Lo que tienes ahora");
});

test("al principio no se lee nada, pero los espacios siguen en su sitio", () => {
  const revuelto = descifrado("Hola mundo", 0, siempre(0));
  assert.equal(revuelto, "Aaaa aaaaa");
});

test("se coloca de izquierda a derecha", () => {
  const medio = descifrado("ABCDEFGHIJ", 0.65, siempre(0.999));
  const ultimo = SIGNOS_DESCIFRAR.at(-1);
  assert.equal(medio, `ABCDEF${ultimo.repeat(4)}`);
});

test("las letras con tilde y los emoji cuentan como una", () => {
  assert.equal([...descifrado("Año 🇯🇵", 0, siempre(0))].length, [..."Año 🇯🇵"].length);
});

test("respeta las mayúsculas y las minúsculas", () => {
  assert.equal(descifrado("Ab", 0, siempre(0)), "Aa");
});
