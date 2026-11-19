const { test } = require("node:test");
const assert = require("node:assert");
const { crearRetirada, leerRetiradas, leerCajeroGratis, ponerCajeroGratis, gratisDelMes, pasaDelGratis, leerViajes } = require("../logica.js");

const el = (dia) => new Date(`${dia}T12:00:00`).getTime();
const sacar = (id, cantidad, dia, tarjeta = "Revolut", bce = 1 / 160) => crearRetirada({ id, cantidad, divisa: "JPY", cuando: el(dia), en: "EUR", bce, tarjeta });
const viaje = (id, cajero) => ({ id, nombre: id, gastos: [], presupuesto: null, cajero, personas: 1, color: "oro" });
const LIMITE = { importe: 200, en: "EUR" };

test("la retirada guarda la tarjeta y lo que valía al BCE", () => {
  const r = sacar("r", 16000, "2026-11-10");
  assert.equal(r.tarjeta, "Revolut");
  assert.equal(r.vale, 100);
  assert.equal(r.valeEn, "EUR");
  assert.deepEqual(leerRetiradas([r]), [r], "y sobrevive a leerla");
});

test("las de antes, sin tarjeta, se leen igual", () => {
  const vieja = { id: "v", cantidad: 1000, divisa: "JPY", cuando: 1 };
  assert.deepEqual(leerRetiradas([vieja]), [vieja]);
  const sinTarjeta = crearRetirada({ id: "s", cantidad: 1000, divisa: "JPY", cuando: 1, en: "EUR", bce: 0.006 });
  assert.equal("tarjeta" in sinTarjeta, false);
});

test("lo sacado este mes con esa tarjeta, en todos los viajes", () => {
  const viajes = leerViajes({
    activo: "a",
    lista: [viaje("a", [sacar("1", 16000, "2026-11-10"), sacar("2", 8000, "2026-11-18", "BBVA")]), viaje("b", [sacar("3", 8000, "2026-11-02")])],
    archivados: [viaje("c", [sacar("4", 16000, "2026-10-30")])],
  });
  const g = gratisDelMes(viajes, "Revolut", LIMITE, "2026-11-19");
  assert.equal(g.usado, 150, "el de octubre y el de la BBVA no cuentan");
  assert.equal(g.queda, 50);
  assert.equal(g.pasado, 0);
  assert.equal(gratisDelMes(viajes, "BBVA", LIMITE, "2026-11-19").usado, 50);
});

test("pasado el límite, cuánto", () => {
  const viajes = leerViajes({ activo: "a", lista: [viaje("a", [sacar("1", 40000, "2026-11-10")])] });
  const g = gratisDelMes(viajes, "Revolut", LIMITE, "2026-11-19");
  assert.equal(g.queda, 0);
  assert.equal(g.pasado, 50);
});

test("lo que se trae de otro viaje no cuenta", () => {
  const traido = { ...sacar("t", 16000, "2026-11-10"), de: "b" };
  const viajes = leerViajes({ activo: "a", lista: [viaje("a", [traido])] });
  assert.equal(gratisDelMes(viajes, "Revolut", LIMITE, "2026-11-19").usado, 0);
});

test("sin límite no hay cuenta", () => {
  assert.equal(gratisDelMes(leerViajes({ activo: "a", lista: [viaje("a", [])] }), "Revolut", null), null);
});

test("si lo que vas a sacar se pasa", () => {
  assert.equal(pasaDelGratis({ queda: 50 }, 80), 30);
  assert.equal(pasaDelGratis({ queda: 50 }, 40), 0);
  assert.equal(pasaDelGratis(null, 40), 0);
});

test("los límites guardados, limpios", () => {
  assert.deepEqual(leerCajeroGratis({ Revolut: { importe: 200, en: "EUR" }, Mal: { importe: -1, en: "EUR" }, Raro: { importe: 5, en: "XXX" } }), { Revolut: { importe: 200, en: "EUR" } });
  assert.deepEqual(leerCajeroGratis(null), {});
  const g = ponerCajeroGratis({}, "Revolut", 200, "EUR");
  assert.deepEqual(g, { Revolut: { importe: 200, en: "EUR" } });
  assert.deepEqual(ponerCajeroGratis(g, "Revolut", 0, "EUR"), {}, "con cero se quita");
  assert.deepEqual(ponerCajeroGratis(g, "", 100, "GBP"), { Revolut: { importe: 200, en: "EUR" }, "": { importe: 100, en: "GBP" } });
});
