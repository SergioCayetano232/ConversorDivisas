const { test } = require("node:test");
const assert = require("node:assert");
const { panelSalidas, PANEL_MAX } = require("../logica.js");

const ultimas = (letras) => letras.map((l) => l.at(-1)).join("");

test("cada letra acaba en la de la divisa nueva", () => {
  assert.equal(ultimas(panelSalidas("USD", "EUR")), "EUR");
  assert.equal(ultimas(panelSalidas("JPY", "GBP")), "GBP");
});

test("la letra que no cambia no gira", () => {
  assert.deepEqual(panelSalidas("CAD", "AUD")[2], ["D"]);
  assert.deepEqual(panelSalidas("USD", "UYU")[0], ["U"]);
});

test("gira hacia delante y de la Z vuelve a la A", () => {
  assert.deepEqual(panelSalidas("YEN", "BEN")[0], ["Y", "Z", "A", "B"]);
  assert.deepEqual(panelSalidas("CAD", "EAD")[0], ["C", "D", "E"]);
});

test("las vueltas largas se acortan y empiezan más cerca", () => {
  const letra = panelSalidas("USD", "EUR")[0];
  assert.equal(letra.length, PANEL_MAX + 1);
  assert.deepEqual(letra, ["W", "X", "Y", "Z", "A", "B", "C", "D", "E"]);
});

test("sin divisa de antes sale la nueva tal cual", () => {
  assert.deepEqual(panelSalidas("", "EUR"), [["E"], ["U"], ["R"]]);
});
