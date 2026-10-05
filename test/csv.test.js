const { test, afterEach } = require("node:test");
const assert = require("node:assert");
const { ponerIdioma } = require("../textos.js");
const { celdaCsv, csvHistorial, csvGastos } = require("../logica.js");

afterEach(() => ponerIdioma("es"));

const hora = (dia, h, m = 0) => {
  const [a, mes, d] = dia.split("-").map(Number);
  return new Date(a, mes - 1, d, h, m).getTime();
};

const historial = [
  { from: "USD", to: "EUR", cantidad: 1250.5, resultado: 1106.82, cuando: hora("2026-10-02", 9, 5) },
];

const gastos = [
  { id: "b", from: "USD", to: "EUR", cantidad: 12, valor: 10.62, concepto: "Taxi", cuando: hora("2026-10-02", 21, 30) },
  { id: "a", from: "USD", to: "EUR", cantidad: 45, valor: 39.83, concepto: "Cena; con vino", categoria: "comida", cuando: hora("2026-10-01", 14) },
];

test("en español, punto y coma y la coma decimal, sin miles", () => {
  assert.equal(
    csvHistorial(historial),
    "Fecha;Hora;Cantidad;Divisa;Resultado;En\r\n2026-10-02;09:05;1250,50;USD;1106,82;EUR",
  );
});

test("en inglés, coma y punto decimal", () => {
  ponerIdioma("en");
  assert.equal(
    csvHistorial(historial),
    "Date,Time,Amount,Currency,Result,In\r\n2026-10-02,09:05,1250.50,USD,1106.82,EUR",
  );
});

test("los gastos van del primero al último, con el concepto", () => {
  const lineas = csvGastos(gastos).split("\r\n");
  assert.equal(lineas[0], "Fecha;Hora;Concepto;Categoría;Cantidad;Divisa;Importe;En;Pago");
  assert.equal(lineas[1], '2026-10-01;14:00;"Cena; con vino";Comida;45,00;USD;39,83;EUR;Tarjeta', "el ; del concepto va entre comillas");
  assert.equal(lineas[2], "2026-10-02;21:30;Taxi;Otros;12,00;USD;10,62;EUR;Tarjeta", "sin categoría, otros");
});

test("sin nada, solo la cabecera", () => {
  assert.equal(csvGastos([]), "Fecha;Hora;Concepto;Categoría;Cantidad;Divisa;Importe;En;Pago");
});

test("las comillas se doblan", () => {
  assert.equal(celdaCsv('El "Rincón"'), '"El ""Rincón"""');
});

test("lo que Excel tomaría por una fórmula se queda en texto", () => {
  assert.equal(celdaCsv("=SUMA(A1)"), "'=SUMA(A1)");
  assert.equal(celdaCsv("+34 600"), "'+34 600");
  assert.equal(celdaCsv("@hola"), "'@hola");
});

test("la coma solo obliga a comillas cuando es el separador", () => {
  assert.equal(celdaCsv("pan, leche"), "pan, leche");
  ponerIdioma("en");
  assert.equal(celdaCsv("pan, leche"), '"pan, leche"');
});
