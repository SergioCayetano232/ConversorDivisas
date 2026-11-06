const { test } = require("node:test");
const assert = require("node:assert");
const { crearGasto, repartirNoches, devolucionDe, HORAS_MINIMO, horaFiable, porFranja } = require("../logica.js");

const a = (hora, minuto = 15) => new Date(2026, 10, 3, hora, minuto).getTime();
let n = 0;
const gasto = (cuando, valor, categoria = "comida", extra = {}) => crearGasto({
  id: `g${(n += 1)}`, from: "JPY", to: "EUR", cantidad: valor * 160, valor, concepto: "", cuando, categoria, ...extra,
});

// Un día normal: café por la mañana, comida, unas compras y una cena cara.
const dia = () => [
  gasto(a(8), 4), gasto(a(9), 3, "transporte"), gasto(a(13), 15), gasto(a(14), 2, "transporte"),
  gasto(a(17), 40, "compras"), gasto(a(21), 35), gasto(a(22), 6, "ocio"), gasto(a(2), 10, "transporte"),
];

test("cada franja con lo suyo, y la que más se lleva", () => {
  const r = porFranja(dia());
  assert.equal(r.n, 8);
  assert.equal(r.to, "EUR");
  assert.deepEqual(r.franjas.map((f) => [f.id, f.total, f.n]), [
    ["madrugada", 10, 1], ["manana", 7, 2], ["mediodia", 17, 2], ["tarde", 40, 1], ["noche", 41, 2],
  ]);
  assert.equal(r.mas, "noche");
  assert.equal(r.franjas[4].categoria, "comida");
  assert.equal(Math.round(r.franjas.reduce((s, f) => s + f.fraccion, 0) * 1e9), 1e9);
});

test("las horas justas de cambio caen en la que empieza", () => {
  const r = porFranja([...dia(), gasto(a(20, 0), 1), gasto(a(6, 0), 1)]);
  assert.equal(r.franjas.find((f) => f.id === "noche").n, 3);
  assert.equal(r.franjas.find((f) => f.id === "manana").n, 3);
});

test("con pocos gastos no dice nada", () => {
  assert.equal(porFranja(dia().slice(0, HORAS_MINIMO - 1)), null);
  assert.equal(porFranja([]), null);
});

test("fuera lo que no dice la hora de verdad", () => {
  const cena = gasto(a(21), 30);
  assert.equal(horaFiable(cena), true);
  assert.equal(horaFiable(gasto(a(10), 300, "transporte", { fijo: true })), false, "lo pagado aparte");
  assert.equal(horaFiable(devolucionDe(cena, { id: "d", cuando: a(11) })), false, "las devoluciones");
  assert.ok(repartirNoches(gasto(a(19), 300, "alojamiento"), 3).every((noche) => !horaFiable(noche)), "las noches del hotel");
  assert.equal(horaFiable(gasto(new Date(2026, 10, 3, 12).getTime(), 20)), false, "lo del banco, a las 12 en punto");
  assert.equal(horaFiable(gasto(a(12, 1), 20)), true);
});

test("cuenta la divisa que más suma, como el resto", () => {
  const r = porFranja([...dia(), gasto(a(21), 5, "comida", { to: "USD" })]);
  assert.equal(r.to, "EUR");
  assert.equal(r.n, 8);
});
