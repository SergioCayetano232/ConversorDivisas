const { test } = require("node:test");
const assert = require("node:assert");
const { leerColumna, cuentaDeColumna, leerImporte } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const par = { from: "EUR", to: "USD" };

test("una columna de números se suma en la divisa de arriba", () => {
  const r = leerColumna("12,50\n3,20\n8", par);
  assert.deepEqual(r, { cantidades: [12.5, 3.2, 8], cantidad: 23.7, from: "EUR", to: "USD" });
});

test("de una hoja de cálculo: saltos de Windows, tabuladores y líneas vacías", () => {
  assert.deepEqual(leerColumna("1.299,00\r\n\r\n 49,99 \r\n", par).cantidades, [1299, 49.99]);
  assert.deepEqual(leerColumna("10\t20\t30", par).cantidad, 60);
});

test("con la divisa en cada línea, cambia el par como al pegar un precio", () => {
  assert.deepEqual(leerColumna("£4.50\n£12.00", par), { cantidades: [4.5, 12], cantidad: 16.5, from: "GBP", to: "USD" });
  // La de abajo le da la vuelta.
  assert.deepEqual(leerColumna("$10\n5,25", par), { cantidades: [10, 5.25], cantidad: 15.25, from: "USD", to: "EUR" });
});

test("el descuento del tique resta", () => {
  assert.equal(leerColumna("20,00\n-2,50\n− 1,00", par).cantidad, 16.5);
});

test("sin sumar decimales de más", () => {
  assert.equal(leerColumna("0,10\n0,20", par).cantidad, 0.3);
});

test("lo que no es una columna de precios se pega como siempre", () => {
  for (const t of [
    "12,50",                // una sola línea
    "Café 2,50\nTostada 3", // con texto
    "10 €\n10 $",           // dos divisas
    "20+15\n3",             // una cuenta
    "-30\n10",              // sale en negativo
    "", undefined,
  ]) assert.equal(leerColumna(t, par), null, String(t));
  assert.equal(leerColumna(Array(51).fill("1").join("\n"), par), null);
});

test("la cuenta que se queda en el campo", () => {
  ponerIdioma("es");
  assert.equal(cuentaDeColumna([12.5, 3.2, -1, 1299]), "12,50 + 3,20 - 1,00 + 1.299,00");
  ponerIdioma("en");
  assert.equal(cuentaDeColumna([12.5, 3.2]), "12.50 + 3.20");
  ponerIdioma("es");
});

test("la calculadora del campo da la misma suma, con los miles", () => {
  for (const idioma of ["es", "en"]) {
    ponerIdioma(idioma);
    const r = leerColumna("1.299,00\n49,99\n-20", { from: "EUR", to: "USD" });
    assert.equal(leerImporte(cuentaDeColumna(r.cantidades)), r.cantidad, idioma);
  }
  ponerIdioma("es");
});
