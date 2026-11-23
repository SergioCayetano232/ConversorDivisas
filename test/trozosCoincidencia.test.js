const { test } = require("node:test");
const assert = require("node:assert");
const { trozosCoincidencia } = require("../logica.js");

const marcado = (trozos) => trozos.filter((t) => t.marca).map((t) => t.texto).join("");

test("marca lo que has escrito dentro del nombre", () => {
  assert.deepEqual(trozosCoincidencia("Yen japonés", "jap"), [
    { texto: "Yen ", marca: false },
    { texto: "jap", marca: true },
    { texto: "onés", marca: false },
  ]);
});

test("sin tildes ni mayúsculas, pero con el texto de verdad", () => {
  assert.equal(marcado(trozosCoincidencia("Dólar estadounidense", "DOLAR")), "Dólar");
  assert.equal(marcado(trozosCoincidencia("Yen japonés", "japones")), "japonés");
  // La ł no lleva tilde, es otra letra: el filtro tampoco la encuentra con "l".
  assert.equal(marcado(trozosCoincidencia("Złoty polaco", "zl")), "");
});

test("el código solo cuenta desde el principio, como el filtro", () => {
  assert.equal(marcado(trozosCoincidencia("USD", "us", true)), "US");
  assert.equal(marcado(trozosCoincidencia("AUD", "ud", true)), "");
});

test("sin nada escrito o sin coincidencia, el texto entero sin marcar", () => {
  assert.deepEqual(trozosCoincidencia("Euro", "  "), [{ texto: "Euro", marca: false }]);
  assert.deepEqual(trozosCoincidencia("Euro", "yen"), [{ texto: "Euro", marca: false }]);
});

test("al principio o al final no deja trozos vacíos", () => {
  assert.deepEqual(trozosCoincidencia("Euro", "eu"), [{ texto: "Eu", marca: true }, { texto: "ro", marca: false }]);
  assert.deepEqual(trozosCoincidencia("Euro", "euro"), [{ texto: "Euro", marca: true }]);
});
