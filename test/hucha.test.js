const { test } = require("node:test");
const assert = require("node:assert");
const { huchaViaje } = require("../logica.js");

const presupuesto = (desde, importe = 1000) => ({ importe, to: "EUR", desde, hasta: "2026-12-20" });
const gasto = (id, valor, to = "EUR") => ({ id, from: "JPY", to, cantidad: valor * 160, valor, concepto: "Vuelo", cuando: 1, categoria: "transporte", fijo: true });

test("1.000 en cuatro semanas: 250 a la semana", () => {
  // Del 7 al 5 de diciembre hay 28 días.
  assert.deepEqual(huchaViaje(presupuesto("2026-12-05"), [], "2026-11-07"), { falta: 1000, to: "EUR", semanas: 4, porSemana: 250 });
});

test("lo ya pagado, como el vuelo, no hay que ahorrarlo", () => {
  const h = huchaViaje(presupuesto("2026-12-05"), [gasto("v", 400), gasto("u", 50, "USD")], "2026-11-07");
  assert.equal(h.falta, 600);
  assert.equal(h.porSemana, 150);
});

test("las semanas que no llegan a enteras no cuentan, y se redondea hacia arriba", () => {
  // 31 días son 4 semanas y 3 días: 1.000 entre 4, no entre 4,4.
  assert.equal(huchaViaje(presupuesto("2026-12-08"), [], "2026-11-07").semanas, 4);
  // 1.000 entre 3 son 333,33: 334, que no se quede corto.
  assert.equal(huchaViaje(presupuesto("2026-11-28"), [], "2026-11-07").porSemana, 334);
});

test("con menos de una semana, lo que falta de una vez", () => {
  assert.deepEqual(huchaViaje(presupuesto("2026-11-12"), [gasto("v", 300.4)], "2026-11-07"), { falta: 699.6, to: "EUR", semanas: 0, porSemana: 700 });
});

test("ya de viaje, sin fecha de salida, o con todo pagado, no hay hucha", () => {
  assert.equal(huchaViaje(presupuesto("2026-11-07"), [], "2026-11-07"), null);
  assert.equal(huchaViaje(presupuesto("2026-11-01"), [], "2026-11-07"), null);
  assert.equal(huchaViaje({ importe: 1000, to: "EUR", hasta: "2026-12-20" }, [], "2026-11-07"), null);
  assert.equal(huchaViaje(null, [], "2026-11-07"), null);
  assert.equal(huchaViaje(presupuesto("2026-12-05"), [gasto("v", 1000)], "2026-11-07"), null);
});
