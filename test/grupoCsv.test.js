const { test } = require("node:test");
const assert = require("node:assert");
const { leerCsvGrupo, gastosDelGrupo, categoriaDeGrupo } = require("../logica.js");

const splitwise = `Date,Description,Category,Cost,Currency,Ana García,Luis,Sergio
2026-04-01,Ramen,Dining out,3000.00,JPY,-1000.00,-1000.00,2000.00
2026-04-02,Taxi,Taxi,4500.00,JPY,3000.00,-1500.00,-1500.00
2026-04-03,Museo Ghibli,Entertainment,2000.00,JPY,-1000.00,0.00,1000.00
2026-04-04,Vuelo,Plane,600.00,EUR,-200.00,-200.00,400.00
2026-04-05,Ana paid Sergio,Payment,1000.00,JPY,1000.00,0.00,-1000.00

,Total balance, , ,JPY,1000.00,-2500.00,1500.00
`;

const tricount = `Title;Amount;Currency;Date;Paid by;Paid for Ana;Paid for Luis;Paid for Sergio;Type
Cena;90,00;EUR;10/06/2026;Luis;30,00;30,00;30,00;Normal
Tranvía;6,00;EUR;11/06/2026;Sergio;0,00;3,00;3,00;Normal
Devolución a Luis;30,00;EUR;12/06/2026;Ana;0,00;30,00;0,00;Money transfer
`;

const tasas = { JPY: { "2026-03-31": 0.0062, "2026-04-01": 0.0061, "2026-04-02": 0.006 } };

test("Splitwise: las personas, quién pagó y entre quiénes", () => {
  const r = leerCsvGrupo(splitwise);
  assert.equal(r.app, "splitwise");
  assert.deepEqual(r.personas, ["Ana García", "Luis", "Sergio"]);
  assert.deepEqual(r.gastos.map((g) => [g.concepto, g.importe, g.divisa, g.pagador, g.entre]), [
    ["Ramen", 3000, "JPY", 2, null],
    ["Taxi", 4500, "JPY", 0, null],
    ["Museo Ghibli", 2000, "JPY", 2, [0, 2]],
    ["Vuelo", 600, "EUR", 2, null],
  ]);
});

test("los pagos entre vosotros y la línea del total no son gastos", () => {
  const r = leerCsvGrupo(splitwise);
  assert.ok(!r.gastos.some((g) => /paid/i.test(g.concepto)));
  assert.equal(r.gastos.length, 4);
});

test("Tricount: por las columnas, con punto y coma y la fecha al revés", () => {
  const r = leerCsvGrupo(tricount);
  assert.equal(r.app, "tricount");
  assert.deepEqual(r.personas, ["Ana", "Luis", "Sergio"]);
  assert.deepEqual(r.gastos.map((g) => [g.fecha, g.concepto, g.importe, g.pagador, g.entre]), [
    ["2026-06-10", "Cena", 90, 1, null],
    ["2026-06-11", "Tranvía", 6, 2, [1, 2]],
  ]);
});

test("las categorías: primero por el concepto, luego por la de la app", () => {
  assert.equal(categoriaDeGrupo("Ramen", "Dining out"), "comida");
  assert.equal(categoriaDeGrupo("Hotel Kioto", "General"), "alojamiento");
  assert.equal(categoriaDeGrupo("Ryokan", "Hotel"), "alojamiento");
  assert.equal(categoriaDeGrupo("Algo", "General"), "otros");
});

test("a gastos del viaje: tú pasas a ser la persona 0", () => {
  const { nuevos, personas, gente, repetidos, sinTasa } = gastosDelGrupo(leerCsvGrupo(splitwise), { tu: 2, to: "EUR", alli: "JPY", tasas });
  assert.equal(personas, 3);
  assert.deepEqual(gente, ["", "Ana García", "Luis"], "tu nombre no: eres tú");
  assert.deepEqual([repetidos, sinTasa], [0, 0]);
  const [ramen, taxi, museo, vuelo] = nuevos;
  assert.deepEqual([ramen.cantidad, ramen.from, ramen.valor, ramen.to, ramen.pagador], [3000, "JPY", 18.3, "EUR", undefined], "pagaste tú");
  assert.equal(taxi.pagador, 1, "Ana");
  assert.equal(taxi.valor, 27, "al cambio de su día");
  assert.deepEqual(museo.entre, [0, 1], "Ana y tú");
  assert.deepEqual([vuelo.from, vuelo.cantidad, vuelo.valor], ["JPY", 100000, 600], "lo de tu divisa, en la de allí");
});

test("sin la tasa de ese día no se inventa: se cuenta y se deja fuera", () => {
  const r = gastosDelGrupo(leerCsvGrupo(splitwise), { tu: 2, to: "EUR", alli: "JPY", tasas: {} });
  assert.equal(r.nuevos.length, 0);
  assert.equal(r.sinTasa, 4);
});

test("lo que ya estaba apuntado no se repite", () => {
  const primera = gastosDelGrupo(leerCsvGrupo(splitwise), { tu: 2, to: "EUR", alli: "JPY", tasas });
  const otra = gastosDelGrupo(leerCsvGrupo(splitwise), { tu: 2, to: "EUR", alli: "JPY", tasas, existentes: primera.nuevos });
  assert.equal(otra.nuevos.length, 0);
  assert.equal(otra.repetidos, 4);
});

test("lo que no es de una de estas apps dice por qué", () => {
  assert.deepEqual(leerCsvGrupo("Fecha;Concepto;Importe\n01/02/2026;Café;-3,50"), { error: "columnas" });
  assert.deepEqual(leerCsvGrupo("Date,Description,Category,Cost,Currency,Ana\n"), { error: "vacio" });
  assert.deepEqual(leerCsvGrupo(""), { error: "columnas" });
});
