const { test } = require("node:test");
const assert = require("node:assert");
const { PPA, PPA_EURO, RINDE_MAX, NIVEL_IGUAL, dondeRindeMas, nivelDePrecios } = require("../logica.js");

// Unas tasas desde el euro, redondas pero del orden de las de verdad.
const DESDE_EURO = { USD: 1.16, GBP: 0.88, CHF: 0.93, JPY: 180, VND: 30500, EGP: 55, INR: 102, ARS: 1650, TRY: 49, MXN: 21.5 };

test("desde España salen los baratos, del que más al que menos", () => {
  const lista = dondeRindeMas(DESDE_EURO, "EUR", "EUR", ["es-ES"]);
  assert.ok(lista.length > 0 && lista.length <= RINDE_MAX);
  const pcts = lista.map((r) => r.pct);
  assert.deepEqual(pcts, [...pcts].sort((a, b) => a - b));
  assert.ok(lista.every((r) => r.pct <= -NIVEL_IGUAL));
  assert.ok(!lista.some((r) => r.code === "CHF"), "Suiza no es barata");
});

test("da lo mismo que la pastilla de allí", () => {
  const egipto = dondeRindeMas(DESDE_EURO, "EUR", "EUR", ["es-ES"]).find((r) => r.code === "EGP");
  assert.equal(egipto.pct, nivelDePrecios("EUR", "EGP", 55, ["es-ES"], "EUR").pct);
  assert.equal(egipto.region, "EG");
});

test("vale con las tasas desde otra base", () => {
  // Las mismas tasas, pero pedidas desde el dólar.
  const desdeDolar = Object.fromEntries(Object.entries(DESDE_EURO).map(([c, r]) => [c, r / DESDE_EURO.USD]));
  delete desdeDolar.USD;
  desdeDolar.EUR = 1 / DESDE_EURO.USD;
  const a = dondeRindeMas(DESDE_EURO, "EUR", "EUR", ["es-ES"]);
  const b = dondeRindeMas(desdeDolar, "USD", "EUR", ["es-ES"]);
  assert.deepEqual(b.map((r) => [r.code, r.pct]), a.map((r) => [r.code, r.pct]));
});

test("el euro de destino va con la media, no con tu país", () => {
  const desdeDolar = { EUR: 0.86, VND: 26300 };
  const euro = dondeRindeMas({ EUR: 0.86 }, "USD", "USD", ["es-ES"], 50).find((r) => r.code === "EUR");
  const media = Object.values(PPA_EURO).reduce((a, b) => a + b, 0) / Object.keys(PPA_EURO).length;
  assert.equal(euro.region, null);
  assert.equal(euro.pct, Math.round((media / 0.86 / PPA.USD - 1) * 100));
  assert.ok(dondeRindeMas(desdeDolar, "USD", "USD", ["en-US"]).some((r) => r.code === "VND"));
});

test("tu divisa no sale, y lo que no tiene tasa tampoco", () => {
  const lista = dondeRindeMas(DESDE_EURO, "EUR", "EUR", ["es-ES"], 50);
  assert.ok(!lista.some((r) => r.code === "EUR"));
  assert.ok(!lista.some((r) => r.code === "THB"), "no venía en las tasas");
});

test("el máximo se respeta", () => {
  assert.equal(dondeRindeMas(DESDE_EURO, "EUR", "EUR", ["es-ES"], 2).length, 2);
});

test("sin tasas, o sin la de tu divisa, nada", () => {
  assert.deepEqual(dondeRindeMas(null, "EUR", "EUR"), []);
  assert.deepEqual(dondeRindeMas({ JPY: 180 }, "EUR", "USD"), []);
  assert.deepEqual(dondeRindeMas(DESDE_EURO, "EUR", "XXX"), []);
});
