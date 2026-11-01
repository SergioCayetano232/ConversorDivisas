const { test } = require("node:test");
const assert = require("node:assert");
const { leerGlucosa, convertirGlucosa, textoGlucosa, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const texto = (t) => textoGlucosa(leerGlucosa(t));

test("lee mg/dL y mmol/L, con espacios o sin ellos", () => {
  for (const t of ["120 mg/dl", "120mg/dL", "120 MG/DL", "120 mg / dl"]) assert.deepEqual(leerGlucosa(t), { valor: 120, de: "mg/dL" }, t);
  for (const t of ["6,7 mmol/l", "6.7 mmol/L", "6,7 mmol", "6,7mmol/l"]) assert.deepEqual(leerGlucosa(t), { valor: 6.7, de: "mmol/L" }, t);
});

test("lo que no es glucosa, no", () => {
  for (const t of ["120 mg", "120 dl", "120 mmol/dl", "mg/dl", "-120 mg/dl", "", undefined]) assert.equal(leerGlucosa(t), null, String(t));
  assert.equal(leerOmnibox("120 mg/dl", { from: "EUR", to: "USD" }), null);
});

test("entre 18, y al revés por 18", () => {
  assert.equal(convertirGlucosa({ valor: 126, de: "mg/dL" }).valor, 7);
  assert.equal(convertirGlucosa({ valor: 7, de: "mmol/L" }).valor, 126);
  assert.equal(texto("120 mg/dl"), "120 mg/dL = 6,7 mmol/L (glucosa)");
  assert.equal(texto("6,7 mmol/l"), "6,7 mmol/L = 121 mg/dL (glucosa)");
  assert.equal(textoGlucosa(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("5.5 mmol/l"), "5.5 mmol/L = 99 mg/dL (glucose)");
  } finally {
    ponerIdioma("es");
  }
});
