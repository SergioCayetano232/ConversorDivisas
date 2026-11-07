const { test } = require("node:test");
const assert = require("node:assert");
const { tocaTaxFree, mensajeTaxFree, TAX_FREE_HORA, leerViajes } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const compra = (id, cantidad, valor, categoria = "compras") => ({
  id, from: "JPY", to: "EUR", cantidad, valor, concepto: "", cuando: new Date(2026, 10, 3, 12).getTime(), categoria, pago: "tarjeta", comision: 0,
});
// Japón, del 1 al 10 de noviembre, con dos compras que pasan de 5.000 yenes.
const japon = (extra = {}) => ({
  id: "j", nombre: "Japón", personas: 1, color: "oro", cajero: [],
  presupuesto: { importe: 1000, to: "EUR", desde: "2026-11-01", hasta: "2026-11-10" },
  gastos: [compra("a", 11000, 66), compra("b", 5000, 30), compra("c", 2000, 12)],
  ...extra,
});
const viajes = (...lista) => leerViajes({ activo: lista[0].id, lista });
const el = (dia, hora = 12) => new Date(2026, 10, dia, hora);

test("el penúltimo día avisa, con las compras que pasan y lo que te devuelven", () => {
  const aviso = tocaTaxFree(viajes(japon()), {}, el(9));
  assert.equal(aviso.viaje.id, "j");
  assert.equal(aviso.hasta, "2026-11-10");
  assert.equal(aviso.tax.pasan, 2);
  assert.deepEqual(aviso.tax.tuya, { to: "EUR", valor: 8.73 });
});

test("el último día también, por si el penúltimo no abriste Chrome", () => {
  assert.equal(tocaTaxFree(viajes(japon()), {}, el(10)).viaje.id, "j");
});

test("antes, después o de madrugada, nada", () => {
  assert.equal(tocaTaxFree(viajes(japon()), {}, el(8)), null);
  assert.equal(tocaTaxFree(viajes(japon()), {}, el(11)), null);
  assert.equal(tocaTaxFree(viajes(japon()), {}, el(9, TAX_FREE_HORA - 1)), null);
  assert.ok(tocaTaxFree(viajes(japon()), {}, el(9, TAX_FREE_HORA)));
});

test("una vez por viaje; si cambias la vuelta, vuelve a avisar", () => {
  assert.equal(tocaTaxFree(viajes(japon()), { j: "2026-11-10" }, el(9)), null);
  const movido = japon({ presupuesto: { importe: 1000, to: "EUR", desde: "2026-11-01", hasta: "2026-11-12" } });
  assert.equal(tocaTaxFree(viajes(movido), { j: "2026-11-10" }, el(11)).hasta, "2026-11-12");
});

test("sin compras que lleguen al mínimo, sin fecha de vuelta o con solo comida, no avisa", () => {
  assert.equal(tocaTaxFree(viajes(japon({ gastos: [compra("c", 2000, 12)] })), {}, el(9)), null);
  assert.equal(tocaTaxFree(viajes(japon({ gastos: [compra("a", 11000, 66, "comida")] })), {}, el(9)), null);
  assert.equal(tocaTaxFree(viajes(japon({ presupuesto: null })), {}, el(9)), null);
  assert.equal(tocaTaxFree(null, {}, el(9)), null);
});

test("con dos viajes, el que toca; el ya avisado no tapa al otro", () => {
  const lisboa = { id: "l", nombre: "Lisboa", personas: 1, color: "azul", cajero: [], presupuesto: null, gastos: [] };
  assert.equal(tocaTaxFree(viajes(lisboa, japon()), {}, el(9)).viaje.id, "j");
  const otro = japon({ id: "k", nombre: "Osaka" });
  assert.equal(tocaTaxFree(viajes(japon(), otro), { j: "2026-11-10" }, el(9)).viaje.id, "k");
});

test("el mensaje, en los dos idiomas", () => {
  ponerIdioma("es");
  const aviso = tocaTaxFree(viajes(japon()), {}, el(9));
  assert.deepEqual(mensajeTaxFree(aviso), {
    titulo: "🧾 Antes de volar: el tax free",
    cuerpo: "En Japón tienes 2 compras con tax free, unos 8,73 EUR. Lleva los tiques y el pasaporte, y pide el sello en la aduana antes de facturar.",
  });
  const una = tocaTaxFree(viajes(japon({ nombre: "", gastos: [compra("a", 11000, 66)] })), {}, el(9));
  assert.match(mensajeTaxFree(una).cuerpo, /^Tienes una compra con tax free, unos 6,00 EUR/);
  ponerIdioma("en");
  assert.match(mensajeTaxFree(aviso).cuerpo, /^In Japón you have 2 purchases with tax free, about 8\.73 EUR/);
  ponerIdioma("es");
});
