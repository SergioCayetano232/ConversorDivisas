const { test } = require("node:test");
const assert = require("node:assert");
const {
  crearGasto, crearPaquete, leerPaquete, leerCopia, quienEsQuien, mapaValido, gastosParaJuntar, juntarGastos, efectivoQueda, cuentasViaje,
} = require("../logica.js");

const gasto = (id, dia, valor, extra = {}) => crearGasto({
  id, from: "JPY", to: "EUR", cantidad: valor * 160, valor, concepto: "Cena", cuando: new Date(`2026-06-${dia}T12:00`).getTime(), categoria: "comida", ...extra,
});
const viaje = (gastos, personas = 3, gente = ["", "Ana", "Luis"]) => ({ id: "t", nombre: "Japón", gastos, personas, gente, presupuesto: null });
const ida = (v) => leerPaquete(JSON.stringify(crearPaquete(v)));

test("va y vuelve sin las notas", () => {
  const p = ida(viaje([gasto("a", "01", 10, { nota: "secreto", pagador: 1 })]));
  assert.equal(p.nombre, "Japón");
  assert.equal(p.personas, 3);
  assert.equal(p.gastos[0].pagador, 1);
  assert.equal("nota" in p.gastos[0], false);
});

test("lo que no es un viaje del grupo, error", () => {
  assert.deepEqual(leerPaquete("{no"), { error: "json" });
  assert.deepEqual(leerPaquete(JSON.stringify({ app: "Otra", tipo: "viaje" })), { error: "otra" });
  assert.deepEqual(leerPaquete(JSON.stringify({ app: "ConversorDivisas", version: 1, datos: {} })), { error: "otra" });
  assert.deepEqual(leerPaquete(JSON.stringify({ ...crearPaquete(viaje([gasto("a", "01", 10)])), version: 99 })), { error: "version" });
  assert.deepEqual(leerPaquete(JSON.stringify(crearPaquete(viaje([])))), { error: "vacio" });
});

test("un paquete no se puede restaurar como copia", () => {
  assert.deepEqual(leerCopia(JSON.stringify(crearPaquete(viaje([gasto("a", "01", 10)])))), { error: "otra" });
});

test("empareja por el nombre y el que lo manda no eres tú", () => {
  // Lo manda Ana: en su lista ella es el 0, tú eres Pepe y Luis es Luis.
  const suyo = { personas: 3, gente: ["", "Pepe", "Luis"] };
  assert.deepEqual(quienEsQuien(suyo, viaje([])), [1, 0, 2]);
});

test("sin nombres también sale una asignación sin repetir", () => {
  const mapa = quienEsQuien({ personas: 3, gente: [] }, viaje([], 3, []));
  assert.deepEqual([...mapa].sort(), [0, 1, 2]);
  assert.notEqual(mapa[0], 0);
});

test("si él trae más gente, hay sitio para todos", () => {
  const mapa = quienEsQuien({ personas: 4, gente: [] }, viaje([], 2, []));
  assert.equal(mapaValido(mapa), true);
  assert.equal(Math.max(...mapa), 3);
});

test("mapaValido no deja a dos en la misma persona", () => {
  assert.equal(mapaValido([1, 0, 2]), true);
  assert.equal(mapaValido([1, 1, 2]), false);
});

test("lo que pagó él pasa a estar a su nombre", () => {
  const p = ida(viaje([gasto("a", "01", 30)]));
  const { filas } = gastosParaJuntar(p, viaje([gasto("x", "02", 5)]), [1, 0, 2]);
  assert.equal(filas[0].gasto.pagador, 1);
  assert.equal("entre" in filas[0].gasto, false);
});

test("si te lo apuntó a ti, queda sin pagador", () => {
  const p = ida(viaje([gasto("a", "01", 30, { pagador: 1 })]));
  const { filas } = gastosParaJuntar(p, viaje([gasto("x", "02", 5)]), [1, 0, 2]);
  assert.equal("pagador" in filas[0].gasto, false);
});

