const { test } = require("node:test");
const assert = require("node:assert");
const { taxFree, TAX_FREE } = require("../logica.js");

const compra = (id, from, cantidad, valor, extra = {}) => ({
  id, from, to: "EUR", cantidad, valor, concepto: "", cuando: Date.now(), categoria: "compras", pago: "tarjeta", comision: 0, ...extra,
});

test("en Japón cuentan las compras de 5.000 JPY o más", () => {
  const [j] = taxFree([compra("a", "JPY", 11000, 66), compra("b", "JPY", 4000, 24), compra("c", "JPY", 5000, 30)]);
  assert.equal(j.divisa, "JPY");
  assert.equal(j.pasan, 2);
  assert.equal(j.cerca, 1);
  assert.equal(j.total, 16000);
  // 10 % dentro de 16.000 son 1.454,55; de 96 EUR, 8,73.
  assert.equal(j.devolucion, 1454.55);
  assert.deepEqual(j.tuya, { to: "EUR", valor: 8.73 });
});

test("solo las compras: la cena no se devuelve", () => {
  assert.deepEqual(taxFree([compra("a", "JPY", 20000, 120, { categoria: "comida" })]), []);
});

test("sin tax free conocido no sale nada", () => {
  assert.deepEqual(taxFree([compra("a", "USD", 900, 800), compra("b", "GBP", 900, 1000)]), []);
  assert.equal(TAX_FREE.GBP, undefined);
});

test("viviendo en la UE no hay devolución dentro de la UE", () => {
  assert.deepEqual(taxFree([compra("a", "SEK", 3000, 270)]), [], "de EUR a SEK");
  const [s] = taxFree([compra("a", "SEK", 3000, 290, { to: "USD" })]);
  assert.equal(s.pasan, 1, "pasándolo a dólares, sí");
  const [c] = taxFree([compra("a", "CHF", 400, 420)]);
  assert.equal(c.pasan, 1, "Suiza no es de la UE");
});

test("si ninguna llega al mínimo, se cuentan las que se quedan cerca", () => {
  const [j] = taxFree([compra("a", "JPY", 3000, 18)]);
  assert.equal(j.pasan, 0);
  assert.equal(j.cerca, 1);
  assert.equal(j.tuya, null);
});

test("primero el país con más compras que pasan", () => {
  const lista = taxFree([compra("a", "CHF", 100, 105), compra("b", "JPY", 6000, 36), compra("c", "JPY", 7000, 42)]);
  assert.deepEqual(lista.map((d) => d.divisa), ["JPY", "CHF"]);
});
