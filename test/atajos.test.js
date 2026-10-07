const { test } = require("node:test");
const assert = require("node:assert");
const { ATAJOS, atajoPara, textoAtajo } = require("../logica.js");

const tecla = (code, extra) => ({ code, key: code.slice(-1).toLowerCase(), altKey: false, ctrlKey: false, metaKey: false, enCampo: false, ...extra });

test("fuera de un campo basta la letra", () => {
  assert.equal(atajoPara(tecla("KeyS")), "intercambiar");
  assert.equal(atajoPara(tecla("KeyC")), "copiar");
  assert.equal(atajoPara(tecla("KeyD")), "origen");
  assert.equal(atajoPara(tecla("KeyA")), "destino");
  assert.equal(atajoPara(tecla("Digit1")), "vista:evolucion");
  assert.equal(atajoPara(tecla("Digit2")), "vista:extras");
  assert.equal(atajoPara(tecla("Digit3")), "vista:avisos");
  assert.equal(atajoPara(tecla("Digit4")), "vista:chuleta");
  assert.equal(atajoPara(tecla("Digit5")), "vista:fecha");
  assert.equal(atajoPara(tecla("Digit6")), "vista:timo");
  assert.equal(atajoPara(tecla("KeyG")), "gastos");
  assert.equal(atajoPara(tecla("KeyP")), "cuenta");
  assert.equal(atajoPara(tecla("KeyR")), "historial");
});

test("fuera de un campo también vale con Alt", () => {
  assert.equal(atajoPara(tecla("KeyS", { altKey: true })), "intercambiar");
});

test("escribiendo en un campo las letras son letras", () => {
  assert.equal(atajoPara(tecla("KeyS", { enCampo: true })), null);
  assert.equal(atajoPara(tecla("KeyX", { enCampo: true })), null, "la x es 'por' en las cuentas");
  assert.equal(atajoPara(tecla("Digit1", { enCampo: true })), null, "los números son la cantidad");
});

test("en un campo, con Alt sí", () => {
  assert.equal(atajoPara(tecla("KeyS", { enCampo: true, altKey: true })), "intercambiar");
  assert.equal(atajoPara(tecla("Digit3", { enCampo: true, altKey: true })), "vista:avisos");
});

test("en Mac Opción cambia la letra, pero manda el code", () => {
  assert.equal(atajoPara({ ...tecla("KeyS", { enCampo: true, altKey: true }), key: "ß" }), "intercambiar");
  assert.equal(atajoPara({ ...tecla("KeyC", { enCampo: true, altKey: true }), key: "ç" }), "copiar");
});

test("Cmd y Ctrl no se tocan nunca", () => {
  assert.equal(atajoPara(tecla("KeyC", { metaKey: true })), null, "Cmd+C es copiar del sistema");
  assert.equal(atajoPara(tecla("KeyC", { ctrlKey: true })), null);
  assert.equal(atajoPara(tecla("KeyS", { ctrlKey: true, altKey: true, enCampo: true })), null);
});

test("deshacer con la Z, con Alt en un campo, y con Cmd o Ctrl fuera", () => {
  assert.equal(atajoPara(tecla("KeyZ")), "deshacer");
  assert.equal(atajoPara(tecla("KeyZ", { enCampo: true })), null);
  assert.equal(atajoPara(tecla("KeyZ", { enCampo: true, altKey: true })), "deshacer");
  assert.equal(atajoPara(tecla("KeyZ", { metaKey: true })), "deshacer");
  assert.equal(atajoPara(tecla("KeyZ", { ctrlKey: true })), "deshacer");
});

test("en un campo Cmd+Z es deshacer lo escrito, y con Mayúsculas rehacer", () => {
  assert.equal(atajoPara(tecla("KeyZ", { metaKey: true, enCampo: true })), null);
  assert.equal(atajoPara(tecla("KeyZ", { ctrlKey: true, enCampo: true })), null);
  assert.equal(atajoPara(tecla("KeyZ", { metaKey: true, shiftKey: true })), null);
});

test("la interrogación abre la ayuda fuera de un campo", () => {
  assert.equal(atajoPara({ ...tecla("Slash"), key: "?" }), "ayuda");
  assert.equal(atajoPara({ ...tecla("Minus"), key: "?" }), "ayuda", "en teclado español está en otra tecla");
  assert.equal(atajoPara({ ...tecla("Slash", { enCampo: true }), key: "?" }), null);
  assert.equal(atajoPara(tecla("KeyH", { enCampo: true, altKey: true })), "ayuda");
});

test("lo que no es un atajo no hace nada", () => {
  assert.equal(atajoPara(tecla("KeyQ")), null);
  assert.equal(atajoPara(tecla("Enter")), null);
});

test("cómo se escribe cada atajo", () => {
  assert.equal(textoAtajo("KeyS", true), "⌥S");
  assert.equal(textoAtajo("KeyS", false), "Alt+S");
  assert.equal(textoAtajo("Digit2", true), "⌥2");
});

test("no hay dos atajos para lo mismo", () => {
  const acciones = Object.values(ATAJOS);
  assert.equal(new Set(acciones).size, acciones.length);
});
