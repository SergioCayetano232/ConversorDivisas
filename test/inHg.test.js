const { test } = require("node:test");
const assert = require("node:assert");
const { leerInHg, convertirInHg, textoInHg, leerLongitud, leerPresion, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoInHg(leerInHg(t));

test("lee las pulgadas de mercurio", () => {
  for (const t of ["30 inhg", "30inHg", "30 in hg", "30 in. Hg", '30"hg', "30 pulgadas de mercurio", "30 inches of mercury"]) assert.deepEqual(leerInHg(t), { valor: 30, de: "inHg" }, t);
  assert.equal(leerInHg("29,92 inhg").valor, 29.92);
});

test("lo que no es inHg, no; y las pulgadas y los psi siguen a lo suyo", () => {
  for (const t of ["inhg", "30", "30 in", "30 hg", "-1 inhg", "", undefined]) assert.equal(leerInHg(t), null, String(t));
  assert.equal(leerLongitud("30 inhg"), null);
  assert.equal(leerPresion("30 inhg"), null);
  assert.equal(leerOmnibox("30 inhg", { from: "EUR", to: "USD" }), null);
});

test("29,92 inHg son 1.013 hPa, la presión normal", () => {
  cerca(convertirInHg({ valor: 1 }).valor, 33.8638866667);
  assert.equal(convertirInHg({ valor: 1 }).a, "hPa");
  assert.equal(texto("29,92 inhg"), "29,92 inHg = 1.013 hPa");
  assert.equal(texto("30 inhg"), "30 inHg = 1.016 hPa");
  assert.equal(textoInHg(null), "");
});

test("y los hPa al revés", () => {
  for (const t of ["1013 hpa", "1013hPa", "1013 mbar", "1013 milibares", "1013 millibars"]) assert.deepEqual(leerInHg(t), { valor: 1013, de: "hPa" }, t);
  assert.equal(convertirInHg({ valor: 1013, de: "hPa" }).a, "inHg");
  assert.equal(texto("1013 hpa"), "1.013 hPa = 29,91 inHg");
  assert.equal(texto("1016 mbar"), "1.016 hPa = 30 inHg");
  assert.equal(leerPresion("1013 mbar"), null);
  assert.equal(leerInHg("1013 mb"), null, "mb también son megas");
  assert.equal(leerOmnibox("1013 hpa", { from: "EUR", to: "USD" }), null);
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("29.92 inHg"), "29.92 inHg = 1,013 hPa");
  } finally {
    ponerIdioma("es");
  }
});
