const { test } = require("node:test");
const assert = require("node:assert");
const { crearGasto, leerGastos, esDevolucion, devolucionDe, sumarPorDivisa, desglose, gastoRaro, pesoDeLosGastos, repartirNoches, efectivoQueda } = require("../logica.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
// 10.000 JPY con un 2 % de comisión: 61,20 EUR, de los que 1,20 son del banco.
const compra = crearGasto({ id: "a", from: "JPY", to: "EUR", cantidad: 10000, valor: 61.2, concepto: "Chaqueta", cuando: 1, categoria: "compras", pago: "tarjeta", comision: 2 });

test("se devuelve entera, en negativo y sin la comisión", () => {
  const d = devolucionDe(compra, { id: "b", cuando: 2 });
  assert.equal(d.cantidad, -10000);
  assert.equal(d.valor, -60);
  assert.equal(d.comision, 0);
  assert.equal(d.categoria, "compras");
  assert.equal(d.concepto, "Chaqueta");
  assert.ok(esDevolucion(d));
  assert.ok(!esDevolucion(compra));
});

test("una devolución no se devuelve", () => {
  assert.equal(devolucionDe(devolucionDe(compra, { id: "b", cuando: 2 }), { id: "c", cuando: 3 }), null);
});

test("se guarda y se lee, pero las cifras van las dos con el mismo signo", () => {
  const d = devolucionDe(compra, { id: "b", cuando: 2 });
  assert.equal(leerGastos([compra, d]).length, 2);
  assert.equal(leerGastos([{ ...d, valor: 60 }]).length, 0);
  assert.equal(leerGastos([{ ...compra, cantidad: 0 }]).length, 0);
});

test("resta del total y de su categoría", () => {
  const cena = crearGasto({ id: "c", from: "JPY", to: "EUR", cantidad: 5000, valor: 30, concepto: "Cena", cuando: 1, categoria: "comida" });
  const gastos = [compra, cena, devolucionDe(compra, { id: "b", cuando: 2 })];
  cerca(sumarPorDivisa(gastos)[0].total, 31.2);
  cerca(desglose(gastos).find((d) => d.categoria === "compras").total, 1.2);
});

test("no cuenta como gasto raro, ni tiene barra, ni se reparte por noches", () => {
  const d = devolucionDe(compra, { id: "b", cuando: 2 });
  assert.equal(gastoRaro([compra, compra, compra], d), null);
  assert.deepEqual(pesoDeLosGastos([compra, d]), [1, 0]);
  assert.deepEqual(repartirNoches(d, 3), [d]);
});

test("en efectivo, lo devuelto vuelve a la cartera", () => {
  const pago = { ...compra, pago: "efectivo", comision: 0, valor: 60 };
  const [cuenta] = efectivoQueda([{ id: "r", cantidad: 20000, divisa: "JPY", cuando: 0 }], [pago, devolucionDe(pago, { id: "b", cuando: 2 })]);
  assert.equal(cuenta.queda, 20000);
});
