const { test } = require("node:test");
const assert = require("node:assert");
const { leerNumero, divisaDe, leerSeleccion, destinoPara } = require("../logica.js");

test("lee el decimal con punto o con coma", () => {
  assert.equal(leerNumero("49,99"), 49.99);
  assert.equal(leerNumero("49.99"), 49.99);
  assert.equal(leerNumero("0,5"), 0.5);
  assert.equal(leerNumero("12"), 12);
});

test("con punto y coma, el último es el decimal", () => {
  assert.equal(leerNumero("1.234,56"), 1234.56);
  assert.equal(leerNumero("1,234.56"), 1234.56);
  assert.equal(leerNumero("1.234.567,8"), 1234567.8);
  assert.equal(leerNumero("1,234,567.89"), 1234567.89);
});

test("un separador con tres cifras detrás son miles", () => {
  assert.equal(leerNumero("1.234"), 1234);
  assert.equal(leerNumero("1,234"), 1234);
  assert.equal(leerNumero("1.000.000"), 1000000);
});

test("salvo si delante hay un cero", () => {
  assert.equal(leerNumero("0,125"), 0.125);
});

test("espacios y apóstrofos también separan miles", () => {
  assert.equal(leerNumero("1 500,00"), 1500);
  assert.equal(leerNumero("1 500,00"), 1500);
  assert.equal(leerNumero("1 500"), 1500);
  assert.equal(leerNumero("1'234.50"), 1234.5);
});

test("reconoce los símbolos", () => {
  assert.equal(divisaDe("49,99 €"), "EUR");
  assert.equal(divisaDe("$19.99"), "USD");
  assert.equal(divisaDe("£20"), "GBP");
  assert.equal(divisaDe("¥1,500"), "JPY");
  assert.equal(divisaDe("150 ₺"), "TRY");
  assert.equal(divisaDe("99,00 zł"), "PLN");
});

test("los dólares que no son de EEUU", () => {
  assert.equal(divisaDe("R$ 10,50"), "BRL");
  assert.equal(divisaDe("MX$250"), "MXN");
  assert.equal(divisaDe("C$ 30"), "CAD");
  assert.equal(divisaDe("CA$30"), "CAD");
  assert.equal(divisaDe("A$ 12"), "AUD");
  assert.equal(divisaDe("US$ 5"), "USD");
});

test("el código ISO manda sobre el símbolo", () => {
  assert.equal(divisaDe("$ 20 CAD"), "CAD");
  assert.equal(divisaDe("CHF 12.50"), "CHF");
  assert.equal(divisaDe("20 SEK"), "SEK");
});

test("un código en minúscula no cuenta, que confunde palabras", () => {
  assert.equal(divisaDe("try it for $5"), "USD");
  assert.equal(divisaDe("try it for 5"), null);
});

test("reconoce los nombres, con o sin tilde", () => {
  assert.equal(divisaDe("20 euros"), "EUR");
  assert.equal(divisaDe("15 dólares"), "USD");
  assert.equal(divisaDe("15 dolares"), "USD");
  assert.equal(divisaDe("100 libras"), "GBP");
  assert.equal(divisaDe("300 pesos"), "MXN");
  assert.equal(divisaDe("50 coronas suecas"), "SEK");
  assert.equal(divisaDe("50 coronas noruegas"), "NOK");
  assert.equal(divisaDe("50 coronas danesas"), "DKK");
});

test("el símbolo gana a una palabra que se parece a una divisa", () => {
  assert.equal(divisaDe("real estate $500"), "USD");
});

test("sin pistas no se inventa la divisa", () => {
  assert.equal(divisaDe("49,99"), null);
  assert.equal(divisaDe("50 coronas"), null);
});

