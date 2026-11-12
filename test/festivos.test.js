const { test } = require("node:test");
const assert = require("node:assert");
const { FESTIVOS, FESTIVOS_LUNA, pascuaOrtodoxa, fechaFestivo, festivosProximos, leerFestivos, textoFestivos, CURRENCIES, isoLocal } = require("../logica.js");
const { ponerIdioma, tr } = require("../textos.js");

const iso = (d) => isoLocal(d);

test("entiende festivos y holidays, con divisa o sin ella", () => {
  assert.deepEqual(leerFestivos("festivos"), { code: null });
  assert.deepEqual(leerFestivos(" Festivo jpy "), { code: "JPY" });
  assert.deepEqual(leerFestivos("holidays usd"), { code: "USD" });
  assert.deepEqual(leerFestivos("fiestas mxn"), { code: "MXN" });
  assert.equal(leerFestivos("festivos xyz"), null);
  assert.equal(leerFestivos("festivos japón"), null);
  assert.equal(leerFestivos("20 festivos"), null);
  assert.equal(leerFestivos(""), null);
});

test("están las 55 divisas, y todas las claves tienen texto", () => {
  assert.deepEqual(Object.keys(FESTIVOS).sort(), CURRENCIES.map((c) => c.code).sort());
  ponerIdioma("es");
  for (const [code, reglas] of Object.entries(FESTIVOS)) {
    for (const [regla, clave] of reglas) {
      assert.notEqual(tr(`festivos.${clave}`), `festivos.${clave}`, `${code} ${clave}`);
      if (regla.startsWith("L:")) assert.ok(FESTIVOS_LUNA[regla.slice(2)], `${code} ${regla}`);
    }
  }
});

test("la tabla de la luna llega hasta 2028", () => {
  for (const [clave, fechas] of Object.entries(FESTIVOS_LUNA)) {
    assert.deepEqual(fechas.map((f) => f.slice(0, 4)), ["2026", "2027", "2028"], clave);
  }
});

test("la Pascua ortodoxa", () => {
  assert.equal(iso(pascuaOrtodoxa(2026)), "2026-04-12");
  assert.equal(iso(pascuaOrtodoxa(2027)), "2027-05-02");
  assert.equal(iso(pascuaOrtodoxa(2025)), "2025-04-20");
});

test("las reglas de fecha", () => {
  assert.equal(iso(fechaFestivo("12-25", 2026)), "2026-12-25");
  assert.equal(iso(fechaFestivo("P-2", 2026)), "2026-04-03");
  assert.equal(iso(fechaFestivo("O+1", 2026)), "2026-04-13");
  assert.equal(iso(fechaFestivo("11/4/4", 2026)), "2026-11-26");
  assert.equal(iso(fechaFestivo("05/1/-1", 2026)), "2026-05-25");
  assert.equal(iso(fechaFestivo("09/1/1", 2026)), "2026-09-07");
  assert.equal(iso(fechaFestivo("L:fitr", 2027)), "2027-03-09");
  assert.equal(fechaFestivo("L:fitr", 2031), null);
});

test("en diciembre se cuela el Año Nuevo", () => {
  const lista = festivosProximos("GBP", new Date(2026, 11, 10));
  assert.deepEqual(lista.map((f) => f.fecha), ["2026-12-25", "2026-12-26", "2027-01-01"]);
});

test("hoy cuenta, y el día 31 ya no", () => {
  assert.equal(festivosProximos("USD", new Date(2026, 6, 4))[0].fecha, "2026-07-04");
  assert.equal(festivosProximos("USD", new Date(2026, 9, 27))[0].fecha, "2026-11-26");
  assert.deepEqual(festivosProximos("USD", new Date(2026, 9, 26)), []);
});

test("Estados Unidos en noviembre", () => {
  ponerIdioma("es");
  assert.equal(textoFestivos("USD", new Date(2026, 10, 12)), "🇺🇸 📅 Festivos en los próximos 30 días: jue 26 nov Acción de Gracias");
});

test("más de cuatro, y cuántos faltan", () => {
  ponerIdioma("es");
  assert.match(textoFestivos("THB", new Date(2026, 3, 1)), /mié 15 abr Songkran y 1 más$/);
});

test("ninguno, con la nota de Israel", () => {
  ponerIdioma("es");
  assert.equal(textoFestivos("ILS", new Date(2026, 10, 12)), "🇮🇱 📅 Ningún festivo en los próximos 30 días · Y cada sábado, del viernes por la tarde, cierra casi todo");
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(textoFestivos("USD", new Date(2026, 10, 12)), "🇺🇸 📅 Holidays in the next 30 days: Thu Nov 26 Thanksgiving");
  ponerIdioma("es");
});

test("divisa que no conozco, nada", () => {
  assert.equal(textoFestivos("XYZ"), "");
});
