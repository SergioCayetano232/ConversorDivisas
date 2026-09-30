const { test, afterEach } = require("node:test");
const assert = require("node:assert");
const {
  TEXTOS, NOMBRES_IDIOMA, idiomaPara, idiomaElegido, ponerIdioma, idiomaActual, tr, separadorDecimal,
} = require("../textos.js");
const {
  CURRENCIES, nombreDe, filtrarDivisas, parseAmount, leerImporte, fechaCorta, fechaLarga, textoMomento,
  notaDiaHabil, haceCuanto, textoParaCopiar, textoInsignia, tituloInsignia, mensajeAviso, errorMessageFor,
  divisaDe, FECHAS_RAPIDAS,
} = require("../logica.js");

// Cada test deja el idioma como estaba: los demás archivos cuentan con español.
afterEach(() => ponerIdioma("es"));

const huecos = (texto) => (texto.match(/\{\w+\}/g) || []).sort().join();

test("los dos idiomas tienen las mismas claves", () => {
  assert.deepEqual(Object.keys(TEXTOS.en).sort(), Object.keys(TEXTOS.es).sort());
});

test("y los mismos huecos en cada texto", () => {
  for (const clave of Object.keys(TEXTOS.es)) {
    assert.equal(huecos(TEXTOS.en[clave]), huecos(TEXTOS.es[clave]), clave);
  }
});

test("ningún texto se ha quedado vacío", () => {
  for (const [lengua, textos] of Object.entries(TEXTOS)) {
    for (const [clave, texto] of Object.entries(textos)) assert.ok(texto.trim(), `${lengua}: ${clave}`);
  }
});

test("español para cualquier variante, inglés para lo demás", () => {
  for (const es of ["es", "es-ES", "es-MX", "es-419", "ES"]) assert.equal(idiomaPara(es), "es", es);
  for (const en of ["en", "en-US", "de-DE", "fr", "", undefined, "estonian"]) assert.equal(idiomaPara(en), "en", String(en));
});

test("lo elegido a mano gana al idioma de Chrome", () => {
  assert.equal(idiomaElegido("en", "es-ES"), "en");
  assert.equal(idiomaElegido("es", "en-US"), "es");
});

test("en automático, o sin nada guardado, el de Chrome", () => {
  assert.equal(idiomaElegido("auto", "es-MX"), "es");
  assert.equal(idiomaElegido(undefined, "de-DE"), "en");
  assert.equal(idiomaElegido("fr", "es-ES"), "es", "uno que no existe cuenta como automático");
});

test("cada idioma tiene su nombre para el menú", () => {
  assert.deepEqual(Object.keys(NOMBRES_IDIOMA).sort(), Object.keys(TEXTOS).sort());
});

test("un idioma que no existe se queda en español", () => {
  ponerIdioma("fr");
  assert.equal(idiomaActual(), "es");
});

test("tr rellena los huecos y deja los que no le das", () => {
  assert.equal(tr("fecha.hoy", { valor: "1,14 USD" }), "hoy 1,14 USD");
  assert.equal(tr("fecha.hoy"), "hoy {valor}");
  ponerIdioma("en");
  assert.equal(tr("fecha.hoy", { valor: "1.14 USD" }), "today 1.14 USD");
});

test("una clave que no existe sale tal cual, para verla y arreglarla", () => {
  assert.equal(tr("no.existe"), "no.existe");
});

test("las divisas tienen nombre en inglés", () => {
  for (const c of CURRENCIES) assert.ok(c.en, c.code);
  ponerIdioma("en");
  assert.equal(nombreDe("USD"), "US dollar");
  ponerIdioma("es");
  assert.equal(nombreDe("USD"), "Dólar estadounidense");
});

test("se busca en los dos idiomas", () => {
  assert.equal(filtrarDivisas("pound")[0].code, "GBP");
  assert.equal(filtrarDivisas("libra")[0].code, "GBP");
});

test("en inglés el decimal es el punto", () => {
  ponerIdioma("en");
  assert.equal(parseAmount("12.50"), 12.5);
  assert.equal(parseAmount("1,084.70"), 1084.7);
  assert.equal(parseAmount("1,000"), 1000);
  assert.equal(parseAmount("1,000,000"), 1000000);
  assert.equal(parseAmount("1.5"), 1.5);
});

