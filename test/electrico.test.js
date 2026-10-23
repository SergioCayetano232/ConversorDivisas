const { test } = require("node:test");
const assert = require("node:assert");
const { leerElectrico, convertirElectrico, textoElectrico, leerOmnibox, leerPotencia, leerDistancia, leerConsumo } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoElectrico(leerElectrico(t));

test("lee el consumo de los eléctricos", () => {
  for (const t of ["3,5 mi/kWh", "3.5mi/kwh", "3,5 miles per kWh", "3,5 millas por kWh"]) assert.deepEqual(leerElectrico(t), { valor: 3.5, de: "mi/kWh" }, t);
  assert.deepEqual(leerElectrico("17 kWh/100km"), { valor: 17, de: "kWh/100 km" });
  assert.deepEqual(leerElectrico("17 kwh/100 km"), { valor: 17, de: "kWh/100 km" });
});

test("lo que no es consumo eléctrico, no", () => {
  for (const t of ["mi/kWh", "3,5", "0 mi/kWh", "-3 mi/kWh", "3 kWh", "", undefined]) assert.equal(leerElectrico(t), null, String(t));
  assert.equal(leerOmnibox("3,5 mi/kWh", { from: "EUR", to: "USD" }), null);
  assert.equal(leerPotencia("3,5 mi/kWh"), null);
  assert.equal(leerDistancia("3,5 mi/kWh"), null);
  assert.equal(leerConsumo("3,5 mi/kWh"), null);
});

test("de mi/kWh a kWh/100 km y vuelta, con la misma cuenta", () => {
  const ida = convertirElectrico({ valor: 4, de: "mi/kWh" });
  assert.equal(ida.a, "kWh/100 km");
  cerca(ida.valor, 100 / (4 * 1.609344));
  const vuelta = convertirElectrico({ valor: ida.valor, de: "kWh/100 km" });
  assert.equal(vuelta.a, "mi/kWh");
  cerca(vuelta.valor, 4);
});

test("el texto, con un decimal", () => {
  assert.equal(texto("3,5 mi/kWh"), "3,5 mi/kWh = 17,8 kWh/100 km");
  assert.equal(texto("15 kWh/100km"), "15 kWh/100 km = 4,1 mi/kWh");
  assert.equal(textoElectrico(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("3,5 mi/kWh"), "3.5 mi/kWh = 17.8 kWh/100 km");
  } finally {
    ponerIdioma("es");
  }
});
