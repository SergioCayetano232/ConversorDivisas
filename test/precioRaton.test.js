const { test } = require("node:test");
const assert = require("node:assert");
const { precioBajoElRaton } = require("../logica.js");

const TEXTO = "Antes 59,99 € y ahora $49.99 en oferta";

test("el precio que cae bajo el ratón, con dónde empieza y acaba", () => {
  const r = precioBajoElRaton(TEXTO, 24);
  assert.deepEqual(r.precio, { texto: "$49.99", inicio: 22, fin: 28 });
  assert.equal(precioBajoElRaton(TEXTO, 8).precio.texto, "59,99 €");
});

test("entre dos precios no hay nada, pero los rangos vienen igual", () => {
  const r = precioBajoElRaton(TEXTO, 16);
  assert.equal(r.precio, null);
  assert.deepEqual(r.rangos, [[6, 13], [22, 28]]);
});

test("en los bordes también vale", () => {
  assert.equal(precioBajoElRaton(TEXTO, 22).precio.texto, "$49.99");
  assert.equal(precioBajoElRaton(TEXTO, 28).precio.texto, "$49.99");
});

test("partido en trozos, vale el bloque si es solo un precio", () => {
  const r = precioBajoElRaton("49", 1, ["49.99", "  $49.99 ", "Ahora $49.99"]);
  assert.deepEqual(r.precio, { texto: "$49.99", inicio: 0, fin: 2, bloque: 1 });
  assert.equal(precioBajoElRaton("49", 1, ["Envío $4.99 y total $49.99"]).precio, null);
  assert.equal(precioBajoElRaton("Añadir", 2, ["Añadir al carrito"]).precio, null);
});

test("sin la divisa pegada no es un precio", () => {
  assert.equal(precioBajoElRaton("Página 3 de 12", 7).precio, null);
  assert.equal(precioBajoElRaton("1.299", 2, ["1.299"]).precio, null);
});

test("sin texto, nada y sin romperse", () => {
  assert.deepEqual(precioBajoElRaton(null, 0), { rangos: [], precio: null });
  assert.deepEqual(precioBajoElRaton("49", 1, "$49"), { rangos: [], precio: null });
});
