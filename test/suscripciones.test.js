const { test } = require("node:test");
const assert = require("node:assert");
const {
  SUSCRIPCIONES_MAX, crearSuscripcion, leerSuscripciones, ponerSuscripcion, quitarSuscripcion, cuentaSuscripciones,
} = require("../logica.js");

const netflix = { id: "n", nombre: "Netflix", importe: 15.49, divisa: "USD", to: "EUR", periodo: "mes", alta: "2024-03-01", tasa: 0.92 };
const icloud = { id: "i", nombre: "iCloud", importe: 99, divisa: "GBP", to: "EUR", periodo: "anio", alta: "2025-01-10", tasa: 1.2 };

test("se crean limpias, y las malas no", () => {
  assert.deepEqual(crearSuscripcion({ ...netflix, nombre: "  Netflix   4K " }).nombre, "Netflix 4K");
  assert.equal(crearSuscripcion({ ...netflix, importe: 0 }), null);
  assert.equal(crearSuscripcion({ ...netflix, divisa: "EUR" }), null, "en tu misma divisa no hay cambio que mirar");
  assert.equal(crearSuscripcion({ ...netflix, periodo: "semana" }), null);
  assert.equal(crearSuscripcion({ ...netflix, alta: "1 mar" }), null);
  assert.equal(crearSuscripcion({ ...netflix, tasa: NaN }), null);
  assert.equal(crearSuscripcion({ ...netflix, nombre: "  " }), null);
});

test("leer lo guardado: sin repetidas ni rotas", () => {
  assert.deepEqual(leerSuscripciones(undefined), []);
  const leidas = leerSuscripciones([netflix, { ...netflix, nombre: "Otra" }, null, { id: "x" }, icloud]);
  assert.deepEqual(leidas.map((s) => s.id), ["n", "i"]);
});

test("poner una con el mismo nombre le cambia el precio", () => {
  const una = ponerSuscripcion([], netflix);
  const subida = ponerSuscripcion(una, { ...netflix, id: "z", nombre: "netflix", importe: 17.99 });
  assert.equal(subida.length, 1);
  assert.deepEqual([subida[0].id, subida[0].importe], ["n", 17.99], "se queda con su id");
});

test("caben doce, y se quitan", () => {
  let lista = [];
  for (let i = 0; i < SUSCRIPCIONES_MAX + 2; i += 1) lista = ponerSuscripcion(lista, { ...netflix, id: `s${i}`, nombre: `S${i}` });
  assert.equal(lista.length, SUSCRIPCIONES_MAX);
  assert.equal(quitarSuscripcion(lista, "s0").length, SUSCRIPCIONES_MAX - 1);
});

test("al mes, al año y lo que te ha subido por el cambio", () => {
  const { filas, totales } = cuentaSuscripciones([icloud, netflix], { EUR: { USD: 0.95, GBP: 1.14 } });
  const [n, i] = filas;
  assert.equal(n.id, "n", "la más cara al mes primero");
  assert.ok(Math.abs(n.alMes - 15.49 * 0.95) < 1e-9);
  assert.ok(Math.abs(n.alAnio - 15.49 * 0.95 * 12) < 1e-9);
  assert.ok(Math.abs(n.cambio - (0.95 / 0.92 - 1)) < 1e-9);
  assert.ok(Math.abs(n.diferenciaAnio - 15.49 * 0.03 * 12) < 1e-9);
  assert.ok(Math.abs(i.alMes - (99 * 1.14) / 12) < 1e-9);
  assert.ok(Math.abs(i.cambio - (1.14 / 1.2 - 1)) < 1e-9, "la libra ha bajado: te sale más barata");
  assert.ok(i.diferenciaAnio < 0);
  assert.equal(totales.length, 1);
  assert.equal(totales[0].n, 2);
  assert.ok(Math.abs(totales[0].alMes - (n.alMes + i.alMes)) < 1e-9);
});

test("un cambio de nada es que no ha cambiado", () => {
  const { filas } = cuentaSuscripciones([netflix], { EUR: { USD: 0.921 } });
  assert.equal(filas[0].cambio, 0);
});

test("sin la tasa de hoy sale sin cifras y no cuenta en el total", () => {
  const { filas, totales } = cuentaSuscripciones([icloud, netflix], { EUR: { USD: 0.95 } });
  assert.equal(filas.find((f) => f.id === "i").alMes, null);
  assert.equal(filas.at(-1).id, "i", "las que no tienen cifra, al final");
  assert.equal(totales[0].n, 1);
});

test("si tu divisa cambió, los totales no se mezclan", () => {
  const { totales } = cuentaSuscripciones([netflix, { ...icloud, to: "USD", divisa: "GBP" }, { ...netflix, id: "m", nombre: "Max" }], { EUR: { USD: 0.95 }, USD: { GBP: 1.3 } });
  assert.deepEqual(totales.map((t) => [t.to, t.n]), [["EUR", 2], ["USD", 1]]);
});

test("tu divisa: la de tus gastos, si no la de tu idioma, si no la de abajo", () => {
  const { tuDivisa } = require("../logica.js");
  const g = (to) => ({ to });
  assert.equal(tuDivisa({ viajes: [{ gastos: [g("EUR"), g("EUR"), g("USD")] }], idiomas: ["en-US"] }), "EUR");
  assert.equal(tuDivisa({ viajes: [{ gastos: [] }], idiomas: ["es", "es-MX"] }), "MXN", "el primero que tenga país");
  assert.equal(tuDivisa({ idiomas: ["fr"], par: { from: "EUR", to: "CHF" } }), "CHF");
  assert.equal(tuDivisa(), "EUR");
});

test("van en la copia de seguridad, limpias", () => {
  const { limpiarCopia, CLAVES_COPIA } = require("../logica.js");
  assert.ok(CLAVES_COPIA.includes("suscripciones"));
  assert.deepEqual(limpiarCopia({ suscripciones: [netflix, { id: "rota" }] }).suscripciones.map((s) => s.id), ["n"]);
  assert.equal("suscripciones" in limpiarCopia({}), false, "las copias de antes no traen nada");
});
