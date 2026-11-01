const { test } = require("node:test");
const assert = require("node:assert");
const { leerTalla, convertirTalla, textoTalla, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const texto = (t) => textoTalla(leerTalla(t));

test("lee la talla, con o sin eu y con medias", () => {
  for (const t of ["talla 42", "talla42", "TALLA 42", "talla eu 42", "talla 42 eu", "size 42"]) assert.deepEqual(leerTalla(t), { valor: 42, de: "eu" }, t);
  assert.equal(leerTalla("talla 42,5").valor, 42.5);
  assert.equal(leerTalla("talla 42.5").valor, 42.5);
});

test("lo que no es una talla de adulto, no", () => {
  for (const t of ["talla", "42", "talla 42,3", "talla 34", "talla 51", "talla m", "talla -42", "", undefined]) assert.equal(leerTalla(t), null, String(t));
  assert.equal(leerOmnibox("talla 42", { from: "EUR", to: "USD" }), null);
});

test("cuadra con las tablas de las tiendas", () => {
  assert.deepEqual(convertirTalla({ valor: 42 }), { uk: 8, hombre: 9, mujer: 10.5 });
  assert.deepEqual(convertirTalla({ valor: 38 }), { uk: 5, hombre: 6, mujer: 7.5 });
  assert.deepEqual(convertirTalla({ valor: 45 }), { uk: 10.5, hombre: 11.5, mujer: 13 });
  assert.equal(texto("talla 42"), "Talla 42 = 🇺🇸 9 hombre · 10,5 mujer · 🇬🇧 8");
  assert.equal(texto("talla 42,5"), "Talla 42,5 = 🇺🇸 9,5 hombre · 11 mujer · 🇬🇧 8,5");
  assert.equal(textoTalla(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("size 42.5"), "Size 42.5 = 🇺🇸 9.5 men · 11 women · 🇬🇧 8.5");
  } finally {
    ponerIdioma("es");
  }
});
