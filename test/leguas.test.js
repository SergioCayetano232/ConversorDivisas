const { test } = require("node:test");
const assert = require("node:assert");
const { leerLeguas, convertirLeguas, textoLeguas, leerDistancia, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoLeguas(leerLeguas(t));

test("lee las leguas", () => {
  for (const t of ["3 leguas", "3leguas", "3 legua", "3 LEGUAS", "3 leagues", "3 league"]) assert.deepEqual(leerLeguas(t), { valor: 3, de: "legua" }, t);
  assert.equal(leerLeguas("1,5 leguas").valor, 1.5);
});

test("lo que no son leguas, no", () => {
  for (const t of ["leguas", "3", "3 le", "3 lea", "-1 legua", "", undefined]) assert.equal(leerLeguas(t), null, String(t));
  assert.equal(leerDistancia("3 leguas"), null);
  assert.equal(leerOmnibox("3 leguas", { from: "EUR", to: "USD" }), null);
  assert.equal(leerOmnibox("3 leagues", { from: "EUR", to: "USD" }), null);
});

test("la castellana y la inglesa, las dos", () => {
  const una = convertirLeguas({ valor: 1 });
  cerca(una.valor, 5.5727);
  assert.equal(una.a, "km");
  cerca(una.inglesa, 3 * 1.609344);
  assert.equal(texto("3 leguas"), "3 leguas = 🇪🇸 16,7 km · 🇬🇧 14,5 km");
  assert.equal(texto("1 legua"), "1 legua = 🇪🇸 5,6 km · 🇬🇧 4,8 km");
  assert.equal(textoLeguas(null), "");
});

test("en inglés, leagues y con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("1.5 leagues"), "1.5 leagues = 🇪🇸 8.4 km · 🇬🇧 7.2 km");
    assert.equal(texto("1 league"), "1 league = 🇪🇸 5.6 km · 🇬🇧 4.8 km");
  } finally {
    ponerIdioma("es");
  }
});
