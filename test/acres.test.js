const { test } = require("node:test");
const assert = require("node:assert");
const { leerAcres, convertirAcres, textoAcres, leerSuperficie } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoAcres(leerAcres(t));

test("lee los acres", () => {
  for (const t of ["2 acres", "2acres", "2 ACRES", "2 acre"]) assert.deepEqual(leerAcres(t), { valor: 2, de: "acres" }, t);
  assert.deepEqual(leerAcres("0,5 acres"), { valor: 0.5, de: "acres" });
});

test("y las hectáreas, para ir al revés", () => {
  for (const t of ["2 ha", "2ha", "2 HA", "2 hectáreas", "2 hectareas", "2 hectares", "1 hectárea"]) assert.equal(leerAcres(t).de, "ha", t);
});

test("lo que no son acres, no", () => {
  for (const t of ["acres", "2", "-1 acre", "2 ac", "2 h", "800sqft", "", undefined]) assert.equal(leerAcres(t), null, String(t));
  assert.equal(leerSuperficie("2 acres"), null);
});

test("un acre son 0,4 hectáreas", () => {
  cerca(convertirAcres({ valor: 1 }).valor, 0.40468564224);
  assert.equal(convertirAcres({ valor: 1 }).a, "ha");
  cerca(convertirAcres({ valor: 0.40468564224, de: "ha" }).valor, 1);
  assert.equal(convertirAcres({ valor: 1, de: "ha" }).a, "acres");
});

test("el texto, con dos decimales y el acre en singular", () => {
  assert.equal(texto("2 acres"), "2 acres = 0,81 ha");
  assert.equal(texto("1 acre"), "1 acre = 0,4 ha");
  assert.equal(texto("100 acres"), "100 acres = 40,47 ha");
  assert.equal(texto("2 ha"), "2 ha = 4,94 acres");
  assert.equal(textoAcres(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2.5 acres"), "2.5 acres = 1.01 ha");
  } finally {
    ponerIdioma("es");
  }
});
