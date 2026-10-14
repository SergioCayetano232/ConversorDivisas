const { test } = require("node:test");
const assert = require("node:assert");
const { categoriasAlDia, mediaPorDia } = require("../logica.js");

// En la app van del más nuevo al más viejo, que es como se apuntan.
const nuevosPrimero = (gastos) => [...gastos].sort((a, b) => b.cuando - a.cuando);
let n = 0;
const g = (dia, valor, categoria, to = "EUR") => {
  n += 1;
  const [a, m, d] = dia.split("-").map(Number);
  return { id: `g${n}`, from: "JPY", to, cantidad: valor * 160, valor, concepto: "", categoria, cuando: new Date(a, m - 1, d, 12).getTime() };
};

test("cuatro días: 120 de comida son 30 al día y 40 de taxis, 10", () => {
  const gastos = nuevosPrimero([g("2026-10-08", 50, "comida"), g("2026-10-11", 70, "comida"), g("2026-10-09", 40, "transporte")]);
  const r = categoriasAlDia(gastos);
  assert.equal(r.get("comida"), 30);
  assert.equal(r.get("transporte"), 10);
});

test("sumadas dan la media de arriba", () => {
  const gastos = nuevosPrimero([g("2026-10-08", 50, "comida"), g("2026-10-10", 33, "ocio"), g("2026-10-11", 70, "comida")]);
  const suma = [...categoriasAlDia(gastos).values()].reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(suma - mediaPorDia(gastos).media) < 1e-9);
});

test("con un solo día no hay media, como arriba", () => {
  assert.equal(categoriasAlDia([g("2026-10-08", 50, "comida"), g("2026-10-08", 9, "ocio")]).size, 0);
  assert.equal(categoriasAlDia([]).size, 0);
});

test("la otra divisa no entra", () => {
  const r = categoriasAlDia(nuevosPrimero([g("2026-10-08", 50, "comida"), g("2026-10-09", 50, "comida"), g("2026-10-09", 20, "ocio", "USD")]));
  assert.equal(r.has("ocio"), false);
  assert.equal(r.get("comida"), 50);
});
