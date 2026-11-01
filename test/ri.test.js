const { test } = require("node:test");
const assert = require("node:assert");
const { leerRi, convertirRi, textoRi, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoRi(leerRi(t));

test("lee los ri, con su carácter, y los li chinos", () => {
  for (const t of ["3 ri", "3ri", "3 RI", "3 里", "3里"]) assert.deepEqual(leerRi(t), { valor: 3, de: "ri" }, t);
  assert.deepEqual(leerRi("3 li"), { valor: 3, de: "li" });
  assert.equal(leerRi("0,5 ri").valor, 0.5);
});

test("lo que no son ri, no", () => {
  for (const t of ["ri", "3", "3 rin", "3 lis", "-3 ri", "", undefined]) assert.equal(leerRi(t), null, String(t));
  assert.equal(leerOmnibox("3 ri", { from: "EUR", to: "USD" }), null);
});

test("el japonés son 12.960 shaku y el chino, medio kilómetro", () => {
  cerca(convertirRi({ valor: 1 }).valor, 12960 * 10 / 33 / 1000);
  assert.equal(convertirRi({ valor: 3 }).china, 1.5);
  assert.equal(texto("1 ri"), "1 ri = 🇯🇵 3,93 km · 🇨🇳 500 m");
  assert.equal(texto("3 里"), "3 ri = 🇯🇵 11,78 km · 🇨🇳 1,5 km");
  assert.equal(texto("1 li"), "1 li = 🇯🇵 3,93 km · 🇨🇳 500 m");
  assert.equal(textoRi(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("0.5 ri"), "0.5 ri = 🇯🇵 1.96 km · 🇨🇳 250 m");
  } finally {
    ponerIdioma("es");
  }
});
