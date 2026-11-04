const { test } = require("node:test");
const assert = require("node:assert");
const { leerVersta, convertirVersta, textoVersta, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoVersta(leerVersta(t));

test("lee las verstas, también en ruso y sin la ё", () => {
  for (const t of ["5 verst", "5verst", "5 VERSTS", "5 versta", "5 verstas", "5 вёрст", "5 верст", "5 версты", "5 верста", "5 ВЁРСТ"]) assert.deepEqual(leerVersta(t), { valor: 5, de: "verst" }, t);
  assert.equal(leerVersta("2,5 verst").valor, 2.5);
});

test("lo que no son verstas, no", () => {
  for (const t of ["verst", "5", "5 ver", "5 versus", "0 verst", "-5 verst", "", undefined]) assert.equal(leerVersta(t), null, String(t));
  assert.equal(leerOmnibox("5 verst", { from: "EUR", to: "USD" }), null);
});

test("una versta son 1,0668 km", () => {
  cerca(convertirVersta({ valor: 1 }).valor, 1.0668);
  assert.equal(convertirVersta({ valor: 1 }).a, "km");
  assert.equal(texto("5 verst"), "5 versts = 5,3 km");
  assert.equal(texto("1 верста"), "1 verst = 1,1 km");
  assert.equal(textoVersta(null), "");
});

test("en inglés, con el punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2.5 versts"), "2.5 versts = 2.7 km");
  } finally {
    ponerIdioma("es");
  }
});
