const { test } = require("node:test");
const assert = require("node:assert");
const {
  RETIRADAS_MAX, leerRetiradas, crearRetirada, apuntarRetirada, quitarRetirada, efectivoQueda, tonoEfectivo, leerViajes,
} = require("../logica.js");

const retirada = (id, cantidad, divisa = "JPY") => ({ id, cantidad, divisa, cuando: 1 });
const gasto = (id, cantidad, pago, from = "JPY") => ({ id, from, to: "EUR", cantidad, valor: cantidad / 175, concepto: "", cuando: 1, categoria: "otros", pago });

test("sin nada guardado, sin retiradas", () => {
  assert.deepEqual(leerRetiradas(undefined), []);
  assert.deepEqual(leerRetiradas("hola"), []);
});

test("lo guardado malo se descarta", () => {
  const leidas = leerRetiradas([retirada("a", 20000), { id: "b", cantidad: -5, divisa: "JPY", cuando: 1 }, { id: "c", cantidad: 10, divisa: "XXX", cuando: 1 }, null, { ...retirada("d", 5000), otra: 1 }]);
  assert.deepEqual(leidas, [retirada("a", 20000), retirada("d", 5000)]);
});

test("los viajes de antes no traen cajero y salen con la lista vacía", () => {
  const viajes = leerViajes({ activo: "j", lista: [{ id: "j", nombre: "Japón", gastos: [], presupuesto: null }] });
  assert.deepEqual(viajes.lista[0].cajero, []);
});

test("crear una retirada redondea al céntimo y rechaza lo que no vale", () => {
  assert.deepEqual(crearRetirada({ id: "a", cantidad: 100.456, divisa: "USD", cuando: 1 }), { id: "a", cantidad: 100.46, divisa: "USD", cuando: 1 });
  assert.equal(crearRetirada({ id: "a", cantidad: 0, divisa: "USD", cuando: 1 }), null);
  assert.equal(crearRetirada({ id: "a", cantidad: 50, divisa: "PESOS", cuando: 1 }), null);
});

test("apuntar la pone la primera y no pasa del máximo", () => {
  let lista = [];
  for (let i = 0; i < RETIRADAS_MAX + 3; i++) lista = apuntarRetirada(lista, retirada(String(i), 100));
  assert.equal(lista.length, RETIRADAS_MAX);
  assert.equal(lista[0].id, String(RETIRADAS_MAX + 2));
  assert.equal(apuntarRetirada(lista, { id: "malo" }), lista);
});

test("quitar una", () => {
  assert.deepEqual(quitarRetirada([retirada("a", 1), retirada("b", 2)], "a"), [retirada("b", 2)]);
});

test("lo que queda: lo sacado menos lo pagado en efectivo, en yenes", () => {
  const [jpy] = efectivoQueda([retirada("a", 20000), retirada("b", 10000)], [gasto("1", 5000, "efectivo"), gasto("2", 3000, "tarjeta"), gasto("3", 7000, "efectivo")]);
  assert.deepEqual(jpy, { divisa: "JPY", sacado: 30000, gastado: 12000, queda: 18000, fraccion: 0.6 });
});

test("cada divisa por su lado, y solo las que has sacado", () => {
  const cuentas = efectivoQueda([retirada("a", 20000), retirada("b", 100, "USD")], [gasto("1", 30, "efectivo", "USD"), gasto("2", 10, "efectivo", "THB")]);
  assert.deepEqual(cuentas.map((c) => [c.divisa, c.queda]), [["JPY", 20000], ["USD", 70]]);
});

test("sin retiradas no hay nada que contar", () => {
  assert.deepEqual(efectivoQueda([], [gasto("1", 500, "efectivo")]), []);
});

test("el tono: bien, poco por debajo del 20 % y falta si te has pasado", () => {
  const [bien] = efectivoQueda([retirada("a", 10000)], [gasto("1", 5000, "efectivo")]);
  const [poco] = efectivoQueda([retirada("a", 10000)], [gasto("1", 8500, "efectivo")]);
  const [falta] = efectivoQueda([retirada("a", 10000)], [gasto("1", 12000, "efectivo")]);
  assert.equal(tonoEfectivo(bien), "bien");
  assert.equal(tonoEfectivo(poco), "poco");
  assert.equal(tonoEfectivo(falta), "falta");
  assert.equal(falta.fraccion, 0, "la barra no baja de cero");
});
