const { test } = require("node:test");
const assert = require("node:assert");
const {
  crearGasto, crearPendiente, leerPendientes, leerViajes, pagarPendiente, cambiarVence, pendientesPorFecha, tocaPagar,
  tonoVence, textoVence, tocaPendientes, avisadosPendientes, mensajePendientes, apuntarPendiente,
} = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const pendiente = (id, vence, extra = {}) => ({
  ...crearGasto({ id, from: "JPY", to: "EUR", cantidad: 48000, valor: 300, concepto: "Hotel Kioto", cuando: 1, categoria: "alojamiento", ...extra }),
  ...(vence ? { vence } : {}),
});
const viajes = (...lista) => leerViajes({ activo: lista[0].id, lista: lista.map((v) => ({ gastos: [], ...v })) });
const el = (dia, hora = 12) => new Date(2026, 10, dia, hora);

test("se crea con su día, y el día es opcional", () => {
  const base = { id: "o", from: "JPY", to: "EUR", cantidad: 48000, valor: 300, concepto: "Hotel", cuando: 1 };
  assert.equal(crearPendiente({ ...base, vence: "2026-11-14" }).vence, "2026-11-14");
  assert.equal("vence" in crearPendiente(base), false);
  assert.equal("vence" in crearPendiente({ ...base, vence: "" }), false);
});

test("los de antes siguen valiendo y una fecha rota se ignora", () => {
  assert.equal("vence" in leerPendientes([pendiente("a")])[0], false);
  assert.equal(leerPendientes([pendiente("a", "2026-11-14")])[0].vence, "2026-11-14");
  for (const mala of ["2026-13-45", "2026-02-31", "mañana", 20261114]) {
    const [p] = leerPendientes([{ ...pendiente("a"), vence: mala }]);
    assert.equal("vence" in p, false, String(mala));
  }
});

test("el día se guarda con el viaje y al apuntar otro no se pierde", () => {
  const leidos = viajes({ id: "v", pendientes: [pendiente("h", "2026-11-14")] });
  assert.equal(leidos.lista[0].pendientes[0].vence, "2026-11-14");
  assert.equal(apuntarPendiente(leidos.lista[0].pendientes, pendiente("c"))[0].vence, "2026-11-14");
});

test("al pagarlo el gasto no se lleva la fecha", () => {
  const pagado = pagarPendiente(pendiente("h", "2026-11-14"), { id: "g", cuando: 2, tasa: 1 / 150, comision: 2 });
  assert.equal("vence" in pagado, false);
  assert.equal(pagado.valor, 326.4);
});

test("cambiar el día y quitarlo, sin tocar los demás", () => {
  const lista = [pendiente("a", "2026-11-14"), pendiente("b", "2026-11-20")];
  const movido = cambiarVence(lista, "a", "2026-11-16");
  assert.deepEqual(movido.map((p) => p.vence), ["2026-11-16", "2026-11-20"]);
  const quitado = cambiarVence(lista, "a", "");
  assert.equal("vence" in quitado[0], false);
  assert.equal(quitado[1].vence, "2026-11-20");
});

test("lo que corre más prisa, arriba; sin día, al final", () => {
  const lista = [pendiente("sin"), pendiente("luego", "2026-11-20"), pendiente("antes", "2026-11-09")];
  assert.deepEqual(pendientesPorFecha(lista).map((p) => p.id), ["antes", "luego", "sin"]);
});

test("toca pagar lo de hoy y lo pasado, no lo de mañana", () => {
  const lista = [pendiente("a", "2026-11-08"), pendiente("b", "2026-11-09"), pendiente("c", "2026-11-10"), pendiente("d")];
  assert.deepEqual(tocaPagar(lista, "2026-11-09").map((p) => p.id), ["a", "b"]);
});

test("cómo se dice el día", () => {
  const h = "2026-11-09";
  assert.equal(textoVence("2026-11-05", h), "Era el 5 nov");
  assert.equal(textoVence("2026-11-08", h), "Era ayer");
  assert.equal(textoVence("2026-11-09", h), "Hoy");
  assert.equal(textoVence("2026-11-10", h), "Mañana");
  assert.equal(textoVence("2026-11-15", h), "En 6 días");
  assert.equal(textoVence("2026-11-16", h), "El 16 nov");
  assert.deepEqual(["2026-11-08", h, "2026-11-12", "2026-11-13"].map((v) => tonoVence(v, h)), ["pasado", "hoy", "pronto", "luego"]);
});

test("el aviso sale a partir de las nueve", () => {
  const v = viajes({ id: "j", pendientes: [pendiente("h", "2026-11-09")] });
  assert.equal(tocaPendientes(v, [], el(9, 8)), null);
  assert.deepEqual(tocaPendientes(v, [], el(9, 9)).pagos.map((p) => p.id), ["h"]);
});

