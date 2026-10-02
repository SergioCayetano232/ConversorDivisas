const { test } = require("node:test");
const assert = require("node:assert");
const { buscarPrecios, precioEntero } = require("../logica.js");

const solo = (texto) => buscarPrecios(texto).map(({ cantidad, divisa }) => ({ cantidad, divisa }));

test("los formatos de siempre, con la divisa delante o detrás", () => {
  assert.deepEqual(solo("1.299,00 €"), [{ cantidad: 1299, divisa: "EUR" }]);
  assert.deepEqual(solo("$1,049.99"), [{ cantidad: 1049.99, divisa: "USD" }]);
  assert.deepEqual(solo("£20"), [{ cantidad: 20, divisa: "GBP" }]);
  assert.deepEqual(solo("R$ 10,50"), [{ cantidad: 10.5, divisa: "BRL" }]);
  assert.deepEqual(solo("20 euros"), [{ cantidad: 20, divisa: "EUR" }]);
  assert.deepEqual(solo("USD 35"), [{ cantidad: 35, divisa: "USD" }]);
  assert.deepEqual(solo("120 zł"), [{ cantidad: 120, divisa: "PLN" }]);
  assert.deepEqual(solo("¥1,200"), [{ cantidad: 1200, divisa: "JPY" }]);
});

test("los dólares con apellido no se quedan en el $", () => {
  assert.deepEqual(solo("US$ 15"), [{ cantidad: 15, divisa: "USD" }]);
  assert.deepEqual(solo("C$15"), [{ cantidad: 15, divisa: "CAD" }]);
  assert.deepEqual(solo("A$15"), [{ cantidad: 15, divisa: "AUD" }]);
  assert.deepEqual(solo("HK$15"), [{ cantidad: 15, divisa: "HKD" }]);
});

test("el espacio duro de los miles y el de antes del símbolo", () => {
  assert.deepEqual(solo("1 299,00 €"), [{ cantidad: 1299, divisa: "EUR" }]);
  assert.deepEqual(solo("1 299,00 €"), [{ cantidad: 1299, divisa: "EUR" }], "el estrecho que pone Intl en francés");
});

test("varios precios en una frase, en orden", () => {
  assert.deepEqual(solo("Antes 49,99 €, ahora 29,99 €"), [
    { cantidad: 49.99, divisa: "EUR" },
    { cantidad: 29.99, divisa: "EUR" },
  ]);
  assert.deepEqual(solo("de $10 a $20"), [
    { cantidad: 10, divisa: "USD" },
    { cantidad: 20, divisa: "USD" },
  ]);
});

test("dice dónde empieza y acaba cada uno", () => {
  const [p] = buscarPrecios("Precio: 49,99 € IVA incl.");
  assert.equal("Precio: 49,99 € IVA incl.".slice(p.inicio, p.fin), "49,99 €");
});

test("un número sin divisa no es un precio", () => {
  assert.deepEqual(solo("Quedan 20 unidades"), []);
  assert.deepEqual(solo("Envío en 24 horas, 3 años de garantía"), []);
  assert.deepEqual(solo("Llamar al 91 123 45 67"), []);
});

test("un número pegado a una letra no es un precio", () => {
  assert.deepEqual(solo("A4 €"), [], "el tamaño del papel");
  assert.deepEqual(solo("iPhone15 €"), []);
});

test("el código de divisa en minúscula no cuenta", () => {
  assert.deepEqual(solo("try 5 eur"), []);
});

test("cero no es un precio", () => {
  assert.deepEqual(solo("0 €"), []);
});

test("sin texto no hay nada", () => {
  assert.deepEqual(buscarPrecios(null), []);
  assert.deepEqual(buscarPrecios(""), []);
});

test("el precio partido en trozos vale si el texto entero es un precio", () => {
  assert.deepEqual(precioEntero("$49.99"), { cantidad: 49.99, divisa: "USD" });
  assert.deepEqual(precioEntero("  49,99 €  "), { cantidad: 49.99, divisa: "EUR" });
});

test("si hay algo más que el precio, no", () => {
  assert.equal(precioEntero("Desde $49.99"), null);
  assert.equal(precioEntero("$10 - $20"), null);
  assert.equal(precioEntero("49,99"), null);
});
