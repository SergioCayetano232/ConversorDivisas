const { test } = require("node:test");
const assert = require("node:assert");
const { planJetLag, textoJetLag, antesDeSalir, JETLAG_MINIMO } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("a Japón, ocho horas por delante: tres noches antes y ocho días allí", () => {
  assert.deepEqual(planJetLag(480), { diferencia: 480, este: true, noches: 3, dias: 8 });
});

test("hacia el oeste se lleva mejor: dos días de cada tres horas", () => {
  assert.deepEqual(planJetLag(-360), { diferencia: -360, este: false, noches: 3, dias: 4 });
  assert.equal(planJetLag(-540).dias, 6);
});

test("con menos de tres horas no hay plan", () => {
  assert.equal(planJetLag(60), null, "Londres o Canarias");
  assert.equal(planJetLag(-120), null);
  assert.equal(planJetLag(JETLAG_MINIMO - 1), null);
  assert.equal(planJetLag(0), null);
  assert.equal(planJetLag(null), null);
  assert.equal(planJetLag(undefined), null);
});

test("justo tres horas ya cuenta, con sus tres noches", () => {
  assert.deepEqual(planJetLag(180), { diferencia: 180, este: true, noches: 3, dias: 3 });
});

test("más de doce horas por delante se llevan como si fueran por detrás", () => {
  // +13 es lo mismo que −11 para el cuerpo: trasnochar, no madrugar.
  const plan = planJetLag(780);
  assert.equal(plan.este, false);
  assert.equal(plan.dias, 8);
  assert.equal(plan.diferencia, 780, "pero la diferencia que se enseña es la de verdad");
});

test("las medias horas de la India redondean a la hora", () => {
  assert.equal(planJetLag(270).dias, 5);
});

test("el texto dice hacia dónde mover el sueño", () => {
  ponerIdioma("es");
  assert.equal(textoJetLag(planJetLag(480)), "Jet lag de +8 h: las 3 noches de antes, acuéstate una hora más pronto cada día. Allí, unos 8 días hasta hacerte");
  assert.match(textoJetLag(planJetLag(-360)), /^Jet lag de −6 h: .* una hora más tarde cada día\. Allí, unos 4 días/);
  ponerIdioma("en");
  assert.match(textoJetLag(planJetLag(480)), /^Jet lag of \+8 h: on the 3 nights before, go to bed an hour earlier/);
  assert.equal(textoJetLag(null), "");
  ponerIdioma("es");
});

test("va el último en lo de antes de salir, y solo si sé la diferencia", () => {
  ponerIdioma("es");
  const con = antesDeSalir("JPY", "EUR", 480);
  assert.equal(con.at(-1).clave, "jetlag");
  assert.equal(antesDeSalir("JPY", "EUR").some((c) => c.clave === "jetlag"), false, "sin la diferencia, como antes");
  assert.equal(antesDeSalir("GBP", "EUR", -60).some((c) => c.clave === "jetlag"), false);
});
