const { test } = require("node:test");
const assert = require("node:assert");
const { CURRENCIES, simboloDe, textoConSimbolo } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

// Intl separa con un espacio que no se parte; para comparar, uno normal.
const ver = (texto) => texto.replace(/ | /g, " ");

test("en español el símbolo va detrás", () => {
  ponerIdioma("es");
  assert.equal(ver(textoConSimbolo(42.79, "EUR")), "42,79 €");
  assert.equal(ver(textoConSimbolo(1234.5, "GBP")), "1.234,50 £");
});

test("en inglés, delante y con la coma de los miles", () => {
  ponerIdioma("en");
  assert.equal(textoConSimbolo(42.79, "USD"), "$42.79");
  assert.equal(textoConSimbolo(1234.5, "EUR"), "€1,234.50");
});

test("el dólar se queda el $, y los demás llevan su marca", () => {
  ponerIdioma("en");
  assert.equal(simboloDe("USD"), "$");
  assert.equal(simboloDe("MXN"), "MX$");
  assert.equal(simboloDe("CAD"), "CA$");
  assert.equal(textoConSimbolo(10, "AUD"), "A$10.00");
});

test("el yen se queda el ¥ y el yuan no", () => {
  assert.equal(simboloDe("JPY"), "¥");
  assert.equal(simboloDe("CNY"), "CN¥");
});

test("los yenes van sin decimales, como en las etiquetas", () => {
  ponerIdioma("es");
  assert.equal(ver(textoConSimbolo(1234.5, "JPY")), "1.235 ¥");
});

test("si el símbolo son letras, no se queda pegado al número", () => {
  ponerIdioma("en");
  assert.equal(ver(textoConSimbolo(10, "SGD")), "SGD 10.00");
});

test("ningún símbolo se repite entre dos divisas", () => {
  const simbolos = CURRENCIES.map((c) => simboloDe(c.code));
  assert.equal(new Set(simbolos).size, simbolos.length);
});

test("sin número o con una divisa que no existe, nada", () => {
  assert.equal(textoConSimbolo(null, "EUR"), "");
  assert.equal(textoConSimbolo(10, "XXX"), "");
});
