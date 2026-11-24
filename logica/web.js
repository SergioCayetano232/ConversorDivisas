// Lo que pasa en las webs: el nivel de precios, las compras de fuera y el precio
// de la página.

// Cuánto de su moneda hace falta allí para comprar lo que 1 dólar en Estados
// Unidos: la paridad de poder adquisitivo del FMI, con su estimación del año.
// Con la tasa del día sale cuánto más caro es un sitio que otro, y así no se
// queda viejo aunque el yen se hunda.
const PPA_ANIO = 2026;
const PPA = {
  USD: 1, GBP: 0.661, JPY: 94.142, CHF: 0.927, CAD: 1.182, AUD: 1.421, CNY: 3.319, MXN: 10.426,
  BRL: 2.598, SEK: 8.287, NOK: 9.46, DKK: 5.728, PLN: 1.91, TRY: 21.055, CZK: 12.907, HKD: 5.47,
  HUF: 187.122, IDR: 4719.555, ILS: 3.639, INR: 20.024, ISK: 159.609, KRW: 898.117, MYR: 1.349,
  NZD: 1.483, PHP: 19.319, RON: 2.197, SGD: 0.788, THB: 9.965, ZAR: 7.466, VND: 6951.034,
  ARS: 719.833, MAD: 3.836, PEN: 1.939, COP: 1596.02, CLP: 489.15, EGP: 8.265, AED: 2.506,
  TWD: 13.476, UYU: 27.409, CRC: 285.919, DOP: 24.277, TND: 0.92, KES: 44.815, LKR: 90.645,
  NPR: 33.902, KHR: 1363.373, JOD: 0.298, QAR: 2.231, SAR: 1.846, GEL: 0.913, RSD: 49.135,
  BOB: 3.119, GTQ: 3.312, PYG: 2617.548,
};
// Con el euro no hay un solo país: en Luxemburgo cuesta casi el doble que en
// Croacia. Uso el del idioma del navegador y, si no es del euro, la media.
const PPA_EURO = {
  DE: 0.719, FR: 0.643, IT: 0.597, ES: 0.598, NL: 0.766, BE: 0.707, AT: 0.732, PT: 0.566,
  IE: 0.735, FI: 0.737, GR: 0.535, SK: 0.534, LT: 0.508, SI: 0.576, LV: 0.535, EE: 0.599,
  HR: 0.472, LU: 0.856, CY: 0.561, MT: 0.561, BG: 0.444,
};
const PPA_EURO_MEDIA = Object.values(PPA_EURO).reduce((a, b) => a + b, 0) / Object.keys(PPA_EURO).length;
// Por debajo de esto es ruido: el dato es una media de todo el país.
const NIVEL_IGUAL = 10;

function paisDePrecios(code, idiomas = []) {
  if (code === "EUR") {
    const region = idiomas.map((i) => String(i).split(/[-_]/).slice(1).find((p) => /^[a-z]{2}$/i.test(p))?.toUpperCase())
      .find((r) => r in PPA_EURO);
    return region ? { region, ppa: PPA_EURO[region] } : { region: null, ppa: PPA_EURO_MEDIA };
  }
  return PPA[code] ? { region: code.slice(0, 2), ppa: PPA[code] } : null;
}

// rate es lo que vale 1 de from en to. Allí es el lado que no es tu divisa,
// esté arriba o abajo; si ninguno lo es, no hay "casa" con la que comparar.
// El IVA general de cada país de la UE, a noviembre de 2026. Es lo que se paga
// al importar casi cualquier cosa; los libros o la comida llevan menos, pero
// eso ya no lo sé por el precio.
const IVA_UE = {
  AT: 20, BE: 21, BG: 20, CY: 19, CZ: 21, DE: 19, DK: 25, EE: 24, ES: 21, FI: 25.5,
  FR: 20, GR: 24, HR: 25, HU: 27, IE: 23, IT: 22, LT: 21, LU: 17, LV: 21, MT: 18,
  NL: 21, PL: 23, PT: 23, RO: 21, SE: 25, SI: 22, SK: 23,
};
// Por encima de 150 € de mercancía ya puede haber aranceles.
const UMBRAL_ARANCEL = 150;
// Sin país en el idioma ("es" a secas) solo me fío de las lenguas que, con el
// euro puesto, casi seguro son de un país.
const PAIS_DE_LENGUA = { es: "ES", de: "DE", fr: "FR", it: "IT", nl: "NL", pt: "PT", fi: "FI", el: "GR", sk: "SK", sl: "SI", et: "EE", lv: "LV", lt: "LT", hr: "HR", mt: "MT" };

