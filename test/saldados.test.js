const { test } = require("node:test");
const assert = require("node:assert");
const {
  crearGasto, leerViajes, duplicarViaje, cuentasViaje, leerSaldados, saldarPago, quitarSaldado, fraseSaldado, resumenParaCompartir,
} = require("../logica.js");

const gasto = (id, valor, pagador, to = "EUR") => crearGasto({
  id, from: "JPY", to, cantidad: valor * 160, valor, concepto: "Cena", cuando: Date.now(), categoria: "comida", pagador,
});

// 90 entre tres, todo tuyo: Ana (1) y Luis (2) te deben 30 cada uno.
const cena = [gasto("a", 90)];

test("si Ana ya te ha pagado, solo queda lo de Luis", () => {
  const saldados = saldarPago([], { de: 1, a: 0, importe: 30 }, "EUR", { id: "s1", cuando: 1 });
  const c = cuentasViaje(cena, 3, saldados);
  assert.deepEqual(c.pagos, [{ de: 2, a: 0, importe: 30 }]);
  assert.deepEqual(c.gente.map((p) => p.saldo), [30, 0, -30]);
  assert.equal(c.devuelto, 30);
  assert.equal(c.queda, 30);
});

test("con los dos pagados las cuentas cuadran", () => {
  let saldados = saldarPago([], { de: 1, a: 0, importe: 30 }, "EUR", { id: "s1" });
  saldados = saldarPago(saldados, { de: 2, a: 0, importe: 30 }, "EUR", { id: "s2" });
  const c = cuentasViaje(cena, 3, saldados);
  assert.deepEqual(c.pagos, []);
  assert.equal(c.queda, 0);
  assert.equal(c.devuelto, 60);
});

test("desmarcarlo vuelve a como estaba", () => {
  const saldados = quitarSaldado(saldarPago([], { de: 1, a: 0, importe: 30 }, "EUR", { id: "s1" }), "s1");
  assert.deepEqual(saldados, []);
  assert.deepEqual(cuentasViaje(cena, 3, saldados).pagos, cuentasViaje(cena, 3).pagos);
});

test("si después sube la cena, lo pagado se respeta y queda la diferencia", () => {
  const saldados = saldarPago([], { de: 1, a: 0, importe: 30 }, "EUR", { id: "s1" });
  const c = cuentasViaje([gasto("a", 90), gasto("b", 30)], 3, saldados);
  // 120 entre tres son 40: Ana debe 10 más y Luis los 40.
  assert.deepEqual(c.pagos, [{ de: 2, a: 0, importe: 40 }, { de: 1, a: 0, importe: 10 }]);
});

test("si un gasto se quita después de pagar, el que pagó pasa a cobrar", () => {
  const saldados = saldarPago([], { de: 1, a: 0, importe: 30 }, "EUR", { id: "s1" });
  const c = cuentasViaje([gasto("a", 30)], 3, saldados);
  // 30 entre tres son 10: Ana te dio 30 y le tocaban 10, así que tú y Luis le
  // devolvéis 10 cada uno.
  assert.deepEqual(c.gente.map((p) => p.saldo), [-10, 20, -10]);
  assert.deepEqual(c.pagos, [{ de: 0, a: 1, importe: 10 }, { de: 2, a: 1, importe: 10 }]);
});

test("lo pagado en otra divisa no cuenta, como los gastos", () => {
  const saldados = saldarPago([], { de: 1, a: 0, importe: 30 }, "USD", { id: "s1" });
  assert.equal(cuentasViaje(cena, 3, saldados).devuelto, 0);
});

test("si alguien ya no está, lo suyo pasa a ti como con los gastos", () => {
  const saldados = saldarPago([], { de: 2, a: 0, importe: 30 }, "EUR", { id: "s1" });
  const c = cuentasViaje(cena, 2, saldados);
  // De 2 a 0 con solo dos sería de ti a ti: no cuenta.
  assert.deepEqual(c.pagos, [{ de: 1, a: 0, importe: 45 }]);
  assert.equal(c.devuelto, 0);
});

test("leerSaldados tira lo que no tiene sentido", () => {
  assert.deepEqual(leerSaldados(undefined), []);
  assert.deepEqual(leerSaldados("hola"), []);
  const bueno = { id: "s1", de: 1, a: 0, importe: 30.004, to: "EUR", cuando: 5 };
  const leidos = leerSaldados([bueno, { ...bueno, id: "" }, { ...bueno, de: 0 }, { ...bueno, importe: -1 }, { ...bueno, to: "XXX" }, null]);
  assert.deepEqual(leidos, [{ ...bueno, importe: 30 }]);
});

test("los viajes de antes no traen saldados y siguen igual", () => {
  const viajes = leerViajes({ activo: "v", lista: [{ id: "v", gastos: [], personas: 3 }] });
  assert.equal("saldados" in viajes.lista[0], false);
});

test("se guardan con el viaje y no pasan al duplicado", () => {
  const saldados = [{ id: "s1", de: 1, a: 0, importe: 30, to: "EUR", cuando: 1 }];
  const viajes = leerViajes({ activo: "v", lista: [{ id: "v", gastos: cena, personas: 3, saldados }] });
  assert.deepEqual(viajes.lista[0].saldados, saldados);
  const copia = duplicarViaje(viajes, "v", "w");
  assert.equal("saldados" in copia.lista[1], false);
});

test("las frases de lo pagado se cuentan desde ti", () => {
  const gente = ["", "Ana", "Luis"];
  assert.equal(fraseSaldado({ de: 1, a: 0, importe: 30 }, gente, "EUR"), "Ana te pagó 30,00 EUR");
  assert.equal(fraseSaldado({ de: 0, a: 2, importe: 12.5 }, gente, "EUR"), "Le pagaste 12,50 EUR a Luis");
  assert.equal(fraseSaldado({ de: 1, a: 2, importe: 5 }, gente, "EUR"), "Ana le pagó 5,00 EUR a Luis");
});

test("el resumen para WhatsApp ya no dice lo que está pagado", () => {
  const viaje = { nombre: "Japón", gastos: [gasto("a", 90, 1)], presupuesto: null, personas: 3, gente: ["", "Ana", "Luis"] };
  assert.match(resumenParaCompartir(viaje), /Le debes 30,00 EUR a Ana/);
  const saldados = saldarPago([], { de: 0, a: 1, importe: 30 }, "EUR", { id: "s1" });
  const texto = resumenParaCompartir({ ...viaje, saldados });
  assert.doesNotMatch(texto, /Le debes/);
  assert.match(texto, /Luis le debe 30,00 EUR a Ana/);
});
