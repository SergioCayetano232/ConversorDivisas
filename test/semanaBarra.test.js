const { test } = require("node:test");
const assert = require("node:assert");
const { esSemanaBarra, resumenSemanaBarra } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const gasto = (valor, dia, mes = 9) => ({
  id: `${dia}-${valor}`, from: "JPY", to: "EUR", cantidad: valor * 170, valor, concepto: "", categoria: "comida",
  cuando: new Date(2026, mes, dia, 13).getTime(),
});
const viaje = (gastos) => ({ id: "v", nombre: "Japón", gastos, presupuesto: null });

test("entiende semana y week, y nada más", () => {
  assert.equal(esSemanaBarra("semana"), true);
  assert.equal(esSemanaBarra(" Week "), true);
  assert.equal(esSemanaBarra("semana 20"), false);
  assert.equal(esSemanaBarra("ayer"), false);
  assert.equal(esSemanaBarra(""), false);
});

test("los últimos siete días contando hoy, con la media y el día que más", () => {
  // El 10 ya cae fuera: del 11 al 17 son siete.
  const r = resumenSemanaBarra(viaje([gasto(20, 17), gasto(64.2, 14), gasto(15.8, 11), gasto(500, 10)]), "2026-10-17");
  assert.equal(r.principal, "Últimos 7 días: 100,00 EUR en 3 gastos");
  assert.deepEqual(r.detalle, ["14,29 al día", "El día que más, el miércoles: 64,20"]);
});

test("si el viaje empezó hace tres días, la media va entre tres", () => {
  const r = resumenSemanaBarra(viaje([gasto(30, 17), gasto(60, 15)]), "2026-10-17");
  assert.equal(r.detalle[0], "30,00 al día");
});

test("con un solo día, sin el día que más", () => {
  const r = resumenSemanaBarra(viaje([gasto(12, 17)]), "2026-10-17");
  assert.equal(r.principal, "Últimos 7 días: 12,00 EUR en 1 gasto");
  assert.deepEqual(r.detalle, ["12,00 al día"]);
});

test("cruza el cambio de mes", () => {
  const r = resumenSemanaBarra(viaje([gasto(10, 28, 8), gasto(5, 2)]), "2026-10-02");
  assert.equal(r.principal, "Últimos 7 días: 15,00 EUR en 2 gastos");
});

test("sin nada en la semana, o sin viaje", () => {
  assert.equal(resumenSemanaBarra(viaje([gasto(42, 1)]), "2026-10-17").principal, "En los últimos 7 días no apuntaste nada");
  assert.equal(resumenSemanaBarra(viaje([]), "2026-10-17").principal, "En los últimos 7 días no apuntaste nada");
  assert.equal(resumenSemanaBarra(null), null);
});

test("en inglés", () => {
  ponerIdioma("en");
  try {
    const r = resumenSemanaBarra(viaje([gasto(20, 17), gasto(64.2, 14)]), "2026-10-17");
    assert.equal(r.principal, "Last 7 days: 84.20 EUR in 2 expenses");
    assert.deepEqual(r.detalle, ["21.05 a day", "Biggest day, Wednesday: 64.20"]);
  } finally {
    ponerIdioma("es");
  }
});
