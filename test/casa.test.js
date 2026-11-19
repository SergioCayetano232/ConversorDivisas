const { test } = require("node:test");
const assert = require("node:assert");
const { comparaConCasa, textoCasa, DIAS_POR_MES } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const media = (n, to = "EUR") => ({ media: n, to, dias: 5 });
const casa = (precio, divisa = "EUR") => ({ precio, divisa });

test("al día, lo del mes entre los días de un mes", () => {
  const r = comparaConCasa(media(60), casa(900));
  assert.ok(Math.abs(r.diaCasa - 900 / DIAS_POR_MES) < 1e-9);
  assert.ok(Math.abs(r.diferencia - (60 - 900 / DIAS_POR_MES)) < 1e-9);
  assert.equal(r.tono, "mas");
});

test("más caro, más barato o como en casa", () => {
  ponerIdioma("es");
  assert.equal(textoCasa(comparaConCasa(media(60), casa(900))), "🏠 +30,43/día vs. casa");
  assert.equal(textoCasa(comparaConCasa(media(20), casa(900))), "🏠 −9,57/día vs. casa");
  assert.equal(textoCasa(comparaConCasa(media(30), casa(900))), "🏠 Como en casa");
});

test("en otra divisa no lo comparo", () => {
  assert.equal(comparaConCasa(media(60, "USD"), casa(900, "EUR")), null);
});

test("sin media o sin lo de casa, nada", () => {
  assert.equal(comparaConCasa(null, casa(900)), null);
  assert.equal(comparaConCasa(media(60), null), null);
  assert.equal(comparaConCasa(media(60), casa(0)), null);
  assert.equal(textoCasa(null), "");
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(textoCasa(comparaConCasa(media(60), casa(900))), "🏠 +30.43/day vs home");
  ponerIdioma("es");
});
