const { test } = require("node:test");
const assert = require("node:assert");
const {
  PROPINA_MAX, PERSONAS_MAX, CUENTA_POR_DEFECTO, leerCuenta, redondoHaciaArriba, repartirCuenta, cuentaParaCompartir, leerPorcentaje,
} = require("../logica.js");

test("sin nada guardado, un 10 % entre dos", () => {
  assert.deepEqual(leerCuenta(undefined), CUENTA_POR_DEFECTO);
  assert.deepEqual(leerCuenta("hola"), CUENTA_POR_DEFECTO);
  assert.deepEqual(CUENTA_POR_DEFECTO, { propina: 10, personas: 2, redondear: false });
});

test("lo guardado se respeta si tiene sentido", () => {
  assert.deepEqual(leerCuenta({ propina: 18, personas: 4 }), { propina: 18, personas: 4, redondear: false });
  assert.deepEqual(leerCuenta({ propina: 0, personas: 1 }), { propina: 0, personas: 1, redondear: false });
});

test("lo que no tiene sentido vuelve a lo de siempre, cada cosa por su lado", () => {
  assert.deepEqual(leerCuenta({ propina: -5, personas: 3 }), { propina: 10, personas: 3, redondear: false });
  assert.deepEqual(leerCuenta({ propina: PROPINA_MAX + 1, personas: 3 }), { propina: 10, personas: 3, redondear: false });
  assert.deepEqual(leerCuenta({ propina: 15, personas: 0 }), { propina: 15, personas: 2, redondear: false });
  assert.deepEqual(leerCuenta({ propina: 15, personas: 2.5 }), { propina: 15, personas: 2, redondear: false });
  assert.deepEqual(leerCuenta({ propina: 15, personas: PERSONAS_MAX + 1 }), { propina: 15, personas: 2, redondear: false });
});

test("la propina se escribe como la comisión, pero llega más alto", () => {
  assert.equal(leerPorcentaje("18", PROPINA_MAX), 18);
  assert.equal(leerPorcentaje("12,5 %", PROPINA_MAX), 12.5);
  assert.equal(leerPorcentaje("31", PROPINA_MAX), null);
  assert.equal(leerPorcentaje("18"), null, "sin decir nada sigue siendo el tope de la comisión");
});

test("una cena de 85 dólares con un 15 % entre cuatro", () => {
  const r = repartirCuenta(85, 0.9, { propina: 15, personas: 4 });
  assert.ok(Math.abs(r.total - 97.75) < 1e-9);
  assert.ok(Math.abs(r.propina - 12.75) < 1e-9);
  assert.equal(r.cadaUno, 24.44, "24,4375 se redondea hacia arriba");
  assert.ok(Math.abs(r.totalTuyo - 87.975) < 1e-9);
  assert.equal(r.cadaUnoTuyo, 22);
});

test("si sale justo no se le suma un céntimo", () => {
  assert.equal(repartirCuenta(30, 1, { propina: 0, personas: 3 }).cadaUno, 10);
  assert.equal(repartirCuenta(100, 1, { propina: 10, personas: 2 }).cadaUno, 55);
  assert.equal(repartirCuenta(0.3, 1, { propina: 0, personas: 3 }).cadaUno, 0.1);
});

test("la comisión va sobre lo que pagas en tu divisa", () => {
  const r = repartirCuenta(100, 2, { propina: 0, personas: 2 }, 3);
  assert.equal(r.total, 100);
  assert.ok(Math.abs(r.totalTuyo - 206) < 1e-9);
  assert.equal(r.cadaUnoTuyo, 103);
});

test("sin cantidad no hay cuenta, y sin tasa solo la de la divisa de origen", () => {
  assert.equal(repartirCuenta(0, 1, CUENTA_POR_DEFECTO), null);
  assert.equal(repartirCuenta(null, 1, CUENTA_POR_DEFECTO), null);
  const sinTasa = repartirCuenta(50, null, CUENTA_POR_DEFECTO);
  assert.equal(sinTasa.cadaUno, 27.5);
  assert.equal(sinTasa.totalTuyo, null);
  assert.equal(sinTasa.cadaUnoTuyo, null);
});

