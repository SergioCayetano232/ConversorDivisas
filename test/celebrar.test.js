const { test } = require("node:test");
const assert = require("node:assert");
const { viajeParaCelebrar, textoCelebrar, leerCelebrados, anadirCelebrado, CELEBRADOS_MAX } = require("../logica.js");

const el = (dia, valor, to = "EUR") => ({ to, valor, cuando: new Date(`${dia}T12:00`).getTime() });
const viaje = (gastos) => ({ id: "j", gastos, presupuesto: { importe: 1000, to: "EUR", desde: "2026-10-01", hasta: "2026-10-10" } });

test("acabado y sin pasarte, se celebra con lo que sobra", () => {
  assert.deepEqual(viajeParaCelebrar(viaje([el("2026-10-02", 880)]), [], "2026-10-11"), { sobra: 120, to: "EUR" });
});

test("el último día aún no, y pasado del presupuesto tampoco", () => {
  assert.equal(viajeParaCelebrar(viaje([el("2026-10-02", 880)]), [], "2026-10-10"), null);
  assert.equal(viajeParaCelebrar(viaje([el("2026-10-02", 1001)]), [], "2026-10-11"), null);
});

test("sin gastos o sin presupuesto, no hay nada que celebrar", () => {
  assert.equal(viajeParaCelebrar(viaje([]), [], "2026-10-11"), null);
  assert.equal(viajeParaCelebrar(viaje([el("2026-10-02", 50, "JPY")]), [], "2026-10-11"), null);
  assert.equal(viajeParaCelebrar({ id: "j", gastos: [el("2026-10-02", 5)], presupuesto: null }, [], "2026-10-11"), null);
});

test("una vez celebrado, ya no", () => {
  assert.equal(viajeParaCelebrar(viaje([el("2026-10-02", 880)]), ["j"], "2026-10-11"), null);
});

test("el texto, con lo que sobra o clavado", () => {
  assert.equal(textoCelebrar({ sobra: 120, to: "EUR" }), "¡Viaje cerrado con 120,00 EUR de sobra!");
  assert.equal(textoCelebrar({ sobra: 0, to: "EUR" }), "¡Viaje cerrado clavando el presupuesto!");
});

test("la lista de celebrados se limpia y no crece sin fin", () => {
  assert.deepEqual(leerCelebrados(["a", "a", 3, "", "b"]), ["a", "b"]);
  assert.deepEqual(leerCelebrados("nada"), []);
  assert.deepEqual(anadirCelebrado(["a", "b"], "a"), ["b", "a"]);
  const muchos = Array.from({ length: CELEBRADOS_MAX }, (_, i) => `v${i}`);
  const con = anadirCelebrado(muchos, "nuevo");
  assert.equal(con.length, CELEBRADOS_MAX);
  assert.equal(con.at(-1), "nuevo");
  assert.equal(con[0], "v1");
});
