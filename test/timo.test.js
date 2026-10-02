const { test } = require("node:test");
const assert = require("node:assert");
const { tasaOfrecida, analizarCambio } = require("../logica.js");

const cerca = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, `${msg ?? ""} ${a} ≠ ${b}`);

test("la tasa escrita en el sentido del par se lee tal cual", () => {
  assert.deepEqual(tasaOfrecida(1.12, 1.17), { tasa: 1.12, invertida: false });
});

test("si la escriben al revés, le doy la vuelta", () => {
  const leida = tasaOfrecida(0.89, 1.17);
  assert.equal(leida.invertida, true, "1 USD = 0,89 EUR con el par EUR→USD");
  cerca(leida.tasa, 1 / 0.89);
});

test("con tasas cerca de 1 decide la más parecida", () => {
  assert.equal(tasaOfrecida(0.9, 0.94).invertida, false, "EUR→CHF a 0,90 es un margen normal");
  assert.equal(tasaOfrecida(1.1, 0.94).invertida, true, "1,10 se parece más a 1/0,94");
  assert.equal(tasaOfrecida(1, 1).invertida, false, "si empatan, la del par");
});

test("sin número o sin tasa no hay nada que analizar", () => {
  assert.equal(tasaOfrecida(null, 1.17), null);
  assert.equal(tasaOfrecida(0, 1.17), null);
  assert.equal(tasaOfrecida(-1, 1.17), null);
  assert.equal(tasaOfrecida(1.1, null), null);
  assert.equal(analizarCambio(null, 1.17, 100), null);
  assert.equal(analizarCambio(1.1, 1.17, NaN), null);
});

test("por debajo de la real vendes: te dan menos", () => {
  const r = analizarCambio(1.1, 1.2, 100);
  assert.equal(r.sentido, "vendes");
  cerca(r.margen, 1 - 1.1 / 1.2);
  cerca(r.justo, 120);
  cerca(r.ofrecido, 110);
  cerca(r.perdida, 10);
});

test("por encima de la real compras: pagas más", () => {
  // Pagar 0,90 EUR por cada dólar cuando vale 0,855.
  const r = analizarCambio(0.9, 0.855, 100);
  assert.equal(r.sentido, "compras");
  cerca(r.margen, 1 - 0.855 / 0.9);
  cerca(r.ofrecido, 90);
  cerca(r.perdida, 4.5);
});

test("el veredicto va por el margen", () => {
  assert.equal(analizarCambio(1, 1, 1).veredicto, "bien", "a la real");
  assert.equal(analizarCambio(0.99, 1, 1).veredicto, "bien", "justo el 1 %");
  assert.equal(analizarCambio(0.98, 1, 1).veredicto, "normal");
  assert.equal(analizarCambio(0.95, 1, 1).veredicto, "caro");
  assert.equal(analizarCambio(0.85, 1, 1).veredicto, "timo", "un 15 %, como en el aeropuerto");
});

test("comprando y vendiendo, el mismo atraco da el mismo veredicto", () => {
  assert.equal(analizarCambio(0.85, 1, 1).veredicto, "timo");
  assert.equal(analizarCambio(1 / 0.85, 1, 1).veredicto, "timo");
});

test("la tasa al revés da el mismo resultado que al derecho", () => {
  const derecho = analizarCambio(1.1, 1.2, 50);
  const reves = analizarCambio(1 / 1.1, 1.2, 50);
  assert.equal(reves.invertida, true);
  cerca(reves.margen, derecho.margen);
  cerca(reves.perdida, derecho.perdida);
});

test("sin comisión puesta no comparo con la tarjeta", () => {
  assert.equal(analizarCambio(0.98, 1, 100).tarjeta, null);
});

test("dice si sale mejor la tarjeta o la ventanilla", () => {
  assert.equal(analizarCambio(0.95, 1, 100, 2).tarjeta, "tarjeta", "un 5 % contra un 2 %");
  assert.equal(analizarCambio(0.995, 1, 100, 2).tarjeta, "aqui", "medio punto contra un 2 %");
});

test("la tarjeta se compara sobre lo mismo que la comisión", () => {
  // Comprando a 1,03 cuando vale 1 pagas justo un 3 % de más, como la tarjeta.
  assert.equal(analizarCambio(1.03, 1, 100, 3).tarjeta, "aqui");
  assert.equal(analizarCambio(1.031, 1, 100, 3).tarjeta, "tarjeta");
});

test("con cantidad cero no se pierde nada, pero el margen sigue", () => {
  const r = analizarCambio(0.9, 1, 0);
  assert.equal(r.perdida, 0);
  assert.equal(r.veredicto, "timo");
});
