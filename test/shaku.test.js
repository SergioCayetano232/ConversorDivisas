const { test } = require("node:test");
const assert = require("node:assert");
const { leerShaku, convertirShaku, textoShaku, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoShaku(leerShaku(t));

test("lee los shaku, también con su carácter", () => {
  for (const t of ["6 shaku", "6shaku", "6 SHAKU", "6 尺", "6尺"]) assert.deepEqual(leerShaku(t), { valor: 6, de: "shaku" }, t);
  assert.equal(leerShaku("1,5 shaku").valor, 1.5);
});

test("lo que no son shaku, no", () => {
  for (const t of ["shaku", "6", "6 shakus", "6 sun", "-6 shaku", "", undefined]) assert.equal(leerShaku(t), null, String(t));
  assert.equal(leerOmnibox("6 shaku", { from: "EUR", to: "USD" }), null);
});

test("el japonés son 10/33 m y el chino, un tercio", () => {
  cerca(convertirShaku({ valor: 33 }).valor, 1000);
  cerca(convertirShaku({ valor: 3 }).china, 100);
  assert.equal(convertirShaku({ valor: 1 }).a, "cm");
  assert.equal(texto("1 shaku"), "1 shaku = 🇯🇵 30,3 cm · 🇨🇳 33,3 cm");
  assert.equal(texto("6 shaku"), "6 shaku = 🇯🇵 1,82 m · 🇨🇳 2 m");
  assert.equal(textoShaku(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2.5 shaku"), "2.5 shaku = 🇯🇵 75.8 cm · 🇨🇳 83.3 cm");
  } finally {
    ponerIdioma("es");
  }
});
