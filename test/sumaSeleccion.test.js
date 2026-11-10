const { test } = require("node:test");
const assert = require("node:assert");
const { sumarSeleccion, notaDeSuma } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("varios precios en la misma divisa se suman", () => {
  assert.deepEqual(sumarSeleccion("Camiseta £12.50\nVaqueros £39.99\nEnvío £3.95"), { cantidades: [12.5, 39.99, 3.95], cantidad: 56.44, divisa: "GBP" });
  assert.deepEqual(sumarSeleccion("10 € y 5 €"), { cantidades: [10, 5], cantidad: 15, divisa: "EUR" });
  assert.equal(sumarSeleccion("$0.10 + $0.20").cantidad, 0.3);
});

test("un solo precio, ninguno o en dos divisas, se convierte como siempre", () => {
  for (const t of ["Precio: 49,99 €", "3 unidades", "10 € o 12 $", "", undefined]) assert.equal(sumarSeleccion(t), null, String(t));
});

test("la nota dice lo que ha sumado", () => {
  ponerIdioma("es");
  assert.equal(notaDeSuma([12.5, 39.99, 3.95]), "Suma de 3 precios: 12,50 +\u00a039,99 +\u00a03,95");
  assert.equal(notaDeSuma([1, 2, 3, 4, 5, 6]), "Suma de 6 precios");
  ponerIdioma("en");
  assert.equal(notaDeSuma([12.5, 1299]), "Sum of 2 prices: 12.50 +\u00a01,299.00");
  ponerIdioma("es");
});
