const { test } = require("node:test");
const assert = require("node:assert");
const { HISTORIAL_MAX, leerHistorial, apuntarConversion, quitarConversion, haceCuanto, textoParaCopiar } = require("../logica.js");

const conv = (cantidad, extra) => ({ from: "EUR", to: "USD", cantidad, resultado: cantidad * 1.1, cuando: 1000, ...extra });

test("la nueva va arriba", () => {
  const lista = apuntarConversion([conv(10)], conv(20, { cuando: 2000 }));
  assert.deepEqual(lista.map((e) => e.cantidad), [20, 10]);
});

test("repetir la misma la sube, no la duplica", () => {
  const lista = apuntarConversion([conv(20), conv(10)], conv(10, { cuando: 5000 }));
  assert.deepEqual(lista.map((e) => e.cantidad), [10, 20]);
  assert.equal(lista[0].cuando, 5000, "con la hora nueva");
});

test("la misma cantidad con otro par es otra conversión", () => {
  const lista = apuntarConversion([conv(10)], conv(10, { to: "GBP" }));
  assert.equal(lista.length, 2);
});

test("no pasa del máximo y se van las más viejas", () => {
  let lista = [];
  for (let i = 1; i <= HISTORIAL_MAX + 3; i++) lista = apuntarConversion(lista, conv(i));
  assert.equal(lista.length, HISTORIAL_MAX);
  assert.equal(lista[0].cantidad, HISTORIAL_MAX + 3);
  assert.equal(lista.at(-1).cantidad, 4);
});

test("lo que no es una conversión no se apunta", () => {
  const lista = [conv(10)];
  for (const mala of [null, conv(0), conv(-5), conv(NaN), conv(10, { from: "XXX" }), conv(10, { resultado: null })]) {
    assert.equal(apuntarConversion(lista, mala), lista);
  }
});

test("no guarda campos de más", () => {
  const [e] = apuntarConversion([], conv(10, { basura: true }));
  assert.deepEqual(Object.keys(e).sort(), ["cantidad", "cuando", "from", "resultado", "to"]);
});

test("leer lo guardado tira lo roto", () => {
  assert.deepEqual(leerHistorial(undefined), []);
  assert.deepEqual(leerHistorial("x"), []);
  const guardado = [conv(10), { from: "EUR" }, null, conv(20, { to: "ZZZ" }), conv(30)];
  assert.deepEqual(leerHistorial(guardado).map((e) => e.cantidad), [10, 30]);
});

test("hace cuánto, en minutos y horas", () => {
  const ahora = new Date(2026, 8, 30, 18, 0).getTime();
  assert.equal(haceCuanto(ahora - 20 * 1000, ahora), "ahora");
  assert.equal(haceCuanto(ahora - 5 * 60000, ahora), "hace 5 min");
  assert.equal(haceCuanto(ahora - 3 * 3600000, ahora), "hace 3 h");
});

test("ayer va por calendario", () => {
  const nueve = new Date(2026, 8, 30, 9, 0).getTime();
  assert.equal(haceCuanto(new Date(2026, 8, 29, 23, 0).getTime(), nueve), "ayer", "solo 10 horas, pero fue ayer");
  assert.equal(haceCuanto(new Date(2026, 8, 30, 0, 30).getTime(), nueve), "hace 8 h");
});

test("días y, pasada la semana, la fecha", () => {
  const ahora = new Date(2026, 8, 30, 12, 0).getTime();
  assert.equal(haceCuanto(new Date(2026, 8, 27, 12, 0).getTime(), ahora), "hace 3 días");
  assert.equal(haceCuanto(new Date(2026, 8, 10, 12, 0).getTime(), ahora), "10 sept");
  assert.equal(haceCuanto(new Date(2025, 11, 20, 12, 0).getTime(), ahora), "20 dic 2025");
});

test("el texto para copiar va con coma y sin miles", () => {
  assert.equal(textoParaCopiar(1234.5), "1234,50");
  assert.equal(textoParaCopiar(0.056), "0,06");
});

test("quitar una conversión deja las demás como estaban", () => {
  const lista = [conv(30), conv(20), conv(10), conv(20, { to: "GBP" })];
  const quedan = quitarConversion(lista, conv(20));
  assert.deepEqual(quedan.map((e) => `${e.cantidad} ${e.to}`), ["30 USD", "10 USD", "20 GBP"]);
  assert.deepEqual(quitarConversion(lista, conv(99)), lista);
});