function paisIva(idiomas = []) {
  const etiquetas = (Array.isArray(idiomas) ? idiomas : []).map((i) => String(i).split(/[-_]/));
  for (const [, ...resto] of etiquetas) {
    const region = resto.find((p) => /^[a-z]{2}$/i.test(p))?.toUpperCase();
    if (region in IVA_UE) return region;
  }
  for (const [lengua, ...resto] of etiquetas) {
    if (!resto.some((p) => /^[a-z]{2}$/i.test(p)) && PAIS_DE_LENGUA[lengua.toLowerCase()]) return PAIS_DE_LENGUA[lengua.toLowerCase()];
  }
  return null;
}

// Lo que te costaría de verdad si te lo envían desde fuera: el IVA de tu país
// encima, y el aviso de aranceles si pasa del umbral. Solo con el euro como
// tu divisa, que el umbral va en euros.
function compraDeFuera({ cantidad, from, to }, rate, idiomas = []) {
  // En divisa de la UE viene de dentro: no hay aduana.
  if (to !== "EUR" || DIVISAS_UE.has(from) || !(cantidad > 0) || !(rate > 0)) return null;
  const pais = paisIva(idiomas);
  if (!pais) return null;
  const valor = cantidad * rate;
  const pct = IVA_UE[pais];
  const iva = Math.round(valor * pct) / 100;
  return { pais, pct, valor, iva, total: Math.round((valor + iva) * 100) / 100, aranceles: valor > UMBRAL_ARANCEL };
}

function textoCompraDeFuera(r) {
  if (!r) return null;
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pct = tr("pct", { n: numeros({ maximumFractionDigits: 1 }).format(r.pct) });
  return {
    total: tr("fuera.total", { total: `${dinero.format(r.total)} EUR`, iva: `${dinero.format(r.iva)} EUR`, pct }),
    detalle: tr(r.aranceles ? "fuera.aranceles" : "fuera.sinAranceles", { umbral: `${UMBRAL_ARANCEL} EUR` }),
  };
}

function nivelDePrecios(from, to, rate, idiomas = [], tuya = to) {
  if (from === to || !(rate > 0) || (tuya !== from && tuya !== to)) return null;
  const alReves = tuya === from;
  const alli = paisDePrecios(alReves ? to : from, idiomas);
  const casa = paisDePrecios(tuya, idiomas);
  if (alReves) rate = 1 / rate;
  if (!alli || !casa) return null;
  const ratio = (rate * alli.ppa) / casa.ppa;
  const pct = Math.round((ratio - 1) * 100);
  if (Math.abs(pct) < NIVEL_IGUAL) return null;
  return { pct, ratio, alli: alli.region, casa: casa.region };
}

// Los sitios donde lo de cada día te sale más barato, con las tasas de hoy
// desde cualquier base. Lo comparo con la PPA y no con la tasa de hace un año:
// el peso argentino cae porque allí suben los precios, no porque sea más barato.
// Seis, que es lo que cabe en la rejilla de tres filas.
const RINDE_MAX = 6;

function dondeRindeMas(tasas, base, tuya, idiomas = [], max = RINDE_MAX) {
  if (!tasas || !isValidCode(tuya)) return [];
  const de = (code) => (code === base ? 1 : tasas[code]);
  const casa = paisDePrecios(tuya, idiomas);
  if (!casa || !(de(tuya) > 0)) return [];
  return CURRENCIES.map(({ code }) => code)
    .filter((code) => code !== tuya && de(code) > 0)
    .map((code) => {
      // Al euro como destino no le pongo tu país: sería tu casa, no allí.
      const alli = paisDePrecios(code, []);
      if (!alli) return null;
      const ratio = (de(tuya) / de(code)) * alli.ppa / casa.ppa;
      return { code, region: alli.region, ratio, pct: Math.round((ratio - 1) * 100) };
    })
    .filter((r) => r && r.pct <= -NIVEL_IGUAL)
    .sort((a, b) => a.ratio - b.ratio)
    .slice(0, max);
}