test("el reparto para el grupo lleva la cuenta, la propina y lo de cada uno", () => {
  const { ponerIdioma } = require("../textos.js");
  ponerIdioma("es");
  const reparto = { propina: 10, personas: 2 };
  const texto = cuentaParaCompartir(repartirCuenta(120, 0.9, reparto), "USD", "EUR", reparto).replace(/\u00a0/g, " ");
  assert.equal(texto, [
    "*🧾 La cuenta: 132,00 USD*",
    "120,00 + 12,00 de propina (10 %)",
    "*👥 66,00 USD cada uno, entre 2*",
    "_≈ 59,40 EUR_",
  ].join("\n"));
});

test("sin propina, solo o en la misma divisa, sobra lo que no aporta", () => {
  const { ponerIdioma } = require("../textos.js");
  ponerIdioma("es");
  const solo = { propina: 0, personas: 1 };
  assert.equal(cuentaParaCompartir(repartirCuenta(50, 0.9, solo), "USD", "EUR", solo), "*🧾 La cuenta: 50,00 USD*\n_≈ 45,00 EUR_");
  const mismo = { propina: 0, personas: 3 };
  assert.equal(cuentaParaCompartir(repartirCuenta(10, null, mismo), "EUR", "EUR", mismo), "*🧾 La cuenta: 10,00 EUR*\n*👥 3,34 EUR cada uno, entre 3*");
  assert.equal(cuentaParaCompartir(null, "USD", "EUR", mismo), "");
});

test("en inglés el reparto también se entiende", () => {
  const { ponerIdioma } = require("../textos.js");
  ponerIdioma("en");
  try {
    const reparto = { propina: 15, personas: 4 };
    assert.equal(cuentaParaCompartir(repartirCuenta(80, null, reparto), "GBP", "GBP", reparto), [
      "*🧾 The bill: 92.00 GBP*",
      "80.00 + 12.00 tip (15%)",
      "*👥 23.00 GBP each, split 4 ways*",
    ].join("\n"));
  } finally {
    ponerIdioma("es");
  }
});

test("redondear lo de cada uno, a la unidad o a lo que tenga sentido", () => {
  assert.equal(redondoHaciaArriba(23.47), 24);
  assert.equal(redondoHaciaArriba(24), 24, "lo que ya es redondo no sube");
  assert.equal(redondoHaciaArriba(0.4), 1);
  assert.equal(redondoHaciaArriba(234.1), 235);
  assert.equal(redondoHaciaArriba(2347), 2350);
  assert.equal(redondoHaciaArriba(23471), 23500);
});

test("con el redondeo, cada uno paga redondo y lo de más se dice", () => {
  // 61 + 15 % = 70,15 entre 3 = 23,38 → 24, y sobran 1,85.
  const r = repartirCuenta(61, 0.9, { propina: 15, personas: 3, redondear: true });
  assert.equal(r.cadaUno, 24);
  assert.ok(Math.abs(r.sobra - 1.85) < 1e-9);
  assert.equal(r.cadaUnoTuyo, 21.6, "en tu divisa, lo que pagas de verdad: los 24");
  assert.equal(repartirCuenta(61, 0.9, { propina: 15, personas: 3 }).sobra, 0);
  assert.equal(repartirCuenta(61, 0.9, { propina: 15, personas: 3 }).cadaUno, 23.39);
  assert.equal(repartirCuenta(61, null, { propina: 15, personas: 3, redondear: true }).cadaUnoTuyo, null);
});

test("lo guardado con el redondeo puesto se queda puesto", () => {
  assert.equal(leerCuenta({ propina: 10, personas: 2, redondear: true }).redondear, true);
  assert.equal(leerCuenta({ propina: 10, personas: 2, redondear: "sí" }).redondear, false);
});
