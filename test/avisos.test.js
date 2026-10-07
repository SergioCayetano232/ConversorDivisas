const { test } = require("node:test");
const assert = require("node:assert");
const {
  AVISOS_MAX, sentidoAviso, crearAviso, leerAvisos, avisoCumplido, repartirAvisos, mensajeAviso, faltaParaAviso, cercaniaAviso, textoFalta,
} = require("../logica.js");

const aviso = (extra) => ({ id: "a1", from: "EUR", to: "USD", sentido: "sube", umbral: 1.15, ...extra });

test("el sentido sale de dónde está el umbral respecto a la tasa", () => {
  assert.equal(sentidoAviso(1.15, 1.1355), "sube");
  assert.equal(sentidoAviso(1.10, 1.1355), "baja");
});

test("sin sentido si el umbral es la tasa de ahora o falta algo", () => {
  assert.equal(sentidoAviso(1.1355, 1.1355), null);
  assert.equal(sentidoAviso(null, 1.1355), null);
  assert.equal(sentidoAviso(1.15, null), null);
});

test("crearAviso monta el aviso con su sentido", () => {
  assert.deepEqual(crearAviso("EUR", "USD", 1.15, 1.1355, "x"), { id: "x", from: "EUR", to: "USD", sentido: "sube", umbral: 1.15 });
  assert.equal(crearAviso("EUR", "USD", 1.10, 1.1355, "x").sentido, "baja");
});

test("crearAviso rechaza lo que no tiene sentido", () => {
  assert.equal(crearAviso("EUR", "USD", 1.1355, 1.1355, "x"), null, "igual que ahora");
  assert.equal(crearAviso("EUR", "EUR", 2, 1, "x"), null, "misma divisa");
  assert.equal(crearAviso("EUR", "XXX", 2, 1, "x"), null, "divisa rara");
  assert.equal(crearAviso("EUR", "USD", null, 1.1355, "x"), null, "sin umbral");
  assert.equal(crearAviso("EUR", "USD", 0, 1.1355, "x"), null, "cero");
});

test("leerAvisos aguanta lo que venga", () => {
  assert.deepEqual(leerAvisos(undefined), []);
  assert.deepEqual(leerAvisos("x"), []);
  const guardado = [aviso(), aviso({ id: 5 }), aviso({ to: "XXX" }), aviso({ sentido: "raro" }), aviso({ umbral: -1 }), null];
  assert.deepEqual(leerAvisos(guardado), [aviso()]);
});

test("leerAvisos no pasa del máximo", () => {
  const muchos = Array.from({ length: 7 }, (_, i) => aviso({ id: `a${i}` }));
  assert.equal(leerAvisos(muchos).length, AVISOS_MAX);
});

test("uno que sube se cumple al llegar o pasar", () => {
  assert.equal(avisoCumplido(aviso(), 1.14), false);
  assert.equal(avisoCumplido(aviso(), 1.15), true);
  assert.equal(avisoCumplido(aviso(), 1.16), true);
});

test("uno que baja se cumple al llegar o quedarse por debajo", () => {
  const baja = aviso({ sentido: "baja", umbral: 1.10 });
  assert.equal(avisoCumplido(baja, 1.11), false);
  assert.equal(avisoCumplido(baja, 1.10), true);
  assert.equal(avisoCumplido(baja, 1.09), true);
});

test("sin tasa no se cumple", () => {
  assert.equal(avisoCumplido(aviso(), undefined), false);
});

test("repartirAvisos separa los cumplidos de los que siguen esperando", () => {
  const a = aviso({ id: "a" });
  const b = aviso({ id: "b", to: "GBP", sentido: "baja", umbral: 0.85 });
  const c = aviso({ id: "c", from: "USD", to: "JPY", umbral: 200 });
  const tasas = { EUR: { USD: 1.16, GBP: 0.86 } };
  const { cumplidos, pendientes } = repartirAvisos([a, b, c], tasas);
  assert.deepEqual(cumplidos, [{ aviso: a, rate: 1.16 }]);
  assert.deepEqual(pendientes.map((x) => x.id), ["b", "c"], "c sigue aunque no haya tasas de USD");
});

test("el mensaje dice cuánto vale y qué pediste", () => {
  const limpio = (t) => t.replace(/ /g, " ");
  const m = mensajeAviso(aviso(), 1.1512);
  assert.equal(limpio(m.titulo), "1 EUR ya está a 1,1512 USD");
  assert.equal(limpio(m.cuerpo), "Ha subido de 1,1500, como pediste.");
  assert.equal(mensajeAviso(aviso({ sentido: "baja", umbral: 1.1 }), 1.09).cuerpo, "Ha bajado de 1,1000, como pediste.");
});

test("compara con la tasa como se ve, a cuatro decimales", () => {
  // El caso de la captura: 1 AUD = 0,70049… USD se enseña como 0,7005.
  assert.equal(sentidoAviso(0.7005, 0.700494), null);
  assert.equal(sentidoAviso(0.7005, 0.700512), null);
  assert.equal(sentidoAviso(0.7006, 0.700494), "sube");
  assert.equal(sentidoAviso(0.7004, 0.700512), "baja");
  assert.equal(crearAviso("AUD", "USD", 0.7005, 0.700494, "x"), null);
});

test("con tasas grandes también redondea a cuatro decimales", () => {
  assert.equal(sentidoAviso(20350.09, 20350.090004), null);
  assert.equal(sentidoAviso(20351, 20350.09), "sube");
});

const eurUsd = { from: "EUR", to: "USD" };

test("lo que falta para que salte, en los dos sentidos", () => {
  const sube = { from: "EUR", to: "USD", sentido: "sube", umbral: 1.15 };
  const baja = { from: "EUR", to: "USD", sentido: "baja", umbral: 1.0 };
  assert.ok(Math.abs(faltaParaAviso(sube, eurUsd, 1.1) - 0.05 / 1.1) < 1e-12);
  assert.ok(Math.abs(faltaParaAviso(baja, eurUsd, 1.25) - 0.2) < 1e-12);
  // Si ya ha pasado y aún no ha llegado la notificación, cero, no negativo.
  assert.equal(faltaParaAviso(sube, eurUsd, 1.2), 0);
});

test("con el par dado la vuelta también sale, y con otro par no", () => {
  const sube = { from: "EUR", to: "USD", sentido: "sube", umbral: 1.1 };
  assert.ok(Math.abs(faltaParaAviso(sube, { from: "USD", to: "EUR" }, 1 / 1.0) - 0.1) < 1e-12);
  assert.equal(faltaParaAviso(sube, { from: "EUR", to: "GBP" }, 0.85), null);
  assert.equal(faltaParaAviso(sube, eurUsd, null), null);
});

test("la pastilla se llena según se acerca, y el texto va con un decimal", () => {
  const { ponerIdioma } = require("../textos.js");
  ponerIdioma("es");
  assert.equal(cercaniaAviso(0), 1);
  assert.ok(Math.abs(cercaniaAviso(0.01) - 0.8) < 1e-12);
  assert.equal(cercaniaAviso(0.05), 0);
  assert.equal(cercaniaAviso(0.3), 0);
  assert.equal(textoFalta(0.0291).replace(/\u00a0/g, " "), "Le falta un 2,9 % para saltar");
  assert.equal(textoFalta(0.0004), "Está al caer");
});
