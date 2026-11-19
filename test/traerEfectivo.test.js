const { test } = require("node:test");
const assert = require("node:assert");
const {
  leerViajes, leerRetiradas, efectivoQueda, efectivoParaTraer, traerEfectivo, quitarRetiradaDeViajes, viajeActivo,
  archivarViaje, crearGasto, alCambioDelCajero, RETIRADAS_MAX,
} = require("../logica.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const enEfectivo = (id, cantidad) => crearGasto({ id, from: "JPY", to: "EUR", cantidad, valor: cantidad / 160, concepto: "Ramen", cuando: 5, categoria: "comida", pago: "efectivo" });
const sacado = (id, cantidad, cuando, extra = {}) => ({ id, cantidad, divisa: "JPY", cuando, ...extra });
const viaje = (id, nombre, cajero = [], gastos = []) => ({ id, nombre, gastos, presupuesto: null, cajero, personas: 1, color: "oro" });

// Japón dejó 3.000 yenes sin gastar; Japón 2 acaba de empezar.
const dos = (cajero = [sacado("r1", 20000, 10, { coste: 125, en: "EUR" })]) => leerViajes({
  activo: "n",
  lista: [viaje("j", "🇯🇵 Japón", cajero, [enEfectivo("g1", 17000)]), viaje("n", "Japón 2")],
});
const queda = (viajes, id) => efectivoQueda(viajes.lista.find((v) => v.id === id).cajero, viajes.lista.find((v) => v.id === id).gastos)[0]?.queda ?? 0;

test("lo de antes no lleva enlace y se lee igual", () => {
  assert.deepEqual(leerRetiradas([sacado("r", 100, 1)]), [sacado("r", 100, 1)]);
  assert.deepEqual(leerRetiradas([sacado("r", 100, 1, { de: "" })]), [sacado("r", 100, 1)]);
  assert.deepEqual(leerRetiradas([sacado("r", 100, 1, { de: "j" })])[0].de, "j");
});

test("lo que sobró en otro viaje, con lo que costó", () => {
  const t = efectivoParaTraer(dos(), "JPY", "EUR");
  assert.deepEqual(t.desde, { id: "j", nombre: "🇯🇵 Japón" });
  assert.equal(t.queda, 3000);
  cerca(t.coste, 3000 * 125 / 20000);
  assert.equal(t.en, "EUR");
});

test("sin lo que costó, sin coste", () => {
  const t = efectivoParaTraer(dos([sacado("r1", 20000, 10)]), "JPY", "EUR");
  assert.equal(t.queda, 3000);
  assert.equal("coste" in t, false);
});

test("sin sobras, en otra divisa o en el mismo viaje no hay nada", () => {
  assert.equal(efectivoParaTraer(dos([sacado("r1", 17000, 10)]), "JPY", "EUR"), null);
  assert.equal(efectivoParaTraer(dos(), "USD", "EUR"), null);
  const enJapon = { ...dos(), activo: "j" };
  assert.equal(efectivoParaTraer(enJapon, "JPY", "EUR"), null);
});

test("de los archivados también", () => {
  const viajes = archivarViaje({ ...dos(), activo: "j" }, "j");
  assert.equal(viajes.activo, "n");
  assert.equal(efectivoParaTraer(viajes, "JPY", "EUR").queda, 3000);
});

test("con varios, el más reciente", () => {
  const viajes = leerViajes({
    activo: "n",
    lista: [viaje("a", "Viejo", [sacado("r1", 5000, 10)]), viaje("b", "Nuevo", [sacado("r2", 1000, 99)]), viaje("n", "Ahora")],
  });
  assert.equal(efectivoParaTraer(viajes, "JPY", "EUR").desde.id, "b");
});

test("traerlo lo pone en el nuevo y lo saca del viejo", () => {
  const viajes = traerEfectivo(dos(), "JPY", "EUR", "t1", 50);
  assert.equal(queda(viajes, "n"), 3000);
  assert.equal(queda(viajes, "j"), 0);
  assert.equal(efectivoParaTraer(viajes, "JPY", "EUR"), null, "no se trae dos veces");
  assert.equal(efectivoParaTraer({ ...viajes, activo: "j" }, "JPY", "EUR"), null, "ni de vuelta");
  const [entra] = viajeActivo(viajes).cajero;
  assert.equal(entra.de, "j");
  assert.equal(entra.cuando, 50);
  assert.equal(viajes.lista[0].cajero[0].a, "n");
  // Y sobrevive a guardar y leer.
  const leidos = leerViajes(JSON.parse(JSON.stringify(viajes)));
  assert.equal(queda(leidos, "n"), 3000);
  assert.equal(queda(leidos, "j"), 0);
});

test("lo que pagas con ellos va al cambio que te costaron", () => {
  const viajes = traerEfectivo(dos(), "JPY", "EUR", "t1", 50);
  const g = alCambioDelCajero(enEfectivo("g2", 1000), viajeActivo(viajes).cajero);
  cerca(g.valor, 6.25);
});

test("quitar cualquiera de los dos lados los quita a los dos", () => {
  const traidos = traerEfectivo(dos(), "JPY", "EUR", "t1", 50);
  for (const viajes of [traidos, { ...traidos, activo: "j" }]) {
    const sin = quitarRetiradaDeViajes(viajes, "t1");
    assert.equal(queda(sin, "n"), 0);
    assert.equal(queda(sin, "j"), 3000);
  }
});

test("una retirada normal solo se quita del abierto", () => {
  const viajes = { ...dos(), activo: "j" };
  const sin = quitarRetiradaDeViajes(viajes, "r1");
  assert.equal(sin.lista[0].cajero.length, 0);
});

test("con el cajero lleno no se mueve nada", () => {
  const lleno = Array.from({ length: RETIRADAS_MAX }, (_, i) => sacado(`r${i}`, 1000, i));
  const viajes = dos(lleno);
  assert.equal(traerEfectivo(viajes, "JPY", "EUR", "t1"), viajes);
});
