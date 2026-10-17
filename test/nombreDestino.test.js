const { test } = require("node:test");
const assert = require("node:assert");
const { nombreDeDestino, NOMBRE_VIAJE_MAX, CURRENCIES } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("el país de la divisa, con su bandera", () => {
  assert.equal(nombreDeDestino("JPY"), "🇯🇵 Japón");
  assert.equal(nombreDeDestino("USD"), "🇺🇸 Estados Unidos");
});

test("Hong Kong, sin lo de la región administrativa", () => {
  assert.equal(nombreDeDestino("HKD"), "🇭🇰 Hong Kong");
});

test("con el euro no hay país que valga", () => {
  assert.equal(nombreDeDestino("EUR"), "");
  assert.equal(nombreDeDestino("XXX"), "");
  assert.equal(nombreDeDestino(undefined), "");
});

test("si ya tienes uno a Japón, el segundo lleva número", () => {
  const lista = [{ nombre: "🇯🇵 Japón" }];
  assert.equal(nombreDeDestino("JPY", lista), "🇯🇵 Japón (2)");
  assert.equal(nombreDeDestino("JPY", [...lista, { nombre: "🇯🇵 Japón (2)" }]), "🇯🇵 Japón (3)");
});

test("todos caben en el nombre de un viaje", () => {
  for (const { code } of CURRENCIES) {
    const nombre = nombreDeDestino(code);
    assert.ok(nombre.length <= NOMBRE_VIAJE_MAX, `${code}: ${nombre}`);
    if (code !== "EUR") assert.ok(nombre.length > 5, `${code}: ${nombre}`);
  }
});

test("en inglés", () => {
  ponerIdioma("en");
  try {
    assert.equal(nombreDeDestino("JPY"), "🇯🇵 Japan");
    assert.equal(nombreDeDestino("HKD"), "🇭🇰 Hong Kong");
  } finally {
    ponerIdioma("es");
  }
});
