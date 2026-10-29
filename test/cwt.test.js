const { test } = require("node:test");
const assert = require("node:assert");
const { leerCwt, convertirCwt, textoCwt, leerPeso, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoCwt(leerCwt(t));

test("lee los hundredweights", () => {
  for (const t of ["2 cwt", "2cwt", "2 CWT", "2 hundredweight", "2 hundredweights"]) assert.deepEqual(leerCwt(t), { valor: 2, de: "cwt" }, t);
  assert.equal(leerCwt("1,5 cwt").valor, 1.5);
});

test("lo que no son cwt, no; y los quintales siguen a lo suyo", () => {
  for (const t of ["cwt", "2", "2 cw", "-1 cwt", "", undefined]) assert.equal(leerCwt(t), null, String(t));
  assert.equal(leerCwt("2 qq"), null);
  assert.equal(leerPeso("2 qq").de, "qq");
  assert.equal(leerOmnibox("2 cwt", { from: "EUR", to: "USD" }), null);
});

test("el americano son 100 lb y el inglés 112", () => {
  cerca(convertirCwt({ valor: 1 }).valor, 45.359237);
  cerca(convertirCwt({ valor: 1 }).inglesa, 50.80234544);
  assert.equal(convertirCwt({ valor: 1 }).a, "kg");
  assert.equal(texto("2 cwt"), "2 cwt = 🇺🇸 90,7 kg · 🇬🇧 101,6 kg");
  assert.equal(textoCwt(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2 cwt"), "2 cwt = 🇺🇸 90.7 kg · 🇬🇧 101.6 kg");
  } finally {
    ponerIdioma("es");
  }
});
