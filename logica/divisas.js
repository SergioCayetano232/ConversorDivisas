// Las divisas, leer lo que escribes en la cantidad, las tasas y el gráfico.

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
  return trazos(coordenadas(values));
}

function trazos(puntos) {
  const line = `M${puntos.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join("L")}`;
  const area = `${line}L${(100 - PAD_X).toFixed(2)},28L${PAD_X.toFixed(2)},28Z`;
  return { line, area };
}

// Al cambiar de periodo una curva se convierte en la otra, y para mezclarlas
// tienen que tener los mismos puntos: 7 días contra 365 no casan uno a uno.
const PUNTOS_TRANSFORMAR = 120;

function remuestrear(puntos, n = PUNTOS_TRANSFORMAR) {
  const ultimo = puntos.length - 1;
  return Array.from({ length: n }, (_, i) => {
    const donde = (i / (n - 1)) * ultimo;
    const a = Math.floor(donde);
    const b = Math.min(a + 1, ultimo);
    const t = donde - a;
    return {
      x: puntos[a].x + (puntos[b].x - puntos[a].x) * t,
      y: puntos[a].y + (puntos[b].y - puntos[a].y) * t,
    };
  });
}

// A mitad de camino entre dos curvas ya remuestreadas. Frena al final, como
// los números que corren.
function curvaEnMedio(desde, hasta, t) {
  const avance = 1 - (1 - Math.min(Math.max(t, 0), 1)) ** 3;
  return trazos(desde.map((p, i) => ({ x: p.x + (hasta[i].x - p.x) * avance, y: p.y + (hasta[i].y - p.y) * avance })));
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

// Dónde puede estar la tasa dentro de un mes, sacado de cuánto se ha movido en
// el periodo del gráfico: 8 de cada 10 veces dentro de la franja. No es una
// previsión, es lo que te juegas si esperas. Con menos de 20 tasas el cálculo
// no vale nada.
const ABANICO_MINIMO = 20;
const ABANICO_DIAS = 30;
// El 1,2816 es el que deja un 10 % por cada lado en una normal.
const ABANICO_Z = 1.2816;

function abanicoTasa(serie) {
  if (!Array.isArray(serie)) return null;
  const buenos = serie.filter((p) => esIso(p?.fecha) && p.valor > 0);
  if (buenos.length < ABANICO_MINIMO) return null;
  const saltos = buenos.slice(1).map((p, i) => Math.log(p.valor / buenos[i].valor));
  const media = saltos.reduce((a, b) => a + b, 0) / saltos.length;
  const sigma = Math.sqrt(saltos.reduce((a, b) => a + (b - media) ** 2, 0) / (saltos.length - 1));
  // Las del BCE no publican en fin de semana y otras sí: cuántas tasas caben en
  // un mes lo dicen las propias fechas.
  const dias = diasHasta(buenos[buenos.length - 1].fecha, buenos[0].fecha) - 1;
  if (!(dias > 0)) return null;
  const pasos = (ABANICO_DIAS * saltos.length) / dias;
  const ancho = ABANICO_Z * sigma * Math.sqrt(pasos);
  const actual = buenos[buenos.length - 1].valor;
  return { actual, bajo: actual * Math.exp(-ancho), alto: actual * Math.exp(ancho), pct: Math.exp(ancho) - 1 };
}

// Las tasas con los decimales de la línea de arriba, para que se puedan comparar.
function cifraTasa(valor) {
  const decimales = valor >= 1 ? 4 : Math.min(Math.max(4, 3 - Math.floor(Math.log10(valor))), 8);
  return numeros({ minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(valor);
}

function textoAbanico(r, { cantidad, from, to } = {}) {
  if (!r) return null;
  const pct = porCiento(numeros({ maximumFractionDigits: 1 }).format(r.pct * 100));
  const rango = tr("abanico.rango", { bajo: cifraTasa(r.bajo), alto: cifraTasa(r.alto), pct });
  if (!(cantidad > 0) || !from || !to) return { rango, dinero: "" };
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return {
    rango,
    dinero: tr("abanico.dinero", {
      cantidad: `${dinero.format(cantidad)} ${from}`,
      bajo: dinero.format(cantidad * r.bajo),
      alto: `${dinero.format(cantidad * r.alto)} ${to}`,
    }),
  };
}

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

// El color del fondo según la hora de allí. El amanecer y el atardecer los
// dejo en tres horas fijas: con la puesta de sol de verdad habría que saber la latitud.
function momentoDelDia(horas) {
  if (!Number.isInteger(horas) || horas < 0 || horas > 23) return null;
  if (horas >= 6 && horas < 9) return "amanecer";
  if (horas >= 9 && horas < 18) return "dia";
  if (horas >= 18 && horas < 21) return "atardecer";
  return "noche";
}

// A diferencia de horaAlli, aquí sí cuenta la misma hora que la tuya: el cielo
// se pinta igual. Sin ciudad para la divisa, el tuyo.
function cieloAlli(code, ahora = new Date(), local = -new Date(ahora).getTimezoneOffset()) {
  const zona = ZONAS[code];
  const minutos = zona ? desfase(zona[0], ahora) : local;
  return momentoDelDia(new Date(Number(ahora) + minutos * 60000).getUTCHours());
}

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
