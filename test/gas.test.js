const { test } = require("node:test");
const assert = require("node:assert");
const { leerGas, convertirGas, textoGas, leerGrados, leerOmnibox } = require("../logica.js");

const texto = (t) => textoGas(leerGas(t));

test("lee las marcas del horno", () => {
  for (const t of ["gas 4", "Gas 4", "gas4", "gas mark 4", "Gas Mark 4", "marca de gas 4", "marca gas 4"]) assert.deepEqual(leerGas(t), { marca: 4 }, t);
  for (const t of ["gas ½", "gas 1/2", "gas 0,5", "gas 0.5"]) assert.deepEqual(leerGas(t), { marca: 0.5 }, t);
  assert.deepEqual(leerGas("gas ¼"), { marca: 0.25 });
  assert.deepEqual(leerGas("gas 10"), { marca: 10 });
});

test("lo que no es una marca, no", () => {
  for (const t of ["gas", "4", "gas 0", "gas 11", "gas 3,5", "gas -1", "4 gas", "", undefined]) assert.equal(leerGas(t), null, String(t));
  assert.equal(leerGrados("gas 4"), null);
  assert.equal(leerOmnibox("gas 4", { from: "EUR", to: "USD" }), null);
});

test("la tabla sube de una en una y cuadra con los °F", () => {
  assert.deepEqual(convertirGas({ marca: 4 }), { c: 180, f: 350 });
  assert.deepEqual(convertirGas({ marca: 1 }), { c: 140, f: 275 });
  for (let marca = 1; marca <= 10; marca++) {
    const { c, f } = convertirGas({ marca });
    assert.equal(f, 250 + marca * 25);
    // Los libros redondean a su manera: el gas 3 son 163 °C y ponen 170.
    assert.ok(Math.abs(c - (f - 32) / 1.8) <= 8, `gas ${marca}`);
  }
});

test("el texto, con los °C y los °F", () => {
  assert.equal(texto("gas 4"), "Gas 4 = 180 °C (350 °F)");
  assert.equal(texto("gas 1/2"), "Gas ½ = 120 °C (250 °F)");
  assert.equal(textoGas(null), "");
});