test("en inglés, una coma sola sin tres cifras detrás es decimal", () => {
  // Quien tiene el Chrome en inglés pero escribe como en Europa.
  ponerIdioma("en");
  assert.equal(parseAmount("12,50"), 12.5);
  assert.equal(parseAmount("0,5"), 0.5);
  assert.equal(parseAmount("1.084,70"), 1084.7);
});

test("en inglés también cuenta", () => {
  ponerIdioma("en");
  assert.equal(leerImporte("3*12.50"), 37.5);
  assert.equal(leerImporte("100-15%"), 85);
});

test("en español se lee como siempre", () => {
  assert.equal(parseAmount("1.084,70"), 1084.7);
  assert.equal(parseAmount("12,50"), 12.5);
});

test("fechas en inglés", () => {
  ponerIdioma("en");
  assert.equal(fechaCorta("2026-09-29", 2026), "Sep 29");
  assert.equal(fechaCorta("2025-10-03", 2026), "Oct 3, 2025");
  assert.equal(fechaLarga("2024-03-01"), "Fri, Mar 1, 2024");
  assert.equal(notaDiaHabil("2024-03-03", "2024-03-01"), "No rate that day; this is the one from Fri, Mar 1, 2024");
});

test("el veredicto en inglés", () => {
  ponerIdioma("en");
  const t = textoMomento({ veredicto: "bueno", diferencia: 0.0182, posicion: 0.86 }, 30, "EUR", "USD");
  assert.equal(t.titulo, "Good time");
  assert.equal(t.detalle, "1.8% above average");
  assert.equal(t.explicacion, "Today's rate beats 86% of the days in the last 30 days. The higher it is, the more USD you get for each EUR.");
});

test("hace cuánto en inglés", () => {
  ponerIdioma("en");
  const ahora = new Date(2026, 8, 30, 12, 0).getTime();
  assert.equal(haceCuanto(ahora - 5 * 60000, ahora), "5 min ago");
  assert.equal(haceCuanto(new Date(2026, 8, 29, 12, 0).getTime(), ahora), "yesterday");
  assert.equal(haceCuanto(new Date(2026, 8, 27, 12, 0).getTime(), ahora), "3 days ago");
});

test("copiar y la insignia usan el decimal del idioma", () => {
  assert.equal(separadorDecimal(), ",");
  assert.equal(textoParaCopiar(1234.5), "1234,50");
  assert.equal(textoInsignia(1.1355), "1,14");
  ponerIdioma("en");
  assert.equal(separadorDecimal(), ".");
  assert.equal(textoParaCopiar(1234.5), "1234.50");
  assert.equal(textoInsignia(1.1355), "1.14");
});

test("la insignia y los avisos en inglés", () => {
  ponerIdioma("en");
  assert.equal(tituloInsignia({ from: "EUR", to: "USD" }, 1.1355, 0.003), "1 EUR = 1.1355 USD · +0.30% since the previous day");
  assert.deepEqual(mensajeAviso({ from: "EUR", to: "USD", sentido: "sube", umbral: 1.15 }, 1.1512), {
    titulo: "1 EUR is now 1.1512 USD",
    cuerpo: "It has risen above 1.1500, as you asked.",
  });
});

test("los errores en inglés", () => {
  ponerIdioma("en");
  const abortado = new Error("x");
  abortado.name = "AbortError";
  assert.equal(errorMessageFor(abortado), "The connection took too long.");
});

test("las pistas entienden precios en inglés", () => {
  assert.equal(divisaDe("50 Canadian dollars"), "CAD");
  assert.equal(divisaDe("20 Swiss francs"), "CHF");
  assert.equal(divisaDe("300 Swedish kronor"), "SEK");
  assert.equal(divisaDe("1000 Czech koruna"), "CZK");
  assert.equal(divisaDe("10 dollars"), "USD", "el dólar a secas sigue siendo el de EEUU");
});

test("las fechas rápidas tienen su texto", () => {
  for (const { clave } of FECHAS_RAPIDAS) {
    assert.notEqual(tr(clave), clave);
  }
});
