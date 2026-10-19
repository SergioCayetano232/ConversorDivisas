const { test } = require("node:test");
const assert = require("node:assert");
const { leerVelocidad, convertirVelocidad, textoVelocidad, leerOmnibox, leerDistancia } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoVelocidad(leerVelocidad(t));

test("lee las velocidades como se escriben", () => {
  assert.deepEqual(leerVelocidad("65mph"), { valor: 65, de: "mph" });
  assert.deepEqual(leerVelocidad("65 MPH"), { valor: 65, de: "mph" });
  assert.deepEqual(leerVelocidad("30 millas por hora"), { valor: 30, de: "mph" });
  assert.deepEqual(leerVelocidad("30 miles per hour"), { valor: 30, de: "mph" });
  assert.deepEqual(leerVelocidad("120 km/h"), { valor: 120, de: "km/h" });
  assert.deepEqual(leerVelocidad("120kmh"), { valor: 120, de: "km/h" });
  assert.deepEqual(leerVelocidad("100 kph"), { valor: 100, de: "km/h" });
  assert.deepEqual(leerVelocidad("50 kilómetros por hora"), { valor: 50, de: "km/h" });
  assert.deepEqual(leerVelocidad("7,5 mph"), { valor: 7.5, de: "mph" });
});

test("lo que no son velocidades, no", () => {
  for (const t of ["mph", "65", "65 km", "65 mi", "20 usd", "-5 mph", "", undefined]) assert.equal(leerVelocidad(t), null, String(t));
});

test("no pisa las distancias ni las cantidades", () => {
  assert.ok(leerDistancia("10mi"));
  assert.equal(leerDistancia("65mph"), null);
  assert.equal(leerDistancia("120 km/h"), null);
  assert.equal(leerOmnibox("65mph", { from: "EUR", to: "USD" }), null);
});

test("de millas por hora a km/h y al revés", () => {
  cerca(convertirVelocidad({ valor: 1, de: "mph" }).valor, 1.609344);
  cerca(convertirVelocidad({ valor: 1.609344, de: "km/h" }).valor, 1);
  assert.equal(convertirVelocidad({ valor: 50, de: "km/h" }).a, "mph");
});

test("el texto, con un decimal", () => {
  assert.equal(texto("65mph"), "65 mph = 104,6 km/h");
  assert.equal(texto("120 km/h"), "120 km/h = 74,6 mph");
  assert.equal(textoVelocidad(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("65mph"), "65 mph = 104.6 km/h");
  } finally {
    ponerIdioma("es");
  }
});
