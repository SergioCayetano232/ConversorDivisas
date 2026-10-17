const { test } = require("node:test");
const assert = require("node:assert");
const { TRUCO_TOLERANCIA, trucoDeCabeza, textoTruco, tituloTruco } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const texto = (rate) => textoTruco(trucoDeCabeza(rate));

test("cerca del euro, con un porcentaje", () => {
  assert.equal(texto(1.08), "Súmale un 10 %");
  assert.equal(texto(0.85), "Quítale un 15 %");
});

test("si es casi igual, lo dice", () => {
  assert.equal(texto(1.01), "Es casi lo mismo");
});

test("de yenes a euros, quitando ceros", () => {
  assert.equal(texto(0.0058), "Quita 3 ceros, × 6");
});

test("de euros a yenes, por un número redondo", () => {
  assert.equal(texto(172), "Multiplica por 170");
});

test("mejor dividir entre 20 que quitar un cero y por 5", () => {
  assert.equal(texto(0.049), "Divide entre 20");
});

test("las coronas danesas, entre 7,5", () => {
  assert.equal(texto(0.134), "Divide entre 7,5");
});

test("con las rupias indonesias no hace dividir entre 18.000", () => {
  assert.equal(texto(0.000055), "Quita 3 ceros, ÷ 18");
  assert.equal(texto(18000), "× 18, pon 3 ceros");
});

test("nunca se aparta más de un 5 %, y casi nunca más del 4", () => {
  // De 0,0001 a 100.000, con pasos que no caen en números redondos.
  let fuera = 0;
  let total = 0;
  for (let r = 0.0001; r < 100000; r *= 1.037) {
    const t = trucoDeCabeza(r);
    assert.ok(Math.abs(t.desvio) <= 0.05, `${r}: ${textoTruco(t)}`);
    if (Math.abs(t.desvio) > TRUCO_TOLERANCIA) fuera++;
    total++;
  }
  assert.ok(fuera / total < 0.05, `${fuera} de ${total}`);
});

test("la cuenta del truco es la que dice el texto", () => {
  const t = trucoDeCabeza(0.0058);
  assert.ok(Math.abs(t.factor - 0.006) < 1e-12);
  assert.ok(Math.abs(t.desvio - (0.006 / 0.0058 - 1)) < 1e-12);
});

test("el título dice cuánto se aparta", () => {
  assert.equal(tituloTruco(trucoDeCabeza(0.0058)), "Para calcular de cabeza. Sale un 3 % de más");
  assert.equal(tituloTruco(trucoDeCabeza(1.17)), "Para calcular de cabeza. Sale un 2 % de menos");
  assert.equal(tituloTruco(trucoDeCabeza(0.04)), "Para calcular de cabeza. Sale clavado");
});

test("sin tasa no hay truco", () => {
  for (const mala of [null, undefined, 0, -1, NaN, Infinity]) {
    assert.equal(trucoDeCabeza(mala), null, String(mala));
  }
  assert.equal(textoTruco(null), "");
  assert.equal(tituloTruco(null), "");
});

test("en inglés", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto(0.0058), "Drop 3 zeros, × 6");
    assert.equal(texto(0.134), "Divide by 7.5");
    assert.equal(texto(1.08), "Add 10%");
  } finally {
    ponerIdioma("es");
  }
});
