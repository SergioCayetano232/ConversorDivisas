const { test } = require("node:test");
const assert = require("node:assert");
const { REGATEO, leerRegatear, textoRegatear, CURRENCIES } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("entiende regatear, con precio, con divisa o sin nada", () => {
  assert.deepEqual(leerRegatear("regatear"), { code: null, precio: null });
  assert.deepEqual(leerRegatear(" Regatear 400 "), { code: null, precio: 400 });
  assert.deepEqual(leerRegatear("regateo 1.200 mad"), { code: "MAD", precio: 1200 });
  assert.deepEqual(leerRegatear("haggle thb"), { code: "THB", precio: null });
  assert.equal(leerRegatear("regatear 0"), null);
  assert.equal(leerRegatear("regatear xyz"), null);
  assert.equal(leerRegatear("regatear mucho"), null);
  assert.equal(leerRegatear("20 regatear"), null);
});

test("las de la lista existen y no se repiten", () => {
  const codigos = CURRENCIES.map((c) => c.code);
  const todas = Object.values(REGATEO).flatMap((r) => r.codes);
  assert.equal(new Set(todas).size, todas.length);
  for (const code of todas) assert.ok(codigos.includes(code), code);
});

test("Marruecos, con lo que piden", () => {
  ponerIdioma("es");
  assert.equal(textoRegatear("MAD", 400), "🇲🇦 🤝 Se regatea casi todo, en zocos, tiendas y taxis sin taxímetro · Si piden 400 MAD, empieza por 160-200 y suele quedar en 240-280");
});

test("Tailandia, solo en mercados", () => {
  ponerIdioma("es");
  assert.equal(textoRegatear("THB", 1000), "🇹🇭 🤝 Se regatea en mercados y puestos, no en tiendas con precio · Si piden 1.000 THB, empieza por 600-700 y suele quedar en 750-850");
});

test("por debajo de 20 deja los decimales", () => {
  ponerIdioma("es");
  assert.match(textoRegatear("JOD", 15), /Si piden 15 JOD, empieza por 6-7,5 y suele quedar en 9-10,5/);
});

test("donde no se regatea, el precio no cambia nada", () => {
  ponerIdioma("es");
  assert.equal(textoRegatear("JPY", 5000), "🇯🇵 🤝 No se regatea, el precio es el que pone");
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(textoRegatear("EGP", 500), "🇪🇬 🤝 Haggling is normal almost everywhere: souks, shops and taxis without a meter · If they ask 500 EGP, start at 200-250; it usually ends at 300-350");
  ponerIdioma("es");
});

test("divisa que no conozco, nada", () => {
  assert.equal(textoRegatear("XYZ", 100), "");
});
