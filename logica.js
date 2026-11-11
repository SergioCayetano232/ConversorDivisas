// La lógica que no toca la pantalla, separada para poder probarla con node.
// popup.js la carga antes que a sí mismo; en los tests se importa tal cual.

// En el navegador textos.js ya va cargado delante; en Node hay que pedirlo.
if (typeof module !== "undefined" && typeof tr === "undefined") {
  Object.assign(globalThis, require("./textos.js"));
}

const DIVISAS_BCE = [
  { code: "EUR", name: "Euro", en: "Euro" },
  { code: "USD", name: "Dólar estadounidense", en: "US dollar" },
  { code: "GBP", name: "Libra esterlina", en: "British pound" },
  { code: "JPY", name: "Yen japonés", en: "Japanese yen" },
  { code: "CHF", name: "Franco suizo", en: "Swiss franc" },
  { code: "CAD", name: "Dólar canadiense", en: "Canadian dollar" },
  { code: "AUD", name: "Dólar australiano", en: "Australian dollar" },
  { code: "CNY", name: "Yuan chino", en: "Chinese yuan" },
  { code: "MXN", name: "Peso mexicano", en: "Mexican peso" },
  { code: "BRL", name: "Real brasileño", en: "Brazilian real" },
  { code: "SEK", name: "Corona sueca", en: "Swedish krona" },
  { code: "NOK", name: "Corona noruega", en: "Norwegian krone" },
  { code: "DKK", name: "Corona danesa", en: "Danish krone" },
  { code: "PLN", name: "Esloti polaco", en: "Polish zloty" },
  { code: "TRY", name: "Lira turca", en: "Turkish lira" },
  // Las que se usan menos van detrás, para que el desplegable empiece por las
  // de siempre. Son todas las que publica el BCE; el lev búlgaro ya no está
  // desde que Bulgaria entró en el euro.
  { code: "CZK", name: "Corona checa", en: "Czech koruna" },
  { code: "HKD", name: "Dólar de Hong Kong", en: "Hong Kong dollar" },
  { code: "HUF", name: "Forinto húngaro", en: "Hungarian forint" },
  { code: "IDR", name: "Rupia indonesia", en: "Indonesian rupiah" },
  { code: "ILS", name: "Séquel israelí", en: "Israeli shekel" },
  { code: "INR", name: "Rupia india", en: "Indian rupee" },
  { code: "ISK", name: "Corona islandesa", en: "Icelandic krona" },
  { code: "KRW", name: "Won surcoreano", en: "South Korean won" },
  { code: "MYR", name: "Ringgit malayo", en: "Malaysian ringgit" },
  { code: "NZD", name: "Dólar neozelandés", en: "New Zealand dollar" },
  { code: "PHP", name: "Peso filipino", en: "Philippine peso" },
  { code: "RON", name: "Leu rumano", en: "Romanian leu" },
  { code: "SGD", name: "Dólar de Singapur", en: "Singapore dollar" },
  { code: "THB", name: "Baht tailandés", en: "Thai baht" },
  { code: "ZAR", name: "Rand sudafricano", en: "South African rand" },
];

// Las que no publica el BCE. Van con la v2 de Frankfurter, que las saca de otros
// bancos centrales. Cuba no está: su tasa oficial no se parece a la de la calle.
const DIVISAS_MERCADO = [
  { code: "VND", name: "Dong vietnamita", en: "Vietnamese dong" },
  { code: "ARS", name: "Peso argentino", en: "Argentine peso" },
  { code: "MAD", name: "Dírham marroquí", en: "Moroccan dirham" },
  { code: "PEN", name: "Sol peruano", en: "Peruvian sol" },
  { code: "COP", name: "Peso colombiano", en: "Colombian peso" },
  { code: "CLP", name: "Peso chileno", en: "Chilean peso" },
  { code: "EGP", name: "Libra egipcia", en: "Egyptian pound" },
  { code: "AED", name: "Dírham de los Emiratos", en: "UAE dirham" },
  { code: "TWD", name: "Dólar taiwanés", en: "New Taiwan dollar" },
  { code: "UYU", name: "Peso uruguayo", en: "Uruguayan peso" },
  { code: "CRC", name: "Colón costarricense", en: "Costa Rican colón" },
  { code: "DOP", name: "Peso dominicano", en: "Dominican peso" },
  { code: "TND", name: "Dinar tunecino", en: "Tunisian dinar" },
  { code: "KES", name: "Chelín keniano", en: "Kenyan shilling" },
  { code: "LKR", name: "Rupia de Sri Lanka", en: "Sri Lankan rupee" },
  { code: "NPR", name: "Rupia nepalí", en: "Nepalese rupee" },
  { code: "KHR", name: "Riel camboyano", en: "Cambodian riel" },
  { code: "JOD", name: "Dinar jordano", en: "Jordanian dinar" },
  { code: "QAR", name: "Riyal catarí", en: "Qatari riyal" },
  { code: "SAR", name: "Riyal saudí", en: "Saudi riyal" },
  { code: "GEL", name: "Lari georgiano", en: "Georgian lari" },
  { code: "RSD", name: "Dinar serbio", en: "Serbian dinar" },
  { code: "BOB", name: "Boliviano", en: "Bolivian boliviano" },
  { code: "GTQ", name: "Quetzal guatemalteco", en: "Guatemalan quetzal" },
  { code: "PYG", name: "Guaraní paraguayo", en: "Paraguayan guaraní" },
];

const CURRENCIES = [...DIVISAS_BCE, ...DIVISAS_MERCADO];

// Además de códigos son palabras: "SHOWER GEL 250" no son laris.
const CODIGOS_QUE_SON_PALABRA = new Set(["PEN", "MAD", "COP", "GEL", "BOB"]);

const esDeMercado = (code) => DIVISAS_MERCADO.some((c) => c.code === code);
const parDeMercado = (from, to) => esDeMercado(from) || esDeMercado(to);

// Las 30 del BCE siguen por la v1 aunque la v2 también las tenga: da otra cifra
// (1,1185 en vez de 1,1193) y las cuentas de antes no cuadrarían.
const API_V1 = "https://api.frankfurter.dev/v1";
const API_V2 = "https://api.frankfurter.dev/v2";

const urlTasa = (from, to) => (parDeMercado(from, to)
  ? `${API_V2}/rates?base=${from}&quotes=${to}`
  : `${API_V1}/latest?base=${from}&symbols=${to}`);

const urlTasaDia = (from, to, dia) => (parDeMercado(from, to)
  ? `${API_V2}/rates?date=${dia}&base=${from}&quotes=${to}`
  : `${API_V1}/${dia}?base=${from}&symbols=${to}`);

const urlSerie = (from, to, desde, hasta = "") => (parDeMercado(from, to)
  ? `${API_V2}/rates?from=${desde}${hasta ? `&to=${hasta}` : ""}&base=${from}&quotes=${to}`
  : `${API_V1}/${desde}..${hasta}?base=${from}&symbols=${to}`);

// Primero la que manda; la segunda, si la hay, solo añade las de mercado.
function urlsTodas(from, desde = null) {
  const v2 = (lista) => `${API_V2}/rates?${desde ? `from=${desde}&` : ""}base=${from}&quotes=${lista.map((c) => c.code).filter((c) => c !== from).join(",")}`;
  if (esDeMercado(from)) return [v2(CURRENCIES)];
  return [desde ? `${API_V1}/${desde}..?base=${from}` : `${API_V1}/latest?base=${from}`, v2(DIVISAS_MERCADO)];
}

// La v2 da una lista de filas y la v1 un objeto. Lo dejo todo como la v1, que es
// lo que espera el resto. Cada divisa puede venir de un día distinto: me quedo el último.
function aFormatoV1(datos, serie = false) {
  if (!Array.isArray(datos)) return datos;
  if (serie) {
    const rates = {};
    for (const { date, quote, rate } of datos) (rates[date] ??= {})[quote] = rate;
    return { rates };
  }
  return {
    date: datos.map((f) => f.date).sort().at(-1),
    rates: Object.fromEntries(datos.map((f) => [f.quote, f.rate])),
  };
}

function juntarTasas(principal, extra, serie = false) {
  const a = principal?.rates ?? {};
  const b = extra?.rates ?? {};
  if (!serie) return { ...a, ...b };
  return Object.fromEntries([...new Set([...Object.keys(a), ...Object.keys(b)])].map((dia) => [dia, { ...a[dia], ...b[dia] }]));
}

// Si la v2 falla, las 30 de siempre siguen saliendo.
async function pedirTodas(from, desde, signal) {
  const pedir = async (url) => {
    const respuesta = await fetch(url, { signal });
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    return aFormatoV1(await respuesta.json(), Boolean(desde));
  };
  const [principal, extra] = await Promise.allSettled(urlsTodas(from, desde).map(pedir));
  if (principal.status === "rejected") throw principal.reason;
  if (!principal.value?.rates || typeof principal.value.rates !== "object") throw new Error("Respuesta inesperada");
  return juntarTasas(principal.value, extra?.status === "fulfilled" ? extra.value : null, Boolean(desde));
}

const isValidCode = (code) => CURRENCIES.some((c) => c.code === code);

const nombreDe = (code) => {
  const divisa = CURRENCIES.find((c) => c.code === code);
  if (!divisa) return code;
  return idiomaActual() === "en" ? divisa.en : divisa.name;
};

// En inglés el decimal es el punto, pero mucha gente en Europa tiene el Chrome
// en inglés y escribe "12,50". Así que una coma sola es decimal, salvo que
// lleve tres cifras justas detrás ("1,000"), que entonces son miles.
function importeEnIngles(limpio) {
  const comas = (limpio.match(/,/g) || []).length;
  const puntos = (limpio.match(/\./g) || []).length;
  let normal;
  if (comas && puntos) {
    const decimal = limpio.lastIndexOf(".") > limpio.lastIndexOf(",") ? "." : ",";
    const miles = decimal === "." ? "," : ".";
    normal = limpio.split(miles).join("").replace(",", ".");
  } else if (comas === 1 && !/,\d{3}$/.test(limpio)) {
    normal = limpio.replace(",", ".");
  } else if (puntos > 1) {
    normal = limpio.replace(/\./g, "");
  } else {
    normal = limpio.replace(/,/g, "");
  }
  return normal;
}

function parseAmount(raw) {
  if (idiomaActual() === "en") {
    const limpio = raw.trim().replace(/[\s\u00A0]/g, "");
    if (limpio === "") return null;
    const value = Number(importeEnIngles(limpio));
    return Number.isFinite(value) && value >= 0 ? value : null;
  }
  // Ahora que el resultado se puede editar me llega ya formateado ("1.084,70"),
  // así que el punto de los miles hay que quitarlo antes de nada: sin esto,
  // "1.000" se leía como un 1.
  const cleaned = raw
    .trim()
    .replace(/\s/g, "")
    .replace(/\u00A0/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  if (cleaned === "") return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

// Acepto los signos que salen en un teclado de móvil o copiando de otro sitio,
// y la x como "por", que es como lo escribe todo el mundo.
const OPERADORES = { "+": "+", "-": "-", "−": "-", "*": "*", "×": "*", x: "*", X: "*", "/": "/", "÷": "/", ":": "/" };
const HAY_OPERACION = /[-+−*×xX/÷:()%]/;

// "2k" y "1,5m", como se escriben los precios de pisos y coches. La letra va
// pegada al número y sola: "2 km" no es nada. Y con la palabra, "20 mil" o
// "1,5 millones", que es como lo dice la gente. "miles" no, que son millas.
const MULTIPLOS = { k: 1e3, m: 1e6 };
const PALABRAS_MULTIPLO = "mill[oó]n(?:es)?|millions?|mil|thousands?";
const PALABRA_MULTIPLO = `${PALABRAS_MULTIPLO}|[km]`;
const HAY_MULTIPLO = new RegExp(`\\d\\s*(?:${PALABRA_MULTIPLO})(?![a-zñáéíóú])`, "i");
const LEER_MULTIPLO = new RegExp(`^\\s*(${PALABRA_MULTIPLO})(?![a-zñáéíóú])`, "i");
const multiplo = (palabra) => (/^(k|mil$|thousand)/i.test(palabra) ? MULTIPLOS.k : MULTIPLOS.m);

function trocear(texto) {
  const fichas = [];
  let i = 0;
  while (i < texto.length) {
    const c = texto[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    // Un número puede llevar espacios de miles ("1 000"); los números se
    // leen con parseAmount, así que "1.000,50" vale igual aquí que suelto.
    const num = texto.slice(i).match(/^\d[\d.,]*(?:[  ]\d[\d.,]*)*/);
    if (num) {
      const v = parseAmount(num[0]);
      if (v === null) return null;
      i += num[0].length;
      const letra = texto.slice(i).match(LEER_MULTIPLO);
      if (letra) i += letra[0].length;
      fichas.push({ tipo: "num", v: letra ? v * multiplo(letra[1]) : v });
    } else if (OPERADORES[c]) {
      fichas.push({ tipo: "op", v: OPERADORES[c] });
      i++;
    } else if (c === "(" || c === ")" || c === "%") {
      fichas.push({ tipo: c });
      i++;
    } else {
      return null;
    }
  }
  return fichas;
}

// Suma, resta, multiplicación, división, paréntesis y porcentajes, con la
// prioridad de siempre. Sin eval: lo que pegues en el campo no se ejecuta.
function evaluar(texto) {
  if (typeof texto !== "string") return null;
  if (!esOperacion(texto)) return parseAmount(texto);

  const fichas = trocear(texto);
  if (!fichas || fichas.length === 0) return null;
  let pos = 0;
  const es = (tipo, cuales) =>
    fichas[pos]?.tipo === tipo && (cuales === undefined || cuales.includes(fichas[pos].v));
  // Un porcentaje suelto vale su centésima; sumado o restado va sobre lo de antes.
  const valorDe = (t) => (t.pct ? t.v / 100 : t.v);

  function primario() {
    if (es("num")) return fichas[pos++].v;
    if (!es("(")) return null;
    pos++;
    const dentro = suma();
    if (!dentro || !es(")")) return null;
    pos++;
    return valorDe(dentro);
  }

  function factor() {
    if (es("op", "+-")) {
      const signo = fichas[pos++].v;
      const f = factor();
      return f && { v: signo === "-" ? -f.v : f.v, pct: f.pct };
    }
    const v = primario();
    if (v === null) return null;
    if (es("%")) {
      pos++;
      return { v, pct: true };
    }
    return { v, pct: false };
  }

  function producto() {
    let izq = factor();
    while (izq && es("op", "*/")) {
      const op = fichas[pos++].v;
      const der = factor();
      if (!der) return null;
      const a = valorDe(izq);
      const b = valorDe(der);
      izq = { v: op === "*" ? a * b : a / b, pct: false };
    }
    return izq;
  }

  function suma() {
    let izq = producto();
    while (izq && es("op", "+-")) {
      const op = fichas[pos++].v;
      const der = producto();
      if (!der) return null;
      const base = valorDe(izq);
      // "100 + 10 %" es 110, como en cualquier calculadora de bolsillo.
      const d = der.pct ? (base * der.v) / 100 : der.v;
      izq = { v: op === "+" ? base + d : base - d, pct: false };
    }
    return izq;
  }

  const r = suma();
  if (!r || pos !== fichas.length) return null;
  const valor = valorDe(r);
  return Number.isFinite(valor) && valor >= 0 ? valor : null;
}

// Mientras escribes "20+" la operación está a medias: cuento hasta el último
// número y cierro los paréntesis que falten, para que el resultado no salte a
// un guion con cada signo que tecleas.
function completar(texto) {
  const t = String(texto).replace(/[\s+\-−*×xX/÷:(]+$/, "");
  const abiertos = (t.match(/\(/g) || []).length - (t.match(/\)/g) || []).length;
  return abiertos > 0 ? t + ")".repeat(abiertos) : t;
}

function leerImporte(texto) {
  return evaluar(completar(quitarUnidad(texto).texto));
}

// En Estados Unidos los precios van por libra, onza o galón, y así no hay quien
// compare. "3,99/lb" vale 3,99 para todo; la unidad solo sirve para el precio
// por kilo o por litro.
const UNIDADES = {
  lb: { a: "kg", factor: 2.20462262 },
  oz: { a: "kg", factor: 35.2739619 },
  floz: { a: "l", factor: 33.8140227 },
  gal: { a: "l", factor: 1 / 3.78541178 },
  galuk: { a: "l", factor: 1 / 4.54609 },
};

const nombreUnidad = (unidad) => ({ floz: "fl oz", galuk: "gal UK" })[unidad] ?? unidad;

// El "fl oz" antes que el "oz", que si no se quedaría con la mitad. El galón
// inglés, con su "uk" detrás, como en la barra.
const HAY_UNIDAD = /\s*(?:\/|\bper\b|\bpor\b)?\s*(fl\.?\s*oz|lbs?|pounds?|libras?|oz|ounces?|onzas?|gal(?:lons?|ones|[oó]n)?(?:\s*\(?\s*(?:uk|imp(?:erial)?)\s*\)?)?)\.?\s*$/i;

function quitarUnidad(texto) {
  const t = String(texto ?? "");
  const m = t.match(HAY_UNIDAD);
  if (!m || m.index === 0) return { texto: t, unidad: null };
  const u = m[1].toLowerCase().replace(/[\s.]/g, "");
  const unidad = u.startsWith("fl") ? "floz" : /^(lb|pound|libra)/.test(u) ? "lb"
    : u.startsWith("gal") ? (/(uk|imp)/.test(u) ? "galuk" : "gal") : "oz";
  return { texto: t.slice(0, m.index), unidad };
}

function porUnidadMetrica(valor, unidad) {
  const u = UNIDADES[unidad];
  if (!u || !Number.isFinite(valor)) return null;
  return { valor: valor * u.factor, unidad: u.a };
}

function esOperacion(texto) {
  const t = String(texto).trim();
  return HAY_OPERACION.test(t) || HAY_MULTIPLO.test(t);
}

// Con las flechas en la cantidad: de uno en uno, o de diez con Shift. Los
// céntimos se quedan ("12,50" sube a "13,50") y de cero no baja.
function pasoCantidad(valor, sentido, grande = false) {
  const base = Number.isFinite(valor) ? valor : 0;
  const nuevo = Math.round((base + sentido * (grande ? 10 : 1)) * 100) / 100;
  return Math.max(nuevo, 0);
}

// Con Alt, de diez en diez veces: de 50 a 500, para pasar de un café a una
// cena sin teclear. Desde cero, multiplicar no haría nada, así que empieza en 10.
function pasoPorDiez(valor, sentido) {
  const base = Number.isFinite(valor) && valor > 0 ? valor : 0;
  if (base === 0) return sentido > 0 ? 10 : 0;
  return Math.round((sentido > 0 ? base * 10 : base / 10) * 100) / 100;
}

// La rueda del ratón da unos 100 por muesca, pero el trackpad manda montones de
// 2 o 3: los voy juntando y cada 100 es un paso. Hacia arriba sube. Si cambias
// de sentido, lo que llevabas hacia el otro lado no cuenta.
const RUEDA_PASO = 100;
function pasosRueda(acumulado, delta) {
  const total = Math.sign(acumulado) === -Math.sign(delta) ? delta : acumulado + delta;
  const pasos = Math.trunc(total / RUEDA_PASO);
  return { pasos: -pasos, resto: total - pasos * RUEDA_PASO };
}

// Con 100 yenes salen 0,57 EUR y el redondeo se come media cifra. Seis cifras
// de verdad bastan; si con dos decimales ya está, no hay nada que enseñar.
function cifraCompleta(valor) {
  if (!Number.isFinite(valor) || valor === 0) return null;
  const enteras = Math.max(Math.floor(Math.log10(Math.abs(valor))) + 1, 0);
  const completa = Number(valor.toPrecision(Math.max(6, enteras + 2)));
  if (completa === Math.round(valor * 100) / 100) return null;
  const decimales = Math.min(Math.max(String(completa).split(".")[1]?.length ?? 0, 2), 10);
  return { valor: completa, decimales };
}

// La cantidad que dejaste puesta, para encontrarla al volver. Redondeada al
// céntimo: escribiendo abajo sale de dividir por la tasa y trae mil decimales.
function leerCantidad(guardado) {
  if (!Number.isFinite(guardado) || guardado < 0) return null;
  return Math.round(guardado * 100) / 100;
}

// Fecha local en formato ISO. No uso toISOString() porque pasa a UTC y aquí,
// a partir de las dos de la tarde en verano, ya me daba el día siguiente.
function isoLocal(date) {
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mes}-${dia}`;
}

function hoy() {
  return isoLocal(new Date());
}

// El BCE saca las tasas una vez al día laborable, sobre las cuatro de la tarde.
// Guardo el día en que pedí los datos y los doy por buenos mientras siga siendo
// el mismo día: un TTL de horas me haría pedir de madrugada para nada.
function isFresh(entry) {
  return Boolean(entry) && entry.day === hoy();
}

// Sin tildes y en minúscula, para que "dolar" encuentre "Dólar" y "peso
// mexicano" no dependa de cómo lo escribas.
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function filtrarDivisas(consulta) {
  const q = normalizar(consulta.trim());
  if (q === "") return CURRENCIES;

  // El código primero: si escribes "usd" quieres el dólar arriba del todo, no
  // el peso uruguayo porque su nombre lleva una u.
  const porCodigo = [];
  const porNombre = [];

  for (const divisa of CURRENCIES) {
    // Busco en los dos idiomas: "dollar" y "dólar" encuentran lo mismo.
    if (normalizar(divisa.code).startsWith(q)) porCodigo.push(divisa);
    else if ([divisa.name, divisa.en].some((n) => normalizar(n).includes(q))) porNombre.push(divisa);
  }

  return [...porCodigo, ...porNombre];
}

// Dejo un margen a los lados y arriba: el trazo se pinta centrado sobre la
// línea, así que pegado al borde se le come la mitad.
const PAD_X = 1.5;
const PAD_Y = 3;

// La altura en el viewBox de 100x28 para un valor cualquiera de la serie. Va
// aparte porque la línea de la media también la necesita.
function alturaEn(values) {
  const min = Math.min(...values);
  const span = Math.max(...values) - min;
  const bottom = 28 - PAD_Y;
  const height = bottom - PAD_Y;
  // Si la tasa no se ha movido, span es 0: dibujamos una línea centrada.
  return (value) => (span === 0 ? 14 : bottom - ((value - min) / span) * height);
}

// Dónde cae cada valor en el viewBox de 100x28 del gráfico.
function coordenadas(values) {
  const stepX = (100 - PAD_X * 2) / (values.length - 1);
  const y = alturaEn(values);
  return values.map((value, index) => ({ x: PAD_X + index * stepX, y: y(value) }));
}

// La línea y el área sombreada que queda por debajo.
function buildPaths(values) {
  const points = coordenadas(values).map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`);

  const line = `M${points.join("L")}`;
  const area = `${line}L${(100 - PAD_X).toFixed(2)},28L${PAD_X.toFixed(2)},28Z`;
  return { line, area };
}

// Lo que mide la línea ya estirada en pantalla. Con non-scaling-stroke el guion
// de la animación va en píxeles, y getTotalLength da unidades del viewBox: se
// quedaba en 104 para una línea de 266 px y dejaba un hueco en medio.
function largoEnPantalla(puntos, ancho, alto) {
  const sx = ancho / 100;
  const sy = alto / 28;
  let total = 0;
  for (let i = 1; i < puntos.length; i++) {
    total += Math.hypot((puntos[i].x - puntos[i - 1].x) * sx, (puntos[i].y - puntos[i - 1].y) * sy);
  }
  return total;
}

// Lo contrario de coordenadas: de una x del viewBox al punto más cercano.
function indiceCercano(x, total) {
  if (total < 2) return 0;
  const paso = (100 - PAD_X * 2) / (total - 1);
  const i = Math.round((x - PAD_X) / paso);
  return Math.min(Math.max(i, 0), total - 1);
}

// Si se repite el máximo me quedo con el primero; da igual cuál, pero que sea
// siempre el mismo para que la marca no salte al recargar.
function extremos(values) {
  let max = 0;
  let min = 0;
  values.forEach((v, i) => {
    if (v > values[max]) max = i;
    if (v < values[min]) min = i;
  });
  return { max, min };
}

// Mejor que tres de cada cuatro días del periodo es buen momento; peor que
// tres de cada cuatro, malo. Lo del medio no merece ni verde ni rojo.
const MOMENTO_UMBRAL = 0.75;

// Los empates cuentan medio: si no, con la tasa plana todo salía "mal momento".
function momento(values) {
  if (!Array.isArray(values) || values.length < 3) return null;
  const hoyV = values[values.length - 1];
  const antes = values.slice(0, -1);
  const media = values.reduce((suma, v) => suma + v, 0) / values.length;
  const peores = antes.reduce((n, v) => n + (v < hoyV ? 1 : v === hoyV ? 0.5 : 0), 0);
  const posicion = peores / antes.length;
  const veredicto = posicion >= MOMENTO_UMBRAL ? "bueno" : posicion <= 1 - MOMENTO_UMBRAL ? "malo" : "normal";
  return { media, diferencia: media ? (hoyV - media) / media : 0, posicion, veredicto };
}

// Qué día de la semana suele salir mejor. Cada día se compara con la media de
// su semana: si no, en un año que el dólar sube, ganaría el viernes por llegar
// el último. Con un mes salía un 0,7 % que era pura casualidad: dos meses mínimo.
const SEMANAS_MINIMAS = 8;
// Por debajo de un 0,05 % entre el mejor y el peor, da igual el día.
const DIA_IGUAL = 0.0005;

function mejorDiaSemana(serie) {
  if (!Array.isArray(serie)) return null;
  const semanas = new Map();
  for (const { fecha, valor } of serie) {
    if (!esIso(fecha) || !(valor > 0)) continue;
    const [a, m, d] = fecha.split("-").map(Number);
    const dia = new Date(a, m - 1, d).getDay();
    if (dia === 0 || dia === 6) continue;
    const lunes = isoLocal(new Date(a, m - 1, d - dia + 1));
    if (!semanas.has(lunes)) semanas.set(lunes, []);
    semanas.get(lunes).push({ dia, valor });
  }
  const llenas = [...semanas.values()].filter((s) => s.length >= 3);
  if (llenas.length < SEMANAS_MINIMAS) return null;
  const suma = [0, 0, 0, 0, 0, 0];
  const veces = [0, 0, 0, 0, 0, 0];
  for (const semana of llenas) {
    const media = semana.reduce((t, p) => t + p.valor, 0) / semana.length;
    for (const { dia, valor } of semana) {
      suma[dia] += (valor - media) / media;
      veces[dia] += 1;
    }
  }
  const porDia = [1, 2, 3, 4, 5].filter((d) => veces[d] > 0).map((dia) => ({ dia, media: suma[dia] / veces[dia] }));
  const mejor = porDia.reduce((a, b) => (b.media > a.media ? b : a));
  const peor = porDia.reduce((a, b) => (b.media < a.media ? b : a));
  const ventaja = mejor.media - peor.media;
  return { mejor: mejor.dia, peor: peor.dia, ventaja, igual: ventaja < DIA_IGUAL, semanas: llenas.length, porDia };
}

// Lunes es el 1, como getDay(). El 5 de enero de 2026 fue lunes.
const nombreDiaSemana = (dia) => fechas({ weekday: "long" }).format(new Date(2026, 0, 4 + dia));

function textoDiaSemana(r) {
  if (r.igual) return tr("semana.igual", { semanas: r.semanas });
  const pct = porCiento(numeros({ maximumFractionDigits: 2 }).format(r.ventaja * 100));
  return tr("semana.mejor", { dia: nombreDiaSemana(r.mejor), peor: nombreDiaSemana(r.peor), pct });
}

const porCiento = (n) => tr("pct", { n });

function textoMomento(m, dias, from, to) {
  const pct = Math.abs(m.diferencia * 100);
  const cuanto = porCiento(numeros({ maximumFractionDigits: 1 }).format(pct));
  const detalle = pct < 0.05
    ? tr("momento.enLaMedia")
    : tr(m.diferencia > 0 ? "momento.sobre" : "momento.bajo", { pct: cuanto });
  const periodo = dias === 365 ? tr("momento.anio") : tr("momento.dias", { dias });
  const explicacion = tr("momento.explicacion", { pct: porCiento(Math.round(m.posicion * 100)), periodo, from, to });
  return { titulo: tr(`momento.${m.veredicto}`), detalle, explicacion };
}


// new Date("2026-09-29") lo lee como medianoche en UTC, y en América eso
// todavía es el día 28. Montándola a mano sale el día que pone.
// Con el gráfico de un año, "3 oct" puede ser de este o del pasado: el año solo
// cuando no es el de ahora, que si no sobra.
function fechaCorta(iso, anoActual = new Date().getFullYear()) {
  const [a, m, d] = iso.split("-").map(Number);
  const opciones = a === anoActual
    ? { day: "numeric", month: "short" }
    : { day: "numeric", month: "short", year: "numeric" };
  return fechas(opciones).format(new Date(a, m - 1, d)).replace(".", "");
}

// En días, que es lo que pide la API. El año son 365 y no "un año atrás
// exacto": los bisiestos dan igual para un gráfico.
const RANGOS = [7, 30, 90, 365];
const RANGO_POR_DEFECTO = 30;

function leerRango(guardado) {
  return RANGOS.includes(guardado) ? guardado : RANGO_POR_DEFECTO;
}

// Del año vuelve a la semana, como un dial.
function siguienteRango(dias) {
  return RANGOS[(RANGOS.indexOf(leerRango(dias)) + 1) % RANGOS.length];
}

// El primer día que publicó el BCE; antes la API contesta "not found".
const FECHA_MINIMA = "1999-01-04";

function fechaLarga(iso) {
  const [a, m, d] = iso.split("-").map(Number);
  return fechas({ weekday: "short", day: "numeric", month: "short", year: "numeric" })
    .format(new Date(a, m - 1, d))
    .replace(".", "");
}

// Domingo de Pascua, con el algoritmo de siempre (el de Meeus). Hace falta
// por el Viernes Santo y el Lunes de Pascua, que el BCE no publica.
function domingoDePascua(ano) {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - Math.floor(b / 4) - g + 15) % 30;
  const l = (32 + 2 * (b % 4) + 2 * Math.floor(c / 4) - h - (c % 4)) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia);
}

// Los días que el BCE publica tasas: laborables menos los festivos de TARGET.
function hayTasaEl(fecha) {
  const semana = fecha.getDay();
  if (semana === 0 || semana === 6) return false;
  const md = `${fecha.getMonth() + 1}-${fecha.getDate()}`;
  if (["1-1", "5-1", "12-25", "12-26"].includes(md)) return false;
  const pascua = domingoDePascua(fecha.getFullYear()).getTime();
  const dia = 86400000;
  const t = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()).getTime();
  // Con Math.round por el cambio de hora, que cae justo por esas fechas.
  const desdePascua = Math.round((t - pascua) / dia);
  return desdePascua !== -2 && desdePascua !== 1;
}

// Cuántos días con tasa ha habido entre la que tengo y hoy, sin contar hoy:
// la de hoy sale por la tarde y por la mañana es normal no tenerla. Con
// alguno ya me he perdido una publicación.
function tasaVieja(fecha, hoyIso = hoy()) {
  if (!esIso(fecha) || fecha >= hoyIso) return null;
  const [a, m, d] = fecha.split("-").map(Number);
  let dias = 0;
  for (let dia = new Date(a, m - 1, d + 1); isoLocal(dia) < hoyIso; dia.setDate(dia.getDate() + 1)) {
    if (hayTasaEl(dia)) dias++;
    if (dias > 60) break;
  }
  return dias > 0 ? { fecha, dias } : null;
}

// El BCE las publica sobre las cuatro de la tarde de Fráncfort. Lo paso a tu
// hora: desde México, "16:00" sería mentira. Miro qué hora es allí a mediodía
// UTC y así me sale si están en horario de verano o no.
function horaBce(fechaIso) {
  const [a, m, d] = fechaIso.split("-").map(Number);
  const mediodia = Date.UTC(a, m - 1, d, 12);
  const alli = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "numeric", hourCycle: "h23" }).format(mediodia));
  return new Date(mediodia + (16 - alli) * 3600000);
}

// La hora de allí va por una ciudad de cada divisa. En Indonesia pongo Bali y
// no Yakarta: es adonde va casi todo el mundo, y lleva una hora más.
const ZONAS = {
  VND: ["Asia/Ho_Chi_Minh", "Hanói", "Hanoi"], ARS: ["America/Argentina/Buenos_Aires", "Buenos Aires", "Buenos Aires"],
  MAD: ["Africa/Casablanca", "Rabat", "Rabat"], PEN: ["America/Lima", "Lima", "Lima"],
  COP: ["America/Bogota", "Bogotá", "Bogotá"], CLP: ["America/Santiago", "Santiago", "Santiago"],
  EGP: ["Africa/Cairo", "El Cairo", "Cairo"], AED: ["Asia/Dubai", "Dubái", "Dubai"],
  TWD: ["Asia/Taipei", "Taipéi", "Taipei"], UYU: ["America/Montevideo", "Montevideo", "Montevideo"],
  CRC: ["America/Costa_Rica", "San José", "San José"], DOP: ["America/Santo_Domingo", "Santo Domingo", "Santo Domingo"],
  TND: ["Africa/Tunis", "Túnez", "Tunis"], KES: ["Africa/Nairobi", "Nairobi", "Nairobi"],
  LKR: ["Asia/Colombo", "Colombo", "Colombo"], NPR: ["Asia/Kathmandu", "Katmandú", "Kathmandu"],
  KHR: ["Asia/Phnom_Penh", "Nom Pen", "Phnom Penh"], JOD: ["Asia/Amman", "Amán", "Amman"],
  QAR: ["Asia/Qatar", "Doha", "Doha"], SAR: ["Asia/Riyadh", "Riad", "Riyadh"],
  GEL: ["Asia/Tbilisi", "Tiflis", "Tbilisi"], RSD: ["Europe/Belgrade", "Belgrado", "Belgrade"],
  BOB: ["America/La_Paz", "La Paz", "La Paz"], GTQ: ["America/Guatemala", "Guatemala", "Guatemala City"],
  PYG: ["America/Asuncion", "Asunción", "Asunción"],
  EUR: ["Europe/Paris", "París", "Paris"], USD: ["America/New_York", "Nueva York", "New York"],
  GBP: ["Europe/London", "Londres", "London"], JPY: ["Asia/Tokyo", "Tokio", "Tokyo"],
  CHF: ["Europe/Zurich", "Zúrich", "Zurich"], CAD: ["America/Toronto", "Toronto", "Toronto"],
  AUD: ["Australia/Sydney", "Sídney", "Sydney"], CNY: ["Asia/Shanghai", "Pekín", "Beijing"],
  MXN: ["America/Mexico_City", "Ciudad de México", "Mexico City"], BRL: ["America/Sao_Paulo", "São Paulo", "São Paulo"],
  SEK: ["Europe/Stockholm", "Estocolmo", "Stockholm"], NOK: ["Europe/Oslo", "Oslo", "Oslo"],
  DKK: ["Europe/Copenhagen", "Copenhague", "Copenhagen"], PLN: ["Europe/Warsaw", "Varsovia", "Warsaw"],
  TRY: ["Europe/Istanbul", "Estambul", "Istanbul"], CZK: ["Europe/Prague", "Praga", "Prague"],
  HKD: ["Asia/Hong_Kong", "Hong Kong", "Hong Kong"], HUF: ["Europe/Budapest", "Budapest", "Budapest"],
  IDR: ["Asia/Makassar", "Bali", "Bali"], ILS: ["Asia/Jerusalem", "Tel Aviv", "Tel Aviv"],
  INR: ["Asia/Kolkata", "Nueva Delhi", "New Delhi"], ISK: ["Atlantic/Reykjavik", "Reikiavik", "Reykjavik"],
  KRW: ["Asia/Seoul", "Seúl", "Seoul"], MYR: ["Asia/Kuala_Lumpur", "Kuala Lumpur", "Kuala Lumpur"],
  NZD: ["Pacific/Auckland", "Auckland", "Auckland"], PHP: ["Asia/Manila", "Manila", "Manila"],
  RON: ["Europe/Bucharest", "Bucarest", "Bucharest"], SGD: ["Asia/Singapore", "Singapur", "Singapore"],
  THB: ["Asia/Bangkok", "Bangkok", "Bangkok"], ZAR: ["Africa/Johannesburg", "Johannesburgo", "Johannesburg"],
};

// Los minutos que va la zona por delante de UTC en ese momento, con su horario
// de verano si lo tiene.
function desfase(zona, ahora) {
  const partes = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: zona, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric",
  }).formatToParts(ahora).map((p) => [p.type, Number(p.value)]));
  const comoUtc = Date.UTC(partes.year, partes.month - 1, partes.day, partes.hour, partes.minute);
  return Math.round((comoUtc - Math.floor(ahora / 60000) * 60000) / 60000);
}

// De noche (de diez a siete) allí estará casi todo cerrado.
const esNoche = (h) => h >= 22 || h < 7;

// Si allí es la misma hora que aquí no digo nada. El día va como -1, 0 o 1
// respecto al tuyo.
function horaAlli(code, ahora = new Date(), local = -new Date(ahora).getTimezoneOffset()) {
  const zona = ZONAS[code];
  if (!zona) return null;
  const suyo = desfase(zona[0], ahora);
  if (suyo === local) return null;
  const alli = new Date(Number(ahora) + suyo * 60000);
  const aqui = new Date(Number(ahora) + local * 60000);
  const dia = Math.sign(Date.UTC(alli.getUTCFullYear(), alli.getUTCMonth(), alli.getUTCDate())
    - Date.UTC(aqui.getUTCFullYear(), aqui.getUTCMonth(), aqui.getUTCDate()));
  return {
    ciudad: idiomaActual() === "en" ? zona[2] : zona[1],
    horas: alli.getUTCHours(),
    minutos: alli.getUTCMinutes(),
    diferencia: suyo - local,
    dia,
  };
}

// "cd 15:00 pst": la hora de una llamada o un vuelo, en la tuya. Las siglas que
// se ven en los correos y en las webs. CST y IST son de varios sitios: me quedo
// con Chicago y con India, que son las que más salen.
const SIGLAS_ZONA = {
  pst: "America/Los_Angeles", pdt: "America/Los_Angeles", pt: "America/Los_Angeles",
  mst: "America/Denver", mdt: "America/Denver", mt: "America/Denver",
  cst: "America/Chicago", cdt: "America/Chicago", ct: "America/Chicago",
  est: "America/New_York", edt: "America/New_York", et: "America/New_York",
  gmt: "UTC", utc: "UTC", bst: "Europe/London", cet: "Europe/Paris", cest: "Europe/Paris",
  eet: "Europe/Athens", eest: "Europe/Athens", jst: "Asia/Tokyo", kst: "Asia/Seoul",
  ist: "Asia/Kolkata", hkt: "Asia/Hong_Kong", sgt: "Asia/Singapore", ict: "Asia/Bangkok",
  wib: "Asia/Jakarta", aest: "Australia/Sydney", aedt: "Australia/Sydney",
  nzst: "Pacific/Auckland", nzdt: "Pacific/Auckland", brt: "America/Sao_Paulo",
};

// Con dos puntos, am/pm o la h: "15 usd" es dinero, no las tres de la tarde.
const HAY_HORA_ZONA = /^\s*(\d{1,2})(?:(?::|h)(\d{2})|(h))?\s*(am|pm)?\s+([a-z]{2,4})\s*$/i;

function leerHoraZona(texto) {
  const m = String(texto ?? "").match(HAY_HORA_ZONA);
  if (!m || (m[2] === undefined && !m[3] && !m[4])) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  const ampm = m[4]?.toLowerCase();
  if (ampm && (h < 1 || h > 12)) return null;
  if (ampm) h = (h % 12) + (ampm === "pm" ? 12 : 0);
  if (h > 23 || min > 59) return null;
  const sigla = m[5].toLowerCase();
  const code = sigla.toUpperCase();
  if (SIGLAS_ZONA[sigla]) return { h, min, zona: SIGLAS_ZONA[sigla], nombre: code };
  if (ZONAS[code]) return { h, min, zona: ZONAS[code][0], nombre: ZONAS[code][idiomaActual() === "en" ? 2 : 1] };
  return null;
}

// Con el horario de verano de hoy allí; si justo cambia esa noche, puede bailar una hora.
function convertirHoraZona({ h, min, zona }, ahora = new Date(), local = -new Date(ahora).getTimezoneOffset()) {
  const total = h * 60 + min - desfase(zona, ahora) + local;
  const dia = Math.floor(total / 1440);
  const resto = total - dia * 1440;
  return { h: Math.floor(resto / 60), min: resto % 60, dia };
}

function textoHoraZona(leido, ahora = new Date(), local = -new Date(ahora).getTimezoneOffset()) {
  if (!leido) return "";
  const hhmm = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const aqui = convertirHoraZona(leido, ahora, local);
  const dia = aqui.dia === 0 ? "" : ` (${tr(aqui.dia > 0 ? "horaZona.manana" : "horaZona.ayer")})`;
  return `${hhmm(leido.h, leido.min)} ${leido.nombre} = 🕐 ${hhmm(aqui.h, aqui.min)} ${tr("horaZona.tuya")}${dia}`;
}

// "+7 h", "−6 h", "+5 h 30". El menos es el de verdad, no un guion.
function textoDiferencia(min) {
  const signo = min < 0 ? "−" : "+";
  const h = Math.floor(Math.abs(min) / 60);
  const m = Math.abs(min) % 60;
  if (h === 0) return `${signo}${m} min`;
  return m ? `${signo}${h} h ${m}` : `${signo}${h} h`;
}

const relojDe = ({ horas, minutos }) => `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;

function tituloHoraAlli(h) {
  const dia = h.dia > 0 ? tr("alli.manana") : h.dia < 0 ? tr("alli.ayer") : "";
  return tr("alli.titulo", { ciudad: h.ciudad, hora: relojDe(h), dia, dif: textoDiferencia(h.diferencia) });
}

const horaCorta = (instante) => fechas({ hour: "numeric", minute: "2-digit" }).format(instante);

// "BCE hoy 16:00" en vez de la fecha en ISO, que nadie lee así.
function textoActualizado(fechaIso, ahora = Date.now()) {
  if (!esIso(fechaIso)) return "";
  const instante = horaBce(fechaIso);
  const dia = nombreDia(isoLocal(instante), isoLocal(new Date(ahora))).toLocaleLowerCase();
  return tr("actualizado", { cuando: `${dia} ${horaCorta(instante)}` });
}

// La siguiente que publicará: el primer día con tasa después de la que tengo
// cuya hora aún no ha pasado. Con diez días sobra hasta para la Semana Santa.
function proximaTasa(fechaIso, ahora = Date.now()) {
  if (!esIso(fechaIso)) return null;
  const [a, m, d] = fechaIso.split("-").map(Number);
  for (let mas = 1; mas <= 10; mas += 1) {
    const dia = new Date(a, m - 1, d + mas);
    if (!hayTasaEl(dia)) continue;
    const instante = horaBce(isoLocal(dia));
    if (instante.getTime() > ahora) return instante;
  }
  return null;
}

function textoProximaTasa(instante, ahora = Date.now()) {
  if (!instante) return "";
  const hora = horaCorta(instante);
  const dia = isoLocal(instante);
  const hoyIso = isoLocal(new Date(ahora));
  const [a, m, d] = hoyIso.split("-").map(Number);
  if (dia === hoyIso) return tr("bce.proximaHoy", { hora });
  if (dia === isoLocal(new Date(a, m - 1, d + 1))) return tr("bce.proximaManana", { hora });
  return tr("bce.proximaDia", { hora, dia: fechas({ weekday: "long" }).format(instante) });
}

// "del lunes" si es de esta semana, que se entiende mejor; si no, la fecha.
function textoTasaVieja(fecha, hoyIso = hoy()) {
  const [a, m, d] = fecha.split("-").map(Number);
  const desde = diasHasta(hoyIso, fecha) - 1;
  const dia = desde < 7
    ? fechas({ weekday: "long" }).format(new Date(a, m - 1, d))
    : fechaCorta(fecha, Number(hoyIso.slice(0, 4)));
  return tr("vieja.chip", { dia });
}

// El Date se traga el 30 de febrero y lo pasa a marzo, así que compruebo que
// al montarla sigue siendo el mismo día.
function fechaValida(iso, hoyIso = hoy()) {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [a, m, d] = iso.split("-").map(Number);
  const fecha = new Date(a, m - 1, d);
  if (fecha.getFullYear() !== a || fecha.getMonth() !== m - 1 || fecha.getDate() !== d) return false;
  return iso >= FECHA_MINIMA && iso <= hoyIso;
}

// Del 31 de marzo un mes atrás es el 28 (o 29) de febrero, no el 3 de marzo.
function mesesAtras(iso, meses) {
  const [a, m, d] = iso.split("-").map(Number);
  const fecha = new Date(a, m - 1 - meses, 1);
  const ultimo = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
  fecha.setDate(Math.min(d, ultimo));
  return isoLocal(fecha);
}

// El día de un punto del gráfico, para abrirlo en la pestaña del día. Pasa por
// fechaValida porque esa pestaña no acepta otra cosa.
function diaDelGrafico(serie, indice, hoyIso = hoy()) {
  const fecha = Array.isArray(serie) ? serie[indice]?.fecha : undefined;
  return fechaValida(fecha, hoyIso) ? fecha : null;
}

const FECHAS_RAPIDAS = [
  { meses: 1, clave: "fecha.1" },
  { meses: 6, clave: "fecha.6" },
  { meses: 12, clave: "fecha.12" },
];

function leerFecha(guardado, hoyIso = hoy()) {
  return fechaValida(guardado, hoyIso) ? guardado : mesesAtras(hoyIso, 1);
}

// Cuánto ha cambiado desde entonces lo mismo que tenías.
function cambioDesde(antes, ahora) {
  if (!Number.isFinite(antes) || !Number.isFinite(ahora) || antes <= 0) return null;
  return (ahora - antes) / antes;
}

// Los fines de semana y festivos la API da la del último día con tasa.
function notaDiaHabil(pedida, real) {
  if (!real || real === pedida) return "";
  return tr("fecha.otroDia", { fecha: fechaLarga(real) });
}

function startDateFor(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return isoLocal(date);
}

// Guardo uno más de los que enseño, porque el par que tienes puesto está en la
// lista pero no sale como pastilla. Tres pastillas caben en una fila; con
// cuatro saltaba a dos y el popup pasaba de 600 px, que es donde Chrome corta.
const RECIENTES_MAX = 4;
// Uno menos que el máximo: si fijas todos, el par nuevo no tendría dónde entrar.
const FIJOS_MAX = RECIENTES_MAX - 1;

const esPar = (p, from, to) => p.from === from && p.to === to;

// Los fijos van siempre delante y en el orden en que los fijaste; detrás, el
// resto, del último al más viejo.
function apuntarReciente(lista, from, to) {
  if (from === to) return lista;
  if (lista.some((p) => p.fijo && esPar(p, from, to))) return lista;
  const fijos = lista.filter((p) => p.fijo);
  const resto = lista.filter((p) => !p.fijo && !esPar(p, from, to));
  return [...fijos, { from, to }, ...resto].slice(0, RECIENTES_MAX);
}

function fijarReciente(lista, from, to) {
  const par = lista.find((p) => esPar(p, from, to));
  if (!par) return lista;
  const fijos = lista.filter((p) => p.fijo && !esPar(p, from, to));
  const resto = lista.filter((p) => !p.fijo && !esPar(p, from, to));
  if (par.fijo) return [...fijos, { from, to }, ...resto];
  if (fijos.length >= FIJOS_MAX) return lista;
  return [...fijos, { from, to, fijo: true }, ...resto];
}

// Lo que venga del almacenamiento no me lo creo: puede no existir (versiones
// de antes) o traer una divisa que ya he quitado del array.
function leerRecientes(guardado) {
  if (!Array.isArray(guardado)) return [];
  const buenos = guardado
    .filter((p) => p && isValidCode(p.from) && isValidCode(p.to) && p.from !== p.to)
    .slice(0, RECIENTES_MAX)
    .map(({ from, to, fijo }) => (fijo === true ? { from, to, fijo } : { from, to }));
  // Por si vienen tocados a mano: más fijos de la cuenta, el resto se suelta.
  let fijos = 0;
  return buenos.map((p) => (p.fijo && ++fijos > FIJOS_MAX ? { from: p.from, to: p.to } : p));
}

function recientesVisibles(lista, from, to) {
  return lista.filter((p) => p.from !== from || p.to !== to).slice(0, RECIENTES_MAX - 1);
}

// Más de cinco filas y el popup se hace más alto que la pantalla de un portátil.
const EXTRAS_MAX = 5;
const EXTRAS_POR_DEFECTO = ["GBP", "JPY", "CHF"];

// Si no hay nada guardado es que nunca lo has tocado: le pongo unas cuantas
// para que se vea para qué sirve. Una lista vacía guardada sí la respeto.
function leerExtras(guardado) {
  if (!Array.isArray(guardado)) return [...EXTRAS_POR_DEFECTO];
  return [...new Set(guardado.filter(isValidCode))].slice(0, EXTRAS_MAX);
}

function anadirExtra(lista, code) {
  if (!isValidCode(code) || lista.includes(code) || lista.length >= EXTRAS_MAX) return lista;
  return [...lista, code];
}

function quitarExtra(lista, code) {
  return lista.filter((c) => c !== code);
}

// Las del par que tienes puesto ya salen arriba, no las repito.
function extrasVisibles(lista, from, to) {
  return lista.filter((c) => c !== from && c !== to);
}

function disponiblesParaAnadir(lista, from, to) {
  return CURRENCIES.map((c) => c.code).filter((c) => !lista.includes(c) && c !== from && c !== to);
}

// Con comisión, lo que pagarías de verdad; sin ella (0) sale lo de siempre.
function convertirExtras(cantidad, tasas, codes, comision = 0) {
  return codes.map((code) => ({
    code,
    valor: cantidad === null || typeof tasas?.[code] !== "number" ? null : conComision(cantidad * tasas[code], comision),
  }));
}

// La API da la serie como { "2026-09-29": { GBP: 0.86, JPY: 160 }, ... }: de
// ahí saco la semana de una divisa y cuánto se ha movido del primer día al último.
function semanaDe(rates, code) {
  const valores = Object.keys(rates ?? {})
    .sort()
    .map((dia) => rates[dia]?.[code])
    .filter((v) => typeof v === "number" && v > 0);
  if (valores.length < 2) return null;
  const cambio = cambioDesde(valores[0], valores.at(-1));
  return { valores, cambio, sentido: sentidoDe(cambio) };
}

// El minigráfico de cada casilla, en una caja de 100 × 20. Va de fondo detrás
// de la cifra, así que le dejo aire arriba y abajo para que no la pise entera.
function trazoMini(valores) {
  const min = Math.min(...valores);
  const span = Math.max(...valores) - min;
  const paso = 100 / (valores.length - 1);
  const puntos = valores.map((v, i) => {
    const y = span === 0 ? 10 : 17 - ((v - min) / span) * 14;
    return `${(i * paso).toFixed(2)},${y.toFixed(2)}`;
  });
  const linea = `M${puntos.join("L")}`;
  return { linea, area: `${linea}L100,20L0,20Z` };
}

const CHULETA = [1, 5, 10, 20, 50, 100];

// Con yenes o rupias una tabla de 1 a 100 no sirve para nada (100 JPY son
// céntimos), así que la subo de diez en diez hasta que la primera fila valga
// al menos medio en la otra divisa.
function escalaChuleta(rate) {
  if (!Number.isFinite(rate) || rate <= 0) return 1;
  let escala = 1;
  while (escala * rate < 0.5) escala *= 10;
  return escala;
}

// La escala sale de la tasa sin comisión: un 3 % no debe cambiar la tabla de
// 100 a 1.000 yenes.
function chuleta(rate, comision = 0) {
  const escala = escalaChuleta(rate);
  const hay = Number.isFinite(rate) && rate > 0;
  return CHULETA.map((n) => ({ cantidad: n * escala, valor: hay ? conComision(n * escala * rate, comision) : null }));
}

// En la tienda no vas a sacar el móvil para cada precio. Busco la cuenta más
// fácil que no se aparte más de un 4 %: antes "quítale un 10 %" que "por 0,92".
const TRUCO_TOLERANCIA = 0.04;

function candidatosTruco(rate) {
  const lista = [{ tipo: "igual", factor: 1, nivel: 0 }];
  for (let pct = 5; pct <= 30; pct += 5) {
    lista.push({ tipo: "mas", pct, factor: 1 + pct / 100, nivel: 1 });
    lista.push({ tipo: "menos", pct, factor: 1 - pct / 100, nivel: 1 });
  }
  const k = Math.floor(Math.log10(rate));
  for (let e = k - 1; e <= k + 1; e++) {
    // Quitar ceros y luego multiplicar es un paso más que multiplicar sin más.
    for (let d = 1; d <= 9; d++) lista.push({ tipo: "por", d, e, factor: d * 10 ** e, nivel: d === 1 ? 1 : e < 0 ? 2.5 : 2 });
  }
  for (let d = 10; d <= 99; d++) lista.push({ tipo: "por", d, e: k - 1, factor: d * 10 ** (k - 1), nivel: 4 });
  // Dividir solo entre números de 1,5 para arriba: "divide entre 0,2" no lo hace nadie.
  const kq = Math.floor(Math.log10(1 / rate));
  for (let e = Math.max(0, kq - 1); e <= kq + 1; e++) {
    // Mitades solo por debajo de 10: "entre 7,5" sí, "entre 12,5" ya no.
    for (let d = 1.5; d <= 20; d += d < 10 ? 0.5 : 1) {
      const nivel = !Number.isInteger(d) ? 3.5 : d < 10 ? 2 : 3;
      lista.push({ tipo: "entre", d, e, factor: 1 / (d * 10 ** e), nivel });
    }
  }
  return lista;
}

function trucoDeCabeza(rate) {
  if (!Number.isFinite(rate) || rate <= 0) return null;
  const lista = candidatosTruco(rate).map((c) => ({ ...c, desvio: c.factor / rate - 1 }));
  const buenos = lista.filter((c) => Math.abs(c.desvio) <= TRUCO_TOLERANCIA);
  // Si ninguno entra en el 4 % (pasa con 1,05 o 10,5), el que menos se aparte.
  if (buenos.length === 0) return lista.reduce((a, b) => (Math.abs(b.desvio) < Math.abs(a.desvio) ? b : a));
  return buenos.reduce((a, b) =>
    b.nivel < a.nivel || (b.nivel === a.nivel && Math.abs(b.desvio) < Math.abs(a.desvio)) ? b : a);
}

function textoTruco(truco) {
  if (!truco) return "";
  const { tipo, d, e } = truco;
  if (tipo === "igual") return tr("truco.igual");
  if (tipo === "mas" || tipo === "menos") return tr(`truco.${tipo}`, { pct: tr("pct", { n: truco.pct }) });
  const numero = (n) => numeros({ maximumFractionDigits: 1 }).format(Number(n.toPrecision(6)));
  // En cifra y con × y ÷: al lado de los botones caben unas veinte letras.
  const ceros = (n) => tr(n === 1 ? "truco.ceros.1" : "truco.ceros", { n });
  if (tipo === "entre") {
    return e >= 3 ? tr("truco.quitaEntre", { ceros: ceros(e), d: numero(d) }) : tr("truco.entre", { n: numero(d * 10 ** e) });
  }
  if (d === 1) return tr(e > 0 ? "truco.pon" : "truco.quita", { ceros: ceros(Math.abs(e)) });
  if (e >= 3) return tr("truco.porPon", { d: numero(d), ceros: ceros(e) });
  if (d * 10 ** e < 1) return tr("truco.quitaPor", { ceros: ceros(-e), d: numero(d) });
  return tr("truco.por", { n: numero(d * 10 ** e) });
}

// Para que sepas cuánto te fías: lo que se aparta de la cuenta buena.
function tituloTruco(truco) {
  if (!truco) return "";
  const pct = Math.round(Math.abs(truco.desvio) * 100);
  if (pct === 0) return tr("truco.clavado");
  return tr(truco.desvio > 0 ? "truco.deMas" : "truco.deMenos", { pct: tr("pct", { n: pct }) });
}

// Para el grupo del viaje. Las filas van entre ``` para que WhatsApp las ponga
// en letra de máquina y los números queden en columna.
function chuletaParaCompartir(filas, from, to, comision = 0) {
  if (filas.length === 0 || filas.some((f) => f.valor === null)) return "";
  const entero = numeros({ maximumFractionDigits: 0 });
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const izquierda = filas.map((f) => `${entero.format(f.cantidad)} ${from}`);
  const derecha = filas.map((f) => `${dinero.format(f.valor)} ${to}`);
  const ancho = (lista) => Math.max(...lista.map((t) => t.length));
  const lineas = filas.map((_, i) => `${izquierda[i].padStart(ancho(izquierda))} = ${derecha[i].padStart(ancho(derecha))}`);
  const texto = [`*💱 ${tr("chuleta.titulo", { from, to })}*`, "```", ...lineas, "```"];
  if (comision > 0) texto.push(`_${tr("chuleta.conComision", { pct: tr("pct", { n: numeros({ maximumFractionDigits: 2 }).format(comision) }) })}_`);
  return texto.join("\n");
}

// Lo mismo en varias divisas, para el grupo. Con las banderas no va en bloque de
// código: los emojis ocupan lo que quieren y la columna no cuadraría igual.
function extrasParaCompartir(cantidad, from, filas, comision = 0) {
  if (!(cantidad > 0) || filas.length === 0 || filas.some((f) => f.valor === null)) return "";
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const texto = [
    `*💱 ${tr("extras.compartirTitulo", { cantidad: `${dinero.format(cantidad)} ${from}` })}*`,
    ...filas.map((f) => `${banderaDivisa(f.code)} ${dinero.format(f.valor)} ${f.code}`),
  ];
  if (comision > 0) texto.push(`_${tr("chuleta.conComision", { pct: tr("pct", { n: numeros({ maximumFractionDigits: 2 }).format(comision) }) })}_`);
  return texto.join("\n");
}

// La chuleta para imprimir va por la URL de su pestaña: así no depende de que el
// popup siga abierto, que se cierra en cuanto sale el diálogo de imprimir.
function urlImpresion({ from, to, rate, comision = 0, fecha = null }) {
  const p = new URLSearchParams({ from, to, rate: String(rate), comision: String(comision) });
  if (fecha) p.set("fecha", fecha);
  return `imprimir.html?${p}`;
}

function leerImpresion(busqueda) {
  const p = new URLSearchParams(busqueda);
  const from = p.get("from");
  const to = p.get("to");
  const rate = Number(p.get("rate"));
  if (!isValidCode(from) || !isValidCode(to) || from === to || !(rate > 0) || !Number.isFinite(rate)) return null;
  const fecha = p.get("fecha");
  return { from, to, rate, comision: leerComision(Number(p.get("comision"))), fecha: esIso(fecha) ? fecha : null };
}

// Por las dos caras: la de los precios de allí y la de cuánto te dan por lo tuyo.
// La vuelta va sin comisión, que es lo que recibes y no lo que pagas.
function chuletaParaImprimir({ rate, comision }) {
  return { ida: chuleta(rate, comision), vuelta: chuleta(1 / rate) };
}

// Las tarjetas normales cobran entre un 1 y un 3 %. Más de un 10 % seguro que
// es un error al teclear.
const COMISION_MAX = 10;
const COMISIONES_RAPIDAS = [0, 1, 2, 3];

const redondearComision = (pct) => Math.round(pct * 100) / 100;

// Quien viene de antes no tiene nada guardado: sin comisión, como hasta ahora.
function leerComision(guardado) {
  if (typeof guardado !== "number" || !Number.isFinite(guardado)) return 0;
  if (guardado < 0 || guardado > COMISION_MAX) return 0;
  return redondearComision(guardado);
}

function leerPorcentaje(texto, max = COMISION_MAX, redondear = redondearComision) {
  const limpio = String(texto ?? "").replace(/[\s%]/g, "").replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(limpio)) return null;
  const pct = Number(limpio);
  return pct > max ? null : redondear(pct);
}

function conComision(valor, pct) {
  if (valor === null || !Number.isFinite(valor)) return null;
  return valor * (1 + pct / 100);
}

// En Estados Unidos y Canadá la etiqueta va sin el impuesto, y cada sitio pone
// el suyo. Tres decimales porque Nueva York cobra un 8,875 %.
const IMPUESTO_MAX = 25;
const IMPUESTOS_RAPIDOS = [0, 5, 8, 10];

const redondearImpuesto = (pct) => Math.round(pct * 1000) / 1000;

function leerImpuesto(guardado) {
  if (typeof guardado !== "number" || !Number.isFinite(guardado)) return 0;
  if (guardado < 0 || guardado > IMPUESTO_MAX) return 0;
  return redondearImpuesto(guardado);
}

const leerImpuestoEscrito = (texto) => leerPorcentaje(texto, IMPUESTO_MAX, redondearImpuesto);

// El banco cobra sobre lo que pasa por caja, que ya lleva el impuesto.
function loQuePagas(valor, comision = 0, impuesto = 0) {
  return conComision(conComision(valor, impuesto), comision);
}

// Allí es lo de arriba convertido, con la comisión y el impuesto; aquí, lo que
// pone la etiqueta de tu tienda. Por debajo de un 1 % lo doy por igual: es lo
// que se mueve la tasa entre que lo miras y lo pagas.
const COMPARAR_IGUAL = 0.01;

function compararPrecios(alli, aqui) {
  if (!(alli > 0) || !(aqui > 0)) return null;
  const diferencia = aqui - alli;
  const fraccion = Math.abs(diferencia) / Math.max(alli, aqui);
  const donde = fraccion < COMPARAR_IGUAL ? "igual" : diferencia > 0 ? "alli" : "aqui";
  return { donde, ahorro: Math.abs(diferencia), fraccion };
}

// La balanza: baja el lado que cuesta más. Con un 30 % ya está del todo, que si
// no las diferencias normales casi no se notarían.
function inclinacion(comparacion, maximo = 14) {
  if (!comparacion || comparacion.donde === "igual") return 0;
  const grados = Math.min(comparacion.fraccion / 0.3, 1) * maximo;
  return comparacion.donde === "alli" ? grados : -grados;
}

// Lo que te cuesta un café en casa, para hacerte a la idea de lo que vale algo.
// Va con su divisa: 1,50 en euros no es lo mismo que 1,50 en libras.
function leerCafe(guardado) {
  const { precio, divisa } = guardado ?? {};
  if (!Number.isFinite(precio) || precio <= 0 || !isValidCode(divisa)) return null;
  return { precio: Math.round(precio * 100) / 100, divisa };
}

// Cuántos cafés son, con la cantidad de cualquiera de los dos lados que vaya en
// la divisa del café. Menos de medio no lo digo, que no ayuda.
function enCafes(cafe, cantidades) {
  if (!cafe) return null;
  const suya = cantidades.find((c) => c.divisa === cafe.divisa && Number.isFinite(c.valor));
  if (!suya) return null;
  const n = suya.valor / cafe.precio;
  if (n < 0.5) return null;
  return n < 0.75 ? 0.5 : Math.round(n);
}

function textoCafes(n) {
  if (n === null) return "";
  if (n === 0.5) return tr("cafe.medio");
  if (n === 1) return tr("cafe.uno");
  return tr("cafe.varios", { n: numeros({ maximumFractionDigits: 0 }).format(n) });
}

const HORAS_JORNADA = 8;

// Lo que ganas a la hora, con su divisa como el café. Más de cinco minutos para
// que salga: por debajo es calderilla.
function enHoras(hora, cantidades) {
  if (!hora) return null;
  const suya = cantidades.find((c) => c.divisa === hora.divisa && Number.isFinite(c.valor));
  if (!suya) return null;
  const min = (suya.valor / hora.precio) * 60;
  if (min < 5) return null;
  if (min < 60) return Math.round(min / 5) * 5;
  if (min < HORAS_JORNADA * 60 * 2) return Math.round(min / 30) * 30;
  // De dos jornadas en adelante ya se piensa en días, de medio en medio.
  return Math.round(min / (HORAS_JORNADA * 30)) * HORAS_JORNADA * 30;
}

function textoHoras(min, corto = false) {
  if (min === null) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  const sufijo = corto ? ".corto" : "";
  if (min < 60) return tr(`horas.min${sufijo}`, { n: n.format(min) });
  if (min < HORAS_JORNADA * 60 * 2) return tr(`horas.h${sufijo}`, { n: n.format(min / 60) });
  return tr(`horas.dias${sufijo}`, { n: n.format(min / 60 / HORAS_JORNADA) });
}

// Las propinas de siempre: en Europa poco o nada (el 5 es redondear en el bar),
// en Estados Unidos del 15 al 25, que los datáfonos de allí ya empiezan a
// proponerla. El 18 porque es lo normal allí, y la sugerencia lo pone.
const PROPINAS_RAPIDAS = [0, 5, 10, 15, 18, 20, 25];
const PROPINA_MAX = 30;
const PERSONAS_MAX = 20;
const CUENTA_POR_DEFECTO = { propina: 10, personas: 2, redondear: false };

// Lo que se suele dejar en un restaurante, por la divisa de la cuenta. Es a ojo:
// en el euro cambia de un país a otro, y en Japón o Corea dejarla queda raro.
// La libra, 12,5: es el service charge que ya viene en la cuenta en Reino Unido.
const PROPINA_HABITUAL = {
  USD: 18, CAD: 15, MXN: 10, BRL: 10, GBP: 12.5, EUR: 5, CHF: 5, JPY: 0, KRW: 0, CNY: 0,
  HKD: 10, SGD: 0, AUD: 5, NZD: 5, THB: 5, IDR: 5, INR: 10, PHP: 10, MYR: 0, ZAR: 10,
  ILS: 12, TRY: 10, PLN: 10, CZK: 10, HUF: 10, RON: 10, SEK: 5, NOK: 5, DKK: 5, ISK: 0,
};

const propinaHabitual = (code) => PROPINA_HABITUAL[code] ?? null;

// "cd propina", "cd propina 60" o "cd tip 60 usd": la de allí y, con la cuenta,
// cuánto es. Sin divisa, la de arriba, igual que el enchufe.
const HAY_PROPINA = /^\s*(?:propinas?|tips?)(?:\s+(\d+(?:[.,]\d+)*))?(?:\s+([a-z]{3}))?\s*$/i;

function leerPropina(texto) {
  const m = String(texto ?? "").match(HAY_PROPINA);
  if (!m) return null;
  const code = m[2]?.toUpperCase() ?? null;
  // Una divisa de las que no tengo la propina vale: así dice que no la tengo.
  if (code && !isValidCode(code)) return null;
  const cuenta = m[1] ? leerNumero(m[1]) : null;
  if (m[1] && !(cuenta > 0)) return null;
  return { code, cuenta };
}

function textoPropina(code, cuenta = null) {
  const pct = propinaHabitual(code);
  if (pct === null) return "";
  if (pct === 0) return `${banderaDivisa(code)} ${tr("cuenta.habitualNada")}`;
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const tanto = tr("pct", { n: numeros({ maximumFractionDigits: 2 }).format(pct) });
  // Redondeo la propina antes de sumar, para que la cuenta cuadre al céntimo.
  const propina = Math.round(cuenta * pct) / 100;
  const partes = [cuenta
    ? tr("propina.conCuenta", { pct: tanto, cuenta: dinero.format(cuenta), propina: dinero.format(propina), total: `${dinero.format(cuenta + propina)} ${code}` })
    : tr("propina.habitual", { pct: tanto })];
  if (code === "GBP") partes.push(tr("propina.servicio"));
  return `${banderaDivisa(code)} ${partes.join(" · ")}`;
}

// "cd enchufe jpy": qué enchufe hay allí y si entra el tuyo. Por la divisa, así
// que el euro va con el de casi toda la zona y aviso aparte de los de la G.
// Pongo la C donde el europeo entra aunque no sea el oficial (Suiza, Israel…).
const ENCHUFES = {
  EUR: ["CF", [230]], USD: ["AB", [120]], GBP: ["G", [230]], JPY: ["AB", [100]], CHF: ["CJ", [230]],
  CAD: ["AB", [120]], AUD: ["I", [230]], CNY: ["ACI", [220]], MXN: ["AB", [127]], BRL: ["CN", [127, 220]],
  SEK: ["CF", [230]], NOK: ["CF", [230]], DKK: ["CFK", [230]], PLN: ["CE", [230]], TRY: ["CF", [230]],
  CZK: ["CE", [230]], HKD: ["G", [220]], HUF: ["CF", [230]], IDR: ["CF", [230]], ILS: ["CH", [230]],
  INR: ["CDM", [230]], ISK: ["CF", [230]], KRW: ["CF", [220]], MYR: ["G", [240]], NZD: ["I", [230]],
  PHP: ["ABC", [220]], RON: ["CF", [230]], SGD: ["G", [230]], THB: ["ABCO", [230]], ZAR: ["CMN", [230]],
};

const HAY_ENCHUFE = /^\s*(?:enchufes?|plugs?)(?:\s+([a-z]{3}))?\s*$/i;

function leerEnchufe(texto) {
  const m = String(texto ?? "").match(HAY_ENCHUFE);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !ENCHUFES[code] ? null : { code };
}

// De 100 a 127 V y de 220 a 240 son dos mundos: un secador de aquí allí se quema.
const voltajeBajo = (v) => v < 200;

function enchufeDe(alli, aqui) {
  const [tipos, voltios] = ENCHUFES[alli] ?? [];
  if (!tipos) return null;
  const casa = alli === aqui ? null : ENCHUFES[aqui];
  return {
    code: alli,
    tipos: [...tipos],
    voltios,
    entra: casa ? [...casa[0]].some((t) => tipos.includes(t)) : null,
    otroVoltaje: casa ? !voltios.some((v) => casa[1].some((c) => voltajeBajo(c) === voltajeBajo(v))) : false,
  };
}

// "cd emergencias jpy": a qué número llamar allí. Con el euro, el 112 vale en
// toda la zona. En Australia y Sudáfrica el 112 solo va desde el móvil.
const EMERGENCIAS = {
  EUR: [["112", "todo"]], USD: [["911", "todo"]], GBP: [["999", "todo"]], CAD: [["911", "todo"]],
  MXN: [["911", "todo"]], PHP: [["911", "todo"]], HKD: [["999", "todo"]], MYR: [["999", "todo"]],
  NZD: [["111", "todo"]], SEK: [["112", "todo"]], DKK: [["112", "todo"]], PLN: [["112", "todo"]],
  TRY: [["112", "todo"]], CZK: [["112", "todo"]], HUF: [["112", "todo"]], IDR: [["112", "todo"]],
  INR: [["112", "todo"]], ISK: [["112", "todo"]], RON: [["112", "todo"]],
  AUD: [["000", "todo"], ["112", "movil"]],
  JPY: [["110", "policia"], ["119", "ambulanciaBomberos"]],
  KRW: [["112", "policia"], ["119", "ambulanciaBomberos"]],
  SGD: [["999", "policia"], ["995", "ambulanciaBomberos"]],
  CNY: [["110", "policia"], ["120", "ambulancia"], ["119", "bomberos"]],
  BRL: [["190", "policia"], ["192", "ambulancia"], ["193", "bomberos"]],
  NOK: [["112", "policia"], ["113", "ambulancia"], ["110", "bomberos"]],
  ILS: [["100", "policia"], ["101", "ambulancia"], ["102", "bomberos"]],
  THB: [["191", "policia"], ["1669", "ambulancia"], ["199", "bomberos"]],
  CHF: [["112", "todo"], ["144", "ambulancia"]],
  ZAR: [["10111", "policia"], ["10177", "ambulancia"], ["112", "movil"]],
};

const HAY_EMERGENCIAS = /^\s*(?:emergencias?|emergency|sos)(?:\s+([a-z]{3}))?\s*$/i;

function leerEmergencias(texto) {
  const m = String(texto ?? "").match(HAY_EMERGENCIAS);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !EMERGENCIAS[code] ? null : { code };
}

function textoEmergencias(code) {
  const telefonos = EMERGENCIAS[code];
  if (!telefonos) return "";
  const lista = telefonos.map(([n, para]) => `${n} ${tr(`emergencias.${para}`)}`).join(" · ");
  return `${banderaDivisa(code)} 🚨 ${lista}`;
}

// "cd agua": si se puede beber la del grifo. En Turquía o Brasil es potable en
// las ciudades, pero fuera de ahí no me la jugaría.
const AGUA = {
  si: ["EUR", "USD", "GBP", "JPY", "CHF", "CAD", "AUD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "ISK",
    "KRW", "NZD", "SGD", "HKD", "ILS", "RON", "AED", "QAR", "UYU", "CLP", "ARS", "RSD", "CRC"],
  ciudades: ["TRY", "BRL", "ZAR", "MYR", "COP", "GEL", "SAR"],
  no: ["CNY", "MXN", "IDR", "INR", "PHP", "THB", "VND", "MAD", "PEN", "EGP", "TWD", "DOP", "TND", "KES",
    "LKR", "NPR", "KHR", "JOD", "BOB", "GTQ", "PYG"],
};

const HAY_AGUA = /^\s*(?:agua|grifo|water)(?:\s+([a-z]{3}))?\s*$/i;

function aguaDe(code) {
  return Object.keys(AGUA).find((k) => AGUA[k].includes(code)) ?? null;
}

function leerAgua(texto) {
  const m = String(texto ?? "").match(HAY_AGUA);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !aguaDe(code) ? null : { code };
}

function textoAgua(code) {
  const agua = aguaDe(code);
  if (!agua) return "";
  return `${banderaDivisa(code)} ${agua === "si" ? "🚰" : "🚱"} ${tr(`agua.${agua}`)}`;
}

// "cd prefijo": el código para llamar allí. El euro no tiene uno, así que van
// los de los países a los que más se viaja. La República Dominicana comparte el +1.
const PREFIJOS = {
  EUR: ["🇪🇸 +34", "🇫🇷 +33", "🇩🇪 +49", "🇮🇹 +39", "🇵🇹 +351", "🇳🇱 +31", "🇬🇷 +30", "🇮🇪 +353"],
  USD: "+1", GBP: "+44", JPY: "+81", CHF: "+41", CAD: "+1", AUD: "+61", CNY: "+86", MXN: "+52",
  BRL: "+55", SEK: "+46", NOK: "+47", DKK: "+45", PLN: "+48", TRY: "+90", CZK: "+420", HKD: "+852",
  HUF: "+36", IDR: "+62", ILS: "+972", INR: "+91", ISK: "+354", KRW: "+82", MYR: "+60", NZD: "+64",
  PHP: "+63", RON: "+40", SGD: "+65", THB: "+66", ZAR: "+27", VND: "+84", ARS: "+54", MAD: "+212",
  PEN: "+51", COP: "+57", CLP: "+56", EGP: "+20", AED: "+971", TWD: "+886", UYU: "+598", CRC: "+506",
  DOP: "+1 809", TND: "+216", KES: "+254", LKR: "+94", NPR: "+977", KHR: "+855", JOD: "+962",
  QAR: "+974", SAR: "+966", GEL: "+995", RSD: "+381", BOB: "+591", GTQ: "+502", PYG: "+595",
};

const HAY_PREFIJO = /^\s*(?:prefijo|prefix|llamar)(?:\s+([a-z]{3}))?\s*$/i;

function leerPrefijo(texto) {
  const m = String(texto ?? "").match(HAY_PREFIJO);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !PREFIJOS[code] ? null : { code };
}

function textoPrefijo(code) {
  const prefijo = PREFIJOS[code];
  if (!prefijo) return "";
  return `${banderaDivisa(code)} 📞 ${[prefijo].flat().join(" · ")}`;
}

// "cd gracias": hola, gracias y la cuenta allí, escrito como suena. Donde se
// habla español o inglés no hace falta tabla, salvo la cuenta de EE. UU., que es "check".
const ESPANOL = ["Hola", "Gracias", "La cuenta, por favor"];
const INGLES = ["Hello", "Thank you", "The bill, please"];
const FRASES = {
  MXN: "es", ARS: "es", PEN: "es", COP: "es", CLP: "es", UYU: "es", CRC: "es", DOP: "es", BOB: "es", GTQ: "es", PYG: "es",
  GBP: "en", AUD: "en", NZD: "en", SGD: "en", ZAR: "en",
  USD: ["Hello", "Thank you", "The check, please"], CAD: ["Hello", "Thank you", "The check, please"],
  JPY: ["Konnichiwa", "Arigatō", "Okaikei onegaishimasu"],
  CHF: ["Grüezi", "Merci", "Zahlen, bitte"],
  CNY: ["Nǐ hǎo", "Xièxie", "Mǎidān"], TWD: ["Nǐ hǎo", "Xièxie", "Mǎidān"],
  HKD: ["Nei hou", "M goi", "Maai daan"],
  BRL: ["Olá", "Obrigado", "A conta, por favor"],
  SEK: ["Hej", "Tack", "Notan, tack"], NOK: ["Hei", "Takk", "Regningen, takk"], DKK: ["Hej", "Tak", "Regningen, tak"],
  ISK: ["Halló", "Takk", "Reikninginn, takk"],
  PLN: ["Dzień dobry", "Dziękuję", "Poproszę rachunek"], CZK: ["Dobrý den", "Děkuji", "Zaplatím, prosím"],
  HUF: ["Jó napot", "Köszönöm", "A számlát, kérem"], RON: ["Bună ziua", "Mulțumesc", "Nota, vă rog"],
  RSD: ["Zdravo", "Hvala", "Račun, molim"], GEL: ["Gamarjoba", "Madloba", "Angarishi, tu sheidzleba"],
  TRY: ["Merhaba", "Teşekkürler", "Hesap, lütfen"],
  ILS: ["Shalom", "Todá", "Heshbón, bevakashá"],
  AED: ["Marhaba", "Shukran", "Al-hisab, min fadlak"], QAR: ["Marhaba", "Shukran", "Al-hisab, min fadlak"],
  SAR: ["Marhaba", "Shukran", "Al-hisab, min fadlak"], JOD: ["Marhaba", "Shukran", "Al-hisab, min fadlak"],
  EGP: ["Ahlan", "Shukran", "El hesab, law samaht"], MAD: ["Salam", "Shukran", "L'hsab, afak"],
  TND: ["Aslema", "Yaishek", "L'addition, s'il vous plaît"],
  INR: ["Namaste", "Dhanyavaad", "Bill dijiye"], NPR: ["Namaste", "Dhanyabad", "Bill dinus"],
  LKR: ["Ayubowan", "Stuti", "Bill eka denna"],
  IDR: ["Halo", "Terima kasih", "Minta bon"], MYR: ["Helo", "Terima kasih", "Minta bil"],
  PHP: ["Kumusta", "Salamat", "Bill po"], KRW: ["Annyeonghaseyo", "Gamsahamnida", "Gyesanhalgeyo"],
  THB: ["Sawasdee", "Khob khun", "Check bin"], VND: ["Xin chào", "Cảm ơn", "Tính tiền"],
  KHR: ["Suostei", "Arkun", "Som kit luy"], KES: ["Jambo", "Asante", "Bili, tafadhali"],
  // El euro no tiene un idioma: solo el gracias de los sitios a los que más se va.
  EUR: ["🇫🇷 Merci", "🇩🇪 Danke", "🇮🇹 Grazie", "🇵🇹 Obrigado", "🇳🇱 Dank je", "🇬🇷 Efcharistó"],
};

const HAY_GRACIAS = /^\s*(?:gracias|hola|frases|thanks|hello)(?:\s+([a-z]{3}))?\s*$/i;

function leerGracias(texto) {
  const m = String(texto ?? "").match(HAY_GRACIAS);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !FRASES[code] ? null : { code };
}

function textoGracias(code) {
  const frases = FRASES[code];
  if (!frases) return "";
  const inicio = `${banderaDivisa(code)} 💬`;
  if (code === "EUR") return `${inicio} 🙏 ${frases.join(" · ")}`;
  if (frases === idiomaActual()) return `${inicio} ${tr(`gracias.${frases}`)}`;
  const lista = typeof frases === "string" ? (frases === "es" ? ESPANOL : INGLES) : frases;
  const [hola, gracias, cuenta] = lista;
  return `${inicio} 👋 ${hola} · 🙏 ${gracias} · 🧾 ${cuenta}`;
}

// "cd conducir": por qué lado se va y si hace falta el permiso internacional.
// Fuera del Espacio Económico Europeo, Suiza y Reino Unido digo que lo lleves
// siempre: hay sitios que no lo piden, pero en un control te ahorra el lío.
const POR_LA_IZQUIERDA = new Set(["GBP", "JPY", "AUD", "NZD", "HKD", "SGD", "MYR", "IDR", "INR", "THB", "ZAR", "KES", "LKR", "NPR"]);
const CARNE_EUROPEO = new Set(["EUR", "GBP", "CHF", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "ISK", "RON"]);

const HAY_CONDUCIR = /^\s*(?:conducir|conduce|coche|drive|driving)(?:\s+([a-z]{3}))?\s*$/i;

function leerConducir(texto) {
  const m = String(texto ?? "").match(HAY_CONDUCIR);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !isValidCode(code) ? null : { code };
}

function textoConducir(code) {
  if (!isValidCode(code)) return "";
  const partes = [tr(POR_LA_IZQUIERDA.has(code) ? "conducir.izquierda" : "conducir.derecha")];
  // Irlanda, Malta y Chipre van por la izquierda aunque tengan el euro.
  if (code === "EUR") partes.push(tr("conducir.euro"));
  partes.push(tr(CARNE_EUROPEO.has(code) ? "conducir.carne" : "conducir.permiso"));
  return `${banderaDivisa(code)} 🚗 ${partes.join(" · ")}`;
}

function textoEnchufe(e) {
  if (!e) return "";
  const partes = [
    `${banderaDivisa(e.code)} ${tr("enchufe.tipo", { tipos: e.tipos.join("/") })} · ${e.voltios.join("/")} V`,
  ];
  if (e.code === "EUR") partes.push(tr("enchufe.euro"));
  if (e.entra !== null) partes.push(tr(e.entra ? "enchufe.entra" : "enchufe.adaptador"));
  if (e.otroVoltaje) partes.push(tr("enchufe.voltaje"));
  return partes.join(" · ");
}

// Los billetes que de verdad se ven por la calle. Los de 500 € o 2.000 yenes
// existen, pero nadie paga con ellos.
const BILLETES = {
  EUR: [5, 10, 20, 50, 100, 200], USD: [1, 5, 10, 20, 50, 100], GBP: [5, 10, 20, 50],
  JPY: [1000, 5000, 10000], CHF: [10, 20, 50, 100, 200], CAD: [5, 10, 20, 50, 100],
  AUD: [5, 10, 20, 50, 100], CNY: [1, 5, 10, 20, 50, 100], MXN: [20, 50, 100, 200, 500, 1000],
  BRL: [2, 5, 10, 20, 50, 100, 200], SEK: [20, 50, 100, 200, 500], NOK: [50, 100, 200, 500, 1000],
  DKK: [50, 100, 200, 500, 1000], PLN: [10, 20, 50, 100, 200, 500], TRY: [5, 10, 20, 50, 100, 200],
  CZK: [100, 200, 500, 1000, 2000, 5000], HKD: [10, 20, 50, 100, 500, 1000],
  HUF: [500, 1000, 2000, 5000, 10000, 20000], IDR: [1000, 2000, 5000, 10000, 20000, 50000, 100000],
  ILS: [20, 50, 100, 200], INR: [10, 20, 50, 100, 200, 500], ISK: [500, 1000, 5000, 10000],
  KRW: [1000, 5000, 10000, 50000], MYR: [1, 5, 10, 20, 50, 100], NZD: [5, 10, 20, 50, 100],
  PHP: [20, 50, 100, 200, 500, 1000], RON: [1, 5, 10, 50, 100, 200], SGD: [2, 5, 10, 50, 100],
  THB: [20, 50, 100, 500, 1000], ZAR: [10, 20, 50, 100, 200],
};

// "cd billetes jpy": los de allí y lo que vale cada uno en la tuya, para no
// tener que pensarlo con el billete en la mano.
const HAY_BILLETES = /^\s*(?:billetes?|banknotes?|bills?)(?:\s+([a-z]{3}))?\s*$/i;

function leerBilletes(texto) {
  const m = String(texto ?? "").match(HAY_BILLETES);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !isValidCode(code) ? null : { code };
}

function textoBilletes(code, tuya = null, tasa = null) {
  const billetes = BILLETES[code];
  if (!billetes) return "";
  const enteros = numeros({ maximumFractionDigits: 0 });
  const conTasa = tuya && tuya !== code && Number.isFinite(tasa) && tasa > 0;
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const lista = billetes.map((b) => (conTasa ? `${enteros.format(b)} ≈ ${dinero.format(b * tasa)}` : enteros.format(b)));
  return `${banderaDivisa(code)} ${tr("billetes.titulo")}: ${lista.join(" · ")} ${conTasa ? tuya : code}`;
}

const PAGOS_MAX = 3;

// Con qué puedes pagar: lo justo hacia arriba con cada billete (37,20 € son
// 40 con billetes de 5, 10 o 20; 50 con uno de 50…). Lo exacto no sale, que
// ahí no hay vuelta.
function pagosPosibles(cantidad, code) {
  const billetes = BILLETES[code];
  if (!billetes || !Number.isFinite(cantidad) || cantidad <= 0) return [];
  const pagos = billetes.map((b) => Math.ceil(cantidad / b - 1e-9) * b).filter((p) => p > cantidad + 1e-9);
  return [...new Set(pagos)].sort((a, b) => a - b).slice(0, PAGOS_MAX);
}

// Para pagarlo justo: de mayor a menor, cada billete las veces que quepa, y lo
// que no llega al más pequeño va en monedas. Con estos billetes tomar siempre
// el más grande que cabe ya da los menos posibles.
function pagoJusto(cantidad, code) {
  const billetes = BILLETES[code];
  if (!billetes || !Number.isFinite(cantidad) || cantidad <= 0) return null;
  let resto = Math.round(cantidad * 100);
  const montones = [];
  for (const b of [...billetes].reverse()) {
    const n = Math.floor(resto / (b * 100));
    if (n > 0) montones.push({ valor: b, n });
    resto -= n * b * 100;
  }
  return { billetes: montones, monedas: resto / 100 };
}

const vuelta = (cantidad, pago) => Math.round((pago - cantidad) * 100) / 100;

function leerCuenta(guardado) {
  const { propina, personas } = guardado ?? {};
  return {
    propina: Number.isFinite(propina) && propina >= 0 && propina <= PROPINA_MAX
      ? redondearComision(propina) : CUENTA_POR_DEFECTO.propina,
    personas: Number.isInteger(personas) && personas >= 1 && personas <= PERSONAS_MAX
      ? personas : CUENTA_POR_DEFECTO.personas,
    // Los guardados de antes no lo traen: sin redondear, como estaban.
    redondear: guardado?.redondear === true,
  };
}

// Hacia arriba: mejor que en la mesa sobre un céntimo a que falte. El margen
// es para que 10,00 no se vaya a 10,01 por los decimales del ordenador.
const alCentimo = (n) => Math.ceil(n * 100 - 1e-6) / 100;

// A la unidad hasta 999; con divisas pequeñas, a la decena o la centena, que
// redondear 2.347 yenes a 2.348 no le ahorra nada a nadie.
function redondoHaciaArriba(n) {
  const paso = 10 ** Math.max(0, Math.floor(Math.log10(n)) - 2);
  return Math.ceil(n / paso - 1e-9) * paso;
}

// La propina va sobre la cuenta tal cual, y la comisión sobre lo que te cobran
// después en tu divisa, igual que en el resto del popup.
function repartirCuenta(cantidad, rate, { propina, personas, redondear = false }, comision = 0) {
  if (!Number.isFinite(cantidad) || cantidad <= 0) return null;
  const total = cantidad * (1 + propina / 100);
  const conTasa = Number.isFinite(rate) && rate > 0;
  const tuyo = conTasa ? conComision(total * rate, comision) : null;
  if (redondear) {
    const cadaUno = redondoHaciaArriba(total / personas);
    return {
      propina: total - cantidad,
      total,
      cadaUno,
      // Lo que se deja de más al redondear, que acaba siendo propina.
      sobra: cadaUno * personas - total,
      totalTuyo: tuyo,
      cadaUnoTuyo: conTasa ? alCentimo(conComision(cadaUno * rate, comision)) : null,
    };
  }
  return {
    propina: total - cantidad,
    total,
    cadaUno: alCentimo(total / personas),
    sobra: 0,
    totalTuyo: tuyo,
    cadaUnoTuyo: tuyo === null ? null : alCentimo(tuyo / personas),
  };
}

// Para pegarlo en el grupo de la cena: lo que paga cada uno, en negrita, que es
// lo único que se lee. Lo de tu divisa solo si es otra.
function cuentaParaCompartir(r, from, to, { propina, personas }) {
  if (!r) return "";
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const texto = [`*🧾 ${tr("cuenta.compartir.total", { total: `${dinero.format(r.total)} ${from}` })}*`];
  if (propina > 0) {
    texto.push(tr("cuenta.compartir.propina", {
      cuenta: dinero.format(r.total - r.propina),
      propina: dinero.format(r.propina),
      pct: tr("pct", { n: numeros({ maximumFractionDigits: 2 }).format(propina) }),
    }));
  }
  if (personas > 1) texto.push(`*👥 ${tr("cuenta.compartir.cadaUno", { cada: `${dinero.format(r.cadaUno)} ${from}`, n: personas })}*`);
  const tuyo = personas > 1 ? r.cadaUnoTuyo : r.totalTuyo;
  if (tuyo != null && to !== from) texto.push(`_≈ ${dinero.format(tuyo)} ${to}_`);
  return texto.join("\n");
}

// Lo que pagas tú, para el viaje: tu parte con la propina dentro. Va a comida,
// que una cuenta a medias casi siempre es de cenar; si no, se cambia con un clic.
function gastoDeLaCuenta(r, { id, from, to, rate, pago, comision, cuando, concepto }) {
  if (!r || !Number.isFinite(rate) || rate <= 0) return null;
  const suya = comisionDelPago(pago, comision);
  return crearGasto({
    id, from, to, cuando, concepto, pago,
    cantidad: r.cadaUno,
    valor: alCentimo(conComision(r.cadaUno * rate, suya)),
    categoria: "comida",
    comision: suya,
  });
}

// Hasta un 1 % es lo que cobra una buena tarjeta; del 7 % para arriba ya es
// tarifa de aeropuerto.
const MARGENES = [
  { hasta: 0.01, veredicto: "bien" },
  { hasta: 0.03, veredicto: "normal" },
  { hasta: 0.07, veredicto: "caro" },
  { hasta: Infinity, veredicto: "timo" },
];

// En la ventanilla igual pone "1 EUR = 1,12 USD" que "1 USD = 0,89 EUR", así
// que me quedo con la lectura que más se parezca a la real. Si empatan, la del par.
function tasaOfrecida(numero, real) {
  if (!Number.isFinite(numero) || numero <= 0 || !Number.isFinite(real) || real <= 0) return null;
  const directa = Math.abs(Math.log(numero / real));
  const alReves = Math.abs(Math.log(numero * real));
  return alReves < directa ? { tasa: 1 / numero, invertida: true } : { tasa: numero, invertida: false };
}

// La casa siempre gana, así que hacia dónde se aparta de la real dice qué haces:
// por debajo te dan menos de lo tuyo (vendes), por encima pagas más (compras).
function analizarCambio(numero, real, cantidad, comision = 0) {
  const ofrecida = tasaOfrecida(numero, real);
  if (!ofrecida || !Number.isFinite(cantidad) || cantidad < 0) return null;
  const { tasa, invertida } = ofrecida;
  const vendes = tasa <= real;
  const margen = vendes ? 1 - tasa / real : 1 - real / tasa;
  // La comisión de la tarjeta se cuenta sobre lo justo, no sobre lo que pagas:
  // para comparar paso el margen a esa misma cuenta.
  const sobrecoste = margen / (1 - margen);
  // 1 - 0,99 no da 0,01 justo, da 0,010000000000000009: sin la holgura un 1 %
  // exacto salía "normal".
  const HOLGURA = 1e-9;
  return {
    tasa,
    invertida,
    margen,
    veredicto: MARGENES.find((m) => margen <= m.hasta + HOLGURA).veredicto,
    sentido: vendes ? "vendes" : "compras",
    justo: cantidad * real,
    ofrecido: cantidad * tasa,
    perdida: cantidad * Math.abs(tasa - real),
    tarjeta: comision > 0 ? (sobrecoste > comision / 100 + HOLGURA ? "tarjeta" : "aqui") : null,
  };
}

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
  [/€/, "EUR"], [/£/, "GBP"], [/¥|円/, "JPY"], [/₺/, "TRY"], [/zł/, "PLN"],
  [/₹/, "INR"], [/₩/, "KRW"], [/₪/, "ILS"], [/฿/, "THB"], [/₱/, "PHP"],
  // Kč llega sin el acento de la c porque normalizar lo quita.
  [/\bkc\b/, "CZK"], [/\brp\b/, "IDR"], [/\brm\b/, "MYR"],
  // Un símbolo es más fiable que una palabra: "real estate $500" son dólares.
  [/\$/, "USD"],
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

function divisaDe(texto) {
  // Un código ISO gana a cualquier símbolo, pero solo en mayúsculas: en
  // minúscula "try it for $5" salía en liras turcas.
  for (const { code } of CURRENCIES) {
    if (new RegExp(`\\b${code}\\b`).test(texto)) return code;
  }
  const t = normalizar(texto);
  for (const [patron, code] of PISTAS) {
    if (patron.test(t)) return code;
  }
  return null;
}

// Los espacios solo cuentan como separador si detrás van tres cifras justas:
// así "20 30" es un 20 y no un 2030.
const NUMERO = /\d{1,3}(?:[\s  '.,]\d{3})+(?:[.,]\d{1,2})?(?!\d)|\d+(?:[.,]\d+)?/;

function leerSeleccion(texto) {
  if (typeof texto !== "string") return null;
  const hallado = texto.match(NUMERO);
  if (!hallado) return null;
  const cantidad = leerNumero(hallado[0]);
  if (cantidad === null) return null;
  return { cantidad, divisa: divisaDe(texto) };
}

// Varios precios seleccionados, como la lista de la compra de una web: se suman
// si van en la misma divisa. Con dos distintas no sé sumarlos sin otra tasa, y
// me quedo con el primero, como siempre.
function sumarSeleccion(texto) {
  const precios = buscarPrecios(texto);
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

// Para la página entera no vale cualquier número como en la selección: aquí
// solo cuenta si lleva la divisa pegada, delante o detrás. Los símbolos largos
// primero, que si no "US$" se quedaba en "$".
const CODIGOS = CURRENCIES.map((c) => c.code).filter((c) => !CODIGOS_QUE_SON_PALABRA.has(c)).join("|");
const DIVISA_DELANTE = `R\\$|US\\$|MX\\$|CA?\\$|AU?\\$|HK\\$|NZ\\$|S\\$|CN¥|[$€£¥₹₩₪฿₱₺]|\\b(?:${CODIGOS})\\b`;
const DIVISA_DETRAS = `[$€£¥₹₩₪฿₱₺円元]|zł|Kč|\\b(?:${CODIGOS})\\b|\\b[Ee]uros?\\b`;
// Detrás de una letra o de otra cifra no empieza un precio: "A4 €" no son 4 €.
const PRECIO = new RegExp(
  `(${DIVISA_DELANTE})\\s?(${NUMERO.source})|(?<![\\w.,])(${NUMERO.source})\\s?(${DIVISA_DETRAS})`,
  "g",
);

function buscarPrecios(texto) {
  if (typeof texto !== "string") return [];
  const precios = [];
  for (const m of texto.matchAll(PRECIO)) {
    const cantidad = leerNumero(m[2] ?? m[3]);
    const divisa = divisaDe(m[1] ?? m[4]);
    if (cantidad > 0 && divisa) precios.push({ inicio: m.index, fin: m.index + m[0].length, cantidad, divisa });
  }
  return precios;
}

// Hay tiendas que parten el precio en trozos ("$" "49" "." "99"), cada uno en
// su etiqueta. Juntos solo me valen si el texto entero es un precio y nada más.
function precioEntero(texto) {
  const limpio = String(texto ?? "").trim();
  const precios = buscarPrecios(limpio);
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

// Diez: más y ya no es "lo último que convertí", es un registro que nadie mira.
const HISTORIAL_MAX = 10;

const esEntradaBuena = (e) => Boolean(e) && isValidCode(e.from) && isValidCode(e.to)
  && Number.isFinite(e.cantidad) && Number.isFinite(e.resultado) && Number.isFinite(e.cuando);

function leerHistorial(guardado) {
  if (!Array.isArray(guardado)) return [];
  return guardado.filter(esEntradaBuena).slice(0, HISTORIAL_MAX);
}

// Si vuelves a convertir lo mismo no sale dos veces: sube arriba con la hora
// nueva. El resultado se guarda tal cual salió, con la tasa de aquel día.
function apuntarConversion(lista, entrada) {
  if (!esEntradaBuena(entrada) || entrada.cantidad <= 0) return lista;
  const { from, to, cantidad, resultado, cuando } = entrada;
  const otra = (e) => !(e.from === from && e.to === to && e.cantidad === cantidad);
  return [{ from, to, cantidad, resultado, cuando }, ...lista.filter(otra)].slice(0, HISTORIAL_MAX);
}

// No llevan id: el par y la cantidad ya no se repiten, apuntarConversion se encarga.
function quitarConversion(lista, { from, to, cantidad }) {
  return lista.filter((e) => !(e.from === from && e.to === to && e.cantidad === cantidad));
}

// Los días van por calendario y no de 24 en 24 horas: lo de anoche a las once
// es "ayer" aunque sean las nueve de la mañana.
function haceCuanto(cuando, ahora = Date.now()) {
  const min = Math.floor((ahora - cuando) / 60000);
  if (min < 1) return tr("hace.ahora");
  if (min < 60) return tr("hace.min", { n: min });
  const dia = (t) => new Date(t).setHours(0, 0, 0, 0);
  const dias = Math.round((dia(ahora) - dia(cuando)) / 86400000);
  if (dias === 0) return tr("hace.horas", { n: Math.floor(min / 60) });
  if (dias === 1) return tr("hace.ayer");
  if (dias < 7) return tr("hace.dias", { n: dias });
  return fechaCorta(isoLocal(new Date(cuando)), new Date(ahora).getFullYear());
}

// Para darte cuenta de que se te ha pasado apuntar algo. Antes de una hora no
// lo digo: acabas de apuntar y no hay nada que recordar.
function ultimoDeHoy(gastos, ahora = Date.now()) {
  const hoyIso = isoLocal(new Date(ahora));
  // Las noches de hotel van a días que aún no han llegado: esas no cuentan.
  const deHoy = gastos.filter((g) => g.cuando <= ahora && isoLocal(new Date(g.cuando)) === hoyIso);
  if (deHoy.length === 0) return null;
  const ultimo = Math.max(...deHoy.map((g) => g.cuando));
  return ahora - ultimo >= 3600000 ? ultimo : null;
}

// Doscientos dan para un viaje largo comiendo fuera todos los días; más y el
// almacenamiento se llena de cafés de hace un año.
const GASTOS_MAX = 200;
const CONCEPTO_MAX = 40;

// Pocas y gordas: con más, elegir cuesta más que apuntar el gasto.
const CATEGORIAS = ["comida", "transporte", "alojamiento", "ocio", "compras", "otros"];
const CATEGORIA_POR_DEFECTO = "otros";

// Las tuyas, además de las seis: "Buceo", "Regalos". Tres como mucho, que con
// más el abanico no cabe en el popup. El gasto guarda el id y no el nombre,
// así cambiarle el nombre no toca ningún gasto.
const CATEGORIAS_PROPIAS_MAX = 3;
const NOMBRE_CATEGORIA_MAX = 14;
const ID_PROPIA = /^p-[a-z0-9]{1,16}$/;

// Vale por la forma y no por la lista: si el gasto llega antes que la lista
// (otra pestaña, una copia a medias), no lo mando a "otros" para siempre.
const esCategoria = (c) => CATEGORIAS.includes(c) || (typeof c === "string" && ID_PROPIA.test(c));

function leerCategoriasPropias(guardado) {
  if (!Array.isArray(guardado)) return [];
  const vistos = new Set();
  return guardado
    .filter((c) => c && ID_PROPIA.test(c.id) && !vistos.has(c.id) && vistos.add(c.id))
    .map((c) => ({ id: c.id, nombre: String(c.nombre ?? "").replace(/\s+/g, " ").trim().slice(0, NOMBRE_CATEGORIA_MAX) }))
    .filter((c) => c.nombre)
    .slice(0, CATEGORIAS_PROPIAS_MAX);
}

// Como el idioma: cada página la pone al cargar, y los nombres salen de aquí.
let categoriasPropias = [];
function ponerCategoriasPropias(guardado) {
  categoriasPropias = leerCategoriasPropias(guardado);
  return categoriasPropias;
}

const todasCategorias = () => [...CATEGORIAS, ...categoriasPropias.map((c) => c.id)];
const propia = (c) => categoriasPropias.find((p) => p.id === c);

// La que ya no está sale como "Otros", que es donde acabaría.
function nombreCategoria(c) {
  if (CATEGORIAS.includes(c)) return tr(`cat.${c}`);
  return propia(c)?.nombre ?? tr(`cat.${CATEGORIA_POR_DEFECTO}`);
}

const emojiCategoria = (c) => EMOJI_CATEGORIA[c] ?? (propia(c) ? "🏷️" : EMOJI_CATEGORIA[CATEGORIA_POR_DEFECTO]);

// Si ya hay una que se llama igual, sea tuya o de las seis, no hace falta otra.
function crearCategoriaPropia(lista, { id, nombre }) {
  const actuales = leerCategoriasPropias(lista);
  const [nueva] = leerCategoriasPropias([{ id, nombre }]);
  if (!nueva || actuales.length >= CATEGORIAS_PROPIAS_MAX || actuales.some((c) => c.id === id)) return actuales;
  const clave = normalizar(nueva.nombre);
  const repetida = actuales.some((c) => normalizar(c.nombre) === clave) || CATEGORIAS.some((c) => normalizar(tr(`cat.${c}`)) === clave);
  return repetida ? actuales : [...actuales, nueva];
}

const quitarCategoriaPropia = (lista, id) => leerCategoriasPropias(lista).filter((c) => c.id !== id);

// Al quitar una, sus gastos, sus pendientes y su tope pasan a "otros", en
// todos los viajes, también los archivados. Si "otros" ya tenía tope, se suman.
function sinCategoria(viajes, id) {
  const cambiar = (v) => {
    const gastos = v.gastos.map((g) => (g.categoria === id ? { ...g, categoria: CATEGORIA_POR_DEFECTO } : g));
    const pendientes = v.pendientes?.map((p) => (p.categoria === id ? { ...p, categoria: CATEGORIA_POR_DEFECTO } : p));
    const empresa = v.empresa?.map((g) => (g.categoria === id ? { ...g, categoria: CATEGORIA_POR_DEFECTO } : g));
    let presupuesto = v.presupuesto;
    const tope = presupuesto?.categorias?.[id];
    if (tope) {
      const { [id]: _, ...resto } = presupuesto.categorias;
      const categorias = { ...resto, [CATEGORIA_POR_DEFECTO]: (resto[CATEGORIA_POR_DEFECTO] ?? 0) + tope };
      presupuesto = { ...presupuesto, categorias };
    }
    return { ...v, gastos, presupuesto, ...(pendientes ? { pendientes } : {}), ...(empresa ? { empresa } : {}) };
  };
  const nuevos = { ...viajes, lista: viajes.lista.map(cambiar) };
  return viajes.archivados ? { ...nuevos, archivados: viajes.archivados.map(cambiar) } : nuevos;
}

// El transporte va antes que la comida para que "barco" no se quede en "bar".
// Las raíces cortas van con \b detrás, que si no "bar" se comía "barato".
const PISTAS_CATEGORIA = [
  ["transporte", /\b(taxi|uber|cabify|bolt|lyft|metro\b|bus\b|autobus|tren|train|vuelo|avion|flight|barco|ferry|gasolina|fuel|parking|aparcamiento|peaje|toll|bici|bike|alquiler de coche|car rental)/],
  ["alojamiento", /\b(hotel|hostal|hostel|airbnb|apartamento|alojamiento|booking|motel|camping|habitacion|room\b)/],
  ["comida", /\b(cena|comida|almuerzo|desayuno|cafe|restaurante|bar\b|tapas|cerveza|vino|pizza|super\b|supermercado|helado|menu|dinner|lunch|breakfast|coffee|food|restaurant|beer|wine|groceries|snack|brunch)/],
  ["ocio", /\b(museo|museum|entrada|ticket|concierto|concert|cine|cinema|tour|excursion|parque|park|teatro|theat|discoteca|club|espectaculo|show\b|visita)/],
  ["compras", /\b(tienda|compra|ropa|regalo|souvenir|recuerdo|shop|gift|clothes|zapat|shoes|farmacia|pharmacy|mercado|market)/],
];

function adivinarCategoria(concepto) {
  const texto = normalizar(String(concepto ?? ""));
  return PISTAS_CATEGORIA.find(([, patron]) => patron.test(texto))?.[0] ?? null;
}

// Los conceptos que ya has usado: el más repetido primero y, si empatan, el
// último. Me quedo con la categoría del último, que si la cambiaste a mano es esa.
function conceptosUsados(gastos) {
  const vistos = new Map();
  for (const g of gastos) {
    const concepto = limpiarConcepto(g.concepto);
    if (!concepto) continue;
    const clave = normalizar(concepto);
    const visto = vistos.get(clave);
    if (!visto) vistos.set(clave, { concepto, categoria: g.categoria, veces: 1, cuando: g.cuando });
    else {
      visto.veces += 1;
      if (g.cuando > visto.cuando) Object.assign(visto, { concepto, categoria: g.categoria, cuando: g.cuando });
    }
  }
  return [...vistos.values()]
    .sort((a, b) => b.veces - a.veces || b.cuando - a.cuando)
    .map(({ concepto, categoria }) => ({ concepto, categoria: categoriaBuena(categoria) }));
}

// Con una letra sola saldría siempre lo mismo, así que espero a la segunda.
function completarConcepto(texto, usados) {
  const escrito = String(texto ?? "");
  if (escrito.trim().length < 2) return null;
  const clave = normalizar(escrito);
  const hallado = usados.find((u) => u.concepto.length > escrito.length && normalizar(u.concepto).startsWith(clave));
  if (!hallado) return null;
  return { ...hallado, resto: hallado.concepto.slice(escrito.length) };
}

// En efectivo ya cambiaste antes en la casa de cambio: el banco no cobra nada.
// Los de antes no lo dicen, y llevan la comisión dentro, así que son con tarjeta.
const PAGOS = ["tarjeta", "efectivo"];
const PAGO_POR_DEFECTO = "tarjeta";
const leerPago = (pago) => (PAGOS.includes(pago) ? pago : PAGO_POR_DEFECTO);
const comisionDelPago = (pago, comision) => (pago === "efectivo" ? 0 : comision);

// Una tarjeta es un nombre y su comisión, y la elegida es la que tiene la comisión
// puesta: así la web, la barra y los gastos siguen leyendo un solo número.
const TARJETAS_MAX = 4;
const NOMBRE_TARJETA_MAX = 14;

// Dos al mismo porcentaje no: serían la misma cuenta y no sabría cuál llevas.
function anadirTarjeta(lista, nombre, comision) {
  const limpio = String(nombre ?? "").replace(/\s+/g, " ").trim().slice(0, NOMBRE_TARJETA_MAX);
  if (!limpio || typeof comision !== "number" || !(comision >= 0 && comision <= COMISION_MAX) || lista.length >= TARJETAS_MAX) return null;
  const pct = redondearComision(comision);
  if (lista.some((t) => t.comision === pct || normalizar(t.nombre) === normalizar(limpio))) return null;
  return [...lista, { nombre: limpio, comision: pct }];
}

function leerTarjetas(guardado) {
  if (!Array.isArray(guardado)) return [];
  return guardado.reduce((lista, t) => anadirTarjeta(lista, t?.nombre, t?.comision) ?? lista, []);
}

const quitarTarjeta = (lista, nombre) => lista.filter((t) => t.nombre !== nombre);

const tarjetaActual = (lista, comision) => lista.find((t) => t.comision === comision) ?? null;

// Con menos de dos, tarjeta y efectivo como siempre. Con la comisión puesta a
// mano no hay ninguna elegida, y empieza por la primera.
function siguientePago({ pago, comision }, tarjetas) {
  if (tarjetas.length < 2) return { pago: pago === "efectivo" ? "tarjeta" : "efectivo", comision };
  if (pago === "efectivo") return { pago: "tarjeta", comision: tarjetas[0].comision };
  const i = tarjetas.findIndex((t) => t.comision === comision);
  return i === tarjetas.length - 1 ? { pago: "efectivo", comision } : { pago: "tarjeta", comision: tarjetas[i + 1].comision };
}

// Por menos de un céntimo no merece la pena decir nada.
function mejorTarjeta(tarjetas, comision, base) {
  if (tarjetas.length < 2 || !(base > 0)) return null;
  const tarjeta = tarjetas.reduce((mejor, t) => (t.comision < mejor.comision ? t : mejor));
  const ahorro = Math.round((conComision(base, comision) - conComision(base, tarjeta.comision)) * 100) / 100;
  return ahorro >= 0.01 ? { tarjeta, ahorro } : null;
}

const categoriaBuena = (c) => (esCategoria(c) ? c : CATEGORIA_POR_DEFECTO);

const esGastoBueno = (g) => Boolean(g) && typeof g.id === "string" && isValidCode(g.from) && isValidCode(g.to)
  // Las devoluciones van en negativo, las dos cifras a la vez.
  && Number.isFinite(g.cantidad) && Number.isFinite(g.valor) && (g.cantidad > 0 ? g.valor >= 0 : g.cantidad < 0 && g.valor <= 0)
  && Number.isFinite(g.cuando) && typeof g.concepto === "string";

// El valor se guarda ya convertido, con la tasa y la comisión de ese día. Si lo
// calculara al enseñarlo, el cambio de hoy me movería lo que gasté hace una semana.
const limpiarConcepto = (concepto) => String(concepto ?? "").replace(/\s+/g, " ").trim().slice(0, CONCEPTO_MAX);

// Quién lo pagó, por su sitio en la lista de gente del viaje. El 0 eres tú y
// no lo guardo: así los gastos de antes y los tuyos quedan como estaban.
const leerPagador = (p) => (Number.isInteger(p) && p > 0 && p < PERSONAS_MAX ? p : 0);

// Quiénes entran en un gasto, cuando no sois todos: el museo de dos de los
// cuatro. Sin esto, entran todos, que es lo que traen los de antes.
function leerEntre(entre) {
  if (!Array.isArray(entre)) return null;
  const buenos = [...new Set(entre.filter((i) => Number.isInteger(i) && i >= 0 && i < PERSONAS_MAX))].sort((a, b) => a - b);
  return buenos.length ? buenos : null;
}

// Con la gente de ahora. Igual que con el pagador, el que ya no está cuenta
// como tú, y si al final entran todos es como no decir nada.
function entreDe(gasto, personas) {
  const n = leerPersonas(personas);
  const entre = leerEntre(gasto.entre);
  if (!entre) return null;
  const ahora = [...new Set(entre.map((i) => (i < n ? i : 0)))];
  return ahora.length < n ? ahora : null;
}

// Lo que cuenta cada uno en un gasto: la pareja, 2; el niño, ½. Solo guardo a
// quien no cuenta 1, así los gastos de antes no cambian.
const PARTES_VALIDAS = [1, 2, 3, 0.5];

function leerPartes(partes) {
  if (!partes || typeof partes !== "object" || Array.isArray(partes)) return null;
  const buenas = Object.entries(partes).filter(([i, p]) => {
    const quien = Number(i);
    return Number.isInteger(quien) && quien >= 0 && quien < PERSONAS_MAX && p !== 1 && PARTES_VALIDAS.includes(p);
  });
  return buenas.length ? Object.fromEntries(buenas) : null;
}

const quienesEntran = (gasto, n) => entreDe(gasto, n) ?? [...Array(n).keys()];

// Si todos cuentan lo mismo, aunque sea 2, es a partes iguales.
function partesDe(gasto, personas) {
  const n = leerPersonas(personas);
  const guardadas = leerPartes(gasto.partes);
  if (!guardadas) return null;
  const entran = quienesEntran(gasto, n);
  if (new Set(entran.map((i) => guardadas[i] ?? 1)).size < 2) return null;
  return Object.fromEntries(entran.filter((i) => guardadas[i]).map((i) => [i, guardadas[i]]));
}

const esRepartoDesigual = (gasto, n) => Boolean(entreDe(gasto, n) || partesDe(gasto, n));

const textoParte = (p) => (p === 0.5 ? "½" : String(p));

// "Solo Ana y tú": tú al final, que es como se dice.
function fraseEntre(entre, gente, partes = null, todos = false) {
  const conParte = (i, nombre) => (partes?.[i] ? `${nombre} ×${textoParte(partes[i])}` : nombre);
  const nombres = entre.filter((i) => i !== 0).map((i) => conParte(i, nombrePersona(gente, i)));
  if (entre.includes(0)) nombres.push(conParte(0, tr("entre.tu")));
  const lista = new Intl.ListFormat(localeActual(), { type: "conjunction" }).format(nombres);
  return todos ? lista : tr("entre.solo", { nombres: lista });
}

function cambiarEntre(gastos, id, entre, personas, partes = null) {
  const gasto = gastos.find((g) => g.id === id);
  if (!gasto) return gastos;
  const nuevo = entreDe({ entre }, personas);
  const nuevas = partesDe({ entre, partes }, personas);
  if (String(nuevo) === String(entreDe(gasto, personas))
    && JSON.stringify(nuevas) === JSON.stringify(partesDe(gasto, personas))) return gastos;
  return gastos.map((g) => {
    if (g.id !== id) return g;
    const { entre: _, partes: __, ...resto } = g;
    return { ...resto, ...(nuevo ? { entre: nuevo } : {}), ...(nuevas ? { partes: nuevas } : {}) };
  });
}

// Lo que no cabe en el concepto: "pagó Ana", "pedir factura". Una línea.
const NOTA_MAX = 80;
const limpiarNota = (nota) => String(nota ?? "").replace(/\s+/g, " ").trim().slice(0, NOTA_MAX);

function crearGasto({ id, from, to, cantidad, valor, concepto = "", cuando, categoria, pago, comision, pagador, fijo, nota, entre, partes }) {
  // Al céntimo: con la comisión salía 90,5148 y en el CSV se veía la cola.
  const gasto = {
    id, from, to, cantidad, cuando,
    valor: Number.isFinite(valor) ? Math.round(valor * 100) / 100 : valor,
    concepto: limpiarConcepto(concepto),
    categoria: categoriaBuena(categoria),
    pago: leerPago(pago),
    comision: leerComision(comision),
  };
  if (leerPagador(pagador)) gasto.pagador = leerPagador(pagador);
  if (fijo === true) gasto.fijo = true;
  if (limpiarNota(nota)) gasto.nota = limpiarNota(nota);
  if (leerEntre(entre)) gasto.entre = leerEntre(entre);
  if (leerPartes(partes)) gasto.partes = leerPartes(partes);
  return esGastoBueno(gasto) && from !== to ? gasto : null;
}

const esDevolucion = (g) => g.cantidad < 0;

// Lo que te devuelven: la compra que llevas a la tienda, la fianza del piso. Va
// en negativo, así resta del total, del día y de su categoría sin tocar nada
// más. Al cambio de aquel día pero sin la comisión, que el banco no la devuelve.
function devolucionDe(gasto, { id, cuando }) {
  if (!esGastoBueno(gasto) || !(gasto.cantidad > 0)) return null;
  const sinComision = gasto.valor / (1 + leerComision(gasto.comision) / 100);
  const devuelto = crearGasto({
    id, cuando, from: gasto.from, to: gasto.to, cantidad: -gasto.cantidad, valor: -sinComision,
    concepto: gasto.concepto, categoria: gasto.categoria, pago: gasto.pago, comision: 0, pagador: gasto.pagador, entre: gasto.entre, partes: gasto.partes,
  });
  return devuelto && Number.isFinite(gasto.alBce) ? { ...devuelto, alBce: -gasto.alBce } : devuelto;
}

function leerGastos(guardado) {
  if (!Array.isArray(guardado)) return [];
  // Los de antes de las categorías no traen ninguna: la saco del concepto, como
  // al apuntarlos, y si no dice nada van a "otros".
  return guardado.filter(esGastoBueno).slice(0, GASTOS_MAX).map(({ pagador, fijo, nota, entre, partes, alBce, ...g }) => ({
    ...g,
    categoria: esCategoria(g.categoria) ? g.categoria : adivinarCategoria(g.concepto) ?? CATEGORIA_POR_DEFECTO,
    pago: leerPago(g.pago),
    // Los de antes no la guardaban: ya va dentro del valor y no sé cuánta era.
    comision: leerComision(g.comision),
    ...(leerPagador(pagador) ? { pagador: leerPagador(pagador) } : {}),
    ...(fijo === true ? { fijo: true } : {}),
    ...(typeof nota === "string" && limpiarNota(nota) ? { nota: limpiarNota(nota) } : {}),
    ...(leerEntre(entre) ? { entre: leerEntre(entre) } : {}),
    ...(leerPartes(partes) ? { partes: leerPartes(partes) } : {}),
    ...(Number.isFinite(alBce) && Math.sign(alBce) === Math.sign(g.valor) ? { alBce } : {}),
  }));
}

// En qué se va el dinero, solo en la divisa que más suma: mezclar euros con
// dólares en los mismos porcentajes no tiene sentido.
function desglose(gastos) {
  const [principal] = sumarPorDivisa(gastos);
  if (!principal || principal.total <= 0) return [];
  const totales = new Map();
  for (const g of gastos) {
    if (g.to === principal.to) totales.set(g.categoria, (totales.get(g.categoria) ?? 0) + g.valor);
  }
  return [...totales]
    .map(([categoria, total]) => ({ categoria, total, fraccion: total / principal.total, to: principal.to }))
    .filter((d) => d.total > 0)
    .sort((a, b) => b.total - a.total);
}

function apuntarGasto(lista, gasto) {
  if (!esGastoBueno(gasto)) return lista;
  return [gasto, ...lista].slice(0, GASTOS_MAX);
}

// El hotel de cinco noches, uno por noche desde el día que lo pagas. Si no,
// ese día parecería carísimo y la media y la corona se volverían locas.
const NOCHES_MAX = 30;

// Los céntimos que no se reparten justos van a la primera noche: así la suma
// es exacta y no aparece ni se pierde un céntimo.
function repartirCentimos(total, n) {
  const centimos = Math.round(total * 100);
  const base = Math.floor(centimos / n);
  return Array.from({ length: n }, (_, i) => (base + (i < centimos - base * n ? 1 : 0)) / 100);
}

// En céntimos enteros. Los que sobran van a quien más decimales perdió, y si
// empatan, al primero: con todos a 1 sale lo mismo que repartirCentimos.
function repartirPorPartes(centimos, pesos) {
  // Por dos para que el ½ también sea un entero y no se cuelen decimales.
  const enteros = pesos.map((p) => p * 2);
  const suma = enteros.reduce((a, b) => a + b, 0);
  const base = enteros.map((p) => Math.floor((centimos * p) / suma));
  const sobran = centimos - base.reduce((a, b) => a + b, 0);
  const orden = enteros.map((p, i) => ({ i, resto: centimos * p - base[i] * suma }))
    .sort((a, b) => b.resto - a.resto || a.i - b.i);
  orden.slice(0, sobran).forEach(({ i }) => { base[i] += 1; });
  return base;
}

function repartirNoches(gasto, noches) {
  if (!esGastoBueno(gasto) || esDevolucion(gasto) || !Number.isInteger(noches) || noches < 2 || noches > NOCHES_MAX) return [gasto];
  const cantidades = repartirCentimos(gasto.cantidad, noches);
  const valores = repartirCentimos(gasto.valor, noches);
  const alBce = Number.isFinite(gasto.alBce) ? repartirCentimos(gasto.alBce, noches) : null;
  const antes = new Date(gasto.cuando);
  return cantidades.map((cantidad, i) => {
    // La noche delante: el concepto se corta por la derecha en la lista.
    const marca = `${i + 1}/${noches}`;
    return {
      ...gasto,
      id: `${gasto.id}-${i + 1}`,
      cantidad,
      valor: valores[i],
      ...(alBce ? { alBce: alBce[i] } : {}),
      concepto: gasto.concepto ? `${marca} · ${gasto.concepto}`.slice(0, CONCEPTO_MAX) : marca,
      // Con la fecha local y no sumando milisegundos: el día del cambio de hora tiene 23 horas.
      cuando: new Date(antes.getFullYear(), antes.getMonth(), antes.getDate() + i,
        antes.getHours(), antes.getMinutes(), antes.getSeconds(), antes.getMilliseconds()).getTime(),
    };
  });
}

// Lo que se paga una vez y se usa varios días: el coche, el abono del metro, el
// forfait o la eSIM. Por el concepto, que la categoría no basta: un taxi
// también es transporte y no tiene sentido repartirlo.
const PISTAS_POR_DIAS = /\b(alquiler|rent|rental|coche|car\b|moto\b|scooter|bici|bike|abono|pase\b|pass\b|forfait|bono\b|semanal|mensual|weekly|monthly|sim\b|esim|e-sim|wifi|roaming)/;

// "noches" para el alojamiento, como siempre; "dias" para lo demás que dura.
function repartoPorDias(categoria, concepto) {
  if (categoria === "alojamiento") return "noches";
  return PISTAS_POR_DIAS.test(normalizar(String(concepto ?? ""))) ? "dias" : null;
}

function apuntarNoches(lista, noches) {
  const buenas = noches.filter(esGastoBueno);
  if (buenas.length === 0) return lista;
  return [...buenas, ...lista].sort((x, y) => y.cuando - x.cuando).slice(0, GASTOS_MAX);
}

// Lo que sabes que vas a pagar y aún no: el hotel que se paga al salir, la
// cena ya reservada. Va con lo que valía al apuntarlo, y al pagarlo pasa a
// gasto con la tasa y la comisión de ese día.
const PENDIENTES_MAX = 30;

// El día que toca pagarlo. Es opcional: los de antes no lo traen.
const leerVence = (vence) => (esIso(vence) && isoLocal(new Date(`${vence}T12:00:00`)) === vence ? vence : null);

function leerPendientes(guardado) {
  return leerGastos(guardado).filter((p) => p.cantidad > 0).slice(0, PENDIENTES_MAX)
    .map(({ vence, ...p }) => (leerVence(vence) ? { ...p, vence } : p));
}

function apuntarPendiente(lista, pendiente) {
  const buenos = leerPendientes(lista);
  if (!pendiente || !(pendiente.cantidad > 0) || buenos.length >= PENDIENTES_MAX || buenos.some((p) => p.id === pendiente.id)) return buenos;
  return [...buenos, pendiente];
}

const quitarPendiente = (lista, id) => leerPendientes(lista).filter((p) => p.id !== id);

const totalPendiente = (lista, to) => leerPendientes(lista).filter((p) => p.to === to).reduce((suma, p) => suma + p.valor, 0);

// Como un gasto, con la categoría sacada del concepto. Sin comisión: esa se
// pone al pagarlo, que es cuando el banco la cobra.
function crearPendiente({ id, from, to, cantidad, valor, concepto = "", cuando, vence }) {
  if (!(cantidad > 0)) return null;
  const pendiente = crearGasto({ id, from, to, cantidad, valor, concepto, cuando, categoria: adivinarCategoria(limpiarConcepto(concepto)) ?? CATEGORIA_POR_DEFECTO });
  return pendiente && leerVence(vence) ? { ...pendiente, vence } : pendiente;
}

const pagarPendiente = (pendiente, opciones) => repetirGasto(pendiente, opciones);

// Con la fecha vacía se la quita: es lo que manda el "Borrar" del calendario.
function cambiarVence(lista, id, vence) {
  return leerPendientes(lista).map(({ vence: antes, ...p }) => {
    const dia = p.id === id ? leerVence(vence) : antes;
    return dia ? { ...p, vence: dia } : p;
  });
}

// Lo que corre más prisa arriba, y los que no tienen día al final.
const pendientesPorFecha = (lista) => [...leerPendientes(lista)].sort((a, b) => (a.vence ?? "9999").localeCompare(b.vence ?? "9999"));

const tocaPagar = (lista, hoyIso = hoy()) => leerPendientes(lista).filter((p) => p.vence && p.vence <= hoyIso);

function tonoVence(vence, hoyIso = hoy()) {
  const dias = diasHasta(vence, hoyIso) - 1;
  if (dias < 0) return "pasado";
  if (dias === 0) return "hoy";
  return dias <= 3 ? "pronto" : "luego";
}

function textoVence(vence, hoyIso = hoy()) {
  const dias = diasHasta(vence, hoyIso) - 1;
  if (dias === -1) return tr("vence.ayer");
  if (dias < 0) return tr("vence.era", { fecha: fechaCorta(vence) });
  if (dias === 0) return tr("vence.hoy");
  if (dias === 1) return tr("vence.manana");
  return dias < 7 ? tr("vence.dias", { n: dias }) : tr("vence.dia", { fecha: fechaCorta(vence) });
}

// A las nueve, que antes de desayunar no hace falta. Si ese día no abriste Chrome,
// salta el siguiente que lo abras. Con el día en la clave: si lo cambias, vuelve a avisar.
const PENDIENTE_HORA = 9;
const claveAvisoPendiente = (p) => `${p.id}:${p.vence}`;

function tocaPendientes(viajes, avisados, ahora = new Date()) {
  if (ahora.getHours() < PENDIENTE_HORA) return null;
  const ya = new Set(Array.isArray(avisados) ? avisados : []);
  for (const viaje of viajes?.lista ?? []) {
    const pagos = tocaPagar(viaje.pendientes, isoLocal(ahora)).filter((p) => !ya.has(claveAvisoPendiente(p)));
    if (pagos.length) return { viaje, pagos };
  }
  return null;
}

// Solo los que siguen ahí, que si no la lista crecería para siempre.
function avisadosPendientes(avisados, viajes, pagos) {
  const vivos = new Set((viajes?.lista ?? []).flatMap((v) => leerPendientes(v.pendientes).filter((p) => p.vence).map(claveAvisoPendiente)));
  return [...new Set([...(Array.isArray(avisados) ? avisados : []).filter((c) => vivos.has(c)), ...pagos.map(claveAvisoPendiente)])];
}

function mensajePendientes({ viaje, pagos }, hoyIso = hoy()) {
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const nombre = (p) => p.concepto || tr("gastos.sinConcepto");
  const [pago] = pagos;
  const enViaje = (que) => (viaje.nombre ? tr("pendientes.aviso.en", { que, viaje: viaje.nombre }) : que);
  if (pagos.length === 1) {
    const importe = pago.from === pago.to ? `${dinero.format(pago.valor)} ${pago.to}` : `${dinero.format(pago.cantidad)} ${pago.from} ≈ ${dinero.format(pago.valor)} ${pago.to}`;
    return {
      titulo: tr(pago.vence < hoyIso ? "pendientes.aviso.pasado" : "pendientes.aviso.hoy", { concepto: nombre(pago) }),
      cuerpo: enViaje(importe),
    };
  }
  // Si fueran de dos divisas, sumarlas no diría nada.
  const [suma, otra] = sumarPorDivisa(pagos);
  const que = pagos.map(nombre).join(", ");
  return {
    titulo: tr("pendientes.aviso.varios", { n: pagos.length }),
    cuerpo: enViaje(otra ? que : `${que} · ${dinero.format(suma.total)} ${suma.to}`),
  };
}

function quitarGasto(lista, id) {
  return lista.filter((g) => g.id !== id);
}

// El metro de cada mañana: la misma cantidad, pero con la tasa y la comisión de
// hoy. Si no tengo la de hoy para ese par, uso la que tuvo, que es lo más cerca.
// La nota no viaja: "pedir factura" era de aquel, no del de hoy.
function repetirGasto({ nota, ...gasto }, { id, cuando, tasa = null, comision = 0 }) {
  if (!(Number.isFinite(tasa) && tasa > 0)) return crearGasto({ ...gasto, id, cuando });
  const pct = comisionDelPago(gasto.pago, comision);
  const valor = Math.round(conComision(gasto.cantidad * tasa, pct) * 100) / 100;
  return crearGasto({ ...gasto, id, cuando, valor, comision: pct });
}

// La categoría solo la cambio si estaba en "otros": si ya era otra, puede que
// la eligieras tú, y corregir una falta no debería deshacértela.
// El vuelo, el hotel pagado antes de salir, el seguro: cuentan en el total y
// en el presupuesto, pero no son lo que gastas al día y no deben subir la media.
const esFijo = (g) => g.fijo === true;
const delDiaADia = (gastos) => gastos.filter((g) => !esFijo(g));

function marcarFijo(lista, id, fijo) {
  return lista.map((g) => {
    if (g.id !== id || esFijo(g) === fijo) return g;
    const { fijo: _, ...resto } = g;
    return fijo ? { ...resto, fijo: true } : resto;
  });
}

function cambiarNota(lista, id, nota) {
  const limpia = limpiarNota(nota);
  const gasto = lista.find((g) => g.id === id);
  if (!gasto || (gasto.nota ?? "") === limpia) return lista;
  return lista.map((g) => {
    if (g.id !== id) return g;
    const { nota: _, ...resto } = g;
    return limpia ? { ...resto, nota: limpia } : resto;
  });
}

function cambiarConcepto(lista, id, concepto) {
  const limpio = limpiarConcepto(concepto);
  const gasto = lista.find((g) => g.id === id);
  if (!gasto || gasto.concepto === limpio) return lista;
  const categoria = gasto.categoria === CATEGORIA_POR_DEFECTO ? adivinarCategoria(limpio) ?? gasto.categoria : gasto.categoria;
  return lista.map((g) => (g.id === id ? { ...g, concepto: limpio, categoria } : g));
}

// Para el gasto que se te olvidó apuntar. Dejo la hora, así dentro del día
// sigue en su sitio, y el valor: de un día a otro la tasa apenas se mueve y no
// merece otra petición por unos céntimos.
function cambiarDia(lista, id, dia, hoyIso = hoy()) {
  if (!esIso(dia) || dia > hoyIso) return lista;
  const gasto = lista.find((g) => g.id === id);
  if (!gasto || isoLocal(new Date(gasto.cuando)) === dia) return lista;
  const antes = new Date(gasto.cuando);
  const [a, m, d] = dia.split("-").map(Number);
  const cuando = new Date(a, m - 1, d, antes.getHours(), antes.getMinutes(), antes.getSeconds(), antes.getMilliseconds()).getTime();
  // Reordeno porque los días salen en el orden de la lista: si no, el de ayer
  // quedaría arriba de hoy.
  return lista.map((g) => (g.id === id ? { ...g, cuando } : g)).sort((x, y) => y.cuando - x.cuando);
}

// Tienen que estar todas las palabras, en el concepto o en el nombre de la
// categoría: así "comida" encuentra la cena aunque no lo pusieras.
function buscarGastos(gastos, consulta) {
  const palabras = normalizar(String(consulta ?? "")).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return gastos;
  return gastos.filter((g) => {
    const texto = normalizar(`${g.concepto} ${nombreCategoria(g.categoria)} ${g.nota ?? ""}`);
    return palabras.every((p) => texto.includes(p));
  });
}

// El concepto en trozos, marcando lo que coincide con la búsqueda. Normalizo
// letra a letra para que las posiciones casen: "é" sigue ocupando una.
function trozosResaltados(texto, consulta) {
  const palabras = normalizar(String(consulta ?? "")).split(/\s+/).filter(Boolean);
  const plano = [...texto].map((c) => normalizar(c).charAt(0) || c).join("");
  const marcadas = new Array(plano.length).fill(false);
  for (const p of palabras) {
    for (let i = plano.indexOf(p); i !== -1; i = plano.indexOf(p, i + p.length)) marcadas.fill(true, i, i + p.length);
  }
  const trozos = [];
  [...texto].forEach((c, i) => {
    const ultimo = trozos[trozos.length - 1];
    if (ultimo && ultimo.resaltado === marcadas[i]) ultimo.texto += c;
    else trozos.push({ texto: c, resaltado: marcadas[i] });
  });
  return trozos;
}

// Deshacer un "Vaciar": vuelven todos detrás de lo que hayas apuntado entretanto,
// que es más nuevo y va arriba.
function devolverTodos(lista, vaciados) {
  const ids = new Set(lista.map((g) => g.id));
  return [...lista, ...vaciados.filter((g) => esGastoBueno(g) && !ids.has(g.id))].slice(0, GASTOS_MAX);
}

// Al deshacer vuelve a donde estaba, no arriba del todo como uno nuevo.
function devolverGasto(lista, gasto, indice) {
  if (!esGastoBueno(gasto) || lista.some((g) => g.id === gasto.id)) return lista;
  const copia = [...lista];
  copia.splice(Math.min(Math.max(indice, 0), copia.length) || 0, 0, gasto);
  return copia.slice(0, GASTOS_MAX);
}

// Cada viaje con sus gastos y su presupuesto. Con más de ocho el desplegable ya
// no cabe en el popup, y quien quiera guardar viajes viejos tiene el CSV.
const VIAJES_MAX = 8;
const NOMBRE_VIAJE_MAX = 24;

const limpiarNombreViaje = (nombre) => String(nombre ?? "").replace(/\s+/g, " ").trim().slice(0, NOMBRE_VIAJE_MAX);

const viajeVacio = (id, nombre = "", color = COLOR_POR_DEFECTO) => ({ id, nombre: limpiarNombreViaje(nombre), gastos: [], presupuesto: null, cajero: [], personas: 1, color });

// El color de cada viaje, para saber de un vistazo en cuál estás apuntando. Los
// de antes, en el dorado de siempre.
const COLORES_VIAJE = ["oro", "azul", "coral", "jade", "lila", "rosa"];
const COLOR_POR_DEFECTO = "oro";
const leerColorViaje = (c) => (COLORES_VIAJE.includes(c) ? c : COLOR_POR_DEFECTO);

// Al nuevo, el primero que no tenga nadie. Con los seis cogidos, vuelta a empezar.
function colorLibre(lista) {
  const usados = new Set(lista.map((v) => v.color));
  return COLORES_VIAJE.find((c) => !usados.has(c)) ?? COLORES_VIAJE[lista.length % COLORES_VIAJE.length];
}

function siguienteColor(viajes, id) {
  return {
    ...viajes,
    lista: viajes.lista.map((v) => (v.id === id
      ? { ...v, color: COLORES_VIAJE[(COLORES_VIAJE.indexOf(leerColorViaje(v.color)) + 1) % COLORES_VIAJE.length] }
      : v)),
  };
}

// Los viajes de antes no dicen cuántos ibais: uno, que es como se veían.
const leerPersonas = (n) => (Number.isInteger(n) && n >= 1 && n <= PERSONAS_MAX ? n : 1);

// Lo que sale por cabeza en la divisa principal, que es la del total de arriba.
// Si alguno no entra en todo, "por cabeza" ya no es de nadie: va lo tuyo.
function porPersona(gastos, personas) {
  const principal = sumarPorDivisa(gastos)[0];
  if (!principal || leerPersonas(personas) < 2) return null;
  const consumo = consumoGente(gastos, personas);
  if (consumo && !consumo.igual) {
    const [tuyo] = consumo.gente;
    return { total: tuyo.parte, to: principal.to, personas, alDia: tuyo.alDia, tuyo: true };
  }
  const media = mediaPorDia(gastos);
  return { total: principal.total / personas, to: principal.to, personas, alDia: media ? media.media / personas : null };
}

// Lo que le toca a cada uno, no lo que ha pagado: lo de todos a partes iguales
// y lo de unos pocos solo entre ellos. Lo de al día, sin lo pagado aparte y con
// los mismos días que la media de arriba, como el por cabeza.
function consumoGente(gastos, personas) {
  const n = leerPersonas(personas);
  const cuentas = cuentasViaje(gastos, n);
  if (!cuentas) return null;
  const media = mediaPorDia(gastos);
  const diario = media ? cuentasViaje(delDiaADia(gastos), n) : null;
  const total = cuentas.gente.reduce((suma, p) => suma + p.parte, 0);
  return {
    to: cuentas.to,
    igual: !gastos.some((g) => g.to === cuentas.to && esRepartoDesigual(g, n)),
    gente: cuentas.gente.map((p, i) => ({
      parte: p.parte,
      fraccion: total > 0 ? p.parte / total : 0,
      alDia: diario ? diario.gente[i].parte / media.dias : null,
    })),
  };
}

const NOMBRE_PERSONA_MAX = 14;

// Solo los que has escrito; los huecos se quedan vacíos y salen como "Persona 3".
function leerGente(guardado) {
  if (!Array.isArray(guardado)) return [];
  const gente = guardado.slice(0, PERSONAS_MAX)
    .map((n) => String(typeof n === "string" ? n : "").replace(/\s+/g, " ").trim().slice(0, NOMBRE_PERSONA_MAX));
  while (gente.length && !gente.at(-1)) gente.pop();
  return gente;
}

function ponerNombre(gente, i, nombre) {
  if (!Number.isInteger(i) || i < 0 || i >= PERSONAS_MAX) return leerGente(gente);
  const nueva = [...leerGente(gente)];
  while (nueva.length <= i) nueva.push("");
  nueva[i] = nombre;
  return leerGente(nueva);
}

const nombrePersona = (gente, i) => gente?.[i] || (i === 0 ? tr("gente.tu") : tr("gente.persona", { n: i + 1 }));

// La letra del botón. Sin nombre, el número, que "P" serían todos.
function inicialPersona(gente, i) {
  const nombre = gente?.[i];
  if (nombre) return [...nombre][0].toLocaleUpperCase(localeActual());
  return i === 0 ? tr("gente.tuInicial") : String(i + 1);
}

// Quién ha puesto cuánto y quién le debe a quién, en la divisa del total. Si
// bajas la gente, lo que pagó alguien que ya no está cuenta como tuyo.
// Todo en céntimos: la parte de cada uno sale de repartirCentimos y así lo que
// se debe cuadra siempre con lo pagado, sin un céntimo de más ni de menos.
function cuentasViaje(gastos, personas, saldados = []) {
  const n = leerPersonas(personas);
  const principal = sumarPorDivisa(gastos)[0];
  if (!principal || n < 2) return null;
  const pagado = Array(n).fill(0);
  // Los de todos se reparten juntos, como siempre; los de unos pocos, cada
  // grupo por su lado. Así los viajes de antes salen al céntimo igual.
  const grupos = new Map();
  for (const g of gastos) {
    if (g.to !== principal.to) continue;
    const quien = leerPagador(g.pagador);
    const centimos = Math.round(g.valor * 100);
    pagado[quien < n ? quien : 0] += centimos;
    const entre = quienesEntran(g, n);
    const reparto = partesDe(g, n);
    const clave = `${entre.join(",")}|${JSON.stringify(reparto)}`;
    grupos.set(clave, { entre, pesos: entre.map((i) => reparto?.[i] ?? 1), centimos: (grupos.get(clave)?.centimos ?? 0) + centimos });
  }
  const partes = Array(n).fill(0);
  for (const { entre, pesos, centimos } of grupos.values()) {
    repartirPorPartes(centimos, pesos).forEach((c, k) => { partes[entre[k]] += c; });
  }
  const saldo = pagado.map((p, i) => p - partes[i]);

  // Lo ya devuelto mueve el saldo de los dos y nada más, así que si luego
  // cambia un gasto lo que queda se recalcula solo. Si alguien pagó de más,
  // le toca cobrar a él.
  let devuelto = 0;
  const hechos = [];
  for (const s of leerSaldados(saldados)) {
    const de = s.de < n ? s.de : 0;
    const a = s.a < n ? s.a : 0;
    if (s.to !== principal.to || de === a) continue;
    const centimos = Math.round(s.importe * 100);
    saldo[de] += centimos;
    saldo[a] -= centimos;
    devuelto += centimos;
    hechos.push({ ...s, de, a });
  }

  // El que más debe paga al que más tiene que cobrar, hasta que no quede nada:
  // salen como mucho n-1 pagos.
  const deben = saldo.map((s, i) => ({ i, s: -s })).filter((d) => d.s > 0).sort((a, b) => b.s - a.s);
  const cobran = saldo.map((s, i) => ({ i, s })).filter((c) => c.s > 0).sort((a, b) => b.s - a.s);
  const pagos = [];
  let d = 0;
  let c = 0;
  while (d < deben.length && c < cobran.length) {
    const importe = Math.min(deben[d].s, cobran[c].s);
    pagos.push({ de: deben[d].i, a: cobran[c].i, importe: importe / 100 });
    deben[d].s -= importe;
    cobran[c].s -= importe;
    if (deben[d].s === 0) d += 1;
    if (cobran[c].s === 0) c += 1;
  }
  return {
    to: principal.to,
    gente: pagado.map((p, i) => ({ pagado: p / 100, parte: partes[i] / 100, saldo: saldo[i] / 100 })),
    pagos,
    saldados: hechos,
    devuelto: devuelto / 100,
    queda: pagos.reduce((suma, p) => suma + Math.round(p.importe * 100), 0) / 100,
  };
}

// Lo que ya se ha pagado entre vosotros. Lo de antes no lo trae: nada.
function leerSaldados(guardado) {
  if (!Array.isArray(guardado)) return [];
  const vale = (i) => Number.isInteger(i) && i >= 0 && i < PERSONAS_MAX;
  return guardado
    .filter((s) => s && vale(s.de) && vale(s.a) && s.de !== s.a && isValidCode(s.to)
      && Number.isFinite(s.importe) && s.importe > 0 && typeof s.id === "string" && s.id)
    .map(({ id, de, a, importe, to, cuando }) => ({ id, de, a, importe: Math.round(importe * 100) / 100, to, cuando: Number.isFinite(cuando) ? cuando : 0 }));
}

function saldarPago(saldados, { de, a, importe }, to, { id, cuando = Date.now() }) {
  return leerSaldados([...leerSaldados(saldados), { id, de, a, importe, to, cuando }]);
}

const quitarSaldado = (saldados, id) => leerSaldados(saldados).filter((s) => s.id !== id);

function fraseSaldado({ de, a, importe }, gente, to) {
  const valor = `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(importe)} ${to}`;
  if (a === 0) return tr("gente.tePago", { de: nombrePersona(gente, de), valor });
  if (de === 0) return tr("gente.lesPagaste", { a: nombrePersona(gente, a), valor });
  return tr("gente.lePago", { de: nombrePersona(gente, de), a: nombrePersona(gente, a), valor });
}

// Contado desde ti, que eres quien lo lee: "Ana te debe", "le debes a Luis".
function frasePago({ de, a, importe }, gente, to) {
  const valor = `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(importe)} ${to}`;
  if (a === 0) return tr("gente.teDebe", { de: nombrePersona(gente, de), valor });
  if (de === 0) return tr("gente.lesDebes", { a: nombrePersona(gente, a), valor });
  return tr("gente.debe", { de: nombrePersona(gente, de), a: nombrePersona(gente, a), valor });
}

// El mensaje para cobrarle a uno por privado, con lo justo para que lo pueda
// repasar: lo que le toca, lo que puso y lo que ya te dio. Sale de las mismas
// cuentas que la pantalla, así que lo que pone que te debe es lo mismo al céntimo.
const COBRO_GASTOS_MAX = 6;

function mensajeCobro({ nombre, gastos, personas, gente, saldados }, quien) {
  const n = leerPersonas(personas);
  const cuentas = cuentasViaje(gastos, n, saldados);
  const pago = cuentas?.pagos.find((p) => p.de === quien && p.a === 0);
  if (!pago) return "";
  const { to } = cuentas;
  const nf = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dinero = (v) => `${nf.format(v)} ${to}`;
  const suyo = cuentas.gente[quien];
  const total = sumarPorDivisa(gastos)[0].total;
  const delPrincipal = gastos.filter((g) => g.to === to).sort((a, b) => a.cuando - b.cuando);
  const que = (g) => g.concepto || nombreCategoria(g.categoria);
  // Más de seis gastos en un mensaje ya no se leen: el resto va contado.
  const lista = (unos, texto) => {
    const lineas = unos.slice(0, COBRO_GASTOS_MAX).map(texto);
    if (unos.length > COBRO_GASTOS_MAX) lineas.push(tr("cobro.mas", { n: unos.length - COBRO_GASTOS_MAX }));
    return lineas.join(" · ");
  };

  const igual = !delPrincipal.some((g) => esRepartoDesigual(g, n));
  const lineas = [
    `*🧳 ${nombre}*`,
    tr(igual ? "cobro.toca" : "cobro.tocaDe", { nombre: nombrePersona(gente, quien), parte: `*${dinero(suyo.parte)}*`, total: dinero(total), n }),
  ];
  const conEl = delPrincipal.filter((g) => !partesDe(g, n) && entreDe(g, n)?.includes(quien));
  if (conEl.length) {
    lineas.push(`👥 ${tr("cobro.algunos", { gastos: lista(conEl, (g) => tr("cobro.entre", { que: que(g), valor: nf.format(g.valor), n: entreDe(g, n).length })) })}`);
  }
  const aPartes = delPrincipal.filter((g) => partesDe(g, n) && quienesEntran(g, n).includes(quien));
  if (aPartes.length) {
    const cuantas = numeros({ maximumFractionDigits: 1 });
    lineas.push(`⚖️ ${tr("cobro.aPartes", { gastos: lista(aPartes, (g) => {
      const reparto = partesDe(g, n);
      const total = quienesEntran(g, n).reduce((suma, i) => suma + (reparto[i] ?? 1), 0);
      return tr("cobro.parte", { que: que(g), valor: nf.format(g.valor), suyas: cuantas.format(reparto[quien] ?? 1), total: cuantas.format(total) });
    }) })}`);
  }
  // El que ya no está cuenta como tú, igual que en las cuentas.
  const puso = delPrincipal.filter((g) => { const p = leerPagador(g.pagador); return (p < n ? p : 0) === quien; });
  if (puso.length) lineas.push(`💳 ${tr("cobro.puso", { valor: dinero(suyo.pagado), gastos: lista(puso, (g) => `${que(g)} ${nf.format(g.valor)}`) })}`);
  for (const s of cuentas.saldados) {
    if (s.de === quien) lineas.push(`✓ ${s.a === 0 ? tr("cobro.meDiste", { valor: dinero(s.importe) }) : tr("cobro.leDiste", { valor: dinero(s.importe), a: nombrePersona(gente, s.a) })}`);
    else if (s.a === quien) lineas.push(`✓ ${tr("cobro.teDio", { valor: dinero(s.importe), de: nombrePersona(gente, s.de) })}`);
  }
  lineas.push(`💸 *${tr("cobro.meDebes", { valor: dinero(pago.importe) })}*`);
  for (const otro of cuentas.pagos) {
    if (otro.de === quien && otro.a !== 0) lineas.push(tr("cobro.yA", { a: nombrePersona(gente, otro.a), valor: dinero(otro.importe) }));
  }
  return lineas.join("\n");
}

// Si nadie ha marcado otro pagador es que no lo usas: no hay cuentas que contar.
const hayOtrosPagadores = (gastos, personas) => gastos.some((g) => g.pagador > 0 && g.pagador < leerPersonas(personas));

// Los viajes acabados, aparte: no cuentan para los ocho ni salen en el
// desplegable, pero siguen ahí para mirarlos. Cuarenta son años de viajes.
const ARCHIVADOS_MAX = 40;

const leerViaje = (v) => ({
  id: v.id, nombre: limpiarNombreViaje(v.nombre), gastos: leerGastos(v.gastos), presupuesto: leerPresupuesto(v.presupuesto),
  cajero: leerRetiradas(v.cajero), personas: leerPersonas(v.personas), color: leerColorViaje(v.color),
  ...(leerGente(v.gente).length ? { gente: leerGente(v.gente) } : {}),
  ...(leerSaldados(v.saldados).length ? { saldados: leerSaldados(v.saldados) } : {}),
  ...(leerTramos(v.tramos).length ? { tramos: leerTramos(v.tramos) } : {}),
  ...(leerPendientes(v.pendientes).length ? { pendientes: leerPendientes(v.pendientes) } : {}),
  ...(leerGastos(v.empresa).length ? { empresa: leerGastos(v.empresa) } : {}),
});

// Sin archivados no lo guardo: así lo de antes sale igual que siempre.
const conArchivados = ({ archivados: _, ...viajes }, archivados) => (archivados.length ? { ...viajes, archivados } : viajes);

// Antes de los viajes había una sola lista y un presupuesto sueltos: pasan a
// ser el primer viaje, sin nombre, para que nadie pierda lo que tenía.
function leerViajes(guardado, gastosSueltos, presupuestoSuelto) {
  const vistos = new Set();
  const buenos = (lista) => (Array.isArray(lista) ? lista : [])
    .filter((v) => v && typeof v.id === "string" && v.id && !vistos.has(v.id) && vistos.add(v.id));
  const lista = buenos(guardado?.lista).slice(0, VIAJES_MAX).map(leerViaje);
  const archivados = buenos(guardado?.archivados).slice(0, ARCHIVADOS_MAX).map(leerViaje);
  if (lista.length === 0) {
    const id = vistos.has("primero") ? `primero-${vistos.size}` : "primero";
    lista.push({ ...viajeVacio(id), gastos: leerGastos(gastosSueltos), presupuesto: leerPresupuesto(presupuestoSuelto) });
  }
  const activo = lista.some((v) => v.id === guardado?.activo) ? guardado.activo : lista[0].id;
  return conArchivados({ activo, lista }, archivados);
}

const idUsado = (viajes, id) => [...viajes.lista, ...(viajes.archivados ?? [])].some((v) => v.id === id);

const viajeActivo = (viajes) => viajes.lista.find((v) => v.id === viajes.activo);

// El nuevo es al que vas: lo creas para empezar a apuntar en él.
function crearViaje(viajes, id, nombre) {
  const limpio = limpiarNombreViaje(nombre);
  if (!limpio || viajes.lista.length >= VIAJES_MAX || idUsado(viajes, id)) return viajes;
  return { ...viajes, activo: id, lista: [...viajes.lista, viajeVacio(id, limpio, colorLibre(viajes.lista))] };
}

// "Lisboa" → "Lisboa (2)", y si ya está, "Lisboa (3)". Entre paréntesis, que
// "Japón 2026" ya lleva un número. Recorto el nombre para que quepa siempre.
function nombreCopia(nombre, lista) {
  const base = limpiarNombreViaje(nombre).replace(/ \(\d+\)$/, "");
  if (!base) return "";
  const usados = new Set(lista.map((v) => v.nombre));
  for (let n = 2; ; n += 1) {
    const cola = ` (${n})`;
    const nuevo = `${base.slice(0, NOMBRE_VIAJE_MAX - cola.length).trim()}${cola}`;
    if (!usados.has(nuevo)) return nuevo;
  }
}

// El nombre del viaje nuevo, si no escribes otro: el país de la divisa de allí,
// con su bandera. Con el euro no: no dice a qué país vas.
function nombreDeDestino(code, lista = []) {
  if (!isValidCode(code) || code === "EUR") return "";
  const region = code.slice(0, 2);
  const nombres = (style) => new Intl.DisplayNames([localeActual()], { type: "region", style }).of(region);
  // "RAE de Hong Kong (China)" no cabe; el corto se queda en "Hong Kong".
  const largo = nombres("long");
  const pais = /\(|SAR/.test(largo) ? nombres("short") : largo;
  const nombre = limpiarNombreViaje(`${banderaDivisa(code)} ${pais}`);
  return lista.some((v) => v.nombre === nombre) ? nombreCopia(nombre, lista) : nombre;
}

// Para la escapada que repites: el presupuesto y la gente, sin un solo gasto.
// Las fechas del otro ya pasaron, así que empieza hoy y dura lo mismo. Con otro
// color, que si no no sabrías en cuál apuntas.
function duplicarViaje(viajes, id, nuevoId, { nombre = "", hoyIso = hoy() } = {}) {
  const origen = viajes.lista.find((v) => v.id === id);
  if (!origen || viajes.lista.length >= VIAJES_MAX || idUsado(viajes, nuevoId)) return viajes;
  let presupuesto = null;
  if (origen.presupuesto) {
    const dias = Math.max(diasHasta(origen.presupuesto.hasta, inicioDelViaje(origen.presupuesto, origen.gastos, hoyIso)), 1);
    const [a, m, d] = hoyIso.split("-").map(Number);
    presupuesto = { importe: origen.presupuesto.importe, to: origen.presupuesto.to, desde: hoyIso, hasta: isoLocal(new Date(a, m - 1, d + dias - 1)) };
    if (origen.presupuesto.categorias) presupuesto.categorias = { ...origen.presupuesto.categorias };
  }
  const copia = {
    ...viajeVacio(nuevoId, limpiarNombreViaje(nombre) || nombreCopia(origen.nombre, viajes.lista), colorLibre(viajes.lista)),
    presupuesto,
    personas: origen.personas,
    ...(origen.gente?.length ? { gente: origen.gente } : {}),
  };
  return { ...viajes, activo: nuevoId, lista: [...viajes.lista, copia] };
}

function renombrarViaje(viajes, id, nombre) {
  const limpio = limpiarNombreViaje(nombre);
  if (!limpio) return viajes;
  return { ...viajes, lista: viajes.lista.map((v) => (v.id === id ? { ...v, nombre: limpio } : v)) };
}

function elegirViaje(viajes, id) {
  return viajes.lista.some((v) => v.id === id) ? { ...viajes, activo: id } : viajes;
}

// El último no se borra: para dejarlo limpio ya está "Vaciar". Si borras el que
// tenías abierto, pasas al que tenía al lado.
function borrarViaje(viajes, id) {
  const i = viajes.lista.findIndex((v) => v.id === id);
  if (i === -1 || viajes.lista.length <= 1) return viajes;
  const lista = viajes.lista.filter((v) => v.id !== id);
  const activo = viajes.activo === id ? lista[Math.min(i, lista.length - 1)].id : viajes.activo;
  return { ...viajes, activo, lista };
}

// Al archivo, el primero de la lista: el último que acabas es el que buscarás.
// Como al borrar, el último que queda no se va, y si era el abierto pasas al de al lado.
function archivarViaje(viajes, id) {
  const archivados = viajes.archivados ?? [];
  const viaje = viajes.lista.find((v) => v.id === id);
  if (!viaje || viajes.lista.length <= 1 || archivados.length >= ARCHIVADOS_MAX) return viajes;
  return conArchivados(borrarViaje(viajes, id), [viaje, ...archivados]);
}

// Lo sacas para mirarlo o apuntar algo que faltaba: vuelve a la lista y se abre.
function desarchivarViaje(viajes, id) {
  const archivados = viajes.archivados ?? [];
  const viaje = archivados.find((v) => v.id === id);
  if (!viaje || viajes.lista.length >= VIAJES_MAX) return viajes;
  return conArchivados({ ...viajes, activo: id, lista: [...viajes.lista, viaje] }, archivados.filter((v) => v.id !== id));
}

function borrarArchivado(viajes, id) {
  const archivados = viajes.archivados ?? [];
  if (!archivados.some((v) => v.id === id)) return viajes;
  return conArchivados(viajes, archivados.filter((v) => v.id !== id));
}

const todosLosViajes = (viajes) => [...viajes.lista, ...(viajes.archivados ?? [])];

// Para el gasto que apuntaste con el viaje equivocado abierto. Va con su tasa
// y su fecha, como estaba. Si el otro ya tiene 200, no cabe y no se mueve.
// Con el sitio de antes, para que deshacerlo lo deje donde estaba.
function moverGasto(viajes, gastoId, desdeId, aId, indice) {
  const desde = viajes.lista.find((v) => v.id === desdeId);
  const destino = viajes.lista.find((v) => v.id === aId);
  if (!desde || !destino || desde === destino) return viajes;
  const gasto = desde.gastos.find((g) => g.id === gastoId);
  if (!gasto || destino.gastos.length >= GASTOS_MAX || destino.gastos.some((g) => g.id === gastoId)) return viajes;
  return {
    ...viajes,
    lista: viajes.lista.map((v) => {
      if (v === desde) return { ...v, gastos: quitarGasto(v.gastos, gastoId) };
      if (v === destino) return { ...v, gastos: Number.isInteger(indice) ? devolverGasto(v.gastos, gasto, indice) : apuntarGasto(v.gastos, gasto) };
      return v;
    }),
  };
}

function cambiarViaje(viajes, id, cambios) {
  return { ...viajes, lista: viajes.lista.map((v) => (v.id === id ? { ...v, ...cambios } : v)) };
}

// "Japón 2026" → "gastos-japon-2026": sin tildes ni espacios, que algunos
// sistemas los llevan mal en los nombres de archivo. Sin nombre, el de siempre.
function archivoGastos(nombre) {
  const limpio = normalizar(String(nombre ?? "")).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return limpio ? tr("csv.archivoViaje", { nombre: limpio }) : tr("csv.archivoGastos");
}

function resumenViaje(viaje) {
  return { n: viaje.gastos.length, total: sumarPorDivisa(viaje.gastos)[0] ?? null };
}

// Para comparar viajes, lo justo es lo de cada día: una semana en Japón siempre
// suma más que un finde en Lisboa. Cuento del primer día con gastos al último.
// Solo se comparan los de la divisa más repetida; con otra no tengo con qué.
function compararViajes(lista) {
  const filas = lista.map((viaje) => {
    const diarios = delDiaADia(viaje.gastos);
    const total = sumarPorDivisa(diarios)[0];
    if (!total) return { id: viaje.id, media: null };
    const dias = gastosPorDia(diarios).map((d) => d.dia).sort();
    const n = diasHasta(dias[dias.length - 1], dias[0]);
    const [top] = desglose(viaje.gastos);
    return { id: viaje.id, media: total.total / n, to: total.to, dias: n, categoria: top ?? null };
  });
  const veces = new Map();
  for (const f of filas) if (f.media !== null) veces.set(f.to, (veces.get(f.to) ?? 0) + 1);
  const comun = [...veces].sort((a, b) => b[1] - a[1])[0]?.[0];
  const comparables = filas.filter((f) => f.media !== null && f.to === comun);
  const max = Math.max(...comparables.map((f) => f.media));
  const min = Math.min(...comparables.map((f) => f.media));
  return filas.map((f) => {
    if (f.media === null) return f;
    const cuenta = f.to === comun && comparables.length > 1;
    return {
      ...f,
      peso: cuenta ? f.media / max : null,
      // Si todos gastan lo mismo, ninguno es el caro ni el barato.
      extremo: !cuenta || max === min ? null : f.media === max ? "caro" : f.media === min ? "barato" : null,
    };
  });
}

const EMOJI_CATEGORIA = {
  comida: "🍽️", transporte: "🚕", alojamiento: "🏨", ocio: "🎟️", compras: "🛍️", otros: "📌",
};

// Lo que se comenta en el grupo. Con un gasto, el más caro es el total; y con
// dos días, el que más se ve a simple vista en la lista de días.
function destacados(todos, hoyIso = hoy()) {
  const gastos = delDiaADia(todos);
  const [principal] = sumarPorDivisa(gastos);
  if (!principal || gastos.length < 2) return { caro: null, dia: null, barato: null };
  const suyos = gastos.filter((g) => g.to === principal.to);
  const caro = suyos.reduce((max, g) => (g.valor > max.valor ? g : max));
  const dias = gastosPorDia(suyos).map(({ dia, totales }) => ({ dia, total: totales[0].total, to: principal.to }));
  const dia = dias.length >= 3 ? dias.reduce((max, d) => (d.total > max.total ? d : max)) : null;
  // Hoy no cuenta para el barato: a mediodía siempre ganaría, y aún no ha acabado.
  const cerrados = dias.filter((d) => d.dia !== hoyIso);
  const menor = cerrados.length >= 3 ? cerrados.reduce((min, d) => (d.total < min.total ? d : min)) : null;
  const barato = dia && menor && menor.total < dia.total ? menor : null;
  return { caro, dia, barato };
}

// ¿El finde se gasta más? Media por día de cada lado, con los días sin nada
// como cero, que en el viaje estabas igual. Hoy fuera, que aún no ha acabado.
// Por debajo de un 10 % de diferencia no lo cuento: es lo mismo.
const FINDE_MINIMO = 0.1;

function findeContraSemana(todos, hoyIso = hoy()) {
  const gastos = delDiaADia(todos);
  const [principal] = sumarPorDivisa(gastos);
  if (!principal) return null;
  const porDia = new Map();
  for (const g of gastos) {
    const dia = isoLocal(new Date(g.cuando));
    if (g.to === principal.to && dia < hoyIso) porDia.set(dia, (porDia.get(dia) ?? 0) + g.valor);
  }
  const dias = [...porDia.keys()].sort();
  if (dias.length === 0) return null;
  const lados = { finde: { total: 0, dias: 0 }, semana: { total: 0, dias: 0 } };
  const [a, m, d] = dias[0].split("-").map(Number);
  for (let i = 0; i < diasHasta(dias[dias.length - 1], dias[0]); i += 1) {
    const fecha = new Date(a, m - 1, d + i);
    const lado = lados[fecha.getDay() % 6 === 0 ? "finde" : "semana"];
    lado.total += porDia.get(isoLocal(fecha)) ?? 0;
    lado.dias += 1;
  }
  if (lados.finde.dias === 0 || lados.semana.dias === 0) return null;
  const finde = lados.finde.total / lados.finde.dias;
  const semana = lados.semana.total / lados.semana.dias;
  const [mayor, menor] = finde > semana ? [finde, semana] : [semana, finde];
  if (!(menor > 0) || mayor / menor - 1 < FINDE_MINIMO) return null;
  // "Un 590 % más" no se entiende; a partir del doble lo digo en veces.
  const veces = mayor / menor >= 2 ? Math.round(mayor / menor) : null;
  return { gana: finde > semana ? "finde" : "semana", mas: mayor / menor - 1, veces, finde, semana, to: principal.to };
}

// Lo que más se repite: "☕ Café: 12 veces". Con menos de tres no es costumbre.
// "café" y "Cafe" son el mismo, y se escribe como la última vez.
const ESTRELLA_MINIMO = 3;

function conceptoEstrella(gastos) {
  const [principal] = sumarPorDivisa(gastos);
  if (!principal) return null;
  const grupos = new Map();
  for (const g of [...gastos].sort((a, b) => a.cuando - b.cuando)) {
    const clave = normalizar(g.concepto);
    if (!clave || g.to !== principal.to || esDevolucion(g)) continue;
    const grupo = grupos.get(clave) ?? { veces: 0, total: 0 };
    grupos.set(clave, { veces: grupo.veces + 1, total: grupo.total + g.valor, concepto: g.concepto, categoria: g.categoria });
  }
  // A igual número de veces, el que más suma: es del que se habla.
  const [mejor] = [...grupos.values()].sort((a, b) => b.veces - a.veces || b.total - a.total);
  return mejor && mejor.veces >= ESTRELLA_MINIMO ? { ...mejor, to: principal.to } : null;
}

// Para pegarlo en WhatsApp: lo de entre asteriscos sale en negrita, y en
// cualquier otro sitio se lee igual de bien. Los días van del primero al último,
// que es como se cuenta un viaje.
function resumenParaCompartir({ nombre, gastos, presupuesto, personas, gente, saldados }, hoyIso = hoy()) {
  if (gastos.length === 0) return "";
  const dinero = (n, to) => `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ${to}`;
  const sumas = (totales) => totales.map(({ total, to }) => dinero(total, to)).join(" + ");
  const n = gastos.length;

  const lineas = [
    `*🧳 ${nombre}*`,
    tr("compartir.total", { total: `*${sumas(sumarPorDivisa(gastos))}*`, n: n === 1 ? tr("gastos.uno") : tr("gastos.n", { n }) }),
  ];
  const porGasto = mediaPorGasto(gastos);
  if (porGasto) lineas[1] += ` ${tr("compartir.porGasto", { valor: dinero(porGasto.media, porGasto.to) })}`;
  const cabeza = porPersona(gastos, personas);
  if (cabeza?.tuyo) {
    const { gente: partes, to } = consumoGente(gastos, personas);
    const cada = partes.map((p, i) => `${nombrePersona(gente, i)} *${dinero(p.parte, to)}*`).join(" · ");
    lineas.push(tr("compartir.cadaUno", { cada }));
  } else if (cabeza) {
    const datos = { personas: cabeza.personas, valor: dinero(cabeza.total, cabeza.to) };
    lineas.push(cabeza.alDia
      ? tr("compartir.porPersonaDia", { ...datos, dia: dinero(cabeza.alDia, cabeza.to) })
      : tr("compartir.porPersona", datos));
  }
  if (hayOtrosPagadores(gastos, personas)) {
    const cuentas = cuentasViaje(gastos, personas, saldados);
    for (const pago of cuentas.pagos) lineas.push(`💸 ${frasePago(pago, gente, cuentas.to)}`);
    if (cuentas.pagos.length === 0) lineas.push(tr("gente.enPaz"));
  }

  const { caro, dia, barato } = destacados(gastos, hoyIso);
  if (caro) {
    const que = caro.concepto || nombreCategoria(caro.categoria);
    lineas.push(tr("compartir.caro", { que, valor: dinero(caro.valor, caro.to), dia: nombreDia(isoLocal(new Date(caro.cuando)), hoyIso) }));
  }
  if (dia) lineas.push(tr("compartir.diaMas", { dia: nombreDia(dia.dia, hoyIso), valor: dinero(dia.total, dia.to) }));
  if (barato) lineas.push(tr("compartir.diaMenos", { dia: nombreDia(barato.dia, hoyIso), valor: dinero(barato.total, barato.to) }));
  const estrella = conceptoEstrella(gastos);
  if (estrella) {
    lineas.push(tr("compartir.estrella", {
      emoji: emojiCategoria(estrella.categoria),
      que: estrella.concepto, veces: estrella.veces, valor: dinero(estrella.total, estrella.to),
    }));
  }
  const finde = findeContraSemana(gastos, hoyIso);
  if (finde) {
    lineas.push(finde.veces
      ? tr(`compartir.${finde.gana}Veces`, { veces: finde.veces })
      : tr(`compartir.${finde.gana}`, { pct: tr("pct", { n: Math.round(finde.mas * 100) }) }));
  }
  const pagadas = comisionesPagadas(gastos);
  if (pagadas) lineas.push(tr("compartir.comisiones", { valor: dinero(pagadas.total, pagadas.to) }));
  // Solo si hay de las dos: "100 % con tarjeta" no le dice nada a nadie.
  const efectivo = pagadoEnEfectivo(gastos);
  const pctEfectivo = efectivo ? Math.round((efectivo.total / sumarPorDivisa(gastos)[0].total) * 100) : 0;
  if (pctEfectivo > 0 && pctEfectivo < 100) {
    lineas.push(tr("compartir.pago", { tarjeta: tr("pct", { n: 100 - pctEfectivo }), efectivo: tr("pct", { n: pctEfectivo }) }));
  }
  const cambio = cambioDelViaje(gastos);
  if (cambio) lineas.push(tr("compartir.cambio", { tasa: textoCambio(cambio.tasa, cambio.from, cambio.to) }));

  const trozos = desglose(gastos);
  if (trozos.length > 1) {
    lineas.push("", `*${tr("compartir.categorias")}*`);
    for (const { categoria, total, fraccion, to } of trozos) {
      const pct = tr("pct", { n: Math.round(fraccion * 100) });
      lineas.push(`${emojiCategoria(categoria)} ${nombreCategoria(categoria)}: ${dinero(total, to)} (${pct})`);
    }
  }

  const fijos = gastos.filter(esFijo);
  if (fijos.length) lineas.push("", tr("compartir.fijos", { total: sumas(sumarPorDivisa(fijos)) }));
  const dias = gastosPorDia(delDiaADia(gastos));
  if (dias.length > 1) {
    lineas.push("", `*${tr("compartir.dias")}*`);
    for (const { dia, totales } of [...dias].reverse()) lineas.push(`${nombreDia(dia, hoyIso)}: ${sumas(totales)}`);
  }

  const estado = estadoPresupuesto(presupuesto, gastos, hoyIso);
  if (estado) {
    const datos = { gastado: dinero(estado.gastado, presupuesto.to), importe: dinero(presupuesto.importe, presupuesto.to) };
    lineas.push("", estado.queda < 0
      ? tr("compartir.pasado", { ...datos, pasado: dinero(-estado.queda, presupuesto.to) })
      : tr("compartir.queda", { ...datos, queda: dinero(estado.queda, presupuesto.to) }));
  }
  return lineas.join("\n");
}

// En qué se fue cada día. Con un gasto ya lo dice su icono, y si empatan dos
// no elijo ninguna.
function categoriaDelDia(delDia) {
  if (delDia.length < 2) return null;
  const [primera, segunda] = desglose(delDia);
  if (!primera || (segunda && segunda.total === primera.total)) return null;
  return primera;
}

// Si a mitad de viaje cambias de divisa no las mezclo: un total por cada una,
// la que más suma primero.
function sumarPorDivisa(gastos) {
  const totales = new Map();
  for (const g of gastos) totales.set(g.to, (totales.get(g.to) ?? 0) + g.valor);
  return [...totales].map(([to, total]) => ({ to, total })).sort((a, b) => b.total - a.total);
}

// La lista ya va de lo último a lo primero, así que los días salen en ese orden
// sin tener que ordenar nada.
function gastosPorDia(gastos) {
  const dias = new Map();
  for (const g of gastos) {
    const dia = isoLocal(new Date(g.cuando));
    if (!dias.has(dia)) dias.set(dia, []);
    dias.get(dia).push(g);
  }
  return [...dias].map(([dia, lista]) => ({ dia, gastos: lista, totales: sumarPorDivisa(lista) }));
}

// El más caro de cada día, en la divisa que más suma en el viaje. Con uno solo
// no hay con qué compararlo, y si empatan los dos primeros no marco ninguno:
// dos cafés iguales no tienen rey.
function masCarosDelDia(todos) {
  const gastos = delDiaADia(todos);
  const principal = sumarPorDivisa(gastos)[0]?.to;
  const ids = new Set();
  for (const { gastos: delDia } of gastosPorDia(gastos)) {
    const suyos = delDia.filter((g) => g.to === principal).sort((a, b) => b.valor - a.valor);
    if (suyos.length >= 2 && suyos[0].valor > suyos[1].valor) ids.add(suyos[0].id);
  }
  return ids;
}

// Los más caros primero. Los de otra divisa van detrás: 50 USD y 50 EUR no son
// lo mismo y no tengo con qué compararlos. A igual importe, el más reciente.
// Lo que enseña el total a mitad de cuenta. Frena al final, como el resto de
// animaciones, y va al céntimo para que no bailen los decimales.
function cifraEnMarcha(desde, hasta, t) {
  const avance = 1 - (1 - Math.min(Math.max(t, 0), 1)) ** 3;
  return Math.round((desde + (hasta - desde) * avance) * 100) / 100;
}

// Los días que no apuntaste nada entre dos que sí. La lista va de lo último a lo
// primero, así que "despues" es el de arriba. Si no hay hueco, nada.
function huecoEntre(despues, antes) {
  const dias = diasHasta(despues, antes) - 2;
  if (!(dias > 0)) return null;
  const [a, m, d] = antes.split("-").map(Number);
  const [a2, m2, d2] = despues.split("-").map(Number);
  return { dias, desde: isoLocal(new Date(a, m - 1, d + 1)), hasta: isoLocal(new Date(a2, m2 - 1, d2 - 1)) };
}

// Al revés, los de otra divisa siguen detrás: lo que se da la vuelta es el orden.
function ordenarPorImporte(gastos, alReves = false) {
  const principal = sumarPorDivisa(gastos)[0]?.to;
  const signo = alReves ? -1 : 1;
  return [...gastos].sort((a, b) => {
    const suyaA = a.to === principal;
    if (suyaA !== (b.to === principal)) return suyaA ? -1 : 1;
    return signo * (b.valor - a.valor) || b.cuando - a.cuando;
  });
}

// Un cero de más se cuela fácil, y luego descuadra el viaje entero. Comparo con
// lo normal de su categoría, que un hotel al lado de los cafés siempre parece caro.
const RARO_VECES = 5;

function mediana(valores) {
  const orden = [...valores].sort((a, b) => a - b);
  const mitad = Math.floor(orden.length / 2);
  return orden.length % 2 ? orden[mitad] : (orden[mitad - 1] + orden[mitad]) / 2;
}

// Un fijo siempre parecería raro al lado de los cafés: el vuelo es caro y ya está.
function gastoRaro(gastos, gasto) {
  if (!gasto || esFijo(gasto) || esDevolucion(gasto)) return null;
  const suyos = delDiaADia(gastos).filter((g) => g.to === gasto.to && !esDevolucion(g));
  const deSuCategoria = suyos.filter((g) => g.categoria === gasto.categoria);
  // Con pocos de su categoría tiro de todo el viaje, menos el alojamiento: el
  // primer hotel siempre sería "raro" al lado de los cafés.
  const base = deSuCategoria.length >= 3 ? deSuCategoria
    : suyos.length >= 5 && gasto.categoria !== "alojamiento" ? suyos
    : null;
  if (!base) return null;
  const normal = mediana(base.map((g) => g.valor));
  if (!(normal > 0)) return null;
  const veces = gasto.valor / normal;
  if (veces < RARO_VECES) return null;
  return { veces: Math.round(veces), normal, to: gasto.to, categoria: base === deSuCategoria ? gasto.categoria : null };
}

// Un doble clic sin querer y el café cuenta dos veces. Solo miro los de hace
// nada: el metro de ida y el de vuelta son el mismo gasto y los dos van.
const REPETIDO_MS = 2 * 60 * 1000;

function gastoRepetido(gastos, gasto, ahora = Date.now()) {
  if (!gasto) return null;
  const mismo = gastos.find((g) => g.from === gasto.from
    && Math.abs(g.cantidad - gasto.cantidad) < 0.005
    && g.concepto.toLowerCase() === gasto.concepto.toLowerCase()
    // Las noches de hotel van a días que no han llegado: esas no.
    && ahora - g.cuando >= 0 && ahora - g.cuando < REPETIDO_MS);
  return mismo ? { segundos: Math.max(1, Math.round((ahora - mismo.cuando) / 1000)) } : null;
}

// Lo que pesa cada gasto al lado del más caro de su divisa, para la barra de
// fondo. Cada divisa con su máximo, por lo mismo de arriba.
function pesoDeLosGastos(gastos) {
  const maximos = new Map();
  for (const g of gastos) maximos.set(g.to, Math.max(maximos.get(g.to) ?? 0, g.valor));
  return gastos.map((g) => (maximos.get(g.to) > 0 ? Math.max(g.valor, 0) / maximos.get(g.to) : 0));
}

// Lo que pesa cada día al lado del que más, en la divisa que más suma. Un día
// con solo de la otra divisa se queda sin barra: no se pueden comparar.
function pesoDeLosDias(dias) {
  const principal = sumarPorDivisa(dias.flatMap((d) => d.gastos))[0];
  const suyos = dias.map((d) => d.totales.find((t) => t.to === principal?.to)?.total ?? 0);
  const maximo = Math.max(0, ...suyos);
  return suyos.map((total) => (maximo > 0 ? total / maximo : 0));
}

// Del primer día al último con gastos, contando los de en medio sin nada: en el
// viaje estabas igual. Con un solo día la media sería el total, no la enseño.
// Lo que se ha quedado el banco, en la divisa que más suma, como el total. El
// valor ya la lleva dentro, así que sale de quitársela.
// En efectivo no hay comisión de tarjeta, pero lo que el cajero cobró sobre el
// BCE también se lo ha llevado el banco.
const comisionDe = (g) => (g.comision > 0 ? g.valor - g.valor / (1 + g.comision / 100)
  : Number.isFinite(g.alBce) ? g.valor - g.alBce : 0);

function comisionesPagadas(gastos) {
  const principal = sumarPorDivisa(gastos)[0];
  if (!principal) return null;
  const total = gastos
    .filter((g) => g.to === principal.to)
    .reduce((suma, g) => suma + comisionDe(g), 0);
  return total >= 0.005 ? { total, to: principal.to } : null;
}

// A cuánto te ha salido el cambio, comisión incluida: lo que pagaste allí entre
// lo que te costó aquí. Solo el par que más pesa, que yenes y wones juntos no
// dan ninguna tasa. Con un gasto solo es la tasa de ese día, y eso ya lo sabes.
function cambioDelViaje(gastos) {
  const principal = sumarPorDivisa(gastos)[0];
  if (!principal) return null;
  const pares = new Map();
  for (const g of gastos) {
    if (g.to !== principal.to || g.from === g.to || !(g.valor > 0)) continue;
    const par = pares.get(g.from) ?? { from: g.from, cantidad: 0, valor: 0, n: 0 };
    par.cantidad += g.cantidad;
    par.valor += g.valor;
    par.n += 1;
    pares.set(g.from, par);
  }
  const [par] = [...pares.values()].sort((a, b) => b.valor - a.valor);
  if (!par || par.n < 2) return null;
  return { from: par.from, to: principal.to, tasa: par.valor / par.cantidad, n: par.n };
}

// Del lado que da más de uno, que "1 EUR = 158,2 JPY" se lee y "1 JPY = 0,0063
// EUR" no. Cuatro cifras bastan para ver la diferencia con la de hoy.
function cifraCambio(tasa, from, to) {
  if (!(tasa > 0)) return null;
  const alReves = tasa < 1;
  const valor = alReves ? 1 / tasa : tasa;
  const decimales = Math.max(0, 3 - Math.floor(Math.log10(valor)));
  const cifra = numeros({ minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(valor);
  return alReves ? { uno: to, cifra, otra: from } : { uno: from, cifra, otra: to };
}

function textoCambio(tasa, from, to) {
  const c = cifraCambio(tasa, from, to);
  return c ? `1 ${c.uno} = ${c.cifra} ${c.otra}` : "";
}

// Lo que se habría quedado el banco si lo de efectivo hubiera ido con tarjeta.
// Esos no guardan comisión, así que tiro de la que tienes puesta ahora. Si el
// cajero cobró más que la tarjeta, sale en negativo: el efectivo te ha costado.
function ahorroEnEfectivo(gastos, comision) {
  const pagado = pagadoEnEfectivo(gastos);
  if (!pagado) return null;
  const pct = leerComision(comision);
  const efectivo = gastos.filter((g) => g.to === pagado.to && g.pago === "efectivo");
  const alBce = efectivo.reduce((suma, g) => suma + (Number.isFinite(g.alBce) ? g.alBce : g.valor), 0);
  // Por separado: sin cajero, lo de antes sale igual al céntimo.
  const cajero = efectivo.reduce((suma, g) => suma + (Number.isFinite(g.alBce) ? g.valor - g.alBce : 0), 0);
  const total = alBce * pct / 100 - cajero;
  return Math.abs(total) >= 0.005 ? { total, to: pagado.to } : null;
}

function gastadoHoy(todos, hoyIso = hoy()) {
  const gastos = delDiaADia(todos);
  const principal = sumarPorDivisa(gastos)[0];
  if (!principal) return null;
  const total = gastos
    .filter((g) => g.to === principal.to && isoLocal(new Date(g.cuando)) === hoyIso)
    .reduce((suma, g) => suma + g.valor, 0);
  return total >= 0.005 ? { total, to: principal.to } : null;
}

function pagadoEnEfectivo(gastos) {
  const principal = sumarPorDivisa(gastos)[0];
  if (!principal) return null;
  const total = gastos
    .filter((g) => g.to === principal.to && g.pago === "efectivo")
    .reduce((suma, g) => suma + g.valor, 0);
  return total >= 0.005 ? { total, to: principal.to } : null;
}

// Lo que sacas del cajero en cada viaje. Treinta dan para un viaje largo.
const RETIRADAS_MAX = 30;

const esRetiradaBuena = (r) => Boolean(r) && typeof r.id === "string" && r.id !== ""
  && Number.isFinite(r.cantidad) && r.cantidad > 0 && isValidCode(r.divisa) && Number.isFinite(r.cuando);

// Lo que te cobró el banco por ella, en tu divisa, y la del BCE de ese momento
// para saber cuánto se ha quedado. Las de antes no lo traen: van como siempre.
function costeDeRetirada({ divisa, coste, en, bce }) {
  if (!(Number.isFinite(coste) && coste > 0 && isValidCode(en) && en !== divisa)) return {};
  return { coste: Math.round(coste * 100) / 100, en, ...(Number.isFinite(bce) && bce > 0 ? { bce } : {}) };
}

// Los viajes de antes no traen cajero: sin retiradas, como si no hubieras sacado.
function leerRetiradas(guardado) {
  if (!Array.isArray(guardado)) return [];
  return guardado.filter(esRetiradaBuena).slice(0, RETIRADAS_MAX)
    .map((r) => ({ id: r.id, cantidad: r.cantidad, divisa: r.divisa, cuando: r.cuando, ...costeDeRetirada(r) }));
}

function crearRetirada({ id, cantidad, divisa, cuando, coste, en, bce }) {
  const r = { id, cantidad: Math.round(cantidad * 100) / 100, divisa, cuando };
  return esRetiradaBuena(r) ? { ...r, ...costeDeRetirada({ divisa, coste, en, bce }) } : null;
}

// A cuánto te ha salido cada yen de verdad, con todo lo que has sacado y sabes
// lo que te costó. La media y no la última: los billetes se mezclan en la cartera.
function cambioDelCajero(retiradas, from, to) {
  const con = leerRetiradas(retiradas).filter((r) => r.divisa === from && r.en === to);
  if (!con.length) return null;
  const cantidad = con.reduce((suma, r) => suma + r.cantidad, 0);
  const coste = con.reduce((suma, r) => suma + r.coste, 0);
  return { tasa: coste / cantidad, n: con.length };
}

// Lo que se ha quedado por encima del BCE: "+4,7 %". Sin la del BCE no lo sé.
const sobreElBce = (r) => (r.coste > 0 && r.bce > 0 ? r.coste / (r.cantidad * r.bce) - 1 : null);

// Lo pagado en efectivo a lo que te costaron esos billetes, no a la del BCE. Lo
// del BCE se queda en alBce para saber cuánto se llevó el cajero.
function alCambioDelCajero(gasto, retiradas) {
  if (!gasto || gasto.pago !== "efectivo" || !(gasto.cantidad > 0)) return gasto;
  const cambio = cambioDelCajero(retiradas, gasto.from, gasto.to);
  if (!cambio) return gasto;
  return { ...gasto, valor: Math.round(gasto.cantidad * cambio.tasa * 100) / 100, alBce: gasto.valor };
}

function apuntarRetirada(lista, retirada) {
  if (!esRetiradaBuena(retirada)) return lista;
  return [retirada, ...lista].slice(0, RETIRADAS_MAX);
}

const quitarRetirada = (lista, id) => lista.filter((r) => r.id !== id);

// Lo que te queda en la cartera, en cada divisa que hayas sacado. Cuenta la
// cantidad pagada y no lo convertido: los billetes son yenes, no euros.
function efectivoQueda(retiradas, gastos) {
  const cuentas = new Map();
  for (const r of retiradas) {
    const c = cuentas.get(r.divisa) ?? { divisa: r.divisa, sacado: 0, gastado: 0 };
    c.sacado += r.cantidad;
    cuentas.set(r.divisa, c);
  }
  for (const g of gastos) {
    // Lo que pagó otro salió de su cartera, no de la tuya.
    if (g.pago === "efectivo" && !g.pagador && cuentas.has(g.from)) cuentas.get(g.from).gastado += g.cantidad;
  }
  return [...cuentas.values()]
    .map((c) => ({ ...c, queda: c.sacado - c.gastado, fraccion: Math.max(0, (c.sacado - c.gastado) / c.sacado) }))
    .sort((a, b) => b.sacado - a.sacado);
}

// Por debajo de una quinta parte toca ir pensando en el cajero.
const EFECTIVO_POCO = 0.2;

const tonoEfectivo = (cuenta) => (cuenta.queda < 0 ? "falta" : cuenta.fraccion < EFECTIVO_POCO ? "poco" : "bien");

// A la cifra redonda de arriba que saca un cajero: 11.234 yenes son 12.000.
// Menos de diez no da ninguno.
function redondoDeCajero(n) {
  const paso = Math.max(10, 10 ** (Math.floor(Math.log10(n)) - 1));
  return Math.ceil(n / paso - 1e-9) * paso;
}

// Cuánto sacar para lo que queda de viaje, a lo que te toca al día. Cuenta solo
// la parte que sueles pagar en efectivo; sin gastos aún, todo, que es lo seguro.
// La tasa es de la divisa del cajero a la del presupuesto.
function cuantoSacar(presupuesto, gastos, retiradas, divisa, tasa, hoyIso = hoy(), empresa = []) {
  const estado = estadoPresupuesto(presupuesto, gastos, hoyIso);
  if (!estado?.porDia || !(tasa > 0) || divisa === presupuesto.to) return null;
  const contados = gastos.filter((g) => g.to === presupuesto.to);
  const enEfectivo = contados.filter((g) => g.pago === "efectivo").reduce((suma, g) => suma + g.valor, 0);
  const parte = contados.length ? enEfectivo / estado.gastado : 1;
  if (!(parte > 0)) return null;
  const hace = (estado.porDia * estado.dias * parte) / tasa;
  const cuenta = efectivoQueda(retiradas, [...gastos, ...empresa]).find((c) => c.divisa === divisa);
  const tienes = Math.max(cuenta?.queda ?? 0, 0);
  const falta = hace - tienes;
  return { sacar: falta > 0 ? redondoDeCajero(falta) : 0, divisa, dias: estado.dias, parte, tienes };
}

// El último día y a la vuelta, lo que queda en la cartera ya no es para el
// viaje: te digo cuánto vale en tu divisa, para gastarlo o cambiarlo. Sin fecha
// de vuelta no sé cuándo acaba, y no digo nada.
function loQueSobra(presupuesto, gastos, retiradas, tasa, hoyIso = hoy(), empresa = []) {
  if (!presupuesto?.hasta || hoyIso < presupuesto.hasta) return null;
  const [cuenta] = efectivoQueda(retiradas, [...gastos, ...empresa]);
  if (!cuenta || cuenta.queda <= 0) return null;
  const valor = cuenta.divisa === presupuesto.to ? cuenta.queda
    : Number.isFinite(tasa) && tasa > 0 ? cuenta.queda * tasa
    : null;
  return {
    queda: cuenta.queda, divisa: cuenta.divisa, valor, to: presupuesto.to,
    cuando: hoyIso === presupuesto.hasta ? "ultimo" : "acabado",
  };
}

// Por gasto y no por día: dice si vas de muchos cafés o de pocas cenas.
function mediaPorGasto(gastos) {
  const principal = sumarPorDivisa(gastos)[0];
  const suyos = gastos.filter((g) => g.to === principal?.to);
  if (suyos.length < 2) return null;
  return { media: principal.total / suyos.length, to: principal.to };
}

function mediaPorDia(todos) {
  const gastos = delDiaADia(todos);
  const principal = sumarPorDivisa(gastos)[0];
  if (!principal) return null;
  const dias = gastosPorDia(gastos);
  const total = diasHasta(dias[0].dia, dias[dias.length - 1].dia);
  if (total < 2) return null;
  return { media: principal.total / total, to: principal.to, dias: total };
}

// Un viaje con dos cafés apuntados no dice lo que gastas al día.
const GASTOS_PARA_SUGERIR = 5;

// A dos cifras: 553 son 550 y 12.340 son 12.000, que es un presupuesto, no un tique.
function redondoPresupuesto(n) {
  const paso = Math.max(10 ** (Math.floor(Math.log10(n)) - 1), 1);
  return Math.round(n / paso) * paso;
}

// Con la mediana, para que un viaje de lujo no te infle todos los demás.
function presupuestoSugerido(viajes, to, dias) {
  if (!(dias > 0)) return null;
  const medias = todosLosViajes(viajes)
    .filter((v) => v.id !== viajes.activo && delDiaADia(v.gastos).length >= GASTOS_PARA_SUGERIR)
    .map((v) => mediaPorDia(v.gastos))
    .filter((m) => m?.to === to)
    .map((m) => m.media);
  if (!medias.length) return null;
  const porDia = mediana(medias);
  const importe = redondoPresupuesto(porDia * dias);
  return importe > 0 ? { porDia, dias, importe, to, viajes: medias.length } : null;
}

// Lo que te paga el trabajo. En su propia lista, como los pendientes: así no
// cuenta en nada de lo tuyo sin tener que filtrarlo en cada cuenta.
const puedeSerDeEmpresa = (g) => !g.pagador;
const delMasNuevo = (a, b) => b.cuando - a.cuando;

function pasarAEmpresa(gastos, empresa, id) {
  const gasto = gastos.find((g) => g.id === id);
  const lista = empresa ?? [];
  if (!gasto || !puedeSerDeEmpresa(gasto) || lista.length >= GASTOS_MAX) return null;
  return { gastos: gastos.filter((g) => g.id !== id), empresa: [...lista, gasto].sort(delMasNuevo) };
}

function sacarDeEmpresa(gastos, empresa, id) {
  const lista = empresa ?? [];
  const gasto = lista.find((g) => g.id === id);
  if (!gasto || gastos.length >= GASTOS_MAX) return null;
  return { gastos: [...gastos, gasto].sort(delMasNuevo), empresa: lista.filter((g) => g.id !== id) };
}

// Del primero al último, que es como se entrega una nota de gastos.
function notaDeGastos(viaje) {
  const lista = [...(viaje?.empresa ?? [])].sort((a, b) => a.cuando - b.cuando);
  if (!lista.length) return null;
  const dia = (g) => isoLocal(new Date(g.cuando));
  return {
    nombre: viaje.nombre || tr("viajes.sinNombre"),
    desde: dia(lista[0]),
    hasta: dia(lista.at(-1)),
    filas: lista.map((g) => ({
      dia: dia(g),
      concepto: g.concepto || nombreCategoria(g.categoria),
      categoria: nombreCategoria(g.categoria),
      cantidad: g.cantidad, from: g.from, valor: g.valor, to: g.to,
      pago: tr(`pago.${leerPago(g.pago)}`),
    })),
    totales: sumarPorDivisa(lista),
  };
}

// Los tramos del viaje: "desde el 4 estoy en Kioto". Cada uno dura hasta que
// empieza el siguiente, así los gastos caen solos en el suyo por la fecha y no
// hay que marcar nada al apuntar.
const TRAMOS_MAX = 12;
const NOMBRE_TRAMO_MAX = 20;
const limpiarNombreTramo = (nombre) => String(nombre ?? "").replace(/\s+/g, " ").trim().slice(0, NOMBRE_TRAMO_MAX);

// Dos el mismo día no tienen sentido: se queda el último que pusiste.
function leerTramos(guardado) {
  if (!Array.isArray(guardado)) return [];
  const porDia = new Map();
  for (const t of guardado) {
    if (!t || typeof t.id !== "string" || !t.id || !esIso(t.desde) || !limpiarNombreTramo(t.nombre)) continue;
    porDia.set(t.desde, { id: t.id, nombre: limpiarNombreTramo(t.nombre), desde: t.desde });
  }
  return [...porDia.values()].sort((a, b) => a.desde.localeCompare(b.desde)).slice(0, TRAMOS_MAX);
}

// Si ya hay uno ese día, le cambia el nombre: es que te equivocaste al ponerlo.
function ponerTramo(tramos, { id, nombre, desde }) {
  const lista = leerTramos(tramos);
  const limpio = limpiarNombreTramo(nombre);
  if (!limpio || !esIso(desde) || typeof id !== "string" || !id) return lista;
  if (lista.some((t) => t.desde === desde)) return lista.map((t) => (t.desde === desde ? { ...t, nombre: limpio } : t));
  if (lista.length >= TRAMOS_MAX) return lista;
  return leerTramos([...lista, { id, nombre: limpio, desde }]);
}

const quitarTramo = (tramos, id) => leerTramos(tramos).filter((t) => t.id !== id);

function tramoDelDia(tramos, dia) {
  return leerTramos(tramos).filter((t) => t.desde <= dia).at(-1) ?? null;
}

// Lo de cada tramo, sin lo pagado aparte: el vuelo que reservaste hace meses
// no es de Tokio ni de Kioto. El último llega hasta hoy (o hasta la vuelta, si
// ya pasó), que en Kioto llevas los días que llevas aunque hoy no gastes.
// Lo de antes del primero va aparte, sin nombre.
function resumenTramos(gastos, tramos, { hoyIso = hoy(), hasta = null } = {}) {
  const lista = leerTramos(tramos);
  if (lista.length === 0) return [];
  const delDia = delDiaADia(gastos);
  const to = sumarPorDivisa(delDia)[0]?.to ?? null;
  const grupos = [{ id: null, nombre: null, desde: null }, ...lista].map((t) => ({ ...t, total: 0, n: 0, ultimo: null }));
  for (const g of delDia) {
    if (g.to !== to) continue;
    const dia = isoLocal(new Date(g.cuando));
    const grupo = grupos[lista.filter((t) => t.desde <= dia).length];
    grupo.total += g.valor;
    grupo.n += 1;
    if (!grupo.ultimo || dia > grupo.ultimo) grupo.ultimo = dia;
  }
  const antesDe = (iso) => {
    const [a, m, d] = iso.split("-").map(Number);
    return isoLocal(new Date(a, m - 1, d - 1));
  };
  const tope = hasta && hasta < hoyIso ? hasta : hoyIso;
  const salen = grupos.map((g, i) => {
    let fin = null;
    if (i > 0) {
      const siguiente = grupos[i + 1];
      fin = siguiente ? antesDe(siguiente.desde) : [tope, g.ultimo].filter((d) => d && d >= g.desde).sort().at(-1) ?? null;
    }
    const dias = fin && fin >= g.desde ? diasHasta(fin, g.desde) : 0;
    return {
      id: g.id, nombre: g.nombre, desde: g.desde, fin, dias, n: g.n, to,
      total: Math.round(g.total * 100) / 100,
      alDia: dias > 0 && g.n > 0 ? g.total / dias : null,
      actual: i > 0 && g.desde <= hoyIso && (!fin || hoyIso <= fin),
    };
  }).filter((g) => g.id !== null || g.n > 0);
  // El más caro al día lleva su marca, como en los viajes; con uno solo no.
  const conMedia = salen.filter((g) => g.id && g.alDia !== null);
  if (conMedia.length >= 2) {
    const caro = conMedia.reduce((a, b) => (b.alDia > a.alDia ? b : a));
    caro.caro = true;
  }
  return salen;
}

// A qué hora se te va el dinero. Cada gasto ya guarda cuándo lo apuntaste, así
// que no hay nada que preguntar. Fuera lo que no dice la hora de verdad: lo
// pagado aparte, las devoluciones, las noches del hotel repartidas (llevan la
// hora del día que lo pagaste) y lo traído del banco, que entra a las 12 en punto.
const FRANJAS = [
  { id: "madrugada", desde: 0, emoji: "🌃" },
  { id: "manana", desde: 6, emoji: "🌅" },
  { id: "mediodia", desde: 12, emoji: "☀️" },
  { id: "tarde", desde: 16, emoji: "🌇" },
  { id: "noche", desde: 20, emoji: "🌙" },
];
// Con menos, una cena suelta ya es "la noche se lleva el 60 %".
const HORAS_MINIMO = 8;

function horaFiable(g) {
  if (esFijo(g) || esDevolucion(g) || /-\d+$/.test(g.id)) return false;
  const d = new Date(g.cuando);
  return !(d.getHours() === 12 && d.getMinutes() === 0 && d.getSeconds() === 0 && d.getMilliseconds() === 0);
}

const franjaDe = (cuando) => {
  const hora = new Date(cuando).getHours();
  return FRANJAS.filter((f) => f.desde <= hora).at(-1);
};

function porFranja(gastos) {
  const buenos = gastos.filter(horaFiable);
  const to = sumarPorDivisa(buenos)[0]?.to;
  const suyos = buenos.filter((g) => g.to === to);
  if (suyos.length < HORAS_MINIMO) return null;
  const total = suyos.reduce((suma, g) => suma + g.valor, 0);
  if (!(total > 0)) return null;
  const franjas = FRANJAS.map((f) => {
    const dentro = suyos.filter((g) => franjaDe(g.cuando) === f);
    const suma = dentro.reduce((acc, g) => acc + g.valor, 0);
    const porCategoria = new Map();
    for (const g of dentro) porCategoria.set(g.categoria, (porCategoria.get(g.categoria) ?? 0) + g.valor);
    const [categoria] = [...porCategoria].sort((a, b) => b[1] - a[1])[0] ?? [null];
    return { id: f.id, emoji: f.emoji, desde: f.desde, total: Math.round(suma * 100) / 100, n: dentro.length, fraccion: suma / total, categoria };
  });
  const mas = franjas.reduce((a, b) => (b.total > a.total ? b : a));
  return { to, n: suyos.length, franjas, mas: mas.id };
}

// Lo de cada categoría al día, con los mismos días que la media de arriba: así
// sumadas dan esa media y no salen cuentas distintas en el mismo panel.
function categoriasAlDia(gastos) {
  const media = mediaPorDia(gastos);
  if (!media) return new Map();
  return new Map(desglose(delDiaADia(gastos)).map((t) => [t.categoria, t.total / media.dias]));
}

// Días que quedan contando hoy: el último día del viaje también se gasta.
function diasHasta(hasta, hoyIso = hoy()) {
  const [a1, m1, d1] = hoyIso.split("-").map(Number);
  const [a2, m2, d2] = hasta.split("-").map(Number);
  // Con Date.UTC y no con la hora local: el día del cambio de hora tiene 23 horas.
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86400000) + 1;
}

// El presupuesto lleva su divisa: es la de los gastos que cuenta. Si cambias de
// divisa a mitad de viaje, lo de la otra no se suma, igual que en el total.
function leerPresupuesto(guardado) {
  if (!guardado || typeof guardado !== "object") return null;
  const { importe, to, hasta } = guardado;
  if (!Number.isFinite(importe) || importe <= 0 || !isValidCode(to)) return null;
  if (!esIso(hasta)) return null;
  // Los de antes no traen el día de salida: entonces cuenta desde el primer gasto.
  const { desde } = guardado;
  const topes = leerTopes(guardado.categorias);
  const extra = topes ? { categorias: topes } : {};
  if (desde === undefined || desde === null) return { importe, to, hasta, ...extra };
  if (!esIso(desde) || desde > hasta) return null;
  return { importe, to, hasta, desde, ...extra };
}

// Lo que quieres gastar como mucho en comida, en ocio…, en la divisa del
// presupuesto. Son opcionales: si no pones ninguno, ni se guarda el campo.
function leerTopes(guardado) {
  if (!guardado || typeof guardado !== "object") return null;
  const topes = Object.fromEntries(Object.keys(guardado)
    .filter((c) => esCategoria(c) && Number.isFinite(guardado[c]) && guardado[c] > 0)
    .map((c) => [c, Math.round(guardado[c] * 100) / 100]));
  return Object.keys(topes).length ? topes : null;
}

const esIso = (texto) => typeof texto === "string" && /^\d{4}-\d{2}-\d{2}$/.test(texto);

// Hasta el 80 % vas bien; de ahí al 100 %, justo; pasado, pasado.
const PRESUPUESTO_JUSTO = 0.8;

function estadoPresupuesto(presupuesto, gastos, hoyIso = hoy(), pendientes = []) {
  if (!presupuesto) return null;
  const gastado = gastos.filter((g) => g.to === presupuesto.to).reduce((suma, g) => suma + g.valor, 0);
  const pendiente = totalPendiente(pendientes, presupuesto.to);
  const queda = presupuesto.importe - gastado;
  // Lo que vas a pagar sí o sí no está para gastarlo: el al día sale de lo demás.
  const libre = queda - pendiente;
  const fraccion = gastado / presupuesto.importe;
  // Si aún no has salido, el dinero se reparte entre los días del viaje, no
  // entre los que faltan desde hoy.
  const empieza = presupuesto.desde && presupuesto.desde > hoyIso ? presupuesto.desde : hoyIso;
  const dias = Math.max(diasHasta(presupuesto.hasta, empieza), 0);
  return {
    gastado,
    queda,
    pendiente,
    libre,
    fraccion,
    fraccionPendiente: pendiente / presupuesto.importe,
    dias,
    // Acabado el viaje o pasado del presupuesto, "al día" ya no significa nada.
    porDia: dias > 0 && libre > 0 ? libre / dias : null,
    tono: fraccion > 1 ? "pasado" : fraccion >= PRESUPUESTO_JUSTO ? "justo" : "bien",
  };
}

// Cómo va cada categoría con tope, con los mismos tonos que la barra de arriba.
// Lo pagado aparte cuenta, como en el presupuesto: el hotel es alojamiento.
function estadoTopes(presupuesto, gastos) {
  if (!presupuesto?.categorias) return new Map();
  return new Map(Object.entries(presupuesto.categorias).map(([categoria, tope]) => {
    const gastado = gastos.filter((g) => g.to === presupuesto.to && g.categoria === categoria).reduce((suma, g) => suma + g.valor, 0);
    const fraccion = gastado / tope;
    return [categoria, {
      categoria, tope, gastado, queda: tope - gastado, fraccion, to: presupuesto.to,
      tono: fraccion > 1 ? "pasado" : fraccion >= PRESUPUESTO_JUSTO ? "justo" : "bien",
    }];
  }));
}

// Lo de al día en la divisa de allí, que es la de los precios que ves. A dos
// cifras y hacia abajo: "≈ 4.700 JPY" se lee de un vistazo y así no te pasas.
function alDiaAlli(porDia, tasa) {
  if (!(porDia > 0) || !(tasa > 0)) return null;
  const n = porDia / tasa;
  const paso = n < 100 ? 1 : 10 ** (Math.floor(Math.log10(n)) - 1);
  const cantidad = Math.floor(n / paso + 1e-9) * paso;
  return cantidad > 0 ? cantidad : null;
}

// El día que sales. Si el presupuesto no lo trae, el del primer gasto, y si
// aún no hay ninguno, hoy.
function inicioDelViaje(presupuesto, gastos, hoyIso = hoy()) {
  if (presupuesto?.desde) return presupuesto.desde;
  // El vuelo se compra meses antes: el viaje empieza con el primero del día a día.
  const diarios = delDiaADia(gastos);
  const primero = (diarios.length ? diarios : gastos).reduce((min, g) => Math.min(min, g.cuando), Infinity);
  return Number.isFinite(primero) ? isoLocal(new Date(primero)) : hoyIso;
}

// En qué día del viaje vas. Antes de salir o acabado el viaje, no lo digo.
function diaDelViaje(presupuesto, gastos, hoyIso = hoy()) {
  if (!presupuesto) return null;
  const inicio = inicioDelViaje(presupuesto, gastos, hoyIso);
  const total = diasHasta(presupuesto.hasta, inicio);
  const dia = diasHasta(hoyIso, inicio);
  if (dia < 1 || dia > total) return null;
  return { dia, total };
}

// Lo de hoy contra lo que te toca hoy. Lo que toca sale de lo que quedaba al
// empezar el día entre los días que faltan: si contara lo de hoy, la meta
// bajaría con cada gasto que apuntas.
function loDeHoy(presupuesto, gastos, hoyIso = hoy()) {
  if (!diaDelViaje(presupuesto, gastos, hoyIso)) return null;
  let deHoy = 0;
  let antes = 0;
  for (const g of gastos) {
    if (g.to !== presupuesto.to) continue;
    if (isoLocal(new Date(g.cuando)) === hoyIso && !esFijo(g)) deHoy += g.valor;
    else antes += g.valor;
  }
  const toca = Math.max(presupuesto.importe - antes, 0) / diasHasta(presupuesto.hasta, hoyIso);
  const fraccion = toca > 0 ? deHoy / toca : deHoy > 0 ? Infinity : 0;
  return {
    gastado: deHoy,
    toca,
    fraccion,
    tono: fraccion > 1 ? "pasado" : fraccion >= PRESUPUESTO_JUSTO ? "justo" : "bien",
  };
}

// Los viajes que ya celebré, para que el confeti salga una vez y no cada vez
// que abres los gastos. Con cincuenta sobra: luego se van los más viejos.
const CELEBRADOS_MAX = 50;

function leerCelebrados(guardado) {
  if (!Array.isArray(guardado)) return [];
  return [...new Set(guardado.filter((id) => typeof id === "string" && id))].slice(-CELEBRADOS_MAX);
}

const anadirCelebrado = (celebrados, id) => leerCelebrados([...celebrados.filter((c) => c !== id), id]);

// Acabado el viaje y sin pasarte, toca fiesta. Sin ningún gasto no: eso no es
// ahorrar, es no haber apuntado.
function viajeParaCelebrar(viaje, celebrados, hoyIso = hoy()) {
  const { presupuesto, gastos } = viaje ?? {};
  if (!presupuesto || celebrados.includes(viaje.id) || hoyIso <= presupuesto.hasta) return null;
  if (!gastos.some((g) => g.to === presupuesto.to)) return null;
  const estado = estadoPresupuesto(presupuesto, gastos, hoyIso);
  if (estado.queda < 0) return null;
  return { sobra: estado.queda, to: presupuesto.to };
}

// Por debajo de un céntimo es que lo has clavado.
const textoCelebrar = ({ sobra, to }) => (sobra < 0.01
  ? tr("fin.clavado")
  : tr("fin.sobra", { importe: `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(sobra)} ${to}` }));

// Cuántos días faltan para salir. Solo con el día de salida puesto: sin él no
// sé cuándo empieza, y el mismo día ya es "Día 1".
function cuentaAtras(presupuesto, hoyIso = hoy()) {
  if (!presupuesto?.desde || presupuesto.desde <= hoyIso) return null;
  return diasHasta(presupuesto.desde, hoyIso) - 1;
}

function textoCuentaAtras(n) {
  if (n === null) return "";
  return n === 1 ? tr("presupuesto.manana") : tr("presupuesto.faltan", { n });
}

// Cuánto apartar cada semana hasta salir para llegar con el presupuesto. Lo ya
// pagado (el vuelo, el hotel reservado) ya no hay que ahorrarlo; lo pendiente sí,
// que aún no ha salido de la cuenta. Hacia arriba a la unidad: mejor que sobre.
function huchaViaje(presupuesto, gastos, hoyIso = hoy()) {
  const faltanDias = cuentaAtras(presupuesto, hoyIso);
  if (faltanDias === null) return null;
  const gastado = gastos.filter((g) => g.to === presupuesto.to).reduce((suma, g) => suma + g.valor, 0);
  const falta = presupuesto.importe - gastado;
  if (falta < 1) return null;
  // Con menos de una semana, lo que falta de una vez.
  if (faltanDias < 7) return { falta, to: presupuesto.to, semanas: 0, porSemana: Math.ceil(falta) };
  const semanas = Math.floor(faltanDias / 7);
  return { falta, to: presupuesto.to, semanas, porSemana: Math.ceil(falta / semanas) };
}

// Días seguidos gastando lo que toca o menos, del de ayer hacia atrás: hoy aún
// no ha acabado. Lo que toca es fijo, el presupuesto entre los días del viaje,
// que con lo que queda al día la vara se movería cada vez que gastas.
const RACHA_MINIMA = 2;

function rachaPresupuesto(presupuesto, gastos, hoyIso = hoy()) {
  if (!presupuesto) return null;
  const inicio = inicioDelViaje(presupuesto, gastos, hoyIso);
  const total = diasHasta(presupuesto.hasta, inicio);
  if (total < 1) return null;
  // Lo fijo sale del presupuesto antes de repartirlo: lo que toca al día es lo que queda.
  const fijo = gastos.filter((g) => esFijo(g) && g.to === presupuesto.to).reduce((s, g) => s + g.valor, 0);
  const toca = Math.max(presupuesto.importe - fijo, 0) / total;
  const porDia = new Map();
  for (const g of delDiaADia(gastos)) {
    if (g.to !== presupuesto.to) continue;
    const dia = isoLocal(new Date(g.cuando));
    porDia.set(dia, (porDia.get(dia) ?? 0) + g.valor);
  }
  const [a, m, d] = hoyIso.split("-").map(Number);
  let dias = 0;
  for (let atras = 1; ; atras += 1) {
    const dia = isoLocal(new Date(a, m - 1, d - atras));
    if (dia < inicio) break;
    if (dia > presupuesto.hasta) continue;
    // El céntimo de margen es por los decimales: justo lo que toca también vale.
    if ((porDia.get(dia) ?? 0) > toca + 0.005) break;
    dias += 1;
  }
  return dias >= RACHA_MINIMA ? { dias, toca, to: presupuesto.to } : null;
}

// Al ritmo que llevas, hasta qué día te llega lo que queda. Solo si no llega al
// final: si llega, ya lo dice la barra. El primer día no, que el hotel pagado
// por adelantado haría pensar que te arruinas.
function hastaCuandoLlega(presupuesto, gastos, hoyIso = hoy(), pendientes = []) {
  const estado = estadoPresupuesto(presupuesto, gastos, hoyIso, pendientes);
  const dia = diaDelViaje(presupuesto, gastos, hoyIso);
  if (!estado || !dia || dia.dia < 2 || estado.libre <= 0) return null;
  // Lo fijo ya está pagado y no se repite: el ritmo es solo lo del día a día.
  const fijo = gastos.filter((g) => esFijo(g) && g.to === presupuesto.to).reduce((s, g) => s + g.valor, 0);
  const ritmo = (estado.gastado - fijo) / dia.dia;
  if (!(ritmo > 0)) return null;
  const llega = Math.floor(estado.libre / ritmo);
  if (llega >= dia.total - dia.dia) return null;
  const [a, m, d] = hoyIso.split("-").map(Number);
  return isoLocal(new Date(a, m - 1, d + llega));
}

// Cuánto habrás gastado al acabar si sigues así. Lo ya apuntado para días que
// vienen (las noches del hotel) cuenta tal cual, y su categoría no entra en el
// ritmo: si no, el hotel saldría dos veces.
function previsionViaje(presupuesto, gastos, hoyIso = hoy(), pendientes = []) {
  const dia = diaDelViaje(presupuesto, gastos, hoyIso);
  // El primer día no, por lo mismo que arriba, y el último ya no hay nada que prever.
  if (!dia || dia.dia < 2 || dia.dia >= dia.total) return null;
  const suyos = gastos.filter((g) => g.to === presupuesto.to);
  const esFuturo = (g) => isoLocal(new Date(g.cuando)) > hoyIso;
  const yaPagadas = new Set(suyos.filter(esFuturo).map((g) => g.categoria));
  let gastado = 0;
  let ritmo = 0;
  for (const g of suyos) {
    gastado += g.valor;
    if (!esFuturo(g) && !esFijo(g) && !yaPagadas.has(g.categoria)) ritmo += g.valor / dia.dia;
  }
  // Lo pendiente suele ser de lo que ya va en el ritmo (el hotel al salir), pero
  // aún no está pagado: cuenta tal cual, como las noches que vienen.
  const total = gastado + totalPendiente(pendientes, presupuesto.to) + ritmo * (dia.total - dia.dia);
  return { total, sobra: presupuesto.importe - total, fraccion: total / presupuesto.importe, to: presupuesto.to };
}

// Lo gastado día a día contra lo que tocaría yendo parejo, para ver cuándo se
// torció la cosa. Lo comprado antes de salir (el vuelo) va en el primer día, y
// lo apuntado para días que vienen (las noches del hotel), en el suyo, aunque
// la línea solo llega hasta hoy. "Torció" es desde cuándo vas por encima sin
// volver a bajar: un día malo suelto no es que se haya torcido.
function curvaPresupuesto(presupuesto, gastos, hoyIso = hoy(), pendientes = []) {
  if (!presupuesto) return null;
  const inicio = inicioDelViaje(presupuesto, gastos, hoyIso);
  const total = diasHasta(presupuesto.hasta, inicio);
  if (total < 2) return null;
  const [a, m, d] = inicio.split("-").map(Number);
  const dias = Array.from({ length: total }, (_, i) => isoLocal(new Date(a, m - 1, d + i)));
  const porDia = new Array(total).fill(0);
  for (const g of gastos) {
    if (g.to !== presupuesto.to) continue;
    const i = Math.min(Math.max(diasHasta(isoLocal(new Date(g.cuando)), inicio) - 1, 0), total - 1);
    porDia[i] += g.valor;
  }
  const hasta = hoyIso < inicio ? -1 : Math.min(diasHasta(hoyIso, inicio), total) - 1;
  let suma = 0;
  const puntos = dias.map((dia, i) => {
    suma += porDia[i];
    return { dia, gastado: i <= hasta ? Math.round(suma * 100) / 100 : null, ideal: (presupuesto.importe * (i + 1)) / total };
  });
  let torcio = null;
  for (let i = hasta; i >= 0 && puntos[i].gastado > puntos[i].ideal + 0.005; i -= 1) torcio = i;
  const prevision = previsionViaje(presupuesto, gastos, hoyIso, pendientes);
  return {
    to: presupuesto.to,
    importe: presupuesto.importe,
    puntos,
    hoy: hasta >= 0 && hoyIso <= presupuesto.hasta ? hasta : null,
    torcio: torcio === null ? null : puntos[torcio].dia,
    prevision: prevision ? prevision.total : null,
  };
}

// Por debajo de un 2 % del presupuesto lo doy por clavado: es una previsión, no
// una cuenta.
const PREVISION_JUSTA = 0.02;

function textoPrevision(prevision, importe) {
  if (!prevision) return "";
  const entero = numeros({ maximumFractionDigits: 0 });
  const total = `${entero.format(prevision.total)} ${prevision.to}`;
  if (Math.abs(prevision.sobra) < importe * PREVISION_JUSTA) return tr("prevision.justo", { total });
  const diferencia = entero.format(Math.abs(prevision.sobra));
  return tr(prevision.sobra > 0 ? "prevision.sobra" : "prevision.pasa", { total, diferencia });
}

// Lo que se llevaría el gasto que vas a apuntar: qué trozo del presupuesto y
// cuántos días de lo que te queda al día. En otra divisa no cuenta, igual que arriba.
function loQueSeLleva(presupuesto, gastos, gasto, hoyIso = hoy(), pendientes = []) {
  if (!presupuesto || !gasto || gasto.to !== presupuesto.to || !(gasto.valor > 0)) return null;
  const estado = estadoPresupuesto(presupuesto, gastos, hoyIso, pendientes);
  const trozo = gasto.valor / presupuesto.importe;
  return {
    desde: Math.min(estado.fraccion, 1),
    trozo: Math.max(0, Math.min(trozo, 1 - estado.fraccion)),
    pasaria: estado.fraccion + trozo > 1,
    dias: estado.porDia ? redondearDias(gasto.valor / estado.porDia) : null,
  };
}

// Con un decimal hasta diez días; de ahí, sin decimales. Por debajo de una
// décima no lo digo: un café no te arruina el viaje.
function redondearDias(dias) {
  if (dias < 0.1) return null;
  return dias < 10 ? Math.round(dias * 10) / 10 : Math.round(dias);
}

function nombreDia(dia, hoyIso = hoy()) {
  const [a, m, d] = hoyIso.split("-").map(Number);
  if (dia === hoyIso) return tr("dia.hoy");
  if (dia === isoLocal(new Date(a, m - 1, d - 1))) return tr("dia.ayer");
  return fechaCorta(dia, a);
}

// El Excel en español separa con punto y coma y lee "12,50"; en inglés, coma y
// "12.50". Si no casan, abre todo en una columna.
const separadorCsv = () => (separadorDecimal() === "," ? ";" : ",");
const numeroCsv = (n) => n.toFixed(2).replace(".", separadorDecimal());

// Comillas solo si hacen falta. Y un concepto que empiece por "=" o "+" lo
// toma Excel por una fórmula: con la comilla simple delante se queda en texto.
function celdaCsv(valor) {
  let texto = String(valor ?? "");
  if (/^[=+\-@]/.test(texto)) texto = `'${texto}`;
  return new RegExp(`["\\r\\n${separadorCsv()}]`).test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

function filasCsv(cabecera, filas) {
  return [cabecera, ...filas].map((celdas) => celdas.map(celdaCsv).join(separadorCsv())).join("\r\n");
}

const horaLocal = (cuando) => {
  const d = new Date(cuando);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// Los números sin formatear (sin "EUR" pegado ni miles): en la hoja se suman.
function csvHistorial(lista) {
  return filasCsv(
    [tr("csv.fecha"), tr("csv.hora"), tr("csv.cantidad"), tr("csv.de"), tr("csv.resultado"), tr("csv.a")],
    lista.map((e) => [isoLocal(new Date(e.cuando)), horaLocal(e.cuando), numeroCsv(e.cantidad), e.from, numeroCsv(e.resultado), e.to]),
  );
}

// Del más antiguo al último: en una hoja de gastos se lee así, al revés que en el popup.
const cabeceraGastosCsv = () => [tr("csv.fecha"), tr("csv.hora"), tr("csv.concepto"), tr("csv.categoria"), tr("csv.cantidad"), tr("csv.de"), tr("csv.importe"), tr("csv.a"), tr("csv.pago"), tr("csv.comision")];

const filaGastoCsv = (g) => [
  isoLocal(new Date(g.cuando)), horaLocal(g.cuando), g.concepto, nombreCategoria(g.categoria ?? CATEGORIA_POR_DEFECTO),
  numeroCsv(g.cantidad), g.from, numeroCsv(g.valor), g.to, tr(`pago.${leerPago(g.pago)}`), numeroCsv(comisionDe(g)),
];

function csvGastos(lista) {
  return filasCsv(cabeceraGastosCsv(), [...lista].reverse().map(filaGastoCsv));
}

// Todos en uno, con el viaje delante para poder filtrar o hacer una tabla
// dinámica. Por viajes y no mezclados por fecha: dos viajes a la vez se liaban.
function csvViajes(lista) {
  return filasCsv(
    [tr("csv.viaje"), ...cabeceraGastosCsv()],
    lista.flatMap((v) => [...v.gastos].reverse().map((g) => [v.nombre || tr("viajes.sinNombre"), ...filaGastoCsv(g)])),
  );
}

// El número a secas, sin código ni separador de miles: lo normal es que acabe
// pegado en una hoja de cálculo y ahí estorba. El decimal, el del idioma.
// Con Shift, la frase entera, para mandársela a alguien. Esa sí con los miles,
// que la va a leer una persona y no una hoja de cálculo.
function fraseParaCopiar({ cantidad, from, valor, to }) {
  if (![cantidad, valor].every(Number.isFinite) || !isValidCode(from) || !isValidCode(to)) return "";
  const dinero = (n, code) => `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ${code}`;
  return `${dinero(cantidad, from)} = ${dinero(valor, to)}`;
}

// Para mandar un gasto suelto: "Cena · 38,90 EUR (4.500,00 JPY)". Sin concepto va
// la categoría, que "· 38,90 EUR" solo no dice nada.
function gastoParaCopiar(gasto) {
  const dinero = (n, code) => `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ${code}`;
  const que = gasto.concepto || nombreCategoria(gasto.categoria);
  const cuanto = gasto.from === gasto.to ? dinero(gasto.valor, gasto.to)
    : `${dinero(gasto.valor, gasto.to)} (${dinero(gasto.cantidad, gasto.from)})`;
  return `${que} · ${cuanto}`;
}

// Por la fecha y no por el orden de la lista, que el hotel y la cena de ayer
// se colocan en su día. Las noches que aún no han llegado no cuentan.
function ultimoGasto(gastos, ahora = Date.now()) {
  const hechos = gastos.filter((g) => g.cuando <= ahora);
  return hechos.length ? hechos.reduce((a, b) => (b.cuando > a.cuando ? b : a)) : null;
}

// El primero de la lista ordenada: lo apuntado en otra divisa va detrás, que
// 50 USD y 40 EUR no se pueden comparar a pelo.
const gastoMasCaro = (gastos) => ordenarPorImporte(gastos)[0] ?? null;

// "Japón: 40,46 EUR en 3 días". Los días, del primer gasto al último, como la media.
function totalParaCopiar(viaje) {
  const totales = sumarPorDivisa(viaje.gastos);
  if (totales.length === 0) return "";
  const dinero = ({ total, to }) => `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total)} ${to}`;
  const dias = gastosPorDia(viaje.gastos);
  const n = diasHasta(dias[0].dia, dias[dias.length - 1].dia);
  return tr("copiar.total", {
    viaje: viaje.nombre || tr("viajes.sinNombre"),
    total: totales.map(dinero).join(" + "),
    dias: tr(n === 1 ? "copiar.unDia" : "copiar.dias", { n }),
  });
}

// "Japón, hoy: 42,00 EUR en 3 gastos". Lo que haya en otra divisa no lo cuento,
// como en "cd hoy".
function hoyParaCopiar(viaje, hoyIso = hoy()) {
  const gastado = gastadoHoy(viaje?.gastos ?? [], hoyIso);
  if (!gastado) return "";
  const n = delDiaADia(viaje.gastos).filter((g) => g.to === gastado.to && isoLocal(new Date(g.cuando)) === hoyIso).length;
  return tr(n === 1 ? "copiar.hoyUno" : "copiar.hoy", {
    viaje: viaje.nombre || tr("viajes.sinNombre"),
    gastado: `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(gastado.total)} ${gastado.to}`,
    n,
  });
}

function textoParaCopiar(valor) {
  return valor.toFixed(2).replace(".", separadorDecimal());
}

// Con su símbolo, para pegarlo en un mensaje o en un formulario: "42,79 $" o
// "$42.79", según el idioma. Si el símbolo lo comparten varias divisas ("$" el
// dólar, el peso, el canadiense…), va el que no deja dudas: MX$, CA$, CN¥.
const simboloCorto = (code) => new Intl.NumberFormat("en-US", { style: "currency", currency: code, currencyDisplay: "narrowSymbol" })
  .formatToParts(1).find((p) => p.type === "currency").value;

let simbolosRepetidos = null;

function simboloDe(code) {
  if (!simbolosRepetidos) {
    const vistos = CURRENCIES.map((c) => simboloCorto(c.code));
    simbolosRepetidos = new Set(vistos.filter((s, i) => vistos.indexOf(s) !== i));
  }
  const corto = simboloCorto(code);
  if (!simbolosRepetidos.has(corto)) return corto;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: code, currencyDisplay: "symbol" })
    .formatToParts(1).find((p) => p.type === "currency").value;
}

function textoConSimbolo(valor, code) {
  if (!Number.isFinite(valor) || !isValidCode(code)) return "";
  const partes = numeros({ style: "currency", currency: code, currencyDisplay: "narrowSymbol" }).formatToParts(valor);
  const texto = partes.map((p) => (p.type === "currency" ? simboloDe(code) : p.value)).join("");
  // En inglés el símbolo va pegado, y "SGD1,234.50" no se lee: con letras, espacio.
  return texto.replace(/^([A-Za-z]+)(\d)/, "$1\u00a0$2");
}

// "38,90 € = 42,79 $": la frase de Shift+C, con el símbolo de cada lado como en la Y.
function fraseConSimbolo({ cantidad, from, valor, to }) {
  if (![cantidad, valor].every(Number.isFinite) || !isValidCode(from) || !isValidCode(to)) return "";
  return `${textoConSimbolo(cantidad, from)} = ${textoConSimbolo(valor, to)}`;
}

function destinoPara(divisa, par) {
  if (!divisa) return { from: par.from, to: par.to };
  return { from: divisa, to: divisa === par.to ? par.from : par.to };
}

// Pegando con el foco fuera de los campos no hay nada que pegar "como siempre":
// ahí también vale un número a secas, y va a la cantidad.
function leerPegadoSuelto(texto, par) {
  const conDivisa = leerPegado(texto, "amount", par);
  if (conDivisa) return conDivisa;
  const cantidad = leerImporte(String(texto ?? ""));
  if (!Number.isFinite(cantidad) || cantidad < 0) return null;
  return { cantidad, from: par.from, to: par.to };
}

// La insignia del icono corta a partir de unos cuatro caracteres, así que los
// decimales se van quitando según crece la tasa: 1,14 · 20,3 · 178 · 20k.
// Al pegar solo me meto si es un precio entero con su divisa. "20+15" o un
// "49,99" a secas se pegan como siempre. Abajo manda el destino, no el origen.
function leerPegado(texto, lado, par) {
  const precio = precioEntero(texto);
  if (!precio) return null;
  const { cantidad, divisa } = precio;
  if (lado === "result") {
    const al = destinoPara(divisa, { from: par.to, to: par.from });
    return { cantidad, from: al.to, to: al.from };
  }
  return { cantidad, ...destinoPara(divisa, par) };
}

// Una columna de una hoja o las líneas de un tique: cada línea, un precio. Se
// pega como la suma, para que se vean las partes. Si hay una línea que no es un
// precio, o dos divisas distintas, mejor pegarlo como siempre.
const COLUMNA_MAX = 50;

function leerColumna(texto, par) {
  const lineas = String(texto ?? "").split(/\r?\n|\t/).map((l) => l.trim()).filter(Boolean);
  if (lineas.length < 2 || lineas.length > COLUMNA_MAX) return null;
  let divisa = null;
  const cantidades = [];
  for (const linea of lineas) {
    const precio = precioEntero(linea);
    if (precio) {
      if (divisa && precio.divisa !== divisa) return null;
      divisa = precio.divisa;
      cantidades.push(precio.cantidad);
      continue;
    }
    // Un descuento del tique viene con su menos delante.
    if (!/^[-−]?\s*\d[\d.,'  ]*$/.test(linea)) return null;
    const n = leerNumero(linea.replace("−", "-"));
    if (!Number.isFinite(n)) return null;
    cantidades.push(n);
  }
  const cantidad = Math.round(cantidades.reduce((a, b) => a + b, 0) * 100) / 100;
  if (cantidad < 0) return null;
  return { cantidades, cantidad, ...destinoPara(divisa, par) };
}

function cuentaDeColumna(cantidades) {
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return cantidades.map((n, i) => (i === 0 ? dinero.format(n) : `${n < 0 ? "-" : "+"} ${dinero.format(Math.abs(n))}`)).join(" ");
}

function textoInsignia(rate) {
  if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) return "";
  const es = (n, dec) => n.toFixed(dec).replace(".", separadorDecimal());
  if (rate >= 999500) return `${Math.round(rate / 1e6)}M`;
  if (rate >= 9999.5) return `${Math.round(rate / 1000)}k`;
  if (rate >= 99.95) return String(Math.round(rate));
  if (rate >= 9.995) return es(rate, 1);
  if (rate >= 0.00995) return es(rate, 2);
  // 1 JPY son 0,0056 EUR: sin el cero de delante cabe una cifra que diga algo.
  return es(rate, 3).replace(/^0/, "");
}

// Lo que ha cambiado del penúltimo día publicado al último. Con la serie de
// varios días y no solo de ayer, porque el lunes el anterior es el viernes.
function cambioDiario(valores) {
  if (!Array.isArray(valores) || valores.length < 2) return null;
  const antes = valores[valores.length - 2];
  const ahora = valores[valores.length - 1];
  if (!antes) return null;
  return (ahora - antes) / antes;
}

// Por debajo de medio punto básico lo doy por igual: son movimientos del
// cuarto decimal que no interesan a nadie.
function sentidoDe(cambio) {
  if (cambio === null || Math.abs(cambio) < 0.00005) return "igual";
  return cambio > 0 ? "sube" : "baja";
}

// Lo de ayer para la línea de la tasa, en el sentido en que la estés viendo:
// al revés, si el euro sube el yen baja. Tiene que ver con lo que pone al lado.
function cambioDelDia(puntos, alReves = false) {
  if (!Array.isArray(puntos) || puntos.length < 2) return null;
  const valores = puntos.slice(-2).map((p) => (alReves ? 1 / p.valor : p.valor));
  if (!valores.every((v) => Number.isFinite(v) && v > 0)) return null;
  const cambio = cambioDiario(valores);
  return { cambio, sentido: sentidoDe(cambio), desde: puntos[puntos.length - 2].fecha };
}

// Lo que se ha movido desde la última vez que abriste el popup con este par. Si
// fue el día de antes no digo nada, que eso ya lo pone la pastilla de al lado,
// y por debajo de un 0,1 % tampoco: es ruido.
const ULTIMA_VEZ_MINIMO = 0.001;

function desdeLaUltimaVez(visto, puntos, par, alReves = false) {
  if (!visto || visto.par !== par || !Array.isArray(puntos) || puntos.length < 2) return null;
  const ultimo = puntos[puntos.length - 1];
  if (!(visto.fecha < puntos[puntos.length - 2].fecha)) return null;
  const [antes, ahora] = [visto.valor, ultimo.valor].map((v) => (alReves ? 1 / v : v));
  if (!(antes > 0) || !(ahora > 0)) return null;
  const cambio = (ahora - antes) / antes;
  if (Math.abs(cambio) < ULTIMA_VEZ_MINIMO) return null;
  return { cambio, sentido: sentidoDe(cambio), desde: visto.fecha };
}

const ultimoVisto = (puntos, par) => {
  const ultimo = Array.isArray(puntos) ? puntos[puntos.length - 1] : null;
  return ultimo && ultimo.valor > 0 ? { par, fecha: ultimo.fecha, valor: ultimo.valor } : null;
};

const FLECHA_SENTIDO = { sube: "▲", baja: "▼", igual: "=" };

function textoCambioDia({ cambio, sentido }) {
  const pct = numeros({ style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${FLECHA_SENTIDO[sentido]} ${pct.format(sentido === "igual" ? 0 : Math.abs(cambio))}`;
}

const tasaLarga = (n) => numeros({ minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(n);

// Con cuatro decimales, el dong se queda en "1 VND = 0,0000 EUR".
function tasaLegible(n) {
  if (!Number.isFinite(n) || n <= 0 || n >= 0.001) return tasaLarga(n);
  const decimales = Math.min(3 - Math.floor(Math.log10(n)), 8);
  return numeros({ minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(n);
}

// Al revés, el yen se queda en "1 JPY = 0,0061 EUR" y con cuatro decimales casi
// no se lee: le pongo los que hagan falta para ver cuatro cifras.
function lineaTasa(rate, from, to, alReves = false) {
  if (!Number.isFinite(rate) || rate <= 0) return "";
  const valor = alReves ? 1 / rate : rate;
  const decimales = valor >= 1 ? 4 : Math.min(Math.max(4, 3 - Math.floor(Math.log10(valor))), 8);
  const texto = numeros({ minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(valor);
  return alReves ? `1 ${to} = ${texto} ${from}` : `1 ${from} = ${texto} ${to}`;
}

// Con la fecha se entiende por qué el sábado no se mueve: el BCE no publica.
const textoDeLaFecha = (par, fecha) => tr(parDeMercado(par.from, par.to) ? "mercado.fecha" : "insignia.fecha", { fecha: fechaCorta(fecha) });

function tituloInsignia(par, rate, cambio, fecha = null) {
  const tasa = `1 ${par.from} = ${tasaLarga(rate)} ${par.to}`;
  const pct = cambio === null ? null : numeros({
    style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "exceptZero",
  }).format(cambio);
  const linea = pct === null ? tasa : tr("insignia.cambio", { tasa, cambio: pct });
  return fecha ? `${linea}\n${textoDeLaFecha(par, fecha)}` : linea;
}

// Lo de hoy del viaje abierto, para verlo pasando el ratón por el icono. Con
// presupuesto y de viaje, contra lo que toca hoy; si no, lo gastado a secas.
function tituloHoy(viaje, hoyIso = hoy()) {
  if (!viaje) return "";
  const dinero = (n) => numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const nombre = viaje.nombre || tr("viajes.sinNombre");
  const deHoy = loDeHoy(viaje.presupuesto, viaje.gastos, hoyIso);
  if (deHoy) {
    return tr("insignia.hoyDe", { gastado: dinero(deHoy.gastado), toca: dinero(deHoy.toca), to: viaje.presupuesto.to, viaje: nombre });
  }
  const gastado = gastadoHoy(viaje.gastos, hoyIso);
  return gastado ? tr("insignia.hoy", { gastado: `${dinero(gastado.total)} ${gastado.to}`, viaje: nombre }) : "";
}

// "cd 75f" en la barra: el tiempo de allí, que en Estados Unidos va en
// Fahrenheit. Con signo, que en invierno hace falta, y coma o punto. Los kelvin,
// solo con la palabra entera: "300k" son trescientos mil.
const HAY_GRADOS = /^\s*([-−]?)\s*(\d+(?:[.,]\d+)?)\s*[°º]?\s*(f|c|fahrenheit|celsius|kelvins?)\s*$/i;
const CERO_ABSOLUTO = 273.15;

function leerGrados(texto) {
  const m = String(texto ?? "").match(HAY_GRADOS);
  if (!m) return null;
  const valor = Number(m[2].replace(",", ".")) * (m[1] ? -1 : 1);
  const de = m[3][0].toLowerCase();
  if (de === "k" && valor < 0) return null;
  return { valor, de };
}

function convertirGrados({ valor, de }) {
  if (de === "k") return { valor: valor - CERO_ABSOLUTO, a: "c" };
  return de === "f" ? { valor: ((valor - 32) * 5) / 9, a: "c" } : { valor: (valor * 9) / 5 + 32, a: "f" };
}

function textoGrados(leido) {
  if (!leido) return "";
  const grados = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(Math.abs(n) < 0.05 ? 0 : n)} ${u === "k" ? "K" : `°${u.toUpperCase()}`}`;
  const otro = convertirGrados(leido);
  return `${grados(leido.valor, leido.de)} = ${grados(otro.valor, otro.a)}`;
}

// "cd gas 4", el horno de las recetas británicas. No es una cuenta: es la tabla
// de siempre, con los °C redondeados como vienen en los libros.
const HAY_GAS = /^\s*(?:gas(?:\s+mark)?|marca(?:\s+de)?\s+gas)\s*(¼|½|1\/4|1\/2|0[.,]25|0[.,]5|\d{1,2})\s*$/i;
const MARCAS_GAS = {
  "0.25": { c: 110, f: 225 }, "0.5": { c: 120, f: 250 }, 1: { c: 140, f: 275 }, 2: { c: 150, f: 300 },
  3: { c: 170, f: 325 }, 4: { c: 180, f: 350 }, 5: { c: 190, f: 375 }, 6: { c: 200, f: 400 },
  7: { c: 220, f: 425 }, 8: { c: 230, f: 450 }, 9: { c: 240, f: 475 }, 10: { c: 260, f: 500 },
};

function leerGas(texto) {
  const m = String(texto ?? "").match(HAY_GAS);
  if (!m) return null;
  const marca = { "¼": 0.25, "1/4": 0.25, "½": 0.5, "1/2": 0.5 }[m[1]] ?? Number(m[1].replace(",", "."));
  return MARCAS_GAS[marca] ? { marca } : null;
}

function convertirGas({ marca }) {
  return MARCAS_GAS[marca];
}

function textoGas(leido) {
  if (!leido) return "";
  const { c, f } = convertirGas(leido);
  const marca = { 0.25: "¼", 0.5: "½" }[leido.marca] ?? leido.marca;
  return `Gas ${marca} = ${c} °C (${f} °F)`;
}

// "cd 10mi" en la barra, para las señales de allí. "m" sola no vale, que en
// las cantidades son millones.
const HAY_DISTANCIA = /^\s*(\d+(?:[.,]\d+)?)\s*(mi|millas?|miles?|km|kil[oó]metros?|kilometers?)\s*$/i;
const KM_POR_MILLA = 1.609344;

function leerDistancia(texto) {
  const m = String(texto ?? "").match(HAY_DISTANCIA);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^k/i.test(m[2]) ? "km" : "mi" };
}

function convertirDistancia({ valor, de }) {
  return de === "mi" ? { valor: valor * KM_POR_MILLA, a: "km" } : { valor: valor / KM_POR_MILLA, a: "mi" };
}

function textoDistancia(leido) {
  if (!leido) return "";
  const distancia = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirDistancia(leido);
  return `${distancia(leido.valor, leido.de)} = ${distancia(otro.valor, otro.a)}`;
}

// "cd 9 min/mi" o "cd 8:30/mi", el ritmo de las carreras de allí, y al revés
// desde los min/km. En minutos y segundos, que es como se dice.
const HAY_RITMO = /^\s*(\d+:[0-5]\d|\d+(?:[.,]\d+)?)\s*(?:min(?:utos?)?)?\s*(?:\/|por|per)\s*(mi|millas?|miles?|km|kil[oó]metros?)\s*$/i;

function leerRitmo(texto) {
  const m = String(texto ?? "").match(HAY_RITMO);
  if (!m) return null;
  const [min, seg] = m[1].includes(":") ? m[1].split(":").map(Number) : [Number(m[1].replace(",", ".")), 0];
  const segundos = min * 60 + seg;
  return segundos > 0 ? { segundos, de: /^k/i.test(m[2]) ? "km" : "mi" } : null;
}

function convertirRitmo({ segundos, de }) {
  return de === "mi" ? { segundos: segundos / KM_POR_MILLA, a: "km" } : { segundos: segundos * KM_POR_MILLA, a: "mi" };
}

function textoRitmo(leido) {
  if (!leido) return "";
  const ritmo = (segundos, u) => {
    const s = Math.round(segundos);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} min/${u}`;
  };
  const otro = convertirRitmo(leido);
  return `${ritmo(leido.segundos, leido.de)} = ${ritmo(otro.segundos, otro.a)}`;
}

// "cd 5lb", para la maleta. "libras" y "pounds" no, que esas son esterlinas.
// El quintal depende de dónde: el métrico son 100 kg, pero en Centroamérica y en
// los Andes (el café, el grano) son 100 libras. Saco los dos.
// Con la arroba igual: 11,5 kg aquí y en casi toda Latinoamérica, 15 en Brasil.
const HAY_PESO = /^\s*(\d+(?:[.,]\d+)?)\s*(lbs?|kg|kilos?|kilogramos?|kilograms?|qq|quintal(?:es|s)?|@|arrobas?)\s*$/i;
const KG_POR_LIBRA = 0.45359237;
const KG_POR_ARROBA = 11.5;
const KG_POR_ARROBA_BRASIL = 15;

function leerPeso(texto) {
  const m = String(texto ?? "").match(HAY_PESO);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^k/i.test(m[2]) ? "kg" : /^q/i.test(m[2]) ? "qq" : /^(@|a)/i.test(m[2]) ? "@" : "lb" };
}

function convertirPeso({ valor, de }) {
  if (de === "qq") return { valor: valor * 100, a: "kg", otra: valor * 100, en: "lb" };
  if (de === "@") return { valor: valor * KG_POR_ARROBA, a: "kg", brasil: valor * KG_POR_ARROBA_BRASIL };
  return de === "lb" ? { valor: valor * KG_POR_LIBRA, a: "kg" } : { valor: valor / KG_POR_LIBRA, a: "lb" };
}

function textoPeso(leido) {
  if (!leido) return "";
  const peso = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirPeso(leido);
  const otra = otro.otra !== undefined ? ` · ${peso(otro.otra, otro.en)} (${peso(otro.otra * KG_POR_LIBRA, "kg")})` : otro.brasil !== undefined ? ` · 🇧🇷 ${peso(otro.brasil, "kg")}` : "";
  return `${peso(leido.valor, leido.de)} = ${peso(otro.valor, otro.a)}${otra}`;
}

// "cd 8oz", para la carne y el queso del súper. Las "fl oz" son volumen y no
// entran.
const HAY_ONZAS = /^\s*(\d+(?:[.,]\d+)?)\s*(oz|ounces?|onzas?|g|gr|gramos?|grams?)\s*$/i;
const G_POR_ONZA = 28.349523125;

function leerOnzas(texto) {
  const m = String(texto ?? "").match(HAY_ONZAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^g/i.test(m[2]) ? "g" : "oz" };
}

function convertirOnzas({ valor, de }) {
  return de === "oz" ? { valor: valor * G_POR_ONZA, a: "g" } : { valor: valor / G_POR_ONZA, a: "oz" };
}

function textoOnzas(leido) {
  if (!leido) return "";
  const peso = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirOnzas(leido);
  return `${peso(leido.valor, leido.de)} = ${peso(otro.valor, otro.a)}`;
}

// "cd 1 ozt", la onza troy del oro y la plata, que pesa más que la del súper.
const HAY_ONZAS_TROY = /^\s*(\d+(?:[.,]\d+)?)\s*(?:ozt|oz\.?\s*t|troy\s+oz|troy\s+ounces?|onzas?\s+troy)\s*$/i;
const G_POR_ONZA_TROY = 31.1034768;

function leerOnzasTroy(texto) {
  const m = String(texto ?? "").match(HAY_ONZAS_TROY);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "ozt" };
}

function convertirOnzasTroy({ valor }) {
  return { valor: valor * G_POR_ONZA_TROY, a: "g" };
}

function textoOnzasTroy(leido) {
  if (!leido) return "";
  const peso = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirOnzasTroy(leido);
  return `${peso(leido.valor, leido.de)} = ${peso(otro.valor, otro.a)}`;
}

// "cd 6ft", para alturas. Los metros, escritos enteros: "2m" son dos millones.
const HAY_ALTURA = /^\s*(\d+(?:[.,]\d+)?)\s*(ft|pies?|feet|foot|metros?|meters?|metres?)\s*$/i;
const M_POR_PIE = 0.3048;
// Allí la gente mide 5'10", pies y pulgadas juntos. Las comillas pueden venir
// dobladas ('') o curvas, que es como salen en el móvil.
const HAY_PIES_Y_PULGADAS = /^\s*(\d+)\s*(?:'|’|ft|feet|foot|pies?)\s*(\d+(?:[.,]\d+)?)\s*(?:"|”|''|’’|in|inch(?:es)?|pulgadas?)?\s*$/i;

function leerAltura(texto) {
  const juntos = String(texto ?? "").match(HAY_PIES_Y_PULGADAS);
  if (juntos) {
    const pies = Number(juntos[1]);
    const pulgadas = Number(juntos[2].replace(",", "."));
    // 5'14" no existe: serían 6'2".
    if (pulgadas >= 12) return null;
    return { valor: pies + pulgadas / 12, de: "ft", pies, pulgadas };
  }
  const m = String(texto ?? "").match(HAY_ALTURA);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^m/i.test(m[2]) ? "m" : "ft" };
}

function convertirAltura({ valor, de }) {
  return de === "ft" ? { valor: valor * M_POR_PIE, a: "m" } : { valor: valor / M_POR_PIE, a: "ft" };
}

// En metros con dos decimales, que una altura en 1,8 se queda corta.
function textoAltura(leido) {
  if (!leido) return "";
  const altura = (n, u) => `${numeros({ maximumFractionDigits: u === "m" ? 2 : 1 }).format(n)} ${u}`;
  const otro = convertirAltura(leido);
  const antes = leido.pulgadas === undefined ? altura(leido.valor, leido.de)
    : `${leido.pies} ft ${numeros({ maximumFractionDigits: 1 }).format(leido.pulgadas)} in`;
  return `${antes} = ${altura(otro.valor, otro.a)}`;
}

// "cd 65mph", para los límites de la carretera. Las millas sueltas ya son
// distancia, así que aquí solo entra lo que lleva "por hora". "mi/h" sale en
// algunos coches de alquiler en vez de "mph".
const HAY_VELOCIDAD = /^\s*(\d+(?:[.,]\d+)?)\s*(mph|mi\s*\/\s*h|millas? por hora|miles? per hour|km\/h|kmh|kph|km por hora|kil[oó]metros? por hora|kilometers? per hour)\s*$/i;

function leerVelocidad(texto) {
  const m = String(texto ?? "").match(HAY_VELOCIDAD);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^(mph|mi\b|mi\s*\/|mil)/i.test(m[2]) ? "mph" : "km/h" };
}

function convertirVelocidad({ valor, de }) {
  return de === "mph" ? { valor: valor * KM_POR_MILLA, a: "km/h" } : { valor: valor / KM_POR_MILLA, a: "mph" };
}

function textoVelocidad(leido) {
  if (!leido) return "";
  const velocidad = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirVelocidad(leido);
  return `${velocidad(leido.valor, leido.de)} = ${velocidad(otro.valor, otro.a)}`;
}

// "cd 10gal", para la gasolina. Con barra delante ("4,59/gal") sigue siendo un
// precio. Galón americano, que es el que te vas a encontrar; con "uk" detrás, el inglés.
// Con "us" detrás, el americano igual, que hay quien lo escribe para dejarlo claro.
const HAY_VOLUMEN = /^\s*(\d+(?:[.,]\d+)?)\s*(gal(?:lons?|ones|[oó]n)?|l|litros?|liters?|litres?)\s*(?:\(?\s*(?:(uk|imp(?:erial)?)|us)\s*\)?)?\s*$/i;
const L_POR_GALON = 3.78541178;
const L_POR_GALON_UK = 4.54609;

function leerVolumen(texto) {
  const m = String(texto ?? "").match(HAY_VOLUMEN);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^g/i.test(m[2]) ? "gal" : "l", ...(m[3] && { uk: true }) };
}

function convertirVolumen({ valor, de, uk }) {
  const litros = uk ? L_POR_GALON_UK : L_POR_GALON;
  return de === "gal" ? { valor: valor * litros, a: "l" } : { valor: valor / litros, a: "gal" };
}

function textoVolumen(leido) {
  if (!leido) return "";
  const volumen = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u === "gal" && leido.uk ? "gal UK" : u}`;
  const otro = convertirVolumen(leido);
  return `${volumen(leido.valor, leido.de)} = ${volumen(otro.valor, otro.a)}`;
}

// "cd 55in", para pantallas, tallas y la maleta de cabina. Las comillas también
// valen, que es como sale en las tiendas: 55". Y "cd 10mm", para tornillos y brocas.
const HAY_LONGITUD = /^\s*(\d+(?:[.,]\d+)?)\s*(in|inch(?:es)?|pulgadas?|"|cm|cent[ií]metros?|centimet(?:er|re)s?|mm|mil[ií]metros?|millimet(?:er|re)s?)\s*$/i;
const CM_POR_PULGADA = 2.54;

function leerLongitud(texto) {
  const m = String(texto ?? "").match(HAY_LONGITUD);
  if (!m) return null;
  const de = /^c/i.test(m[2]) ? "cm" : /^m/i.test(m[2]) ? "mm" : "in";
  return { valor: Number(m[1].replace(",", ".")), de };
}

function convertirLongitud({ valor, de }) {
  if (de === "mm") return { valor: valor / 10 / CM_POR_PULGADA, a: "in" };
  return de === "in" ? { valor: valor * CM_POR_PULGADA, a: "cm" } : { valor: valor / CM_POR_PULGADA, a: "in" };
}

// Desde los mm, las pulgadas con dos decimales: 3 mm con uno serían 0,1.
function textoLongitud(leido) {
  if (!leido) return "";
  const longitud = (n, u, d = 1) => `${numeros({ maximumFractionDigits: d }).format(n)} ${u}`;
  const otro = convertirLongitud(leido);
  return `${longitud(leido.valor, leido.de)} = ${longitud(otro.valor, otro.a, leido.de === "mm" ? 2 : 1)}`;
}

// "cd 800sqft", para los pisos de alquiler, que allí se anuncian así.
const HAY_SUPERFICIE = /^\s*(\d+(?:[.,]\d+)?)\s*(sq\.?\s*ft|ft²|ft2|square (?:feet|foot)|pies? cuadrados?|m²|m2|metros? cuadrados?|square met(?:er|re)s?)\s*$/i;
const M2_POR_PIE2 = 0.09290304;

function leerSuperficie(texto) {
  const m = String(texto ?? "").match(HAY_SUPERFICIE);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^(m|square met)/i.test(m[2]) ? "m²" : "sq ft" };
}

function convertirSuperficie({ valor, de }) {
  return de === "sq ft" ? { valor: valor * M2_POR_PIE2, a: "m²" } : { valor: valor / M2_POR_PIE2, a: "sq ft" };
}

// Los pies cuadrados, sin decimales: nadie anuncia un piso de 861,1.
function textoSuperficie(leido) {
  if (!leido) return "";
  const superficie = (n, u) => `${numeros({ maximumFractionDigits: u === "m²" ? 1 : 0 }).format(n)} ${u}`;
  const otro = convertirSuperficie(leido);
  return `${superficie(leido.valor, leido.de)} = ${superficie(otro.valor, otro.a)}`;
}

// "cd 5 sq mi", lo que mide un parque o una ciudad, y al revés desde los km².
const HAY_MILLAS_CUADRADAS = /^\s*(\d+(?:[.,]\d+)?)\s*(sq\.?\s*mi|mi²|mi2|square miles?|millas? cuadradas?|km²|km2|kil[oó]metros? cuadrados?|square kilomet(?:er|re)s?)\s*$/i;
const KM2_POR_MILLA2 = KM_POR_MILLA ** 2;

function leerMillasCuadradas(texto) {
  const m = String(texto ?? "").match(HAY_MILLAS_CUADRADAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^(k|square k)/i.test(m[2]) ? "km²" : "sq mi" };
}

function convertirMillasCuadradas({ valor, de }) {
  return de === "sq mi" ? { valor: valor * KM2_POR_MILLA2, a: "km²" } : { valor: valor / KM2_POR_MILLA2, a: "sq mi" };
}

function textoMillasCuadradas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirMillasCuadradas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 30mpg", para el coche de alquiler. Millas por galón americano, salvo con
// "uk" detrás: en Reino Unido el galón es el imperial y la cifra sale un 20 % más alta.
// Y "cd 15 km/l", que es como lo dan en Japón y en Latinoamérica.
const HAY_CONSUMO = /^\s*(\d+(?:[.,]\d+)?)\s*(mpg|miles? per gallon|millas? por gal[oó]n|l\/100\s*km|l\/100|km\/l|kmpl|km por litro|kil[oó]metros? por litro|kilomet(?:er|re)s? per lit(?:er|re))\s*(\(?\s*(?:uk|imp(?:erial)?)\s*\)?)?\s*$/i;

function leerConsumo(texto) {
  const m = String(texto ?? "").match(HAY_CONSUMO);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  // Va al revés (cuanto más mpg, menos litros), así que el cero no tiene vuelta.
  if (!valor) return null;
  if (/^k/i.test(m[2])) return m[3] ? null : { valor, de: "km/l" };
  return { valor, de: /^l/i.test(m[2]) ? "l/100 km" : "mpg", ...(m[3] && { uk: true }) };
}

// La misma cuenta sirve para ir y para volver.
function convertirConsumo({ valor, de, uk }) {
  if (de === "km/l") return { valor: 100 / valor, a: "l/100 km" };
  const litros = uk ? L_POR_GALON_UK : L_POR_GALON;
  return { valor: (100 * litros) / (valor * KM_POR_MILLA), a: de === "mpg" ? "l/100 km" : "mpg" };
}

function textoConsumo(leido) {
  if (!leido) return "";
  const consumo = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u === "mpg" && leido.uk ? "mpg UK" : u}`;
  const otro = convertirConsumo(leido);
  return `${consumo(leido.valor, leido.de)} = ${consumo(otro.valor, otro.a)}`;
}

// "cd 3,5 mi/kWh", para el eléctrico de alquiler en Estados Unidos. Como con los
// mpg, va al revés y la misma cuenta sirve para volver. Los Tesla de allí lo
// dan en Wh/mi, que va derecho a kWh/100 km.
const HAY_ELECTRICO = /^\s*(\d+(?:[.,]\d+)?)\s*(mi\/kwh|miles? per kwh|millas? por kwh|kwh\/100\s*km|wh\/mi(?:le)?|wh per mile)\s*$/i;

function leerElectrico(texto) {
  const m = String(texto ?? "").match(HAY_ELECTRICO);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  if (!valor) return null;
  return { valor, de: /^k/i.test(m[2]) ? "kWh/100 km" : /^w/i.test(m[2]) ? "Wh/mi" : "mi/kWh" };
}

function convertirElectrico({ valor, de }) {
  if (de === "Wh/mi") return { valor: valor / KM_POR_MILLA / 10, a: "kWh/100 km" };
  return { valor: 100 / (valor * KM_POR_MILLA), a: de === "mi/kWh" ? "kWh/100 km" : "mi/kWh" };
}

function textoElectrico(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirElectrico(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 35psi", para inflar las ruedas en la gasolinera. Algunos coches lo ponen
// en kPa ("250 kPa"), y eso va a psi, que es lo que marca el inflador de allí.
// En Asia y en Latinoamérica muchas gasolineras lo marcan en kg/cm², que también va a psi.
// Las atm salen en las ollas exprés y en el buceo; también van a psi.
// Los MPa, en las fichas de bombonas y de hidráulica.
const HAY_PRESION = /^\s*(\d+(?:[.,]\d+)?)\s*(psi|bar|bares|kpa|mpa|megapascal(?:es|s)?|kgf?\s*\/\s*cm[²2]|atm|atm[oó]sferas?|atmospheres?)\s*$/i;
const BAR_POR_PSI = 0.0689475729;
const BAR_POR_KG_CM2 = 0.980665;
const BAR_POR_ATM = 1.01325;

function leerPresion(texto) {
  const m = String(texto ?? "").match(HAY_PRESION);
  if (!m) return null;
  const de = /^b/i.test(m[2]) ? "bar" : /^a/i.test(m[2]) ? "atm" : /^m/i.test(m[2]) ? "MPa" : /^kg/i.test(m[2]) ? "kg/cm²" : /^k/i.test(m[2]) ? "kPa" : "psi";
  return { valor: Number(m[1].replace(",", ".")), de };
}

function convertirPresion({ valor, de }) {
  if (de === "kPa") return { valor: valor / 100 / BAR_POR_PSI, a: "psi" };
  if (de === "kg/cm²") return { valor: (valor * BAR_POR_KG_CM2) / BAR_POR_PSI, a: "psi" };
  if (de === "MPa") return { valor: (valor * 10) / BAR_POR_PSI, a: "psi" };
  if (de === "atm") return { valor: (valor * BAR_POR_ATM) / BAR_POR_PSI, a: "psi" };
  return de === "psi" ? { valor: valor * BAR_POR_PSI, a: "bar" } : { valor: valor / BAR_POR_PSI, a: "psi" };
}

// Los psi y los kPa, enteros: es lo que marca el inflador.
function textoPresion(leido) {
  if (!leido) return "";
  const presion = (n, u) => `${numeros({ maximumFractionDigits: u === "MPa" ? 2 : u === "bar" || u === "kg/cm²" || u === "atm" ? 1 : 0 }).format(n)} ${u}`;
  const otro = convertirPresion(leido);
  return `${presion(leido.valor, leido.de)} = ${presion(otro.valor, otro.a)}`;
}

// "cd 2 cups", para las recetas americanas. La taza de allí, no la métrica de 250.
// Los dl, que salen en las recetas de aquí y en las nórdicas, van a tazas.
const HAY_TAZAS = /^\s*(\d+(?:[.,]\d+)?)\s*(cups?|tazas?|ml|mililitros?|millilit(?:er|re)s?|dl|decilitros?|decilit(?:er|re)s?)\s*$/i;
const ML_POR_TAZA = 236.5882365;

function leerTazas(texto) {
  const m = String(texto ?? "").match(HAY_TAZAS);
  if (!m) return null;
  const de = /^m/i.test(m[2]) ? "ml" : /^d/i.test(m[2]) ? "dl" : "cups";
  return { valor: Number(m[1].replace(",", ".")), de };
}

function convertirTazas({ valor, de }) {
  if (de === "dl") return { valor: (valor * 100) / ML_POR_TAZA, a: "cups" };
  return de === "cups" ? { valor: valor * ML_POR_TAZA, a: "ml" } : { valor: valor / ML_POR_TAZA, a: "cups" };
}

// Los ml, enteros, y las tazas con dos decimales, que media taza de más ya se nota.
function textoTazas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: u === "ml" ? 0 : 2 }).format(n)} ${u === "cups" && n === 1 ? "cup" : u}`;
  const otro = convertirTazas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 1 cup harina": en las recetas de allí todo va en tazas, y aquí pesamos.
// Gramos por taza americana, de las tablas de repostería. El azúcar moreno,
// apretado, que es como lo piden.
const TAZA_DE = [
  { re: /^(harina|flour)$/, es: "harina", en: "flour", g: 125 },
  { re: /^(az[uú]car (moreno|morena)|brown sugar)$/, es: "azúcar moreno", en: "brown sugar", g: 220 },
  { re: /^(az[uú]car (glas|glass|gla[cs][eé])|powdered sugar|icing sugar)$/, es: "azúcar glas", en: "powdered sugar", g: 120 },
  { re: /^(az[uú]car|sugar)$/, es: "azúcar", en: "sugar", g: 200 },
  { re: /^(mantequilla|butter)$/, es: "mantequilla", en: "butter", g: 227 },
  { re: /^(arroz|rice)$/, es: "arroz", en: "rice", g: 185 },
  { re: /^(avena|copos de avena|oats)$/, es: "avena", en: "oats", g: 90 },
  { re: /^(cacao|cocoa)$/, es: "cacao", en: "cocoa", g: 85 },
  { re: /^(miel|honey)$/, es: "miel", en: "honey", g: 340 },
  { re: /^(aceite|oil)$/, es: "aceite", en: "oil", g: 218 },
  { re: /^(leche|milk)$/, es: "leche", en: "milk", g: 245 },
];
// Las recetas van con fracciones: "1/2 cup", "¾ cup".
const HAY_TAZA_DE = /^\s*(\d+(?:[.,]\d+)?|\d+\/\d+|[½⅓⅔¼¾])\s*(?:cups?|tazas?)\s+(?:de\s+|of\s+)?(.+?)\s*$/i;
const FRACCIONES = { "½": 1 / 2, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 1 / 4, "¾": 3 / 4 };

function leerTazaDe(texto) {
  const m = String(texto ?? "").match(HAY_TAZA_DE);
  if (!m) return null;
  const [arriba, abajo] = m[1].split("/").map(Number);
  const valor = FRACCIONES[m[1]] ?? (abajo === undefined ? Number(m[1].replace(",", ".")) : arriba / abajo);
  if (!(valor > 0) || !Number.isFinite(valor)) return null;
  const nombre = m[2].toLowerCase().replace(/\s+/g, " ");
  const ingrediente = TAZA_DE.find((i) => i.re.test(nombre));
  return ingrediente ? { valor, dicho: m[1], ingrediente } : null;
}

function textoTazaDe(leido) {
  if (!leido) return "";
  const { valor, dicho, ingrediente } = leido;
  const n = (x, d) => numeros({ maximumFractionDigits: d }).format(x);
  const en = idiomaActual() === "en";
  // La fracción, como la escribiste: "1/3 taza" se lee mejor que "0,33 tazas".
  const cifra = /[/½⅓⅔¼¾]/.test(dicho ?? "") ? dicho : n(valor, 2);
  const taza = `${cifra} ${en ? (valor > 1 ? "cups" : "cup") : (valor > 1 ? "tazas" : "taza")}`;
  return `${taza} ${en ? "of" : "de"} ${ingrediente[en ? "en" : "es"]} = ${n(valor * ingrediente.g, 0)} g`;
}

// "cd 2 tbsp", las cucharas de las mismas recetas. Solo hacia los ml: al revés
// ya están las tazas, y nadie pide 250 ml en cucharadas.
const HAY_CUCHARADAS = /^\s*(\d+(?:[.,]\d+)?)\s*(tbsp|tbs|tablespoons?|cucharadas?|tsp|teaspoons?|cucharaditas?)\s*$/i;
const ML_POR_CUCHARADA = 14.78676478125;

function leerCucharadas(texto) {
  const m = String(texto ?? "").match(HAY_CUCHARADAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^(tb|table|cucharadas?$)/i.test(m[2]) ? "tbsp" : "tsp" };
}

// La cucharadita es un tercio de la cucharada.
function convertirCucharadas({ valor, de }) {
  return { valor: valor * (de === "tbsp" ? ML_POR_CUCHARADA : ML_POR_CUCHARADA / 3), a: "ml" };
}

function textoCucharadas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirCucharadas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 1 stick", la barra de mantequilla de las recetas americanas: un cuarto
// de libra. Con medias, que "½ stick" sale mucho.
const HAY_STICKS = /^\s*(½|1\/2|\d+(?:[.,]\d+)?)\s*(?:sticks?|barras?)(?:\s+(?:of|de)\s+(?:butter|mantequilla))?\s*$/i;
const G_POR_STICK = KG_POR_LIBRA * 1000 / 4;

function leerSticks(texto) {
  const m = String(texto ?? "").match(HAY_STICKS);
  if (!m) return null;
  const valor = m[1] === "½" || m[1] === "1/2" ? 0.5 : Number(m[1].replace(",", "."));
  return valor > 0 ? { valor } : null;
}

function convertirSticks({ valor }) {
  return { valor: valor * G_POR_STICK, a: "g" };
}

function textoSticks(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  const cuantos = leido.valor === 0.5 ? "½" : n.format(leido.valor);
  return `${cuantos} ${leido.valor > 1 ? "sticks" : "stick"} = ${numeros({ maximumFractionDigits: 0 }).format(convertirSticks(leido).valor)} g`;
}

// "cd 12 fl oz", lo que pone en las latas y las botellas de allí. Solo hacia
// los ml, que los 250 ml ya los pasan las tazas. Los cl sí van al revés: es lo
// que pone en las botellas de vino de aquí ("75 cl"). Con "uk" detrás, la
// inglesa, que es un poco más pequeña y sale en las recetas de allí.
const HAY_ONZAS_LIQUIDAS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:(fl\.?\s*oz|fluid\s+ounces?|onzas?\s+l[ií]quidas?)\s*(?:\(?\s*(?:(uk|imp(?:erial)?)|us)\s*\)?)?|(cl|centilitros?|centilit(?:er|re)s?))\s*$/i;
const ML_POR_ONZA_LIQUIDA = 29.5735295625;
const ML_POR_ONZA_LIQUIDA_UK = 28.4130625;

function leerOnzasLiquidas(texto) {
  const m = String(texto ?? "").match(HAY_ONZAS_LIQUIDAS);
  if (!m) return null;
  if (m[3]) return { valor: Number(m[1].replace(",", ".")), de: "fl oz", uk: true };
  return { valor: Number(m[1].replace(",", ".")), de: m[2] ? "fl oz" : "cl" };
}

function convertirOnzasLiquidas({ valor, de, uk }) {
  if (uk) return { valor: valor * ML_POR_ONZA_LIQUIDA_UK, a: "ml" };
  return de === "cl" ? { valor: (valor * 10) / ML_POR_ONZA_LIQUIDA, a: "fl oz" } : { valor: valor * ML_POR_ONZA_LIQUIDA, a: "ml" };
}

function textoOnzasLiquidas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u === "fl oz" && leido.uk ? "fl oz UK" : u}`;
  const otro = convertirOnzasLiquidas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 1 pint", la del pub. Va la británica (568 ml) y no la americana (473):
// en Estados Unidos casi nadie la pide en pintas. Con "us" detrás, la de allí,
// que sale en las recetas y en los helados.
// Con "uk" detrás, la británica igual, como en los galones.
const HAY_PINTAS = /^\s*(\d+(?:[.,]\d+)?)\s*(pints?|pintas?|pt)\s*(?:\(?\s*(?:(us)|uk|imp(?:erial)?)\s*\)?)?\s*$/i;
const ML_POR_PINTA = 568.26125;
const ML_POR_PINTA_US = 473.176473;

function leerPintas(texto) {
  const m = String(texto ?? "").match(HAY_PINTAS);
  if (!m) return null;
  return m[3] ? { valor: Number(m[1].replace(",", ".")), de: "pt", us: true } : { valor: Number(m[1].replace(",", ".")), de: "pt" };
}

function convertirPintas({ valor, us }) {
  return { valor: valor * (us ? ML_POR_PINTA_US : ML_POR_PINTA), a: "ml" };
}

// En ml enteros, que es como viene en la carta.
function textoPintas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: u === "ml" ? 0 : 1 }).format(n)} ${u === "pt" && leido.us ? "pt US" : u}`;
  const otro = convertirPintas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 1 gill", el de las recetas de cócteles antiguas. Es un cuarto de pinta,
// y como la pinta no es igual a cada lado del charco, saco los dos.
const HAY_GILLS = /^\s*(\d+(?:[.,]\d+)?)\s*gills?\s*$/i;

function leerGills(texto) {
  const m = String(texto ?? "").match(HAY_GILLS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "gill" };
}

function convertirGills({ valor }) {
  return { valor: valor * ML_POR_PINTA_US / 4, a: "ml", inglesa: valor * ML_POR_PINTA / 4 };
}

function textoGills(leido) {
  if (!leido) return "";
  const otro = convertirGills(leido);
  const n = numeros({ maximumFractionDigits: 0 });
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${leido.valor === 1 ? "gill" : "gills"} = 🇺🇸 ${n.format(otro.valor)} ml · 🇬🇧 ${n.format(otro.inglesa)} ml`;
}

// "cd 2 qt", la leche y los helados del súper americano. Un cuarto de galón.
// Con "uk" detrás, el inglés, que es un cuarto del galón de allí.
const HAY_CUARTOS = /^\s*(\d+(?:[.,]\d+)?)\s*(qt|quarts?|cuartos?\s+de\s+gal[oó]n)\s*(?:\(?\s*(?:(uk|imp(?:erial)?)|us)\s*\)?)?\s*$/i;
const L_POR_CUARTO = 0.946352946;
const L_POR_CUARTO_UK = 1.1365225;

function leerCuartos(texto) {
  const m = String(texto ?? "").match(HAY_CUARTOS);
  if (!m) return null;
  return m[3] ? { valor: Number(m[1].replace(",", ".")), de: "qt", uk: true } : { valor: Number(m[1].replace(",", ".")), de: "qt" };
}

function convertirCuartos({ valor, uk }) {
  return { valor: valor * (uk ? L_POR_CUARTO_UK : L_POR_CUARTO), a: "l" };
}

// En litros con dos decimales: "946 ml" se entiende, pero "1.893 ml" ya no.
function textoCuartos(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: u === "l" ? 2 : 1 }).format(n)} ${u === "qt" && leido.uk ? "qt UK" : u}`;
  const otro = convertirCuartos(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 20 kn", para el barco de la excursión o el viento del parte. Un nudo es
// una milla náutica por hora, que no es la de la carretera.
const HAY_NUDOS = /^\s*(\d+(?:[.,]\d+)?)\s*(kn|kts?|knots?|nudos?)\s*$/i;
const KM_POR_NUDO = 1.852;

function leerNudos(texto) {
  const m = String(texto ?? "").match(HAY_NUDOS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "kn" };
}

function convertirNudos({ valor }) {
  return { valor: valor * KM_POR_NUDO, a: "km/h" };
}

function textoNudos(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirNudos(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 10 m/s", que es como dan el viento muchos partes del tiempo.
// Y "cd 100 ft/s", que sale en los vídeos de allí, a m/s. "fps" no: son fotogramas.
const HAY_METROS_POR_SEGUNDO = /^\s*(\d+(?:[.,]\d+)?)\s*(m\/s|mps|metros? por segundo|met(?:er|re)s? per second|(ft\/s|feet per second|pies por segundo))\s*$/i;

function leerMetrosPorSegundo(texto) {
  const m = String(texto ?? "").match(HAY_METROS_POR_SEGUNDO);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: m[3] ? "ft/s" : "m/s" };
}

function convertirMetrosPorSegundo({ valor, de }) {
  if (de === "ft/s") return { valor: valor * 0.3048, a: "m/s" };
  return { valor: valor * 3.6, a: "km/h" };
}

function textoMetrosPorSegundo(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirMetrosPorSegundo(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 3 nmi", la del barco: las distancias que van con los nudos. "nm" también,
// que es como sale en las cartas, y nadie va a buscar aquí nanómetros.
const HAY_MILLAS_NAUTICAS = /^\s*(\d+(?:[.,]\d+)?)\s*(nmi|nm|millas? n[aá]uticas?|nautical miles?)\s*$/i;

function leerMillasNauticas(texto) {
  const m = String(texto ?? "").match(HAY_MILLAS_NAUTICAS);
  if (!m || m[2] === "Nm") return null;
  return { valor: Number(m[1].replace(",", ".")), de: "nmi" };
}

// La misma cuenta que los nudos: un nudo es una de estas por hora.
function convertirMillasNauticas({ valor }) {
  return { valor: valor * KM_POR_NUDO, a: "km" };
}

function textoMillasNauticas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirMillasNauticas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 10 fathoms", la profundidad de las cartas náuticas de allí y del buceo.
// Son seis pies justos.
const HAY_BRAZAS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:fathoms?|ftm|brazas?)\s*$/i;
const M_POR_BRAZA = 1.8288;

function leerBrazas(texto) {
  const m = String(texto ?? "").match(HAY_BRAZAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "fathom" };
}

function convertirBrazas({ valor }) {
  return { valor: valor * M_POR_BRAZA, a: "m" };
}

function textoBrazas(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  return `${n.format(leido.valor)} ${leido.valor === 1 ? "fathom" : "fathoms"} = ${n.format(convertirBrazas(leido).valor)} m`;
}

// "cd 3 leguas", la de los libros y los caminos de antes. La castellana y la
// inglesa no se parecen (5,6 y 4,8 km), así que saco las dos.
const HAY_LEGUAS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:leguas?|leagues?)\s*$/i;
const KM_POR_LEGUA = 5.5727;
const KM_POR_LEGUA_INGLESA = 3 * KM_POR_MILLA;

function leerLeguas(texto) {
  const m = String(texto ?? "").match(HAY_LEGUAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "legua" };
}

function convertirLeguas({ valor }) {
  return { valor: valor * KM_POR_LEGUA, a: "km", inglesa: valor * KM_POR_LEGUA_INGLESA };
}

function textoLeguas(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  const palabra = (idiomaActual() === "en" ? "league" : "legua") + (leido.valor === 1 ? "" : "s");
  const otro = convertirLeguas(leido);
  return `${n.format(leido.valor)} ${palabra} = 🇪🇸 ${n.format(otro.valor)} km · 🇬🇧 ${n.format(otro.inglesa)} km`;
}

// "cd 15.2 hh", la alzada de los caballos. Ojo, que no es un decimal: es 15 manos
// y 2 pulgadas, así que detrás del punto solo puede ir de 0 a 3.
const HAY_MANOS = /^\s*(\d+)(?:[.,]([0-3]))?\s*(?:hh|hands?|manos?)\s*$/i;
const CM_POR_MANO = 10.16;

function leerManos(texto) {
  const m = String(texto ?? "").match(HAY_MANOS);
  if (!m) return null;
  const manos = Number(m[1]);
  const pulgadas = Number(m[2] ?? 0);
  if (!manos && !pulgadas) return null;
  return { manos, pulgadas, de: "hh" };
}

function convertirManos({ manos, pulgadas }) {
  return { valor: manos * CM_POR_MANO + pulgadas * CM_POR_MANO / 4, a: "cm" };
}

// El punto se queda como punto también en español, que así lo escriben en todas partes.
function textoManos(leido) {
  if (!leido) return "";
  const otro = convertirManos(leido);
  return `${leido.manos}.${leido.pulgadas} hh = ${numeros({ maximumFractionDigits: 0 }).format(otro.valor)} ${otro.a}`;
}

// "cd 6 furlongs", las carreras de caballos inglesas. La "f" de las cartas de
// apuestas no la cojo, que "6 f" ya son grados Fahrenheit.
const HAY_FURLONGS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:furlongs?|fur)\s*$/i;
const M_POR_FURLONG = 201.168;

function leerFurlongs(texto) {
  const m = String(texto ?? "").match(HAY_FURLONGS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "furlong" };
}

function convertirFurlongs({ valor }) {
  return { valor: valor * M_POR_FURLONG, a: "m" };
}

function textoFurlongs(leido) {
  if (!leido) return "";
  const otro = convertirFurlongs(leido);
  return `${numeros({ maximumFractionDigits: 1 }).format(leido.valor)} ${leido.valor === 1 ? "furlong" : "furlongs"} = ${numeros({ maximumFractionDigits: 0 }).format(otro.valor)} ${otro.a}`;
}

// "cd 1 chain", lo que mide el campo de críquet y las lindes de las fincas
// inglesas. "ch" no lo cojo, que se parece demasiado a los francos suizos.
const HAY_CHAINS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:chains?|cadenas?)\s*$/i;
const M_POR_CHAIN = 20.1168;

function leerChains(texto) {
  const m = String(texto ?? "").match(HAY_CHAINS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "chain" };
}

function convertirChains({ valor }) {
  return { valor: valor * M_POR_CHAIN, a: "m" };
}

function textoChains(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  return `${n.format(leido.valor)} ${leido.valor === 1 ? "chain" : "chains"} = ${n.format(convertirChains(leido).valor)} m`;
}

// "cd 10 rods", las lindes de las fincas y los porteos de las canoas. También
// se llaman perches o poles, según quién lo cuente.
const HAY_RODS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:rods?|perch(?:es)?|poles?)\s*$/i;
const M_POR_ROD = 5.0292;

function leerRods(texto) {
  const m = String(texto ?? "").match(HAY_RODS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "rod" };
}

function convertirRods({ valor }) {
  return { valor: valor * M_POR_ROD, a: "m" };
}

function textoRods(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  return `${n.format(leido.valor)} ${leido.valor === 1 ? "rod" : "rods"} = ${n.format(convertirRods(leido).valor)} m`;
}

// "cd 2 jin", lo que pesan en los mercados de China. En China el jin es medio
// kilo justo, pero en Hong Kong sigue siendo el catty de antes, de 1⅓ libras.
const HAY_JIN = /^\s*(\d+(?:[.,]\d+)?)\s*(?:jin|j[iī]n|catt(?:y|ies)|斤)\s*$/i;
const KG_POR_JIN = 0.5;
const KG_POR_CATTY = 0.60478982;

function leerJin(texto) {
  const m = String(texto ?? "").match(HAY_JIN);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "jin" };
}

function convertirJin({ valor }) {
  return { valor: valor * KG_POR_JIN, a: "kg", hongKong: valor * KG_POR_CATTY };
}

function textoJin(leido) {
  if (!leido) return "";
  const otro = convertirJin(leido);
  const n = numeros({ maximumFractionDigits: 2 });
  return `${n.format(leido.valor)} jin = 🇨🇳 ${n.format(otro.valor)} kg · 🇭🇰 ${n.format(otro.hongKong)} kg`;
}

// "cd 2 picul", cien catties, lo que se carga al hombro con la vara. Sale en
// el arroz y el té; "dan" no lo cojo, que es lo del cinturón de judo.
const HAY_PICUL = /^\s*(\d+(?:[.,]\d+)?)\s*(?:piculs?|pikuls?|担|擔)\s*$/i;

function leerPicul(texto) {
  const m = String(texto ?? "").match(HAY_PICUL);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "picul" };
}

function convertirPicul({ valor }) {
  return { valor: valor * KG_POR_JIN * 100, a: "kg", hongKong: valor * KG_POR_CATTY * 100 };
}

function textoPicul(leido) {
  if (!leido) return "";
  const otro = convertirPicul(leido);
  const n = numeros({ maximumFractionDigits: 1 });
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} picul = 🇨🇳 ${n.format(otro.valor)} kg · 🇭🇰 ${n.format(otro.hongKong)} kg`;
}

// "cd 6 shaku", la carpintería japonesa. El 尺 chino es otro: allí lo
// redondearon a un tercio de metro, así que saco los dos.
const HAY_SHAKU = /^\s*(\d+(?:[.,]\d+)?)\s*(?:shaku|尺)\s*$/i;
const M_POR_SHAKU = 10 / 33;

function leerShaku(texto) {
  const m = String(texto ?? "").match(HAY_SHAKU);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "shaku" };
}

function convertirShaku({ valor }) {
  return { valor: valor * M_POR_SHAKU * 100, a: "cm", china: valor * 100 / 3 };
}

function textoShaku(leido) {
  if (!leido) return "";
  const otro = convertirShaku(leido);
  const largo = (cm) => (cm >= 100 ? `${numeros({ maximumFractionDigits: 2 }).format(cm / 100)} m` : `${numeros({ maximumFractionDigits: 1 }).format(cm)} cm`);
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} shaku = 🇯🇵 ${largo(otro.valor)} · 🇨🇳 ${largo(otro.china)}`;
}

// "cd talla 42", el zapato europeo en la de Estados Unidos y la inglesa. Sale
// de la horma: el punto francés son 2/3 de cm y el inglés, 1/3 de pulgada
// empezando en 25. La de mujer americana va 1,5 por encima de la de hombre.
const HAY_TALLA = /^\s*(?:talla|size)\s*(?:eu\s*)?(\d+(?:[.,]5)?)\s*(?:eu)?\s*$/i;
// Fuera de esto son tallas de niño, que en Reino Unido van por otra escala.
const TALLA_MIN = 35;
const TALLA_MAX = 50;

function leerTalla(texto) {
  const m = String(texto ?? "").match(HAY_TALLA);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  if (valor < TALLA_MIN || valor > TALLA_MAX) return null;
  return { valor, de: "eu" };
}

function convertirTalla({ valor }) {
  const media = (x) => Math.round(x * 2) / 2;
  const uk = valor * 2 / 2.54 - 25;
  return { uk: media(uk), hombre: media(uk + 1), mujer: media(uk + 2.5) };
}

function textoTalla(leido) {
  if (!leido) return "";
  const otro = convertirTalla(leido);
  const n = numeros({ maximumFractionDigits: 1 });
  const en = idiomaActual() === "en";
  return `${en ? "Size" : "Talla"} ${n.format(leido.valor)} = 🇺🇸 ${n.format(otro.hombre)} ${en ? "men" : "hombre"} · ${n.format(otro.mujer)} ${en ? "women" : "mujer"} · 🇬🇧 ${n.format(otro.uk)}`;
}

// "cd anillo 7": la talla americana en la de aquí. Las de allí van del 3 al 13 y
// las de aquí empiezan donde acaban, así que sin decir nada, hasta 13,5 es US.
// La española es el contorno en mm menos 40; la inglesa, una letra cada 1,25 mm.
const HAY_ANILLO = /^\s*(?:anillo|ring)\s+(?:talla\s+|size\s+)?(\d+(?:[.,]\d+)?)\s*(us|es|eu)?\s*$/i;
const ANILLO_US_MAX = 13.5;

function leerAnillo(texto) {
  const m = String(texto ?? "").match(HAY_ANILLO);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  const de = m[2] ? (m[2].toLowerCase() === "us" ? "us" : "es") : (valor <= ANILLO_US_MAX ? "us" : "es");
  if (de === "us" ? valor < 1 || valor > 16 : valor < 1 || valor > 35) return null;
  return { valor, de };
}

function convertirAnillo({ valor, de }) {
  const diametro = de === "us" ? 11.63 + 0.8128 * valor : (valor + 40) / Math.PI;
  const contorno = diametro * Math.PI;
  const letra = Math.round(((contorno - 37.8) / 1.25) * 2) / 2;
  const uk = letra < 0 || letra > 25 ? null : "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(letra)] + (letra % 1 ? "½" : "");
  return {
    us: Math.round(((diametro - 11.63) / 0.8128) * 2) / 2,
    es: Math.round(contorno - 40),
    uk,
    mm: diametro,
  };
}

function textoAnillo(leido) {
  if (!leido) return "";
  const otro = convertirAnillo(leido);
  const n = numeros({ maximumFractionDigits: 1 });
  const en = idiomaActual() === "en";
  const partes = leido.de === "us" ? [`🇪🇸 ${otro.es}`] : [`🇺🇸 ${n.format(otro.us)}`];
  if (otro.uk) partes.push(`🇬🇧 ${otro.uk}`);
  partes.push(`⌀ ${n.format(otro.mm)} mm`);
  return `${en ? "Ring" : "Anillo"} ${leido.de === "us" ? "🇺🇸" : "🇪🇸"} ${n.format(leido.valor)} = ${partes.join(" · ")}`;
}

// "cd camisa 40": la del cuello, que aquí va en cm y allí en pulgadas. En tabla
// porque las tiendas redondean a su manera: el 40 es 15¾ y no 15,7.
const CAMISAS = [
  [37, 14.5, "S"], [38, 15, "S"], [39, 15.5, "M"], [40, 15.75, "M"], [41, 16, "L"],
  [42, 16.5, "L"], [43, 17, "XL"], [44, 17.5, "XL"], [45, 18, "XXL"], [46, 18.5, "XXL"],
];
const HAY_CAMISA = /^\s*(?:camisas?|shirts?)\s+(\d+(?:[.,]\d+)?(?:\s*[½¾])?|x{0,2}[sml]|xxl|xl)\s*$/i;

function leerCamisa(texto) {
  const m = String(texto ?? "").match(HAY_CAMISA);
  if (!m) return null;
  const dicho = m[1].replace(/\s+/g, "").toUpperCase();
  if (/^[XSML]+$/.test(dicho)) {
    const filas = CAMISAS.filter((f) => f[2] === dicho);
    return filas.length ? { letra: dicho, filas } : null;
  }
  const [, entero, fraccion] = dicho.match(/^(\d+(?:[.,]\d+)?)([½¾])?$/);
  const valor = Number(entero.replace(",", ".")) + ({ "½": 0.5, "¾": 0.75 }[fraccion] ?? 0);
  const fila = CAMISAS.find((f) => f[0] === valor || f[1] === valor);
  return fila ? { de: fila[0] === valor ? "eu" : "us", filas: [fila] } : null;
}

const pulgadasCamisa = (n) => `${Math.floor(n)}${{ 0.5: "½", 0.75: "¾" }[n % 1] ?? ""}`;

function textoCamisa(leido) {
  if (!leido) return "";
  const en = idiomaActual() === "en";
  const nombre = en ? "Shirt" : "Camisa";
  const { filas } = leido;
  if (leido.letra) {
    const eu = [...new Set(filas.map((f) => f[0]))].join("-");
    const us = filas.map((f) => pulgadasCamisa(f[1])).join("-");
    return `${nombre} ${leido.letra} = 🇪🇺 ${eu} · 🇺🇸🇬🇧 ${us}`;
  }
  const [eu, us, letra] = filas[0];
  return leido.de === "eu"
    ? `${nombre} 🇪🇺 ${eu} = 🇺🇸🇬🇧 ${pulgadasCamisa(us)} · ${letra}`
    : `${nombre} 🇺🇸🇬🇧 ${pulgadasCamisa(us)} = 🇪🇺 ${eu} · ${letra}`;
}

// "cd 100 mbps", para saber si el wifi del hotel da para algo. Megabits, no
// megabytes: ocho veces menos de lo que parece. El GB, de 1000 MB, como el operador.
// "cd 20000 mah": si la batería externa puede subir al avión. Las aerolíneas
// cuentan en Wh, y la caja pone mAh. A 3,7 V salvo que digas otra cosa, que es
// lo que usan ellas. Siempre en cabina: en la bodega no va nunca.
const HAY_MAH = /^\s*(\d+(?:[.,]\d+)?)\s*mah(?:\s*(?:a\s+|@\s*)?(\d+(?:[.,]\d+)?)\s*v)?\s*$/i;
const VOLTIOS_BATERIA = 3.7;
const WH_LIBRE = 100;
const WH_CON_PERMISO = 160;

function leerMah(texto) {
  const m = String(texto ?? "").match(HAY_MAH);
  if (!m) return null;
  const mah = Number(m[1].replace(",", "."));
  const voltios = m[2] ? Number(m[2].replace(",", ".")) : VOLTIOS_BATERIA;
  return mah > 0 && voltios > 0 && voltios <= 48 ? { mah, voltios } : null;
}

function convertirMah({ mah, voltios }) {
  const wh = (mah * voltios) / 1000;
  return { wh, avion: wh <= WH_LIBRE ? "libre" : wh <= WH_CON_PERMISO ? "permiso" : "no" };
}

function textoMah(leido) {
  if (!leido) return "";
  const { wh, avion } = convertirMah(leido);
  const n = (x, d) => numeros({ maximumFractionDigits: d }).format(x);
  const icono = { libre: "✅", permiso: "⚠️", no: "⛔" }[avion];
  return `${n(leido.mah, 0)} mAh = ${n(wh, 1)} Wh · ${icono} ${tr(`mah.${avion}`)}`;
}

const HAY_MBPS =/^\s*(\d+(?:[.,]\d+)?)\s*(k|m|g)(?:bps|bits?\/s|(b)\/s)\s*$/i;
const MBPS_POR = { k: 0.001, m: 1, g: 1000 };

function leerMbps(texto) {
  const m = String(texto ?? "").match(HAY_MBPS);
  // Con la B mayúscula son bytes, que es justo lo otro.
  if (!m || m[3] === "B") return null;
  return { valor: Number(m[1].replace(",", ".")), de: `${m[2].toLowerCase()}bps` };
}

function convertirMbps({ valor, de }) {
  const mbps = valor * MBPS_POR[de[0]];
  return { valor: mbps / 8, a: "MB/s", segundosGb: 8000 / mbps };
}

function duracion(segundos) {
  const s = Math.round(segundos);
  if (s < 60) return `${s} s`;
  if (s < 3600) return s % 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s / 60} min`;
  const min = Math.round(s / 60);
  return min % 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min / 60} h`;
}

// "cd 120 mg/dl", la glucosa: en Estados Unidos va en mg/dL y aquí casi
// siempre en mmol/L. El 18 sirve solo para la glucosa; el colesterol va con otro.
const HAY_GLUCOSA = /^\s*(\d+(?:[.,]\d+)?)\s*(?:(mg\s*\/\s*dl)|mmol(?:\s*\/\s*l)?)\s*$/i;
const MG_DL_POR_MMOL = 18;

function leerGlucosa(texto) {
  const m = String(texto ?? "").match(HAY_GLUCOSA);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: m[2] ? "mg/dL" : "mmol/L" };
}

function convertirGlucosa({ valor, de }) {
  return de === "mg/dL" ? { valor: valor / MG_DL_POR_MMOL, a: "mmol/L" } : { valor: valor * MG_DL_POR_MMOL, a: "mg/dL" };
}

function textoGlucosa(leido) {
  if (!leido) return "";
  const otro = convertirGlucosa(leido);
  const n = (x, de) => numeros({ maximumFractionDigits: de === "mg/dL" ? 0 : 1 }).format(x);
  const glucosa = idiomaActual() === "en" ? "glucose" : "glucosa";
  return `${numeros({ maximumFractionDigits: 1 }).format(leido.valor)} ${leido.de} = ${n(otro.valor, otro.a)} ${otro.a} (${glucosa})`;
}

// "cd 2 go", el vaso del arroz japonés, el de las arroceras. Son 180 ml, pero
// las recetas piensan en el arroz: un go crudo pesa unos 150 g.
const HAY_GO = /^\s*(\d+(?:[.,]\d+)?)\s*(?:go|gō|合)\s*$/i;
const ML_POR_GO = 2401 / 13.31;
const ARROZ_POR_GO = 150;

function leerGo(texto) {
  const m = String(texto ?? "").match(HAY_GO);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "go" };
}

function convertirGo({ valor }) {
  return { valor: valor * ML_POR_GO, a: "ml", arroz: valor * ARROZ_POR_GO };
}

function textoGo(leido) {
  if (!leido) return "";
  const otro = convertirGo(leido);
  const cuanto = (x, poca, mucha) => (x >= 1000 ? `${numeros({ maximumFractionDigits: 2 }).format(x / 1000)} ${mucha}` : `${numeros({ maximumFractionDigits: 0 }).format(x)} ${poca}`);
  const arroz = idiomaActual() === "en" ? "of rice" : "de arroz";
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} go = ${cuanto(otro.valor, "ml", "l")} · 🍚 ${cuanto(otro.arroz, "g", "kg")} ${arroz}`;
}

// "cd 10 varas", la de las escrituras viejas. La castellana, la de Burgos, y la
// argentina, que salió más larga y todavía aparece en los terrenos de allí.
const HAY_VARA = /^\s*(\d+(?:[.,]\d+)?)\s*varas?(?:\s+castellanas?)?\s*$/i;
const CM_POR_VARA = 83.5905;
const CM_POR_VARA_ARGENTINA = 86.6;

function leerVara(texto) {
  const m = String(texto ?? "").match(HAY_VARA);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "vara" };
}

function convertirVara({ valor }) {
  return { valor: valor * CM_POR_VARA, a: "cm", argentina: valor * CM_POR_VARA_ARGENTINA };
}

function textoVara(leido) {
  if (!leido) return "";
  const otro = convertirVara(leido);
  const largo = (cm) => (cm >= 100 ? `${numeros({ maximumFractionDigits: 2 }).format(cm / 100)} m` : `${numeros({ maximumFractionDigits: 1 }).format(cm)} cm`);
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${leido.valor === 1 ? "vara" : "varas"} = 🇪🇸 ${largo(otro.valor)} · 🇦🇷 ${largo(otro.argentina)}`;
}

// "cd 2 manzanas", las fincas de Centroamérica: 100 por 100 varas castellanas.
// La manzana argentina es una cuadra de ciudad, otra cosa, así que esa no.
const HAY_MANZANA = /^\s*(\d+(?:[.,]\d+)?)\s*(?:manzanas?|mz)\s*$/i;
const M2_POR_MANZANA = 10000 * (CM_POR_VARA / 100) ** 2;

function leerManzana(texto) {
  const m = String(texto ?? "").match(HAY_MANZANA);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  if (!valor) return null;
  return { valor, de: "manzana" };
}

function convertirManzana({ valor }) {
  return { valor: valor * M2_POR_MANZANA / 10000, a: "ha", m2: valor * M2_POR_MANZANA };
}

function textoManzana(leido) {
  if (!leido) return "";
  const otro = convertirManzana(leido);
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${leido.valor === 1 ? "manzana" : "manzanas"} = ${numeros({ maximumFractionDigits: 2 }).format(otro.valor)} ha · ${numeros({ maximumFractionDigits: 0 }).format(otro.m2)} m²`;
}

// "cd 3 ri", la legua japonesa de los caminos antiguos: 12.960 shaku. El 里
// chino se escribe igual pero lo dejaron en medio kilómetro, así que van los dos.
const HAY_RI = /^\s*(\d+(?:[.,]\d+)?)\s*(ri|li|里)\s*$/i;
const M_POR_RI = 12960 * M_POR_SHAKU;
const M_POR_LI = 500;

function leerRi(texto) {
  const m = String(texto ?? "").match(HAY_RI);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: m[2].toLowerCase() === "li" ? "li" : "ri" };
}

function convertirRi({ valor }) {
  return { valor: valor * M_POR_RI / 1000, a: "km", china: valor * M_POR_LI / 1000 };
}

function textoRi(leido) {
  if (!leido) return "";
  const otro = convertirRi(leido);
  const largo = (km) => (km >= 1 ? `${numeros({ maximumFractionDigits: 2 }).format(km)} km` : `${numeros({ maximumFractionDigits: 0 }).format(km * 1000)} m`);
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${leido.de} = 🇯🇵 ${largo(otro.valor)} · 🇨🇳 ${largo(otro.china)}`;
}

function textoMbps(leido) {
  if (!leido) return "";
  const otro = convertirMbps(leido);
  const n = numeros({ maximumFractionDigits: 1 });
  const unidad = { kbps: "kbps", mbps: "Mbps", gbps: "Gbps" }[leido.de];
  const velocidad = otro.valor < 1 ? `${n.format(otro.valor * 1000)} kB/s` : `${n.format(otro.valor)} MB/s`;
  const gb = idiomaActual() === "en" ? "1 GB in" : "1 GB en";
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${unidad} = ${velocidad} · ${gb} ${duracion(otro.segundosGb)}`;
}

// "cd 3 dram", el peso de la pólvora en los cartuchos de caza, y "cd 1 fl dr"
// para los frascos de perfume y de la farmacia. "dr" solo no, que es doctor.
const HAY_DRAM = /^\s*(\d+(?:[.,]\d+)?)\s*(?:(fl\.?\s*dr|fl(?:uid)?\.?\s*drams?)|drams?|drachms?)\s*$/i;

function leerDram(texto) {
  const m = String(texto ?? "").match(HAY_DRAM);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: m[2] ? "fl dr" : "dram" };
}

function convertirDram({ valor, de }) {
  return de === "fl dr" ? { valor: valor * ML_POR_ONZA_LIQUIDA / 8, a: "ml" } : { valor: valor * G_POR_ONZA / 16, a: "g" };
}

function textoDram(leido) {
  if (!leido) return "";
  const otro = convertirDram(leido);
  const n = numeros({ maximumFractionDigits: 2 });
  return `${n.format(leido.valor)} ${leido.de} = ${n.format(otro.valor)} ${otro.a}`;
}

// "cd 300 codos", el arca de Noé y las pirámides. El de la Biblia lo tomo de
// 18 pulgadas y el egipcio real, de 52,36 cm, que es como lo dan los museos.
const HAY_CODO = /^\s*(\d+(?:[.,]\d+)?)\s*(codos?|cubits?)\s*$/i;
const CM_POR_CODO = 45.72;
const CM_POR_CODO_REAL = 52.36;

function leerCodo(texto) {
  const m = String(texto ?? "").match(HAY_CODO);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^cu/i.test(m[2]) ? "cubit" : "codo" };
}

function convertirCodo({ valor }) {
  return { valor: valor * CM_POR_CODO, a: "cm", egipto: valor * CM_POR_CODO_REAL };
}

function textoCodo(leido) {
  if (!leido) return "";
  const otro = convertirCodo(leido);
  const largo = (cm) => (cm >= 100 ? `${numeros({ maximumFractionDigits: 1 }).format(cm / 100)} m` : `${numeros({ maximumFractionDigits: 1 }).format(cm)} cm`);
  const nombre = leido.valor === 1 ? leido.de : `${leido.de}s`;
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${nombre} = 📜 ${largo(otro.valor)} · 🇪🇬 ${largo(otro.egipto)}`;
}

// "cd 20 tsubo", como anuncian los pisos en Japón. En Corea lo llaman pyeong y
// en Taiwán ping, pero es la misma medida: el tatami doble, 400/121 m².
const HAY_TSUBO = /^\s*(\d+(?:[.,]\d+)?)\s*(tsubo|坪|pye?ong|평|ping)\s*$/i;
const M2_POR_TSUBO = 400 / 121;

function leerTsubo(texto) {
  const m = String(texto ?? "").match(HAY_TSUBO);
  if (!m) return null;
  const nombre = m[2].toLowerCase();
  const de = /^py|평/.test(nombre) ? "pyeong" : nombre === "ping" ? "ping" : "tsubo";
  return { valor: Number(m[1].replace(",", ".")), de };
}

function convertirTsubo({ valor }) {
  return { valor: valor * M2_POR_TSUBO, a: "m²" };
}

function textoTsubo(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  return `${n.format(leido.valor)} ${leido.de} = ${n.format(convertirTsubo(leido).valor)} m²`;
}

// "cd 6 jo", lo que miden las habitaciones en los anuncios de pisos de Japón.
// Cada región tiene su tatami, pero los anuncios por ley cuentan 1,62 m².
const HAY_JO = /^\s*(\d+(?:[.,]\d+)?)\s*(?:j[oō]|畳|帖|tatamis?)\s*$/i;
const M2_POR_JO = 1.62;

function leerJo(texto) {
  const m = String(texto ?? "").match(HAY_JO);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  if (!valor) return null;
  return { valor, de: "jo" };
}

function convertirJo({ valor }) {
  return { valor: valor * M2_POR_JO, a: "m²" };
}

function textoJo(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  return `${n.format(leido.valor)} jo = ${n.format(convertirJo(leido).valor)} m²`;
}

// "cd 5 lakh", como dan en India los precios de pisos y coches y los sueldos.
// Un lakh son cien mil y un crore, cien lakh.
const HAY_LAKH = /^\s*(\d+(?:[.,]\d+)?)\s*(lakhs?|lacs?|crores?|cr)\s*$/i;
const LAKH = 1e5;
const CRORE = 1e7;

function leerLakh(texto) {
  const m = String(texto ?? "").match(HAY_LAKH);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^c/i.test(m[2]) ? "crore" : "lakh" };
}

function convertirLakh({ valor, de }) {
  return { valor: valor * (de === "crore" ? CRORE : LAKH) };
}

function textoLakh(leido) {
  if (!leido) return "";
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${leido.de} = ${numeros({ maximumFractionDigits: 0 }).format(convertirLakh(leido).valor)}`;
}

// "cd 10 tola", como se vende el oro en India y en Dubái. Saco también las
// onzas troy porque el precio del oro siempre viene por onza.
const HAY_TOLA = /^\s*(\d+(?:[.,]\d+)?)\s*(?:tolas?|tolay?|तोला)\s*$/i;
const G_POR_TOLA = 11.6638038;

function leerTola(texto) {
  const m = String(texto ?? "").match(HAY_TOLA);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "tola" };
}

function convertirTola({ valor }) {
  return { valor: valor * G_POR_TOLA, a: "g", troy: valor * G_POR_TOLA / G_POR_ONZA_TROY };
}

function textoTola(leido) {
  if (!leido) return "";
  const otro = convertirTola(leido);
  const n = numeros({ maximumFractionDigits: 2 });
  return `${n.format(leido.valor)} tola = ${numeros({ maximumFractionDigits: 1 }).format(otro.valor)} g · ${n.format(otro.troy)} ozt`;
}

// "cd 5 maund", el del grano y el algodón en los mercados de allí. En India y
// Bangladesh siguen con el de 3.200 tolas; Pakistán lo redondeó a 40 kg.
const HAY_MAUND = /^\s*(\d+(?:[.,]\d+)?)\s*(?:maunds?|munds?|मन|মণ|من)\s*$/i;
const TOLAS_POR_MAUND = 3200;

function leerMaund(texto) {
  const m = String(texto ?? "").match(HAY_MAUND);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "maund" };
}

function convertirMaund({ valor }) {
  return { valor: valor * TOLAS_POR_MAUND * G_POR_TOLA / 1000, a: "kg", pakistan: valor * 40 };
}

function textoMaund(leido) {
  if (!leido) return "";
  const otro = convertirMaund(leido);
  const n = numeros({ maximumFractionDigits: 1 });
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} maund = 🇮🇳 ${n.format(otro.valor)} kg · 🇵🇰 ${n.format(otro.pakistan)} kg`;
}

// "cd 1 tael", el té y el oro de Hong Kong. Es un dieciseisavo de catty, pero
// el del oro va aparte y pesa un 1 % menos; en China es la décima de un jin.
const HAY_TAEL = /^\s*(\d+(?:[.,]\d+)?)\s*(?:taels?|兩|两|liang)\s*$/i;
const G_POR_TAEL = KG_POR_CATTY * 1000 / 16;
const G_POR_TAEL_ORO = 37.429;

function leerTael(texto) {
  const m = String(texto ?? "").match(HAY_TAEL);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "tael" };
}

function convertirTael({ valor }) {
  return { valor: valor * G_POR_TAEL, a: "g", china: valor * KG_POR_JIN * 100, oro: valor * G_POR_TAEL_ORO };
}

function textoTael(leido) {
  if (!leido) return "";
  const otro = convertirTael(leido);
  const n = numeros({ maximumFractionDigits: 1 });
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} tael = 🇭🇰 ${n.format(otro.valor)} g · 🇨🇳 ${n.format(otro.china)} g · ${tr("tael.oro", { g: numeros({ maximumFractionDigits: 2 }).format(otro.oro) })}`;
}

// "cd mach 2", los aviones de las noticias. El sonido va más lento con el frío,
// así que saco el del nivel del mar y el de 11 km, donde vuelan los aviones.
const HAY_MACH = /^\s*(?:mach\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*mach)\s*$/i;
const KMH_POR_MACH = 340.294 * 3.6;
const KMH_POR_MACH_ARRIBA = 295.07 * 3.6;

function leerMach(texto) {
  const m = String(texto ?? "").match(HAY_MACH);
  if (!m) return null;
  const valor = Number((m[1] ?? m[2]).replace(",", "."));
  return valor ? { valor, de: "mach" } : null;
}

function convertirMach({ valor }) {
  return { valor: valor * KMH_POR_MACH, a: "km/h", arriba: valor * KMH_POR_MACH_ARRIBA };
}

function textoMach(leido) {
  if (!leido) return "";
  const otro = convertirMach(leido);
  const n = numeros({ maximumFractionDigits: 0 });
  return `Mach ${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} = 🌊 ${n.format(otro.valor)} km/h · ✈️ ${n.format(otro.arriba)} km/h`;
}

// "cd 2 thou", el grosor de las bolsas y del plástico en Estados Unidos. Allí
// también lo llaman "mil", pero aquí eso es otra cosa, así que solo "thou".
const HAY_THOU = /^\s*(\d+(?:[.,]\d+)?)\s*thou\s*$/i;
const MM_POR_THOU = 0.0254;

function leerThou(texto) {
  const m = String(texto ?? "").match(HAY_THOU);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "thou" };
}

function convertirThou({ valor }) {
  return { valor: valor * MM_POR_THOU, a: "mm" };
}

function textoThou(leido) {
  if (!leido) return "";
  const mm = convertirThou(leido).valor;
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} thou = ${numeros({ maximumFractionDigits: 3 }).format(mm)} mm · ${numeros({ maximumFractionDigits: 0 }).format(mm * 1000)} µm`;
}

// "cd 200 gsm", el gramaje de las toallas y del papel. En Estados Unidos las
// telas vienen en onzas por yarda cuadrada, así que entiendo las dos.
const HAY_GRAMAJE = /^\s*(\d+(?:[.,]\d+)?)\s*(gsm|g\s*\/\s*m(?:2|²)|oz\s*\/\s*yd(?:2|²))\s*$/i;
const GSM_POR_OZ_YD2 = 28.349523125 / 0.83612736;

function leerGramaje(texto) {
  const m = String(texto ?? "").match(HAY_GRAMAJE);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  if (!valor) return null;
  return { valor, de: /^oz/i.test(m[2]) ? "oz/yd²" : "g/m²" };
}

function convertirGramaje({ valor, de }) {
  if (de === "oz/yd²") return { valor: valor * GSM_POR_OZ_YD2, a: "g/m²" };
  return { valor: valor / GSM_POR_OZ_YD2, a: "oz/yd²" };
}

function textoGramaje(leido) {
  if (!leido) return "";
  const otro = convertirGramaje(leido);
  const decimales = otro.a === "g/m²" ? 0 : 1;
  return `${numeros({ maximumFractionDigits: 1 }).format(leido.valor)} ${leido.de} = ${numeros({ maximumFractionDigits: decimales }).format(otro.valor)} ${otro.a}`;
}

// "cd 22 momme". En las sábanas de seda es gramaje y en las perlas, peso, y el
// número viene solo, así que saco los dos. Lo de la seda es la cifra que se da siempre.
const HAY_MOMME = /^\s*(\d+(?:[.,]\d+)?)\s*(?:mommes?|monme|匁)\s*$/i;
const G_POR_MOMME = 3.75;
const GSM_POR_MOMME = 4.34;

function leerMomme(texto) {
  const m = String(texto ?? "").match(HAY_MOMME);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  if (!valor) return null;
  return { valor, de: "momme" };
}

function convertirMomme({ valor }) {
  return { valor: valor * GSM_POR_MOMME, a: "g/m²", peso: valor * G_POR_MOMME };
}

function textoMomme(leido) {
  if (!leido) return "";
  const otro = convertirMomme(leido);
  const n = numeros({ maximumFractionDigits: 1 });
  return `${n.format(leido.valor)} momme = 🧵 ${n.format(otro.valor)} g/m² · ⚖️ ${n.format(otro.peso)} g`;
}

// "cd 2 pood", las kettlebells rusas. El pood de verdad son 16,38 kg, pero las
// pesas se hacen de 16 kg justos por pood, y eso es lo que pone en la tienda.
const HAY_POOD = /^\s*(\d+(?:[.,]\d+)?)\s*(?:poods?|pud|пуд(?:а|ов)?)\s*$/i;
const KG_POR_POOD = 16.3807;
const KG_PESA_POR_POOD = 16;

function leerPood(texto) {
  const m = String(texto ?? "").match(HAY_POOD);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  if (!valor) return null;
  return { valor, de: "pood" };
}

function convertirPood({ valor }) {
  return { valor: valor * KG_POR_POOD, a: "kg", pesa: valor * KG_PESA_POR_POOD };
}

function textoPood(leido) {
  if (!leido) return "";
  const otro = convertirPood(leido);
  const n = numeros({ maximumFractionDigits: 1 });
  return `${n.format(leido.valor)} pood = ${n.format(otro.valor)} kg · 🏋️ ${tr("pood.pesa", { kg: n.format(otro.pesa) })}`;
}

// "cd 5 verst", las distancias de las novelas rusas. Va con y sin la ё, que en
// los teclados rusos casi nadie la pone.
const HAY_VERSTA = /^\s*(\d+(?:[.,]\d+)?)\s*(?:versts?|verstas?|в[её]рст(?:а|ы)?)\s*$/i;
const KM_POR_VERSTA = 1.0668;

function leerVersta(texto) {
  const m = String(texto ?? "").match(HAY_VERSTA);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  if (!valor) return null;
  return { valor, de: "verst" };
}

function convertirVersta({ valor }) {
  return { valor: valor * KM_POR_VERSTA, a: "km" };
}

function textoVersta(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  return `${n.format(leido.valor)} ${leido.valor === 1 ? "verst" : "versts"} = ${n.format(convertirVersta(leido).valor)} km`;
}

// "cd 4 ly" o "cd 1 parsec", por curiosidad. Sin "pc", que es lo de las piezas.
// Lo doy en billones de km, que en inglés son trillions: por eso va por tr().
const HAY_ANIO_LUZ = /^\s*(\d+(?:[.,]\d+)?)\s*(ly|light[\s-]*years?|a[ñn]os?[\s-]*luz|p[aá]rsecs?|parsecs?)\s*$/i;
const KM_POR_ANIO_LUZ = 9.4607304725808e12;
const ANIOS_LUZ_POR_PARSEC = 3.261563777;

function leerAnioLuz(texto) {
  const m = String(texto ?? "").match(HAY_ANIO_LUZ);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  if (!valor) return null;
  return { valor, de: /^p/i.test(m[2]) ? "pc" : "ly" };
}

function convertirAnioLuz({ valor, de }) {
  const ly = de === "pc" ? valor * ANIOS_LUZ_POR_PARSEC : valor;
  return { valor: ly * KM_POR_ANIO_LUZ, a: "km", ly };
}

function textoAnioLuz(leido) {
  if (!leido) return "";
  const otro = convertirAnioLuz(leido);
  const n = (x) => numeros({ maximumFractionDigits: 2 }).format(x);
  const anios = (x) => tr(x === 1 ? "luz.anio" : "luz.anios", { n: n(x) });
  const km = tr("luz.km", { n: numeros({ maximumSignificantDigits: 3 }).format(otro.valor / 1e12) });
  if (leido.de === "pc") return `${n(leido.valor)} pc = ${anios(otro.ly)} · ${km}`;
  return `${anios(leido.valor)} = ${km}`;
}

// "cd 1 acre-ft", el agua de los embalses en las noticias de allí. Con cifras
// grandes saco también los hm³, que es como se cuentan los pantanos aquí.
const HAY_ACRE_PIE = /^\s*(\d+(?:[.,]\d+)?)\s*(?:acres?|ac)[\s-]*(?:ft|feet|foot)\s*$/i;
const M3_POR_ACRE_PIE = 1233.48183754752;

function leerAcrePie(texto) {
  const m = String(texto ?? "").match(HAY_ACRE_PIE);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "acre-ft" };
}

function convertirAcrePie({ valor }) {
  return { valor: valor * M3_POR_ACRE_PIE, a: "m³" };
}

function textoAcrePie(leido) {
  if (!leido) return "";
  const m3 = convertirAcrePie(leido).valor;
  const hm3 = m3 >= 1e5 ? ` · ${numeros({ maximumFractionDigits: 2 }).format(m3 / 1e6)} hm³` : "";
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} acre-ft = ${numeros({ maximumFractionDigits: 0 }).format(m3)} m³${hm3}`;
}

// "cd 2 bigha", la de los terrenos en Bangladesh y Nepal. En India cada estado
// tiene la suya, así que me quedo con las dos que tienen un valor fijo por ley.
const HAY_BIGHA = /^\s*(\d+(?:[.,]\d+)?)\s*(?:bighas?|বিঘা|बिघा)\s*$/i;
const M2_POR_BIGHA = { bd: 14400 * 0.09290304, np: 72900 * 0.09290304 };

function leerBigha(texto) {
  const m = String(texto ?? "").match(HAY_BIGHA);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "bigha" };
}

function convertirBigha({ valor }) {
  return { valor: valor * M2_POR_BIGHA.bd, a: "m²", nepal: valor * M2_POR_BIGHA.np };
}

function textoBigha(leido) {
  if (!leido) return "";
  const otro = convertirBigha(leido);
  // Pasada la hectárea, los m² ya no se leen bien.
  const area = (m2) => (m2 >= 1e4 ? `${numeros({ maximumFractionDigits: 2 }).format(m2 / 1e4)} ha` : `${numeros({ maximumFractionDigits: 0 }).format(m2)} m²`);
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} bigha = 🇧🇩 ${area(otro.valor)} · 🇳🇵 ${area(otro.nepal)}`;
}

// "cd 10 mu", el de las fincas y las cosechas en China. Quince mu, una hectárea.
const HAY_MU = /^\s*(\d+(?:[.,]\d+)?)\s*(?:mu|亩|畝)\s*$/i;
const M2_POR_MU = 10000 / 15;

function leerMu(texto) {
  const m = String(texto ?? "").match(HAY_MU);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "mu" };
}

function convertirMu({ valor }) {
  return { valor: valor * M2_POR_MU, a: "m²" };
}

function textoMu(leido) {
  if (!leido) return "";
  const m2 = convertirMu(leido).valor;
  const area = m2 >= 1e4 ? `${numeros({ maximumFractionDigits: 2 }).format(m2 / 1e4)} ha` : `${numeros({ maximumFractionDigits: 0 }).format(m2)} m²`;
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} mu = ${area}`;
}

// "cd 10 fanegas", la de las escrituras viejas y las fincas del pueblo. Cada
// comarca tenía la suya; me quedo con la de Castilla, la del marco real.
const HAY_FANEGA = /^\s*(\d+(?:[.,]\d+)?)\s*(?:fanegas?|fanegadas?|fan\.)\s*$/i;
const M2_POR_FANEGA = 6439.56;

function leerFanega(texto) {
  const m = String(texto ?? "").match(HAY_FANEGA);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "fanega" };
}

function convertirFanega({ valor }) {
  return { valor: valor * M2_POR_FANEGA / 1e4, a: "ha" };
}

function textoFanega(leido) {
  if (!leido) return "";
  const nombre = leido.valor === 1 ? "fanega" : "fanegas";
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${nombre} = ${numeros({ maximumFractionDigits: 2 }).format(convertirFanega(leido).valor)} ha`;
}

// "cd 2 acres", para la casa rural o el parque, y "cd 2 ha" al revés. Sin
// "ac", que suena a otra cosa.
const HAY_ACRES = /^\s*(\d+(?:[.,]\d+)?)\s*(acres?|ha|hect[aá]reas?|hectares?)\s*$/i;
const HA_POR_ACRE = 0.40468564224;

function leerAcres(texto) {
  const m = String(texto ?? "").match(HAY_ACRES);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^h/i.test(m[2]) ? "ha" : "acres" };
}

function convertirAcres({ valor, de }) {
  return de === "ha" ? { valor: valor / HA_POR_ACRE, a: "acres" } : { valor: valor * HA_POR_ACRE, a: "ha" };
}

// Dos decimales, que un acre se queda en 0,4 ha y con uno no se distinguen.
function textoAcres(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 2 }).format(n)} ${u === "acres" && n === 1 ? "acre" : u}`;
  const otro = convertirAcres(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 10 arpents", las fincas de Quebec y de las escrituras viejas de Luisiana.
// Es el arpent cuadrado; el de longitud apenas sale ya en ningún sitio.
const HAY_ARPENT = /^\s*(\d+(?:[.,]\d+)?)\s*arpents?\s*$/i;
const HA_POR_ARPENT = 0.341889;

function leerArpent(texto) {
  const m = String(texto ?? "").match(HAY_ARPENT);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  if (!valor) return null;
  return { valor, de: "arpent" };
}

function convertirArpent({ valor }) {
  return { valor: valor * HA_POR_ARPENT, a: "ha", acres: valor * HA_POR_ARPENT / HA_POR_ACRE };
}

function textoArpent(leido) {
  if (!leido) return "";
  const otro = convertirArpent(leido);
  const n = (x) => numeros({ maximumFractionDigits: 2 }).format(x);
  return `${n(leido.valor)} ${leido.valor === 1 ? "arpent" : "arpents"} = ${n(otro.valor)} ha · ${n(otro.acres)} acres`;
}

// "cd 250 kcal" o "cd 1000 kJ": en Australia las etiquetas solo traen kJ. Las
// "calorías" de la comida son kilocalorías, así que "cal" a secas cuenta igual.
const HAY_CALORIAS = /^\s*(\d+(?:[.,]\d+)?)\s*(kcal|cal|calor[ií]as?|calories?|kj|kilojul(?:io)?s?|kilojoules?)\s*$/i;
const KJ_POR_KCAL = 4.184;

function leerCalorias(texto) {
  const m = String(texto ?? "").match(HAY_CALORIAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^k(j|ilo)/i.test(m[2]) ? "kJ" : "kcal" };
}

function convertirCalorias({ valor, de }) {
  return de === "kcal" ? { valor: valor * KJ_POR_KCAL, a: "kJ" } : { valor: valor / KJ_POR_KCAL, a: "kcal" };
}

// Sin decimales, como en las etiquetas.
function textoCalorias(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 0 }).format(n)} ${u}`;
  const otro = convertirCalorias(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 150 hp", el coche de alquiler. Aquí la ficha va en kW y lo que se dice
// son CV, que no son lo mismo: el hp inglés es un poco más grande.
// Los PS de los coches alemanes son el mismo caballo que el CV.
const HAY_POTENCIA = /^\s*(\d+(?:[.,]\d+)?)\s*(b?hp|horsepower|kw|kilovatios?|kilowatts?|cv|caballos?|ps|pferdest(?:ä|ae)rke)\s*$/i;
const KW_POR_HP = 0.745699872;
const KW_POR_CV = 0.73549875;

function leerPotencia(texto) {
  const m = String(texto ?? "").match(HAY_POTENCIA);
  if (!m) return null;
  const de = /^k/i.test(m[2]) ? "kW" : /^c/i.test(m[2]) ? "CV" : /^p/i.test(m[2]) ? "PS" : "hp";
  return { valor: Number(m[1].replace(",", ".")), de };
}

// De hp y de CV, a kW y a la otra: son las dos que se confunden.
function convertirPotencia({ valor, de }) {
  if (de === "kW") return { valor: valor / KW_POR_HP, a: "hp" };
  const kw = valor * (de === "hp" ? KW_POR_HP : KW_POR_CV);
  return de === "hp" ? { valor: kw, a: "kW", otra: kw / KW_POR_CV, en: "CV" } : { valor: kw, a: "kW", otra: kw / KW_POR_HP, en: "hp" };
}

function textoPotencia(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 0 }).format(n)} ${u}`;
  const otro = convertirPotencia(leido);
  const otra = otro.otra === undefined ? "" : ` · ${cuanto(otro.otra, otro.en)}`;
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}${otra}`;
}

// "cd 12000 btu", el aire acondicionado del hotel en Estados Unidos. Siempre
// son miles, así que "12.000" y "12,000" van como doce mil y no como doce.
const HAY_BTU = /^\s*(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)\s*(?:btus?|btu\/h)\s*$/i;
const KW_POR_BTU = 0.00029307107;

function leerBtu(texto) {
  const m = String(texto ?? "").match(HAY_BTU);
  if (!m) return null;
  const miles = /^\d{1,3}(?:[.,]\d{3})+$/.test(m[1]);
  return { valor: Number(miles ? m[1].replace(/[.,]/g, "") : m[1].replace(",", ".")), de: "BTU" };
}

function convertirBtu({ valor }) {
  return { valor: valor * KW_POR_BTU, a: "kW" };
}

function textoBtu(leido) {
  if (!leido) return "";
  const otro = convertirBtu(leido);
  return `${numeros({ maximumFractionDigits: 0 }).format(leido.valor)} ${leido.de} = ${numeros({ maximumFractionDigits: 1 }).format(otro.valor)} ${otro.a}`;
}

// "cd 50 therm", la factura del gas en Estados Unidos y Reino Unido, a los kWh
// de la de aquí. Un therm son cien mil BTU.
const HAY_THERMS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:therms?|thm|termias?)\s*$/i;
const KWH_POR_THERM = 29.3071;

function leerTherms(texto) {
  const m = String(texto ?? "").match(HAY_THERMS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "therm" };
}

function convertirTherms({ valor }) {
  return { valor: valor * KWH_POR_THERM, a: "kWh" };
}

function textoTherms(leido) {
  if (!leido) return "";
  const otro = convertirTherms(leido);
  return `${numeros({ maximumFractionDigits: 1 }).format(leido.valor)} ${leido.de} = ${numeros({ maximumFractionDigits: 0 }).format(otro.valor)} ${otro.a}`;
}

// "cd 30 inhg", la presión del parte del tiempo en Estados Unidos, a los hPa,
// que son los milibares de aquí. Y "cd 1013 hpa" al revés, para el barómetro de allí.
// Los mmHg, que es como da el tiempo Rusia y medio Este, también van a hPa, y
// los torr de las bombas de vacío.
const HAY_INHG = /^\s*(\d+(?:[.,]\d+)?)\s*(?:(in\.?\s*hg|"\s*hg|pulgadas? de mercurio|inch(?:es)? of mercury)|(mm\s*hg|mil[ií]metros? de mercurio|millimet(?:er|re)s? of mercury)|(torrs?)|(hpa|mbar|milibares?|millibars?))\s*$/i;
const HPA_POR_INHG = 33.8638866667;
const HPA_POR_MMHG = 1.33322387415;
// El torr es la atmósfera entre 760, que no es exactamente un mmHg aunque casi.
const HPA_POR_TORR = 1013.25 / 760;

function leerInHg(texto) {
  const m = String(texto ?? "").match(HAY_INHG);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: m[2] ? "inHg" : m[3] ? "mmHg" : m[4] ? "Torr" : "hPa" };
}

function convertirInHg({ valor, de }) {
  if (de === "mmHg") return { valor: valor * HPA_POR_MMHG, a: "hPa" };
  if (de === "Torr") return { valor: valor * HPA_POR_TORR, a: "hPa" };
  return de === "hPa" ? { valor: valor / HPA_POR_INHG, a: "inHg" } : { valor: valor * HPA_POR_INHG, a: "hPa" };
}

// Los inHg salen con dos decimales en el parte (29,92), los hPa, enteros.
function textoInHg(leido) {
  if (!leido) return "";
  const presion = (n, u) => `${numeros({ maximumFractionDigits: u === "inHg" ? 2 : 0 }).format(n)} ${u}`;
  const otro = convertirInHg(leido);
  return `${presion(leido.valor, leido.de)} = ${presion(otro.valor, otro.a)}`;
}

// "cd 10 cu ft", las neveras, los trasteros y el maletero del coche de alquiler.
// Solo hacia los litros, que es como lo pone aquí cualquier ficha.
const HAY_PIES_CUBICOS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:cu\.?\s*f(?:ee)?t|ft³|cubic f(?:ee|oo)t|pies? cúbicos?)\s*$/i;
const L_POR_PIE3 = 28.316846592;

function leerPiesCubicos(texto) {
  const m = String(texto ?? "").match(HAY_PIES_CUBICOS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "cu ft" };
}

function convertirPiesCubicos({ valor }) {
  return { valor: valor * L_POR_PIE3, a: "l" };
}

function textoPiesCubicos(leido) {
  if (!leido) return "";
  const otro = convertirPiesCubicos(leido);
  return `${numeros({ maximumFractionDigits: 1 }).format(leido.valor)} ${leido.de} = ${numeros({ maximumFractionDigits: 0 }).format(otro.valor)} ${otro.a}`;
}

// "cd 350 ci", la cilindrada de los coches americanos. Allí dicen "ci" o "cid"
// y aquí, litros. Y "cd 1000 cc" al revés, para las motos.
const HAY_PULGADAS_CUBICAS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:(cid?|cu\.?\s*in\.?|in³|cubic inch(?:es)?|pulgadas? cúbicas?)|(cc|cm³|cm3|cent[ií]metros? cúbicos?|cubic centimet(?:er|re)s?))\s*$/i;
const L_POR_PULGADA3 = 0.016387064;

function leerPulgadasCubicas(texto) {
  const m = String(texto ?? "").match(HAY_PULGADAS_CUBICAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: m[2] ? "ci" : "cc" };
}

function convertirPulgadasCubicas({ valor, de }) {
  return de === "cc" ? { valor: valor / 1000 / L_POR_PULGADA3, a: "ci" } : { valor: valor * L_POR_PULGADA3, a: "l" };
}

function textoPulgadasCubicas(leido) {
  if (!leido) return "";
  const otro = convertirPulgadasCubicas(leido);
  return `${numeros({ maximumFractionDigits: 0 }).format(leido.valor)} ${leido.de} = ${numeros({ maximumFractionDigits: otro.a === "l" ? 1 : 0 }).format(otro.valor)} ${otro.a}`;
}

// "cd 1 bbl", el barril de petróleo de las noticias. Es el de 42 galones; hay
// otros barriles (el de cerveza), pero cuando alguien lo busca es por esto.
const HAY_BARRILES = /^\s*(\d+(?:[.,]\d+)?)\s*(?:bbls?|barrels?|barril(?:es)?)\s*$/i;
const L_POR_BARRIL = 158.987294928;

function leerBarriles(texto) {
  const m = String(texto ?? "").match(HAY_BARRILES);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "bbl" };
}

function convertirBarriles({ valor }) {
  return { valor: valor * L_POR_BARRIL, a: "l" };
}

function textoBarriles(leido) {
  if (!leido) return "";
  const otro = convertirBarriles(leido);
  return `${numeros({ maximumFractionDigits: 1 }).format(leido.valor)} ${leido.de} = ${numeros({ maximumFractionDigits: 0 }).format(otro.valor)} ${otro.a}`;
}

// "cd 300 lb-ft", el par del coche de alquiler. Allí lo escriben al derecho y
// al revés (lb-ft, ft-lb) y es lo mismo.
// Y "cd 400 Nm", el de los coches de aquí, a lb-ft. Solo con esa N mayúscula:
// "nm" a secas ya son millas náuticas.
// Los kgf·m salen en las fichas de coches japoneses viejos y en las llaves dinamométricas.
const HAY_PAR_MOTOR = /^\s*(\d+(?:[.,]\d+)?)\s*(?:lbs?\s*[-·.]?\s*ft|ft\s*[-·.]?\s*lbs?|pound[- ]f(?:ee|oo)t|foot[- ]pounds?|libras?[- ]pie|(n\s*[-·.]\s*m|nm|newton[- ]?met(?:ro|er|re)s?)|(kgf?\s*[-·.]?\s*m))\s*$/i;
const NM_POR_LBFT = 1.3558179483;
const NM_POR_KGFM = 9.80665;

function leerParMotor(texto) {
  const m = String(texto ?? "").match(HAY_PAR_MOTOR);
  if (!m) return null;
  if (/^nm$/i.test(m[2] ?? "") && m[2] !== "Nm") return null;
  return { valor: Number(m[1].replace(",", ".")), de: m[2] ? "Nm" : m[3] ? "kgf·m" : "lb-ft" };
}

function convertirParMotor({ valor, de }) {
  if (de === "Nm") return { valor: valor / NM_POR_LBFT, a: "lb-ft" };
  if (de === "kgf·m") return { valor: valor * NM_POR_KGFM, a: "Nm" };
  return { valor: valor * NM_POR_LBFT, a: "Nm" };
}

function textoParMotor(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: u === "kgf·m" ? 1 : 0 }).format(n)} ${u}`;
  const otro = convertirParMotor(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 2 ton", la tonelada corta de Estados Unidos, la de los puentes y los camiones.
// "Toneladas" es la de 1.000 kg, así que esa va al revés, a las cortas.
// Y "cd 2 long ton", la inglesa, que es la que ponen los puentes de Reino Unido.
const HAY_TONELADAS_CORTAS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:((?:short\s+)?tons?)|(long\s+tons?|tons?\s*\(?\s*(?:uk|imp(?:erial)?)\s*\)?)|t|tonnes?|toneladas?)\s*$/i;
const KG_POR_TONELADA_CORTA = 907.18474;
const KG_POR_TONELADA_LARGA = 1016.0469088;

function leerToneladasCortas(texto) {
  const m = String(texto ?? "").match(HAY_TONELADAS_CORTAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: m[2] ? "ton" : m[3] ? "long ton" : "t" };
}

function convertirToneladasCortas({ valor, de }) {
  if (de === "t") return { valor: (valor * 1000) / KG_POR_TONELADA_CORTA, a: "ton" };
  if (de === "long ton") return { valor: (valor * KG_POR_TONELADA_LARGA) / 1000, a: "t" };
  return { valor: (valor * KG_POR_TONELADA_CORTA) / 1000, a: "t" };
}

function textoToneladasCortas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 2 }).format(n)} ${u}`;
  const otro = convertirToneladasCortas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 1 ct", los quilates de las piedras en la joyería. "Quilates" a secas no lo
// cojo: en el oro (18 quilates) es la pureza, no el peso.
const HAY_QUILATES = /^\s*(\d+(?:[.,]\d+)?)\s*(?:cts?|carats?)\s*$/i;
const G_POR_QUILATE = 0.2;

function leerQuilates(texto) {
  const m = String(texto ?? "").match(HAY_QUILATES);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "ct" };
}

function convertirQuilates({ valor }) {
  return { valor: valor * G_POR_QUILATE, a: "g" };
}

function textoQuilates(leido) {
  if (!leido) return "";
  const otro = convertirQuilates(leido);
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${leido.de} = ${numeros({ maximumFractionDigits: 3 }).format(otro.valor)} ${otro.a}`;
}

// "cd 5 grains", lo que pone en la aspirina de las farmacias de Estados Unidos.
// "gr" no lo cojo, que aquí son gramos.
const HAY_GRAINS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:grains?|granos?)\s*$/i;
const MG_POR_GRAIN = 64.79891;

function leerGrains(texto) {
  const m = String(texto ?? "").match(HAY_GRAINS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "grain" };
}

function convertirGrains({ valor }) {
  return { valor: valor * MG_POR_GRAIN, a: "mg" };
}

function textoGrains(leido) {
  if (!leido) return "";
  const otro = convertirGrains(leido);
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${leido.de} = ${numeros({ maximumFractionDigits: 0 }).format(otro.valor)} ${otro.a}`;
}

// "cd 10 dwt", el pennyweight de los anuncios de oro y plata de allí.
const HAY_PENNYWEIGHT = /^\s*(\d+(?:[.,]\d+)?)\s*(?:dwt|pennyweights?)\s*$/i;
const G_POR_DWT = 1.55517384;

function leerPennyweight(texto) {
  const m = String(texto ?? "").match(HAY_PENNYWEIGHT);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "dwt" };
}

function convertirPennyweight({ valor }) {
  return { valor: valor * G_POR_DWT, a: "g" };
}

function textoPennyweight(leido) {
  if (!leido) return "";
  const otro = convertirPennyweight(leido);
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} dwt = ${numeros({ maximumFractionDigits: 1 }).format(otro.valor)} ${otro.a}`;
}

// "cd 2 cwt", el grano y el ganado. El americano son 100 libras y el inglés 112,
// así que saco los dos, como con las leguas.
const HAY_CWT = /^\s*(\d+(?:[.,]\d+)?)\s*(?:cwt|hundredweights?)\s*$/i;

function leerCwt(texto) {
  const m = String(texto ?? "").match(HAY_CWT);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "cwt" };
}

function convertirCwt({ valor }) {
  return { valor: valor * 100 * KG_POR_LIBRA, a: "kg", inglesa: valor * 112 * KG_POR_LIBRA };
}

function textoCwt(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  const otro = convertirCwt(leido);
  return `${n.format(leido.valor)} cwt = 🇺🇸 ${n.format(otro.valor)} kg · 🇬🇧 ${n.format(otro.inglesa)} kg`;
}

// "cd 1 cord", la leña de las casas de allí. Son 128 pies cúbicos apilados,
// con el aire de entre los troncos dentro.
const HAY_CUERDAS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:cords?|cuerdas?)\s*$/i;

function leerCuerdas(texto) {
  const m = String(texto ?? "").match(HAY_CUERDAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "cord" };
}

function convertirCuerdas({ valor }) {
  return { valor: valor * 128 * L_POR_PIE3 / 1000, a: "m³" };
}

function textoCuerdas(leido) {
  if (!leido) return "";
  const otro = convertirCuerdas(leido);
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${leido.valor === 1 ? "cord" : "cords"} = ${numeros({ maximumFractionDigits: 2 }).format(otro.valor)} ${otro.a}`;
}

// "cd 2 bu", el trigo y el maíz de las noticias de Chicago. El inglés es algo
// más grande, pero ese ya no lo usa nadie.
const HAY_BUSHELS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:bu|bushels?)\s*$/i;
const L_POR_BUSHEL = 35.23907016688;

function leerBushels(texto) {
  const m = String(texto ?? "").match(HAY_BUSHELS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "bu" };
}

function convertirBushels({ valor }) {
  return { valor: valor * L_POR_BUSHEL, a: "l" };
}

function textoBushels(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  return `${n.format(leido.valor)} bu = ${n.format(convertirBushels(leido).valor)} l`;
}

// "cd 1 peck", la fruta de los mercados de allí, que la venden por cestas. Es un
// cuarto de bushel. "pk" no lo cojo, que en las etiquetas son paquetes.
const HAY_PECKS = /^\s*(\d+(?:[.,]\d+)?)\s*pecks?\s*$/i;

function leerPecks(texto) {
  const m = String(texto ?? "").match(HAY_PECKS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "peck" };
}

function convertirPecks({ valor }) {
  return { valor: valor * L_POR_BUSHEL / 4, a: "l" };
}

function textoPecks(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  return `${n.format(leido.valor)} ${leido.valor === 1 ? "peck" : "pecks"} = ${n.format(convertirPecks(leido).valor)} l`;
}

// "cd 2 cu yd", la tierra, la grava y el hormigón de allí, que se piden por
// yardas. A m³, que en litros salen cifras de cuatro números. Y "cd 2 m³" al
// revés, para saber cuánto pedir allí.
const HAY_YARDAS_CUBICAS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:(cu\.?\s*y(?:ar)?ds?|yd³|cubic yards?|yardas? cúbicas?)|(m³|m3|metros? cúbicos?|cubic met(?:er|re)s?))\s*$/i;
const M3_POR_YARDA3 = 0.764554857984;

function leerYardasCubicas(texto) {
  const m = String(texto ?? "").match(HAY_YARDAS_CUBICAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: m[2] ? "cu yd" : "m³" };
}

function convertirYardasCubicas({ valor, de }) {
  return de === "m³" ? { valor: valor / M3_POR_YARDA3, a: "cu yd" } : { valor: valor * M3_POR_YARDA3, a: "m³" };
}

function textoYardasCubicas(leido) {
  if (!leido) return "";
  const otro = convertirYardasCubicas(leido);
  return `${numeros({ maximumFractionDigits: 1 }).format(leido.valor)} ${leido.de} = ${numeros({ maximumFractionDigits: 2 }).format(otro.valor)} ${otro.a}`;
}

// "cd 100yd", para el golf y las telas. Solo hacia los metros: "100 metros" ya
// lo cogen las alturas, y "100m" son cien millones.
const HAY_YARDAS = /^\s*(\d+(?:[.,]\d+)?)\s*(yds?|yards?|yardas?)\s*$/i;
const M_POR_YARDA = 0.9144;

function leerYardas(texto) {
  const m = String(texto ?? "").match(HAY_YARDAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "yd" };
}

function convertirYardas({ valor }) {
  return { valor: valor * M_POR_YARDA, a: "m" };
}

function textoYardas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirYardas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 10 sq yd", las alfombras y las telas. Solo hacia los m²: al revés ya
// salen los pies cuadrados, que es lo que se usa allí para los pisos.
const HAY_YARDAS_CUADRADAS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:sq\.?\s*yds?|yd²|yd2|square yards?|yardas? cuadradas?)\s*$/i;
const M2_POR_YARDA2 = M_POR_YARDA ** 2;

function leerYardasCuadradas(texto) {
  const m = String(texto ?? "").match(HAY_YARDAS_CUADRADAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "sq yd" };
}

function convertirYardasCuadradas({ valor }) {
  return { valor: valor * M2_POR_YARDA2, a: "m²" };
}

function textoYardasCuadradas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirYardasCuadradas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 2 sq in", las baldosas, los parches y las fotos. A cm², que en m² no se lee.
// Y "cd 100 cm²" al revés.
const HAY_PULGADAS_CUADRADAS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:(sq\.?\s*in(?:ch(?:es)?)?|in²|in2|square inch(?:es)?|pulgadas? cuadradas?)|(cm²|cm2|cent[ií]metros? cuadrados?|square centimet(?:er|re)s?))\s*$/i;

function leerPulgadasCuadradas(texto) {
  const m = String(texto ?? "").match(HAY_PULGADAS_CUADRADAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: m[2] ? "sq in" : "cm²" };
}

function convertirPulgadasCuadradas({ valor, de }) {
  return de === "cm²" ? { valor: valor / CM_POR_PULGADA ** 2, a: "sq in" } : { valor: valor * CM_POR_PULGADA ** 2, a: "cm²" };
}

function textoPulgadasCuadradas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirPulgadasCuadradas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 11st", el peso de la gente en Reino Unido. Muchas veces con libras
// detrás, "11 st 4 lb", como los pies y las pulgadas. Solo hacia los kilos:
// al revés ya están las libras.
const HAY_STONE = /^\s*(\d+(?:[.,]\d+)?)\s*(?:st|stones?)\s*(?:(\d+(?:[.,]\d+)?)\s*(?:lbs?|pounds?))?\s*$/i;
const LIBRAS_POR_STONE = 14;

function leerStone(texto) {
  const m = String(texto ?? "").match(HAY_STONE);
  if (!m) return null;
  const stone = Number(m[1].replace(",", "."));
  if (m[2] === undefined) return { stone, libras: 0 };
  const libras = Number(m[2].replace(",", "."));
  // 11 st 14 lb serían 12 st.
  return libras < LIBRAS_POR_STONE ? { stone, libras } : null;
}

function convertirStone({ stone, libras }) {
  return { valor: (stone * LIBRAS_POR_STONE + libras) * KG_POR_LIBRA, a: "kg" };
}

function textoStone(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  const antes = `${n.format(leido.stone)} st${leido.libras ? ` ${n.format(leido.libras)} lb` : ""}`;
  return `${antes} = ${n.format(convertirStone(leido).valor)} kg`;
}

// "cd 5 lb 4 oz", como lo dan las básculas de allí (y el peso de los bebés).
// Las dos a la vez; solas ya están las libras y las onzas.
const HAY_LIBRAS_Y_ONZAS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:lbs?|pounds?|libras?)\s*(\d+(?:[.,]\d+)?)\s*(?:oz|ounces?|onzas?)\s*$/i;
const ONZAS_POR_LIBRA = 16;

function leerLibrasYOnzas(texto) {
  const m = String(texto ?? "").match(HAY_LIBRAS_Y_ONZAS);
  if (!m) return null;
  const libras = Number(m[1].replace(",", "."));
  const onzas = Number(m[2].replace(",", "."));
  // 5 lb 16 oz serían 6 lb.
  return onzas < ONZAS_POR_LIBRA ? { libras, onzas } : null;
}

function convertirLibrasYOnzas({ libras, onzas }) {
  return { valor: (libras + onzas / ONZAS_POR_LIBRA) * KG_POR_LIBRA, a: "kg" };
}

// Con dos decimales: en un bebé, cien gramos son mucho.
function textoLibrasYOnzas(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  const kg = numeros({ maximumFractionDigits: 2 }).format(convertirLibrasYOnzas(leido).valor);
  return `${n.format(leido.libras)} lb ${n.format(leido.onzas)} oz = ${kg} kg`;
}

// "cd hoy" en la barra: cómo vas sin abrir nada. Arriba lo de hoy, y detrás el
// total del viaje y lo que queda del presupuesto.
const esHoyBarra = (texto) => /^\s*(hoy|today)\s*$/i.test(String(texto ?? ""));

function resumenHoyBarra(viaje, hoyIso = hoy()) {
  if (!viaje) return null;
  const dinero = (n) => numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const { gastos, presupuesto } = viaje;
  const nombre = viaje.nombre || tr("viajes.sinNombre");
  const deHoy = loDeHoy(presupuesto, gastos, hoyIso);
  const gastado = gastadoHoy(gastos, hoyIso);
  const principal = deHoy
    ? tr("barra.hoyDe", { gastado: dinero(deHoy.gastado), toca: dinero(deHoy.toca), to: presupuesto.to })
    : gastado ? tr("barra.hoy", { gastado: `${dinero(gastado.total)} ${gastado.to}` }) : tr("barra.hoyNada");
  const detalle = [];
  const total = sumarPorDivisa(gastos)[0];
  if (total) detalle.push(tr("barra.hoyViaje", { viaje: nombre, total: `${dinero(total.total)} ${total.to}` }));
  const estado = estadoPresupuesto(presupuesto, gastos, hoyIso);
  if (estado) {
    detalle.push(estado.queda < 0
      ? tr("presupuesto.pasado", { pasado: `${dinero(-estado.queda)} ${presupuesto.to}` })
      : tr("presupuesto.queda", { queda: `${dinero(estado.queda)} ${presupuesto.to}` }));
  }
  return { principal, detalle };
}

// "cd ayer", para repasar por la mañana lo que se gastó el día anterior.
const esAyerBarra = (texto) => /^\s*(ayer|yesterday)\s*$/i.test(String(texto ?? ""));

function resumenAyerBarra(viaje, hoyIso = hoy(), atras = 1) {
  if (!viaje) return null;
  const dinero = (n) => numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const clave = atras === 2 ? "barra.anteayer" : "barra.ayer";
  const [y, m, d] = hoyIso.split("-").map(Number);
  const ayerIso = isoLocal(new Date(y, m - 1, d - atras));
  const gastado = gastadoHoy(viaje.gastos, ayerIso);
  if (!gastado) return { principal: tr(`${clave}Nada`), detalle: [] };
  const deAyer = delDiaADia(viaje.gastos).filter((g) => g.to === gastado.to && isoLocal(new Date(g.cuando)) === ayerIso);
  const caro = deAyer.reduce((a, b) => (b.valor > a.valor ? b : a));
  const principal = tr(deAyer.length === 1 ? `${clave}Uno` : clave, { gastado: `${dinero(gastado.total)} ${gastado.to}`, n: deAyer.length });
  const detalle = deAyer.length > 1
    ? [tr("barra.ayerCaro", { gasto: `${caro.concepto || tr("barra.ayerSinConcepto")} ${dinero(caro.valor)}` })]
    : [];
  return { principal, detalle };
}

// "cd anteayer", lo mismo un día más atrás, para cuando ayer no lo miraste.
const esAnteayerBarra = (texto) => /^\s*(anteayer|antier|day before yesterday)\s*$/i.test(String(texto ?? ""));
const resumenAnteayerBarra = (viaje, hoyIso = hoy()) => resumenAyerBarra(viaje, hoyIso, 2);

// "cd viaje": el viaje entero, lo mismo que copia la J, con la media al día y
// cómo va el presupuesto.
const esViajeBarra = (texto) => /^\s*(viaje|trip|total)\s*$/i.test(String(texto ?? ""));

function resumenViajeBarra(viaje, hoyIso = hoy()) {
  if (!viaje) return null;
  const principal = totalParaCopiar(viaje);
  if (!principal) return { principal: tr("barra.viajeNada", { viaje: viaje.nombre || tr("viajes.sinNombre") }), detalle: [] };
  const dinero = (n) => numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const detalle = [tr(viaje.gastos.length === 1 ? "barra.viajeUno" : "barra.viajeGastos", { n: viaje.gastos.length })];
  const media = mediaPorDia(viaje.gastos);
  if (media) detalle.push(tr("barra.semanaDia", { media: dinero(media.media) }));
  const estado = estadoPresupuesto(viaje.presupuesto, viaje.gastos, hoyIso);
  if (estado) {
    detalle.push(estado.queda < 0
      ? tr("presupuesto.pasado", { pasado: `${dinero(-estado.queda)} ${viaje.presupuesto.to}` })
      : tr("presupuesto.queda", { queda: `${dinero(estado.queda)} ${viaje.presupuesto.to}` }));
  }
  return { principal, detalle };
}

// "cd caro": lo más caro del viaje, lo mismo que copia Shift+Q, con el día y lo
// que pesa en el total, que es lo que hace pensar si mereció la pena.
const esCaroBarra = (texto) => /^\s*(caro|lo m[aá]s caro|priciest|most expensive)\s*$/i.test(String(texto ?? ""));

function resumenCaroBarra(viaje, hoyIso = hoy()) {
  if (!viaje) return null;
  const caro = gastoMasCaro(viaje.gastos);
  if (!caro) return { principal: tr("barra.viajeNada", { viaje: viaje.nombre || tr("viajes.sinNombre") }), detalle: [] };
  const detalle = [nombreDia(isoLocal(new Date(caro.cuando)), hoyIso)];
  const total = sumarPorDivisa(viaje.gastos)[0];
  // Si es el único, "100 % del viaje" no dice nada.
  if (viaje.gastos.length > 1 && total?.to === caro.to && total.total > 0) {
    detalle.push(tr("barra.caroPeso", { pct: tr("pct", { n: Math.round((caro.valor / total.total) * 100) }) }));
  }
  return { principal: `👑 ${gastoParaCopiar(caro)}`, detalle };
}

// "cd semana": los últimos siete días contando hoy, no la semana del calendario,
// que el lunes por la mañana saldría casi vacía. "cd mes", lo mismo con treinta.
const esSemanaBarra = (texto) => /^\s*(semana|week)\s*$/i.test(String(texto ?? ""));
const esMesBarra = (texto) => /^\s*(mes|month)\s*$/i.test(String(texto ?? ""));

function resumenUltimosDias(viaje, cuantos, clave, formatoDia, hoyIso) {
  if (!viaje) return null;
  const dinero = (n) => numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const [y, m, d] = hoyIso.split("-").map(Number);
  const dias = Array.from({ length: cuantos }, (_, i) => isoLocal(new Date(y, m - 1, d - i)));
  const principal = sumarPorDivisa(viaje.gastos)[0];
  const deLosDias = principal ? viaje.gastos.filter((g) => g.to === principal.to && dias.includes(isoLocal(new Date(g.cuando)))) : [];
  const total = deLosDias.reduce((suma, g) => suma + g.valor, 0);
  if (total < 0.005) return { principal: tr(`barra.${clave}Nada`), detalle: [] };
  const porDia = new Map();
  for (const g of deLosDias) {
    const dia = isoLocal(new Date(g.cuando));
    porDia.set(dia, (porDia.get(dia) ?? 0) + g.valor);
  }
  // La media, desde el primer día con gastos: si el viaje empezó anteayer, entre tres.
  const desde = dias.indexOf([...porDia.keys()].sort()[0]) + 1;
  const detalle = [tr(`barra.${clave}Dia`, { media: dinero(total / desde) })];
  if (porDia.size > 1) {
    const [diaMas, cuanto] = [...porDia].reduce((a, b) => (b[1] > a[1] ? b : a));
    const [yy, mm, dd] = diaMas.split("-").map(Number);
    detalle.push(tr(`barra.${clave}Mas`, { dia: fechas(formatoDia).format(new Date(yy, mm - 1, dd)), gastado: dinero(cuanto) }));
  }
  const n = deLosDias.length;
  return { principal: tr(n === 1 ? `barra.${clave}Uno` : `barra.${clave}`, { gastado: `${dinero(total)} ${principal.to}`, n }), detalle };
}

const resumenSemanaBarra = (viaje, hoyIso = hoy()) => resumenUltimosDias(viaje, 7, "semana", { weekday: "long" }, hoyIso);
// En un mes el "martes" no dice cuál, así que va con su fecha.
const resumenMesBarra = (viaje, hoyIso = hoy()) => resumenUltimosDias(viaje, 30, "mes", { day: "numeric", month: "long" }, hoyIso);

// "cd tasa": la de tu par sin abrir nada. Detrás va de qué día es, que un lunes
// por la mañana todavía es la del viernes.
const esTasaBarra = (texto) => /^\s*(tasa|rate)\s*$/i.test(String(texto ?? ""));

function resumenTasaBarra(par, puntos) {
  const ultimo = Array.isArray(puntos) ? puntos[puntos.length - 1] : null;
  if (!par || par.from === par.to || !(ultimo?.valor > 0)) return null;
  const tasa = lineaTasa(ultimo.valor, par.from, par.to);
  const cambio = cambioDelDia(puntos);
  return {
    principal: cambio ? `${tasa} · ${textoCambioDia(cambio)}` : tasa,
    detalle: [lineaTasa(ultimo.valor, par.from, par.to, true), textoDeLaFecha(par, ultimo.fecha)],
  };
}

// "cd todos": todos los viajes juntos. Recibe la lista entera, no el activo.
// Los de otra divisa no se pueden sumar; los dejo fuera y lo digo.
const esTodosBarra = (texto) => /^\s*(todos|all)\s*$/i.test(String(texto ?? ""));

function resumenTodosBarra(viajes) {
  const filas = compararViajes(viajes?.lista ?? []).filter((f) => f.media !== null);
  if (!filas.length) return { principal: tr("barra.todosNada"), detalle: [] };
  const veces = new Map();
  for (const f of filas) veces.set(f.to, (veces.get(f.to) ?? 0) + 1);
  const comun = [...veces].sort((a, b) => b[1] - a[1])[0][0];
  const suyas = filas.filter((f) => f.to === comun);
  const dinero = (n) => numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const nombre = (id) => viajes.lista.find((v) => v.id === id)?.nombre || tr("viajes.sinNombre");
  const total = suyas.reduce((suma, f) => suma + f.media * f.dias, 0);
  const dias = suyas.reduce((suma, f) => suma + f.dias, 0);
  const principal = tr(suyas.length === 1 ? "barra.todosUno" : "barra.todos", {
    n: suyas.length,
    total: `${dinero(total)} ${comun}`,
    dias: tr(dias === 1 ? "barra.todosDia" : "barra.todosDias", { n: dias }),
  });
  const detalle = [tr("barra.semanaDia", { media: dinero(total / dias) })];
  const caro = suyas.find((f) => f.extremo === "caro");
  const barato = suyas.find((f) => f.extremo === "barato");
  if (caro) detalle.push(tr("barra.todosCaro", { viaje: nombre(caro.id), media: dinero(caro.media) }));
  if (barato) detalle.push(tr("barra.todosBarato", { viaje: nombre(barato.id), media: dinero(barato.media) }));
  const otras = filas.length - suyas.length;
  if (otras) detalle.push(tr(otras === 1 ? "barra.todosOtraUno" : "barra.todosOtra", { n: otras }));
  return { principal, detalle };
}

// Cuatro caben en dos filas de la pestaña sin que el popup crezca.
const AVISOS_MAX = 4;

// El sentido sale solo: si pides un valor por encima de lo que vale ahora es
// que esperas que suba, y al revés. Así no hay que elegirlo en ningún sitio.
// Comparo con la tasa como se ve, a cuatro decimales: si no, con la tasa real
// en 0,70049 y el campo en 0,7005, decía "sube de" lo que ya estaba ahí.
function sentidoAviso(umbral, rate) {
  if (typeof umbral !== "number" || typeof rate !== "number") return null;
  const vista = Math.round(rate * 1e4) / 1e4;
  if (umbral === vista) return null;
  return umbral > vista ? "sube" : "baja";
}

function crearAviso(from, to, umbral, rate, id) {
  const sentido = sentidoAviso(umbral, rate);
  if (!isValidCode(from) || !isValidCode(to) || from === to || !sentido || !(umbral > 0)) return null;
  return { id, from, to, sentido, umbral };
}

// "2 %" es que se mueva para cualquier lado; con signo, "+2 %" o "-1 %", solo
// hacia ese. Más de un 50 % en una divisa de las del BCE no pasa.
const AVISO_PCT_MAX = 50;

function leerPorcentajeAviso(texto) {
  const m = String(texto ?? "").trim().match(/^([+\-−]?)\s*(\d+(?:[.,]\d+)?)\s*%$/);
  if (!m) return null;
  const pct = Number(m[2].replace(",", "."));
  if (!(pct > 0) || pct > AVISO_PCT_MAX) return null;
  return { pct, signo: m[1] === "+" ? 1 : m[1] ? -1 : 0 };
}

// Con signo es un aviso de los de siempre, con la tasa ya calculada. Sin él
// guardo la de ahora y el porcentaje, y salta en cuanto se aleje eso.
function crearAvisoPorcentaje(from, to, { pct, signo }, rate, id) {
  if (!(rate > 0)) return null;
  if (signo !== 0) return crearAviso(from, to, rate * (1 + (signo * pct) / 100), rate, id);
  if (!isValidCode(from) || !isValidCode(to) || from === to || !(pct > 0) || pct > AVISO_PCT_MAX) return null;
  return { id, from, to, sentido: "mueve", umbral: rate, pct };
}

// Una compra es un aviso que baja: "180 USD por menos de 160 EUR" es que la
// tasa baje de 160/180. Guardo el precio y el máximo para el mensaje, que
// dividido y vuelto a multiplicar salía 159,99.
// "Avísame si marca su mejor tasa en tres meses". El umbral es el máximo de
// los días anteriores; el último es el de ahora, y con él nunca lo superaría.
const AVISO_MEJOR_DIAS = 90;
// Con menos de un mes de datos, "la mejor en tres meses" sería mentira.
const AVISO_MEJOR_MINIMO = 20;

function techoDeSerie(valores) {
  const buenos = (valores ?? []).filter((v) => Number.isFinite(v) && v > 0);
  return buenos.length < AVISO_MEJOR_MINIMO ? null : Math.max(...buenos.slice(0, -1));
}

function crearAvisoMejor(from, to, techo, rate, id) {
  if (!isValidCode(from) || !isValidCode(to) || from === to || !(techo > 0) || !(rate > 0) || rate >= techo) return null;
  return { id, from, to, sentido: "mejor", umbral: techo };
}

// El pico se va saliendo de los tres meses, así que el umbral se recalcula.
const ponerTechos = (avisos, techos) => avisos.map((a) => (a.sentido === "mejor" && techos[a.id] ? { ...a, umbral: techos[a.id] } : a));

function crearCompra(from, to, precio, maximo, rate, id) {
  if (!isValidCode(from) || !isValidCode(to) || from === to) return null;
  if (!(precio > 0) || !(maximo > 0) || !(rate > 0)) return null;
  if (maximo >= Math.round(precio * rate * 100) / 100) return null;
  return { id, from, to, sentido: "baja", umbral: maximo / precio, precio, maximo };
}

const esAvisoMueve = (a) => a.sentido === "mueve" && typeof a.pct === "number" && a.pct > 0 && a.pct <= AVISO_PCT_MAX;

// Los avisos de antes no traen precio; si lo traen, que esté entero.
const compraBien = (a) => !("precio" in a)
  || (a.sentido === "baja" && typeof a.precio === "number" && a.precio > 0 && typeof a.maximo === "number" && a.maximo > 0);

function leerAvisos(guardado) {
  if (!Array.isArray(guardado)) return [];
  return guardado
    .filter((a) => a && typeof a.id === "string" && isValidCode(a.from) && isValidCode(a.to)
      && (a.sentido === "sube" || a.sentido === "baja" || a.sentido === "mejor" || esAvisoMueve(a)) && typeof a.umbral === "number" && a.umbral > 0
      && compraBien(a))
    .slice(0, AVISOS_MAX);
}

// El margen es para que un 2 % justo no se quede en 1,99999 por los decimales.
const movimiento = (aviso, rate) => rate / aviso.umbral - 1;

function avisoCumplido(aviso, rate) {
  if (typeof rate !== "number") return false;
  if (aviso.sentido === "mueve") return Math.abs(movimiento(aviso, rate)) >= aviso.pct / 100 - 1e-9;
  // Igualar el máximo no es superarlo: si no, saltaría con la tasa de siempre.
  if (aviso.sentido === "mejor") return rate > aviso.umbral;
  return aviso.sentido === "sube" ? rate >= aviso.umbral : rate <= aviso.umbral;
}

// tasas va por base: { EUR: { USD: 1.13, … } }. Los que no tienen tasa (la
// petición de esa base falló) se quedan esperando a la próxima vuelta.
function repartirAvisos(avisos, tasas) {
  const cumplidos = [];
  const pendientes = [];
  for (const aviso of avisos) {
    const rate = tasas?.[aviso.from]?.[aviso.to];
    if (avisoCumplido(aviso, rate)) cumplidos.push({ aviso, rate });
    else pendientes.push(aviso);
  }
  return { cumplidos, pendientes };
}

// Solo sé la tasa del par que tienes puesto. Con el par dado la vuelta también
// vale: el aviso EUR→USD se mira con 1/rate.
function faltaParaAviso(aviso, { from, to }, rate) {
  if (!(rate > 0)) return null;
  const suya = aviso.from === from && aviso.to === to ? rate
    : aviso.from === to && aviso.to === from ? 1 / rate : null;
  if (suya === null) return null;
  if (aviso.sentido === "mueve") return Math.max(aviso.pct / 100 - Math.abs(movimiento(aviso, suya)), 0);
  const falta = aviso.sentido === "sube" || aviso.sentido === "mejor" ? aviso.umbral / suya - 1 : 1 - aviso.umbral / suya;
  return Math.max(falta, 0);
}

// Lo que lleva recorrido, para rellenar la pastilla: a un 5 % o más está
// vacía, que más lejos ya no es "a punto de saltar" sino esperar.
const cercaniaAviso = (falta) => Math.min(Math.max(1 - falta / 0.05, 0), 1);

// Por debajo de una décima "0,0 %" parece un fallo, mejor decir que está al caer.
function textoFalta(falta) {
  if (falta < 0.0005) return tr("avisos.casi");
  const pct = numeros({ style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(falta);
  return tr("avisos.falta", { pct });
}

function mensajeAviso(aviso, rate) {
  if (aviso.precio) {
    const dinero = (n, code) => `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ${code}`;
    return {
      titulo: tr("avisos.notiCompraTitulo", { precio: dinero(aviso.precio, aviso.from), cuesta: dinero(aviso.precio * rate, aviso.to) }),
      cuerpo: tr("avisos.notiCompra", { maximo: dinero(aviso.maximo, aviso.to) }),
    };
  }
  if (aviso.sentido === "mueve") {
    const cambio = movimiento(aviso, rate);
    const pct = numeros({ style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Math.abs(cambio));
    return {
      titulo: tr("avisos.notiTitulo", { from: aviso.from, tasa: tasaLarga(rate), to: aviso.to }),
      cuerpo: tr(cambio > 0 ? "avisos.notiMueveSube" : "avisos.notiMueveBaja", { pct, umbral: tasaLarga(aviso.umbral) }),
    };
  }
  if (aviso.sentido === "mejor") {
    return {
      titulo: tr("avisos.notiTitulo", { from: aviso.from, tasa: tasaLarga(rate), to: aviso.to }),
      cuerpo: tr("avisos.notiMejor", { umbral: tasaLarga(aviso.umbral) }),
    };
  }
  return {
    titulo: tr("avisos.notiTitulo", { from: aviso.from, tasa: tasaLarga(rate), to: aviso.to }),
    cuerpo: tr(aviso.sentido === "sube" ? "avisos.notiSube" : "avisos.notiBaja", { umbral: tasaLarga(aviso.umbral) }),
  };
}

// 0 vas bien, 1 pasado el 80 %, 2 pasado del todo.
const nivelPresupuesto = (fraccion) => (fraccion > 1 ? 2 : fraccion >= PRESUPUESTO_JUSTO ? 1 : 0);

// Lo avisado va atado al importe y la divisa: si subes el presupuesto puede
// volver a avisar, pero quitar un gasto y deshacerlo no.
const firmaPresupuesto = (p) => `${p.importe}|${p.to}`;

// Solo cuando entra un gasto nuevo, y uno solo: al poner un presupuesto que ya
// te pasas lo estás viendo, y restaurar una copia no es gastar.
function avisosPresupuesto(antes, despues, avisados = {}, hoyIso = hoy()) {
  const previos = new Map((antes?.lista ?? []).map((v) => [v.id, v]));
  const memoria = {};
  const avisos = [];
  for (const viaje of despues?.lista ?? []) {
    if (!viaje.presupuesto) continue;
    const firma = firmaPresupuesto(viaje.presupuesto);
    const estado = estadoPresupuesto(viaje.presupuesto, viaje.gastos, hoyIso);
    const nivel = nivelPresupuesto(estado.fraccion);
    const previo = previos.get(viaje.id);
    const comoAntes = previo?.presupuesto && firmaPresupuesto(previo.presupuesto) === firma;
    const base = avisados[viaje.id]?.firma === firma ? avisados[viaje.id].nivel
      : comoAntes ? nivelPresupuesto(estadoPresupuesto(previo.presupuesto, previo.gastos, hoyIso).fraccion)
        : nivel;
    const ids = new Set((previo?.gastos ?? []).map((g) => g.id));
    const nuevos = viaje.gastos.filter((g) => !ids.has(g.id)).length;
    if (comoAntes && nuevos === 1 && nivel > base) avisos.push({ viaje, nivel, estado });
    // Me quedo con el más alto: si borras el gasto y lo vuelves a poner, ya lo sabías.
    memoria[viaje.id] = { firma, nivel: Math.max(base, nivel) };
  }
  return { avisos, avisados: memoria };
}

function mensajePresupuesto({ viaje, nivel, estado }) {
  const { importe, to } = viaje.presupuesto;
  const dinero = (n) => `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ${to}`;
  // Hacia abajo: con 79,6 % no quiero decir "80 %".
  const pct = numeros({ style: "percent", maximumFractionDigits: 0 }).format(Math.floor(estado.fraccion * 100) / 100);
  const titulo = nivel === 2 ? tr("presupuesto.notiPasado") : tr("presupuesto.notiJusto", { pct });
  const cuerpo = nivel === 2
    ? tr("presupuesto.notiPasadoCuerpo", { gastado: dinero(estado.gastado), importe: dinero(importe), pasado: dinero(-estado.queda) })
    : estado.porDia !== null
      ? tr("presupuesto.notiQueda", { queda: dinero(estado.queda), porDia: dinero(estado.porDia) })
      : tr("presupuesto.notiQuedaSolo", { queda: dinero(estado.queda) });
  return { titulo: viaje.nombre ? `${viaje.nombre} · ${titulo}` : titulo, cuerpo };
}

// A las nueve: antes puedes estar todavía cenando. Quien cene tarde la pasa a las diez.
const RECORDATORIO_HORA = 21;
const RECORDATORIO_HORAS = [20, 21, 22];

const leerHoraRecordatorio = (hora) => (RECORDATORIO_HORAS.includes(hora) ? hora : RECORDATORIO_HORA);

// Sin presupuesto no sé si estás de viaje. Y con solo la fecha de vuelta, hasta
// que no apuntas el primer gasto tampoco: igual aún no has salido.
function viajesSinApuntar(viajes, hoyIso = hoy()) {
  return (viajes?.lista ?? [])
    .filter((v) => (v.presupuesto?.desde || v.gastos.length > 0) && diaDelViaje(v.presupuesto, v.gastos, hoyIso))
    .filter((v) => !v.gastos.some((g) => isoLocal(new Date(g.cuando)) === hoyIso))
    .sort((a, b) => (b.id === viajes.activo) - (a.id === viajes.activo));
}

// Uno al día como mucho, aunque estés en dos viajes a la vez.
function tocaRecordar(viajes, avisadoEl, ahora = new Date(), hora = RECORDATORIO_HORA) {
  const hoyIso = isoLocal(ahora);
  if (ahora.getHours() < leerHoraRecordatorio(hora) || avisadoEl === hoyIso) return null;
  return viajesSinApuntar(viajes, hoyIso)[0] ?? null;
}

function mensajeRecordatorio(viaje) {
  return {
    titulo: tr("recordatorio.titulo"),
    cuerpo: viaje.nombre ? tr("recordatorio.cuerpoEn", { viaje: viaje.nombre }) : tr("recordatorio.cuerpo"),
  };
}

// El tax free se pide en el aeropuerto al irte, y si no llevas los tiques ya no
// hay nada que hacer. Aviso el penúltimo día, o el último si ese no abriste
// Chrome, a partir de las diez, que de madrugada no sirve de nada.
const TAX_FREE_HORA = 10;

// Una vez por viaje y fecha de vuelta: si cambias la vuelta, vuelve a avisar.
function tocaTaxFree(viajes, avisados, ahora = new Date()) {
  if (ahora.getHours() < TAX_FREE_HORA) return null;
  const hoyIso = isoLocal(ahora);
  for (const viaje of viajes?.lista ?? []) {
    const hasta = viaje.presupuesto?.hasta;
    if (!hasta || avisados?.[viaje.id] === hasta) continue;
    const quedan = diasHasta(hasta, hoyIso);
    if (quedan < 1 || quedan > 2) continue;
    const [tax] = taxFree(viaje.gastos).filter((t) => t.pasan > 0 && t.tuya);
    if (tax) return { viaje, tax, hasta };
  }
  return null;
}

function mensajeTaxFree({ viaje, tax }) {
  const valor = `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(tax.tuya.valor)} ${tax.tuya.to}`;
  const compras = tax.pasan === 1 ? tr("taxFree.aviso.una") : tr("taxFree.aviso.n", { n: tax.pasan });
  return {
    titulo: tr("taxFree.aviso.titulo"),
    cuerpo: tr(viaje.nombre ? "taxFree.aviso.cuerpoEn" : "taxFree.aviso.cuerpo", { compras, valor, viaje: viaje.nombre }),
  };
}

// Por event.code y no por event.key: en Mac, Opción+S escribe "ß", y en otros
// teclados la tecla de la S puede traer otra letra.
const ATAJOS = {
  KeyS: "intercambiar",
  // I de invertir: la tasa de arriba, como al pulsarla.
  KeyI: "girarTasa",
  KeyT: "copiarTasa",
  KeyC: "copiar",
  // Y, que parece un ¥: el resultado con su símbolo, como Alt+clic en Copiar.
  KeyY: "copiarSimbolo",
  KeyD: "origen",
  KeyA: "destino",
  Digit1: "vista:evolucion",
  Digit2: "vista:extras",
  Digit3: "vista:avisos",
  Digit4: "vista:chuleta",
  Digit5: "vista:fecha",
  Digit6: "vista:timo",
  // El 0 no tenía pestaña: la cantidad a 1, que es como se mira la tasa.
  Digit0: "cantidadUno",
  KeyG: "gastos",
  // La A ya es el destino: U de apUntar.
  KeyU: "apuntar",
  // E de efectivo: con el concepto a medio escribir, Alt+E y sigues.
  KeyE: "pago",
  KeyV: "viajes",
  KeyN: "nuevoViaje",
  KeyP: "cuenta",
  // La H ya es la ayuda: R de "recientes".
  KeyR: "historial",
  // B de balanza.
  KeyB: "comparar",
  // O de ojo, el botón que hace lo mismo.
  KeyO: "discreto",
  // M de meses: 7D, 1M, 3M, 1A y vuelta.
  KeyM: "rango",
  // X de Excel, que es donde acaba el CSV.
  KeyX: "csv",
  // W de WhatsApp, que es donde va el resumen.
  KeyW: "compartir",
  // J, que no estaba cogida: el total del viaje, como el doble clic en la cifra.
  KeyJ: "copiarTotal",
  // Q, la otra libre: el último gasto suelto, como el doble clic en su cifra.
  KeyQ: "copiarGasto",
  // La C ya copia el resultado: K, que suena igual, copia la chuleta.
  KeyK: "chuleta",
  // L de lista: las otras divisas, también para WhatsApp.
  KeyL: "extras",
  // F de fijar: la chincheta del par que tienes puesto, que no sale en las pastillas.
  KeyF: "fijar",
  KeyZ: "deshacer",
  KeyH: "ayuda",
};

// Con Shift, la otra versión: la frase entera, la chuleta en papel, la tasa al
// revés, el CSV de todos los viajes, el gasto en efectivo, lo de hoy, el más
// caro o la frase con símbolos.
const CON_SHIFT = { copiar: "copiarFrase", copiarSimbolo: "copiarFraseSimbolo", chuleta: "imprimirChuleta", copiarTasa: "copiarTasaAlReves", csv: "csvViajes", apuntar: "apuntarEfectivo", copiarTotal: "copiarHoy", copiarGasto: "copiarMasCaro" };

// Escribiendo en un campo las letras son letras (la x es "por" en las
// cuentas), así que ahí hace falta Alt. Cmd y Ctrl no los toco nunca: son
// copiar, pegar y compañía.
function atajoPara({ code, key, altKey, ctrlKey, metaKey, shiftKey, enCampo }) {
  // La única excepción: Cmd+Z fuera de un campo no hace nada en el navegador, y
  // es lo primero que pulsas cuando borras algo sin querer.
  if ((ctrlKey || metaKey) && code === "KeyZ" && !enCampo && !altKey && !shiftKey) return "deshacer";
  if (ctrlKey || metaKey) return null;
  if (!enCampo && key === "?") return "ayuda";
  // Por la tecla y no por el código: en un teclado español la / es Shift+7. Y
  // solo fuera de los campos, que en la cantidad es dividir.
  if (!enCampo && key === "/") return "buscar";
  if (enCampo && !altKey) return null;
  const accion = ATAJOS[code] ?? null;
  return (shiftKey && CON_SHIFT[accion]) || accion;
}

function textoAtajo(code, esMac) {
  const tecla = code.replace(/^Key|^Digit/, "");
  return esMac ? `⌥${tecla}` : `Alt+${tecla}`;
}

function errorMessageFor(error) {
  if (error.name === "AbortError") return tr("error.tiempo");
  if (!navigator.onLine) return tr("error.sinRed");
  if (error.message.startsWith("HTTP")) return tr("error.servicio");
  return tr("error.otro");
}

// Lo mínimo por tique para pedir la devolución del IVA y el IVA de allí, de las
// guías de agosto de 2026. Solo las divisas de un país: con el euro no sé si
// estás en España (sin mínimo) o en Bélgica (125 €). Sin Reino Unido, que lo
// quitó en 2021, ni Estados Unidos, que no tiene.
const TAX_FREE = {
  JPY: { minimo: 5000, iva: 10 },
  CHF: { minimo: 300, iva: 8.1 },
  NOK: { minimo: 315, iva: 25 },
  ISK: { minimo: 12000, iva: 24 },
  TRY: { minimo: 1000, iva: 20 },
  KRW: { minimo: 15000, iva: 10 },
  SGD: { minimo: 100, iva: 9 },
  THB: { minimo: 2000, iva: 7 },
  AUD: { minimo: 300, iva: 10 },
  DKK: { minimo: 300.01, iva: 25 },
  CZK: { minimo: 2001, iva: 21 },
  HUF: { minimo: 70000, iva: 27 },
  PLN: { minimo: 200, iva: 23 },
  SEK: { minimo: 200, iva: 25 },
};

// Si lo pasas a una divisa de la UE es que vives en la UE, y dentro de la UE
// no te lo devuelven.
const DIVISAS_UE = new Set(["EUR", "DKK", "SEK", "CZK", "HUF", "PLN", "RON", "BGN"]);
const sinTaxFree = (from, to) => !TAX_FREE[from] || (DIVISAS_UE.has(from) && DIVISAS_UE.has(to));

// El IVA va dentro del precio: de 110 con un 10 %, 10 son impuesto. Es lo más
// que te pueden devolver; las agencias se quedan una parte.
const ivaDentro = (importe, iva) => (importe * iva) / (100 + iva);

// "cd iva 120 jpy": el IVA de allí y lo que es impuesto en ese precio. Los del
// tax free salen de su tabla para no tener dos cifras distintas del mismo país.
// En EE. UU. y Canadá no va dentro: lo suman en caja.
const IVA = {
  ...Object.fromEntries(Object.entries(TAX_FREE).map(([code, t]) => [code, t.iva])),
  EUR: [["🇪🇸", 21], ["🇫🇷", 20], ["🇩🇪", 19], ["🇮🇹", 22], ["🇵🇹", 23], ["🇳🇱", 21], ["🇬🇷", 24], ["🇮🇪", 23]],
  USD: "aparte", CAD: "aparte", BRL: "depende", INR: "depende", MYR: "depende",
  GBP: 20, CNY: 13, MXN: 16, HKD: 0, IDR: 12, ILS: 18, NZD: 15, PHP: 12, RON: 21, ZAR: 15, VND: 10, ARS: 21,
  MAD: 20, PEN: 18, COP: 19, CLP: 19, EGP: 14, AED: 5, TWD: 5, UYU: 22, CRC: 13, DOP: 18, TND: 19,
  KES: 16, LKR: 18, NPR: 13, KHR: 10, JOD: 16, QAR: 0, SAR: 15, GEL: 18, RSD: 20, BOB: 13, GTQ: 12, PYG: 10,
};

const HAY_IVA = /^\s*(?:iva|vat|gst)(?:\s+(\d+(?:[.,]\d+)*))?(?:\s+([a-z]{3}))?\s*$/i;

function leerIva(texto) {
  const m = String(texto ?? "").match(HAY_IVA);
  if (!m) return null;
  const code = m[2]?.toUpperCase() ?? null;
  if (code && IVA[code] === undefined) return null;
  const precio = m[1] ? leerNumero(m[1]) : null;
  if (m[1] && !(precio > 0)) return null;
  return { code, precio };
}

function textoIva(code, precio = null) {
  const iva = IVA[code];
  if (iva === undefined) return "";
  const inicio = `${banderaDivisa(code)} 🧾`;
  const tanto = (n) => tr("pct", { n: numeros({ maximumFractionDigits: 2 }).format(n) });
  if (Array.isArray(iva)) return `${inicio} ${iva.map(([bandera, n]) => `${bandera} ${tanto(n)}`).join(" · ")}`;
  if (typeof iva === "string") return `${inicio} ${tr(`iva.${code === "CAD" ? "cad" : iva === "aparte" ? "usd" : "depende"}`)}`;
  if (iva === 0) return `${inicio} ${tr("iva.nada")}`;
  if (!precio) return `${inicio} ${tr("iva.tipo", { pct: tanto(iva) })}`;
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // Redondeo el impuesto y el resto sale de restar, para que la suma cuadre.
  const impuesto = Math.round(ivaDentro(precio, iva) * 100) / 100;
  return `${inicio} ${tr("iva.conPrecio", { pct: tanto(iva), precio: `${dinero.format(precio)} ${code}`, sin: dinero.format(precio - impuesto), iva: dinero.format(impuesto) })}`;
}

// Las compras, una por tique: no sé en qué tienda fue cada una, así que no las
// junto aunque sean del mismo día. Mejor quedarme corto que prometer de más.
function taxFree(gastos) {
  const porDivisa = new Map();
  for (const g of gastos) {
    if (g.categoria !== "compras" || sinTaxFree(g.from, g.to)) continue;
    const { minimo, iva } = TAX_FREE[g.from];
    const d = porDivisa.get(g.from) ?? { divisa: g.from, minimo, iva, pasan: 0, cerca: 0, total: 0, devolucion: 0, tuya: new Map() };
    if (g.cantidad >= minimo) {
      d.pasan += 1;
      d.total += g.cantidad;
      d.devolucion += ivaDentro(g.cantidad, iva);
      d.tuya.set(g.to, (d.tuya.get(g.to) ?? 0) + ivaDentro(g.valor, iva));
    } else {
      d.cerca += 1;
    }
    porDivisa.set(g.from, d);
  }
  return [...porDivisa.values()]
    .map(({ tuya, ...d }) => {
      const [to, valor] = [...tuya].sort((a, b) => b[1] - a[1])[0] ?? [null, 0];
      const redondo = (n) => Math.round(n * 100) / 100;
      return { ...d, devolucion: redondo(d.devolucion), tuya: to ? { to, valor: redondo(valor) } : null };
    })
    .sort((a, b) => b.pasan - a.pasan || (b.tuya?.valor ?? 0) - (a.tuya?.valor ?? 0));
}

// El CSV del banco. Los españoles lo dan en euros, con punto y coma, la coma
// para los decimales y unas líneas de cabecera con la cuenta antes de la tabla.
function partirCsv(texto, sep) {
  const filas = [];
  let fila = [];
  let campo = "";
  let comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') {
        campo += '"';
        i += 1;
      } else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === sep) {
      fila.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i += 1;
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = "";
    } else campo += c;
  }
  if (campo || fila.length) filas.push([...fila, campo]);
  return filas.map((f) => f.map((x) => x.trim())).filter((f) => f.some(Boolean));
}

// "1.234,56", "-12,50 €", "-12.50" y "1,234.56": el último signo es el decimal.
// Un punto solo con tres cifras detrás son miles, que así lo pone el banco.
function numeroBanco(texto) {
  let t = String(texto ?? "").replace(/[€\s ]|EUR/gi, "").replace(/^\+/, "").replace(/^−/, "-");
  if (!/^-?[\d.,]+$/.test(t)) return null;
  const coma = t.lastIndexOf(",");
  const punto = t.lastIndexOf(".");
  if (coma > -1 && punto > -1) t = coma > punto ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
  else if (coma > -1) t = t.replace(",", ".");
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

// 03/11/2026, 3-11-26 o 2026-11-03. Siempre día antes que mes: es un banco español.
function fechaBanco(texto) {
  const t = String(texto ?? "").trim();
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  let a, mes, d;
  if (m) [, a, mes, d] = m.map(Number);
  else {
    m = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})\b/);
    if (!m) return null;
    [, d, mes, a] = m.map(Number);
    if (a < 100) a += 2000;
  }
  const fecha = new Date(a, mes - 1, d);
  if (fecha.getFullYear() !== a || fecha.getMonth() !== mes - 1 || fecha.getDate() !== d) return null;
  return isoLocal(fecha);
}

const COLUMNAS_BANCO = {
  fecha: [/^f(echa)?\.? ?(de )?operacion/, /^fecha$/, /^fecha/],
  concepto: [/^concepto/, /^descripcion/, /^movimiento/, /^detalle/],
  importe: [/^importe/, /^cantidad/],
  cargo: [/^cargo/, /^debe$/],
};

// La primera columna que case, por orden de preferencia: "fecha operación"
// antes que "fecha valor", que es cuando lo cobra el banco y no cuando pagaste.
function columnaBanco(cabecera, patrones) {
  for (const patron of patrones) {
    const i = cabecera.findIndex((c) => patron.test(normalizar(c)) && !/valor/.test(normalizar(c)));
    if (i > -1) return i;
  }
  return -1;
}

function leerCsvBanco(texto) {
  const limpio = String(texto ?? "").replace(/^﻿/, "");
  const primeras = limpio.split(/\r?\n/).slice(0, 20).join("\n");
  const sep = [";", "\t", ","].map((c) => [c, primeras.split(c).length]).sort((a, b) => b[1] - a[1])[0][0];
  const filas = partirCsv(limpio, sep);
  const donde = filas.slice(0, 20).findIndex((f) => columnaBanco(f, COLUMNAS_BANCO.fecha) > -1
    && (columnaBanco(f, COLUMNAS_BANCO.importe) > -1 || columnaBanco(f, COLUMNAS_BANCO.cargo) > -1));
  if (donde === -1) return { error: "columnas" };
  const cabecera = filas[donde];
  const col = Object.fromEntries(Object.entries(COLUMNAS_BANCO).map(([k, p]) => [k, columnaBanco(cabecera, p)]));
  const movimientos = [];
  for (const f of filas.slice(donde + 1)) {
    const fecha = fechaBanco(f[col.fecha]);
    if (!fecha) continue;
    // Con "Importe", lo que sale va en negativo; con "Cargo", en positivo.
    const bruto = col.importe > -1 ? numeroBanco(f[col.importe]) : numeroBanco(f[col.cargo]);
    const importe = col.importe > -1 ? -bruto : bruto;
    if (!(importe > 0)) continue;
    movimientos.push({ fecha, concepto: col.concepto > -1 ? f[col.concepto] : "", importe: Math.round(importe * 100) / 100 });
  }
  if (movimientos.length === 0) return { error: "vacio" };
  return { movimientos: movimientos.sort((a, b) => a.fecha.localeCompare(b.fecha)) };
}

// "COMPRA TARJ. 5402XXXXXXXX1234 LAWSON SHIBUYA" → "Lawson Shibuya". Sin quitar
// el "COMPRA" de delante, todo acababa en la categoría de compras.
const PREFIJOS_BANCO = /^(compra|pago|cargo|adeudo|operacion)( con)?( en)?( tarj(eta|\.)?( de credito| de debito| credito| debito)?)?( en)?[\s.:-]*/i;

function conceptoBanco(texto) {
  const t = String(texto ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(PREFIJOS_BANCO, "")
    .replace(/[:*]*\b\d{4,}[\dX*]*\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const bonito = t.toLocaleLowerCase(localeActual()).replace(/(^|\s)(\p{L})/gu, (_, sp, l) => sp + l.toLocaleUpperCase(localeActual()));
  return limpiarConcepto(bonito);
}

// Fines de semana y festivos el BCE no publica: vale la del último día que sí.
function tasaDeEseDia(tasas, fecha) {
  const dias = Object.keys(tasas ?? {}).sort();
  if (!dias.length) return null;
  const antes = dias.filter((d) => d <= fecha).at(-1) ?? dias[0];
  return tasas[antes];
}

// Lo de un mismo día con el mismo importe ya está: lo apuntaste a mano o lo
// importaste antes. El concepto no lo miro, que el del banco nunca es el tuyo.
const yaApuntado = (gastos, fecha, importe, to) => gastos.some((g) => g.to === to
  && isoLocal(new Date(g.cuando)) === fecha && Math.abs(g.valor - importe) < 0.005);

function gastosDelBanco(movimientos, { from, to = "EUR", tasas, existentes = [], idBase = "b" }) {
  const nuevos = [];
  let repetidos = 0;
  movimientos.forEach((m, i) => {
    if (yaApuntado([...existentes, ...nuevos], m.fecha, m.importe, to)) {
      repetidos += 1;
      return;
    }
    const tasa = tasaDeEseDia(tasas, m.fecha);
    if (!(tasa > 0)) return;
    const [a, mes, d] = m.fecha.split("-").map(Number);
    const concepto = conceptoBanco(m.concepto);
    const gasto = crearGasto({
      id: `${idBase}${i.toString(36)}`, from, to, cuando: new Date(a, mes - 1, d, 12).getTime(),
      cantidad: Math.round((m.importe / tasa) * 100) / 100,
      valor: m.importe,
      concepto,
      categoria: adivinarCategoria(concepto) ?? CATEGORIA_POR_DEFECTO,
      pago: "tarjeta",
      // Lo del banco ya lleva su comisión dentro y no sé cuánta.
      comision: 0,
    });
    if (gasto) nuevos.push(gasto);
  });
  return { nuevos, repetidos };
}

// La tarjeta del viaje, para enseñarla al volver: lo que cuenta de un vistazo.
// Los días son los del presupuesto si los tiene; si no, del primer gasto del día
// a día al último, como la media.
function datosTarjeta(viaje, hoyIso = hoy()) {
  const { gastos = [], presupuesto = null } = viaje ?? {};
  const [total] = sumarPorDivisa(gastos);
  if (!total) return null;
  const diarios = delDiaADia(gastos);
  const fechas = gastosPorDia(diarios.length ? diarios : gastos).map((d) => d.dia).sort();
  const desde = presupuesto?.desde ?? fechas[0];
  const hasta = presupuesto?.hasta ?? fechas.at(-1);
  const { caro, dia } = destacados(gastos, hoyIso);
  const estado = estadoPresupuesto(presupuesto, gastos, hoyIso);
  const media = mediaPorDia(gastos);
  return {
    nombre: viaje.nombre || tr("viajes.sinNombre"),
    color: viaje.color ?? COLOR_POR_DEFECTO,
    desde,
    hasta,
    dias: Math.max(diasHasta(hasta, desde), 1),
    n: gastos.length,
    total,
    otras: sumarPorDivisa(gastos).slice(1),
    media: media ? { valor: media.media, to: media.to } : null,
    caro: caro ? { concepto: caro.concepto || nombreCategoria(caro.categoria), valor: caro.valor, to: caro.to, categoria: caro.categoria } : null,
    diaMas: dia ? { dia: dia.dia, total: dia.total, to: dia.to } : null,
    categorias: desglose(gastos).slice(0, 3),
    presupuesto: estado ? { importe: presupuesto.importe, to: presupuesto.to, queda: estado.queda } : null,
    comisiones: comisionesPagadas(gastos),
    cambio: cambioDelViaje(gastos),
    cabeza: porPersona(gastos, viaje.personas),
  };
}

// La copia de seguridad guarda lo tuyo: viajes, avisos, historial y
// preferencias. Las tasas guardadas no, que caducan en un día.
const COPIA_APP = "ConversorDivisas";
const COPIA_VERSION = 1;

// Todo pasa por los mismos lectores que al abrir el popup: una copia tocada a
// mano o a medias no puede meter nada que el popup no se trague.
function limpiarCopia(crudo) {
  const d = crudo && typeof crudo === "object" ? crudo : {};
  const datos = { viajes: leerViajes(d.viajes, d.gastosViaje, d.presupuestoViaje) };
  const { from, to } = d.lastPair ?? {};
  if (isValidCode(from) && isValidCode(to)) datos.lastPair = { from, to };
  if (Array.isArray(d.paresRecientes)) datos.paresRecientes = leerRecientes(d.paresRecientes);
  if (Array.isArray(d.divisasExtra)) datos.divisasExtra = leerExtras(d.divisasExtra);
  if (Array.isArray(d.avisos)) datos.avisos = leerAvisos(d.avisos);
  if (Array.isArray(d.historialConversiones)) datos.historialConversiones = leerHistorial(d.historialConversiones);
  if (d.rangoGrafico !== undefined) datos.rangoGrafico = leerRango(d.rangoGrafico);
  if (d.comisionBanco !== undefined) datos.comisionBanco = leerComision(d.comisionBanco);
  if (Array.isArray(d.tarjetasBanco)) datos.tarjetasBanco = leerTarjetas(d.tarjetasBanco);
  if (d.impuestoVenta !== undefined) datos.impuestoVenta = leerImpuesto(d.impuestoVenta);
  if (leerCafe(d.precioCafe)) datos.precioCafe = leerCafe(d.precioCafe);
  if (leerCafe(d.sueldoHora)) datos.sueldoHora = leerCafe(d.sueldoHora);
  if (d.pagoGasto !== undefined) datos.pagoGasto = leerPago(d.pagoGasto);
  if (d.cuentaReparto !== undefined) datos.cuentaReparto = leerCuenta(d.cuentaReparto);
  if (typeof d.insigniaActiva === "boolean") datos.insigniaActiva = d.insigniaActiva;
  if (typeof d.recordatorioActivo === "boolean") datos.recordatorioActivo = d.recordatorioActivo;
  if (RECORDATORIO_HORAS.includes(d.recordatorioHora)) datos.recordatorioHora = d.recordatorioHora;
  if (typeof d.tasaAlReves === "boolean") datos.tasaAlReves = d.tasaAlReves;
  if (d.idioma === "auto" || TEXTOS[d.idioma]) datos.idioma = d.idioma;
  if (leerCategoriasPropias(d.categoriasPropias).length) datos.categoriasPropias = leerCategoriasPropias(d.categoriasPropias);
  return datos;
}

// Las claves que borro antes de restaurar: las de la copia y las de antes de
// los viajes, para que no vuelvan a aparecer mezcladas.
const CLAVES_COPIA = [
  "viajes", "gastosViaje", "presupuestoViaje", "lastPair", "paresRecientes", "divisasExtra", "avisos",
  "historialConversiones", "rangoGrafico", "comisionBanco", "tarjetasBanco", "impuestoVenta", "pagoGasto", "cuentaReparto", "insigniaActiva", "tasaAlReves", "idioma",
  "recordatorioActivo", "recordatorioHora", "precioCafe", "sueldoHora", "categoriasPropias",
];

// Lo que se lleva tu cuenta de Chrome a tus otros ordenadores: cómo lo tienes
// puesto, no lo que haces. Los viajes no, que no caben (la nube da 100 KB) y
// pisarse los gastos entre dos ordenadores sería peor. Los avisos de tasa
// tampoco: saltarían en cada ordenador que tengas abierto.
const CLAVES_SYNC = [
  "comisionBanco", "tarjetasBanco", "impuestoVenta", "precioCafe", "sueldoHora", "pagoGasto", "cuentaReparto", "divisasExtra",
  "paresRecientes", "rangoGrafico", "insigniaActiva", "tasaAlReves", "idioma", "recordatorioActivo", "recordatorioHora",
];

// Lo que llega de otro ordenador pasa por los mismos lectores que la copia: si
// en el otro hay una versión vieja de la extensión, aquí no entra nada raro.
function limpiarSync(crudo) {
  const d = crudo && typeof crudo === "object" ? crudo : {};
  const limpio = limpiarCopia(Object.fromEntries(CLAVES_SYNC.filter((c) => c in d).map((c) => [c, d[c]])));
  return Object.fromEntries(CLAVES_SYNC.filter((c) => c in limpio).map((c) => [c, limpio[c]]));
}

// Solo lo que es distinto: si no, cada cambio volvería rebotado del otro lado.
function cambiosSync(origen, destino) {
  const limpio = limpiarSync(origen);
  const otro = destino ?? {};
  return Object.fromEntries(Object.entries(limpio).filter(([c, v]) => JSON.stringify(v) !== JSON.stringify(otro[c])));
}

// Al arrancar: lo que hay en la nube manda, que es lo último que tocaste en
// algún sitio; lo que solo tienes aquí sube. Así el ordenador nuevo coge lo
// tuyo y el de siempre no pierde nada la primera vez.
function mezclaInicial(local, nube) {
  const deNube = limpiarSync(nube);
  const deLocal = limpiarSync(local);
  const sube = Object.fromEntries(Object.entries(deLocal).filter(([c]) => !(c in deNube)));
  return { aLocal: cambiosSync(deNube, deLocal), aNube: sube };
}

function crearCopia(crudo, ahora = new Date()) {
  return { app: COPIA_APP, version: COPIA_VERSION, creada: ahora.toISOString(), datos: limpiarCopia(crudo) };
}

function leerCopia(texto) {
  let copia;
  try {
    copia = JSON.parse(texto);
  } catch {
    return { error: "json" };
  }
  if (!copia || copia.app !== COPIA_APP || !copia.datos || typeof copia.datos !== "object") return { error: "otra" };
  if (!Number.isInteger(copia.version) || copia.version > COPIA_VERSION) return { error: "version" };
  const creada = typeof copia.creada === "string" && !Number.isNaN(Date.parse(copia.creada)) ? copia.creada : null;
  return { datos: limpiarCopia(copia.datos), creada };
}

// Un viaje para pasárselo al grupo. Con su propio tipo, para que no se pueda
// restaurar como copia y te borre todo. Las notas no viajan, que son tuyas.
const PAQUETE_TIPO = "viaje";
const PAQUETE_VERSION = 1;

function crearPaquete(viaje) {
  return {
    app: COPIA_APP, tipo: PAQUETE_TIPO, version: PAQUETE_VERSION,
    nombre: viaje.nombre, personas: viaje.personas, gente: viaje.gente ?? [],
    gastos: viaje.gastos.map(({ nota: _, ...g }) => g),
  };
}

function leerPaquete(texto) {
  let crudo;
  try {
    crudo = JSON.parse(texto);
  } catch {
    return { error: "json" };
  }
  if (!crudo || crudo.app !== COPIA_APP || crudo.tipo !== PAQUETE_TIPO) return { error: "otra" };
  if (!Number.isInteger(crudo.version) || crudo.version > PAQUETE_VERSION) return { error: "version" };
  const gastos = leerGastos(crudo.gastos);
  if (!gastos.length) return { error: "vacio" };
  return { nombre: limpiarNombreViaje(crudo.nombre), personas: leerPersonas(crudo.personas), gente: leerGente(crudo.gente), gastos };
}

// Cada uno tiene a la gente numerada a su manera: en su lista él es el 0.
// Primero por el nombre; el resto, a los huecos libres, tú el último, porque
// quien te manda el archivo no eres tú.
function quienEsQuien(paquete, viaje) {
  const n = paquete.personas;
  const mios = Math.max(leerPersonas(viaje.personas), n);
  const mapa = Array(n).fill(null);
  const libres = new Set([...Array(mios).keys()].slice(1).concat(0));
  for (let i = 1; i < n; i += 1) {
    const nombre = normalizar(paquete.gente[i] ?? "");
    if (!nombre) continue;
    const j = [...libres].find((k) => normalizar(viaje.gente?.[k] ?? "") === nombre);
    if (j !== undefined) {
      mapa[i] = j;
      libres.delete(j);
    }
  }
  return mapa.map((j) => {
    if (j !== null) return j;
    const [primero] = libres;
    libres.delete(primero);
    return primero;
  });
}

const mapaValido = (mapa) => new Set(mapa).size === mapa.length;

// Si lo del otro va entre dos y tú sois cuatro, su "todos" no son tus cuatro:
// por eso pongo quiénes entran. Con una sola persona en su viaje no dice nada.
function aMiViaje({ pagador, entre: _e, partes: _p, ...gasto }, original, n, mapa, personas) {
  const mio = (i) => mapa[i < n ? i : 0];
  const quien = mio(leerPagador(pagador));
  const entran = n > 1 ? quienesEntran(original, n).map(mio) : [];
  const suyas = partesDe(original, n);
  return {
    ...gasto,
    ...(quien ? { pagador: quien } : {}),
    ...(entran.length && entran.length < personas ? { entre: leerEntre(entran) } : {}),
    ...(suyas ? { partes: Object.fromEntries(Object.entries(suyas).map(([i, p]) => [mio(Number(i)), p])) } : {}),
  };
}

// Lo mismo el mismo día y por lo mismo puede ser la cena que apuntasteis los
// dos, o dos cafés iguales: lo marco y decide quien lo importa.
function gastosParaJuntar(paquete, viaje, mapa) {
  const ids = new Set(viaje.gastos.map((g) => g.id));
  const to = sumarPorDivisa(viaje.gastos)[0]?.to ?? viaje.presupuesto?.to ?? sumarPorDivisa(paquete.gastos)[0].to;
  const personas = Math.max(leerPersonas(viaje.personas), paquete.personas);
  const parecido = (g) => viaje.gastos.some((m) => m.from === g.from && Math.abs(m.cantidad - g.cantidad) < 0.005
    && isoLocal(new Date(m.cuando)) === isoLocal(new Date(g.cuando)));
  const nuevos = paquete.gastos.filter((g) => !ids.has(g.id));
  const validos = nuevos.filter((g) => g.to === to);
  return {
    to,
    personas,
    yaEstan: paquete.gastos.length - nuevos.length,
    otraDivisa: nuevos.length - validos.length,
    filas: validos.map((g) => ({ gasto: aMiViaje(g, g, paquete.personas, mapa, personas), repetido: parecido(g) })),
  };
}

// Ordenados por fecha: la lista va siempre de lo último a lo primero.
function juntarGastos(viaje, nuevos, personas) {
  return { gastos: [...nuevos, ...viaje.gastos].sort((a, b) => b.cuando - a.cuando), personas: Math.max(leerPersonas(viaje.personas), personas) };
}

function resumenCopia(datos) {
  return {
    viajes: todosLosViajes(datos.viajes).length,
    gastos: todosLosViajes(datos.viajes).reduce((suma, v) => suma + v.gastos.length + (v.empresa?.length ?? 0), 0),
    avisos: datos.avisos?.length ?? 0,
    conversiones: datos.historialConversiones?.length ?? 0,
  };
}

// El popup lo carga como script normal y lo lee del ámbito global; Node necesita
// el export. Sin esto habría que montar un build, y aquí no hay ninguno.
if (typeof module !== "undefined") {
  module.exports = {
    datosTarjeta,
    NOTA_MAX, limpiarNota, cambiarNota,
    esFijo, delDiaADia, marcarFijo,
    numeroBanco, fechaBanco, leerCsvBanco, conceptoBanco, tasaDeEseDia, gastosDelBanco,
    TAX_FREE, taxFree,
    tasaLegible, DIVISAS_BCE, DIVISAS_MERCADO, esDeMercado, parDeMercado, urlTasa, urlTasaDia, urlSerie, urlsTodas, aFormatoV1, juntarTasas, pedirTodas,
    CURRENCIES, isValidCode, nombreDe, parseAmount, isoLocal, hoy, isFresh,
    evaluar, completar, leerImporte, UNIDADES, quitarUnidad, nombreUnidad, porUnidadMetrica, esOperacion, pasoCantidad, pasoPorDiez, RUEDA_PASO, pasosRueda, cifraCompleta, leerCantidad,
    normalizar, filtrarDivisas, buildPaths, startDateFor, errorMessageFor,
    RECIENTES_MAX, FIJOS_MAX, apuntarReciente, fijarReciente, leerRecientes, recientesVisibles,
    RANGOS, RANGO_POR_DEFECTO, leerRango, siguienteRango, coordenadas, alturaEn, MOMENTO_UMBRAL, momento, textoMomento,
    SEMANAS_MINIMAS, mejorDiaSemana, nombreDiaSemana, textoDiaSemana, indiceCercano, extremos, fechaCorta, largoEnPantalla,
    leerNumero, divisaDe, leerSeleccion, sumarSeleccion, notaDeSuma, destinoPara, leerPegado, leerPegadoSuelto, leerColumna, cuentaDeColumna, buscarPrecios, precioEntero, leerOmnibox, leerMezcla, textoMezcla, precioUnidadBarra, leerGastoBarra, gastoDeBarra, gastoDeTarjeta, escaparXml,
    divisaDeIdioma, parPorIdioma, banderaDe, banderaDivisa,
    HISTORIAL_MAX, leerHistorial, apuntarConversion, quitarConversion, haceCuanto, ultimoDeHoy, textoParaCopiar, fraseParaCopiar, gastoParaCopiar, ultimoGasto, gastoMasCaro, totalParaCopiar, hoyParaCopiar, simboloDe, textoConSimbolo, fraseConSimbolo,
    celdaCsv, csvHistorial, csvGastos, csvViajes,
    GASTOS_MAX, CONCEPTO_MAX, crearGasto, leerGastos, esDevolucion, devolucionDe, apuntarGasto, NOCHES_MAX, repartirCentimos, repartirNoches, repartoPorDias, apuntarNoches, quitarGasto, cambiarConcepto, cambiarDia, buscarGastos, trozosResaltados, repetirGasto, devolverGasto, devolverTodos, sumarPorDivisa, gastosPorDia, huecoEntre, cifraEnMarcha, categoriaDelDia, pesoDeLosDias, ordenarPorImporte, masCarosDelDia, pesoDeLosGastos, RARO_VECES, mediana, gastoRaro, REPETIDO_MS, gastoRepetido, mediaPorDia, categoriasAlDia, mediaPorGasto, comisionesPagadas, cambioDelViaje, cifraCambio, textoCambio, pagadoEnEfectivo, ahorroEnEfectivo,
    RETIRADAS_MAX, leerRetiradas, crearRetirada, cambioDelCajero, sobreElBce, alCambioDelCajero, apuntarRetirada, quitarRetirada, efectivoQueda, EFECTIVO_POCO, tonoEfectivo, redondoDeCajero, cuantoSacar, loQueSobra, gastadoHoy, nombreDia,
    CATEGORIAS, CATEGORIA_POR_DEFECTO, CATEGORIAS_PROPIAS_MAX, NOMBRE_CATEGORIA_MAX, esCategoria, leerCategoriasPropias, ponerCategoriasPropias, todasCategorias, nombreCategoria, emojiCategoria, crearCategoriaPropia, quitarCategoriaPropia, sinCategoria, adivinarCategoria, PAGOS, PAGO_POR_DEFECTO, leerPago, comisionDelPago, desglose, conceptosUsados, completarConcepto,
    EMOJI_CATEGORIA, destacados, resumenParaCompartir, FINDE_MINIMO, findeContraSemana, ESTRELLA_MINIMO, conceptoEstrella,
    TARJETAS_MAX, NOMBRE_TARJETA_MAX, anadirTarjeta, leerTarjetas, quitarTarjeta, tarjetaActual, siguientePago, mejorTarjeta,
    COPIA_APP, COPIA_VERSION, CLAVES_COPIA, CLAVES_SYNC, limpiarSync, cambiosSync, mezclaInicial, limpiarCopia, crearCopia, leerCopia, resumenCopia,
    crearPaquete, leerPaquete, quienEsQuien, mapaValido, gastosParaJuntar, juntarGastos,
    puedeSerDeEmpresa, pasarAEmpresa, sacarDeEmpresa, notaDeGastos,
    AVISO_MEJOR_DIAS, techoDeSerie, crearAvisoMejor, ponerTechos,
    presupuestoSugerido, PARTES_VALIDAS, leerPartes, partesDe, repartirPorPartes, textoParte,
    VIAJES_MAX, NOMBRE_VIAJE_MAX, leerViajes, leerPersonas, porPersona, consumoGente, leerPagador, leerGente, ponerNombre, nombrePersona, inicialPersona, cuentasViaje, frasePago, COBRO_GASTOS_MAX, mensajeCobro, leerEntre, entreDe, fraseEntre, cambiarEntre, leerSaldados, saldarPago, quitarSaldado, fraseSaldado, hayOtrosPagadores, NOMBRE_PERSONA_MAX, compararViajes, COLORES_VIAJE, leerColorViaje, colorLibre, siguienteColor, viajeActivo, ARCHIVADOS_MAX, archivarViaje, desarchivarViaje, borrarArchivado, todosLosViajes, crearViaje, nombreCopia, nombreDeDestino, duplicarViaje, renombrarViaje, elegirViaje, borrarViaje, moverGasto, cambiarViaje, TRAMOS_MAX, NOMBRE_TRAMO_MAX, leerTramos, ponerTramo, quitarTramo, tramoDelDia, resumenTramos, curvaPresupuesto, FRANJAS, HORAS_MINIMO, horaFiable, porFranja, PENDIENTES_MAX, leerPendientes, crearPendiente, cambiarVence, pendientesPorFecha, tocaPagar, tonoVence, textoVence, PENDIENTE_HORA, tocaPendientes, avisadosPendientes, mensajePendientes, apuntarPendiente, quitarPendiente, totalPendiente, pagarPendiente, resumenViaje, archivoGastos,
    diasHasta, leerPresupuesto, leerTopes, PRESUPUESTO_JUSTO, estadoPresupuesto, estadoTopes, alDiaAlli, inicioDelViaje, diaDelViaje, cuentaAtras, textoCuentaAtras, huchaViaje, loDeHoy, CELEBRADOS_MAX, leerCelebrados, anadirCelebrado, viajeParaCelebrar, textoCelebrar, RACHA_MINIMA, rachaPresupuesto, hastaCuandoLlega, previsionViaje, PREVISION_JUSTA, textoPrevision, loQueSeLleva, redondearDias,
    EXTRAS_MAX, EXTRAS_POR_DEFECTO, leerExtras, anadirExtra, quitarExtra,
    extrasVisibles, disponiblesParaAnadir, convertirExtras, semanaDe, trazoMini, CHULETA, escalaChuleta, chuleta, TRUCO_TOLERANCIA, trucoDeCabeza, textoTruco, tituloTruco, chuletaParaCompartir, extrasParaCompartir,
    urlImpresion, leerImpresion, chuletaParaImprimir,
    COMISION_MAX, COMISIONES_RAPIDAS, leerComision, leerPorcentaje, conComision,
    IMPUESTO_MAX, IMPUESTOS_RAPIDOS, leerImpuesto, leerImpuestoEscrito, loQuePagas,
    COMPARAR_IGUAL, compararPrecios, inclinacion, ZONAS, desfase, esNoche, horaAlli, SIGLAS_ZONA, leerHoraZona, convertirHoraZona, textoHoraZona, textoDiferencia, relojDe, tituloHoraAlli, leerCafe, enCafes, textoCafes, HORAS_JORNADA, enHoras, textoHoras,
    PROPINAS_RAPIDAS, PROPINA_HABITUAL, propinaHabitual, leerPropina, textoPropina, ENCHUFES, leerEnchufe, enchufeDe, textoEnchufe, EMERGENCIAS, leerEmergencias, textoEmergencias, AGUA, leerAgua, textoAgua, POR_LA_IZQUIERDA, CARNE_EUROPEO, leerConducir, textoConducir, PREFIJOS, leerPrefijo, textoPrefijo, FRASES, leerGracias, textoGracias, IVA, leerIva, textoIva, PROPINA_MAX, PERSONAS_MAX, CUENTA_POR_DEFECTO, leerCuenta, redondoHaciaArriba, repartirCuenta, cuentaParaCompartir, gastoDeLaCuenta, BILLETES, leerBilletes, textoBilletes, PAGOS_MAX, pagosPosibles, vuelta, pagoJusto,
    MARGENES, tasaOfrecida, analizarCambio,
    domingoDePascua, hayTasaEl, tasaVieja, textoTasaVieja, horaBce, textoActualizado, proximaTasa, textoProximaTasa,
    FECHA_MINIMA, fechaLarga, fechaValida, diaDelGrafico, mesesAtras, FECHAS_RAPIDAS, leerFecha, cambioDesde, notaDiaHabil,
    textoInsignia, cambioDiario, sentidoDe, cambioDelDia, textoCambioDia, ULTIMA_VEZ_MINIMO, desdeLaUltimaVez, ultimoVisto, tituloInsignia, tituloHoy, leerGrados, convertirGrados, textoGrados, leerGas, convertirGas, textoGas, leerDistancia, convertirDistancia, textoDistancia, leerRitmo, convertirRitmo, textoRitmo, leerPeso, convertirPeso, textoPeso, leerOnzas, convertirOnzas, textoOnzas, leerOnzasTroy, convertirOnzasTroy, textoOnzasTroy, leerAltura, convertirAltura, textoAltura, leerVelocidad, convertirVelocidad, textoVelocidad, leerVolumen, convertirVolumen, textoVolumen, leerLongitud, convertirLongitud, textoLongitud, leerSuperficie, convertirSuperficie, textoSuperficie, leerMillasCuadradas, convertirMillasCuadradas, textoMillasCuadradas, leerYardasCuadradas, convertirYardasCuadradas, textoYardasCuadradas, leerPulgadasCuadradas, convertirPulgadasCuadradas, textoPulgadasCuadradas, leerConsumo, convertirConsumo, textoConsumo, leerElectrico, convertirElectrico, textoElectrico, leerPresion, convertirPresion, textoPresion, leerTazas, convertirTazas, textoTazas, TAZA_DE, leerTazaDe, textoTazaDe, leerCucharadas, convertirCucharadas, textoCucharadas, leerSticks, convertirSticks, textoSticks, leerYardas, convertirYardas, textoYardas, leerStone, convertirStone, textoStone, leerLibrasYOnzas, convertirLibrasYOnzas, textoLibrasYOnzas, leerOnzasLiquidas, convertirOnzasLiquidas, textoOnzasLiquidas, leerPintas, convertirPintas, textoPintas, leerGills, convertirGills, textoGills, leerCuartos, convertirCuartos, textoCuartos, leerNudos, convertirNudos, textoNudos, leerMetrosPorSegundo, convertirMetrosPorSegundo, textoMetrosPorSegundo, leerMillasNauticas, convertirMillasNauticas, textoMillasNauticas, leerBrazas, convertirBrazas, textoBrazas, leerLeguas, convertirLeguas, textoLeguas, leerManos, convertirManos, textoManos, leerFurlongs, convertirFurlongs, textoFurlongs, leerChains, convertirChains, textoChains, leerRods, convertirRods, textoRods, leerJin, convertirJin, textoJin, leerTsubo, convertirTsubo, textoTsubo, leerJo, convertirJo, textoJo, leerLakh, convertirLakh, textoLakh, leerTola, convertirTola, textoTola, leerTael, convertirTael, textoTael, leerMach, convertirMach, textoMach, leerThou, convertirThou, textoThou, leerGramaje, convertirGramaje, textoGramaje, leerMomme, convertirMomme, textoMomme, leerPood, convertirPood, textoPood, leerVersta, convertirVersta, textoVersta, leerAnioLuz, convertirAnioLuz, textoAnioLuz, leerAcrePie, convertirAcrePie, textoAcrePie, leerBigha, convertirBigha, textoBigha, leerMu, convertirMu, textoMu, leerMaund, convertirMaund, textoMaund, leerPicul, convertirPicul, textoPicul, leerShaku, convertirShaku, textoShaku, leerTalla, convertirTalla, textoTalla, leerAnillo, convertirAnillo, textoAnillo, CAMISAS, leerCamisa, textoCamisa, leerMah, convertirMah, textoMah, leerMbps, convertirMbps, textoMbps, leerGlucosa, convertirGlucosa, textoGlucosa, leerGo, convertirGo, textoGo, leerVara, convertirVara, textoVara, leerManzana, convertirManzana, textoManzana, leerRi, convertirRi, textoRi, leerDram, convertirDram, textoDram, leerFanega, convertirFanega, textoFanega, leerCodo, convertirCodo, textoCodo, leerAcres, convertirAcres, textoAcres, leerArpent, convertirArpent, textoArpent, leerCalorias, convertirCalorias, textoCalorias, leerPotencia, convertirPotencia, textoPotencia, leerBtu, convertirBtu, textoBtu, leerTherms, convertirTherms, textoTherms, leerInHg, convertirInHg, textoInHg, leerPiesCubicos, convertirPiesCubicos, textoPiesCubicos, leerYardasCubicas, convertirYardasCubicas, textoYardasCubicas, leerQuilates, convertirQuilates, textoQuilates, leerGrains, convertirGrains, textoGrains, leerPennyweight, convertirPennyweight, textoPennyweight, leerCwt, convertirCwt, textoCwt, leerCuerdas, convertirCuerdas, textoCuerdas, leerBushels, convertirBushels, textoBushels, leerPecks, convertirPecks, textoPecks, leerPulgadasCubicas, convertirPulgadasCubicas, textoPulgadasCubicas, leerBarriles, convertirBarriles, textoBarriles, leerParMotor, convertirParMotor, textoParMotor, leerToneladasCortas, convertirToneladasCortas, textoToneladasCortas, esHoyBarra, resumenHoyBarra, esAyerBarra, resumenAyerBarra, esAnteayerBarra, resumenAnteayerBarra, esSemanaBarra, resumenSemanaBarra, esMesBarra, resumenMesBarra, esTodosBarra, resumenTodosBarra, esViajeBarra, resumenViajeBarra, esCaroBarra, resumenCaroBarra, esTasaBarra, resumenTasaBarra, lineaTasa,
    AVISOS_MAX, AVISO_PCT_MAX, sentidoAviso, crearAviso, leerPorcentajeAviso, crearAvisoPorcentaje, crearCompra, leerAvisos, avisoCumplido, repartirAvisos, mensajeAviso, faltaParaAviso, cercaniaAviso, textoFalta,
    nivelPresupuesto, avisosPresupuesto, mensajePresupuesto,
    RECORDATORIO_HORA, RECORDATORIO_HORAS, leerHoraRecordatorio, viajesSinApuntar, tocaRecordar, mensajeRecordatorio, TAX_FREE_HORA, tocaTaxFree, mensajeTaxFree,
    ATAJOS, atajoPara, textoAtajo,
  };
}
