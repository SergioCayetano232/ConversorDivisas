const { test } = require("node:test");
const assert = require("node:assert");
const { diasHasta, leerPresupuesto, estadoPresupuesto, diaDelViaje, hastaCuandoLlega } = require("../logica.js");

const gasto = (valor, to = "EUR") => ({ id: String(valor), from: "USD", to, cantidad: valor, valor, concepto: "", cuando: 0 });
const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);

test("los días que quedan cuentan hoy y el último", () => {
  assert.equal(diasHasta("2026-10-02", "2026-10-02"), 1);
  assert.equal(diasHasta("2026-10-06", "2026-10-02"), 5);
  assert.equal(diasHasta("2026-11-01", "2026-10-30"), 3, "pasando de mes");
  assert.equal(diasHasta("2026-10-27", "2026-10-24"), 4, "con el cambio de hora en medio");
  assert.equal(diasHasta("2026-10-01", "2026-10-02"), 0, "ayer ya pasó");
});

test("sin presupuesto guardado no hay presupuesto", () => {
  assert.equal(leerPresupuesto(undefined), null);
  assert.equal(leerPresupuesto({ importe: 0, to: "EUR", hasta: "2026-10-06" }), null);
  assert.equal(leerPresupuesto({ importe: 500, to: "XXX", hasta: "2026-10-06" }), null);
  assert.equal(leerPresupuesto({ importe: 500, to: "EUR", hasta: "mañana" }), null);
});

test("lo guardado bueno se respeta", () => {
  assert.deepEqual(
    leerPresupuesto({ importe: 500, to: "EUR", hasta: "2026-10-06", otra: 1 }),
    { importe: 500, to: "EUR", hasta: "2026-10-06" },
  );
});

test("lo que queda y lo que toca al día", () => {
  const e = estadoPresupuesto({ importe: 500, to: "EUR", hasta: "2026-10-06" }, [gasto(100), gasto(50)], "2026-10-02");
  cerca(e.gastado, 150);
  cerca(e.queda, 350);
  cerca(e.fraccion, 0.3);
  assert.equal(e.dias, 5);
  cerca(e.porDia, 70);
  assert.equal(e.tono, "bien");
});

test("solo cuenta los gastos en la divisa del presupuesto", () => {
  const e = estadoPresupuesto({ importe: 500, to: "EUR", hasta: "2026-10-06" }, [gasto(100), gasto(999, "USD")], "2026-10-02");
  cerca(e.gastado, 100);
});

test("del 80 % en adelante va justo, y pasado del 100 % se nota", () => {
  const p = { importe: 100, to: "EUR", hasta: "2026-10-06" };
  assert.equal(estadoPresupuesto(p, [gasto(79)], "2026-10-02").tono, "bien");
  assert.equal(estadoPresupuesto(p, [gasto(80)], "2026-10-02").tono, "justo");
  assert.equal(estadoPresupuesto(p, [gasto(100)], "2026-10-02").tono, "justo", "justo el 100 % aún no se ha pasado");
  const pasado = estadoPresupuesto(p, [gasto(120)], "2026-10-02");
  assert.equal(pasado.tono, "pasado");
  cerca(pasado.queda, -20);
  assert.equal(pasado.porDia, null, "pasado no hay nada que repartir");
});

test("acabado el viaje no hay reparto por día", () => {
  const e = estadoPresupuesto({ importe: 100, to: "EUR", hasta: "2026-09-30" }, [gasto(10)], "2026-10-02");
  assert.equal(e.dias, 0);
  assert.equal(e.porDia, null);
});

test("sin presupuesto no hay estado", () => {
  assert.equal(estadoPresupuesto(null, []), null);
});

const el = (dia) => new Date(...dia.split("-").map((n, i) => (i === 1 ? n - 1 : Number(n))), 12).getTime();
const viaje = { importe: 700, to: "EUR", hasta: "2026-10-08" };

