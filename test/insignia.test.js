const { test } = require("node:test");
const assert = require("node:assert");
const { textoInsignia, cambioDiario, sentidoDe, tituloInsignia: titulo, cambioDelDia, textoCambioDia } = require("../logica.js");

test("tasas normales con dos decimales", () => {
  assert.equal(textoInsignia(1.1355), "1,14");
  assert.equal(textoInsignia(0.85718), "0,86");
  assert.equal(textoInsignia(1), "1,00");
});

test("según crece la tasa pierde decimales", () => {
  assert.equal(textoInsignia(20.3222), "20,3");
  assert.equal(textoInsignia(178.41), "178");
  assert.equal(textoInsignia(1536.74), "1537");
  assert.equal(textoInsignia(20350.09), "20k");
  assert.equal(textoInsignia(1234567), "1M");
  assert.equal(textoInsignia(999499), "999k");
  assert.equal(textoInsignia(999999), "1M");
});

test("en los saltos de tramo no se pasa de cuatro caracteres", () => {
  // 9,996 redondeado a dos decimales sería "10,00"; tiene que irse al tramo de arriba.
  assert.equal(textoInsignia(9.996), "10,0");
  assert.equal(textoInsignia(99.96), "100");
  assert.equal(textoInsignia(9999.6), "10k");
});

test("tasas muy pequeñas sin el cero de delante", () => {
  assert.equal(textoInsignia(0.0056), ",006");
  assert.equal(textoInsignia(0.000491), ",000");
});

test("nunca pasa de cuatro caracteres", () => {
  const tasas = [0.0001, 0.004, 0.0049, 0.005, 0.07, 0.5, 0.999, 1.5, 9.99, 9.994, 9.995, 12.5, 99.9,
    99.94, 99.95, 100, 999, 9999, 9999.4, 9999.5, 50000, 999999, 1e6, 3.2e7];
  for (const t of tasas) {
    assert.ok(textoInsignia(t).length <= 4, `${t} → «${textoInsignia(t)}»`);
  }
});

test("sin tasa válida, insignia vacía", () => {
  for (const t of [null, undefined, NaN, Infinity, 0, -1, "1,1"]) assert.equal(textoInsignia(t), "", String(t));
});

test("el cambio compara los dos últimos días de la serie", () => {
  assert.ok(Math.abs(cambioDiario([1.10, 1.12, 1.1355]) - (1.1355 - 1.12) / 1.12) < 1e-12);
  assert.equal(cambioDiario([2, 1]), -0.5);
});

test("sin dos días no hay cambio", () => {
  assert.equal(cambioDiario([1.1]), null);
  assert.equal(cambioDiario([]), null);
  assert.equal(cambioDiario(undefined), null);
  assert.equal(cambioDiario([0, 1]), null);
});

test("sentido del cambio, con un margen para lo insignificante", () => {
  assert.equal(sentidoDe(0.002), "sube");
  assert.equal(sentidoDe(-0.002), "baja");
  assert.equal(sentidoDe(0.00001), "igual");
  assert.equal(sentidoDe(0), "igual");
  assert.equal(sentidoDe(null), "igual");
});

test("el título dice la tasa entera y el cambio", () => {
  const par = { from: "EUR", to: "USD" };
  // Intl pone un espacio duro antes del %; para comparar da igual cuál sea.
  const tituloInsignia = (...a) => titulo(...a).replace(/\u00A0/g, " ");
  assert.equal(tituloInsignia(par, 1.1355, 0.0021), "1 EUR = 1,1355 USD · +0,21 % desde el día anterior");
  assert.equal(tituloInsignia(par, 1.1355, -0.0005), "1 EUR = 1,1355 USD · -0,05 % desde el día anterior");
  assert.equal(tituloInsignia(par, 1.1355, null), "1 EUR = 1,1355 USD");
});

test("las tasas de cuatro cifras llevan el punto de los miles", () => {
  // En español Intl deja "1650,1200" sin punto, y al lado de "20.315,3400" quedaba raro.
  assert.equal(titulo({ from: "EUR", to: "KRW" }, 1650.12, null), "1 EUR = 1.650,1200 KRW");
});

const sinEspacios = (t) => t.replace(/[\s\u00a0\u202f]/g, " ");
const dias = (...valores) => valores.map((valor, i) => ({ fecha: `2026-10-0${i + 1}`, valor }));

test("lo de ayer sale de los dos últimos días publicados", () => {
  const c = cambioDelDia(dias(1.08, 1.10, 1.111));
  assert.ok(Math.abs(c.cambio - 0.01) < 1e-9);
  assert.equal(c.sentido, "sube");
  assert.equal(c.desde, "2026-10-02");
  assert.equal(sinEspacios(textoCambioDia(c)), "▲ 1,00 %");
});

test("al revés el sentido también se da la vuelta", () => {
  const c = cambioDelDia(dias(1.10, 1.111), true);
  assert.equal(c.sentido, "baja");
  assert.equal(sinEspacios(textoCambioDia(c)), "▼ 0,99 %");
});

test("un movimiento de nada sale como igual, sin signo", () => {
  const c = cambioDelDia(dias(1.1, 1.100001));
  assert.equal(c.sentido, "igual");
  assert.equal(sinEspacios(textoCambioDia(c)), "= 0,00 %");
});

test("sin dos días buenos no hay cambio", () => {
  assert.equal(cambioDelDia(dias(1.1)), null);
  assert.equal(cambioDelDia([]), null);
  assert.equal(cambioDelDia(undefined), null);
  assert.equal(cambioDelDia(dias(0, 1.1)), null);
});

test("con la fecha, debajo dice de qué día es la tasa", () => {
  const { ponerIdioma } = require("../textos.js");
  const ano = new Date().getFullYear();
  const par = { from: "EUR", to: "USD" };
  const duros = (x) => x.replace(/[\u00a0\u202f]/g, " ");
  const t = duros(titulo(par, 1.1355, 0.0021, `${ano}-10-06`));
  assert.equal(t, "1 EUR = 1,1355 USD · +0,21 % desde el día anterior\nTasa del BCE del 6 oct");
  assert.equal(duros(titulo(par, 1.1355, null, `${ano - 1}-12-31`)), `1 EUR = 1,1355 USD\nTasa del BCE del 31 dic ${ano - 1}`);
  ponerIdioma("en");
  try {
    assert.equal(titulo(par, 1.1355, null, `${ano}-10-06`), "1 EUR = 1.1355 USD\nECB rate from Oct 6");
  } finally {
    ponerIdioma("es");
  }
});
