const { test } = require("node:test");
const assert = require("node:assert");
const { leerRitmo, convertirRitmo, textoRitmo, leerDistancia, leerOmnibox } = require("../logica.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoRitmo(leerRitmo(t));

test("lee el ritmo en minutos o en minutos y segundos", () => {
  for (const t of ["9 min/mi", "9min/mi", "9/mi", "9 min / mile", "9 minutos por milla", "9:00/mi"]) assert.deepEqual(leerRitmo(t), { segundos: 540, de: "mi" }, t);
  assert.deepEqual(leerRitmo("8:30 min/mi"), { segundos: 510, de: "mi" });
  assert.deepEqual(leerRitmo("8,5 min/mi"), { segundos: 510, de: "mi" });
  assert.deepEqual(leerRitmo("5:30/km"), { segundos: 330, de: "km" });
  assert.deepEqual(leerRitmo("5 min por kilómetro"), { segundos: 300, de: "km" });
});

test("lo que no es un ritmo, no; y las distancias siguen a lo suyo", () => {
  for (const t of ["min/mi", "9", "9 mi", "0/mi", "8:75/mi", "-9/mi", "", undefined]) assert.equal(leerRitmo(t), null, String(t));
  assert.equal(leerDistancia("9 min/mi"), null);
  assert.equal(leerOmnibox("9 min/mi", { from: "EUR", to: "USD" }), null);
});

test("de min/mi a min/km y al revés", () => {
  cerca(convertirRitmo({ segundos: 1609.344, de: "mi" }).segundos, 1000);
  cerca(convertirRitmo({ segundos: 1000, de: "km" }).segundos, 1609.344);
  assert.equal(convertirRitmo({ segundos: 1, de: "mi" }).a, "km");
});

test("el texto, en minutos y segundos", () => {
  assert.equal(texto("9 min/mi"), "9:00 min/mi = 5:36 min/km");
  assert.equal(texto("5:30/km"), "5:30 min/km = 8:51 min/mi");
  assert.equal(textoRitmo(null), "");
});

test("si los segundos redondean a 60, sube el minuto", () => {
  // 359,6 s → 6:00 y no 5:60
  assert.equal(textoRitmo({ segundos: 578.73, de: "mi" }), "9:39 min/mi = 6:00 min/km");
});
