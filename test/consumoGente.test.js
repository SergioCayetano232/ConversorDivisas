const { test } = require("node:test");
const assert = require("node:assert");
const { crearGasto, consumoGente, porPersona, resumenParaCompartir } = require("../logica.js");

const el = (dia) => new Date(`${dia}T12:00:00`).getTime();
const gasto = (id, dia, valor, extra = {}) => crearGasto({
  id, from: "JPY", to: "EUR", cantidad: valor * 160, valor, concepto: "Cena", cuando: el(dia), categoria: "comida", ...extra,
});

// Tres días, tres personas: cenas de todos y un museo solo de Ana (1) y tuyo.
// Del más nuevo al más viejo, que es como los guarda el popup.
const viaje = [
  gasto("c", "2026-11-03", 60, { pagador: 2 }),
  gasto("b", "2026-11-02", 40, { concepto: "Museo", categoria: "ocio", entre: [0, 1] }),
  gasto("a", "2026-11-01", 90),
];

test("a cada uno lo suyo, pague quien pague", () => {
  const c = consumoGente(viaje, 3);
  assert.equal(c.igual, false);
  assert.deepEqual(c.gente.map((p) => p.parte), [70, 70, 50]);
  assert.deepEqual(c.gente.map((p) => Math.round(p.fraccion * 1000) / 1000), [0.368, 0.368, 0.263]);
  // 70 en 3 días.
  assert.equal(Math.round(c.gente[0].alDia * 100), 2333);
});

test("si todos entran en todo, es igual para todos", () => {
  const c = consumoGente([gasto("a", "2026-11-01", 90), gasto("c", "2026-11-03", 60)], 3);
  assert.equal(c.igual, true);
  assert.deepEqual(c.gente.map((p) => p.parte), [50, 50, 50]);
});

test("lo pagado aparte cuenta en lo suyo pero no en lo de al día", () => {
  const vuelo = gasto("v", "2026-09-01", 300, { concepto: "Vuelo", categoria: "transporte", fijo: true, entre: [0] });
  const c = consumoGente([...viaje, vuelo], 3);
  assert.equal(c.gente[0].parte, 370);
  assert.equal(Math.round(c.gente[0].alDia * 100), 2333);
});

test("solo, o sin gastos, no hay nada que repartir", () => {
  assert.equal(consumoGente(viaje, 1), null);
  assert.equal(consumoGente([], 3), null);
});

test("el por cabeza pasa a ser lo tuyo cuando no todos entran en todo", () => {
  const cabeza = porPersona(viaje, 3);
  assert.equal(cabeza.tuyo, true);
  assert.equal(cabeza.total, 70);
  const igual = porPersona([gasto("a", "2026-11-01", 90)], 3);
  assert.equal(igual.tuyo, undefined);
  assert.equal(igual.total, 30);
});

test("en WhatsApp sale lo de cada uno con su nombre", () => {
  const texto = resumenParaCompartir({ nombre: "Japón", gastos: viaje, presupuesto: null, personas: 3, gente: ["", "Ana", "Luis"] }, "2026-11-03");
  assert.match(texto, /👥 Lo de cada uno: Tú \*70,00 EUR\* · Ana \*70,00 EUR\* · Luis \*50,00 EUR\*/);
  assert.doesNotMatch(texto, /Entre 3/);
});
