const { test } = require("node:test");
const assert = require("node:assert");
const { leerParMotor, convertirParMotor, textoParMotor, leerPeso, leerAltura, leerLibrasYOnzas, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoParMotor(leerParMotor(t));

test("lee el par, al derecho y al revés", () => {
  for (const t of ["300 lb-ft", "300lb-ft", "300 lb ft", "300 lb·ft", "300 lbft", "300 lbs-ft", "300 ft-lb", "300 ft lbs", "300 ft·lb", "300 pound-feet", "300 foot-pounds", "300 libras-pie"]) assert.deepEqual(leerParMotor(t), { valor: 300, de: "lb-ft" }, t);
});

test("lo que no es par, no; y las libras y los pies siguen a lo suyo", () => {
  for (const t of ["lb-ft", "300", "300 lb", "300 ft", "300 Nm", "-1 lb-ft", "", undefined]) assert.equal(leerParMotor(t), null, String(t));
  assert.equal(leerPeso("300 lb-ft"), null);
  assert.equal(leerAltura("300 ft-lb"), null);
  assert.equal(leerLibrasYOnzas("300 lb ft"), null);
  assert.equal(leerOmnibox("300 lb-ft", { from: "EUR", to: "USD" }), null);
});

test("300 lb-ft son 407 Nm", () => {
  cerca(convertirParMotor({ valor: 1 }).valor, 1.3558179483);
  assert.equal(convertirParMotor({ valor: 1 }).a, "Nm");
  assert.equal(texto("300 lb-ft"), "300 lb-ft = 407 Nm");
  assert.equal(textoParMotor(null), "");
});

test("en inglés, con coma de miles", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("1000 lb-ft"), "1,000 lb-ft = 1,356 Nm");
  } finally {
    ponerIdioma("es");
  }
});
