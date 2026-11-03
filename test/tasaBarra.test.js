const { test } = require("node:test");
const assert = require("node:assert");
const { esTasaBarra, resumenTasaBarra } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const par = { from: "EUR", to: "USD" };
const puntos = [
  { fecha: "2026-10-30", valor: 1.1 },
  { fecha: "2026-11-02", valor: 1.111 },
];

test("entiende tasa y rate, nada más", () => {
  assert.equal(esTasaBarra("tasa"), true);
  assert.equal(esTasaBarra("  Tasa "), true);
  assert.equal(esTasaBarra("rate"), true);
  assert.equal(esTasaBarra("tasa usd"), false);
  assert.equal(esTasaBarra("20 usd"), false);
  assert.equal(esTasaBarra(""), false);
  assert.equal(esTasaBarra(null), false);
});

test("la tasa con lo que ha cambiado desde el día anterior", () => {
  ponerIdioma("es");
  const r = resumenTasaBarra(par, puntos);
  assert.match(r.principal, /^1 EUR = 1,1110 USD · ▲ 1,00\s%$/);
  assert.equal(r.detalle[0], "1 USD = 0,9001 EUR");
  assert.match(r.detalle[1], /Tasa del BCE del 2 nov/);
});

test("si baja, la flecha para abajo", () => {
  ponerIdioma("es");
  const r = resumenTasaBarra(par, [{ fecha: "2026-10-30", valor: 1.111 }, { fecha: "2026-11-02", valor: 1.1 }]);
  assert.match(r.principal, /▼/);
});

test("con un solo día, la tasa a secas", () => {
  ponerIdioma("es");
  assert.equal(resumenTasaBarra(par, puntos.slice(-1)).principal, "1 EUR = 1,1110 USD");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  const r = resumenTasaBarra(par, puntos);
  assert.match(r.principal, /^1 EUR = 1\.1110 USD · ▲ 1\.00\s?%$/);
  assert.match(r.detalle[1], /ECB rate from/);
  ponerIdioma("es");
});

test("sin datos o con el mismo par, nada", () => {
  assert.equal(resumenTasaBarra(par, []), null);
  assert.equal(resumenTasaBarra(par, null), null);
  assert.equal(resumenTasaBarra({ from: "EUR", to: "EUR" }, puntos), null);
  assert.equal(resumenTasaBarra(par, [{ fecha: "2026-11-02", valor: 0 }]), null);
});
