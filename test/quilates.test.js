const { test } = require("node:test");
const assert = require("node:assert");
const { leerQuilates, convertirQuilates, textoQuilates, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const texto = (t) => textoQuilates(leerQuilates(t));

test("lee los quilates", () => {
  for (const t of ["2 ct", "2ct", "2 cts", "2 carats", "2 CT"]) assert.deepEqual(leerQuilates(t), { valor: 2, de: "ct" }, t);
  assert.deepEqual(leerQuilates("1 carat"), { valor: 1, de: "ct" });
  assert.equal(leerQuilates("0,75 ct").valor, 0.75);
});

test("lo que no son quilates, no; y los del oro tampoco", () => {
  for (const t of ["ct", "2", "18 quilates", "18k", "18 kt", "-1 ct", "", undefined]) assert.equal(leerQuilates(t), null, String(t));
  assert.equal(leerOmnibox("2 ct", { from: "EUR", to: "USD" }), null);
});

test("un quilate son 0,2 gramos", () => {
  assert.deepEqual(convertirQuilates({ valor: 1 }), { valor: 0.2, a: "g" });
  assert.equal(texto("1,5 ct"), "1,5 ct = 0,3 g");
  assert.equal(texto("0,25 ct"), "0,25 ct = 0,05 g");
  assert.equal(textoQuilates(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("1.5 carats"), "1.5 ct = 0.3 g");
  } finally {
    ponerIdioma("es");
  }
});
