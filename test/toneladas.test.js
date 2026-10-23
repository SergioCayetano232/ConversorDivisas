const { test } = require("node:test");
const assert = require("node:assert");
const { leerToneladasCortas, convertirToneladasCortas, textoToneladasCortas, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoToneladasCortas(leerToneladasCortas(t));

test("lee las toneladas cortas", () => {
  for (const t of ["2 ton", "2ton", "2 tons", "2 TONS", "2 short tons"]) assert.deepEqual(leerToneladasCortas(t), { valor: 2, de: "ton" }, t);
  assert.equal(leerToneladasCortas("1,5 ton").valor, 1.5);
});

test("lo que no son toneladas cortas, no", () => {
  for (const t of ["ton", "2", "-2 ton", "2 toneladas", "2 tonnes", "2 t", "", undefined]) assert.equal(leerToneladasCortas(t), null, String(t));
  assert.equal(leerOmnibox("2 ton", { from: "EUR", to: "USD" }), null);
});

test("una tonelada corta son 907 kg", () => {
  cerca(convertirToneladasCortas({ valor: 1 }).valor, 0.90718474);
  assert.equal(convertirToneladasCortas({ valor: 1 }).a, "t");
  assert.equal(texto("2 ton"), "2 ton = 1,81 t");
  assert.equal(texto("40 tons"), "40 ton = 36,29 t");
  assert.equal(textoToneladasCortas(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2 ton"), "2 ton = 1.81 t");
  } finally {
    ponerIdioma("es");
  }
});
