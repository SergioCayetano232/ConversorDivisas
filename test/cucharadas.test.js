const { test } = require("node:test");
const assert = require("node:assert");
const { leerCucharadas, convertirCucharadas, textoCucharadas, leerTazas } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoCucharadas(leerCucharadas(t));

test("lee las cucharadas y las cucharaditas", () => {
  assert.deepEqual(leerCucharadas("2tbsp"), { valor: 2, de: "tbsp" });
  assert.deepEqual(leerCucharadas("2 TBS"), { valor: 2, de: "tbsp" });
  assert.deepEqual(leerCucharadas("1 tablespoon"), { valor: 1, de: "tbsp" });
  assert.deepEqual(leerCucharadas("3 cucharadas"), { valor: 3, de: "tbsp" });
  assert.deepEqual(leerCucharadas("1 tsp"), { valor: 1, de: "tsp" });
  assert.deepEqual(leerCucharadas("0,5 teaspoons"), { valor: 0.5, de: "tsp" });
  assert.deepEqual(leerCucharadas("2 cucharaditas"), { valor: 2, de: "tsp" });
  assert.deepEqual(leerCucharadas("1 cucharadita"), { valor: 1, de: "tsp" });
});

test("lo que no son cucharas, no", () => {
  for (const t of ["tbsp", "2", "-1 tsp", "2 cups", "250ml", "", undefined]) assert.equal(leerCucharadas(t), null, String(t));
  assert.equal(leerTazas("2 tbsp"), null);
});

test("una cucharada son tres cucharaditas", () => {
  cerca(convertirCucharadas({ valor: 1, de: "tbsp" }).valor, 14.78676478125);
  cerca(convertirCucharadas({ valor: 3, de: "tsp" }).valor, 14.78676478125);
  assert.equal(convertirCucharadas({ valor: 1, de: "tsp" }).a, "ml");
});

test("el texto, con un decimal", () => {
  assert.equal(texto("2 tbsp"), "2 tbsp = 29,6 ml");
  assert.equal(texto("1 cucharadita"), "1 tsp = 4,9 ml");
  assert.equal(textoCucharadas(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("0.5 tsp"), "0.5 tsp = 2.5 ml");
  } finally {
    ponerIdioma("es");
  }
});
