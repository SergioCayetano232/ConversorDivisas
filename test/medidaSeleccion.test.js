const { test } = require("node:test");
const assert = require("node:assert");
const { medidaDeSeleccion, divisaDe } = require("../logica.js");

test("lee una medida seleccionada y la parte en dos", () => {
  assert.deepEqual(medidaDeSeleccion("65 mph"), { de: "65 mph", a: "104,6 km/h", frase: "65 mph = 104,6 km/h" });
  assert.equal(medidaDeSeleccion("350°F").a, "176,7 °C");
  assert.equal(medidaDeSeleccion("2 cups").a, "473 ml");
  assert.equal(medidaDeSeleccion("5'10\"").a, "1,78 m");
});

test("con lo que se cuela al seleccionar con el ratón", () => {
  assert.equal(medidaDeSeleccion(" 65 mph. ").a, "104,6 km/h");
  assert.equal(medidaDeSeleccion("(12 fl oz)").a, "354,9 ml");
  assert.equal(medidaDeSeleccion("up to 65 mph").a, "104,6 km/h");
  assert.equal(medidaDeSeleccion("65 mph").a, "104,6 km/h");
});

test("las que llevan la palabra delante siguen valiendo", () => {
  assert.equal(medidaDeSeleccion("talla 42").de, "Talla 42");
  assert.equal(medidaDeSeleccion("Mach 2").de, "Mach 2");
});

test("un precio no es una medida", () => {
  for (const precio of ["$20", "20 USD", "1.299,00 €", "£4.50", "20 euros", "49,99", "1299", "5 pesos"]) {
    assert.equal(medidaDeSeleccion(precio), null, precio);
  }
});

test("lo que la tarjeta lee como medida no lleva divisa", () => {
  for (const medida of ["65 mph", "75 kg", "10 mi", "2 t", "20c", "1 l"]) {
    assert.ok(medidaDeSeleccion(medida), medida);
    assert.equal(divisaDe(medida), null, medida);
  }
});

test("ni un párrafo ni cualquier cosa", () => {
  assert.equal(medidaDeSeleccion("el coche iba a 65 mph cuando lo pararon en la autopista"), null);
  assert.equal(medidaDeSeleccion("hola"), null);
  assert.equal(medidaDeSeleccion(""), null);
  assert.equal(medidaDeSeleccion(null), null);
});
