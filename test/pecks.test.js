const { test } = require("node:test");
const assert = require("node:assert");
const { leerPecks, convertirPecks, textoPecks, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoPecks(leerPecks(t));

test("lee los pecks", () => {
  for (const t of ["2 pecks", "2pecks", "2 peck", "2 PECKS"]) assert.deepEqual(leerPecks(t), { valor: 2, de: "peck" }, t);
  assert.equal(leerPecks("0,5 peck").valor, 0.5);
});

test("\"pk\" no, que son paquetes", () => {
  for (const t of ["2 pk", "peck", "2", "-1 peck", "", undefined]) assert.equal(leerPecks(t), null, String(t));
  assert.equal(leerOmnibox("1 peck", { from: "EUR", to: "USD" }), null);
});

test("un peck es un cuarto de bushel, 8,8 l", () => {
  cerca(convertirPecks({ valor: 1 }).valor, 8.80976754172);
  assert.equal(convertirPecks({ valor: 1 }).a, "l");
  assert.equal(texto("1 peck"), "1 peck = 8,8 l");
  assert.equal(texto("0,5 pecks"), "0,5 pecks = 4,4 l");
  assert.equal(textoPecks(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("1 peck"), "1 peck = 8.8 l");
  } finally {
    ponerIdioma("es");
  }
});
