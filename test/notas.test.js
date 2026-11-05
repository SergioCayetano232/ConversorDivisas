const { test } = require("node:test");
const assert = require("node:assert");
const { crearGasto, leerGastos, cambiarNota, buscarGastos, repetirGasto, NOTA_MAX } = require("../logica.js");

const gasto = (extra = {}) => crearGasto({
  id: "a", from: "JPY", to: "EUR", cantidad: 4800, valor: 30, concepto: "Taxi", cuando: Date.now(), categoria: "transporte", ...extra,
});

test("la nota solo se guarda si dice algo", () => {
  assert.equal(gasto({ nota: "  pedir   factura " }).nota, "pedir factura");
  assert.equal("nota" in gasto(), false);
  assert.equal("nota" in gasto({ nota: "   " }), false);
  assert.equal(gasto({ nota: "x".repeat(200) }).nota.length, NOTA_MAX);
});

test("las de antes no traen nota y siguen igual", () => {
  const [viejo, roto, bueno] = leerGastos([gasto(), { ...gasto(), id: "b", nota: 5 }, { ...gasto(), id: "c", nota: "pagó Ana" }]);
  assert.equal("nota" in viejo, false);
  assert.equal("nota" in roto, false);
  assert.equal(bueno.nota, "pagó Ana");
});

test("cambiar la nota y quitarla", () => {
  const lista = [gasto(), { ...gasto(), id: "b" }];
  const con = cambiarNota(lista, "a", "pedir factura");
  assert.equal(con[0].nota, "pedir factura");
  assert.equal(con[1], lista[1]);
  assert.equal("nota" in cambiarNota(con, "a", " ")[0], false);
  assert.equal(cambiarNota(con, "a", "pedir factura "), con, "si no cambia, la misma lista");
  assert.equal(cambiarNota(lista, "zz", "x"), lista);
});

test("la lupa también busca en la nota", () => {
  const lista = [gasto({ nota: "Pedir factura" }), gasto({ id: "b", concepto: "Cena" })];
  assert.deepEqual(buscarGastos(lista, "factura").map((g) => g.id), ["a"]);
  assert.deepEqual(buscarGastos(lista, "taxi factura").map((g) => g.id), ["a"]);
});

test("volver a apuntarlo hoy no se lleva la nota, que era de aquel", () => {
  assert.equal("nota" in repetirGasto(gasto({ nota: "pedir factura" }), { id: "c", cuando: Date.now(), tasa: 0.006 }), false);
});
