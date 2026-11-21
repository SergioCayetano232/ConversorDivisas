// Sacar un precio de un texto: lo seleccionado en una web, lo que escribes en
// la barra o lo que dictas.

// En una web cualquiera no sé si "1.234" son mil o uno con algo, así que no
// vale parseAmount. Regla: si hay punto y coma, el último es el decimal; si solo
// hay uno y lleva tres cifras detrás, son miles.
function leerNumero(texto) {
  const limpio = texto.replace(/[\s  ']/g, "");
  const ultimoPunto = limpio.lastIndexOf(".");
  const ultimaComa = limpio.lastIndexOf(",");

  let decimal = null;
  if (ultimoPunto !== -1 && ultimaComa !== -1) {
    decimal = ultimoPunto > ultimaComa ? "." : ",";
  } else if (ultimoPunto !== -1 || ultimaComa !== -1) {
    const sep = ultimoPunto !== -1 ? "." : ",";
    const trozos = limpio.split(sep);
    const detras = trozos[trozos.length - 1];
    // "0,125" no son ciento veinticinco.
    const esMiles = trozos.length > 2 || (detras.length === 3 && trozos[0] !== "0");
    if (!esMiles) decimal = sep;
  }

  const miles = decimal === "." ? "," : ".";
  let normal = limpio.split(miles).join("");
  if (decimal === ",") normal = normal.replace(",", ".");
  if (decimal === null) normal = normal.replace(/[.,]/g, "");

  const valor = Number(normal);
  return Number.isFinite(valor) ? valor : null;
}

// Lo más concreto primero: "R$" y "US$" también llevan un "$", y el dólar a
// secas me lo quedo para el final.
const PISTAS = [
  // "us$" antes que "s$", que si no los dólares de EEUU salían de Singapur.
  [/r\$/, "BRL"], [/mx\$/, "MXN"], [/(ca|c)\$/, "CAD"], [/(au|a)\$/, "AUD"], [/us\$/, "USD"],
  [/hk\$/, "HKD"], [/nz\$/, "NZD"], [/s\$/, "SGD"],
  [/cn¥|元|rmb/, "CNY"],
  [/€/, "EUR"], [/£/, "GBP"], [/円/, "JPY"], [/[¥￥]/, "¥"], [/₺/, "TRY"], [/zł/, "PLN"],
  [/₹/, "INR"], [/₩/, "KRW"], [/₪/, "ILS"], [/฿/, "THB"], [/₱/, "PHP"],
  // Kč llega sin el acento de la c porque normalizar lo quita.
  [/\bkc\b/, "CZK"], [/\brp\b/, "IDR"], [/\brm\b/, "MYR"],
  // Un símbolo es más fiable que una palabra: "real estate $500" son dólares.
  [/\$/, "$"],
  [/\beuros?\b/, "EUR"],
  // Los dólares con apellido antes que el dólar a secas.
  [/\bdolar(es)? canadienses?\b|\bcanadian dollars?\b/, "CAD"],
  [/\bdolar(es)? australianos?\b|\baustralian dollars?\b/, "AUD"],
  [/\bdolar(es)? neozelandes(es)?\b|\bnew zealand dollars?\b/, "NZD"],
  [/\bdolar(es)? (de )?hong kong\b|\bhongkones(es)?\b|\bhong kong dollars?\b/, "HKD"],
  [/\bdolar(es)? (de )?singapur\b|\bsingapurenses?\b|\bsingapore dollars?\b/, "SGD"],
  [/\b(dolar(es)?|dollars?)\b/, "USD"],
  [/\b(libras?|pounds?)\b/, "GBP"],
  [/\byen(es)?\b/, "JPY"],
  [/\byuan(es)?\b/, "CNY"],
  [/\b(francos?|francs?)\b/, "CHF"],
  [/\bpesos? filipinos?\b|\bphilippine pesos?\b/, "PHP"],
  [/\bpesos?\b/, "MXN"],
  [/\b(real|reales|reais)\b/, "BRL"],
  [/\bcoronas? suecas?\b/, "SEK"], [/\bcoronas? noruegas?\b/, "NOK"], [/\bcoronas? danesas?\b/, "DKK"],
  [/\bcoronas? checas?\b/, "CZK"], [/\bcoronas? islandesas?\b/, "ISK"],
  [/\bswedish kron(a|or)\b/, "SEK"], [/\bnorwegian kron(e|er)\b/, "NOK"], [/\bdanish kron(e|er)\b/, "DKK"],
  [/\bczech korun(a|y)\b/, "CZK"], [/\bicelandic kron(a|ur)\b/, "ISK"],
  [/\b(eslotis?|zlotys?)\b/, "PLN"],
  [/\bliras?\b/, "TRY"],
  [/\brupias? indonesias?\b/, "IDR"],
  [/\b(rupias?|rupees?)\b/, "INR"],
  [/\bforint(o|os|s)?\b/, "HUF"],
  [/\bwon(es)?\b/, "KRW"],
  [/\bringgits?\b/, "MYR"],
  [/\b(sequel(es)?|shekels?)\b/, "ILS"],
  [/\b(leu|lei)\b/, "RON"],
  [/\bbahts?\b/, "THB"],
  [/\brands?\b/, "ZAR"],
];

// El "$" a secas y el "¥" dependen de dónde estés: en amazon.com.mx el "$" son
// pesos, y en una tienda china el "¥" son yuanes.
const CON_DOLAR = new Set(["USD", "CAD", "AUD", "MXN", "NZD", "SGD", "HKD", "ARS", "CLP", "COP", "UYU", "TWD", "DOP"]);
const simboloSuelto = (code, web) => {
  if (code === "$") return CON_DOLAR.has(web) ? web : "USD";
  if (code === "¥") return web === "CNY" ? "CNY" : "JPY";
  return code;
};

function divisaDe(texto, web = null) {
  // Un código ISO gana a cualquier símbolo, pero solo en mayúsculas: en
  // minúscula "try it for $5" salía en liras turcas.
  for (const { code } of CURRENCIES) {
    if (new RegExp(`\\b${code}\\b`).test(texto)) return code;
  }
  const t = normalizar(texto);
  for (const [patron, code] of PISTAS) {
    if (patron.test(t)) return simboloSuelto(code, web);
  }
  return null;
}

// La divisa de una web por su dominio: amazon.co.jp, en yenes. Los .com no
// dicen nada, y tampoco los dominios que se usan para otra cosa (.co, .io, .tv).
const DOMINIOS = {
  jp: "JPY", uk: "GBP", ca: "CAD", au: "AUD", mx: "MXN", br: "BRL", ch: "CHF", li: "CHF", se: "SEK", no: "NOK",
  dk: "DKK", pl: "PLN", tr: "TRY", cz: "CZK", hu: "HUF", id: "IDR", il: "ILS", in: "INR", is: "ISK", kr: "KRW",
  my: "MYR", nz: "NZD", ph: "PHP", ro: "RON", sg: "SGD", th: "THB", za: "ZAR", cn: "CNY", hk: "HKD", vn: "VND",
  ar: "ARS", ma: "MAD", pe: "PEN", cl: "CLP", eg: "EGP", ae: "AED", tw: "TWD", uy: "UYU", cr: "CRC", do: "DOP",
  tn: "TND", ke: "KES", lk: "LKR", np: "NPR", kh: "KHR", jo: "JOD", qa: "QAR", sa: "SAR", ge: "GEL", rs: "RSD",
  bo: "BOB", gt: "GTQ", py: "PYG",
  de: "EUR", fr: "EUR", es: "EUR", it: "EUR", nl: "EUR", be: "EUR", at: "EUR", pt: "EUR", ie: "EUR", fi: "EUR",
  gr: "EUR", sk: "EUR", si: "EUR", ee: "EUR", lv: "EUR", lt: "EUR", lu: "EUR", mt: "EUR", cy: "EUR", hr: "EUR",
  bg: "EUR",
};

function divisaDeLaWeb(url) {
  let host;
  try {
    host = new URL(url).hostname;
  } catch {
    return null;
  }
  const trozos = host.toLowerCase().split(".");
  // Colombia va por .com.co: el .co a secas es de startups de todo el mundo.
  if (trozos.at(-1) === "co") return trozos.at(-2) === "com" ? "COP" : null;
  return trozos.length > 1 ? DOMINIOS[trozos.at(-1)] ?? null : null;
}

// Los espacios solo cuentan como separador si detrás van tres cifras justas:
// así "20 30" es un 20 y no un 2030.
const NUMERO = /\d{1,3}(?:[\s  '.,]\d{3})+(?:[.,]\d{1,2})?(?!\d)|\d+(?:[.,]\d+)?/;

// Sin divisa en el texto, la de la web, avisando de que la he supuesto.
function leerSeleccion(texto, web = null) {
  if (typeof texto !== "string") return null;
  const hallado = texto.match(NUMERO);
  if (!hallado) return null;
  const cantidad = leerNumero(hallado[0]);
  if (cantidad === null) return null;
  const divisa = divisaDe(texto, web);
  if (!divisa && isValidCode(web)) return { cantidad, divisa: web, deLaWeb: true };
  return { cantidad, divisa };
}

// Varios precios seleccionados, como la lista de la compra de una web: se suman
// si van en la misma divisa. Con dos distintas no sé sumarlos sin otra tasa, y
// me quedo con el primero, como siempre.
function sumarSeleccion(texto, web = null) {
  const precios = buscarPrecios(texto, web);
  if (precios.length < 2 || precios.some((p) => p.divisa !== precios[0].divisa)) return null;
  const cantidades = precios.map((p) => p.cantidad);
  const cantidad = Math.round(cantidades.reduce((a, b) => a + b, 0) * 100) / 100;
  return { cantidades, cantidad, divisa: precios[0].divisa };
}

// Las partes solo si caben; con muchas, cuántas son.
const PARTES_A_LA_VISTA = 5;

function notaDeSuma(cantidades) {
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (cantidades.length > PARTES_A_LA_VISTA) return tr("tarjeta.sumaMuchos", { n: cantidades.length });
  // El "+" pegado a su número, que si la línea se parte no se quede colgando.
  return tr("tarjeta.suma", { n: cantidades.length, partes: cantidades.map((n) => dinero.format(n)).join(" +\u00a0") });
}

// La pantalla de "¿quiere pagar en euros?" (DCC) enseña el precio de allí y lo
// que te cobrarían en tu divisa. Lo que va en tu divisa es el cobro; si ninguno
// lo está, el primero es el precio y el segundo el cobro, que es como lo ponen.
function leerCobro(texto, par) {
  const precios = buscarPrecios(texto);
  const divisas = new Set(precios.map((p) => p.divisa));
  if (precios.length !== 2 || divisas.size !== 2) return null;
  const [a, b] = precios;
  const cobro = a.divisa === par.to || (b.divisa !== par.to && b.divisa === par.from) ? a : b;
  const precio = cobro === a ? b : a;
  return { cantidad: precio.cantidad, from: precio.divisa, cobrado: cobro.cantidad, to: cobro.divisa };
}

// Más de un 25 % arriba o abajo ya no es un cambio de divisa: serán dos precios
// que no tienen que ver ("£10 de envío, $20 el libro").
const COBRO_RARO = 0.25;

function analizarCobro(cobro, real, comision = 0) {
  if (!cobro || !(cobro.cantidad > 0) || !(cobro.cobrado > 0) || !(real > 0)) return null;
  const justo = cobro.cantidad * real;
  const sobrecoste = cobro.cobrado / justo - 1;
  if (Math.abs(sobrecoste) > COBRO_RARO) return null;
  const HOLGURA = 1e-9;
  const veredicto = sobrecoste <= 0 ? "bien" : MARGENES.find((m) => sobrecoste <= m.hasta + HOLGURA).veredicto;
  // Si dices que no, pagas allí con tu tarjeta y su comisión: eso es lo que hay que ganar.
  const conTarjeta = justo * (1 + comision / 100);
  return {
    ...cobro,
    justo,
    sobrecoste,
    extra: cobro.cobrado - justo,
    veredicto,
    comision,
    aceptar: cobro.cobrado <= conTarjeta + 0.005,
  };
}

function textoCobro(r) {
  if (!r) return "";
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pct = tr("pct", { n: numeros({ maximumFractionDigits: Math.abs(r.sobrecoste) < 0.1 ? 1 : 0 }).format(Math.abs(r.sobrecoste) * 100) });
  const datos = { to: r.to, from: r.from, pct, extra: `${dinero.format(r.extra)} ${r.to}`, comision: tr("pct", { n: numeros({ maximumFractionDigits: 2 }).format(r.comision) }) };
  if (r.sobrecoste <= 0) return tr("dcc.mejor", datos);
  if (r.aceptar && r.comision > 0) return tr("dcc.teVale", datos);
  if (r.veredicto === "bien") return tr("dcc.casi", datos);
  return tr("dcc.mejorAlli", datos);
}

// Para la página entera no vale cualquier número como en la selección: aquí
// solo cuenta si lleva la divisa pegada, delante o detrás. Los símbolos largos
// primero, que si no "US$" se quedaba en "$".
const CODIGOS = CURRENCIES.map((c) => c.code).filter((c) => !CODIGOS_QUE_SON_PALABRA.has(c)).join("|");
// En Japón y China el yen va casi siempre a lo ancho: "￥1,299".
const DIVISA_DELANTE = `R\\$|US\\$|MX\\$|CA?\\$|AU?\\$|HK\\$|NZ\\$|S\\$|CN¥|[$€£¥￥₹₩₪฿₱₺]|\\b(?:${CODIGOS})\\b`;
const DIVISA_DETRAS = `[$€£¥￥₹₩₪฿₱₺円元]|zł|Kč|\\b(?:${CODIGOS})\\b|\\b[Ee]uros?\\b`;
// Detrás de una letra o de otra cifra no empieza un precio: "A4 €" no son 4 €.
const PRECIO = new RegExp(
  `(${DIVISA_DELANTE})\\s?(${NUMERO.source})|(?<![\\w.,])(${NUMERO.source})\\s?(${DIVISA_DETRAS})`,
  "g",
);

function buscarPrecios(texto, web = null) {
  if (typeof texto !== "string") return [];
  const precios = [];
  for (const m of texto.matchAll(PRECIO)) {
    const cantidad = leerNumero(m[2] ?? m[3]);
    const divisa = divisaDe(m[1] ?? m[4], web);
    if (cantidad > 0 && divisa) precios.push({ inicio: m.index, fin: m.index + m[0].length, cantidad, divisa });
  }
  return precios;
}

// Hay tiendas que parten el precio en trozos ("$" "49" "." "99"), cada uno en
// su etiqueta. Juntos solo me valen si el texto entero es un precio y nada más.
function precioEntero(texto, web = null) {
  const limpio = String(texto ?? "").trim();
  const precios = buscarPrecios(limpio, web);
  if (precios.length !== 1 || precios[0].inicio !== 0 || precios[0].fin !== limpio.length) return null;
  const { cantidad, divisa } = precios[0];
  return { cantidad, divisa };
}

// En la barra de direcciones nadie escribe en mayúsculas, así que aquí "usd"
// sí vale. Las palabras de enlace ("50 eur a gbp", "to", "en") sobran.
const ENLACES = new Set(["a", "to", "en", "in", "->", "→", "=", "de"]);

function leerOmnibox(texto, par) {
  if (typeof texto !== "string") return null;
  // "3,50 usd/gal": la unidad, fuera antes de trocear, que "usd/gal" no es ninguna
  // divisa. Solo con la barra o el "per": "20 libras" a secas son esterlinas.
  const conBarra = (t) => (/^\s*(\/|per\b|por\b)/i.test(t.match(HAY_UNIDAD)?.[0] ?? "") ? quitarUnidad(t) : { texto: t, unidad: null });
  const fuera = conBarra(texto);
  // El símbolo pegado al número ("20€", "$20") va aparte, que si no la cuenta no se entiende.
  const palabras = fuera.texto.replace(/([€$£¥₹₩₪฿₱₺])/g, " $1 ").trim().split(/\s+/);
  const divisas = [];
  const resto = [];
  for (const palabra of palabras) {
    if (ENLACES.has(palabra.toLowerCase())) continue;
    const code = palabra.toUpperCase();
    const divisa = isValidCode(code) ? code : /[a-z€$£¥₹₩₪฿₱₺]/i.test(palabra) ? divisaDe(palabra) : null;
    if (divisa) divisas.push(divisa);
    else resto.push(palabra);
  }
  if (divisas.length > 2) return null;
  const { unidad } = conBarra(resto.join(" "));
  const cantidad = leerImporte(resto.join(" "));
  if (cantidad === null || cantidad <= 0) return null;
  const [de, a] = divisas;
  const { from, to } = a ? { from: de, to: a } : destinoPara(de ?? null, par);
  if (from === to) return null;
  const leido = { cantidad, from, to };
  if (fuera.unidad ?? unidad) leido.unidad = fuera.unidad ?? unidad;
  return leido;
}

// "cd 20 usd + 15 gbp": lo que llevas en la cartera de varios viajes, todo en
// la tuya (la de abajo) o en la que digas al final ("… a eur"). Cada trozo, con
// su divisa; si a alguno le falta, no sé de qué es y mejor no inventar.
const HAY_DESTINO_MEZCLA = /\s+(?:a|to|en|in|->|→|=)\s+([a-z]{3})\s*$/i;

function leerMezcla(texto, par) {
  if (typeof texto !== "string" || !texto.includes("+")) return null;
  const destino = texto.match(HAY_DESTINO_MEZCLA);
  const to = destino ? destino[1].toUpperCase() : par.to;
  if (!isValidCode(to)) return null;
  const trozos = (destino ? texto.slice(0, destino.index) : texto).split("+");
  if (trozos.length < 2) return null;
  const partes = [];
  for (const trozo of trozos) {
    const palabras = trozo.replace(/([€$£¥₹₩₪฿₱₺])/g, " $1 ").trim().split(/\s+/).filter(Boolean);
    const divisas = palabras.map((p) => (isValidCode(p.toUpperCase()) ? p.toUpperCase() : /[a-z€$£¥₹₩₪฿₱₺]/i.test(p) ? divisaDe(p) : null));
    if (divisas.filter(Boolean).length !== 1) return null;
    const cantidad = leerImporte(palabras.filter((_, i) => !divisas[i]).join(" "));
    if (!(cantidad > 0)) return null;
    partes.push({ cantidad, divisa: divisas.find(Boolean) });
  }
  return { partes, to };
}

// Las tasas, desde la de destino: una sola petición para todas las partes.
function textoMezcla({ partes, to }, rates) {
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const valores = partes.map(({ cantidad, divisa }) => (divisa === to ? cantidad : cantidad / rates?.[divisa]));
  if (!valores.every((v) => Number.isFinite(v))) return null;
  // Cada parte al céntimo antes de sumar, para que lo que se ve cuadre con el total.
  const total = valores.reduce((a, b) => a + Math.round(b * 100), 0) / 100;
  return {
    principal: `${partes.map((p) => `${dinero.format(p.cantidad)} ${p.divisa}`).join(" + ")} = ${dinero.format(total)} ${to}`,
    detalle: `${valores.map((v) => dinero.format(v)).join(" + ")} ${to}`,
  };
}

// "3,50 usd/gal = 0,80 EUR/l": en la gasolinera lo que quieres saber es el
// litro. El galón convertido va detrás, por si el precio de aquí lo tienes así.
function precioUnidadBarra({ cantidad, from, to, unidad }, rate) {
  const metrica = porUnidadMetrica(cantidad * rate, unidad);
  if (!metrica) return null;
  const dinero = (n) => numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const nombre = nombreUnidad(unidad);
  return {
    principal: `${dinero(cantidad)} ${from}/${nombre} = ${dinero(metrica.valor)} ${to}/${metrica.unidad}`,
    detalle: `${dinero(cantidad * rate)} ${to}/${nombre}`,
  };
}

// "+ 20 cena", "+ 1.500 jpy taxi efectivo": un gasto sin abrir el popup. Lo
// del principio que parece cantidad o divisa es la cantidad; lo demás, el concepto.
const PAGO_POR_PALABRA = { efectivo: "efectivo", cash: "efectivo", metalico: "efectivo", tarjeta: "tarjeta", card: "tarjeta" };

// "+ 20 mil taxi": el "mil" va con la cantidad si va justo detrás del número.
const CON_MULTIPLO = new RegExp(`^[\\d.,+\\-*/()%]+(?:${PALABRA_MULTIPLO})?$`, "i");
const SOLO_MULTIPLO = new RegExp(`^(?:${PALABRAS_MULTIPLO})$`, "i");
const esDeCantidad = (palabra, anterior = "") => CON_MULTIPLO.test(palabra) || (/\d$/.test(anterior) && SOLO_MULTIPLO.test(palabra)) || /^[€$£¥₹₩₪฿₱₺]$/.test(palabra)
  || (/^[a-z]{3}$/i.test(palabra) && isValidCode(palabra.toUpperCase()) && (palabra === palabra.toUpperCase() || !CODIGOS_QUE_SON_PALABRA.has(palabra.toUpperCase())));

function leerGastoBarra(texto, par) {
  if (typeof texto !== "string" || !/^\s*\+/.test(texto)) return null;
  const palabras = texto.replace(/^\s*\+/, "").replace(/([€$£¥₹₩₪฿₱₺])/g, " $1 ").trim().split(/\s+/).filter(Boolean);
  let i = 0;
  while (i < palabras.length && (esDeCantidad(palabras[i], palabras[i - 1])
    || (ENLACES.has(palabras[i].toLowerCase()) && i > 0 && esDeCantidad(palabras[i + 1] ?? "") && /[a-z]/i.test(palabras[i + 1])))) i += 1;
  const leido = leerOmnibox(palabras.slice(0, i).join(" "), par);
  if (!leido) return null;
  let pago = null;
  const concepto = palabras.slice(i).filter((p) => {
    const dicho = PAGO_POR_PALABRA[normalizar(p)];
    if (dicho) pago = dicho;
    return !dicho;
  }).join(" ");
  return { ...leido, concepto: limpiarConcepto(concepto), pago };
}

// Lo dictado: "cena cuarenta y cinco", "doce con cincuenta de taxi". Al hablar
// la cantidad va donde caiga, así que la busco y lo paso a "+ 45 cena", que eso
// ya lo sabe leer la barra. Chrome suele dar las cifras ya en número; las
// palabras son por si acaso.
const NUMEROS_DICHOS = {
  cero: 0, uno: 1, un: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9,
  diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18,
  diecinueve: 19, veinte: 20, veintiuno: 21, veintiun: 21, veintiuna: 21, veintidos: 22, veintitres: 23, veinticuatro: 24,
  veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29, treinta: 30, cuarenta: 40,
  cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90, cien: 100, ciento: 100, doscientos: 200,
  doscientas: 200, trescientos: 300, trescientas: 300, cuatrocientos: 400, cuatrocientas: 400, quinientos: 500,
  quinientas: 500, seiscientos: 600, seiscientas: 600, setecientos: 700, setecientas: 700, ochocientos: 800,
  ochocientas: 800, novecientos: 900, novecientas: 900,
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11,
  twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};
// "Un café" no es un gasto de un yen: el "un" solo cuenta delante de mil o millón.
const SOLO_DELANTE = new Set(["un", "una"]);
const ESCALAS_DICHAS = { mil: 1000, thousand: 1000, millon: 1e6, millones: 1e6, million: 1e6, millions: 1e6 };
const CENTENA_DICHA = new Set(["hundred"]);
// Lo que sobra en los bordes del concepto: "de taxi", "la cena", "for dinner".
const RELLENO_DICHO = new Set(["de", "del", "la", "el", "los", "las", "en", "por", "para", "un", "una", "y", "the", "for", "of", "a", "an", "on", "and", "is", "son", "es", "fue", "fueron"]);
const ES_CIFRA = /^\d+(?:[.,]\d+)*$/;

// Junta las palabras de número seguidas en una cifra: "cuarenta y cinco" → 45.
function cifrasDichas(palabras) {
  const salen = [];
  let i = 0;
  while (i < palabras.length) {
    const p = normalizar(palabras[i]);
    const siguiente = normalizar(palabras[i + 1] ?? "");
    const empieza = p in NUMEROS_DICHOS && (!SOLO_DELANTE.has(p) || siguiente in ESCALAS_DICHAS)
      || (p in ESCALAS_DICHAS && p.startsWith("mil") && !/^\d/.test(palabras[i - 1] ?? ""));
    if (!empieza) {
      salen.push(palabras[i]);
      i += 1;
      continue;
    }
    let total = 0;
    let grupo = 0;
    let j = i;
    while (j < palabras.length) {
      const w = normalizar(palabras[j]);
      if (w in NUMEROS_DICHOS) grupo += NUMEROS_DICHOS[w];
      else if (CENTENA_DICHA.has(w)) grupo = (grupo || 1) * 100;
      else if (w in ESCALAS_DICHAS) {
        total += (grupo || 1) * ESCALAS_DICHAS[w];
        grupo = 0;
      } else if ((w === "y" || w === "and") && normalizar(palabras[j + 1] ?? "") in NUMEROS_DICHOS && j > i) {
        // "cuarenta y cinco": la "y" va dentro del número, no es un enlace.
      } else break;
      j += 1;
    }
    salen.push(String(total + grupo));
    i = j;
  }
  return salen;
}

function leerDictado(texto, par) {
  if (typeof texto !== "string" || !texto.trim()) return null;
  let palabras = cifrasDichas(texto.trim().replace(/([€$£¥])/g, " $1 ").split(/\s+/).filter(Boolean));
  // "en efectivo", "con tarjeta": lo saco antes, con su "en", que si no se
  // quedaba colgando en el concepto.
  let pago = "";
  palabras = palabras.filter((p, i) => {
    if (!PAGO_POR_PALABRA[normalizar(p)]) return true;
    pago = p;
    return false;
  });
  palabras = palabras.filter((p, i) => !(/^(en|con|in|by|with|por)$/i.test(p) && i === palabras.length - 1 && pago));
  // "doce con cincuenta" y "doce euros con cincuenta" son 12,50; "cuatro y medio", 4,50.
  for (let i = 0; i < palabras.length; i += 1) {
    if (!ES_CIFRA.test(palabras[i])) continue;
    const salto = ES_CIFRA.test(palabras[i + 2] ?? "") ? 0 : divisaDe(palabras[i + 1] ?? "") ? 1 : 0;
    const enlace = normalizar(palabras[i + 1 + salto] ?? "");
    const despues = palabras[i + 2 + salto] ?? "";
    if ((enlace === "con" || enlace === "point") && /^\d{1,2}$/.test(despues)) {
      palabras.splice(i + 1 + salto, 2);
      palabras[i] = `${palabras[i]},${despues.padStart(2, "0")}`;
    } else if (enlace === "y" && /^medi[oa]$/.test(normalizar(despues))) {
      palabras.splice(i + 1 + salto, 2);
      palabras[i] = `${palabras[i]},50`;
    }
  }
  const donde = palabras.findIndex((p) => ES_CIFRA.test(p));
  if (donde < 0) return null;
  let fin = donde + 1;
  if (normalizar(palabras[fin] ?? "") in ESCALAS_DICHAS || /^[km]$/i.test(palabras[fin] ?? "")) fin += 1;
  // La divisa dicha: "pesos" en Colombia son los colombianos, no los mexicanos.
  // Dos palabras solo si la segunda es de su nombre: "coronas checas" sí, "euros la" no.
  const raiz = (p) => normalizar(p ?? "").replace(/(es|s)$/, "");
  const empiezaDivisa = fin;
  let divisa = null;
  const [una, dos] = [palabras[fin], palabras[fin + 1]];
  const doble = una && dos ? divisaDe(`${una} ${dos}`) : null;
  const suya = una && raiz(una).length >= 3 && !RELLENO_DICHO.has(normalizar(una))
    ? [par?.from, par?.to].find((c) => isValidCode(c) && normalizar(nombreDe(c)).startsWith(raiz(una))) : null;
  if (doble && raiz(dos).length >= 3 && normalizar(nombreDe(doble)).includes(raiz(dos).slice(0, 4))) {
    divisa = doble;
    fin += 2;
  } else if (suya || (una && divisaDe(una))) {
    divisa = suya ?? divisaDe(una);
    fin += 1;
  }
  const antes = palabras.slice(0, donde);
  const despues = palabras.slice(fin);
  const limpiar = (lista) => {
    const l = [...lista];
    while (l.length && RELLENO_DICHO.has(normalizar(l[0]))) l.shift();
    while (l.length && RELLENO_DICHO.has(normalizar(l.at(-1)))) l.pop();
    return l;
  };
  const concepto = [...limpiar(antes), ...limpiar(despues)].join(" ");
  const cantidad = palabras.slice(donde, empiezaDivisa).join(" ");
  const leido = leerGastoBarra(`+ ${cantidad}${divisa ? ` ${divisa}` : ""} ${concepto} ${pago}`, par);
  // Un concepto dicho empieza en mayúscula, como lo escribirías.
  return leido && { ...leido, concepto: leido.concepto.charAt(0).toLocaleUpperCase() + leido.concepto.slice(1) };
}

// Convertir hablando: "cuánto son 30 dólares", "mil yenes en euros", "how much is
// 30 dollars in pounds". Lo de detrás del último "a", "en" o "in" es adónde, si
// es una divisa; lo demás lo lee el dictado de los gastos, y el concepto sobra.
const HACIA_DICHO = /^(?:a|al|en|in|to|into)$/i;

function divisaDicha(palabras, par) {
  const texto = palabras.join(" ");
  const raiz = normalizar(palabras[0] ?? "").replace(/(es|s)$/, "");
  // "pesos" con el peso colombiano puesto son esos, como en el dictado.
  const suya = raiz.length >= 3 ? [par?.from, par?.to].find((c) => isValidCode(c) && normalizar(nombreDe(c)).startsWith(raiz)) : null;
  return suya ?? divisaDe(texto) ?? (isValidCode(texto.toUpperCase()) ? texto.toUpperCase() : null);
}

function leerConversionDicha(texto, par) {
  if (typeof texto !== "string" || !texto.trim()) return null;
  // El punto del final fuera, pero no el de "50.000".
  const palabras = texto.trim().replace(/[¿?¡!]|\.(?!\d)/g, " ").split(/\s+/).filter(Boolean);
  let destino = null;
  let hasta = palabras.length;
  const corte = palabras.findLastIndex((p) => HACIA_DICHO.test(p));
  if (corte > 0 && corte < palabras.length - 1 && palabras.length - corte <= 3) {
    destino = divisaDicha(palabras.slice(corte + 1), par);
    if (destino) hasta = corte;
  }
  const leido = leerDictado(palabras.slice(0, hasta).join(" "), par);
  if (!leido) return null;
  const { cantidad, from } = leido;
  // "30 euros en euros" no tiene nada que convertir: me quedo con lo de siempre.
  const to = destino && destino !== from ? destino : leido.to;
  return { cantidad, from, to, conDestino: Boolean(destino && destino !== from) };
}

// Con la categoría que le diste la última vez a ese concepto; si es nuevo, la que
// sale por el nombre.
function gastoDeBarra(leido, { id, cuando, tasa, comision, pago, usados = [] }) {
  if (!leido || !(tasa > 0)) return null;
  const elegido = leido.pago ?? leerPago(pago);
  const pct = comisionDelPago(elegido, comision);
  const clave = normalizar(leido.concepto);
  const usado = clave ? usados.find((u) => normalizar(u.concepto) === clave) : null;
  return crearGasto({
    id, cuando, from: leido.from, to: leido.to, cantidad: leido.cantidad,
    valor: conComision(leido.cantidad * tasa, pct),
    concepto: usado?.concepto ?? leido.concepto,
    categoria: usado?.categoria ?? adivinarCategoria(leido.concepto) ?? CATEGORIA_POR_DEFECTO,
    pago: elegido,
    comision: pct,
  });
}

// Lo de una web se paga con tarjeta, nunca en efectivo, aunque sea lo que sueles usar.
// Si el precio ya viene en tu divisa (Booking en euros) va como lo del banco: tu
// importe exacto, sin comisión y con lo que vale allí, o se quedaría en yenes.
function gastoDeTarjeta({ cantidad, from, to, concepto }, par, { tasa, comision, ...resto }) {
  if (!(cantidad > 0) || !(tasa > 0) || !isValidCode(from) || !isValidCode(to)) return null;
  const pago = "tarjeta";
  if (from !== par.to || to !== par.from) {
    return gastoDeBarra({ cantidad, from, to, concepto: limpiarConcepto(concepto), pago }, { ...resto, tasa, comision });
  }
  const deAlli = Math.round(cantidad * tasa * 100) / 100;
  return gastoDeBarra({ cantidad: deAlli, from: to, to: from, concepto: limpiarConcepto(concepto), pago }, { ...resto, tasa: cantidad / deAlli, comision: 0 });
}

// Lo que pinta Chrome en la sugerencia es XML: un "&" suelto la deja en blanco.
function escaparXml(texto) {
  return String(texto).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Si lo que he leído ya está en el lado de destino, le doy la vuelta al par: nadie
// quiere pasar dólares a dólares.
const EUROZONA = [
  "AT", "BE", "BG", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE", "IT",
  "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK", "AD", "MC", "SM", "VA", "ME", "XK",
];

// Solo países con divisa del BCE. Los que no (Argentina, Colombia…) no están
// a propósito: mejor el par de siempre que uno que no te sirve.
const DIVISA_DE_REGION = {
  ...Object.fromEntries(EUROZONA.map((r) => [r, "EUR"])),
  US: "USD", PR: "USD", EC: "USD", SV: "USD", PA: "USD",
  GB: "GBP", JP: "JPY", CH: "CHF", LI: "CHF", CA: "CAD", AU: "AUD", CN: "CNY",
  MX: "MXN", BR: "BRL", SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN", TR: "TRY",
  CZ: "CZK", HK: "HKD", HU: "HUF", ID: "IDR", IL: "ILS", IN: "INR", IS: "ISK",
  KR: "KRW", MY: "MYR", NZ: "NZD", PH: "PHP", RO: "RON", SG: "SGD", TH: "THB", ZA: "ZAR",
};

// Cuando el idioma viene sin país. Solo las lenguas que no dejan duda: "es" o
// "en" pueden ser de medio mundo, y "pt" igual es Brasil que Portugal.
const DIVISA_DE_LENGUA = {
  ja: "JPY", ko: "KRW", th: "THB", pl: "PLN", cs: "CZK", hu: "HUF", sv: "SEK",
  da: "DKK", nb: "NOK", nn: "NOK", no: "NOK", is: "ISK", tr: "TRY", ro: "RON",
  id: "IDR", he: "ILS", hi: "INR",
};

// Desde estas se cambia sobre todo a euros; desde el resto, a dólares.
const CERCA_DEL_EURO = ["GBP", "CHF", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "RON", "ISK", "TRY"];

// "zh-Hant-HK" trae el país al final, por eso busco la parte de dos letras en
// vez de coger siempre la segunda.
function divisaDeIdioma(etiqueta) {
  if (typeof etiqueta !== "string" || !etiqueta) return null;
  const [lengua, ...resto] = etiqueta.split(/[-_]/);
  const region = resto.find((p) => /^[a-z]{2}$/i.test(p))?.toUpperCase();
  if (region) return DIVISA_DE_REGION[region] ?? null;
  return DIVISA_DE_LENGUA[lengua.toLowerCase()] ?? null;
}

function parPorIdioma(idiomas) {
  for (const etiqueta of Array.isArray(idiomas) ? idiomas : []) {
    const from = divisaDeIdioma(etiqueta);
    if (!from || !isValidCode(from)) continue;
    // Desde la eurozona sale el par de siempre: no cuenta como adivinado, que
    // si no el aviso de "puesta por tu idioma" salía para no cambiar nada.
    if (from === "EUR") break;
    const to = from === "EUR" ? "USD" : from === "USD" || CERCA_DEL_EURO.includes(from) ? "EUR" : "USD";
    return { from, to, idioma: etiqueta };
  }
  return { from: "EUR", to: "USD", idioma: null };
}

// La bandera sale de juntar las dos letras del país en "indicadores regionales".
// En Windows no hay dibujo y se ven las letras, que tampoco queda mal.
function banderaDe(etiqueta) {
  const region = typeof etiqueta === "string"
    ? etiqueta.split(/[-_]/).slice(1).find((p) => /^[a-z]{2}$/i.test(p))?.toUpperCase()
    : null;
  if (!region) return "";
  return String.fromCodePoint(...[...region].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

// Las dos primeras letras del código ISO son el país, y la del euro es "EU",
// que también tiene bandera. Así no hace falta una tabla.
function banderaDivisa(code) {
  return isValidCode(code) ? banderaDe(`x-${code.slice(0, 2)}`) : "";
}
