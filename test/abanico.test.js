const { test } = require("node:test");
const assert = require("node:assert");
const { abanicoTasa, textoAbanico } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
// Una tasa que cada día sube o baja un 1 %, alternando, desde el 1 de agosto.
function serie(n, { finde = true, paso = 0.01 } = {}) {
  const puntos = [];
  let valor = 1;
  for (let i = 0; puntos.length < n; i += 1) {
    const d = new Date(2026, 7, 1 + i);
    if (!finde && (d.getDay() === 0 || d.getDay() === 6)) continue;
    puntos.push({ fecha: iso(d), valor });
    valor *= puntos.length % 2 ? 1 + paso : 1 / (1 + paso);
  }
  return puntos;
}
const cerca = (a, b, tol = 1e-3) => assert.ok(Math.abs(a - b) < tol, `${a} ≠ ${b}`);

test("la franja a un mes sale de cuánto se mueve cada día", () => {
  const s = serie(61);
  const r = abanicoTasa(s);
  const sigma = Math.log(1.01) * Math.sqrt(60 / 59);
  cerca(r.pct, Math.exp(1.2816 * sigma * Math.sqrt(30)) - 1);
  assert.equal(r.actual, s[s.length - 1].valor);
  cerca(r.bajo * r.alto, r.actual ** 2, 1e-9);
});

test("sin fines de semana caben menos tasas en un mes, y la franja es más estrecha", () => {
  const todos = abanicoTasa(serie(61));
  const laborables = abanicoTasa(serie(61, { finde: false }));
  assert.ok(laborables.pct < todos.pct);
  // Unas 21 tasas en 30 días en vez de 30.
  cerca(Math.log(1 + laborables.pct) / Math.log(1 + todos.pct), Math.sqrt(21.4 / 30), 0.02);
});

test("cuanto más se mueve, más ancha", () => {
  assert.ok(abanicoTasa(serie(40, { paso: 0.03 })).pct > abanicoTasa(serie(40)).pct * 2.5);
});

test("con pocas tasas o datos raros, nada", () => {
  assert.equal(abanicoTasa(serie(19)), null);
  assert.equal(abanicoTasa(null), null);
  assert.equal(abanicoTasa(serie(30).map((p) => ({ ...p, valor: 0 }))), null);
});

test("los textos, con tu cantidad y sin ella", () => {
  ponerIdioma("es");
  const r = { actual: 0.9, bajo: 0.88, alto: 0.92, pct: 0.0222 };
  assert.deepEqual(textoAbanico(r, { cantidad: 1000, from: "USD", to: "EUR" }), {
    rango: "8 de cada 10 veces, entre 0,8800 y 0,9200 (±2,2 %)",
    dinero: "Tus 1.000,00 USD serían de 880,00 a 920,00 EUR",
  });
  assert.equal(textoAbanico(r, { cantidad: 0, from: "USD", to: "EUR" }).dinero, "");
  assert.match(textoAbanico({ actual: 0.0057, bajo: 0.0055, alto: 0.0059, pct: 0.035 }).rango, /0,005500 y 0,005900/);
  assert.equal(textoAbanico(null), null);
  ponerIdioma("en");
  assert.equal(textoAbanico(r).rango, "8 times out of 10, between 0.8800 and 0.9200 (±2.2%)");
  ponerIdioma("es");
});
