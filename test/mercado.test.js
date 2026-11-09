const { test, afterEach } = require("node:test");
const assert = require("node:assert");
const {
  CURRENCIES, DIVISAS_BCE, DIVISAS_MERCADO, isValidCode, esDeMercado, parDeMercado, urlTasa, urlTasaDia, urlSerie, urlsTodas,
  aFormatoV1, juntarTasas, pedirTodas, buscarPrecios, leerGastoBarra, leerOmnibox, divisaDe, crearGasto, leerGastos,
  tasaLegible, textoEnchufe, enchufeDe, textoEmergencias, pagoJusto, propinaHabitual, nombreDeDestino,
} = require("../logica.js");

const v2 = "https://api.frankfurter.dev/v2";
const v1 = "https://api.frankfurter.dev/v1";
const fetchOriginal = global.fetch;
afterEach(() => { global.fetch = fetchOriginal; });

test("las nuevas son 25, sin repetir y sin pisar las del BCE", () => {
  assert.equal(DIVISAS_BCE.length, 30);
  assert.equal(DIVISAS_MERCADO.length, 25);
  assert.equal(new Set(CURRENCIES.map((c) => c.code)).size, 55);
  for (const { code } of DIVISAS_MERCADO) assert.equal(DIVISAS_BCE.some((c) => c.code === code), false, code);
});

test("Cuba no está, que su tasa oficial no sirve", () => {
  assert.equal(isValidCode("CUP"), false);
});

test("las del BCE siguen saliendo primero", () => {
  assert.deepEqual(CURRENCIES.slice(0, 30), DIVISAS_BCE);
});

test("solo va por la v2 lo que toca una divisa nueva", () => {
  assert.equal(esDeMercado("VND"), true);
  assert.equal(esDeMercado("USD"), false);
  assert.equal(parDeMercado("EUR", "USD"), false);
  assert.equal(parDeMercado("EUR", "VND"), true);
  assert.equal(parDeMercado("VND", "EUR"), true);
});

test("el par de siempre pide lo mismo que antes", () => {
  assert.equal(urlTasa("EUR", "USD"), `${v1}/latest?base=EUR&symbols=USD`);
  assert.equal(urlTasaDia("EUR", "USD", "2026-11-02"), `${v1}/2026-11-02?base=EUR&symbols=USD`);
  assert.equal(urlSerie("EUR", "USD", "2026-11-01"), `${v1}/2026-11-01..?base=EUR&symbols=USD`);
  assert.equal(urlSerie("EUR", "USD", "2026-11-01", "2026-11-05"), `${v1}/2026-11-01..2026-11-05?base=EUR&symbols=USD`);
});

test("el par nuevo va por la v2", () => {
  assert.equal(urlTasa("EUR", "VND"), `${v2}/rates?base=EUR&quotes=VND`);
  assert.equal(urlTasaDia("VND", "EUR", "2026-11-02"), `${v2}/rates?date=2026-11-02&base=VND&quotes=EUR`);
  assert.equal(urlSerie("EUR", "VND", "2026-11-01"), `${v2}/rates?from=2026-11-01&base=EUR&quotes=VND`);
  assert.equal(urlSerie("EUR", "VND", "2026-11-01", "2026-11-05"), `${v2}/rates?from=2026-11-01&to=2026-11-05&base=EUR&quotes=VND`);
});

test("todas: desde una del BCE, dos peticiones; desde una nueva, una", () => {
  const [a, b] = urlsTodas("EUR");
  assert.equal(a, `${v1}/latest?base=EUR`);
  assert.ok(b.startsWith(`${v2}/rates?base=EUR&quotes=VND,ARS`));
  assert.equal(b.includes("USD"), false);
  const unica = urlsTodas("VND");
  assert.equal(unica.length, 1);
  assert.ok(unica[0].includes("quotes=EUR,USD"));
  assert.equal(unica[0].includes(",VND"), false, "no se pide a sí misma");
  assert.ok(urlsTodas("EUR", "2026-11-01")[0].includes("/2026-11-01..?base=EUR"));
  assert.ok(urlsTodas("EUR", "2026-11-01")[1].includes("from=2026-11-01&"));
});

test("la v2 se queda como la v1", () => {
  const filas = [{ date: "2026-11-09", base: "EUR", quote: "ARS", rate: 1728 }, { date: "2026-11-10", base: "EUR", quote: "VND", rate: 28695 }];
  assert.deepEqual(aFormatoV1(filas), { date: "2026-11-10", rates: { ARS: 1728, VND: 28695 } });
  assert.deepEqual(aFormatoV1(filas, true), { rates: { "2026-11-09": { ARS: 1728 }, "2026-11-10": { VND: 28695 } } });
  const deV1 = { date: "2026-11-09", rates: { USD: 1.1 } };
  assert.equal(aFormatoV1(deV1), deV1, "lo de la v1 no se toca");
});

