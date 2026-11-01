const { test } = require("node:test");
const assert = require("node:assert");
const { leerMbps, convertirMbps, textoMbps, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const texto = (t) => textoMbps(leerMbps(t));

test("lee los megabits de todas las formas", () => {
  for (const t of ["100 mbps", "100mbps", "100 Mbps", "100 Mbit/s", "100 mbits/s", "100 Mb/s", "100 mb/s"]) assert.deepEqual(leerMbps(t), { valor: 100, de: "mbps" }, t);
  assert.deepEqual(leerMbps("500 kbps"), { valor: 500, de: "kbps" });
  assert.deepEqual(leerMbps("1 Gbps"), { valor: 1, de: "gbps" });
  assert.equal(leerMbps("2,5 gbps").valor, 2.5);
});

test("con la B mayúscula son bytes, y eso no", () => {
  for (const t of ["10 MB/s", "10 KB/s", "100 mb", "100 tbps", "mbps", "-100 mbps", "", undefined]) assert.equal(leerMbps(t), null, String(t));
  assert.equal(leerOmnibox("100 mbps", { from: "EUR", to: "USD" }), null);
});

test("ocho bits por byte, y lo que tarda un GB", () => {
  assert.equal(convertirMbps({ valor: 100, de: "mbps" }).valor, 12.5);
  assert.equal(convertirMbps({ valor: 1, de: "gbps" }).valor, 125);
  assert.equal(convertirMbps({ valor: 100, de: "mbps" }).segundosGb, 80);
  assert.equal(texto("100 mbps"), "100 Mbps = 12,5 MB/s · 1 GB en 1 min 20 s");
  assert.equal(texto("1 gbps"), "1 Gbps = 125 MB/s · 1 GB en 8 s");
  assert.equal(texto("8 mbps"), "8 Mbps = 1 MB/s · 1 GB en 16 min 40 s");
  assert.equal(texto("500 kbps"), "500 kbps = 62,5 kB/s · 1 GB en 4 h 27 min");
  assert.equal(texto("2 mbps"), "2 Mbps = 250 kB/s · 1 GB en 1 h 7 min");
  assert.equal(textoMbps(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("100 mbps"), "100 Mbps = 12.5 MB/s · 1 GB in 1 min 20 s");
  } finally {
    ponerIdioma("es");
  }
});
