const { test } = require("node:test");
const assert = require("node:assert");
const { leerTsubo, convertirTsubo, textoTsubo, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoTsubo(leerTsubo(t));

test("lee los tsubo, y los pyeong y ping, que son lo mismo", () => {
  for (const t of ["20 tsubo", "20tsubo", "20 TSUBO", "20 坪"]) assert.deepEqual(leerTsubo(t), { valor: 20, de: "tsubo" }, t);
  for (const t of ["20 pyeong", "20 pyong", "20 평"]) assert.deepEqual(leerTsubo(t), { valor: 20, de: "pyeong" }, t);
  assert.deepEqual(leerTsubo("20 ping"), { valor: 20, de: "ping" });
  assert.equal(leerTsubo("12,5 tsubo").valor, 12.5);
});

test("lo que no son tsubo, no", () => {
  for (const t of ["tsubo", "20", "20 tsubos", "20 pings", "-1 tsubo", "", undefined]) assert.equal(leerTsubo(t), null, String(t));
  assert.equal(leerOmnibox("20 tsubo", { from: "EUR", to: "USD" }), null);
});

test("un tsubo son dos tatamis, 400/121 m²", () => {
  cerca(convertirTsubo({ valor: 121 }).valor, 400);
  assert.equal(convertirTsubo({ valor: 1 }).a, "m²");
  assert.equal(texto("20 tsubo"), "20 tsubo = 66,1 m²");
  assert.equal(texto("32 평"), "32 pyeong = 105,8 m²");
  assert.equal(texto("1 ping"), "1 ping = 3,3 m²");
  assert.equal(textoTsubo(null), "");
});

test("en inglés, con el punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("12.5 tsubo"), "12.5 tsubo = 41.3 m²");
  } finally {
    ponerIdioma("es");
  }
});
