const { test } = require("node:test");
const assert = require("node:assert");
const { KONAMI, pasoKonami } = require("../logica.js");

const teclear = (teclas, desde = 0) => teclas.reduce(pasoKonami, desde);

test("la secuencia entera llega al final", () => {
  assert.equal(teclear(KONAMI), KONAMI.length);
});

test("la B y la A valen en mayúscula", () => {
  assert.equal(teclear([...KONAMI.slice(0, 8), "B", "A"]), KONAMI.length);
});

test("una tecla de más en medio la rompe", () => {
  assert.equal(teclear(["ArrowUp", "ArrowUp", "x"]), 0);
});

test("con tres flechas arriba, las dos últimas siguen valiendo", () => {
  assert.equal(teclear(["ArrowUp", "ArrowUp", "ArrowUp"]), 2);
  assert.equal(teclear(["ArrowUp", "ArrowUp", "ArrowUp", ...KONAMI.slice(2)]), KONAMI.length);
});

test("si fallas, la flecha arriba vuelve a empezar", () => {
  assert.equal(teclear(["ArrowUp", "ArrowUp", "ArrowDown", "ArrowUp"]), 1);
});
