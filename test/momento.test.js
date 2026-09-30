const { test } = require("node:test");
const assert = require("node:assert");
const { momento, textoMomento, alturaEn, coordenadas } = require("../logica.js");

test("hoy en lo más alto es buen momento", () => {
  const m = momento([1.0, 1.1, 1.05, 1.08, 1.2]);
  assert.equal(m.veredicto, "bueno");
  assert.equal(m.posicion, 1);
});

test("hoy en lo más bajo es mal momento", () => {
  const m = momento([1.2, 1.1, 1.15, 1.18, 1.0]);
  assert.equal(m.veredicto, "malo");
  assert.equal(m.posicion, 0);
});

test("por el medio es normal", () => {
  assert.equal(momento([1.0, 1.2, 1.05, 1.15, 1.1]).veredicto, "normal");
});

test("con la tasa plana no sale mal momento", () => {
  const m = momento([1.1, 1.1, 1.1, 1.1]);
  assert.equal(m.veredicto, "normal");
  assert.equal(m.posicion, 0.5);
  assert.equal(m.diferencia, 0);
});

test("justo en el umbral cuenta", () => {
  // 3 de 4 días anteriores por debajo: 0,75.
  assert.equal(momento([1, 1, 1, 2, 1.5]).veredicto, "bueno");
  assert.equal(momento([2, 2, 2, 1, 1.5]).veredicto, "malo");
});

test("la media y cuánto se aparta hoy", () => {
  const m = momento([1, 2, 3]);
  assert.equal(m.media, 2);
  assert.equal(m.diferencia, 0.5);
});

test("con menos de tres días no hay veredicto", () => {
  assert.equal(momento([1, 2]), null);
  assert.equal(momento([]), null);
  assert.equal(momento(null), null);
});

test("el texto dice por encima o por debajo", () => {
  const arriba = textoMomento({ veredicto: "bueno", diferencia: 0.0182, posicion: 0.86 }, 30, "EUR", "USD");
  assert.equal(arriba.titulo, "Buen momento");
  assert.equal(arriba.detalle, "1,8 % sobre la media");
  assert.match(arriba.explicacion, /mejor que el 86 % de los días de los últimos 30/);
  assert.match(arriba.explicacion, /más USD te dan por cada EUR/);

  const abajo = textoMomento({ veredicto: "malo", diferencia: -0.009, posicion: 0.1 }, 7, "EUR", "USD");
  assert.equal(abajo.titulo, "Mal momento");
  assert.equal(abajo.detalle, "0,9 % bajo la media");
});

test("con el año no dice 'los últimos 365'", () => {
  const t = textoMomento({ veredicto: "bueno", diferencia: 0.02, posicion: 0.9 }, 365, "EUR", "USD");
  assert.match(t.explicacion, /de los días del último año\./);
});

test("casi en la media lo dice así", () => {
  const t = textoMomento({ veredicto: "normal", diferencia: 0.0004, posicion: 0.5 }, 90, "EUR", "USD");
  assert.equal(t.titulo, "Momento normal");
  assert.equal(t.detalle, "en la media");
});

test("la altura de un valor cuadra con la de los puntos", () => {
  const values = [1, 1.5, 2, 1.2];
  const y = alturaEn(values);
  coordenadas(values).forEach((p, i) => assert.equal(p.y, y(values[i])));
  assert.equal(y(1.5), (y(1) + y(2)) / 2, "la media cae a mitad de camino");
});
