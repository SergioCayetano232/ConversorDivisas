const { test } = require("node:test");
const assert = require("node:assert");
const { leerGo, convertirGo, textoGo, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoGo(leerGo(t));

test("lee los go, también con su carácter", () => {
  for (const t of ["2 go", "2go", "2 GO", "2 gō", "2 合", "2合"]) assert.deepEqual(leerGo(t), { valor: 2, de: "go" }, t);
  assert.equal(leerGo("1,5 go").valor, 1.5);
});

test("lo que no son go, no", () => {
  for (const t of ["go", "2", "2 gol", "2 goes", "-2 go", "", undefined]) assert.equal(leerGo(t), null, String(t));
  assert.equal(leerOmnibox("2 go", { from: "EUR", to: "USD" }), null);
});

test("un go son 180 ml y 150 g de arroz", () => {
  cerca(convertirGo({ valor: 10 }).valor, 1803.9068369646882);
  assert.equal(convertirGo({ valor: 2 }).arroz, 300);
  assert.equal(texto("1 go"), "1 go = 180 ml · 🍚 150 g de arroz");
  assert.equal(texto("2 go"), "2 go = 361 ml · 🍚 300 g de arroz");
  assert.equal(texto("10 go"), "10 go = 1,8 l · 🍚 1,5 kg de arroz");
  assert.equal(textoGo(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("1.5 go"), "1.5 go = 271 ml · 🍚 225 g of rice");
  } finally {
    ponerIdioma("es");
  }
});
