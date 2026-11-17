const { test } = require("node:test");
const assert = require("node:assert");
const { paisIva, compraDeFuera, textoCompraDeFuera } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("el país sale del idioma del navegador", () => {
  assert.equal(paisIva(["es-ES", "en"]), "ES");
  assert.equal(paisIva(["en-US", "de-AT"]), "AT");
  assert.equal(paisIva(["fr"]), "FR");
  // Con país fuera de la UE no adivino por la lengua: es-MX no es España.
  assert.equal(paisIva(["es-MX"]), null);
  assert.equal(paisIva(["en"]), null);
  assert.equal(paisIva(undefined), null);
});

test("el IVA de tu país encima de lo que vale", () => {
  const r = compraDeFuera({ cantidad: 100, from: "USD", to: "EUR" }, 0.9, ["es-ES"]);
  assert.equal(r.pais, "ES");
  assert.equal(r.iva, 18.9);
  assert.equal(r.total, 108.9);
  assert.equal(r.aranceles, false);
  assert.equal(compraDeFuera({ cantidad: 100, from: "USD", to: "EUR" }, 0.9, ["de-DE"]).iva, 17.1);
});

test("pasados 150 € avisa de los aranceles", () => {
  assert.equal(compraDeFuera({ cantidad: 200, from: "USD", to: "EUR" }, 0.9, ["es-ES"]).aranceles, true);
  assert.equal(compraDeFuera({ cantidad: 150, from: "USD", to: "EUR" }, 1, ["es-ES"]).aranceles, false);
});

test("de dentro de la UE, sin el euro o sin país, nada", () => {
  assert.equal(compraDeFuera({ cantidad: 100, from: "PLN", to: "EUR" }, 0.23, ["es-ES"]), null);
  assert.equal(compraDeFuera({ cantidad: 100, from: "USD", to: "GBP" }, 0.79, ["es-ES"]), null);
  assert.equal(compraDeFuera({ cantidad: 100, from: "USD", to: "EUR" }, 0.9, ["en-US"]), null);
  assert.equal(compraDeFuera({ cantidad: 0, from: "USD", to: "EUR" }, 0.9, ["es-ES"]), null);
});

test("los textos", () => {
  ponerIdioma("es");
  const t = textoCompraDeFuera(compraDeFuera({ cantidad: 100, from: "USD", to: "EUR" }, 0.9, ["es-ES"]));
  assert.equal(t.total, "108,90 EUR con el IVA de importación (21 %: 18,90 EUR)");
  assert.match(t.detalle, /^Sin aranceles por debajo de 150 EUR/);
  assert.match(textoCompraDeFuera(compraDeFuera({ cantidad: 200, from: "USD", to: "EUR" }, 0.9, ["fi-FI"])).total, /\(25,5 %: 45,90 EUR\)/);
  assert.equal(textoCompraDeFuera(null), null);
  ponerIdioma("en");
  assert.equal(textoCompraDeFuera(compraDeFuera({ cantidad: 100, from: "USD", to: "EUR" }, 0.9, ["es-ES"])).total, "108.90 EUR with import VAT (21%: 18.90 EUR)");
  ponerIdioma("es");
});
