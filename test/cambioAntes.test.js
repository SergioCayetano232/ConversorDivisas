const { test } = require("node:test");
const assert = require("node:assert");
const { cambioAntes, ahorroCambiandoAntes, textoCambioAntes } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const el = (dia) => {
  const [a, m, d] = dia.split("-").map(Number);
  return new Date(a, m - 1, d, 12).getTime();
};
// 160 yenes el euro: cada yen a 0,00625; con un 2 % de comisión encima.
const g = (id, cantidad, dia, extra = {}) => ({
  id, from: "JPY", to: "EUR", cantidad, valor: Math.round(cantidad * 0.00625 * 1.02 * 100) / 100, concepto: "x", cuando: el(dia),
  categoria: "otros", pago: "tarjeta", comision: 2, ...extra,
});
const viaje = { gastos: [g("a", 16000, "2026-10-12"), g("b", 32000, "2026-10-10"), { ...g("c", 50, "2026-10-11"), from: "USD", valor: 45 }] };

test("el mes antes del primer gasto, con la divisa en la que más gastaste", () => {
  assert.deepEqual(cambioAntes(viaje), { from: "JPY", to: "EUR", desde: "2026-09-10", hasta: "2026-10-09" });
});

test("si el presupuesto empieza antes, desde ahí", () => {
  const conFecha = { ...viaje, presupuesto: { importe: 1000, to: "EUR", desde: "2026-10-01", hasta: "2026-10-15" } };
  assert.equal(cambioAntes(conFecha).hasta, "2026-09-30");
});

test("lo que te habrías ahorrado con el mejor día, sin la comisión", () => {
  const serie = [{ fecha: "2026-09-15", valor: 0.0064 }, { fecha: "2026-09-22", valor: 0.006 }, { fecha: "2026-10-01", valor: 0.0062 }];
  const r = ahorroCambiandoAntes(viaje, serie);
  assert.equal(r.dia, "2026-09-22");
  // 48.000 yenes: pagaste 300 €, a 0,006 serían 288.
  assert.ok(Math.abs(r.pagado - 300) < 0.01);
  assert.ok(Math.abs(r.ahorro - 12) < 0.01);
  assert.equal(r.bien, false);
  ponerIdioma("es");
  assert.equal(textoCambioAntes(r).texto, "Cambiando el 22 sept: 12\u00a0EUR menos (4 %)");
  assert.match(textoCambioAntes(r).titulo, /el 22 sept, el mejor día del mes antes de salir, a 1 JPY = 0,006/);
});

test("si el mes antes estaba igual o peor, cambiaste bien", () => {
  const r = ahorroCambiandoAntes(viaje, [{ fecha: "2026-09-15", valor: 0.0064 }, { fecha: "2026-09-20", valor: 0.00624 }]);
  assert.equal(r.bien, true);
  ponerIdioma("es");
  assert.equal(textoCambioAntes(r).texto, "Cambiaste bien: el mes antes no estaba mejor");
});

test("sin serie, sin gastos o solo devoluciones, nada", () => {
  assert.equal(ahorroCambiandoAntes(viaje, []), null);
  assert.equal(ahorroCambiandoAntes(viaje, null), null);
  assert.equal(ahorroCambiandoAntes({ gastos: [] }, [{ fecha: "2026-09-15", valor: 0.006 }]), null);
  assert.equal(cambioAntes({ gastos: [g("x", -100, "2026-10-10")] }), null);
  assert.equal(textoCambioAntes(null), null);
});
