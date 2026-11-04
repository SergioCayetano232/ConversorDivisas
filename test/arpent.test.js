const { test } = require("node:test");
const assert = require("node:assert");
const { leerArpent, convertirArpent, textoArpent, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoArpent(leerArpent(t));

test("lee los arpents", () => {
  for (const t of ["10 arpents", "10arpents", "10 ARPENTS", "10 arpent"]) assert.deepEqual(leerArpent(t), { valor: 10, de: "arpent" }, t);
  assert.equal(leerArpent("2,5 arpents").valor, 2.5);
});

test("lo que no son arpents, no", () => {
  for (const t of ["arpent", "10", "10 arp", "10 arpentage", "0 arpents", "-10 arpents", "", undefined]) assert.equal(leerArpent(t), null, String(t));
  assert.equal(leerOmnibox("10 arpents", { from: "EUR", to: "USD" }), null);
});

test("un arpent de Quebec son 3.418,89 m²", () => {
  const uno = convertirArpent({ valor: 1 });
  cerca(uno.valor, 0.341889);
  cerca(uno.acres, 0.341889 / 0.40468564224);
  assert.equal(uno.a, "ha");
  assert.equal(texto("10 arpents"), "10 arpents = 3,42 ha · 8,45 acres");
  assert.equal(texto("1 arpent"), "1 arpent = 0,34 ha · 0,84 acres");
  assert.equal(textoArpent(null), "");
});

test("en inglés, con el punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2.5 arpents"), "2.5 arpents = 0.85 ha · 2.11 acres");
  } finally {
    ponerIdioma("es");
  }
});
