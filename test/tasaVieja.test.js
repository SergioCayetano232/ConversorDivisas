const { test } = require("node:test");
const assert = require("node:assert");
const { domingoDePascua, hayTasaEl, tasaVieja, textoTasaVieja } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const dia = (iso) => { const [a, m, d] = iso.split("-").map(Number); return new Date(a, m - 1, d); };

test("Pascua cae donde cae", () => {
  assert.equal(domingoDePascua(2024).toDateString(), dia("2024-03-31").toDateString());
  assert.equal(domingoDePascua(2025).toDateString(), dia("2025-04-20").toDateString());
  assert.equal(domingoDePascua(2026).toDateString(), dia("2026-04-05").toDateString());
});

test("ni fines de semana ni festivos de TARGET", () => {
  assert.equal(hayTasaEl(dia("2026-10-08")), true, "jueves");
  assert.equal(hayTasaEl(dia("2026-10-10")), false, "sábado");
  assert.equal(hayTasaEl(dia("2026-10-11")), false, "domingo");
  assert.equal(hayTasaEl(dia("2026-01-01")), false);
  assert.equal(hayTasaEl(dia("2026-05-01")), false);
  assert.equal(hayTasaEl(dia("2026-12-25")), false);
  assert.equal(hayTasaEl(dia("2026-12-26")), false);
  assert.equal(hayTasaEl(dia("2026-04-03")), false, "Viernes Santo");
  assert.equal(hayTasaEl(dia("2026-04-06")), false, "Lunes de Pascua");
  assert.equal(hayTasaEl(dia("2026-04-07")), true);
  assert.equal(hayTasaEl(dia("2026-10-12")), true, "el 12 de octubre el BCE sí publica");
});

test("la de ayer un día laborable está bien: la de hoy sale por la tarde", () => {
  assert.equal(tasaVieja("2026-10-07", "2026-10-08"), null);
  assert.equal(tasaVieja("2026-10-08", "2026-10-08"), null);
});

test("el lunes, la del viernes está bien", () => {
  assert.equal(tasaVieja("2026-10-09", "2026-10-12"), null);
});

test("después de Semana Santa, la del jueves está bien", () => {
  assert.equal(tasaVieja("2026-04-02", "2026-04-07"), null);
});

test("si me he perdido alguna, cuántas", () => {
  assert.deepEqual(tasaVieja("2026-10-06", "2026-10-08"), { fecha: "2026-10-06", dias: 1 });
  assert.deepEqual(tasaVieja("2026-10-05", "2026-10-12"), { fecha: "2026-10-05", dias: 4 });
});

test("sin fecha o con una rara, nada", () => {
  assert.equal(tasaVieja(null, "2026-10-08"), null);
  assert.equal(tasaVieja("ayer", "2026-10-08"), null);
});

test("el texto dice el día de la semana si es reciente, y la fecha si no", () => {
  ponerIdioma("es");
  assert.equal(textoTasaVieja("2026-10-05", "2026-10-08"), "del lunes");
  assert.equal(textoTasaVieja("2026-09-28", "2026-10-08"), "del 28 sept");
  ponerIdioma("en");
  try {
    assert.equal(textoTasaVieja("2026-10-05", "2026-10-08"), "from Monday");
  } finally {
    ponerIdioma("es");
  }
});
