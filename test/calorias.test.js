const { test } = require("node:test");
const assert = require("node:assert");
const { leerCalorias, convertirCalorias, textoCalorias, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoCalorias(leerCalorias(t));

test("lee las calorías y los kilojulios", () => {
  for (const t of ["250 kcal", "250kcal", "250 KCAL", "250 cal", "250 calorías", "250 calorias", "250 Calories"]) assert.deepEqual(leerCalorias(t), { valor: 250, de: "kcal" }, t);
  for (const t of ["1000 kJ", "1000kj", "1000 kilojulios", "1000 kilojoules"]) assert.deepEqual(leerCalorias(t), { valor: 1000, de: "kJ" }, t);
  assert.deepEqual(leerCalorias("1 caloría"), { valor: 1, de: "kcal" });
  assert.deepEqual(leerCalorias("12,5 kcal"), { valor: 12.5, de: "kcal" });
});

test("lo que no son calorías, no", () => {
  for (const t of ["kcal", "250", "-1 kcal", "250 km", "250 kg", "", undefined]) assert.equal(leerCalorias(t), null, String(t));
  assert.equal(leerOmnibox("250 kcal", { from: "EUR", to: "USD" }), null);
});

test("una kilocaloría son 4,184 kJ, y al revés", () => {
  cerca(convertirCalorias({ valor: 1, de: "kcal" }).valor, 4.184);
  cerca(convertirCalorias({ valor: 4.184, de: "kJ" }).valor, 1);
  assert.equal(convertirCalorias({ valor: 1, de: "kcal" }).a, "kJ");
  assert.equal(convertirCalorias({ valor: 1, de: "kJ" }).a, "kcal");
});

test("el texto, sin decimales como en las etiquetas", () => {
  assert.equal(texto("250 kcal"), "250 kcal = 1.046 kJ");
  assert.equal(texto("1000 kJ"), "1.000 kJ = 239 kcal");
  assert.equal(textoCalorias(null), "");
});

test("en inglés, con coma de miles", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("250 calories"), "250 kcal = 1,046 kJ");
  } finally {
    ponerIdioma("es");
  }
});
