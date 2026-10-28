const { test } = require("node:test");
const assert = require("node:assert");
const { leerTherms, convertirTherms, textoTherms, leerBtu, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoTherms(leerTherms(t));

test("lee los therms", () => {
  for (const t of ["50 therm", "50therms", "50 THERMS", "50 thm", "50 termias"]) assert.deepEqual(leerTherms(t), { valor: 50, de: "therm" }, t);
  assert.equal(leerTherms("12,5 therms").valor, 12.5);
});

test("lo que no son therms, no; y los BTU siguen a lo suyo", () => {
  for (const t of ["therm", "50", "50 therma", "-1 therm", "", undefined]) assert.equal(leerTherms(t), null, String(t));
  assert.equal(leerBtu("50 therm"), null);
  assert.equal(leerTherms("12000 btu"), null);
  assert.equal(leerOmnibox("50 therm", { from: "EUR", to: "USD" }), null);
});

test("50 therms son 1.465 kWh", () => {
  cerca(convertirTherms({ valor: 1 }).valor, 29.3071);
  assert.equal(convertirTherms({ valor: 1 }).a, "kWh");
  assert.equal(texto("50 therm"), "50 therm = 1.465 kWh");
  assert.equal(texto("12,5 therms"), "12,5 therm = 366 kWh");
  assert.equal(textoTherms(null), "");
});

test("en inglés, con coma de miles", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("50 therms"), "50 therm = 1,465 kWh");
  } finally {
    ponerIdioma("es");
  }
});