test("juntar lo del BCE y lo de mercado", () => {
  assert.deepEqual(juntarTasas({ rates: { USD: 1.1 } }, { rates: { VND: 28695 } }), { USD: 1.1, VND: 28695 });
  assert.deepEqual(juntarTasas({ rates: { USD: 1.1 } }, null), { USD: 1.1 });
  assert.deepEqual(
    juntarTasas({ rates: { "2026-11-06": { USD: 1.1 } } }, { rates: { "2026-11-06": { VND: 1 }, "2026-11-07": { VND: 2 } } }, true),
    { "2026-11-06": { USD: 1.1, VND: 1 }, "2026-11-07": { VND: 2 } },
  );
});

const respuesta = (cuerpo, ok = true) => ({ ok, status: ok ? 200 : 500, json: async () => cuerpo });

test("pedir todas junta las dos respuestas", async () => {
  global.fetch = async (url) => (url.includes("/v1/")
    ? respuesta({ date: "2026-11-09", rates: { USD: 1.1 } })
    : respuesta([{ date: "2026-11-09", base: "EUR", quote: "VND", rate: 28695 }]));
  assert.deepEqual(await pedirTodas("EUR"), { USD: 1.1, VND: 28695 });
});

test("si falla la v2, las de siempre siguen", async () => {
  global.fetch = async (url) => (url.includes("/v1/") ? respuesta({ rates: { USD: 1.1 } }) : respuesta(null, false));
  assert.deepEqual(await pedirTodas("EUR"), { USD: 1.1 });
});

test("si falla la principal, es un error", async () => {
  global.fetch = async () => respuesta(null, false);
  await assert.rejects(pedirTodas("EUR"), /HTTP 500/);
  await assert.rejects(pedirTodas("VND"), /HTTP 500/);
});

test("un gasto en dong se guarda y se relee", () => {
  const g = crearGasto({ id: "a", from: "VND", to: "EUR", cantidad: 100000, valor: 3.5, concepto: "Pho", cuando: 1 });
  assert.equal(leerGastos([g]).length, 1);
});

test("el código en mayúsculas lo reconoce en una selección", () => {
  assert.equal(divisaDe("100000 VND"), "VND");
  assert.equal(divisaDe("PEN 89.90"), "PEN");
});

test("en una página, no confunde las palabras con divisas", () => {
  assert.deepEqual(buscarPrecios("SHOWER GEL 250 ml"), []);
  assert.deepEqual(buscarPrecios("MAD 20"), []);
  assert.deepEqual(buscarPrecios("COP 500"), []);
  assert.equal(buscarPrecios("Desde 500000 VND")[0].divisa, "VND");
  assert.equal(buscarPrecios("AED 35")[0].divisa, "AED");
});

const par = { from: "JPY", to: "EUR" };

test("en la barra, 'pen' en minúscula es un concepto al apuntar", () => {
  const g = leerGastoBarra("+ 20 pen", par);
  assert.equal(g.from, "JPY");
  assert.equal(g.concepto, "pen");
  assert.equal(leerGastoBarra("+ 20 gel ducha", par).concepto, "gel ducha");
});

test("en mayúscula, o las que no son palabra, sí son divisa", () => {
  assert.equal(leerGastoBarra("+ 20 PEN taxi", par).from, "PEN");
  const g = leerGastoBarra("+ 100000 vnd pho", par);
  assert.equal(g.from, "VND");
  assert.equal(g.concepto, "pho");
});

test("convirtiendo en la barra vale en minúscula", () => {
  assert.equal(leerOmnibox("20 pen", par).from, "PEN");
  assert.equal(leerOmnibox("100000 vnd", par).from, "VND");
});

test("sin datos de enchufe ni emergencias no se inventa nada", () => {
  assert.equal(textoEnchufe(enchufeDe("VND", "EUR")), "");
  assert.equal(textoEmergencias("VND"), "");
  assert.equal(pagoJusto(50, "VND"), null);
  assert.equal(propinaHabitual("VND"), null);
});

test("el viaje coge el país de la divisa", () => {
  assert.match(nombreDeDestino("VND"), /Vietnam/);
  assert.match(nombreDeDestino("MAD"), /Marruecos/);
});

test("las tasas diminutas se leen, y las normales siguen con cuatro decimales", () => {
  assert.equal(tasaLegible(0.00003485), "0,00003485");
  assert.equal(tasaLegible(0.0005), "0,0005000");
  assert.equal(tasaLegible(0.0057), "0,0057");
  assert.equal(tasaLegible(1.1193), "1,1193");
  assert.equal(tasaLegible(28695.228), "28.695,2280");
});
