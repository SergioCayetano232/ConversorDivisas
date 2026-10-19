const { test } = require("node:test");
const assert = require("node:assert");
const { leerAltura, convertirAltura, textoAltura, leerOmnibox, leerDistancia, leerPeso } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoAltura(leerAltura(t));

test("lee las alturas como se escriben", () => {
  assert.deepEqual(leerAltura("6ft"), { valor: 6, de: "ft" });
  assert.deepEqual(leerAltura("6 feet"), { valor: 6, de: "ft" });
  assert.deepEqual(leerAltura("1 foot"), { valor: 1, de: "ft" });
  assert.deepEqual(leerAltura("10 pies"), { valor: 10, de: "ft" });
  assert.deepEqual(leerAltura("1,80 metros"), { valor: 1.8, de: "m" });
  assert.deepEqual(leerAltura("2 meters"), { valor: 2, de: "m" });
  assert.deepEqual(leerAltura("3 metres"), { valor: 3, de: "m" });
});

test("pies y pulgadas juntos, como se dice allí", () => {
  assert.deepEqual(leerAltura(`5'10"`), { valor: 5 + 10 / 12, de: "ft", pies: 5, pulgadas: 10 });
  assert.deepEqual(leerAltura("5'10"), { valor: 5 + 10 / 12, de: "ft", pies: 5, pulgadas: 10 });
  assert.deepEqual(leerAltura("5' 10''"), { valor: 5 + 10 / 12, de: "ft", pies: 5, pulgadas: 10 });
  assert.deepEqual(leerAltura("5’10”"), { valor: 5 + 10 / 12, de: "ft", pies: 5, pulgadas: 10 });
  assert.deepEqual(leerAltura("5ft 10in"), { valor: 5 + 10 / 12, de: "ft", pies: 5, pulgadas: 10 });
  assert.deepEqual(leerAltura("5 feet 10 inches"), { valor: 5 + 10 / 12, de: "ft", pies: 5, pulgadas: 10 });
  assert.deepEqual(leerAltura("6'0\""), { valor: 6, de: "ft", pies: 6, pulgadas: 0 });
  assert.equal(leerAltura(`5'12"`), null);
  assert.equal(leerAltura(`5'`), null);
});

test("lo que no son alturas, no", () => {
  for (const t of ["ft", "10", "2m", "2 m", "20 usd", "-5 ft", "", undefined]) assert.equal(leerAltura(t), null, String(t));
});

test("no pisa los millones ni las otras medidas", () => {
  assert.ok(leerOmnibox("2m usd", { from: "EUR", to: "USD" }));
  assert.equal(leerAltura("10mi"), null);
  assert.equal(leerDistancia("6ft"), null);
  assert.equal(leerPeso("6ft"), null);
});

test("de pies a metros y al revés", () => {
  cerca(convertirAltura({ valor: 1, de: "ft" }).valor, 0.3048);
  cerca(convertirAltura({ valor: 0.3048, de: "m" }).valor, 1);
  assert.equal(convertirAltura({ valor: 2, de: "m" }).a, "ft");
});

test("el texto: metros con dos decimales, pies con uno", () => {
  assert.equal(texto("6ft"), "6 ft = 1,83 m");
  assert.equal(texto("2 metros"), "2 m = 6,6 ft");
  assert.equal(texto(`5'10"`), "5 ft 10 in = 1,78 m");
  assert.equal(texto(`5'7,5"`), "5 ft 7,5 in = 1,71 m");
  assert.equal(textoAltura(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("6ft"), "6 ft = 1.83 m");
  } finally {
    ponerIdioma("es");
  }
});
