const { test } = require("node:test");
const assert = require("node:assert");
const { leerAcrePie, convertirAcrePie, textoAcrePie, leerAcres, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoAcrePie(leerAcrePie(t));

test("lee los acres-pie, con guion o sin él", () => {
  for (const t of ["2 acre-ft", "2acre-ft", "2 ACRE-FT", "2 acre ft", "2 acre-feet", "2 acre-foot", "2 acres-ft", "2 ac-ft"]) assert.deepEqual(leerAcrePie(t), { valor: 2, de: "acre-ft" }, t);
  assert.equal(leerAcrePie("1,5 acre-ft").valor, 1.5);
});

test("lo que no son acres-pie, no, y los acres siguen siendo acres", () => {
  for (const t of ["acre-ft", "2", "2 acres", "2 ft", "-1 acre-ft", "", undefined]) assert.equal(leerAcrePie(t), null, String(t));
  assert.ok(leerAcres("2 acres"));
  assert.equal(leerAcres("2 acre-ft"), null);
  assert.equal(leerOmnibox("1 acre-ft", { from: "EUR", to: "USD" }), null);
});

test("un acre de un pie de hondo, y los hm³ solo si es mucho", () => {
  cerca(convertirAcrePie({ valor: 1 }).valor, 1233.48183754752);
  assert.equal(convertirAcrePie({ valor: 1 }).a, "m³");
  assert.equal(texto("1 acre-ft"), "1 acre-ft = 1.233 m³");
  assert.equal(texto("1000 acre-ft"), "1.000 acre-ft = 1.233.482 m³ · 1,23 hm³");
  assert.equal(textoAcrePie(null), "");
});

test("en inglés, con coma de miles", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2.5 acre-feet"), "2.5 acre-ft = 3,084 m³");
  } finally {
    ponerIdioma("es");
  }
});
