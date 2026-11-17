const { test } = require("node:test");
const assert = require("node:assert");
const { paraDecir, elegirVoz, IDIOMA_DE_DIVISA, CURRENCIES } = require("../logica.js");

test("el precio escrito como allí, para que la voz lo diga como allí", () => {
  assert.deepEqual(paraDecir(84000, "JPY"), { lang: "ja-JP", texto: "￥84,000" });
  assert.deepEqual(paraDecir(12.5, "USD"), { lang: "en-US", texto: "$12.50" });
  assert.deepEqual(paraDecir(20, "USD"), { lang: "en-US", texto: "$20" });
  assert.equal(paraDecir(250000, "VND").lang, "vi-VN");
});

test("pasado de cien, sin céntimos", () => {
  assert.equal(paraDecir(1299.99, "THB").texto, "฿1,300");
});

test("sin idioma (el euro) o sin cantidad, nada", () => {
  assert.equal(paraDecir(20, "EUR"), null);
  assert.equal(paraDecir(0, "JPY"), null);
  assert.equal(paraDecir(null, "JPY"), null);
});

test("todas las divisas menos el euro tienen idioma, y Intl lo entiende", () => {
  for (const { code } of CURRENCIES) {
    if (code === "EUR") continue;
    assert.ok(IDIOMA_DE_DIVISA[code], code);
    assert.ok(paraDecir(1234, code)?.texto, code);
  }
});

test("la voz del país, si no otra de su lengua, y si no ninguna", () => {
  const voces = [{ lang: "en-GB", name: "Daniel" }, { lang: "ja_JP", name: "Kyoko" }, { lang: "es-ES", name: "Mónica" }];
  assert.equal(elegirVoz(voces, "ja-JP").name, "Kyoko");
  assert.equal(elegirVoz(voces, "es-MX").name, "Mónica");
  assert.equal(elegirVoz(voces, "th-TH"), null);
  assert.equal(elegirVoz([], "ja-JP"), null);
});

test("sin las voces de broma, y mejor la de Google o la de por defecto", () => {
  const voces = [
    { lang: "en-US", name: "Albert" }, { lang: "en-US", name: "Eddy (inglés (EE. UU.))" },
    { lang: "en-US", name: "Samantha" }, { lang: "en-US", name: "Google US English" },
  ];
  assert.equal(elegirVoz(voces, "en-US").name, "Google US English");
  assert.equal(elegirVoz(voces.slice(0, 3), "en-US").name, "Samantha");
  assert.equal(elegirVoz([{ lang: "en-US", name: "Samantha" }, { lang: "en-US", name: "Alex", default: true }], "en-US").name, "Alex");
  assert.equal(elegirVoz(voces.slice(0, 2), "en-US"), null);
  // Con el sistema en español vienen traducidas.
  assert.equal(elegirVoz([{ lang: "en-US", name: "Buenas noticias" }, { lang: "en-US", name: "Samantha" }], "en-US").name, "Samantha");
});
