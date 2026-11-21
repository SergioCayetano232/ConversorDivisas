const { test } = require("node:test");
const assert = require("node:assert");
const { maximoSugerido, avisoDesdeTarjeta, avisoCumplido, AVISOS_MAX } = require("../logica.js");

const precio = { cantidad: 180, from: "GBP", to: "EUR" };
const TASA = 1.1942;

test("propone un 5 % menos, en redondo", () => {
  assert.equal(maximoSugerido(214.96), 200);
  assert.equal(maximoSugerido(45.49), 43);
  assert.equal(maximoSugerido(1299), 1200);
  assert.equal(maximoSugerido(9.99), 9.4);
  assert.equal(maximoSugerido(1.2), 1.1);
  assert.equal(maximoSugerido(84000), 79000);
});

test("lo propuesto siempre queda por debajo", () => {
  for (const v of [0.5, 1, 10, 100, 101, 999.99, 1000, 123456]) {
    const m = maximoSugerido(v);
    assert.ok(m > 0 && m < v, `${v} → ${m}`);
  }
  assert.equal(maximoSugerido(0.05), null);
  assert.equal(maximoSugerido(0), null);
  assert.equal(maximoSugerido(NaN), null);
});

test("crea el aviso de compra y lo añade a los que había", () => {
  const r = avisoDesdeTarjeta([], precio, 200, TASA, "a1");
  assert.deepEqual(r.aviso, { id: "a1", from: "GBP", to: "EUR", sentido: "baja", umbral: 200 / 180, precio: 180, maximo: 200 });
  assert.equal(r.avisos.length, 1);
  assert.equal(avisoCumplido(r.aviso, TASA), false);
  assert.equal(avisoCumplido(r.aviso, 1.11), true);
});

test("dice por qué no", () => {
  assert.equal(avisoDesdeTarjeta([], precio, 215, TASA, "a").problema, "yaCuesta");
  assert.equal(avisoDesdeTarjeta([], precio, 0, TASA, "a").problema, "escribe");
  assert.equal(avisoDesdeTarjeta([], precio, null, TASA, "a").problema, "escribe");
  assert.equal(avisoDesdeTarjeta([], { cantidad: 20, from: "EUR", to: "EUR" }, 10, 1, "a").problema, "noSe");
  assert.equal(avisoDesdeTarjeta([], null, 10, 1, "a").problema, "noSe");
});

test("ni repetido ni más de los que caben", () => {
  const uno = avisoDesdeTarjeta([], precio, 200, TASA, "a1").avisos;
  assert.equal(avisoDesdeTarjeta(uno, precio, 200, TASA, "a2").problema, "repetido");
  assert.equal(avisoDesdeTarjeta(uno, precio, 190, TASA, "a2").avisos.length, 2);
  let lista = [];
  for (let i = 0; i < AVISOS_MAX; i++) lista = avisoDesdeTarjeta(lista, precio, 200 - i, TASA, `a${i}`).avisos;
  assert.equal(avisoDesdeTarjeta(lista, precio, 150, TASA, "x").problema, "lleno");
});
