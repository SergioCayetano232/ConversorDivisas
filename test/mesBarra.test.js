const { test } = require("node:test");
const assert = require("node:assert");
const { esMesBarra, resumenMesBarra } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const gasto = (valor, dia, mes = 9) => ({
  id: `${mes}-${dia}-${valor}`, from: "JPY", to: "EUR", cantidad: valor * 170, valor, concepto: "", categoria: "comida",
  cuando: new Date(2026, mes, dia, 13).getTime(),
});
const viaje = (gastos) => ({ id: "v", nombre: "Japón", gastos, presupuesto: null });

test("entiende mes y month, y nada más", () => {
  assert.equal(esMesBarra("mes"), true);
  assert.equal(esMesBarra(" Month "), true);
  assert.equal(esMesBarra("mes 20"), false);
  assert.equal(esMesBarra("semana"), false);
  assert.equal(esMesBarra(""), false);
});

test("los últimos treinta días contando hoy, con la media y el día que más", () => {
  // Del 18 de septiembre al 17 de octubre son treinta: el 17 de septiembre ya cae fuera.
  const r = resumenMesBarra(viaje([gasto(20, 17), gasto(64.2, 14), gasto(15.8, 18, 8), gasto(500, 17, 8)]), "2026-10-17");
  assert.equal(r.principal, "Últimos 30 días: 100,00 EUR en 3 gastos");
  assert.deepEqual(r.detalle, ["3,33 al día", "El día que más, el 14 de octubre: 64,20"]);
});

test("si el viaje empezó hace tres días, la media va entre tres", () => {
  const r = resumenMesBarra(viaje([gasto(30, 17), gasto(60, 15)]), "2026-10-17");
  assert.equal(r.detalle[0], "30,00 al día");
});

test("con un solo día, sin el día que más", () => {
  const r = resumenMesBarra(viaje([gasto(12, 17)]), "2026-10-17");
  assert.equal(r.principal, "Últimos 30 días: 12,00 EUR en 1 gasto");
  assert.deepEqual(r.detalle, ["12,00 al día"]);
});

test("sin nada en el mes, o sin viaje", () => {
  assert.equal(resumenMesBarra(viaje([gasto(42, 1, 7)]), "2026-10-17").principal, "En los últimos 30 días no apuntaste nada");
  assert.equal(resumenMesBarra(viaje([]), "2026-10-17").principal, "En los últimos 30 días no apuntaste nada");
  assert.equal(resumenMesBarra(null), null);
});

test("en inglés", () => {
  ponerIdioma("en");
  try {
    const r = resumenMesBarra(viaje([gasto(20, 17), gasto(64.2, 14)]), "2026-10-17");
    assert.equal(r.principal, "Last 30 days: 84.20 EUR in 2 expenses");
    assert.deepEqual(r.detalle, ["21.05 a day", "Biggest day, October 14: 64.20"]);
  } finally {
    ponerIdioma("es");
  }
});
