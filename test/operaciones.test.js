const { test } = require("node:test");
const assert = require("node:assert");
const { evaluar, completar, leerImporte, esOperacion, parseAmount, pasoCantidad, leerCantidad } = require("../logica.js");

const casi = (a, b) => assert.ok(a !== null && Math.abs(a - b) < 1e-9, `${a} no es ${b}`);

test("las cuatro operaciones", () => {
  assert.equal(evaluar("20+15"), 35);
  assert.equal(evaluar("50-8"), 42);
  assert.equal(evaluar("3*4"), 12);
  assert.equal(evaluar("10/4"), 2.5);
});

test("vale cualquier forma de escribir los signos", () => {
  for (const t of ["3x4", "3X4", "3×4"]) assert.equal(evaluar(t), 12, t);
  for (const t of ["10÷4", "10:4"]) assert.equal(evaluar(t), 2.5, t);
  assert.equal(evaluar("50−8"), 42);
});

test("los números van en formato español", () => {
  assert.equal(evaluar("3*12,50"), 37.5);
  assert.equal(evaluar("1.000+250"), 1250);
  casi(evaluar("1.084,70 + 15,30"), 1100);
  assert.equal(evaluar("1 000 + 5"), 1005);
});

test("primero multiplica y divide, luego suma y resta", () => {
  assert.equal(evaluar("2+3*4"), 14);
  assert.equal(evaluar("20-10/2"), 15);
  assert.equal(evaluar("100-20-30"), 50, "de izquierda a derecha");
  assert.equal(evaluar("100/5/2"), 10);
});

test("los paréntesis mandan", () => {
  assert.equal(evaluar("(2+3)*4"), 20);
  assert.equal(evaluar("(40+60)/4"), 25);
  assert.equal(evaluar("((1+1)*(2+3))"), 10);
});

test("aguanta espacios por en medio", () => {
  assert.equal(evaluar("  20 +  15 "), 35);
  assert.equal(evaluar("( 40 + 60 ) / 4"), 25);
});

test("porcentajes como en una calculadora", () => {
  assert.equal(evaluar("100+10%"), 110);
  assert.equal(evaluar("100-15%"), 85);
  assert.equal(evaluar("200*10%"), 20);
  assert.equal(evaluar("15%"), 0.15);
  assert.equal(evaluar("(50+50)-20%"), 80);
});

test("un signo delante del número", () => {
  assert.equal(evaluar("10+-2"), 8);
  assert.equal(evaluar("-2+10"), 8);
  assert.equal(evaluar("+5"), 5);
});

test("sin operación se lee igual que antes", () => {
  for (const t of ["1", "1.000", "1.084,70", "  2.500,50  ", "0"]) {
    assert.equal(evaluar(t), parseAmount(t), t);
  }
  assert.equal(evaluar(""), null);
});

test("lo que no se puede calcular es null", () => {
  assert.equal(evaluar("20+"), null);
  assert.equal(evaluar("(20+5"), null);
  assert.equal(evaluar("20+5)"), null);
  assert.equal(evaluar("20++"), null);
  assert.equal(evaluar("*5"), null);
  assert.equal(evaluar("()"), null);
  assert.equal(evaluar("hola+1"), null);
  assert.equal(evaluar(undefined), null);
});

test("sin negativos, como en el campo de siempre", () => {
  assert.equal(evaluar("-5"), null);
  assert.equal(evaluar("5-10"), null);
});

test("dividir entre cero no da infinito", () => {
  assert.equal(evaluar("5/0"), null);
  assert.equal(evaluar("0/0"), null);
});

test("no ejecuta nada de lo que pegues", () => {
  assert.equal(evaluar("alert(1)"), null);
  assert.equal(evaluar("1+constructor"), null);
  assert.equal(evaluar("2**3"), null);
});

test("completar quita lo que queda a medias", () => {
  assert.equal(completar("20+"), "20");
  assert.equal(completar("20 + "), "20");
  assert.equal(completar("20*("), "20");
  assert.equal(completar("(20+5"), "(20+5)");
  assert.equal(completar("((2+3)*(4"), "((2+3)*(4))");
  assert.equal(completar("20+5"), "20+5");
});

test("leerImporte calcula mientras escribes", () => {
  assert.equal(leerImporte("20+"), 20);
  assert.equal(leerImporte("20+1"), 21);
  assert.equal(leerImporte("(40+60"), 100);
  assert.equal(leerImporte("(40+60)/"), 100);
  assert.equal(leerImporte("(40+60)/4"), 25);
  assert.equal(leerImporte("1,"), 1);
});

test("esOperacion distingue una cuenta de un número", () => {
  assert.equal(esOperacion("20+15"), true);
  assert.equal(esOperacion("(5)"), true);
  assert.equal(esOperacion("1.000,50"), false);
  assert.equal(esOperacion("  42 "), false);
});

test("2k son dos mil y 1,5m millón y medio", () => {
  assert.equal(evaluar("2k"), 2000);
  assert.equal(evaluar("2K"), 2000);
  assert.equal(evaluar("1,5m"), 1500000);
  assert.equal(evaluar("1,5 M"), 1500000);
  assert.equal(evaluar("250k+30k"), 280000);
  assert.equal(evaluar("1,2k*3"), 3600);
  assert.equal(evaluar("2k-10%"), 1800);
  assert.ok(esOperacion("2k"));
});

test("una letra que no es k ni m, o pegada a más letras, no vale", () => {
  assert.equal(evaluar("2km"), null);
  assert.equal(evaluar("2kg"), null);
  assert.equal(evaluar("2j"), null);
  assert.equal(evaluar("k"), null);
  assert.equal(evaluar("2kk"), null);
  assert.ok(!esOperacion("20"));
});

test("las flechas suben de uno en uno, o de diez con Shift", () => {
  assert.equal(pasoCantidad(20, 1), 21);
  assert.equal(pasoCantidad(20, -1), 19);
  assert.equal(pasoCantidad(20, 1, true), 30);
  assert.equal(pasoCantidad(12.5, 1), 13.5);
  assert.equal(pasoCantidad(0.1, 1), 1.1, "sin restos de decimales");
});

test("de cero no baja, y sin cantidad empieza en cero", () => {
  assert.equal(pasoCantidad(0.5, -1), 0);
  assert.equal(pasoCantidad(5, -1, true), 0);
  assert.equal(pasoCantidad(null, 1), 1);
  assert.equal(pasoCantidad(null, -1), 0);
});

test("la cantidad guardada vuelve al céntimo, y si no vale no vuelve", () => {
  assert.equal(leerCantidad(38.9), 38.9);
  assert.equal(leerCantidad(9.090909), 9.09);
  assert.equal(leerCantidad(0), 0);
  assert.equal(leerCantidad(undefined), null, "la primera vez no hay nada");
  assert.equal(leerCantidad("20"), null);
  assert.equal(leerCantidad(-5), null);
  assert.equal(leerCantidad(NaN), null);
});
