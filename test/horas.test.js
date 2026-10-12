const { test } = require("node:test");
const assert = require("node:assert");
const { enHoras, textoHoras, limpiarCopia, CLAVES_COPIA } = require("../logica.js");

const hora = { precio: 12, divisa: "EUR" };

test("cuenta el trabajo con el lado que va en su divisa", () => {
  assert.equal(enHoras(hora, [{ valor: 50, divisa: "USD" }, { valor: 6, divisa: "EUR" }]), 30);
  assert.equal(enHoras(hora, [{ valor: 30, divisa: "EUR" }]), 150);
});

test("sin su divisa o sin sueldo no sale", () => {
  assert.equal(enHoras(hora, [{ valor: 50, divisa: "USD" }]), null);
  assert.equal(enHoras(null, [{ valor: 50, divisa: "EUR" }]), null);
});

test("menos de cinco minutos no lo digo, y redondea de cinco en cinco", () => {
  assert.equal(enHoras(hora, [{ valor: 0.9, divisa: "EUR" }]), null);
  assert.equal(enHoras(hora, [{ valor: 1, divisa: "EUR" }]), 5);
  assert.equal(enHoras(hora, [{ valor: 4.5, divisa: "EUR" }]), 25);
});

test("pasada la hora va de media en media, y desde dos jornadas en días", () => {
  assert.equal(enHoras(hora, [{ valor: 13, divisa: "EUR" }]), 60);
  assert.equal(enHoras(hora, [{ valor: 20, divisa: "EUR" }]), 90);
  assert.equal(enHoras(hora, [{ valor: 191, divisa: "EUR" }]), 960);
  assert.equal(enHoras(hora, [{ valor: 1200, divisa: "EUR" }]), 6000);
});

test("el texto, largo y corto", () => {
  assert.equal(textoHoras(25), "≈ 25 min de trabajo");
  assert.equal(textoHoras(90), "≈ 1,5 h de trabajo");
  assert.equal(textoHoras(6000), "≈ 12,5 días de trabajo");
  assert.equal(textoHoras(90, true), "1,5 h");
  assert.equal(textoHoras(960, true), "2 d");
  assert.equal(textoHoras(null), "");
});

test("va en la copia de seguridad, y uno roto no pasa", () => {
  assert.ok(CLAVES_COPIA.includes("sueldoHora"));
  assert.deepEqual(limpiarCopia({ sueldoHora: hora }).sueldoHora, hora);
  assert.equal(limpiarCopia({ sueldoHora: { precio: 0, divisa: "EUR" } }).sueldoHora, undefined);
});
