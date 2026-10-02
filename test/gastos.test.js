const { test } = require("node:test");
const assert = require("node:assert");
const {
  GASTOS_MAX, CONCEPTO_MAX, crearGasto, leerGastos, apuntarGasto, quitarGasto, sumarPorDivisa, gastosPorDia, nombreDia,
} = require("../logica.js");

const hora = (dia, h = 12) => new Date(...dia.split("-").map((n, i) => (i === 1 ? n - 1 : Number(n))), h).getTime();
const gasto = (extra) => crearGasto({
  id: "a", from: "USD", to: "EUR", cantidad: 45, valor: 38.9, concepto: "Cena", cuando: hora("2026-10-02"), ...extra,
});

test("un gasto bueno se crea tal cual", () => {
  assert.deepEqual(gasto({ categoria: "comida" }), {
    id: "a", from: "USD", to: "EUR", cantidad: 45, valor: 38.9, concepto: "Cena", cuando: hora("2026-10-02"), categoria: "comida",
  });
});

test("sin categoría o con una que no existe, va a otros", () => {
  assert.equal(gasto().categoria, "otros");
  assert.equal(gasto({ categoria: "lujo" }).categoria, "otros");
});

test("el concepto se limpia y se corta", () => {
  assert.equal(gasto({ concepto: "  cena   en   el puerto " }).concepto, "cena en el puerto");
  assert.equal(gasto({ concepto: undefined }).concepto, "");
  assert.equal(gasto({ concepto: "x".repeat(100) }).concepto.length, CONCEPTO_MAX);
});

test("lo que no tiene sentido no se apunta", () => {
  assert.equal(gasto({ cantidad: 0 }), null);
  assert.equal(gasto({ cantidad: null }), null);
  assert.equal(gasto({ valor: NaN }), null);
  assert.equal(gasto({ from: "XXX" }), null);
  assert.equal(gasto({ to: "USD" }), null, "de una divisa a la misma no es un gasto en el extranjero");
  assert.equal(gasto({ id: undefined }), null);
});

test("sin nada guardado no hay gastos", () => {
  assert.deepEqual(leerGastos(undefined), []);
  assert.deepEqual(leerGastos("hola"), []);
});

test("de lo guardado solo me quedo con lo bueno", () => {
  const bueno = gasto();
  assert.deepEqual(leerGastos([bueno, { id: "b", from: "USD" }, null]), [bueno]);
});

test("a los gastos de antes de las categorías les saco una del concepto", () => {
  const { categoria, ...deAntes } = gasto({ categoria: "ocio" });
  assert.equal(leerGastos([deAntes])[0].categoria, "comida", "«Cena»");
  assert.equal(leerGastos([{ ...deAntes, concepto: "cosas" }])[0].categoria, "otros");
  assert.equal(leerGastos([{ ...deAntes, categoria: "ocio" }])[0].categoria, "ocio", "la que traiga se respeta");
});

test("lo último va arriba y no pasa del máximo", () => {
  let lista = [];
  for (let i = 0; i < GASTOS_MAX + 5; i++) lista = apuntarGasto(lista, gasto({ id: String(i) }));
  assert.equal(lista.length, GASTOS_MAX);
  assert.equal(lista[0].id, String(GASTOS_MAX + 4));
});

test("un gasto malo no cambia la lista", () => {
  const lista = [gasto()];
  assert.equal(apuntarGasto(lista, null), lista);
});

test("quitar uno deja los demás", () => {
  const lista = [gasto({ id: "a" }), gasto({ id: "b" })];
  assert.deepEqual(quitarGasto(lista, "a").map((g) => g.id), ["b"]);
});

test("suma por divisa, la que más suma primero", () => {
  const lista = [
    gasto({ id: "1", valor: 10 }),
    gasto({ id: "2", from: "EUR", to: "USD", valor: 50 }),
    gasto({ id: "3", valor: 5.5 }),
  ];
  assert.deepEqual(sumarPorDivisa(lista), [{ to: "USD", total: 50 }, { to: "EUR", total: 15.5 }]);
  assert.deepEqual(sumarPorDivisa([]), []);
});

test("agrupa por día, de lo último a lo primero", () => {
  const lista = [
    gasto({ id: "3", cuando: hora("2026-10-02", 21), valor: 20 }),
    gasto({ id: "2", cuando: hora("2026-10-02", 9), valor: 5 }),
    gasto({ id: "1", cuando: hora("2026-09-30", 13), valor: 12 }),
  ];
  const dias = gastosPorDia(lista);
  assert.deepEqual(dias.map((d) => d.dia), ["2026-10-02", "2026-09-30"]);
  assert.deepEqual(dias[0].gastos.map((g) => g.id), ["3", "2"]);
  assert.deepEqual(dias[0].totales, [{ to: "EUR", total: 25 }]);
});

test("pasada la medianoche es otro día, aunque sea la misma noche", () => {
  const lista = [gasto({ id: "2", cuando: hora("2026-10-02", 0) + 60000 }), gasto({ id: "1", cuando: hora("2026-10-01", 23) })];
  assert.equal(gastosPorDia(lista).length, 2);
});

test("hoy y ayer con nombre; lo de antes, con fecha", () => {
  assert.equal(nombreDia("2026-10-02", "2026-10-02"), "Hoy");
  assert.equal(nombreDia("2026-10-01", "2026-10-02"), "Ayer");
  assert.equal(nombreDia("2026-09-30", "2026-10-01"), "Ayer", "el día antes del 1 es el 30");
  assert.equal(nombreDia("2026-09-28", "2026-10-02"), "28 sept");
});
