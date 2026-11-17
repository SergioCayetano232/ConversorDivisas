const { test } = require("node:test");
const assert = require("node:assert");
const { viajeConTasasDeHoy, textoViajeHoy, crearGasto } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const gasto = (id, cantidad, valor, from = "JPY", comision = 0) =>
  crearGasto({ id, from, to: "EUR", cantidad, valor, concepto: "x", cuando: Date.UTC(2025, 3, 10), categoria: "comida", comision });
const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≠ ${b}`);

test("lo mismo que gastaste, con la tasa de hoy", () => {
  // 100.000 yenes que fueron 650 EUR; hoy el yen vale 0,0057.
  const r = viajeConTasasDeHoy({ gastos: [gasto("a", 100000, 650)] }, { JPY: 0.0057 });
  cerca(r.antes, 650);
  cerca(r.hoy, 570);
  cerca(r.diferencia, -80);
  assert.equal(r.to, "EUR");
  assert.equal(r.parcial, false);
});

test("con la comisión que llevaba cada gasto", () => {
  const r = viajeConTasasDeHoy({ gastos: [gasto("a", 100000, 663, "JPY", 2)] }, { JPY: 0.0057 });
  cerca(r.hoy, 581.4);
});

test("las devoluciones restan también hoy", () => {
  const r = viajeConTasasDeHoy({ gastos: [gasto("a", 100000, 650), gasto("b", -10000, -65)] }, { JPY: 0.0057 });
  cerca(r.antes, 585);
  cerca(r.hoy, 513);
});

test("sin tasa para una divisa, ese gasto cuenta igual y se marca", () => {
  const r = viajeConTasasDeHoy({ gastos: [gasto("a", 100000, 650), gasto("b", 100, 90, "USD")] }, { JPY: 0.0057 });
  cerca(r.hoy, 660);
  assert.equal(r.parcial, true);
  assert.equal(viajeConTasasDeHoy({ gastos: [gasto("b", 100, 90, "USD")] }, { JPY: 0.0057 }), null);
});

test("sin gastos o sin tasas, nada", () => {
  assert.equal(viajeConTasasDeHoy({ gastos: [] }, { JPY: 0.0057 }), null);
  assert.equal(viajeConTasasDeHoy({ gastos: [gasto("a", 100000, 650)] }, null), null);
  assert.equal(viajeConTasasDeHoy(null, {}), null);
});

test("los textos", () => {
  ponerIdioma("es");
  const barato = textoViajeHoy(viajeConTasasDeHoy({ gastos: [gasto("a", 100000, 650)] }, { JPY: 0.0057 }));
  assert.equal(barato.tono, "barato");
  assert.equal(barato.texto, "Hoy, un 12 % más barato (−80 EUR)");
  assert.match(barato.titulo, /650 EUR entonces, 570 EUR hoy/);
  assert.equal(textoViajeHoy(viajeConTasasDeHoy({ gastos: [gasto("a", 100000, 500)] }, { JPY: 0.0057 })).texto, "Hoy, un 14 % más caro (+70 EUR)");
  const igual = textoViajeHoy(viajeConTasasDeHoy({ gastos: [gasto("a", 100000, 568)] }, { JPY: 0.0057 }));
  assert.equal(igual.tono, "igual");
  assert.equal(igual.texto, "Hoy, casi igual");
  assert.match(igual.titulo, /568 EUR entonces, 570 EUR hoy/);
  assert.equal(textoViajeHoy(null), null);
  ponerIdioma("en");
  assert.equal(barato && textoViajeHoy(viajeConTasasDeHoy({ gastos: [gasto("a", 100000, 650)] }, { JPY: 0.0057 })).texto, "Today, 12% cheaper (−80 EUR)");
  ponerIdioma("es");
});