// Lo caro que es un sitio frente a tu casa, sin el umbral de la pastilla: aquí
// cuenta hasta el 3 %. tasa es lo que vale 1 de allí en lo tuyo. El euro de
// destino va con la media, que tu país es tu casa.
function nivelFrente(code, casa, tasa, idiomas = []) {
  const alli = paisDePrecios(code, []);
  const aqui = paisDePrecios(casa, idiomas);
  if (!alli || !aqui || !(tasa > 0)) return null;
  return { nivel: (tasa * alli.ppa) / aqui.ppa, region: alli.region };
}

// "In United States" suena mal: algunos países llevan artículo.
const ARTICULO_PAIS = { es: { GB: "el " }, en: { US: "the ", GB: "the ", NL: "the ", PH: "the ", AE: "the ", DO: "the " } };

function nombrePais(region) {
  if (!region) return tr("precios.zonaEuro");
  const nombres = (style) => new Intl.DisplayNames([localeActual()], { type: "region", style }).of(region);
  const largo = nombres("long");
  const nombre = /\(|SAR/.test(largo) ? nombres("short") : largo;
  return `${ARTICULO_PAIS[idiomaActual()]?.[region] ?? ""}${nombre}`;
}

// Corto, para la pastilla: "allí −12 %". Largo, para el título, con lo que sería
// pagar esa cantidad en casa si se la das.
function textoNivel(nivel, { corto = false, importe = null, to = "" } = {}) {
  if (!nivel) return "";
  const n = numeros({ maximumFractionDigits: 0 });
  if (corto) return tr("precios.corto", { signo: nivel.pct > 0 ? "+" : "−", pct: n.format(Math.abs(nivel.pct)) });
  const datos = { alli: nombrePais(nivel.alli), casa: nombrePais(nivel.casa), pct: n.format(Math.abs(nivel.pct)) };
  const frases = [tr(nivel.pct > 0 ? "precios.masCaro" : "precios.masBarato", datos)];
  if (importe > 0) frases.push(tr("precios.equivale", { importe: `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(importe / nivel.ratio)} ${to}` }));
  frases.push(tr("precios.fuente", { anio: PPA_ANIO }));
  return frases.join(". ");
}

// El panel lateral abre el mismo popup.html con ?panel, y así sé dónde estoy.
const esPanel = (busqueda) => new URLSearchParams(busqueda ?? "").has("panel");

// El panel se queda abierto horas, y mientras tanto los viajes pueden cambiar
// por debajo: "cd + 20 taxi" en la barra o la copia de seguridad. Si no los
// recargo, el siguiente gasto que apunte se los come. Lo que guardé yo no cuenta.
const cambioDeFuera = (nuevo, mio) => JSON.stringify(nuevo) !== JSON.stringify(mio);

// El precio que guardas con la chincheta de la tarjeta, para compararlo con el
// de otra tienda. Solo uno: el siguiente que guardes lo sustituye.
const GUARDADO_DIAS = 30;
const WEB_MAX = 60;

function webDe(url) {
  if (typeof url !== "string" || !url) return "";
  let host = url;
  try {
    host = new URL(url).hostname;
  } catch {
    // Ya venía solo el nombre, como lo manda la tarjeta.
  }
  return host.toLowerCase().replace(/^www\./, "").slice(0, WEB_MAX);
}

function crearGuardado(precio, ahora = Date.now()) {
  if (!precio || !(precio.cantidad > 0) || !Number.isFinite(precio.cantidad) || !isValidCode(precio.from)) return null;
  return { cantidad: precio.cantidad, from: precio.from, web: webDe(precio.web), cuando: ahora };
}

// Pasado un mes ya no es el precio de esa tienda, así que no lo comparo.
function leerGuardado(crudo, ahora = Date.now()) {
  const g = crearGuardado(crudo, crudo?.cuando ?? NaN);
  if (!g || !Number.isFinite(g.cuando) || ahora - g.cuando > GUARDADO_DIAS * 86400000) return null;
  return g;
}

const esElGuardado = (guardado, precio) =>
  Boolean(guardado && precio) && guardado.cantidad === precio.cantidad && guardado.from === precio.from && guardado.web === webDe(precio.web);

// Los dos en tu divisa y a la tasa de hoy: lo guardado no se queda con la del
// día que lo guardaste, que lo vas a pagar hoy.
function compararConGuardado(guardado, precio, valorAqui, valorGuardado) {
  if (!guardado || esElGuardado(guardado, precio)) return null;
  const r = compararPrecios(valorGuardado, valorAqui);
  return r && { ...r, web: guardado.web, mismaWeb: guardado.web === webDe(precio.web) };
}

function textoGuardado(r, to) {
  if (!r) return "";
  const lugar = r.mismaWeb || !r.web ? tr("guardado.elOtro") : tr("guardado.en", { web: r.web });
  if (r.donde === "igual") return tr("guardado.igual", { lugar });
  const ahorro = `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(r.ahorro)} ${to}`;
  const pct = tr("pct", { n: numeros({ maximumFractionDigits: r.fraccion < 0.1 ? 1 : 0 }).format(r.fraccion * 100) });
  return tr(r.donde === "aqui" ? "guardado.aqui" : "guardado.alli", { lugar, ahorro, pct });
}

// El precio del producto sin seleccionar nada: las tiendas lo dejan escrito para
// Google en un JSON-LD o en las metas, con su divisa. En el JSON va con punto
// ("1299.00"), pero hay quien lo pone como en la etiqueta ("1.299,00").
function numeroDePrecio(v) {
  const n = typeof v === "number" ? v
    : typeof v !== "string" ? null
      : /^\s*\d+(\.\d+)?\s*$/.test(v) ? Number(v) : leerNumero(v.match(NUMERO)?.[0] ?? "");
  return Number.isFinite(n) && n > 0 ? n : null;
}

const esDeTipo = (nodo, tipo) => [].concat(nodo?.["@type"] ?? []).some((t) => typeof t === "string" && t.toLowerCase() === tipo);

function ofertaDe(ofertas) {
  for (const o of [].concat(ofertas ?? [])) {
    if (!o || typeof o !== "object") continue;
    const spec = [].concat(o.priceSpecification ?? [])[0];
    // En un AggregateOffer el que ves en la página es el "desde".
    const cantidad = numeroDePrecio(o.price ?? o.lowPrice ?? spec?.price);
    const divisa = String(o.priceCurrency ?? spec?.priceCurrency ?? "").toUpperCase();
    if (cantidad) return { cantidad, divisa: isValidCode(divisa) ? divisa : null };
  }
  return null;
}

function productosDeJsonLd(nodo, hallados = [], fondo = 0) {
  if (!nodo || typeof nodo !== "object" || fondo > 6 || hallados.length >= 20) return hallados;
  if (Array.isArray(nodo)) {
    for (const n of nodo) productosDeJsonLd(n, hallados, fondo + 1);
    return hallados;
  }
  const oferta = nodo.offers && !esDeTipo(nodo, "offer") ? ofertaDe(nodo.offers) : null;
  if (oferta) hallados.push({ ...oferta, nombre: typeof nodo.name === "string" ? nodo.name.trim() : "" });
  for (const clave of ["@graph", "mainEntity", "itemListElement", "item", "hasVariant"]) productosDeJsonLd(nodo[clave], hallados, fondo + 1);
  return hallados;
}

const METAS_PRECIO = [["product:price:amount", "product:price:currency"], ["og:price:amount", "og:price:currency"], ["price", "pricecurrency"]];
const NOMBRE_PRODUCTO_MAX = 40;

// Con varios precios distintos es un listado y no sé cuál miras: ahí no adivino.
function precioDeLaPagina(pagina, web = null) {
  if (!pagina || typeof pagina !== "object") return null;
  const productos = [];
  for (const texto of [].concat(pagina.jsonld ?? []).slice(0, 20)) {
    try {
      productosDeJsonLd(JSON.parse(texto), productos);
    } catch {
      // Hay tiendas con el JSON-LD roto; me quedan las metas.
    }
  }
  const unico = productos.length > 0 && productos.every((p) => p.cantidad === productos[0].cantidad && p.divisa === productos[0].divisa);
  let hallado = unico ? productos[0] : null;
  const metas = pagina.metas && typeof pagina.metas === "object" ? pagina.metas : {};
  for (const [precio, moneda] of hallado ? [] : METAS_PRECIO) {
    const cantidad = numeroDePrecio(metas[precio]);
    const divisa = String(metas[moneda] ?? "").toUpperCase();
    if (cantidad) hallado = { cantidad, divisa: isValidCode(divisa) ? divisa : null, nombre: "" };
    if (hallado) break;
  }
  const divisa = hallado?.divisa ?? (isValidCode(web) ? web : null);
  if (!hallado || !divisa) return null;
  const nombre = (hallado.nombre || String(pagina.titulo ?? "")).replace(/\s+/g, " ").trim();
  return { cantidad: hallado.cantidad, divisa, nombre: nombre.length > NOMBRE_PRODUCTO_MAX ? `${nombre.slice(0, NOMBRE_PRODUCTO_MAX - 1)}…` : nombre };
}

// Con dos decimales y el código, para que no haya duda al leerlo: "1299.50 USD".
const precioComoTexto = (precio) => `${precio.cantidad.toFixed(2)} ${precio.divisa}`;

// El aviso que propone la tarjeta: un 5 % menos, en redondo, que nadie quiere
// que le avisen a 204,21. De ahí lo cambias tú.
const AVISO_TARJETA_BAJA = 0.05;

function maximoSugerido(valor) {
  if (!(valor > 0) || !Number.isFinite(valor)) return null;
  const objetivo = valor * (1 - AVISO_TARJETA_BAJA);
  const paso = 10 ** (Math.floor(Math.log10(objetivo)) - 1);
  const redondo = Math.round(Math.floor(objetivo / paso + 1e-9) * paso * 100) / 100;
  // Con cuatro céntimos no hay redondo por debajo: ahí no propongo nada.
  return redondo > 0 && redondo < valor ? redondo : null;
}

// Lo mismo que el formulario del popup, pero diciendo por qué no, para que la
// tarjeta lo enseñe. Dos avisos iguales no: saltarían los dos a la vez.
function avisoDesdeTarjeta(avisos, precio, maximo, rate, id) {
  const lista = leerAvisos(avisos);
  if (!precio || !isValidCode(precio.from) || !isValidCode(precio.to) || precio.from === precio.to) return { problema: "noSe" };
  if (!(precio.cantidad > 0) || !(rate > 0)) return { problema: "noSe" };
  if (!(maximo > 0)) return { problema: "escribe" };
  if (maximo >= Math.round(precio.cantidad * rate * 100) / 100) return { problema: "yaCuesta" };
  if (lista.some((a) => a.precio === precio.cantidad && a.maximo === maximo && a.from === precio.from && a.to === precio.to)) return { problema: "repetido" };
  if (lista.length >= AVISOS_MAX) return { problema: "lleno" };
  const aviso = crearCompra(precio.from, precio.to, precio.cantidad, maximo, rate, id);
  return aviso ? { aviso, avisos: [...lista, aviso] } : { problema: "noSe" };
}

// Lo que seleccionas en una web: "65 mph", "350 °F", "2 cups". Las mismas
// medidas que la barra y en el mismo orden, que algunas se pisan si lo cambio.
const MEDIDAS = [
  [leerHoraZona, textoHoraZona], [leerGrados, textoGrados], [leerGas, textoGas], [leerDistancia, textoDistancia],
  [leerRitmo, textoRitmo], [leerPeso, textoPeso], [leerOnzas, textoOnzas], [leerOnzasTroy, textoOnzasTroy],
  [leerAltura, textoAltura], [leerVelocidad, textoVelocidad], [leerVolumen, textoVolumen], [leerLongitud, textoLongitud],
  [leerSuperficie, textoSuperficie], [leerMillasCuadradas, textoMillasCuadradas], [leerPulgadasCuadradas, textoPulgadasCuadradas],
  [leerYardasCuadradas, textoYardasCuadradas], [leerConsumo, textoConsumo], [leerElectrico, textoElectrico],
  [leerPresion, textoPresion], [leerTazaDe, textoTazaDe], [leerTazas, textoTazas], [leerCucharadas, textoCucharadas],
  [leerSticks, textoSticks], [leerYardas, textoYardas], [leerStone, textoStone], [leerLibrasYOnzas, textoLibrasYOnzas],
  [leerOnzasLiquidas, textoOnzasLiquidas], [leerPintas, textoPintas], [leerCuartos, textoCuartos], [leerNudos, textoNudos],
  [leerMetrosPorSegundo, textoMetrosPorSegundo], [leerMillasNauticas, textoMillasNauticas], [leerLeguas, textoLeguas],
  [leerManos, textoManos], [leerFurlongs, textoFurlongs], [leerChains, textoChains], [leerGills, textoGills],
  [leerRods, textoRods], [leerJin, textoJin], [leerTsubo, textoTsubo], [leerJo, textoJo], [leerLakh, textoLakh],
  [leerTola, textoTola], [leerTael, textoTael], [leerMach, textoMach], [leerThou, textoThou], [leerGramaje, textoGramaje],
  [leerMomme, textoMomme], [leerPood, textoPood], [leerVersta, textoVersta], [leerAnioLuz, textoAnioLuz],
  [leerManzana, textoManzana], [leerArpent, textoArpent], [leerAcrePie, textoAcrePie], [leerBigha, textoBigha],
  [leerMu, textoMu], [leerMaund, textoMaund], [leerPicul, textoPicul], [leerShaku, textoShaku], [leerRopa, textoRopa],
  [leerCamisa, textoCamisa], [leerAnillo, textoAnillo], [leerTalla, textoTalla], [leerMah, textoMah], [leerMbps, textoMbps],
  [leerGlucosa, textoGlucosa], [leerGo, textoGo], [leerVara, textoVara], [leerRi, textoRi], [leerDram, textoDram],
  [leerFanega, textoFanega], [leerCodo, textoCodo], [leerBrazas, textoBrazas], [leerAcres, textoAcres],
  [leerCalorias, textoCalorias], [leerPotencia, textoPotencia], [leerBtu, textoBtu], [leerTherms, textoTherms],
  [leerInHg, textoInHg], [leerPiesCubicos, textoPiesCubicos], [leerPulgadasCubicas, textoPulgadasCubicas],
  [leerBarriles, textoBarriles], [leerParMotor, textoParMotor], [leerPennyweight, textoPennyweight], [leerCwt, textoCwt],
  [leerCuerdas, textoCuerdas], [leerBushels, textoBushels], [leerPecks, textoPecks], [leerGrains, textoGrains],
  [leerQuilates, textoQuilates], [leerYardasCubicas, textoYardasCubicas], [leerToneladasCortas, textoToneladasCortas],
];

function medidaTalCual(texto) {
  for (const [leer, decir] of MEDIDAS) {
    const leido = leer(texto);
    if (!leido) continue;
    const frase = decir(leido);
    const corte = frase.indexOf(" = ");
    return corte < 0 ? null : { de: frase.slice(0, corte), a: frase.slice(corte + 3), frase };
  }
  return null;
}

// Al seleccionar con el ratón se cuela el punto del final, un paréntesis o la
// palabra de delante ("up to 65 mph"). Primero entero, que "talla 42" y
// "Mach 2" llevan la palabra delante a propósito.
function medidaDeSeleccion(texto) {
  if (typeof texto !== "string") return null;
  // En las webs el espacio entre el número y la unidad suele ser de los que no parten.
  const limpio = texto.replace(/[\u00a0\u202f\u2009]/g, " ").replace(/\s+/g, " ").trim()
    .replace(/^[(\[«"“]+\s*/, "").replace(/\s*[.,;:!?)\]»”]+$/, "");
  if (!limpio || limpio.length > 40) return null;
  const desdeElNumero = limpio.slice(limpio.search(/\d/));
  return medidaTalCual(limpio) ?? (desdeElNumero !== limpio && /^\d/.test(desdeElNumero) ? medidaTalCual(desdeElNumero) : null);
}

// El icono de la barra da una vuelta de moneda al convertir desde la web. Por
// fotograma, lo que se estrecha (el coseno del giro) y si se ve el dorso, que
// pinto más oscuro. Frena al final, como el resto de animaciones.
const FOTOGRAMAS_MONEDA = 14;

function vueltaMoneda(n = FOTOGRAMAS_MONEDA) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const avance = 1 - (1 - i / n) ** 2;
    const giro = Math.cos(avance * 2 * Math.PI);
    // De canto del todo no se vería nada: dejo una rendija.
    return { ancho: Math.max(Math.abs(giro), 0.08), dorso: giro < 0 };
  });
}
