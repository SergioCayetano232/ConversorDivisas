const { test } = require("node:test");
const assert = require("node:assert");
const { crearGasto, saldarPago, cuentasViaje, mensajeCobro, COBRO_GASTOS_MAX } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

let reloj = 0;
const gasto = (id, valor, { pagador, entre, concepto = "Cena", to = "EUR" } = {}) => crearGasto({
  id, from: "JPY", to, cantidad: valor * 160, valor, concepto, cuando: ++reloj, categoria: "comida", pagador, entre,
});

const viaje = (gastos, extra = {}) => ({ nombre: "Japón", gastos, personas: 3, gente: ["", "Ana", "Luis"], saldados: [], ...extra });

test("Ana te debe su parte de la cena y lo dice al céntimo", () => {
  ponerIdioma("es");
  // 90 entre tres, todo tuyo: Ana (1) te debe 30.
  const texto = mensajeCobro(viaje([gasto("a", 90)]), 1);
  assert.equal(texto, [
    "*🧳 Japón*",
    "Ana, del viaje te toca *30,00 EUR* (de 90,00 EUR entre 3)",
    "💸 *Me debes 30,00 EUR*",
  ].join("\n"));
});

test("lo que puso ella y lo que ya te dio salen para que lo pueda repasar", () => {
  ponerIdioma("es");
  const gastos = [gasto("a", 150), gasto("b", 30, { pagador: 1, concepto: "Taxi" })];
  const saldados = saldarPago([], { de: 1, a: 0, importe: 10 }, "EUR", { id: "s1", cuando: 1 });
  const texto = mensajeCobro(viaje(gastos, { saldados }), 1);
  // Le tocan 60, puso 30 y ya te dio 10: quedan 20, lo mismo que las cuentas.
  const pago = cuentasViaje(gastos, 3, saldados).pagos.find((p) => p.de === 1);
  assert.equal(pago.importe, 20);
  assert.match(texto, /💳 Pusiste 30,00 EUR: Taxi 30,00/);
  assert.match(texto, /✓ Ya me diste 10,00 EUR/);
  assert.match(texto, /Me debes 20,00 EUR/);
});

test("los gastos de solo algunos salen con cuántos entraban", () => {
  ponerIdioma("es");
  const gastos = [gasto("a", 90), gasto("b", 40, { entre: [0, 1], concepto: "Museo" }), gasto("c", 50, { entre: [0, 2], concepto: "Kayak" })];
  const texto = mensajeCobro(viaje(gastos), 1);
  assert.match(texto, /te toca \*50,00 EUR\* \(de 180,00 EUR en total\)/);
  assert.match(texto, /👥 Solo de algunos: Museo 40,00 entre 2$/m);
  // El kayak era de Luis y tuyo: a Ana no le cuenta.
  assert.doesNotMatch(texto, /Kayak/);
});

test("si no te debe nada, o te debe a otro, no hay mensaje", () => {
  ponerIdioma("es");
  assert.equal(mensajeCobro(viaje([gasto("a", 90, { pagador: 1 })]), 1), "");
  assert.equal(mensajeCobro(viaje([gasto("a", 90, { pagador: 2 })]), 1), "");
  assert.equal(mensajeCobro(viaje([gasto("a", 90)]), 0), "");
  assert.equal(mensajeCobro(viaje([gasto("a", 90)], { personas: 1 }), 1), "");
  assert.equal(mensajeCobro(viaje([]), 1), "");
});

test("si además le debe a otro, va al final para que no se le olvide", () => {
  ponerIdioma("es");
  // Tú pagas 90 y Luis otros 90, entre tres: Ana os debe 30 a cada uno.
  const texto = mensajeCobro(viaje([gasto("a", 90), gasto("b", 90, { pagador: 2 })]), 1);
  assert.match(texto, /Me debes 30,00 EUR\*\nY a Luis, 30,00 EUR$/);
});

test("con muchos gastos pagados por ella, los de más van contados", () => {
  ponerIdioma("es");
  const suyos = Array.from({ length: COBRO_GASTOS_MAX + 2 }, (_, i) => gasto(`p${i}`, 1, { pagador: 1, concepto: `Café ${i}` }));
  const texto = mensajeCobro(viaje([gasto("a", 300), ...suyos]), 1);
  assert.match(texto, /Café 5 1,00 · y 2 más$/m);
  assert.doesNotMatch(texto, /Café 6/);
});

test("sin nombre sale como en las cuentas, y en inglés se lee en inglés", () => {
  ponerIdioma("en");
  const texto = mensajeCobro(viaje([gasto("a", 90)], { gente: [] }), 2);
  assert.match(texto, /^Person 3, your share of the trip is \*30\.00 EUR\*/m);
  assert.match(texto, /You owe me 30\.00 EUR/);
  ponerIdioma("es");
});

test("los gastos en otra divisa se quedan fuera, como en las cuentas", () => {
  ponerIdioma("es");
  const texto = mensajeCobro(viaje([gasto("a", 90), gasto("b", 60, { pagador: 1, to: "USD", concepto: "Taxi" })]), 1);
  assert.doesNotMatch(texto, /Taxi|Pusiste/);
  assert.match(texto, /Me debes 30,00 EUR/);
});
