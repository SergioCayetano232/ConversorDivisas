const { test } = require("node:test");
const assert = require("node:assert");
const { urlImpresion, leerImpresion, chuletaParaImprimir } = require("../logica.js");

test("lo que va en la URL se lee igual", () => {
  const url = urlImpresion({ from: "JPY", to: "EUR", rate: 0.00564, comision: 2, fecha: "2026-10-09" });
  assert.ok(url.startsWith("imprimir.html?"));
  assert.deepEqual(leerImpresion(url.split("?")[1]), { from: "JPY", to: "EUR", rate: 0.00564, comision: 2, fecha: "2026-10-09" });
});

test("sin fecha o sin comisión también vale", () => {
  const r = leerImpresion("?from=USD&to=EUR&rate=0.9");
  assert.equal(r.comision, 0);
  assert.equal(r.fecha, null);
});

test("con algo raro en la URL no se pinta nada", () => {
  assert.equal(leerImpresion("from=XXX&to=EUR&rate=1"), null);
  assert.equal(leerImpresion("from=EUR&to=EUR&rate=1"), null);
  assert.equal(leerImpresion("from=USD&to=EUR&rate=0"), null);
  assert.equal(leerImpresion("from=USD&to=EUR&rate=abc"), null);
  assert.equal(leerImpresion("from=USD&to=EUR&rate=0.9&comision=50").comision, 0, "una comisión imposible es cero");
  assert.equal(leerImpresion("from=USD&to=EUR&rate=0.9&fecha=ayer").fecha, null);
});

test("la ida lleva la comisión y la vuelta no, cada una con su escala", () => {
  const { ida, vuelta } = chuletaParaImprimir({ rate: 0.005, comision: 2 });
  assert.equal(ida[0].cantidad, 100, "los yenes empiezan en 100");
  assert.equal(ida[0].valor, 0.51);
  assert.equal(vuelta[0].cantidad, 1);
  assert.equal(vuelta[0].valor, 200);
  assert.equal(vuelta.length, ida.length);
});
