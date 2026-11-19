const { test } = require("node:test");
const assert = require("node:assert");
const { paraEnsenar, REGATEO, IDIOMA_DE_DIVISA } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("el precio escrito como allí", () => {
  assert.equal(paraEnsenar(84000, "JPY").precio, "￥84,000");
  assert.equal(paraEnsenar(84000, "JPY").lang, "ja-JP");
  assert.equal(paraEnsenar(49.5, "USD").precio, "$49.50");
});

test("donde no se regatea no hay frase", () => {
  assert.equal(paraEnsenar(84000, "JPY").frase, null);
  assert.equal(paraEnsenar(20, "GBP").frase, null);
});

test("donde se regatea, la frase en su idioma con el precio dentro", () => {
  assert.equal(paraEnsenar(300, "THB").frase, "฿300 ได้ไหม");
  // Intl pone un espacio duro entre la cifra y el ₫.
  assert.equal(paraEnsenar(150000, "VND").frase.replace(/\s/g, " "), "150.000 ₫ được không?");
  assert.equal(paraEnsenar(200, "MXN").frase, "¿Me lo deja en $200?");
  assert.equal(paraEnsenar(100, "HKD").frase, "HK$100得唔得？");
  assert.equal(paraEnsenar(500, "TRY").frase, "₺500 olur mu?");
});

test("en árabe, de derecha a izquierda", () => {
  const r = paraEnsenar(200, "MAD");
  assert.equal(r.rtl, true);
  assert.match(r.frase, /^ممكن .*200.*؟$/);
});

test("lo que no sé decir, en inglés", () => {
  assert.equal(paraEnsenar(2000, "NPR").frase.startsWith("Can you do "), true);
  assert.equal(paraEnsenar(1000, "KES").frase.startsWith("Can you do "), true);
});

test("todos los mercados de regateo tienen frase", () => {
  for (const { codes } of Object.values(REGATEO)) {
    for (const code of codes) assert.ok(paraEnsenar(100, code).frase, `${code} ${IDIOMA_DE_DIVISA[code]}`);
  }
});

test("con el euro, en tu formato", () => {
  ponerIdioma("es");
  assert.match(paraEnsenar(27.6, "EUR").precio, /^27,60\s€$/);
});

test("sin cantidad o con divisa rara, nada", () => {
  assert.equal(paraEnsenar(0, "JPY"), null);
  assert.equal(paraEnsenar(-5, "JPY"), null);
  assert.equal(paraEnsenar(NaN, "JPY"), null);
  assert.equal(paraEnsenar(10, "XYZ"), null);
});
