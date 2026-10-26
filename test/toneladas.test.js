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
  for (const t of ["ton", "2", "-2 ton", "2 tn", "2 short t", "", undefined]) assert.equal(leerToneladasCortas(t), null, String(t));
  assert.equal(leerOmnibox("2 ton", { from: "EUR", to: "USD" }), null);
});

test("una tonelada corta son 907 kg", () => {
  cerca(convertirToneladasCortas({ valor: 1 }).valor, 0.90718474);
  assert.equal(convertirToneladasCortas({ valor: 1 }).a, "t");
  assert.equal(texto("2 ton"), "2 ton = 1,81 t");
  assert.equal(texto("40 tons"), "40 ton = 36,29 t");
  assert.equal(textoToneladasCortas(null), "");
});

test("y las de aquí al revés, a cortas", () => {
  for (const t of ["2 t", "2t", "2 T", "2 tonnes", "2 tonne", "2 toneladas", "1 tonelada"]) assert.equal(leerToneladasCortas(t).de, "t", t);
  cerca(convertirToneladasCortas({ valor: 0.90718474, de: "t" }).valor, 1);
  assert.equal(convertirToneladasCortas({ valor: 1, de: "t" }).a, "ton");
  assert.equal(texto("2 t"), "2 t = 2,2 ton");
  assert.equal(texto("10 toneladas"), "10 t = 11,02 ton");
  assert.equal(leerOmnibox("2 t", { from: "EUR", to: "USD" }), null);
});

test("la larga, la de Reino Unido", () => {
  for (const t of ["2 long ton", "2 long tons", "2 LONG TONS", "2 ton uk", "2 tons (UK)", "2 tons imperial"]) assert.deepEqual(leerToneladasCortas(t), { valor: 2, de: "long ton" }, t);
  cerca(convertirToneladasCortas({ valor: 1, de: "long ton" }).valor, 1.0160469088);
  assert.equal(texto("2 long tons"), "2 long ton = 2,03 t");
  assert.equal(texto("40 ton uk"), "40 long ton = 40,64 t");
  for (const t of ["2 long", "2 long t", "2 ton usa"]) assert.equal(leerToneladasCortas(t), null, t);
  assert.equal(leerOmnibox("2 long ton", { from: "EUR", to: "USD" }), null);
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2 ton"), "2 ton = 1.81 t");
  } finally {
    ponerIdioma("es");
  }
});
