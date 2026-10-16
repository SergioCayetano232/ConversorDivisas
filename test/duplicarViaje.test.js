const { test } = require("node:test");
const assert = require("node:assert");
const { nombreCopia, duplicarViaje, VIAJES_MAX } = require("../logica.js");

const viaje = (id, nombre, extra = {}) => ({ id, nombre, gastos: [], presupuesto: null, cajero: [], personas: 1, color: "oro", ...extra });

test("el nombre lleva su número entre paréntesis", () => {
  assert.equal(nombreCopia("Lisboa", [viaje("a", "Lisboa")]), "Lisboa (2)");
  assert.equal(nombreCopia("Lisboa", [viaje("a", "Lisboa"), viaje("b", "Lisboa (2)")]), "Lisboa (3)");
  assert.equal(nombreCopia("Lisboa (2)", [viaje("a", "Lisboa"), viaje("b", "Lisboa (2)")]), "Lisboa (3)");
  assert.equal(nombreCopia("Japón 2026", [viaje("a", "Japón 2026")]), "Japón 2026 (2)");
  assert.equal(nombreCopia("", []), "");
});

test("con un nombre largo, recorta para que quepa el número", () => {
  const largo = "Vuelta por el norte de It";
  const copia = nombreCopia(largo, [viaje("a", largo)]);
  assert.ok(copia.endsWith(" (2)"));
  assert.ok(copia.length <= 24);
});

test("copia el presupuesto y la gente, sin gastos ni cajero, y pasa a ser el abierto", () => {
  const origen = viaje("a", "Lisboa", {
    personas: 3,
    presupuesto: { importe: 500, to: "EUR", desde: "2026-05-01", hasta: "2026-05-04" },
    gastos: [{ id: "g", from: "EUR", to: "USD", cantidad: 1, valor: 1, concepto: "", cuando: 1 }],
    cajero: [{ id: "r", cantidad: 100, divisa: "EUR", cuando: 1 }],
  });
  const r = duplicarViaje({ activo: "a", lista: [origen] }, "a", "b", { hoyIso: "2026-10-16" });
  assert.equal(r.activo, "b");
  const copia = r.lista[1];
  assert.equal(copia.nombre, "Lisboa (2)");
  assert.equal(copia.personas, 3);
  assert.deepEqual(copia.gastos, []);
  assert.deepEqual(copia.cajero, []);
  assert.deepEqual(copia.presupuesto, { importe: 500, to: "EUR", desde: "2026-10-16", hasta: "2026-10-19" });
  assert.notEqual(copia.color, "oro");
  assert.equal(r.lista[0], origen, "el de origen no se toca");
});

test("sin día de salida, cuenta desde el primer gasto", () => {
  const origen = viaje("a", "Roma", {
    presupuesto: { importe: 300, to: "EUR", hasta: "2026-03-07" },
    gastos: [{ id: "g", from: "EUR", to: "USD", cantidad: 1, valor: 1, concepto: "", cuando: new Date(2026, 2, 5, 12).getTime() }],
  });
  const copia = duplicarViaje({ activo: "a", lista: [origen] }, "a", "b", { hoyIso: "2026-10-16" }).lista[1];
  assert.deepEqual(copia.presupuesto, { importe: 300, to: "EUR", desde: "2026-10-16", hasta: "2026-10-18" });
});

test("si escribes un nombre, lleva ese", () => {
  const r = duplicarViaje({ activo: "a", lista: [viaje("a", "Roma")] }, "a", "b", { nombre: "  Roma en Navidad ", hoyIso: "2026-10-16" });
  assert.equal(r.lista[1].nombre, "Roma en Navidad");
});

test("sin presupuesto se queda sin él", () => {
  const r = duplicarViaje({ activo: "a", lista: [viaje("a", "Roma")] }, "a", "b", { hoyIso: "2026-10-16" });
  assert.equal(r.lista[1].presupuesto, null);
});

test("lleno, con un id repetido o de un viaje que no existe, no hace nada", () => {
  const lleno = { activo: "v0", lista: Array.from({ length: VIAJES_MAX }, (_, i) => viaje(`v${i}`, `V${i}`)) };
  assert.equal(duplicarViaje(lleno, "v0", "nuevo"), lleno);
  const uno = { activo: "a", lista: [viaje("a", "Roma")] };
  assert.equal(duplicarViaje(uno, "a", "a"), uno);
  assert.equal(duplicarViaje(uno, "x", "b"), uno);
});
