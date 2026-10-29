const { test } = require("node:test");
const assert = require("node:assert");
const { leerPennyweight, convertirPennyweight, textoPennyweight, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoPennyweight(leerPennyweight(t));

test("lee los pennyweights", () => {
  for (const t of ["10 dwt", "10dwt", "10 DWT", "10 pennyweight", "10 pennyweights"]) assert.deepEqual(leerPennyweight(t), { valor: 10, de: "dwt" }, t);
  assert.equal(leerPennyweight("2,5 dwt").valor, 2.5);
});

test("lo que no son pennyweights, no", () => {
  for (const t of ["dwt", "10", "10 dw", "-1 dwt", "", undefined]) assert.equal(leerPennyweight(t), null, String(t));
  assert.equal(leerOmnibox("10 dwt", { from: "EUR", to: "USD" }), null);
});

test("10 dwt son 15,6 g", () => {
  cerca(convertirPennyweight({ valor: 1 }).valor, 1.55517384);
  cerca(convertirPennyweight({ valor: 20 }).valor, 31.1034768);
  assert.equal(convertirPennyweight({ valor: 1 }).a, "g");
  assert.equal(texto("10 dwt"), "10 dwt = 15,6 g");
  assert.equal(texto("1 pennyweight"), "1 dwt = 1,6 g");
  assert.equal(textoPennyweight(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("10 dwt"), "10 dwt = 15.6 g");
  } finally {
    ponerIdioma("es");
  }
});
