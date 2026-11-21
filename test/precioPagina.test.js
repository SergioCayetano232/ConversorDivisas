const { test } = require("node:test");
const assert = require("node:assert");
const { numeroDePrecio, precioDeLaPagina, precioComoTexto, leerSeleccion } = require("../logica.js");

const ld = (o) => JSON.stringify(o);
const producto = (extra = {}) => ({ "@context": "https://schema.org", "@type": "Product", name: "Sony WH-1000XM5", offers: { "@type": "Offer", price: "349.99", priceCurrency: "USD" }, ...extra });

test("el precio del JSON va con punto, pero vale como en la etiqueta", () => {
  assert.equal(numeroDePrecio("1299.00"), 1299);
  assert.equal(numeroDePrecio("12.500"), 12.5);
  assert.equal(numeroDePrecio(349.99), 349.99);
  assert.equal(numeroDePrecio("1.299,00"), 1299);
  assert.equal(numeroDePrecio("$1,049.99"), 1049.99);
  assert.equal(numeroDePrecio("0"), null);
  assert.equal(numeroDePrecio("gratis"), null);
  assert.equal(numeroDePrecio(null), null);
});

test("saca el precio y el nombre del producto", () => {
  assert.deepEqual(precioDeLaPagina({ jsonld: [ld(producto())] }), { cantidad: 349.99, divisa: "USD", nombre: "Sony WH-1000XM5" });
});

test("dentro de un @graph, con las ofertas en lista o con el desde", () => {
  const grafo = { "@graph": [{ "@type": "WebSite", name: "Tienda" }, producto({ offers: [{ price: 84000, priceCurrency: "jpy" }] })] };
  assert.deepEqual(precioDeLaPagina({ jsonld: [ld(grafo)] }), { cantidad: 84000, divisa: "JPY", nombre: "Sony WH-1000XM5" });
  const desde = producto({ offers: { "@type": "AggregateOffer", lowPrice: "299.00", highPrice: "399.00", priceCurrency: "GBP" } });
  assert.equal(precioDeLaPagina({ jsonld: [ld(desde)] }).cantidad, 299);
  const spec = producto({ offers: { priceSpecification: { price: "45.5", priceCurrency: "CHF" } } });
  assert.deepEqual(precioDeLaPagina({ jsonld: [ld(spec)] }).divisa, "CHF");
});

test("con el JSON roto o sin él, las metas", () => {
  const metas = { "product:price:amount": "129.00", "product:price:currency": "EUR" };
  assert.deepEqual(precioDeLaPagina({ jsonld: ["{roto"], metas, titulo: "Zapatillas  Nike   Pegasus | Tienda" }), { cantidad: 129, divisa: "EUR", nombre: "Zapatillas Nike Pegasus | Tienda" });
  assert.equal(precioDeLaPagina({ metas: { "og:price:amount": "59,90", "og:price:currency": "BRL" } }).cantidad, 59.9);
  assert.equal(precioDeLaPagina({ metas: { price: "19.99", pricecurrency: "GBP" } }).divisa, "GBP");
});

test("sin divisa, la de la web; y si tampoco, nada", () => {
  const sin = producto({ offers: { price: "1299" } });
  assert.equal(precioDeLaPagina({ jsonld: [ld(sin)] }, "JPY").divisa, "JPY");
  assert.equal(precioDeLaPagina({ jsonld: [ld(sin)] }), null);
});

test("un listado con precios distintos no es un producto", () => {
  const lista = { "@type": "ItemList", itemListElement: [{ item: producto() }, { item: producto({ name: "Otro", offers: { price: "99", priceCurrency: "USD" } }) }] };
  assert.equal(precioDeLaPagina({ jsonld: [ld(lista)] }), null);
  // Pero si la página dice cuál es el suyo en las metas, ese.
  assert.equal(precioDeLaPagina({ jsonld: [ld(lista)], metas: { "og:price:amount": "349.99", "og:price:currency": "USD" } }).cantidad, 349.99);
  // El mismo producto repetido en dos bloques no es un listado.
  assert.equal(precioDeLaPagina({ jsonld: [ld(producto()), ld(producto())] }).cantidad, 349.99);
});

test("una página sin nada de esto", () => {
  assert.equal(precioDeLaPagina({ jsonld: [ld({ "@type": "Article", name: "Noticia" })], metas: {} }), null);
  assert.equal(precioDeLaPagina({}), null);
  assert.equal(precioDeLaPagina(null), null);
});

test("el nombre largo se corta", () => {
  const largo = producto({ name: "Auriculares inalámbricos con cancelación de ruido y funda de viaje" });
  const { nombre } = precioDeLaPagina({ jsonld: [ld(largo)] });
  assert.equal(nombre.length, 40);
  assert.ok(nombre.endsWith("…"));
});

test("lo que le paso a la tarjeta se vuelve a leer igual", () => {
  for (const precio of [{ cantidad: 1299.5, divisa: "USD" }, { cantidad: 84000, divisa: "JPY" }, { cantidad: 12.5, divisa: "EUR" }]) {
    const leido = leerSeleccion(precioComoTexto(precio));
    assert.equal(leido.divisa, precio.divisa);
    assert.equal(leido.cantidad, precio.cantidad);
  }
});
