const { test } = require("node:test");
const assert = require("node:assert");
const { VISTOS_MAX, paginaVista, apuntarVisto, cambioDesdeVisto, textoVisto } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const DIA = 86400000;
const AHORA = Date.UTC(2026, 10, 24, 12);
const URL = "https://www.tienda.com/auriculares-sony?utm_source=x";
// 200 USD a 1,06 el 12 de noviembre: 212 EUR.
const ANTES = { cantidad: 200, from: "USD", to: "EUR", valor: 212 };
const conAntes = () => apuntarVisto({}, URL, ANTES, "2026-11-12", AHORA - 12 * DIA);

test("la misma página aunque cambie la campaña, y en Amazon por el ASIN", () => {
  assert.equal(paginaVista(URL), "tienda.com/auriculares-sony");
  assert.equal(paginaVista("https://tienda.com/auriculares-sony/#fotos"), "tienda.com/auriculares-sony");
  assert.equal(paginaVista("https://www.amazon.de/Sony-WH/dp/b0c33xxs56/ref=sr_1_1?k=sony"), "amazon.de/dp/B0C33XXS56");
  assert.equal(paginaVista("https://www.amazon.de/gp/product/B0C33XXS56"), "amazon.de/dp/B0C33XXS56");
  assert.equal(paginaVista("chrome://extensions"), null);
  assert.equal(paginaVista("no es una url"), null);
});

test("solo el cambio: mismo precio, otra tasa", () => {
  const r = cambioDesdeVisto(conAntes(), URL, { cantidad: 200, from: "USD", to: "EUR", valor: 203 }, "2026-11-24", AHORA);
  assert.equal(r.porTienda, 0);
  assert.equal(Math.round(r.porCambio * 100) / 100, -9);
});

test("la tienda y el cambio, por separado, y suman la diferencia", () => {
  // Ahora 190 USD a 1,015: 192,85 EUR.
  const r = cambioDesdeVisto(conAntes(), URL, { cantidad: 190, from: "USD", to: "EUR", valor: 192.85 }, "2026-11-24", AHORA);
  assert.equal(Math.round(r.porTienda * 100) / 100, -10.15);
  assert.equal(Math.round(r.porCambio * 100) / 100, -9);
  assert.equal(Math.round((r.porTienda + r.porCambio) * 100), Math.round((192.85 - 212) * 100));
});

test("en tu divisa no hay cambio que valga, solo la tienda", () => {
  const v = apuntarVisto({}, URL, { cantidad: 50, from: "EUR", to: "EUR", valor: 50 }, "2026-11-12", AHORA - 12 * DIA);
  const r = cambioDesdeVisto(v, URL, { cantidad: 45, from: "EUR", to: "EUR", valor: 45 }, "2026-11-24", AHORA);
  assert.deepEqual([r.porTienda, r.porCambio], [-5, 0]);
});

test("el mismo día no compara, pero volver dos veces hoy sigue comparando con antes", () => {
  const hoy = { cantidad: 200, from: "USD", to: "EUR", valor: 203 };
  assert.equal(cambioDesdeVisto(apuntarVisto({}, URL, hoy, "2026-11-24", AHORA), URL, hoy, "2026-11-24", AHORA), null);
  const dosVeces = apuntarVisto(conAntes(), URL, hoy, "2026-11-24", AHORA);
  assert.equal(cambioDesdeVisto(dosVeces, URL, hoy, "2026-11-24", AHORA).dia, "2026-11-12");
  const tres = apuntarVisto(dosVeces, URL, hoy, "2026-11-24", AHORA + 1000);
  assert.equal(tres["tienda.com/auriculares-sony"].previo.dia, "2026-11-12");
  assert.equal(tres["tienda.com/auriculares-sony"].previo.previo, undefined);
});

test("otra divisa, otra página o pasado el mes, nada", () => {
  const v = conAntes();
  assert.equal(cambioDesdeVisto(v, URL, { cantidad: 200, from: "USD", to: "GBP", valor: 150 }, "2026-11-24", AHORA), null);
  assert.equal(cambioDesdeVisto(v, "https://tienda.com/otra", { ...ANTES }, "2026-11-24", AHORA), null);
  assert.equal(cambioDesdeVisto(v, URL, { ...ANTES }, "2026-12-20", AHORA + 30 * DIA), null);
  assert.equal(cambioDesdeVisto(null, URL, { ...ANTES }, "2026-11-24", AHORA), null);
});

test("lo viejo se va y no pasa del máximo", () => {
  let v = { "vieja.com/x": { ...ANTES, dia: "2026-09-01", cuando: AHORA - 60 * DIA } };
  for (let i = 0; i < VISTOS_MAX + 20; i++) v = apuntarVisto(v, `https://t.com/p${i}`, ANTES, "2026-11-24", AHORA + i);
  assert.equal(Object.keys(v).length, VISTOS_MAX);
  assert.ok(!("vieja.com/x" in v));
  assert.ok(`t.com/p${VISTOS_MAX + 19}` in v);
  assert.ok(!("t.com/p0" in v));
});

test("lo guardado roto no rompe", () => {
  const roto = { "tienda.com/auriculares-sony": { cantidad: "mucho", dia: 3 } };
  assert.equal(cambioDesdeVisto(roto, URL, ANTES, "2026-11-24", AHORA), null);
  assert.ok(apuntarVisto(roto, URL, ANTES, "2026-11-24", AHORA)["tienda.com/auriculares-sony"].valor === 212);
  assert.deepEqual(apuntarVisto(null, "nada", ANTES, "2026-11-24", AHORA), {});
});

test("los textos, según de dónde venga la diferencia", () => {
  ponerIdioma("es");
  const r = (porTienda, porCambio, hoy) => textoVisto({ dia: "2026-11-12", antes: 212, hoy, porTienda, porCambio, to: "EUR" });
  assert.deepEqual(r(-10.15, -9, 192.85), { tono: "bien", texto: "🕘 El 12 nov eran 212,00 EUR; hoy 192,85: −9,00 por el cambio y −10,15 por la tienda" });
  assert.equal(r(0, 9, 221).texto, "🕘 El 12 nov eran 212,00 EUR; hoy 221,00, todo por el cambio");
  assert.equal(r(0, 9, 221).tono, "caro");
  assert.equal(r(-5, 0, 207).texto, "🕘 El 12 nov eran 212,00 EUR; hoy 207,00, porque la tienda lo ha cambiado");
  assert.deepEqual(r(0, 0, 212), { tono: "normal", texto: "🕘 Igual que el 12 nov: 212,00 EUR" });
  assert.equal(textoVisto(null), null);
  ponerIdioma("en");
  assert.equal(r(0, 9, 221).texto, "🕘 On Nov 12 it was 212.00 EUR; today 221.00, all from the exchange rate");
  ponerIdioma("es");
});
