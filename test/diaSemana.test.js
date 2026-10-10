const { test } = require("node:test");
const assert = require("node:assert");
const { mejorDiaSemana, nombreDiaSemana, textoDiaSemana } = require("../logica.js");

// Semanas laborables desde el lunes 7 de septiembre de 2026.
function serie(semanas, valorDe) {
  const puntos = [];
  for (let s = 0; s < semanas; s += 1) {
    for (let d = 0; d < 5; d += 1) {
      const fecha = new Date(2026, 8, 7 + s * 7 + d);
      const iso = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
      puntos.push({ fecha: iso, valor: valorDe(s, d + 1) });
    }
  }
  return puntos;
}

test("con menos de ocho semanas no digo nada", () => {
  assert.equal(mejorDiaSemana(serie(7, () => 1)), null);
  assert.equal(mejorDiaSemana([]), null);
  assert.equal(mejorDiaSemana(null), null);
});

test("el martes sale mejor aunque la tasa suba toda la temporada", () => {
  // Sube un 1 % cada semana y dentro de la semana el viernes es el más alto
  // por la subida, pero el martes lleva un empujón de un 0,4 %.
  const r = mejorDiaSemana(serie(8, (s, d) => (1 + s * 0.01 + d * 0.0005) * (d === 2 ? 1.004 : 1)));
  assert.equal(r.mejor, 2);
  assert.equal(r.peor, 1);
  assert.equal(r.igual, false);
  assert.equal(r.semanas, 8);
  assert.equal(r.porDia.length, 5);
});

test("sin diferencias que valgan, da igual el día", () => {
  const r = mejorDiaSemana(serie(9, (s, d) => 1.1 + d * 0.00001));
  assert.equal(r.igual, true);
});

test("las semanas con festivos que se quedan en dos días no cuentan", () => {
  const puntos = serie(8, (s, d) => (d === 3 ? 1.01 : 1)).filter((p, i) => !(i >= 5 && i < 8));
  assert.equal(mejorDiaSemana(puntos), null, "solo quedan siete semanas llenas");
});

test("los nombres y la frase", () => {
  assert.equal(nombreDiaSemana(1), "lunes");
  assert.equal(nombreDiaSemana(5), "viernes");
  const texto = textoDiaSemana({ mejor: 2, peor: 4, ventaja: 0.0031, igual: false, semanas: 12 });
  assert.equal(texto, "Los martes suele darte un 0,31 % más que los jueves");
  assert.match(textoDiaSemana({ igual: true, semanas: 6 }), /6 semanas, da igual/);
});
