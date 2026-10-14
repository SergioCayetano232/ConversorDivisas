const { test } = require("node:test");
const assert = require("node:assert");
const { conceptoEstrella, resumenParaCompartir } = require("../logica.js");

let n = 0;
const g = (concepto, valor, categoria = "comida", to = "EUR") => {
  n += 1;
  return { id: `g${n}`, from: "JPY", to, cantidad: valor * 160, valor, concepto, categoria, cuando: Date.UTC(2026, 9, 10, 10, n) };
};

test("el café, cuatro veces", () => {
  const r = conceptoEstrella([g("Café", 3), g("Taxi", 20, "transporte"), g("café", 3.2), g("Cafe", 3), g("Café", 3.5)]);
  assert.equal(r.veces, 4);
  assert.equal(r.concepto, "Café");
  assert.equal(r.categoria, "comida");
  assert.ok(Math.abs(r.total - 12.7) < 1e-9);
});

test("se escribe como la última vez", () => {
  assert.equal(conceptoEstrella([g("cafe", 3), g("Cafe", 3), g("Café", 3)]).concepto, "Café");
});

test("con menos de tres no es costumbre", () => {
  assert.equal(conceptoEstrella([g("Café", 3), g("Café", 3), g("Taxi", 9, "transporte")]), null);
});

test("sin concepto no cuenta", () => {
  assert.equal(conceptoEstrella([g("", 3), g("", 3), g("", 3)]), null);
});

test("a iguales veces, el que más suma", () => {
  const r = conceptoEstrella([g("Café", 3), g("Café", 3), g("Café", 3), g("Metro", 2, "transporte"), g("Metro", 2, "transporte"), g("Metro", 20, "transporte")]);
  assert.equal(r.concepto, "Metro");
});

test("solo la divisa que más suma", () => {
  assert.equal(conceptoEstrella([g("Hotel", 300, "alojamiento"), g("Café", 3, "comida", "USD"), g("Café", 3, "comida", "USD"), g("Café", 3, "comida", "USD")]), null);
});

test("va en el resumen para WhatsApp", () => {
  const gastos = [g("Café", 3), g("Café", 3.2), g("Café", 3), g("Cena", 30)];
  const texto = resumenParaCompartir({ nombre: "Lisboa", gastos, presupuesto: null, personas: 1 }, "2026-10-14");
  assert.match(texto, /🍽️ Café: 3 veces, 9,20 EUR/);
});
