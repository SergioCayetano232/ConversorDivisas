const { test } = require("node:test");
const assert = require("node:assert");
const { plegarIcs, eventosDelViaje, calendarioViaje, archivoCalendario } = require("../logica.js");

const presupuesto = { importe: 1500, to: "EUR", desde: "2026-12-01", hasta: "2026-12-10" };
const hotel = {
  id: "p", from: "JPY", to: "EUR", cantidad: 72000, valor: 450, concepto: "Hotel Kioto", cuando: 1,
  categoria: "alojamiento", pago: "tarjeta", comision: 0, vence: "2026-12-08",
};
const viaje = (extra) => ({ id: "j", nombre: "Japón", gastos: [], presupuesto: null, ...extra });
const ahora = Date.UTC(2026, 10, 14, 10, 0, 0);
const lineas = (ics) => ics.split("\r\n");

test("las fechas del viaje, de día entero, con el final al día siguiente", () => {
  const [e] = eventosDelViaje(viaje({ presupuesto }));
  assert.deepEqual([e.desde, e.hasta, e.titulo], ["2026-12-01", "2026-12-10", "✈️ Japón"]);
  const ics = calendarioViaje(viaje({ presupuesto }), { ahora });
  assert.ok(ics.includes("DTSTART;VALUE=DATE:20261201\r\n"));
  assert.ok(ics.includes("DTEND;VALUE=DATE:20261211\r\n"), "el 10 entero: acaba el 11");
  assert.ok(ics.includes("DTSTAMP:20261114T100000Z\r\n"));
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n") && ics.endsWith("END:VCALENDAR\r\n"));
});

test("cada tramo hasta el día antes del siguiente; el último, hasta la vuelta", () => {
  const tramos = [{ id: "t", nombre: "Tokio", desde: "2026-12-01" }, { id: "k", nombre: "Kioto", desde: "2026-12-05" }];
  const [, tokio, kioto] = eventosDelViaje(viaje({ presupuesto, tramos }));
  assert.deepEqual([tokio.desde, tokio.hasta], ["2026-12-01", "2026-12-04"]);
  assert.deepEqual([kioto.desde, kioto.hasta], ["2026-12-05", "2026-12-10"]);
});

test("sin fecha de vuelta, el último tramo es de un día", () => {
  const [kioto] = eventosDelViaje(viaje({ tramos: [{ id: "k", nombre: "Kioto", desde: "2026-12-05" }] }));
  assert.deepEqual([kioto.desde, kioto.hasta], ["2026-12-05", "2026-12-05"]);
});

test("lo pendiente, el día que vence y con aviso a las nueve", () => {
  const ics = calendarioViaje(viaje({ pendientes: [hotel, { ...hotel, id: "q", vence: undefined }] }), { ahora });
  assert.equal((ics.match(/BEGIN:VEVENT/g) ?? []).length, 1, "el que no tiene día no va");
  assert.ok(ics.includes("DTSTART;VALUE=DATE:20261208\r\n"));
  assert.ok(ics.includes("TRIGGER;RELATED=START:PT9H\r\n"));
  assert.ok(ics.includes("SUMMARY:💳 Pagar Hotel Kioto · 72.000\\,00 JPY"));
});

test("las comas, los puntos y comas y los saltos van escapados", () => {
  const ics = calendarioViaje(viaje({ nombre: "Japón, Kioto; 2026\\fin", presupuesto }), { ahora });
  assert.ok(ics.includes("SUMMARY:✈️ Japón\\, Kioto\\; 2026\\\\fin\r\n"));
});

test("el uid es siempre el mismo: importarlo otra vez actualiza en vez de duplicar", () => {
  const a = calendarioViaje(viaje({ presupuesto }), { ahora });
  const b = calendarioViaje(viaje({ presupuesto }), { ahora: ahora + 1000 });
  const uid = (ics) => lineas(ics).find((l) => l.startsWith("UID:"));
  assert.equal(uid(a), "UID:j-viaje@conversordivisas");
  assert.equal(uid(a), uid(b));
});

test("las líneas largas se parten a 75 bytes, sin romper una letra", () => {
  const larga = `SUMMARY:${"ñ".repeat(60)}🇯🇵${"a".repeat(40)}`;
  const partes = plegarIcs(larga).split("\r\n");
  assert.ok(partes.length > 1);
  for (const p of partes) assert.ok(new TextEncoder().encode(p).length <= 75, p);
  assert.ok(partes.slice(1).every((p) => p.startsWith(" ")), "las de después empiezan con espacio");
  assert.equal(partes.map((p, i) => (i ? p.slice(1) : p)).join(""), larga, "juntas son lo mismo");
  assert.equal(plegarIcs("corta"), "corta");
});

test("sin fechas, tramos ni pendientes con día, no hay calendario", () => {
  assert.equal(calendarioViaje(viaje({})), null);
  assert.equal(calendarioViaje(viaje({ pendientes: [{ ...hotel, vence: undefined }] })), null);
  assert.equal(calendarioViaje(null), null);
});

test("el archivo, con el nombre del viaje", () => {
  assert.equal(archivoCalendario("Japón 2026"), "calendario-japon-2026");
  assert.equal(archivoCalendario(""), "calendario-viaje");
});
