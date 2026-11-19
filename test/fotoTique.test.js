const { test } = require("node:test");
const assert = require("node:assert");
const { medidasFoto, fotosSinGasto, FOTO_LADO } = require("../logica.js");

test("la foto se reduce por el lado largo y no se agranda", () => {
  assert.deepEqual(medidasFoto(4032, 3024), { ancho: FOTO_LADO, alto: 1200 });
  assert.deepEqual(medidasFoto(3024, 4032), { ancho: 1200, alto: FOTO_LADO });
  assert.deepEqual(medidasFoto(800, 600), { ancho: 800, alto: 600 });
  assert.deepEqual(medidasFoto(1000, 500, 100), { ancho: 100, alto: 50 });
});

test("sin medidas no hay foto", () => {
  assert.equal(medidasFoto(0, 100), null);
  assert.equal(medidasFoto(NaN, 100), null);
  assert.equal(medidasFoto(100), null);
});

test("las fotos sin gasto, mirando todos los viajes", () => {
  const viajes = {
    lista: [{ gastos: [{ id: "a" }], empresa: [{ id: "e" }] }, { gastos: [{ id: "b" }] }],
    archivados: [{ gastos: [{ id: "c" }] }],
  };
  assert.deepEqual(fotosSinGasto(["a", "b", "c", "e", "x", "y"], viajes), ["x", "y"]);
  assert.deepEqual(fotosSinGasto(["x", "y"], viajes, ["y"]), ["x"], "lo que se puede deshacer aún es suyo");
  assert.deepEqual(fotosSinGasto(["a"], { lista: [] }), ["a"]);
  assert.deepEqual(fotosSinGasto([], viajes), []);
});
