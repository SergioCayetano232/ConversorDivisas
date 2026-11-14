const { test } = require("node:test");
const assert = require("node:assert");
const { CURRENCIES, PPA, PPA_EURO, nivelDePrecios, paisDePrecios, textoNivel } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("hay dato para todas las divisas", () => {
  for (const { code } of CURRENCIES) assert.ok(paisDePrecios(code), code);
  assert.equal(Object.keys(PPA).length + 1, CURRENCIES.length, "ni una de más");
});

test("el euro va con el país del idioma, y si no, con la media", () => {
  assert.deepEqual(paisDePrecios("EUR", ["es-ES", "en"]), { region: "ES", ppa: PPA_EURO.ES });
  assert.deepEqual(paisDePrecios("EUR", ["en-US", "de-AT"]), { region: "AT", ppa: PPA_EURO.AT }, "el primero que sea del euro");
  const media = paisDePrecios("EUR", ["en-US", "ja"]);
  assert.equal(media.region, null);
  assert.ok(media.ppa > PPA_EURO.HR && media.ppa < PPA_EURO.LU);
});

test("con la tasa del día: Suiza cara y Vietnam barato desde España", () => {
  const suiza = nivelDePrecios("CHF", "EUR", 1.07, ["es-ES"]);
  assert.equal(suiza.pct, Math.round((1.07 * PPA.CHF / PPA_EURO.ES - 1) * 100));
  assert.ok(suiza.pct > 50);
  assert.equal(suiza.alli, "CH");
  assert.equal(suiza.casa, "ES");
  const vietnam = nivelDePrecios("VND", "EUR", 1 / 30500, ["es-ES"]);
  assert.ok(vietnam.pct < -50);
});

test("si la moneda se hunde, el sitio se abarata", () => {
  const antes = nivelDePrecios("JPY", "EUR", 0.0080, ["es-ES"]).pct;
  const despues = nivelDePrecios("JPY", "EUR", 0.0050, ["es-ES"]).pct;
  assert.ok(despues < antes);
});

test("allí es el lado que no es tu divisa, esté arriba o abajo", () => {
  const abajo = nivelDePrecios("EUR", "USD", 1 / 0.92, ["es-ES"], "EUR");
  const arriba = nivelDePrecios("USD", "EUR", 0.92, ["es-ES"], "EUR");
  assert.deepEqual(abajo, arriba);
  assert.equal(abajo.alli, "US");
  assert.ok(abajo.pct > 0, "Estados Unidos, más caro que España");
});

test("si ninguna de las dos es la tuya, no hay casa con la que comparar", () => {
  assert.equal(nivelDePrecios("JPY", "USD", 0.0066, ["es-ES"], "EUR"), null);
});

test("parecidos, la misma divisa o sin tasa: nada", () => {
  const casiIgual = PPA_EURO.ES / PPA.USD;
  assert.equal(nivelDePrecios("USD", "EUR", casiIgual * 1.05, ["es-ES"]), null, "un 5 % es ruido");
  assert.equal(nivelDePrecios("EUR", "EUR", 1), null);
  assert.equal(nivelDePrecios("USD", "EUR", null), null);
  assert.equal(nivelDePrecios("XXX", "EUR", 1), null);
});

test("el texto, corto y largo, en los dos idiomas", () => {
  const nivel = { pct: -38, ratio: 0.62, alli: "JP", casa: "ES" };
  assert.equal(textoNivel(nivel, { corto: true }), "allí −38 %");
  assert.equal(textoNivel({ ...nivel, pct: 66 }, { corto: true }), "allí +66 %");
  const largo = textoNivel(nivel, { importe: 31, to: "EUR" });
  assert.match(largo, /^En Japón, lo de cada día cuesta un 38 % menos que en España\. /);
  assert.match(largo, /como pagar 50,00 EUR en casa/);
  assert.match(largo, /FMI \(2026\)$/);
  assert.match(textoNivel({ ...nivel, casa: null }), /que en la zona euro/);
  assert.match(textoNivel({ ...nivel, alli: "GB" }), /^En el Reino Unido/);
  assert.equal(textoNivel(null), "");
  ponerIdioma("en");
  try {
    assert.equal(textoNivel(nivel, { corto: true }), "there −38%");
    assert.match(textoNivel({ ...nivel, pct: 20, alli: "US" }), /^In the United States, everyday things cost 20% more than in Spain/);
  } finally {
    ponerIdioma("es");
  }
});
