const { test } = require("node:test");
const assert = require("node:assert");
const { leerParMotor, convertirParMotor, textoParMotor, leerPeso, leerAltura, leerLibrasYOnzas, leerMillasNauticas, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoParMotor(leerParMotor(t));

test("lee el par, al derecho y al revés", () => {
  for (const t of ["300 lb-ft", "300lb-ft", "300 lb ft", "300 lb·ft", "300 lbft", "300 lbs-ft", "300 ft-lb", "300 ft lbs", "300 ft·lb", "300 pound-feet", "300 foot-pounds", "300 libras-pie"]) assert.deepEqual(leerParMotor(t), { valor: 300, de: "lb-ft" }, t);
});

test("lo que no es par, no; y las libras y los pies siguen a lo suyo", () => {
  for (const t of ["lb-ft", "300", "300 lb", "300 ft", "-1 lb-ft", "", undefined]) assert.equal(leerParMotor(t), null, String(t));
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

test("los Nm, a lb-ft", () => {
  for (const t of ["400 Nm", "400Nm", "400 N·m", "400 N-m", "400 n.m", "400 newton-metros", "400 newton metre"]) assert.deepEqual(leerParMotor(t), { valor: 400, de: "Nm" }, t);
  cerca(convertirParMotor({ valor: 1, de: "Nm" }).valor, 1 / 1.3558179483);
  assert.equal(convertirParMotor({ valor: 1, de: "Nm" }).a, "lb-ft");
  assert.equal(texto("400 Nm"), "400 Nm = 295 lb-ft");
  assert.equal(leerOmnibox("400 Nm", { from: "EUR", to: "USD" }), null);
});

test("los kgf·m, a Nm", () => {
  for (const t of ["40 kgf·m", "40kgfm", "40 kgf-m", "40 kg·m", "40 kgm", "40 KGM", "40 kg-m", "40 kgf m"]) assert.deepEqual(leerParMotor(t), { valor: 40, de: "kgf·m" }, t);
  cerca(convertirParMotor({ valor: 1, de: "kgf·m" }).valor, 9.80665);
  assert.equal(convertirParMotor({ valor: 1, de: "kgf·m" }).a, "Nm");
  assert.equal(texto("40 kgm"), "40 kgf·m = 392 Nm");
  assert.equal(texto("4,5 kgf·m"), "4,5 kgf·m = 44 Nm");
  for (const t of ["40 kg", "40 km", "40 kgf"]) assert.equal(leerParMotor(t), null, t);
  assert.equal(leerPeso("40 kgm"), null);
  assert.equal(leerOmnibox("40 kgm", { from: "EUR", to: "USD" }), null);
});

test("nm y NM siguen siendo millas náuticas", () => {
  for (const t of ["400 nm", "400 NM", "400 nM"]) {
    assert.equal(leerParMotor(t), null, t);
    assert.deepEqual(leerMillasNauticas(t), { valor: 400, de: "nmi" }, t);
  }
  assert.equal(leerMillasNauticas("400 Nm"), null);
});

test("en inglés, con coma de miles", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("1000 lb-ft"), "1,000 lb-ft = 1,356 Nm");
  } finally {
    ponerIdioma("es");
  }
});
