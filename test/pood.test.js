const { test } = require("node:test");
const assert = require("node:assert");
const { leerPood, convertirPood, textoPood, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoPood(leerPood(t));

test("lee los pood, también en ruso", () => {
  for (const t of ["2 pood", "2pood", "2 POOD", "2 poods", "2 pud", "2 пуд", "2 пуда", "2 пудов", "2 ПУДА"]) assert.deepEqual(leerPood(t), { valor: 2, de: "pood" }, t);
  assert.equal(leerPood("1,5 pood").valor, 1.5);
});

test("lo que no son pood, no", () => {
  for (const t of ["pood", "2", "2 poo", "2 pudding", "0 pood", "-2 pood", "", undefined]) assert.equal(leerPood(t), null, String(t));
  assert.equal(leerOmnibox("2 pood", { from: "EUR", to: "USD" }), null);
});

test("un pood son 16,38 kg, pero la pesa es de 16", () => {
  const uno = convertirPood({ valor: 1 });
  cerca(uno.valor, 16.3807);
  cerca(uno.pesa, 16);
  assert.equal(uno.a, "kg");
  assert.equal(texto("2 pood"), "2 pood = 32,8 kg · 🏋️ pesa de 32 kg");
  assert.equal(texto("1,5 пуда"), "1,5 pood = 24,6 kg · 🏋️ pesa de 24 kg");
  assert.equal(textoPood(null), "");
});

test("en inglés, con el punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("1.5 pood"), "1.5 pood = 24.6 kg · 🏋️ 24 kg kettlebell");
  } finally {
    ponerIdioma("es");
  }
});