test("el día del viaje cuenta desde el primer gasto", () => {
  const gastos = [{ ...gasto(10), cuando: el("2026-10-04") }, { ...gasto(20), cuando: el("2026-10-02") }];
  assert.deepEqual(diaDelViaje(viaje, gastos, "2026-10-04"), { dia: 3, total: 7 });
  assert.deepEqual(diaDelViaje(viaje, gastos, "2026-10-08"), { dia: 7, total: 7 }, "el último también cuenta");
});

test("sin gastos el viaje empieza hoy", () => {
  assert.deepEqual(diaDelViaje(viaje, [], "2026-10-06"), { dia: 1, total: 3 });
});

test("acabado el viaje o sin presupuesto, nada", () => {
  assert.equal(diaDelViaje(viaje, [], "2026-10-09"), null);
  assert.equal(diaDelViaje(null, [], "2026-10-06"), null);
});

test("el día de salida se guarda si tiene sentido", () => {
  const p = { importe: 500, to: "EUR", hasta: "2026-10-10" };
  assert.deepEqual(leerPresupuesto({ ...p, desde: "2026-10-04" }), { ...p, desde: "2026-10-04" });
  assert.deepEqual(leerPresupuesto({ ...p, desde: "2026-10-10" }), { ...p, desde: "2026-10-10" }, "un viaje de un día");
  assert.equal(leerPresupuesto({ ...p, desde: "2026-10-11" }), null, "después de volver no se sale");
  assert.equal(leerPresupuesto({ ...p, desde: "ayer" }), null);
});

test("con día de salida, el viaje cuenta desde ahí aunque gastaras antes", () => {
  const conSalida = { ...viaje, desde: "2026-10-03" };
  const gastos = [{ ...gasto(20), cuando: el("2026-09-28") }];
  assert.deepEqual(diaDelViaje(conSalida, gastos, "2026-10-04"), { dia: 2, total: 6 });
});

test("antes de salir no hay día del viaje", () => {
  assert.equal(diaDelViaje({ ...viaje, desde: "2026-10-07" }, [], "2026-10-04"), null);
});

test("antes de salir, lo de al día se reparte entre los días del viaje", () => {
  const p = { importe: 500, to: "EUR", hasta: "2026-10-14", desde: "2026-10-10" };
  const e = estadoPresupuesto(p, [], "2026-10-02");
  assert.equal(e.dias, 5);
  assert.equal(e.porDia, 100);
});

test("a este ritmo, hasta qué día te llega", () => {
  const p = { importe: 1000, to: "EUR", desde: "2026-10-01", hasta: "2026-10-10" };
  // Día 4 con 400 gastados: 100 al día, los 600 que quedan dan para 6 días más.
  assert.equal(hastaCuandoLlega(p, [gasto(400)], "2026-10-04"), null, "justo llega al día 10");
  // Con 500 gastados son 125 al día: los 500 que quedan, 4 días, hasta el 8.
  assert.equal(hastaCuandoLlega(p, [gasto(500)], "2026-10-04"), "2026-10-08");
  // Si no te llega ni para mañana, hasta hoy.
  assert.equal(hastaCuandoLlega(p, [gasto(900)], "2026-10-04"), "2026-10-04");
});

test("el primer día, pasado, fuera del viaje o sin gastar, no se dice", () => {
  const p = { importe: 1000, to: "EUR", desde: "2026-10-01", hasta: "2026-10-10" };
  assert.equal(hastaCuandoLlega(p, [gasto(800)], "2026-10-01"), null, "el primer día");
  assert.equal(hastaCuandoLlega(p, [gasto(1200)], "2026-10-04"), null, "ya pasado");
  assert.equal(hastaCuandoLlega(p, [gasto(500)], "2026-10-12"), null, "acabado el viaje");
  assert.equal(hastaCuandoLlega(p, [], "2026-10-04"), null, "sin gastar");
  assert.equal(hastaCuandoLlega(null, [gasto(500)], "2026-10-04"), null);
});
