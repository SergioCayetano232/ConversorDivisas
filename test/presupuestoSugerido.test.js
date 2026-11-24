const { test } = require("node:test");
const assert = require("node:assert");
const { presupuestoSugerido } = require("../logica.js");

const gasto = (dia, valor, to = "EUR", extra = {}) => ({ to, valor, cuando: new Date(`${dia}T12:00`).getTime(), ...extra });

// Cinco gastos en cinco días, y el total que le digas. Del último al primero,
// que es como los guarda la app.
const viaje = (id, total, to = "EUR") => ({
  id,
  gastos: [5, 4, 3, 2, 1].map((d) => gasto(`2026-06-0${d}`, total / 5, to)),
});
const abierto = { id: "abierto", gastos: [] };
const conLista = (...otros) => ({ activo: "abierto", lista: [abierto, ...otros] });

test("lo de tus otros viajes, por los días de este", () => {
  const r = presupuestoSugerido(conLista(viaje("a", 500)), "EUR", 7);
  assert.deepEqual(r, { porDia: 100, dias: 7, importe: 700, to: "EUR", viajes: 1 });
});

test("uno de lujo no infla la cifra: va por la mediana", () => {
  const r = presupuestoSugerido(conLista(viaje("a", 400), viaje("b", 500), viaje("c", 5000)), "EUR", 5);
  assert.equal(r.porDia, 100);
  assert.equal(r.viajes, 3);
});

test("cuentan también los archivados", () => {
  const r = presupuestoSugerido({ ...conLista(), archivados: [viaje("a", 500)] }, "EUR", 2);
  assert.equal(r.importe, 200);
});

test("el viaje abierto no cuenta: es el del presupuesto", () => {
  const viajes = { activo: "a", lista: [viaje("a", 500)] };
  assert.equal(presupuestoSugerido(viajes, "EUR", 5), null);
});

test("solo los de la misma divisa", () => {
  assert.equal(presupuestoSugerido(conLista(viaje("a", 500, "USD")), "EUR", 5), null);
});

test("un viaje con pocos gastos no dice nada", () => {
  const poco = { id: "a", gastos: [gasto("2026-06-04", 50), gasto("2026-06-01", 50)] };
  assert.equal(presupuestoSugerido(conLista(poco), "EUR", 5), null);
});

test("lo pagado aparte no sube lo de al día", () => {
  const conVuelo = viaje("a", 500);
  conVuelo.gastos.push(gasto("2026-05-01", 900, "EUR", { fijo: true }));
  assert.equal(presupuestoSugerido(conLista(conVuelo), "EUR", 1).porDia, 100);
});

test("redondea a dos cifras", () => {
  assert.equal(presupuestoSugerido(conLista(viaje("a", 553)), "EUR", 5).importe, 550);
  assert.equal(presupuestoSugerido(conLista(viaje("a", 12340)), "EUR", 5).importe, 12000);
  assert.equal(presupuestoSugerido(conLista(viaje("a", 87)), "EUR", 5).importe, 87);
});

test("sin días o con las fechas al revés, nada", () => {
  assert.equal(presupuestoSugerido(conLista(viaje("a", 500)), "EUR", 0), null);
  assert.equal(presupuestoSugerido(conLista(viaje("a", 500)), "EUR", -3), null);
});

test("sin otros viajes, nada", () => {
  assert.equal(presupuestoSugerido(conLista(), "EUR", 5), null);
});

// Con la divisa de allí apuntada, a la tasa que le digas.
const viajeA = (id, total, from, tasa) => ({
  id,
  gastos: [5, 4, 3, 2, 1].map((d) => gasto(`2026-06-0${d}`, total / 5, "EUR", { from, cantidad: total / 5 / tasa })),
});

test("ajustado a lo caro que es adónde vas", () => {
  const { nivelFrente } = require("../logica.js");
  const tailandia = viajeA("a", 300, "THB", 0.026);
  const r = presupuestoSugerido(conLista(tailandia), "EUR", 7, { destino: "CHF", tasa: 1.07, idiomas: ["es-ES"] });
  const esperado = (60 / nivelFrente("THB", "EUR", 0.026, ["es-ES"]).nivel) * nivelFrente("CHF", "EUR", 1.07, ["es-ES"]).nivel;
  assert.ok(Math.abs(r.porDia - esperado) < 1e-9);
  assert.ok(r.porDia > 60 * 2.5, "Suiza sale mucho más cara que Tailandia");
  assert.equal(r.alli, "CH");
  assert.equal(r.destino, "CHF");
  assert.equal(r.viajes, 1);
});

test("volver al mismo sitio a la misma tasa da lo mismo que gastaste", () => {
  const r = presupuestoSugerido(conLista(viajeA("a", 500, "JPY", 0.0056)), "EUR", 5, { destino: "JPY", tasa: 0.0056, idiomas: ["es-ES"] });
  assert.ok(Math.abs(r.porDia - 100) < 1e-9);
});

test("un viaje sin divisa de fuera cuenta como en casa", () => {
  const { nivelFrente } = require("../logica.js");
  const r = presupuestoSugerido(conLista(viaje("a", 500)), "EUR", 1, { destino: "USD", tasa: 0.86, idiomas: ["es-ES"] });
  assert.ok(Math.abs(r.porDia - 100 * nivelFrente("USD", "EUR", 0.86, ["es-ES"]).nivel) < 1e-9);
});

test("sin tasa del destino, como antes", () => {
  const r = presupuestoSugerido(conLista(viajeA("a", 500, "THB", 0.026)), "EUR", 5, { destino: "CHF", tasa: null });
  assert.deepEqual(r, { porDia: 100, dias: 5, importe: 500, to: "EUR", viajes: 1 });
});
