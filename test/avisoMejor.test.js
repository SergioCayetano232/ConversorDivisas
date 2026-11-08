const { test } = require("node:test");
const assert = require("node:assert");
const {
  techoDeSerie, crearAvisoMejor, ponerTechos, leerAvisos, avisoCumplido, repartirAvisos, faltaParaAviso, mensajeAviso,
} = require("../logica.js");

const serie = (...ultimos) => [...Array(30).fill(1), ...ultimos];
const aviso = (umbral = 1.2) => ({ id: "a", from: "EUR", to: "USD", sentido: "mejor", umbral });

test("el techo no cuenta el último, que es el de ahora", () => {
  assert.equal(techoDeSerie(serie(1.2, 1.1)), 1.2);
  assert.equal(techoDeSerie(serie(1.1, 1.3)), 1.1);
});

test("con menos de 20 puntos no hay techo", () => {
  assert.equal(techoDeSerie(Array(19).fill(1)), null);
  assert.equal(techoDeSerie(undefined), null);
  assert.equal(techoDeSerie(Array(20).fill(1)), 1);
});

test("los huecos no estropean la serie", () => {
  assert.equal(techoDeSerie([...serie(1.2), NaN, null, 1.1]), 1.2);
});

test("se crea con el techo de umbral", () => {
  assert.deepEqual(crearAvisoMejor("EUR", "USD", 1.2, 1.1, "a"), aviso());
});

test("si ya está en lo más alto no se crea", () => {
  assert.equal(crearAvisoMejor("EUR", "USD", 1.2, 1.2, "a"), null);
  assert.equal(crearAvisoMejor("EUR", "USD", 1.2, 1.3, "a"), null);
  assert.equal(crearAvisoMejor("EUR", "EUR", 1.2, 1.1, "a"), null);
  assert.equal(crearAvisoMejor("EUR", "USD", 0, 1.1, "a"), null);
});

test("sobrevive a la lectura y los de siempre no cambian", () => {
  assert.deepEqual(leerAvisos([aviso()]), [aviso()]);
  assert.deepEqual(leerAvisos([{ ...aviso(), sentido: "rara" }]), []);
});

test("salta al superar el máximo, no al igualarlo", () => {
  assert.equal(avisoCumplido(aviso(), 1.2), false);
  assert.equal(avisoCumplido(aviso(), 1.1), false);
  assert.equal(avisoCumplido(aviso(), 1.2001), true);
});

test("el pico que se sale de los tres meses baja el umbral", () => {
  const techo = techoDeSerie(serie(1.05, 1.1));
  const [nuevo] = ponerTechos([aviso()], { a: techo });
  assert.equal(nuevo.umbral, 1.05);
  assert.equal(avisoCumplido(nuevo, 1.1), true);
});

test("ponerTechos solo toca los de mejor tasa", () => {
  const otro = { id: "b", from: "EUR", to: "USD", sentido: "sube", umbral: 1.3 };
  const lista = ponerTechos([otro, aviso()], { b: 9 });
  assert.equal(lista[0].umbral, 1.3);
  assert.equal(lista[1].umbral, 1.2);
});

test("sin serie se queda con el umbral que tenía", () => {
  const { cumplidos, pendientes } = repartirAvisos(ponerTechos([aviso()], {}), { EUR: { USD: 1.25 } });
  assert.equal(cumplidos.length, 1);
  assert.equal(pendientes.length, 0);
});

test("dice cuánto le falta, también con el par al revés", () => {
  assert.ok(Math.abs(faltaParaAviso(aviso(), { from: "EUR", to: "USD" }, 1.1) - (1.2 / 1.1 - 1)) < 1e-9);
  assert.ok(Math.abs(faltaParaAviso(aviso(), { from: "USD", to: "EUR" }, 1 / 1.1) - (1.2 / 1.1 - 1)) < 1e-9);
});

test("la notificación dice lo que había", () => {
  const { titulo, cuerpo } = mensajeAviso(aviso(), 1.21);
  assert.match(titulo, /1 EUR ya está a 1,21/);
  assert.match(cuerpo, /mejor tasa en 3 meses/);
  assert.match(cuerpo, /1,2/);
});
