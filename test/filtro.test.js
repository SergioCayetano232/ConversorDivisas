const { test } = require("node:test");
const assert = require("node:assert");
const { filtrarDivisas, normalizar, CURRENCIES, nombreDe } = require("../logica.js");

const codigos = (q) => filtrarDivisas(q).map((c) => c.code);

test("busca por código", () => {
  assert.deepEqual(codigos("mex"), ["MXN"]);
  assert.deepEqual(codigos("usd"), ["USD"]);
  assert.deepEqual(codigos("eur"), ["EUR"]);
});

test("busca por nombre", () => {
  assert.deepEqual(codigos("libra"), ["GBP"]);
  assert.deepEqual(codigos("yen"), ["JPY"]);
  assert.deepEqual(codigos("corona"), ["SEK", "NOK", "DKK"]);
});

test("da igual la tilde y las mayúsculas", () => {
  const esperado = ["USD", "CAD", "AUD"];
  assert.deepEqual(codigos("dolar"), esperado);
  assert.deepEqual(codigos("dólar"), esperado);
  assert.deepEqual(codigos("DOLAR"), esperado);
  assert.deepEqual(codigos("DÓLAR"), esperado);
});

test("el código manda sobre el nombre", () => {
  // Si escribo "c" quiero las que empiezan por c, no todas las que llevan
  // una c suelta en el nombre.
  assert.deepEqual(codigos("c").slice(0, 3), ["CHF", "CAD", "CNY"]);
});

test("sin texto salen todas", () => {
  assert.equal(codigos("").length, CURRENCIES.length);
  assert.equal(codigos("   ").length, CURRENCIES.length);
});

test("si no hay nada devuelve lista vacía", () => {
  assert.deepEqual(codigos("zzz"), []);
});

test("normalizar quita tildes", () => {
  assert.equal(normalizar("Dólar"), "dolar");
  assert.equal(normalizar("YEN JAPONÉS"), "yen japones");
});

test("nombreDe encuentra el nombre, y aguanta lo que no existe", () => {
  assert.equal(nombreDe("EUR"), "Euro");
  assert.equal(nombreDe("XXX"), "XXX");
});
