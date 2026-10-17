const { test } = require("node:test");
const assert = require("node:assert");
const { previsionViaje, textoPrevision } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const p = { importe: 1000, to: "EUR", desde: "2026-10-01", hasta: "2026-10-10" };
const gasto = (valor, dia, categoria = "comida", to = "EUR") => ({
  id: `${dia}-${valor}`, from: "USD", to, cantidad: valor, valor, concepto: "", categoria,
  cuando: new Date(2026, 9, dia, 13).getTime(),
});
const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);

test("al ritmo que llevas, lo de al día por los días del viaje", () => {
  // Día 4 con 400: 100 al día, 1.000 al acabar.
  const r = previsionViaje(p, [gasto(400, 2)], "2026-10-04");
  cerca(r.total, 1000);
  cerca(r.sobra, 0);
  cerca(r.fraccion, 1);
  assert.equal(r.to, "EUR");
});

test("si vas rápido, cuánto te pasarás", () => {
  const r = previsionViaje(p, [gasto(300, 1), gasto(200, 3)], "2026-10-04");
  cerca(r.total, 1250);
  cerca(r.sobra, -250);
});

test("las noches del hotel ya apuntadas no se cuentan dos veces", () => {
  // Tres noches de 80 apuntadas de golpe: dos pasadas y una que viene.
  const hotel = [gasto(80, 3, "alojamiento"), gasto(80, 4, "alojamiento"), gasto(80, 5, "alojamiento")];
  const r = previsionViaje(p, [...hotel, gasto(200, 2)], "2026-10-04");
  // Comida: 200 en 4 días son 50 al día, 300 más en los 6 que quedan. El hotel, lo apuntado.
  cerca(r.total, 200 + 240 + 300);
});

test("lo de otra divisa no cuenta", () => {
  const r = previsionViaje(p, [gasto(400, 2), gasto(999, 2, "comida", "JPY")], "2026-10-04");
  cerca(r.total, 1000);
});

test("el primer día, el último, antes o después del viaje, no la hay", () => {
  const g = [gasto(100, 1)];
  assert.equal(previsionViaje(p, g, "2026-10-01"), null, "primer día");
  assert.equal(previsionViaje(p, g, "2026-10-10"), null, "último día");
  assert.equal(previsionViaje(p, g, "2026-09-28"), null, "antes");
  assert.equal(previsionViaje(p, g, "2026-10-12"), null, "después");
  assert.equal(previsionViaje(null, g, "2026-10-04"), null, "sin presupuesto");
});

test("sin gastar nada, acabas en cero", () => {
  const r = previsionViaje(p, [], "2026-10-04");
  cerca(r.total, 0);
});

test("el texto dice si sobra o te pasas", () => {
  assert.equal(
    textoPrevision({ total: 735.4, sobra: -35.4, to: "EUR" }, 700),
    "A este ritmo acabarás gastando unos 735 EUR: te pasarás 35",
  );
  assert.equal(
    textoPrevision({ total: 1240, sobra: 260, to: "EUR" }, 1500),
    "A este ritmo acabarás gastando unos 1.240 EUR: te sobrarán 260",
  );
});

test("por menos de un 2 % lo da por justo", () => {
  assert.equal(
    textoPrevision({ total: 1010, sobra: -10, to: "EUR" }, 1000),
    "A este ritmo acabarás gastando unos 1.010 EUR, justo lo que tenías",
  );
  assert.equal(textoPrevision(null, 1000), "");
});

test("en inglés", () => {
  ponerIdioma("en");
  try {
    assert.equal(
      textoPrevision({ total: 1240, sobra: 260, to: "EUR" }, 1500),
      "At this pace you'll end up spending about 1,240 EUR: 260 to spare",
    );
  } finally {
    ponerIdioma("es");
  }
});
