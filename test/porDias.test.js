const { test } = require("node:test");
const assert = require("node:assert");
const { repartoPorDias, repartirNoches, crearGasto } = require("../logica.js");

test("el alojamiento va por noches, diga lo que diga", () => {
  assert.equal(repartoPorDias("alojamiento", "Hotel"), "noches");
  assert.equal(repartoPorDias("alojamiento", ""), "noches");
});

test("lo que se paga una vez y dura, por días", () => {
  for (const concepto of ["Alquiler de coche", "Car rental", "Japan Rail Pass", "Abono transporte", "Forfait", "eSIM", "Moto", "Bici 3 días", "Pase semanal", "WiFi portátil", "Roaming"]) {
    assert.equal(repartoPorDias("transporte", concepto), "dias", concepto);
  }
  assert.equal(repartoPorDias("ocio", "Ski pass"), "dias");
  assert.equal(repartoPorDias("otros", "SIM"), "dias");
});

test("lo de una vez no ofrece repartir, aunque se parezca", () => {
  for (const concepto of ["Taxi", "Metro", "Carne", "Paseo en barca", "Pasaporte", "Simulador", "Cena", "", null]) {
    assert.equal(repartoPorDias("transporte", concepto), null, String(concepto));
  }
});

test("un coche de 300 en 7 días cuadra al céntimo, un gasto por día", () => {
  const coche = crearGasto({ id: "c", from: "JPY", to: "EUR", cantidad: 48000, valor: 300, concepto: "Coche", cuando: new Date(2026, 10, 3, 10).getTime(), categoria: "transporte" });
  const dias = repartirNoches(coche, 7);
  assert.equal(dias.length, 7);
  assert.equal(dias.reduce((s, d) => s + Math.round(d.valor * 100), 0), 30000);
  assert.deepEqual(dias.map((d) => new Date(d.cuando).getDate()), [3, 4, 5, 6, 7, 8, 9]);
  assert.equal(dias[0].concepto, "1/7 · Coche");
  assert.ok(dias.every((d) => d.categoria === "transporte"));
});
