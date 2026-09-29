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
  assert.deepEqual(codigos("corona"), ["SEK", "NOK", "DKK", "CZK", "ISK"]);
});

test("da igual la tilde y las mayúsculas", () => {
  const esperado = ["USD", "CAD", "AUD", "HKD", "NZD", "SGD"];
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

test("encuentra las divisas nuevas", () => {
  assert.deepEqual(codigos("rupia"), ["IDR", "INR"]);
  assert.deepEqual(codigos("peso"), ["MXN", "PHP"]);
  assert.deepEqual(codigos("sequel"), ["ILS"]);
  assert.deepEqual(codigos("krw"), ["KRW"]);
});

test("son justo las que publica el BCE, sin repetir", () => {
  // La lista de /v1/currencies de Frankfurter en septiembre de 2026.
  const bce = ["AUD", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "EUR", "GBP", "HKD", "HUF", "IDR",
    "ILS", "INR", "ISK", "JPY", "KRW", "MXN", "MYR", "NOK", "NZD", "PHP", "PLN", "RON", "SEK",
    "SGD", "THB", "TRY", "USD", "ZAR"];
  const nuestras = CURRENCIES.map((c) => c.code);
  assert.equal(new Set(nuestras).size, nuestras.length, "hay alguna repetida");
  assert.deepEqual([...nuestras].sort(), bce);
});

test("las de siempre siguen arriba del todo", () => {
  assert.deepEqual(CURRENCIES.slice(0, 3).map((c) => c.code), ["EUR", "USD", "GBP"]);
});
