const { test } = require("node:test");
const assert = require("node:assert");
const { leerMillasNauticas, convertirMillasNauticas, textoMillasNauticas, leerDistancia, convertirNudos } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoMillasNauticas(leerMillasNauticas(t));

test("lee las millas náuticas", () => {
  for (const t of ["3 nmi", "3nmi", "3 NM", "3 millas náuticas", "3 millas nauticas", "3 nautical miles"]) assert.deepEqual(leerMillasNauticas(t), { valor: 3, de: "nmi" }, t);
  assert.deepEqual(leerMillasNauticas("1 milla náutica"), { valor: 1, de: "nmi" });
  assert.deepEqual(leerMillasNauticas("2,5 nmi"), { valor: 2.5, de: "nmi" });
});

test("lo que no son millas náuticas, no; y las de tierra siguen yendo a las suyas", () => {
  for (const t of ["nmi", "3", "-1 nmi", "3 mi", "3 millas", "", undefined]) assert.equal(leerMillasNauticas(t), null, String(t));
  assert.equal(leerDistancia("3 nmi"), null);
  assert.equal(leerDistancia("3 millas náuticas"), null);
});

test("una milla náutica son 1,852 km, lo que avanza un nudo en una hora", () => {
  cerca(convertirMillasNauticas({ valor: 1 }).valor, 1.852);
  assert.equal(convertirMillasNauticas({ valor: 1 }).a, "km");
  cerca(convertirMillasNauticas({ valor: 7 }).valor, convertirNudos({ valor: 7 }).valor);
});

test("el texto, con un decimal", () => {
  assert.equal(texto("3 nmi"), "3 nmi = 5,6 km");
  assert.equal(texto("2,5 NM"), "2,5 nmi = 4,6 km");
  assert.equal(textoMillasNauticas(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2.5 nautical miles"), "2.5 nmi = 4.6 km");
  } finally {
    ponerIdioma("es");
  }
});
