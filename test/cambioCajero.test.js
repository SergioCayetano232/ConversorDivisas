const { test } = require("node:test");
const assert = require("node:assert");
const {
  crearRetirada, leerRetiradas, cambioDelCajero, sobreElBce, alCambioDelCajero, crearGasto, leerGastos,
  comisionesPagadas, ahorroEnEfectivo, repartirNoches, devolucionDe, cambioDelViaje,
} = require("../logica.js");

// 20.000 yenes que el BCE da por 114 EUR y el banco te cobró 120.
const sacada = (id, cantidad, coste, extra = {}) => crearRetirada({ id, cantidad, divisa: "JPY", cuando: 1, coste, en: "EUR", bce: 0.0057, ...extra });
const gasto = (id, cantidad, pago = "efectivo") => crearGasto({
  id, from: "JPY", to: "EUR", cantidad, valor: cantidad * 0.0057, concepto: "Ramen", cuando: 1, categoria: "comida", pago, comision: 0,
});

test("lo que te cobraron se guarda con la retirada, y sin ponerlo queda como antes", () => {
  assert.deepEqual(sacada("a", 20000, 120.456), { id: "a", cantidad: 20000, divisa: "JPY", cuando: 1, coste: 120.46, en: "EUR", bce: 0.0057 });
  assert.deepEqual(crearRetirada({ id: "a", cantidad: 20000, divisa: "JPY", cuando: 1 }), { id: "a", cantidad: 20000, divisa: "JPY", cuando: 1 });
  // Sin la del BCE se guarda igual: el cambio sirve, solo no sé cuánto se quedó.
  assert.deepEqual(sacada("a", 20000, 120, { bce: null }), { id: "a", cantidad: 20000, divisa: "JPY", cuando: 1, coste: 120, en: "EUR" });
});

test("un coste que no vale se tira y la retirada se queda", () => {
  for (const malo of [{ coste: 0 }, { coste: -5 }, { coste: NaN }, { en: "JPY" }, { en: "XXX" }]) {
    assert.deepEqual(sacada("a", 20000, 120, malo), { id: "a", cantidad: 20000, divisa: "JPY", cuando: 1 });
  }
  assert.deepEqual(leerRetiradas([{ id: "a", cantidad: 20000, divisa: "JPY", cuando: 1, coste: "mucho", en: "EUR" }]),
    [{ id: "a", cantidad: 20000, divisa: "JPY", cuando: 1 }]);
});

test("con dos retiradas, el cambio es la media de lo que te costaron", () => {
  const cajero = [sacada("a", 20000, 120), sacada("b", 10000, 57), crearRetirada({ id: "c", cantidad: 5000, divisa: "JPY", cuando: 1 })];
  const c = cambioDelCajero(cajero, "JPY", "EUR");
  // La de 5.000 no dice lo que costó: no cuenta.
  assert.equal(c.n, 2);
  assert.ok(Math.abs(c.tasa - 177 / 30000) < 1e-12);
  assert.equal(cambioDelCajero(cajero, "JPY", "USD"), null);
  assert.equal(cambioDelCajero(cajero, "KRW", "EUR"), null);
  assert.equal(cambioDelCajero([], "JPY", "EUR"), null);
});

test("cuánto se ha quedado el cajero sobre el BCE", () => {
  assert.ok(Math.abs(sobreElBce(sacada("a", 20000, 120)) - (120 / 114 - 1)) < 1e-12);
  assert.equal(sobreElBce(sacada("a", 20000, 120, { bce: null })), null);
  assert.equal(sobreElBce(crearRetirada({ id: "a", cantidad: 20000, divisa: "JPY", cuando: 1 })), null);
});

test("lo de efectivo va al cambio del cajero y guarda lo que habría sido al BCE", () => {
  const cajero = [sacada("a", 20000, 120)];
  const g = alCambioDelCajero(gasto("g", 3000), cajero);
  assert.equal(g.valor, 18);
  assert.equal(g.alBce, 17.1);
  // Con tarjeta, sin coste apuntado o siendo una devolución, no se toca.
  assert.equal(alCambioDelCajero(gasto("t", 3000, "tarjeta"), cajero).valor, 17.1);
  assert.equal("alBce" in alCambioDelCajero(gasto("s", 3000), [crearRetirada({ id: "a", cantidad: 20000, divisa: "JPY", cuando: 1 })]), false);
  const vuelta = devolucionDe(gasto("x", 3000), { id: "d", cuando: 2 });
  assert.equal(alCambioDelCajero(vuelta, cajero), vuelta);
  assert.equal(alCambioDelCajero(null, cajero), null);
});

test("lo que se queda el cajero cuenta en las comisiones y en el cambio del viaje", () => {
  const cajero = [sacada("a", 20000, 120)];
  const gastos = [alCambioDelCajero(gasto("a", 3000), cajero), alCambioDelCajero(gasto("b", 2000), cajero)];
  // 5.000 yenes: 30 al cambio del cajero y 28,50 al del BCE.
  assert.ok(Math.abs(comisionesPagadas(gastos).total - 1.5) < 1e-9);
  assert.ok(Math.abs(cambioDelViaje(gastos).tasa - 0.006) < 1e-12);
});

test("si el cajero cobró más que la tarjeta, el efectivo no ahorra: cuesta", () => {
  const cajero = [sacada("a", 20000, 120)];
  const gastos = [alCambioDelCajero(gasto("a", 5000), cajero)];
  // Con tarjeta al 1 %: 28,50 + 0,285. En efectivo, 30. Te ha costado 1,215 más.
  assert.ok(Math.abs(ahorroEnEfectivo(gastos, 1).total + 1.215) < 1e-9);
  // Al 6 % la tarjeta sale peor: 1,71 de comisión contra 1,50 del cajero.
  assert.ok(Math.abs(ahorroEnEfectivo(gastos, 6).total - 0.21) < 1e-9);
  // Sin comisión de tarjeta puesta, lo que cobró el cajero es lo que pierdes.
  assert.ok(Math.abs(ahorroEnEfectivo(gastos, 0).total + 1.5) < 1e-9);
});

test("al leerlos se queda lo del BCE, y si viene mal se tira", () => {
  const g = alCambioDelCajero(gasto("a", 3000), [sacada("a", 20000, 120)]);
  assert.equal(leerGastos([g])[0].alBce, 17.1);
  assert.equal("alBce" in leerGastos([{ ...g, alBce: "x" }])[0], false);
  assert.equal("alBce" in leerGastos([{ ...g, alBce: -3 }])[0], false);
  assert.equal("alBce" in leerGastos([gasto("b", 3000)])[0], false);
});

test("repartido por noches, lo del BCE se reparte igual y cuadra", () => {
  const g = alCambioDelCajero({ ...gasto("h", 20000), categoria: "alojamiento" }, [sacada("a", 20000, 120)]);
  const noches = repartirNoches(g, 3);
  assert.equal(noches.reduce((s, n) => s + Math.round(n.alBce * 100), 0), Math.round(g.alBce * 100));
  assert.equal(noches.reduce((s, n) => s + Math.round(n.valor * 100), 0), 12000);
});

test("devolverlo devuelve también lo del cajero: las comisiones vuelven a cero", () => {
  const g = alCambioDelCajero(gasto("a", 3000), [sacada("a", 20000, 120)]);
  const vuelta = devolucionDe(g, { id: "d", cuando: 2 });
  assert.equal(vuelta.valor, -18);
  assert.equal(vuelta.alBce, -17.1);
  assert.equal(comisionesPagadas([g, vuelta]), null);
});
