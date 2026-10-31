const { test } = require("node:test");
const assert = require("node:assert");
const { leerDram, convertirDram, textoDram, leerOnzasLiquidas, leerOmnibox } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const texto = (t) => textoDram(leerDram(t));

test("lee los dram de peso y los de líquido", () => {
  for (const t of ["3 dram", "3dram", "3 DRAM", "3 drams", "3 drachm"]) assert.deepEqual(leerDram(t), { valor: 3, de: "dram" }, t);
  for (const t of ["1 fl dr", "1 fl. dr", "1 fluid dram", "1 fl drams", "1 FL DR"]) assert.deepEqual(leerDram(t), { valor: 1, de: "fl dr" }, t);
  assert.equal(leerDram("1,5 dram").valor, 1.5);
});

test("lo que no son dram, no; ni el doctor", () => {
  for (const t of ["dram", "3", "3 dr", "3 fl oz", "-3 dram", "", undefined]) assert.equal(leerDram(t), null, String(t));
  assert.equal(leerOnzasLiquidas("1 fl dr"), null);
  assert.ok(leerOnzasLiquidas("1 fl oz"));
  assert.equal(leerOmnibox("3 dram", { from: "EUR", to: "USD" }), null);
});

test("un dram es la dieciseisava de onza; el de líquido, la octava", () => {
  cerca(convertirDram({ valor: 16, de: "dram" }).valor, 28.349523125);
  cerca(convertirDram({ valor: 8, de: "fl dr" }).valor, 29.5735295625);
  assert.equal(convertirDram({ valor: 1, de: "dram" }).a, "g");
  assert.equal(convertirDram({ valor: 1, de: "fl dr" }).a, "ml");
  assert.equal(texto("3 dram"), "3 dram = 5,32 g");
  assert.equal(texto("1 fl dr"), "1 fl dr = 3,7 ml");
  assert.equal(textoDram(null), "");
});

test("en inglés, con punto", () => {
  ponerIdioma("en");
  try {
    assert.equal(texto("2.75 dram"), "2.75 dram = 4.87 g");
  } finally {
    ponerIdioma("es");
  }
});