test("leerSeleccion saca la cantidad y la divisa de un texto real", () => {
  assert.deepEqual(leerSeleccion("Precio: 1.299,00 € IVA incl."), { cantidad: 1299, divisa: "EUR" });
  assert.deepEqual(leerSeleccion("Now only $1,049.99!"), { cantidad: 1049.99, divisa: "USD" });
  assert.deepEqual(leerSeleccion("  £20  "), { cantidad: 20, divisa: "GBP" });
  assert.deepEqual(leerSeleccion("1 500,00 zł"), { cantidad: 1500, divisa: "PLN" });
  assert.deepEqual(leerSeleccion("cuesta 42"), { cantidad: 42, divisa: null });
});

test("con dos números se queda con el primero", () => {
  assert.deepEqual(leerSeleccion("20 30 €"), { cantidad: 20, divisa: "EUR" });
  assert.equal(leerSeleccion("De 15 € a 25 €").cantidad, 15);
});

test("sin número no hay nada que convertir", () => {
  assert.equal(leerSeleccion("hola"), null);
  assert.equal(leerSeleccion(""), null);
  assert.equal(leerSeleccion(undefined), null);
});

test("destinoPara usa tu par y le da la vuelta si hace falta", () => {
  const par = { from: "EUR", to: "USD" };
  assert.deepEqual(destinoPara("GBP", par), { from: "GBP", to: "USD" });
  assert.deepEqual(destinoPara("USD", par), { from: "USD", to: "EUR" });
  assert.deepEqual(destinoPara("EUR", par), { from: "EUR", to: "USD" });
  assert.deepEqual(destinoPara(null, par), { from: "EUR", to: "USD" });
});

test("los símbolos de las divisas nuevas", () => {
  assert.equal(divisaDe("₹ 499"), "INR");
  assert.equal(divisaDe("₩12,000"), "KRW");
  assert.equal(divisaDe("₪ 90"), "ILS");
  assert.equal(divisaDe("฿350"), "THB");
  assert.equal(divisaDe("₱ 250"), "PHP");
  assert.equal(divisaDe("1 299 Kč"), "CZK");
  assert.equal(divisaDe("Rp 150.000"), "IDR");
  assert.equal(divisaDe("RM 45"), "MYR");
});

test("HK$, NZ$ y S$ no se confunden con el dólar de EEUU", () => {
  assert.equal(divisaDe("HK$ 88"), "HKD");
  assert.equal(divisaDe("NZ$30"), "NZD");
  assert.equal(divisaDe("S$ 12.90"), "SGD");
  assert.equal(divisaDe("US$ 12.90"), "USD", "us$ lleva una s$ dentro");
});

test("los dólares con apellido", () => {
  assert.equal(divisaDe("20 dólares canadienses"), "CAD");
  assert.equal(divisaDe("20 dólares australianos"), "AUD");
  assert.equal(divisaDe("20 dólares neozelandeses"), "NZD");
  assert.equal(divisaDe("20 dólares de Hong Kong"), "HKD");
  assert.equal(divisaDe("20 dólares de Singapur"), "SGD");
  assert.equal(divisaDe("20 dólares"), "USD");
});

test("los nombres de las divisas nuevas", () => {
  assert.equal(divisaDe("500 rupias"), "INR");
  assert.equal(divisaDe("500 rupias indonesias"), "IDR");
  assert.equal(divisaDe("3000 forintos"), "HUF");
  assert.equal(divisaDe("50 pesos filipinos"), "PHP");
  assert.equal(divisaDe("50 pesos"), "MXN");
  assert.equal(divisaDe("200 coronas checas"), "CZK");
  assert.equal(divisaDe("200 coronas islandesas"), "ISK");
  assert.equal(divisaDe("100 lei"), "RON");
  assert.equal(divisaDe("100 rand"), "ZAR");
  assert.equal(divisaDe("100 baht"), "THB");
  assert.equal(divisaDe("100 ringgit"), "MYR");
  assert.equal(divisaDe("100 séqueles"), "ILS");
});

test("los códigos nuevos en mayúsculas", () => {
  assert.equal(divisaDe("1500 INR"), "INR");
  assert.equal(divisaDe("ZAR 99"), "ZAR");
});
