const { test } = require("node:test");
const assert = require("node:assert");
const {
  crearCompra, leerAvisos, avisoCumplido, repartirAvisos, mensajeAviso, faltaParaAviso,
} = require("../logica.js");

// 180 USD a 0,92 son 165,60 EUR.
const compra = () => crearCompra("USD", "EUR", 180, 160, 0.92, "c1");

test("una compra es un aviso que baja hasta el máximo entre el precio", () => {
  const c = compra();
  assert.deepEqual(c, { id: "c1", from: "USD", to: "EUR", sentido: "baja", umbral: 160 / 180, precio: 180, maximo: 160 });
});

test("si ya cuesta eso o menos no tiene sentido", () => {
  assert.equal(crearCompra("USD", "EUR", 180, 165.6, 0.92, "x"), null, "lo mismo que ahora");
  assert.equal(crearCompra("USD", "EUR", 180, 170, 0.92, "x"), null, "más de lo que cuesta");
  assert.ok(crearCompra("USD", "EUR", 180, 165.59, 0.92, "x"), "un céntimo menos sí");
});

test("crearCompra rechaza lo que falta o está mal", () => {
  assert.equal(crearCompra("USD", "USD", 180, 160, 1, "x"), null, "misma divisa");
  assert.equal(crearCompra("USD", "XXX", 180, 160, 0.92, "x"), null, "divisa rara");
  assert.equal(crearCompra("USD", "EUR", 0, 160, 0.92, "x"), null, "sin precio");
  assert.equal(crearCompra("USD", "EUR", 180, 0, 0.92, "x"), null, "sin máximo");
  assert.equal(crearCompra("USD", "EUR", 180, 160, null, "x"), null, "sin tasa");
});

test("salta cuando el precio queda en el máximo o por debajo", () => {
  const c = compra();
  assert.equal(avisoCumplido(c, 0.9), false, "162 EUR");
  assert.equal(avisoCumplido(c, 160 / 180), true, "160 justos");
  assert.equal(avisoCumplido(c, 0.88), true, "158,40 EUR");
  const { cumplidos, pendientes } = repartirAvisos([c], { USD: { EUR: 0.88 } });
  assert.equal(cumplidos.length, 1);
  assert.equal(pendientes.length, 0);
});

test("leerAvisos guarda las compras y tira las rotas", () => {
  const c = compra();
  const rotas = [{ ...c, id: "r1", precio: -1 }, { ...c, id: "r2", maximo: "160" }, { ...c, id: "r3", sentido: "sube" }];
  assert.deepEqual(leerAvisos([c, ...rotas]), [c]);
});

test("los avisos de antes, sin precio, siguen valiendo", () => {
  const viejo = { id: "a1", from: "EUR", to: "USD", sentido: "sube", umbral: 1.15 };
  assert.deepEqual(leerAvisos([viejo]), [viejo]);
});

test("el mensaje habla del precio, no de la tasa", () => {
  const m = mensajeAviso(compra(), 0.88);
  assert.equal(m.titulo, "180,00 USD ya son 158,40 EUR");
  assert.equal(m.cuerpo, "Por debajo de los 160,00 EUR que querías pagar.");
});

test("lo que falta se cuenta igual que en un aviso de tasa", () => {
  const falta = faltaParaAviso(compra(), { from: "USD", to: "EUR" }, 0.92);
  assert.ok(Math.abs(falta - (1 - 160 / 165.6)) < 1e-9);
  assert.ok(faltaParaAviso(compra(), { from: "EUR", to: "USD" }, 1 / 0.92) > 0, "con el par al revés también");
});
