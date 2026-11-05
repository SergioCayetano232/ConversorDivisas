const { test } = require("node:test");
const assert = require("node:assert");
const { leerPresupuesto, leerTopes, estadoTopes, duplicarViaje } = require("../logica.js");

const gasto = (valor, categoria, to = "EUR") => ({ id: `${valor}${categoria}`, from: "JPY", to, cantidad: valor, valor, concepto: "", cuando: 0, categoria });
const base = { importe: 700, to: "EUR", desde: "2026-11-01", hasta: "2026-11-07" };

test("los presupuestos de antes siguen sin topes", () => {
  assert.deepEqual(leerPresupuesto(base), base);
  assert.equal(leerTopes(undefined), null);
  assert.equal(leerTopes({}), null);
});

test("solo se quedan los topes buenos de categorías que existen", () => {
  assert.deepEqual(
    leerTopes({ comida: 200, ocio: 0, compras: -5, transporte: "50", juegos: 30, otros: 10.456 }),
    { comida: 200, otros: 10.46 },
  );
  assert.deepEqual(leerPresupuesto({ ...base, categorias: { comida: 200 } }).categorias, { comida: 200 });
  assert.equal("categorias" in leerPresupuesto({ ...base, categorias: { comida: 0 } }), false);
});

test("cada tope cuenta lo suyo y en la divisa del presupuesto", () => {
  const p = { ...base, categorias: { comida: 200, ocio: 100 } };
  const t = estadoTopes(p, [gasto(120, "comida"), gasto(50, "comida"), gasto(30, "transporte"), gasto(500, "comida", "USD"), gasto(110, "ocio")]);
  assert.equal(t.size, 2);
  assert.equal(t.get("comida").gastado, 170);
  assert.equal(t.get("comida").queda, 30);
  assert.equal(t.get("comida").tono, "justo");
  assert.equal(t.get("ocio").tono, "pasado");
  assert.equal(t.get("transporte"), undefined);
});

test("sin gastos va bien, y sin topes no hay nada", () => {
  assert.equal(estadoTopes({ ...base, categorias: { comida: 200 } }, []).get("comida").tono, "bien");
  assert.equal(estadoTopes(base, [gasto(10, "comida")]).size, 0);
  assert.equal(estadoTopes(null, []).size, 0);
});

test("al duplicar el viaje se llevan los topes", () => {
  const viajes = { activo: "a", lista: [{ id: "a", nombre: "Japón", gastos: [], presupuesto: { ...base, categorias: { comida: 200 } }, cajero: [], personas: 1, color: "dorado" }] };
  const copia = duplicarViaje(viajes, "a", "b", { hoyIso: "2026-12-01" }).lista[1];
  assert.deepEqual(copia.presupuesto.categorias, { comida: 200 });
});
