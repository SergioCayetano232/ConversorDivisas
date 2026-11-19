const { test } = require("node:test");
const assert = require("node:assert");
const { leerTamano, compararTamanos } = require("../logica.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);

test("lee el tamaño en gramos, mililitros o unidades", () => {
  assert.deepEqual(leerTamano("500 g"), { cantidad: 500, magnitud: "peso" });
  assert.deepEqual(leerTamano("1kg"), { cantidad: 1000, magnitud: "peso" });
  assert.deepEqual(leerTamano("1,5 l"), { cantidad: 1500, magnitud: "volumen" });
  assert.deepEqual(leerTamano("75cl"), { cantidad: 750, magnitud: "volumen" });
  assert.deepEqual(leerTamano("250 gramos"), { cantidad: 250, magnitud: "peso" });
  assert.deepEqual(leerTamano("2 litros"), { cantidad: 2000, magnitud: "volumen" });
  assert.deepEqual(leerTamano("12"), { cantidad: 12, magnitud: "unidades" });
  assert.deepEqual(leerTamano("6 uds"), { cantidad: 6, magnitud: "unidades" });
});

test("los packs se multiplican", () => {
  assert.deepEqual(leerTamano("6 x 330 ml"), { cantidad: 1980, magnitud: "volumen" });
  assert.deepEqual(leerTamano("4x125g"), { cantidad: 500, magnitud: "peso" });
});

test("las de Estados Unidos, con la onza de líquidos aparte", () => {
  cerca(leerTamano("16 oz").cantidad, 16 * 28.3495231);
  assert.equal(leerTamano("16 oz").magnitud, "peso");
  assert.equal(leerTamano("12 fl oz").magnitud, "volumen");
  cerca(leerTamano("1 lb").cantidad, 453.59237);
  cerca(leerTamano("1 gal").cantidad, 3785.41178);
});

test("lo que no es un tamaño", () => {
  assert.equal(leerTamano(""), null);
  assert.equal(leerTamano(null), null);
  assert.equal(leerTamano("kg"), null);
  assert.equal(leerTamano("0 g"), null);
  assert.equal(leerTamano("mucho"), null);
});

test("el grande sale más barato por kilo", () => {
  const r = compararTamanos({ precio: 3.2, tamano: "500 g" }, { precio: 5.9, tamano: "1 kg" });
  assert.equal(r.donde, "b");
  assert.equal(r.unidad, "kg");
  cerca(r.porA, 6.4);
  cerca(r.porB, 5.9);
  cerca(r.fraccion, 0.5 / 6.4, "el porcentaje es sobre el caro");
});

test("a veces el pequeño gana", () => {
  const r = compararTamanos({ precio: 1, tamano: "330 ml" }, { precio: 5, tamano: "1,5 l" });
  assert.equal(r.donde, "a");
  assert.equal(r.unidad, "l");
});

test("por unidad, y menos de un 1 % es lo mismo", () => {
  const r = compararTamanos({ precio: 2.4, tamano: "6" }, { precio: 4.78, tamano: "12" });
  assert.equal(r.unidad, "ud");
  assert.equal(r.donde, "igual");
});

test("peso con volumen no se compara", () => {
  assert.deepEqual(compararTamanos({ precio: 2, tamano: "500 g" }, { precio: 3, tamano: "1 l" }), { donde: "distinto" });
});

test("sin precio o sin tamaño no hay comparación", () => {
  assert.equal(compararTamanos({ precio: 0, tamano: "1 kg" }, { precio: 3, tamano: "1 kg" }), null);
  assert.equal(compararTamanos({ precio: 2, tamano: "" }, { precio: 3, tamano: "1 kg" }), null);
  assert.equal(compararTamanos(null, { precio: 3, tamano: "1 kg" }), null);
});
