const { test } = require("node:test");
const assert = require("node:assert");
const { resumenParaCompartir } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const hora = (dia, h = 12) => new Date(...dia.split("-").map((n, i) => (i === 1 ? n - 1 : Number(n))), h).getTime();
const gasto = (id, dia, valor, categoria, to = "EUR") => ({
  id, from: "JPY", to, cantidad: valor * 160, valor, concepto: "", cuando: hora(dia), categoria,
});
const HOY = "2026-10-03";
// Como en el popup: lo último apuntado va primero.
const gastos = [
  gasto("3", "2026-10-03", 20, "transporte"),
  gasto("2", "2026-10-02", 30, "comida"),
  gasto("1", "2026-10-01", 50, "comida"),
];

test("sin gastos no hay nada que compartir", () => {
  ponerIdioma("es");
  assert.equal(resumenParaCompartir({ nombre: "Japón", gastos: [], presupuesto: null }, HOY), "");
});

test("el resumen entero, con categorías, días y presupuesto", () => {
  ponerIdioma("es");
  const presupuesto = { importe: 300, to: "EUR", hasta: "2026-10-10" };
  assert.equal(resumenParaCompartir({ nombre: "Japón", gastos, presupuesto }, HOY), [
    "*🧳 Japón*",
    "Total: *100,00 EUR* en 3 gastos",
    "",
    "*En qué se ha ido*",
    "🍽️ Comida: 80,00 EUR (80 %)",
    "🚕 Transporte: 20,00 EUR (20 %)",
    "",
    "*Por días*",
    "1 oct: 50,00 EUR",
    "Ayer: 30,00 EUR",
    "Hoy: 20,00 EUR",
    "",
    "💰 Presupuesto: 100,00 EUR de 300,00 EUR. Quedan 200,00 EUR",
  ].join("\n"));
});

test("lo que no dice nada se queda fuera", () => {
  ponerIdioma("es");
  const uno = [gasto("1", HOY, 12.5, "comida")];
  assert.equal(resumenParaCompartir({ nombre: "Lisboa", gastos: uno, presupuesto: null }, HOY), "*🧳 Lisboa*\nTotal: *12,50 EUR* en 1 gasto");
});

test("si te has pasado del presupuesto, lo dice", () => {
  ponerIdioma("es");
  const presupuesto = { importe: 80, to: "EUR", hasta: "2026-10-10" };
  assert.match(resumenParaCompartir({ nombre: "Japón", gastos, presupuesto }, HOY), /💸 Presupuesto: 100,00 EUR de 80,00 EUR\. Nos hemos pasado 20,00 EUR$/);
});

test("con dos divisas suma cada una por su lado", () => {
  ponerIdioma("es");
  const mezcla = [gasto("1", HOY, 10, "comida", "USD"), gasto("2", HOY, 40, "comida")];
  assert.match(resumenParaCompartir({ nombre: "Viaje", gastos: mezcla, presupuesto: null }, HOY), /Total: \*40,00 EUR \+ 10,00 USD\* en 2 gastos/);
});

test("en inglés, con los números a la inglesa", () => {
  ponerIdioma("en");
  const texto = resumenParaCompartir({ nombre: "Japan", gastos, presupuesto: null }, HOY);
  assert.match(texto, /Total: \*100\.00 EUR\* across 3 expenses/);
  assert.match(texto, /🍽️ Food: 80\.00 EUR \(80%\)/);
  assert.match(texto, /\*By day\*/);
  ponerIdioma("es");
});
