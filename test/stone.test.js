const { test } = require("node:test");
const assert = require("node:assert");
const { leerStone, convertirStone, textoStone, leerPeso } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoStone(leerStone(t));

test("lee los stone, solos o con libras", () => {
  assert.deepEqual(leerStone("11st"), { stone: 11, libras: 0 });
  assert.deepEqual(leerStone("11 stone"), { stone: 11, libras: 0 });
  assert.deepEqual(leerStone("11,5 stones"), { stone: 11.5, libras: 0 });
  assert.deepEqual(leerStone("11st 4lb"), { stone: 11, libras: 4 });
  assert.deepEqual(leerStone("11 st 4 lbs"), { stone: 11, libras: 4 });
  assert.deepEqual(leerStone("11 stone 4 pounds"), { stone: 11, libras: 4 });
});

test("lo que no son stone, no", () => {
  for (const t of ["st", "11", "-5 st", "11 st 14 lb", "4lb", "", undefined]) assert.equal(leerStone(t), null, String(t));
  assert.equal(leerPeso("11st 4lb"), null);
});

test("un stone son 14 libras", () => {
  cerca(convertirStone({ stone: 1, libras: 0 }).valor, 6.35029318);
  cerca(convertirStone({ stone: 0, libras: 14 }).valor, 6.35029318);
  assert.equal(convertirStone({ stone: 1, libras: 0 }).a, "kg");
});

test("el texto, con un decimal", () => {
  assert.equal(texto("11st"), "11 st = 69,9 kg");
  assert.equal(texto("11st 4lb"), "11 st 4 lb = 71,7 kg");
  assert.equal(textoStone(null), "");
  ponerIdioma("en");
  try {
    assert.equal(texto("11st 4lb"), "11 st 4 lb = 71.7 kg");
  } finally {
    ponerIdioma("es");
  }
});
