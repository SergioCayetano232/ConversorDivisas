const { test } = require("node:test");
const assert = require("node:assert");
const {
  leerPorcentajeAviso, crearAvisoPorcentaje, leerAvisos, avisoCumplido, repartirAvisos, faltaParaAviso, mensajeAviso,
} = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("entiende el porcentaje con y sin signo", () => {
  assert.deepEqual(leerPorcentajeAviso("2 %"), { pct: 2, signo: 0 });
  assert.deepEqual(leerPorcentajeAviso("+2%"), { pct: 2, signo: 1 });
  assert.deepEqual(leerPorcentajeAviso("-1,5 %"), { pct: 1.5, signo: -1 });
  assert.deepEqual(leerPorcentajeAviso("−0.5%"), { pct: 0.5, signo: -1 });
});

test("lo que no es un porcentaje, o uno sin sentido, no vale", () => {
  for (const texto of ["1,15", "2", "%", "0 %", "60 %", "dos %", "", null]) {
    assert.equal(leerPorcentajeAviso(texto), null, String(texto));
  }
});

test("con signo es un aviso normal con la tasa ya calculada", () => {
  const sube = crearAvisoPorcentaje("EUR", "USD", { pct: 2, signo: 1 }, 1.1, "a");
  assert.equal(sube.sentido, "sube");
  assert.ok(Math.abs(sube.umbral - 1.122) < 1e-12);
  const baja = crearAvisoPorcentaje("EUR", "USD", { pct: 1, signo: -1 }, 1.1, "b");
  assert.equal(baja.sentido, "baja");
  assert.ok(Math.abs(baja.umbral - 1.089) < 1e-12);
});

test("sin signo guarda la tasa de ahora y el porcentaje", () => {
  assert.deepEqual(crearAvisoPorcentaje("EUR", "USD", { pct: 2, signo: 0 }, 1.1, "c"),
    { id: "c", from: "EUR", to: "USD", sentido: "mueve", umbral: 1.1, pct: 2 });
  assert.equal(crearAvisoPorcentaje("EUR", "EUR", { pct: 2, signo: 0 }, 1, "c"), null);
  assert.equal(crearAvisoPorcentaje("EUR", "USD", { pct: 2, signo: 0 }, null, "c"), null);
});

test("salta al moverse eso para cualquier lado", () => {
  const aviso = { id: "c", from: "EUR", to: "USD", sentido: "mueve", umbral: 1.1, pct: 2 };
  assert.equal(avisoCumplido(aviso, 1.11), false);
  assert.equal(avisoCumplido(aviso, 1.09), false);
  assert.equal(avisoCumplido(aviso, 1.122), true);
  assert.equal(avisoCumplido(aviso, 1.078), true);
  assert.equal(avisoCumplido(aviso, undefined), false);
  const { cumplidos } = repartirAvisos([aviso], { EUR: { USD: 1.2 } });
  assert.equal(cumplidos.length, 1);
});

test("se guardan y se leen, y los que no cuadran se tiran", () => {
  const bueno = { id: "c", from: "EUR", to: "USD", sentido: "mueve", umbral: 1.1, pct: 2 };
  assert.deepEqual(leerAvisos([bueno, { ...bueno, id: "d", pct: 0 }, { ...bueno, id: "e", pct: undefined }]), [bueno]);
});

test("lo que falta es lo que queda hasta el porcentaje, también con el par al revés", () => {
  const aviso = { id: "c", from: "EUR", to: "USD", sentido: "mueve", umbral: 1.1, pct: 2 };
  assert.ok(Math.abs(faltaParaAviso(aviso, { from: "EUR", to: "USD" }, 1.111) - 0.01) < 1e-9);
  assert.ok(Math.abs(faltaParaAviso(aviso, { from: "USD", to: "EUR" }, 1 / 1.089) - 0.01) < 1e-9);
  assert.equal(faltaParaAviso(aviso, { from: "EUR", to: "USD" }, 1.2), 0);
});

test("el mensaje dice cuánto se ha movido y hacia dónde", () => {
  ponerIdioma("es");
  const aviso = { id: "c", from: "EUR", to: "USD", sentido: "mueve", umbral: 1.1, pct: 2 };
  assert.match(mensajeAviso(aviso, 1.1253).cuerpo, /^Ha subido un 2,3\s% desde 1,1000, como pediste\.$/);
  assert.match(mensajeAviso(aviso, 1.0747).cuerpo, /^Ha bajado un 2,3\s% desde 1,1000, como pediste\.$/);
});
