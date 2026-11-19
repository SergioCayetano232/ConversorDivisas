const { test } = require("node:test");
const assert = require("node:assert");
const { semanaDelViaje, tocaSemana, mensajeSemana, crearGasto } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

ponerIdioma("es");
const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const el = (dia, hora = 13) => { const [a, m, d] = dia.split("-").map(Number); return new Date(a, m - 1, d, hora).getTime(); };
const dia = (n) => `2026-11-${String(n).padStart(2, "0")}`;
let k = 0;
const g = (n, valor, categoria = "comida", extra = {}) => crearGasto({
  id: `g${k++}`, from: "JPY", to: "EUR", cantidad: valor * 160, valor, concepto: "x", cuando: el(dia(n)), categoria, ...extra,
});
// Del 1 al 20: tres semanas enteras y un poco.
const viaje = (gastos) => ({ id: "j", nombre: "🇯🇵 Japón", gastos, presupuesto: { importe: 2000, to: "EUR", desde: dia(1), hasta: dia(20) } });

test("el día 7, la primera semana", () => {
  const r = semanaDelViaje(viaje([g(1, 100), g(4, 60, "transporte"), g(7, 50)]), dia(7));
  assert.equal(r.semana, 1);
  cerca(r.total, 210);
  cerca(r.porDia, 30);
  assert.equal(r.categoria, "comida");
  cerca(r.fraccion, 150 / 210);
  assert.equal("cambio" in r, false, "la primera no tiene con qué compararse");
});

test("el día 14, contra la anterior y sin contar lo de antes", () => {
  const r = semanaDelViaje(viaje([g(1, 100), g(7, 100), g(8, 80), g(14, 70)]), dia(14));
  assert.equal(r.semana, 2);
  cerca(r.total, 150);
  cerca(r.cambio, 150 / 200 - 1);
});

test("los otros días, el último y sin fechas, nada", () => {
  const v = viaje([g(1, 100), g(7, 100)]);
  assert.equal(semanaDelViaje(v, dia(6)), null);
  assert.equal(semanaDelViaje(v, dia(8)), null);
  const corto = { ...v, presupuesto: { ...v.presupuesto, hasta: dia(7) } };
  assert.equal(semanaDelViaje(corto, dia(7)), null, "el último día ya tiene su resumen");
  assert.equal(semanaDelViaje({ ...v, presupuesto: null }, dia(7)), null);
});

test("sin gastos esa semana, nada; y lo fijo no cuenta", () => {
  assert.equal(semanaDelViaje(viaje([]), dia(7)), null);
  assert.equal(semanaDelViaje(viaje([g(3, 900, "otros", { fijo: true })]), dia(7)), null);
});

test("una vez por semana, a partir de la hora del recordatorio", () => {
  const viajes = { activo: "j", lista: [viaje([g(2, 100)])] };
  assert.equal(tocaSemana(viajes, [], new Date(2026, 10, 7, 20)), null);
  assert.equal(tocaSemana(viajes, [], new Date(2026, 10, 7, 21)).resumen.semana, 1);
  assert.equal(tocaSemana(viajes, [], new Date(2026, 10, 7, 20), 20).viaje.id, "j");
  assert.equal(tocaSemana(viajes, ["j:1"], new Date(2026, 10, 7, 22)), null);
});

test("el mensaje", () => {
  const m = mensajeSemana({ nombre: "🇯🇵 Japón" }, { semana: 2, total: 412.3, to: "EUR", porDia: 58.9, categoria: "comida", fraccion: 0.45, cambio: -0.08 });
  assert.equal(m.titulo, "🇯🇵 Japón · tu semana 2");
  assert.equal(m.cuerpo, "412,30 EUR en 7 días, 58,90 al día\nDonde más: 🍽️ Comida, un 45 %\nUn 8 % menos que la semana anterior");
  assert.match(mensajeSemana({ nombre: "" }, { semana: 1, total: 1, to: "EUR", porDia: 1, categoria: "comida", fraccion: 1, cambio: 0.02 }).cuerpo, /Casi lo mismo/);
});
