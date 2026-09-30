const { test } = require("node:test");
const assert = require("node:assert");
const {
  FECHA_MINIMA, fechaLarga, fechaValida, diaDelGrafico, mesesAtras, FECHAS_RAPIDAS, leerFecha, cambioDesde, notaDiaHabil,
} = require("../logica.js");

const HOY = "2026-09-30";

test("una fecha normal del pasado vale", () => {
  assert.equal(fechaValida("2024-03-01", HOY), true);
  assert.equal(fechaValida(HOY, HOY), true, "hoy también");
  assert.equal(fechaValida(FECHA_MINIMA, HOY), true);
});

test("ni futuro ni antes del BCE", () => {
  assert.equal(fechaValida("2026-10-01", HOY), false);
  assert.equal(fechaValida("1999-01-03", HOY), false);
});

test("días que no existen no valen", () => {
  assert.equal(fechaValida("2024-02-30", HOY), false);
  assert.equal(fechaValida("2023-02-29", HOY), false, "2023 no es bisiesto");
  assert.equal(fechaValida("2024-02-29", HOY), true, "2024 sí");
  assert.equal(fechaValida("2024-13-01", HOY), false);
});

test("lo que no es una fecha no vale", () => {
  for (const mala of ["", "2024-3-1", "01/03/2024", null, undefined, 20240301]) {
    assert.equal(fechaValida(mala, HOY), false, String(mala));
  }
});

test("el día de un punto del gráfico", () => {
  const serie = [{ fecha: "2026-09-28", valor: 1.13 }, { fecha: "2026-09-29", valor: 1.14 }];
  assert.equal(diaDelGrafico(serie, 0, HOY), "2026-09-28");
  assert.equal(diaDelGrafico(serie, 1, HOY), "2026-09-29");
});

test("un punto que no existe o sin fecha buena no da día", () => {
  const serie = [{ fecha: "2026-09-28", valor: 1.13 }, { valor: 1.14 }, { fecha: "2026-10-05", valor: 1.15 }];
  assert.equal(diaDelGrafico(serie, 5, HOY), null);
  assert.equal(diaDelGrafico(serie, -1, HOY), null);
  assert.equal(diaDelGrafico(serie, 1, HOY), null, "sin fecha");
  assert.equal(diaDelGrafico(serie, 2, HOY), null, "del futuro");
  assert.equal(diaDelGrafico(null, 0, HOY), null);
});

test("meses atrás, con los finales de mes bien", () => {
  assert.equal(mesesAtras("2026-09-30", 1), "2026-08-30");
  assert.equal(mesesAtras("2026-03-31", 1), "2026-02-28");
  assert.equal(mesesAtras("2024-03-31", 1), "2024-02-29");
  assert.equal(mesesAtras("2026-01-15", 1), "2025-12-15", "cambia de año");
  assert.equal(mesesAtras("2026-09-30", 12), "2025-09-30");
  assert.equal(mesesAtras("2024-02-29", 12), "2023-02-28");
});

test("las rápidas van de menos a más", () => {
  const meses = FECHAS_RAPIDAS.map((f) => f.meses);
  assert.deepEqual(meses, [...meses].sort((a, b) => a - b));
});

test("sin fecha guardada, hace un mes", () => {
  assert.equal(leerFecha(undefined, HOY), "2026-08-30");
  assert.equal(leerFecha("basura", HOY), "2026-08-30");
  assert.equal(leerFecha("2027-01-01", HOY), "2026-08-30", "una del futuro tampoco");
});

test("la fecha guardada se respeta", () => {
  assert.equal(leerFecha("2024-03-01", HOY), "2024-03-01");
});

test("cambio desde entonces", () => {
  assert.ok(Math.abs(cambioDesde(100, 110) - 0.1) < 1e-12);
  assert.ok(Math.abs(cambioDesde(100, 95) + 0.05) < 1e-12);
  assert.equal(cambioDesde(100, 100), 0);
});

test("sin los dos números no hay cambio", () => {
  assert.equal(cambioDesde(null, 100), null);
  assert.equal(cambioDesde(100, null), null);
  assert.equal(cambioDesde(0, 100), null);
});

test("la fecha larga lleva el día de la semana", () => {
  assert.equal(fechaLarga("2024-03-01"), "vie, 1 mar 2024");
  assert.equal(fechaLarga("2026-09-30"), "mié, 30 sept 2026");
});

test("avisa si la tasa es de otro día", () => {
  assert.equal(notaDiaHabil("2024-03-03", "2024-03-01"), "Ese día no hubo tasa; es la del vie, 1 mar 2024");
  assert.equal(notaDiaHabil("2024-03-01", "2024-03-01"), "");
  assert.equal(notaDiaHabil("2024-03-01", undefined), "");
});
