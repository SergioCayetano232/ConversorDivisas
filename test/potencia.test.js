const { test } = require("node:test");
const assert = require("node:assert");
const { leerPotencia, convertirPotencia, textoPotencia, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoPotencia(leerPotencia(t));

test("lee los caballos y los kilovatios", () => {
  for (const t of ["150 hp", "150hp", "150 HP", "150 bhp", "150 horsepower"]) assert.deepEqual(leerPotencia(t), { valor: 150, de: "hp" }, t);
  for (const t of ["110 kW", "110kw", "110 kilovatios", "110 kilowatts"]) assert.deepEqual(leerPotencia(t), { valor: 110, de: "kW" }, t);
  assert.deepEqual(leerPotencia("1 kilovatio"), { valor: 1, de: "kW" });
  for (const t of ["150 cv", "150CV", "150 caballos", "1 caballo"]) assert.equal(leerPotencia(t).de, "CV", t);
});

test("lo que no es potencia, no", () => {
  for (const t of ["hp", "150", "-1 hp", "150 h", "150 km", "", undefined]) assert.equal(leerPotencia(t), null, String(t));
  assert.equal(leerOmnibox("150 hp", { from: "EUR", to: "USD" }), null);
});

test("de hp a kW, con los CV, y al revés", () => {
  const hp = convertirPotencia({ valor: 1, de: "hp" });
  cerca(hp.valor, 0.745699872);
  assert.equal(hp.a, "kW");
  assert.equal(hp.en, "CV");
  assert.ok(hp.otra > 1, "un hp es algo más que un CV");
  const cv = convertirPotencia({ valor: 1, de: "CV" });
  cerca(cv.valor, 0.73549875);
  assert.equal(cv.en, "hp");
  assert.ok(cv.otra < 1);
  cerca(convertirPotencia({ valor: 0.745699872, de: "kW" }).valor, 1);
  assert.equal(convertirPotencia({ valor: 1, de: "kW" }).otra, undefined);
});

test("el texto, sin decimales", () => {
  assert.equal(texto("150 hp"), "150 hp = 112 kW · 152 CV");
  assert.equal(texto("110 kW"), "110 kW = 148 hp");
  assert.equal(texto("150 cv"), "150 CV = 110 kW · 148 hp");
  assert.equal(textoPotencia(null), "");
});

test("los PS alemanes, que son CV", () => {
  for (const t of ["150 PS", "150ps", "150 Ps", "150 pferdestärke", "150 Pferdestaerke"]) assert.deepEqual(leerPotencia(t), { valor: 150, de: "PS" }, t);
  const ps = convertirPotencia({ valor: 1, de: "PS" });
  cerca(ps.valor, 0.73549875);
  assert.equal(ps.en, "hp");
  assert.equal(texto("150 PS"), "150 PS = 110 kW · 148 hp");
  for (const t of ["150 p", "150 pss"]) assert.equal(leerPotencia(t), null, t);
  assert.equal(leerOmnibox("150 ps", { from: "EUR", to: "USD" }), null);
});

test("en inglés, con coma de miles", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("1000 hp"), "1,000 hp = 746 kW · 1,014 CV");
  } finally {
    ponerIdioma("es");
  }
});