test("no avisa antes de tiempo, ni dos veces, ni sin fecha", () => {
  assert.equal(tocaPendientes(viajes({ id: "j", pendientes: [pendiente("h", "2026-11-10")] }), [], el(9)), null);
  assert.equal(tocaPendientes(viajes({ id: "j", pendientes: [pendiente("h")] }), [], el(9)), null);
  assert.equal(tocaPendientes(viajes({ id: "j", pendientes: [pendiente("h", "2026-11-09")] }), ["h:2026-11-09"], el(9)), null);
  assert.equal(tocaPendientes(viajes({ id: "j" }), [], el(9)), null);
  assert.equal(tocaPendientes(undefined, [], el(9)), null);
});

test("si ese día no abriste Chrome, avisa al abrirlo", () => {
  const v = viajes({ id: "j", pendientes: [pendiente("h", "2026-11-05")] });
  assert.equal(tocaPendientes(v, [], el(9)).pagos.length, 1);
});

test("si cambias el día, vuelve a avisar", () => {
  const v = viajes({ id: "j", pendientes: [pendiente("h", "2026-11-09")] });
  assert.equal(tocaPendientes(v, ["h:2026-11-07"], el(9)).pagos.length, 1);
});

test("avisa de un viaje que no es el abierto, y luego del siguiente", () => {
  const v = viajes({ id: "a", pendientes: [] }, { id: "b", pendientes: [pendiente("x", "2026-11-09")] }, { id: "c", pendientes: [pendiente("y", "2026-11-09")] });
  const primero = tocaPendientes(v, [], el(9));
  assert.equal(primero.viaje.id, "b");
  const avisados = avisadosPendientes([], v, primero.pagos);
  assert.equal(tocaPendientes(v, avisados, el(9)).viaje.id, "c");
});

test("lo avisado se olvida cuando ya no está", () => {
  const v = viajes({ id: "j", pendientes: [pendiente("h", "2026-11-09")] });
  assert.deepEqual(avisadosPendientes(["viejo:2026-01-01", "h:2026-11-09"], v, []), ["h:2026-11-09"]);
  assert.deepEqual(avisadosPendientes("nada", v, [pendiente("h", "2026-11-09")]), ["h:2026-11-09"]);
});

test("el mensaje de uno, con lo que vale y dónde", () => {
  const viaje = { nombre: "Japón" };
  assert.deepEqual(mensajePendientes({ viaje, pagos: [pendiente("h", "2026-11-09")] }, "2026-11-09"), {
    titulo: "Hoy toca pagar Hotel Kioto",
    cuerpo: "48.000,00 JPY ≈ 300,00 EUR en Japón",
  });
  assert.equal(mensajePendientes({ viaje, pagos: [pendiente("h", "2026-11-05")] }, "2026-11-09").titulo, "Sin pagar: Hotel Kioto");
  assert.equal(mensajePendientes({ viaje: {}, pagos: [pendiente("h", "2026-11-09")] }, "2026-11-09").cuerpo, "48.000,00 JPY ≈ 300,00 EUR");
  assert.equal(mensajePendientes({ viaje, pagos: [pendiente("h", "2026-11-09", { concepto: "" })] }, "2026-11-09").titulo, "Hoy toca pagar Gasto");
});

test("el mensaje de varios suma, salvo que sean de dos divisas", () => {
  const viaje = { nombre: "Japón" };
  const cena = pendiente("c", "2026-11-09", { concepto: "Cena", valor: 40 });
  const hotel = pendiente("h", "2026-11-09");
  const dos = mensajePendientes({ viaje, pagos: [hotel, cena] }, "2026-11-09");
  assert.equal(dos.titulo, "Tienes 2 pagos que hacer");
  assert.equal(dos.cuerpo, "Hotel Kioto, Cena · 340,00 EUR en Japón");
  const usd = pendiente("u", "2026-11-09", { concepto: "Tour", to: "USD", valor: 50 });
  assert.equal(mensajePendientes({ viaje, pagos: [hotel, usd] }, "2026-11-09").cuerpo, "Hotel Kioto, Tour en Japón");
});

test("en inglés", () => {
  ponerIdioma("en");
  try {
    assert.equal(textoVence("2026-11-10", "2026-11-09"), "Tomorrow");
    assert.equal(mensajePendientes({ viaje: { nombre: "Japan" }, pagos: [pendiente("h", "2026-11-09")] }, "2026-11-09").titulo, "Hotel Kioto is due today");
  } finally {
    ponerIdioma("es");
  }
});
