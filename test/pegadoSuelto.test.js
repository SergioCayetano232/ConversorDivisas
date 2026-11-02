const { test } = require("node:test");
const assert = require("node:assert");
const { leerPegadoSuelto } = require("../logica.js");

const par = { from: "EUR", to: "USD" };

test("un número a secas va a la cantidad, con el par que hay", () => {
  assert.deepEqual(leerPegadoSuelto("42,5", par), { cantidad: 42.5, from: "EUR", to: "USD" });
  assert.deepEqual(leerPegadoSuelto("  1.299,00 ", par), { cantidad: 1299, from: "EUR", to: "USD" });
  assert.equal(leerPegadoSuelto("20+5", par).cantidad, 25);
});

test("con su divisa, la cambia como al pegar en la cantidad", () => {
  assert.deepEqual(leerPegadoSuelto("$49.99", par), { cantidad: 49.99, from: "USD", to: "EUR" });
});

test("lo que no es un precio, nada", () => {
  for (const t of ["hola", "", "   ", "3 cafés", null, undefined]) assert.equal(leerPegadoSuelto(t, par), null, String(t));
});
