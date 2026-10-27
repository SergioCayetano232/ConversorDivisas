const { test } = require("node:test");
const assert = require("node:assert");
const { leerPresion, convertirPresion, textoPresion, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoPresion(leerPresion(t));

test("lee las presiones como se escriben", () => {
  assert.deepEqual(leerPresion("35psi"), { valor: 35, de: "psi" });
  assert.deepEqual(leerPresion("35 PSI"), { valor: 35, de: "psi" });
  assert.deepEqual(leerPresion("2,4 bar"), { valor: 2.4, de: "bar" });
  assert.deepEqual(leerPresion("2.2bar"), { valor: 2.2, de: "bar" });
  assert.deepEqual(leerPresion("3 bares"), { valor: 3, de: "bar" });
});

test("lo que no son presiones, no", () => {
  for (const t of ["psi", "35", "-2 bar", "35 brl", "", undefined]) assert.equal(leerPresion(t), null, String(t));
});

test("no pisa los reales", () => {
  assert.equal(leerOmnibox("35 brl", { from: "EUR", to: "USD" }).from, "BRL");
});

test("de psi a bar y al revés", () => {
  cerca(convertirPresion({ valor: 1, de: "psi" }).valor, 0.0689475729);
  cerca(convertirPresion({ valor: 0.0689475729, de: "bar" }).valor, 1);
  assert.equal(convertirPresion({ valor: 1, de: "bar" }).a, "psi");
});

test("el texto: bar con un decimal, psi sin ninguno", () => {
  assert.equal(texto("35psi"), "35 psi = 2,4 bar");
  assert.equal(texto("2,2 bar"), "2,2 bar = 32 psi");
  assert.equal(textoPresion(null), "");
});

test("los kPa, a psi", () => {
  for (const t of ["250 kPa", "250kpa", "250 KPA"]) assert.deepEqual(leerPresion(t), { valor: 250, de: "kPa" }, t);
  assert.equal(convertirPresion({ valor: 1, de: "kPa" }).a, "psi");
  assert.equal(texto("250 kPa"), "250 kPa = 36 psi");
  assert.equal(leerPresion("250 pa"), null);
  assert.equal(leerOmnibox("250 kpa", { from: "EUR", to: "USD" }), null);
});

test("los kg/cm², a psi", () => {
  for (const t of ["2,2 kg/cm²", "2,2kg/cm2", "2,2 KG/CM2", "2,2 kgf/cm²", "2,2 kg / cm²"]) assert.deepEqual(leerPresion(t), { valor: 2.2, de: "kg/cm²" }, t);
  cerca(convertirPresion({ valor: 1, de: "kg/cm²" }).valor, 0.980665 / 0.0689475729);
  assert.equal(texto("2,2 kg/cm2"), "2,2 kg/cm² = 31 psi");
  assert.equal(texto("2 kg/cm²"), "2 kg/cm² = 28 psi");
  for (const t of ["2 kg/cm", "2 kg/m²", "2 g/cm²"]) assert.equal(leerPresion(t), null, t);
  assert.equal(leerOmnibox("2 kg/cm²", { from: "EUR", to: "USD" }), null);
});

test("las atmósferas, a psi", () => {
  for (const t of ["2 atm", "2atm", "2 ATM", "2 atmósferas", "2 atmosferas", "2 atmospheres"]) assert.deepEqual(leerPresion(t), { valor: 2, de: "atm" }, t);
  cerca(convertirPresion({ valor: 1, de: "atm" }).valor, 1.01325 / 0.0689475729);
  assert.equal(texto("1 atm"), "1 atm = 15 psi");
  assert.equal(texto("2,5 atm"), "2,5 atm = 37 psi");
  for (const t of ["2 at", "2 atms", "atm"]) assert.equal(leerPresion(t), null, t);
  assert.equal(leerOmnibox("2 atm", { from: "EUR", to: "USD" }), null);
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("35psi"), "35 psi = 2.4 bar");
    assert.equal(texto("2.5 bar"), "2.5 bar = 36 psi");
  } finally {
    ponerIdioma("es");
  }
});
