const { test } = require("node:test");
const assert = require("node:assert");
const {
  numeroBanco, fechaBanco, leerCsvBanco, conceptoBanco, tasaDeEseDia, gastosDelBanco,
} = require("../logica.js");

// Con líneas de la cuenta delante, como los exporta un banco de aquí.
const conCabecera = [
  "Últimos movimientos;;;;",
  "Cuenta;ES12 3456 7890 1234 5678 9012;;;",
  ";;;;",
  "F.Operación;F.Valor;Concepto;Importe;Saldo",
  "03/11/2026;04/11/2026;COMPRA TARJ. 5402XXXXXXXX1234 LAWSON SHIBUYA;-12,40;1.987,60",
  "04/11/2026;05/11/2026;PAGO CON TARJETA EN HOTEL GRACERY;-1.240,00;747,60",
  "05/11/2026;05/11/2026;TRANSFERENCIA RECIBIDA NOMINA;2.000,00;2.747,60",
  "06/11/2026;07/11/2026;\"COMPRA TARJ. TAXI; NIHON KOTSU\";-18,30;2.729,30",
].join("\r\n");

test("los números como los pone el banco", () => {
  assert.equal(numeroBanco("-12,40"), -12.4);
  assert.equal(numeroBanco("-1.240,00"), -1240);
  assert.equal(numeroBanco("1.240"), 1240);
  assert.equal(numeroBanco("-12.50"), -12.5);
  assert.equal(numeroBanco("1,234.56"), 1234.56);
  assert.equal(numeroBanco("-12,40 €"), -12.4);
  assert.equal(numeroBanco("abc"), null);
});

test("las fechas, siempre día antes que mes", () => {
  assert.equal(fechaBanco("03/11/2026"), "2026-11-03");
  assert.equal(fechaBanco("3-11-26"), "2026-11-03");
  assert.equal(fechaBanco("2026-11-03"), "2026-11-03");
  assert.equal(fechaBanco("31/02/2026"), null);
  assert.equal(fechaBanco("Fecha"), null);
});

test("encuentra la tabla aunque haya líneas antes y se queda solo con lo que sale", () => {
  const { movimientos } = leerCsvBanco(conCabecera);
  assert.deepEqual(movimientos.map((m) => [m.fecha, m.importe]), [
    ["2026-11-03", 12.4], ["2026-11-04", 1240], ["2026-11-06", 18.3],
  ]);
  assert.equal(movimientos[2].concepto, "COMPRA TARJ. TAXI; NIHON KOTSU", "las comillas guardan el punto y coma");
});

test("con columnas de cargo y abono, el cargo va en positivo", () => {
  const csv = "Fecha;Descripción;Cargo;Abono\n03/11/2026;Lawson;12,40;\n04/11/2026;Bizum;;20,00";
  assert.deepEqual(leerCsvBanco(csv).movimientos, [{ fecha: "2026-11-03", concepto: "Lawson", importe: 12.4 }]);
});

test("también con comas y punto decimal", () => {
  const csv = "﻿Fecha,Concepto,Importe\n2026-11-03,LAWSON,-12.40";
  assert.equal(leerCsvBanco(csv).movimientos[0].importe, 12.4);
});

test("si no es un CSV del banco, dice qué pasa", () => {
  assert.deepEqual(leerCsvBanco("hola;que;tal\n1;2;3"), { error: "columnas" });
  assert.deepEqual(leerCsvBanco("Fecha;Concepto;Importe\n03/11/2026;Nómina;2000"), { error: "vacio" });
});

test("el concepto del banco, limpio y con la categoría bien", () => {
  assert.equal(conceptoBanco("COMPRA TARJ. 5402XXXXXXXX1234 LAWSON SHIBUYA"), "Lawson Shibuya");
  assert.equal(conceptoBanco("PAGO CON TARJETA EN HOTEL GRACERY"), "Hotel Gracery");
  assert.equal(conceptoBanco("COMPRA TARJETA DE CREDITO *1234 UBER TRIP"), "Uber Trip");
});

test("los fines de semana van con la tasa del viernes", () => {
  const tasas = { "2026-11-06": 0.0062, "2026-11-09": 0.0061 };
  assert.equal(tasaDeEseDia(tasas, "2026-11-08"), 0.0062);
  assert.equal(tasaDeEseDia(tasas, "2026-11-09"), 0.0061);
  assert.equal(tasaDeEseDia(tasas, "2026-11-01"), 0.0062, "antes de la primera, la primera");
  assert.equal(tasaDeEseDia({}, "2026-11-01"), null);
});

test("los movimientos se vuelven gastos con la cantidad de allí", () => {
  const { movimientos } = leerCsvBanco(conCabecera);
  const { nuevos, repetidos } = gastosDelBanco(movimientos, { from: "JPY", tasas: { "2026-11-03": 0.0062 }, idBase: "x" });
  assert.equal(repetidos, 0);
  assert.equal(nuevos.length, 3);
  const [lawson, hotel, taxi] = nuevos;
  assert.equal(lawson.cantidad, 2000);
  assert.equal(lawson.valor, 12.4);
  assert.equal(lawson.to, "EUR");
  assert.equal(lawson.comision, 0);
  assert.equal(new Date(lawson.cuando).getDate(), 3);
  assert.equal(hotel.categoria, "alojamiento");
  assert.equal(taxi.categoria, "transporte");
  assert.notEqual(lawson.id, hotel.id);
});

test("lo que ya estaba apuntado ese día con ese importe no se repite", () => {
  const { movimientos } = leerCsvBanco(conCabecera);
  const ya = { id: "a", from: "JPY", to: "EUR", cantidad: 2000, valor: 12.4, concepto: "Lawson", cuando: new Date(2026, 10, 3, 20).getTime() };
  const { nuevos, repetidos } = gastosDelBanco(movimientos, { from: "JPY", tasas: { "2026-11-03": 0.0062 }, existentes: [ya] });
  assert.equal(repetidos, 1);
  assert.equal(nuevos.length, 2);
});
