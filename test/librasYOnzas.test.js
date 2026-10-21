const { test } = require("node:test");
const assert = require("node:assert");
const { leerLibrasYOnzas, convertirLibrasYOnzas, textoLibrasYOnzas, leerPeso, leerOnzas } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoLibrasYOnzas(leerLibrasYOnzas(t));

test("lee las libras y las onzas juntas", () => {
  for (const t of ["5 lb 4 oz", "5lb 4oz", "5lb4oz", "5 lbs 4 oz", "5 pounds 4 ounces", "5 libras 4 onzas"]) assert.deepEqual(leerLibrasYOnzas(t), { libras: 5, onzas: 4 }, t);
  assert.deepEqual(leerLibrasYOnzas("7 lb 8,5 oz"), { libras: 7, onzas: 8.5 });
});

test("lo que no son las dos juntas, no; solas siguen yendo a lo suyo", () => {
  for (const t of ["5 lb", "4 oz", "5 lb 4", "5 lb 4 fl oz", "5 lb 16 oz", "", undefined]) assert.equal(leerLibrasYOnzas(t), null, String(t));
  assert.equal(leerPeso("5 lb 4 oz"), null);
  assert.equal(leerOnzas("5 lb 4 oz"), null);
});

test("una libra son 16 onzas", () => {
  cerca(convertirLibrasYOnzas({ libras: 1, onzas: 8 }).valor, 1.5 * 0.45359237);
  assert.equal(convertirLibrasYOnzas({ libras: 1, onzas: 0 }).a, "kg");
});

test("el texto, con dos decimales en los kilos", () => {
  assert.equal(texto("5 lb 4 oz"), "5 lb 4 oz = 2,38 kg");
  assert.equal(texto("7lb 8,5oz"), "7 lb 8,5 oz = 3,42 kg");
  assert.equal(textoLibrasYOnzas(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("7 pounds 8.5 ounces"), "7 lb 8.5 oz = 3.42 kg");
  } finally {
    ponerIdioma("es");
  }
});
