const { test } = require("node:test");
const assert = require("node:assert");
const { FOTOGRAMAS_MONEDA, vueltaMoneda } = require("../logica.js");

test("empieza y acaba de cara, a todo lo ancho", () => {
  const vuelta = vueltaMoneda();
  assert.equal(vuelta.length, FOTOGRAMAS_MONEDA + 1);
  assert.deepEqual(vuelta[0], { ancho: 1, dorso: false });
  assert.deepEqual(vuelta.at(-1), { ancho: 1, dorso: false });
});

test("por en medio enseña el dorso", () => {
  const dorsos = vueltaMoneda().filter((f) => f.dorso);
  assert.ok(dorsos.length >= 3);
  assert.ok(dorsos.some((f) => f.ancho > 0.9));
});

test("nunca desaparece del todo", () => {
  for (const { ancho } of vueltaMoneda(60)) assert.ok(ancho >= 0.08 && ancho <= 1);
});

test("frena al final: los últimos fotogramas casi no se mueven", () => {
  const vuelta = vueltaMoneda();
  const salto = (i) => Math.abs(vuelta[i].ancho - vuelta[i - 1].ancho);
  assert.ok(salto(vuelta.length - 1) < salto(2));
});
