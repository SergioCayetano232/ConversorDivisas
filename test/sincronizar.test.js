const { test } = require("node:test");
const assert = require("node:assert");
const { CLAVES_SYNC, CLAVES_COPIA, limpiarSync, cambiosSync, mezclaInicial } = require("../logica.js");

test("los viajes, los avisos, el par y el historial no salen de este ordenador", () => {
  const datos = limpiarSync({
    viajes: { activo: "j", lista: [] }, avisos: [], lastPair: { from: "EUR", to: "USD" }, historialConversiones: [], comisionBanco: 2,
  });
  assert.deepEqual(datos, { comisionBanco: 2 });
  for (const clave of ["viajes", "avisos", "lastPair", "historialConversiones"]) assert.equal(CLAVES_SYNC.includes(clave), false, clave);
});

test("todo lo que viaja está también en la copia de seguridad", () => {
  for (const clave of CLAVES_SYNC) assert.ok(CLAVES_COPIA.includes(clave), clave);
});

test("lo que llega pasa por los lectores de siempre y lo raro se queda fuera", () => {
  const datos = limpiarSync({
    comisionBanco: 2.5, idioma: "klingon", recordatorioHora: 21, tasaAlReves: "sí", precioCafe: -3,
    paresRecientes: [{ from: "EUR", to: "JPY", fijo: true }, { from: "EUR", to: "EUR" }], divisasExtra: ["USD", "XXX", "USD"],
  });
  assert.deepEqual(datos, {
    comisionBanco: 2.5, divisasExtra: ["USD"], paresRecientes: [{ from: "EUR", to: "JPY", fijo: true }], recordatorioHora: 21,
  });
  assert.deepEqual(limpiarSync(null), {});
  assert.deepEqual(limpiarSync("hola"), {});
});

test("solo se manda lo que es distinto, para que no rebote", () => {
  const local = { comisionBanco: 2, divisasExtra: ["USD", "GBP"], tasaAlReves: true };
  assert.deepEqual(cambiosSync(local, { comisionBanco: 2, divisasExtra: ["USD"], tasaAlReves: true }), { divisasExtra: ["USD", "GBP"] });
  assert.deepEqual(cambiosSync(local, local), {});
  assert.deepEqual(cambiosSync(local, undefined), local);
});

test("un ordenador nuevo coge lo de la nube", () => {
  const { aLocal, aNube } = mezclaInicial({}, { comisionBanco: 2, idioma: "en" });
  assert.deepEqual(aLocal, { comisionBanco: 2, idioma: "en" });
  assert.deepEqual(aNube, {});
});

test("la primera vez, el de siempre sube lo suyo sin perder nada", () => {
  const sueldo = { precio: 15, divisa: "EUR" };
  const { aLocal, aNube } = mezclaInicial({ comisionBanco: 3, sueldoHora: sueldo, viajes: { lista: [] } }, {});
  assert.deepEqual(aLocal, {});
  assert.deepEqual(aNube, { comisionBanco: 3, sueldoHora: sueldo });
});

test("con los dos, manda la nube y sube solo lo que ella no tiene", () => {
  const { aLocal, aNube } = mezclaInicial({ comisionBanco: 3, impuestoVenta: 8.875 }, { comisionBanco: 1, idioma: "es" });
  assert.deepEqual(aLocal, { comisionBanco: 1, idioma: "es" });
  assert.deepEqual(aNube, { impuestoVenta: 8.875 });
});
