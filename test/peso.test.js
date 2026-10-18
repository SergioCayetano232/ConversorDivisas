const { test } = require("node:test");
const assert = require("node:assert");
const { leerPeso, convertirPeso, textoPeso, leerOmnibox, leerDistancia } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoPeso(leerPeso(t));

test("lee los pesos como se escriben", () => {
  assert.deepEqual(leerPeso("5lb"), { valor: 5, de: "lb" });
  assert.deepEqual(leerPeso("5 lbs"), { valor: 5, de: "lb" });
  assert.deepEqual(leerPeso("23kg"), { valor: 23, de: "kg" });
  assert.deepEqual(leerPeso("2,5 kilos"), { valor: 2.5, de: "kg" });
  assert.deepEqual(leerPeso("1 kilogramo"), { valor: 1, de: "kg" });
  assert.deepEqual(leerPeso("3 KG"), { valor: 3, de: "kg" });
});

test("lo que no son pesos, no", () => {
  for (const t of ["lb", "10", "5 g", "3,99/lb", "20 usd", "-5 kg", "", undefined]) assert.equal(leerPeso(t), null, String(t));
});

test("las libras y los pounds siguen siendo esterlinas", () => {
  assert.equal(leerPeso("5 libras"), null);
  assert.equal(leerPeso("5 pounds"), null);
  assert.equal(leerOmnibox("5 libras", { from: "EUR", to: "USD" }).from, "GBP");
  assert.equal(leerDistancia("5kg"), null);
});

test("de libras a kilos y al revés", () => {
  cerca(convertirPeso({ valor: 1, de: "lb" }).valor, 0.45359237);
  cerca(convertirPeso({ valor: 0.45359237, de: "kg" }).valor, 1);
  assert.equal(convertirPeso({ valor: 5, de: "kg" }).a, "lb");
});

test("el texto, con un decimal", () => {
  assert.equal(texto("50lb"), "50 lb = 22,7 kg");
  assert.equal(texto("23 kg"), "23 kg = 50,7 lb");
  assert.equal(textoPeso(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("50lb"), "50 lb = 22.7 kg");
  } finally {
    ponerIdioma("es");
  }
});
