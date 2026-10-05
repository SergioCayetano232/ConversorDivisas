const { test } = require("node:test");
const assert = require("node:assert");
const { chuleta, chuletaParaCompartir } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("la chuleta va con título y en columna", () => {
  ponerIdioma("es");
  const texto = chuletaParaCompartir(chuleta(1.1), "EUR", "USD");
  assert.equal(texto, [
    "*💱 Chuleta EUR → USD*",
    "```",
    "  1 EUR =   1,10 USD",
    "  5 EUR =   5,50 USD",
    " 10 EUR =  11,00 USD",
    " 20 EUR =  22,00 USD",
    " 50 EUR =  55,00 USD",
    "100 EUR = 110,00 USD",
    "```",
  ].join("\n"));
});

test("con yenes empieza más arriba y los miles llevan punto", () => {
  ponerIdioma("es");
  const lineas = chuletaParaCompartir(chuleta(0.00625), "JPY", "EUR").split("\n");
  assert.equal(lineas[2], "   100 JPY =  0,63 EUR");
  assert.equal(lineas[7], "10.000 JPY = 62,50 EUR");
});

test("con comisión lo dice debajo, y en inglés a la inglesa", () => {
  ponerIdioma("en");
  const lineas = chuletaParaCompartir(chuleta(1.1, 2), "EUR", "USD", 2).split("\n");
  assert.equal(lineas[0], "*💱 Cheat sheet EUR → USD*");
  assert.equal(lineas[7], "100 EUR = 112.20 USD");
  assert.equal(lineas.at(-1), "_Including the 2% card fee_");
  ponerIdioma("es");
});

test("sin tasa no hay nada que copiar", () => {
  assert.equal(chuletaParaCompartir(chuleta(null), "EUR", "USD"), "");
  assert.equal(chuletaParaCompartir([], "EUR", "USD"), "");
});
