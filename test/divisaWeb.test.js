const { test } = require("node:test");
const assert = require("node:assert");
const { divisaDeLaWeb, DOMINIOS, divisaDe, leerSeleccion, buscarPrecios, sumarSeleccion, precioEntero, CURRENCIES } = require("../logica.js");

test("la divisa por el dominio", () => {
  assert.equal(divisaDeLaWeb("https://www.amazon.co.jp/dp/B0"), "JPY");
  assert.equal(divisaDeLaWeb("https://www.amazon.co.uk/"), "GBP");
  assert.equal(divisaDeLaWeb("https://www.amazon.com.mx/x"), "MXN");
  assert.equal(divisaDeLaWeb("https://tienda.mercadolibre.com.ar"), "ARS");
  assert.equal(divisaDeLaWeb("https://www.falabella.com.co/"), "COP");
  assert.equal(divisaDeLaWeb("https://www.zalando.de"), "EUR");
  assert.equal(divisaDeLaWeb("https://WWW.IKEA.SE/"), "SEK");
});

test("los .com y los dominios de todo el mundo no dicen nada", () => {
  assert.equal(divisaDeLaWeb("https://www.amazon.com/"), null);
  assert.equal(divisaDeLaWeb("https://linear.app"), null);
  assert.equal(divisaDeLaWeb("https://angel.co/"), null);
  assert.equal(divisaDeLaWeb("https://github.io"), null);
  assert.equal(divisaDeLaWeb("chrome://extensions"), null);
  assert.equal(divisaDeLaWeb("file:///tmp/a.html"), null);
  assert.equal(divisaDeLaWeb("no es una url"), null);
  assert.equal(divisaDeLaWeb(undefined), null);
});

test("todas las de los dominios son divisas que tengo", () => {
  const codigos = new Set(CURRENCIES.map((c) => c.code));
  for (const [tld, code] of Object.entries(DOMINIOS)) assert.ok(codigos.has(code), tld);
});

test("el $ a secas es de la web si allí se usa el $", () => {
  assert.equal(divisaDe("$1,299"), "USD");
  assert.equal(divisaDe("$1,299", "MXN"), "MXN");
  assert.equal(divisaDe("$49.99", "CAD"), "CAD");
  // En una web en euros el $ sigue siendo de EEUU.
  assert.equal(divisaDe("$49.99", "EUR"), "USD");
  // Lo que ya dice de dónde es no lo toco.
  assert.equal(divisaDe("US$49.99", "MXN"), "USD");
  assert.equal(divisaDe("49.99 USD", "MXN"), "USD");
  assert.equal(divisaDe("C$49.99", "MXN"), "CAD");
});

test("el ¥ es yuan en una web china", () => {
  assert.equal(divisaDe("¥199"), "JPY");
  assert.equal(divisaDe("¥199", "CNY"), "CNY");
  assert.equal(divisaDe("199円", "CNY"), "JPY");
});

test("el ￥ a lo ancho, que es el que usan en Japón", () => {
  assert.equal(divisaDe("￥1,299"), "JPY");
  assert.equal(divisaDe("￥1,299", "CNY"), "CNY");
  assert.deepEqual(buscarPrecios("価格: ￥1,299").map((p) => [p.cantidad, p.divisa]), [[1299, "JPY"]]);
  assert.deepEqual(buscarPrecios("1,299￥").map((p) => p.cantidad), [1299]);
});

test("sin divisa en lo seleccionado, la de la web", () => {
  assert.deepEqual(leerSeleccion("1.299", "JPY"), { cantidad: 1299, divisa: "JPY", deLaWeb: true });
  assert.deepEqual(leerSeleccion("1.299"), { cantidad: 1299, divisa: null });
  assert.deepEqual(leerSeleccion("1.299 €", "JPY"), { cantidad: 1299, divisa: "EUR" });
  assert.deepEqual(leerSeleccion("$1,299", "MXN"), { cantidad: 1299, divisa: "MXN" });
});

test("las pastillas y las sumas también miran la web", () => {
  assert.deepEqual(buscarPrecios("Total: $1,299", "MXN").map((p) => p.divisa), ["MXN"]);
  assert.deepEqual(buscarPrecios("Total: $1,299").map((p) => p.divisa), ["USD"]);
  assert.equal(sumarSeleccion("$10 $20", "AUD").divisa, "AUD");
  assert.deepEqual(precioEntero("$49.99", "NZD"), { cantidad: 49.99, divisa: "NZD" });
});