test("quiénes entran y sus partes siguen a la persona", () => {
  const p = ida(viaje([gasto("a", "01", 30, { entre: [0, 1], partes: { 1: 2 } })]));
  const { filas } = gastosParaJuntar(p, viaje([gasto("x", "02", 5)]), [1, 0, 2]);
  assert.deepEqual(filas[0].gasto.entre, [0, 1]);
  assert.deepEqual(filas[0].gasto.partes, { 0: 2 });
});

test("su todos, si sois más aquí, son los suyos", () => {
  const p = ida(viaje([gasto("a", "01", 30)], 2, ["", "Tú"]));
  const { filas } = gastosParaJuntar(p, viaje([gasto("x", "02", 5)], 4), [1, 0]);
  assert.deepEqual(filas[0].gasto.entre, [0, 1]);
});

test("con una sola persona en su viaje, va entre todos", () => {
  const p = ida(viaje([gasto("a", "01", 30)], 1, []));
  const { filas } = gastosParaJuntar(p, viaje([gasto("x", "02", 5)]), [1]);
  assert.equal("entre" in filas[0].gasto, false);
});

test("lo que ya está por id no se repite, aunque vuelva y vaya", () => {
  const mio = gasto("a", "01", 30);
  const p = ida(viaje([mio, gasto("b", "02", 10)]));
  const r = gastosParaJuntar(p, viaje([mio]), [1, 0, 2]);
  assert.equal(r.yaEstan, 1);
  assert.deepEqual(r.filas.map((f) => f.gasto.id), ["b"]);
});

test("el mismo día y lo mismo se marca, pero se puede meter", () => {
  const p = ida(viaje([gasto("b", "01", 30), gasto("c", "03", 30)]));
  const r = gastosParaJuntar(p, viaje([gasto("x", "01", 30)]), [1, 0, 2]);
  assert.deepEqual(r.filas.map((f) => f.repetido), [true, false]);
});

test("los de otra divisa no se mezclan", () => {
  const dolares = crearGasto({ id: "d", from: "JPY", to: "USD", cantidad: 100, valor: 1, concepto: "", cuando: Date.now(), categoria: "otros" });
  const r = gastosParaJuntar(ida(viaje([dolares, gasto("e", "01", 3)])), viaje([gasto("x", "02", 5)]), [1, 0, 2]);
  assert.equal(r.otraDivisa, 1);
  assert.deepEqual(r.filas.map((f) => f.gasto.id), ["e"]);
});

test("en un viaje vacío manda la divisa del archivo", () => {
  assert.equal(gastosParaJuntar(ida(viaje([gasto("e", "01", 3)])), viaje([]), [1, 0, 2]).to, "EUR");
});

test("al juntar quedan del último al primero y cabe la gente", () => {
  const mio = viaje([gasto("x", "05", 5), gasto("y", "01", 5)], 2, []);
  const r = juntarGastos(mio, [gasto("b", "03", 1), gasto("c", "09", 1)], 4);
  assert.deepEqual(r.gastos.map((g) => g.id), ["c", "x", "b", "y"]);
  assert.equal(r.personas, 4);
});

test("las cuentas cuadran después de juntar", () => {
  const p = ida(viaje([gasto("a", "01", 30)]));
  const mio = viaje([gasto("x", "02", 30)]);
  const { filas, personas } = gastosParaJuntar(p, mio, [1, 0, 2]);
  const c = cuentasViaje(juntarGastos(mio, filas.map((f) => f.gasto), personas).gastos, personas);
  assert.deepEqual(c.gente.map((g) => g.pagado), [30, 30, 0]);
  assert.deepEqual(c.pagos, [{ de: 2, a: 0, importe: 10 }, { de: 2, a: 1, importe: 10 }]);
});

test("el efectivo de otro no sale de tu cartera", () => {
  const retiradas = [{ divisa: "JPY", cantidad: 10000 }];
  const mios = [gasto("a", "01", 10, { pago: "efectivo" })];
  const suyos = [gasto("b", "01", 10, { pago: "efectivo", pagador: 1 })];
  assert.equal(efectivoQueda(retiradas, [...mios, ...suyos])[0].queda, 8400);
});
