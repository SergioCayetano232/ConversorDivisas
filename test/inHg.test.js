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

test("los mmHg, a hPa", () => {
  for (const t of ["760 mmhg", "760mmHg", "760 mm Hg", "760 MMHG", "760 milímetros de mercurio", "760 milimetros de mercurio", "760 millimeters of mercury"]) assert.deepEqual(leerInHg(t), { valor: 760, de: "mmHg" }, t);
  cerca(convertirInHg({ valor: 1, de: "mmHg" }).valor, 1.33322387415);
  assert.equal(convertirInHg({ valor: 1, de: "mmHg" }).a, "hPa");
  assert.equal(texto("760 mmHg"), "760 mmHg = 1.013 hPa");
  assert.equal(texto("745 mmhg"), "745 mmHg = 993 hPa");
  assert.equal(leerLongitud("760 mmhg"), null);
  assert.equal(leerInHg("760 mm"), null);
  assert.equal(leerOmnibox("760 mmhg", { from: "EUR", to: "USD" }), null);
});

test("los torr, a hPa", () => {
  for (const t of ["760 torr", "760torr", "760 Torr", "760 TORR", "1 torrs"]) assert.equal(leerInHg(t)?.de, "Torr", t);
  cerca(convertirInHg({ valor: 760, de: "Torr" }).valor, 1013.25);
  assert.equal(convertirInHg({ valor: 1, de: "Torr" }).a, "hPa");
  assert.equal(texto("760 torr"), "760 Torr = 1.013 hPa");
  assert.equal(texto("750 torr"), "750 Torr = 1.000 hPa");
  assert.equal(leerInHg("760 tor"), null);
  assert.equal(leerOmnibox("760 torr", { from: "EUR", to: "USD" }), null);
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("29.92 inHg"), "29.92 inHg = 1,013 hPa");
  } finally {
    ponerIdioma("es");
  }
});
