const { test } = require("node:test");
const assert = require("node:assert");
const { COPIA_APP, COPIA_VERSION, CLAVES_COPIA, limpiarCopia, crearCopia, leerCopia, resumenCopia } = require("../logica.js");

const gasto = (id) => ({ id, from: "USD", to: "EUR", cantidad: 12, valor: 10, concepto: "", cuando: 1, categoria: "otros", pago: "tarjeta", comision: 0 });
const viajes = {
  activo: "j",
  lista: [
    { id: "j", nombre: "Japón", gastos: [gasto("1"), gasto("2")], presupuesto: null, cajero: [{ id: "r1", cantidad: 20000, divisa: "JPY", cuando: 1 }] },
    { id: "l", nombre: "Lisboa", gastos: [gasto("3")], presupuesto: { importe: 300, to: "EUR", hasta: "2026-11-01" }, cajero: [] },
  ],
};
const aviso = { id: "a", from: "EUR", to: "USD", sentido: "sube", umbral: 1.2 };
const guardado = {
  viajes,
  lastPair: { from: "JPY", to: "EUR" },
  avisos: [aviso],
  comisionBanco: 2,
  cuentaReparto: { propina: 15, personas: 3 },
  idioma: "en",
  insigniaActiva: false,
  rateCache: { USDEUR: { rate: 0.9 } },
  avisarIdioma: true,
};

test("la copia lleva lo tuyo, con su marca y su fecha", () => {
  const copia = crearCopia(guardado, new Date("2026-10-03T10:00:00Z"));
  assert.equal(copia.app, COPIA_APP);
  assert.equal(copia.version, COPIA_VERSION);
  assert.equal(copia.creada, "2026-10-03T10:00:00.000Z");
  assert.deepEqual(copia.datos.viajes, viajes);
  assert.deepEqual(copia.datos.lastPair, { from: "JPY", to: "EUR" });
  assert.deepEqual(copia.datos.avisos, [aviso]);
  assert.equal(copia.datos.comisionBanco, 2);
  assert.deepEqual(copia.datos.cuentaReparto, { propina: 15, personas: 3 });
  assert.equal(copia.datos.idioma, "en");
  assert.equal(copia.datos.insigniaActiva, false);
});

test("la caché de tasas y lo de paso no van en la copia", () => {
  const { datos } = crearCopia(guardado);
  assert.equal("rateCache" in datos, false);
  assert.equal("avisarIdioma" in datos, false);
  for (const clave of Object.keys(datos)) assert.ok(CLAVES_COPIA.includes(clave), clave);
});

test("lo que no tenías no aparece inventado", () => {
  const { datos } = crearCopia({});
  assert.deepEqual(Object.keys(datos), ["viajes"]);
  assert.equal(datos.viajes.lista.length, 1);
});

test("si aún tenías los gastos de antes de los viajes, la copia los lleva dentro del primero", () => {
  const { datos } = crearCopia({ gastosViaje: [gasto("x")] });
  assert.deepEqual(datos.viajes.lista[0].gastos.map((g) => g.id), ["x"]);
  assert.equal("gastosViaje" in datos, false);
});

test("ida y vuelta: lo que se descarga se restaura igual", () => {
  const copia = crearCopia(guardado, new Date("2026-10-03T10:00:00Z"));
  const leida = leerCopia(JSON.stringify(copia));
  assert.deepEqual(leida, { datos: copia.datos, creada: "2026-10-03T10:00:00.000Z" });
});

test("un archivo que no es una copia no se acepta, y dice por qué", () => {
  assert.deepEqual(leerCopia("hola"), { error: "json" });
  assert.deepEqual(leerCopia(""), { error: "json" });
  assert.deepEqual(leerCopia("null"), { error: "otra" });
  assert.deepEqual(leerCopia(JSON.stringify({ app: "OtraCosa", version: 1, datos: {} })), { error: "otra" });
  assert.deepEqual(leerCopia(JSON.stringify({ app: COPIA_APP, version: 1 })), { error: "otra" });
  assert.deepEqual(leerCopia(JSON.stringify({ app: COPIA_APP, version: COPIA_VERSION + 1, datos: {} })), { error: "version" });
  assert.deepEqual(leerCopia(JSON.stringify({ app: COPIA_APP, version: "1", datos: {} })), { error: "version" });
});

test("una copia tocada a mano se limpia como al abrir el popup", () => {
  const leida = leerCopia(JSON.stringify({
    app: COPIA_APP, version: 1, creada: "ayer",
    datos: {
      viajes: { activo: "j", lista: [{ id: "j", nombre: "Japón", gastos: [gasto("1"), { id: "malo" }] }] },
      lastPair: { from: "XXX", to: "EUR" },
      avisos: [aviso, { id: "b" }],
      comisionBanco: 99,
      idioma: "fr",
      insigniaActiva: "sí",
      otraCosa: 1,
    },
  }));
  assert.equal(leida.creada, null);
  assert.deepEqual(leida.datos.viajes.lista[0].gastos.map((g) => g.id), ["1"]);
  assert.equal("lastPair" in leida.datos, false);
  assert.deepEqual(leida.datos.avisos, [aviso]);
  assert.equal(leida.datos.comisionBanco, 0);
  assert.equal("idioma" in leida.datos, false);
  assert.equal("insigniaActiva" in leida.datos, false);
  assert.equal("otraCosa" in leida.datos, false);
});

test("el idioma automático también se guarda", () => {
  assert.equal(limpiarCopia({ idioma: "auto" }).idioma, "auto");
});

test("el resumen cuenta viajes, gastos, avisos y conversiones", () => {
  assert.deepEqual(resumenCopia(crearCopia(guardado).datos), { viajes: 2, gastos: 3, avisos: 1, conversiones: 0 });
  assert.deepEqual(resumenCopia(crearCopia({}).datos), { viajes: 1, gastos: 0, avisos: 0, conversiones: 0 });
});
