// La lógica que no toca la pantalla, separada para poder probarla con node.
// popup.js la carga antes que a sí mismo; en los tests se importa tal cual.

// En el navegador textos.js ya va cargado delante; en Node hay que pedirlo.
if (typeof module !== "undefined" && typeof tr === "undefined") {
  Object.assign(globalThis, require("./textos.js"));
}

const CURRENCIES = [
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
// pegada al número y sola: "2 km" no es nada.
const MULTIPLOS = { k: 1e3, m: 1e6 };
const HAY_MULTIPLO = /\d\s*[km](?![a-z])/i;

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
      const letra = texto.slice(i).match(/^\s*([km])(?![a-z])/i);
      if (letra) i += letra[0].length;
      fichas.push({ tipo: "num", v: letra ? v * MULTIPLOS[letra[1].toLowerCase()] : v });
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
};

// El "fl oz" antes que el "oz", que si no se quedaría con la mitad.
const HAY_UNIDAD = /\s*(?:\/|\bper\b|\bpor\b)?\s*(fl\.?\s*oz|lbs?|pounds?|libras?|oz|ounces?|onzas?|gal(?:lons?|ones|[oó]n)?)\.?\s*$/i;

function quitarUnidad(texto) {
  const t = String(texto ?? "");
  const m = t.match(HAY_UNIDAD);
  if (!m || m.index === 0) return { texto: t, unidad: null };
  const u = m[1].toLowerCase().replace(/[\s.]/g, "");
  const unidad = u.startsWith("fl") ? "floz" : /^(lb|pound|libra)/.test(u) ? "lb" : u.startsWith("gal") ? "gal" : "oz";
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

// Las propinas de siempre: en Europa poco o nada, en Estados Unidos del 15 al 25,
// que los datáfonos de allí ya empiezan a proponerla.
const PROPINAS_RAPIDAS = [0, 10, 15, 20, 25];
const PROPINA_MAX = 30;
const PERSONAS_MAX = 20;
const CUENTA_POR_DEFECTO = { propina: 10, personas: 2, redondear: false };

// Lo que se suele dejar en un restaurante, por la divisa de la cuenta. Es a ojo:
// en el euro cambia de un país a otro, y en Japón o Corea dejarla queda raro.
const PROPINA_HABITUAL = {
  USD: 18, CAD: 15, MXN: 10, BRL: 10, GBP: 10, EUR: 5, CHF: 5, JPY: 0, KRW: 0, CNY: 0,
  HKD: 10, SGD: 0, AUD: 5, NZD: 5, THB: 5, IDR: 5, INR: 10, PHP: 10, MYR: 0, ZAR: 10,
  ILS: 12, TRY: 10, PLN: 10, CZK: 10, HUF: 10, RON: 10, SEK: 5, NOK: 5, DKK: 5, ISK: 0,
};

const propinaHabitual = (code) => PROPINA_HABITUAL[code] ?? null;

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

// Para la página entera no vale cualquier número como en la selección: aquí
// solo cuenta si lleva la divisa pegada, delante o detrás. Los símbolos largos
// primero, que si no "US$" se quedaba en "$".
const CODIGOS = CURRENCIES.map((c) => c.code).join("|");
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
  // El símbolo pegado al número ("20€", "$20") va aparte, que si no la cuenta no se entiende.
  const palabras = texto.replace(/([€$£¥₹₩₪฿₱₺])/g, " $1 ").trim().split(/\s+/);
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
  const cantidad = leerImporte(resto.join(" "));
  if (cantidad === null || cantidad <= 0) return null;
  const [de, a] = divisas;
  const { from, to } = a ? { from: de, to: a } : destinoPara(de ?? null, par);
  return from === to ? null : { cantidad, from, to };
}

// "+ 20 cena", "+ 1.500 jpy taxi efectivo": un gasto sin abrir el popup. Lo
// del principio que parece cantidad o divisa es la cantidad; lo demás, el concepto.
const PAGO_POR_PALABRA = { efectivo: "efectivo", cash: "efectivo", metalico: "efectivo", tarjeta: "tarjeta", card: "tarjeta" };

const esDeCantidad = (palabra) => /^[\d.,+\-*/()%]+[km]?$/i.test(palabra) || /^[€$£¥₹₩₪฿₱₺]$/.test(palabra)
  || (/^[a-z]{3}$/i.test(palabra) && isValidCode(palabra.toUpperCase()));

function leerGastoBarra(texto, par) {
  if (typeof texto !== "string" || !/^\s*\+/.test(texto)) return null;
  const palabras = texto.replace(/^\s*\+/, "").replace(/([€$£¥₹₩₪฿₱₺])/g, " $1 ").trim().split(/\s+/).filter(Boolean);
  let i = 0;
  while (i < palabras.length && (esDeCantidad(palabras[i])
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

const categoriaBuena = (c) => (CATEGORIAS.includes(c) ? c : CATEGORIA_POR_DEFECTO);

const esGastoBueno = (g) => Boolean(g) && typeof g.id === "string" && isValidCode(g.from) && isValidCode(g.to)
  && Number.isFinite(g.cantidad) && g.cantidad > 0 && Number.isFinite(g.valor) && g.valor >= 0
  && Number.isFinite(g.cuando) && typeof g.concepto === "string";

// El valor se guarda ya convertido, con la tasa y la comisión de ese día. Si lo
// calculara al enseñarlo, el cambio de hoy me movería lo que gasté hace una semana.
const limpiarConcepto = (concepto) => String(concepto ?? "").replace(/\s+/g, " ").trim().slice(0, CONCEPTO_MAX);

function crearGasto({ id, from, to, cantidad, valor, concepto = "", cuando, categoria, pago, comision }) {
  // Al céntimo: con la comisión salía 90,5148 y en el CSV se veía la cola.
  const gasto = {
    id, from, to, cantidad, cuando,
    valor: Number.isFinite(valor) ? Math.round(valor * 100) / 100 : valor,
    concepto: limpiarConcepto(concepto),
    categoria: categoriaBuena(categoria),
    pago: leerPago(pago),
    comision: leerComision(comision),
  };
  return esGastoBueno(gasto) && from !== to ? gasto : null;
}

function leerGastos(guardado) {
  if (!Array.isArray(guardado)) return [];
  // Los de antes de las categorías no traen ninguna: la saco del concepto, como
  // al apuntarlos, y si no dice nada van a "otros".
  return guardado.filter(esGastoBueno).slice(0, GASTOS_MAX).map((g) => ({
    ...g,
    categoria: CATEGORIAS.includes(g.categoria) ? g.categoria : adivinarCategoria(g.concepto) ?? CATEGORIA_POR_DEFECTO,
    pago: leerPago(g.pago),
    // Los de antes no la guardaban: ya va dentro del valor y no sé cuánta era.
    comision: leerComision(g.comision),
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

function repartirNoches(gasto, noches) {
  if (!esGastoBueno(gasto) || !Number.isInteger(noches) || noches < 2 || noches > NOCHES_MAX) return [gasto];
  const cantidades = repartirCentimos(gasto.cantidad, noches);
  const valores = repartirCentimos(gasto.valor, noches);
  const antes = new Date(gasto.cuando);
  return cantidades.map((cantidad, i) => {
    // La noche delante: el concepto se corta por la derecha en la lista.
    const marca = `${i + 1}/${noches}`;
    return {
      ...gasto,
      id: `${gasto.id}-${i + 1}`,
      cantidad,
      valor: valores[i],
      concepto: gasto.concepto ? `${marca} · ${gasto.concepto}`.slice(0, CONCEPTO_MAX) : marca,
      // Con la fecha local y no sumando milisegundos: el día del cambio de hora tiene 23 horas.
      cuando: new Date(antes.getFullYear(), antes.getMonth(), antes.getDate() + i,
        antes.getHours(), antes.getMinutes(), antes.getSeconds(), antes.getMilliseconds()).getTime(),
    };
  });
}

function apuntarNoches(lista, noches) {
  const buenas = noches.filter(esGastoBueno);
  if (buenas.length === 0) return lista;
  return [...buenas, ...lista].sort((x, y) => y.cuando - x.cuando).slice(0, GASTOS_MAX);
}

function quitarGasto(lista, id) {
  return lista.filter((g) => g.id !== id);
}

// El metro de cada mañana: la misma cantidad, pero con la tasa y la comisión de
// hoy. Si no tengo la de hoy para ese par, uso la que tuvo, que es lo más cerca.
function repetirGasto(gasto, { id, cuando, tasa = null, comision = 0 }) {
  if (!(Number.isFinite(tasa) && tasa > 0)) return crearGasto({ ...gasto, id, cuando });
  const pct = comisionDelPago(gasto.pago, comision);
  const valor = Math.round(conComision(gasto.cantidad * tasa, pct) * 100) / 100;
  return crearGasto({ ...gasto, id, cuando, valor, comision: pct });
}

// La categoría solo la cambio si estaba en "otros": si ya era otra, puede que
// la eligieras tú, y corregir una falta no debería deshacértela.
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
    const texto = normalizar(`${g.concepto} ${tr(`cat.${g.categoria}`)}`);
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
function porPersona(gastos, personas) {
  const principal = sumarPorDivisa(gastos)[0];
  if (!principal || leerPersonas(personas) < 2) return null;
  const media = mediaPorDia(gastos);
  return { total: principal.total / personas, to: principal.to, personas, alDia: media ? media.media / personas : null };
}

// Antes de los viajes había una sola lista y un presupuesto sueltos: pasan a
// ser el primer viaje, sin nombre, para que nadie pierda lo que tenía.
function leerViajes(guardado, gastosSueltos, presupuestoSuelto) {
  const vistos = new Set();
  const lista = (Array.isArray(guardado?.lista) ? guardado.lista : [])
    .filter((v) => v && typeof v.id === "string" && v.id && !vistos.has(v.id) && vistos.add(v.id))
    .slice(0, VIAJES_MAX)
    .map((v) => ({
      id: v.id, nombre: limpiarNombreViaje(v.nombre), gastos: leerGastos(v.gastos), presupuesto: leerPresupuesto(v.presupuesto),
      cajero: leerRetiradas(v.cajero), personas: leerPersonas(v.personas), color: leerColorViaje(v.color),
    }));
  if (lista.length === 0) {
    lista.push({ ...viajeVacio("primero"), gastos: leerGastos(gastosSueltos), presupuesto: leerPresupuesto(presupuestoSuelto) });
  }
  const activo = lista.some((v) => v.id === guardado?.activo) ? guardado.activo : lista[0].id;
  return { activo, lista };
}

const viajeActivo = (viajes) => viajes.lista.find((v) => v.id === viajes.activo);

// El nuevo es al que vas: lo creas para empezar a apuntar en él.
function crearViaje(viajes, id, nombre) {
  const limpio = limpiarNombreViaje(nombre);
  if (!limpio || viajes.lista.length >= VIAJES_MAX || viajes.lista.some((v) => v.id === id)) return viajes;
  return { activo: id, lista: [...viajes.lista, viajeVacio(id, limpio, colorLibre(viajes.lista))] };
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
  if (!origen || viajes.lista.length >= VIAJES_MAX || viajes.lista.some((v) => v.id === nuevoId)) return viajes;
  let presupuesto = null;
  if (origen.presupuesto) {
    const dias = Math.max(diasHasta(origen.presupuesto.hasta, inicioDelViaje(origen.presupuesto, origen.gastos, hoyIso)), 1);
    const [a, m, d] = hoyIso.split("-").map(Number);
    presupuesto = { importe: origen.presupuesto.importe, to: origen.presupuesto.to, desde: hoyIso, hasta: isoLocal(new Date(a, m - 1, d + dias - 1)) };
  }
  const copia = {
    ...viajeVacio(nuevoId, limpiarNombreViaje(nombre) || nombreCopia(origen.nombre, viajes.lista), colorLibre(viajes.lista)),
    presupuesto,
    personas: origen.personas,
  };
  return { activo: nuevoId, lista: [...viajes.lista, copia] };
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
  return { activo, lista };
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
    const total = sumarPorDivisa(viaje.gastos)[0];
    if (!total) return { id: viaje.id, media: null };
    const dias = gastosPorDia(viaje.gastos).map((d) => d.dia).sort();
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
function destacados(gastos, hoyIso = hoy()) {
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

function findeContraSemana(gastos, hoyIso = hoy()) {
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
    if (!clave || g.to !== principal.to) continue;
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
function resumenParaCompartir({ nombre, gastos, presupuesto, personas }, hoyIso = hoy()) {
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
  if (cabeza) {
    const datos = { personas: cabeza.personas, valor: dinero(cabeza.total, cabeza.to) };
    lineas.push(cabeza.alDia
      ? tr("compartir.porPersonaDia", { ...datos, dia: dinero(cabeza.alDia, cabeza.to) })
      : tr("compartir.porPersona", datos));
  }

  const { caro, dia, barato } = destacados(gastos, hoyIso);
  if (caro) {
    const que = caro.concepto || tr(`cat.${caro.categoria}`);
    lineas.push(tr("compartir.caro", { que, valor: dinero(caro.valor, caro.to), dia: nombreDia(isoLocal(new Date(caro.cuando)), hoyIso) }));
  }
  if (dia) lineas.push(tr("compartir.diaMas", { dia: nombreDia(dia.dia, hoyIso), valor: dinero(dia.total, dia.to) }));
  if (barato) lineas.push(tr("compartir.diaMenos", { dia: nombreDia(barato.dia, hoyIso), valor: dinero(barato.total, barato.to) }));
  const estrella = conceptoEstrella(gastos);
  if (estrella) {
    lineas.push(tr("compartir.estrella", {
      emoji: EMOJI_CATEGORIA[estrella.categoria] ?? EMOJI_CATEGORIA.otros,
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
      lineas.push(`${EMOJI_CATEGORIA[categoria]} ${tr(`cat.${categoria}`)}: ${dinero(total, to)} (${pct})`);
    }
  }

  const dias = gastosPorDia(gastos);
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
function masCarosDelDia(gastos) {
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

function gastoRaro(gastos, gasto) {
  if (!gasto) return null;
  const suyos = gastos.filter((g) => g.to === gasto.to);
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
  return gastos.map((g) => (maximos.get(g.to) > 0 ? g.valor / maximos.get(g.to) : 0));
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
const comisionDe = (g) => (g.comision > 0 ? g.valor - g.valor / (1 + g.comision / 100) : 0);

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
// Esos no guardan comisión, así que tiro de la que tienes puesta ahora.
function ahorroEnEfectivo(gastos, comision) {
  if (!(comision > 0)) return null;
  const pagado = pagadoEnEfectivo(gastos);
  if (!pagado) return null;
  const total = pagado.total * comision / 100;
  return total >= 0.005 ? { total, to: pagado.to } : null;
}

function gastadoHoy(gastos, hoyIso = hoy()) {
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

// Los viajes de antes no traen cajero: sin retiradas, como si no hubieras sacado.
function leerRetiradas(guardado) {
  if (!Array.isArray(guardado)) return [];
  return guardado.filter(esRetiradaBuena).slice(0, RETIRADAS_MAX)
    .map(({ id, cantidad, divisa, cuando }) => ({ id, cantidad, divisa, cuando }));
}

function crearRetirada({ id, cantidad, divisa, cuando }) {
  const r = { id, cantidad: Math.round(cantidad * 100) / 100, divisa, cuando };
  return esRetiradaBuena(r) ? r : null;
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
    if (g.pago === "efectivo" && cuentas.has(g.from)) cuentas.get(g.from).gastado += g.cantidad;
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
function cuantoSacar(presupuesto, gastos, retiradas, divisa, tasa, hoyIso = hoy()) {
  const estado = estadoPresupuesto(presupuesto, gastos, hoyIso);
  if (!estado?.porDia || !(tasa > 0) || divisa === presupuesto.to) return null;
  const contados = gastos.filter((g) => g.to === presupuesto.to);
  const enEfectivo = contados.filter((g) => g.pago === "efectivo").reduce((suma, g) => suma + g.valor, 0);
  const parte = contados.length ? enEfectivo / estado.gastado : 1;
  if (!(parte > 0)) return null;
  const hace = (estado.porDia * estado.dias * parte) / tasa;
  const cuenta = efectivoQueda(retiradas, gastos).find((c) => c.divisa === divisa);
  const tienes = Math.max(cuenta?.queda ?? 0, 0);
  const falta = hace - tienes;
  return { sacar: falta > 0 ? redondoDeCajero(falta) : 0, divisa, dias: estado.dias, parte, tienes };
}

// El último día y a la vuelta, lo que queda en la cartera ya no es para el
// viaje: te digo cuánto vale en tu divisa, para gastarlo o cambiarlo. Sin fecha
// de vuelta no sé cuándo acaba, y no digo nada.
function loQueSobra(presupuesto, gastos, retiradas, tasa, hoyIso = hoy()) {
  if (!presupuesto?.hasta || hoyIso < presupuesto.hasta) return null;
  const [cuenta] = efectivoQueda(retiradas, gastos);
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

function mediaPorDia(gastos) {
  const principal = sumarPorDivisa(gastos)[0];
  if (!principal) return null;
  const dias = gastosPorDia(gastos);
  const total = diasHasta(dias[0].dia, dias[dias.length - 1].dia);
  if (total < 2) return null;
  return { media: principal.total / total, to: principal.to, dias: total };
}

// Lo de cada categoría al día, con los mismos días que la media de arriba: así
// sumadas dan esa media y no salen cuentas distintas en el mismo panel.
function categoriasAlDia(gastos) {
  const media = mediaPorDia(gastos);
  if (!media) return new Map();
  return new Map(desglose(gastos).map((t) => [t.categoria, t.total / media.dias]));
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
  if (desde === undefined || desde === null) return { importe, to, hasta };
  if (!esIso(desde) || desde > hasta) return null;
  return { importe, to, hasta, desde };
}

const esIso = (texto) => typeof texto === "string" && /^\d{4}-\d{2}-\d{2}$/.test(texto);

// Hasta el 80 % vas bien; de ahí al 100 %, justo; pasado, pasado.
const PRESUPUESTO_JUSTO = 0.8;

function estadoPresupuesto(presupuesto, gastos, hoyIso = hoy()) {
  if (!presupuesto) return null;
  const gastado = gastos.filter((g) => g.to === presupuesto.to).reduce((suma, g) => suma + g.valor, 0);
  const queda = presupuesto.importe - gastado;
  const fraccion = gastado / presupuesto.importe;
  // Si aún no has salido, el dinero se reparte entre los días del viaje, no
  // entre los que faltan desde hoy.
  const empieza = presupuesto.desde && presupuesto.desde > hoyIso ? presupuesto.desde : hoyIso;
  const dias = Math.max(diasHasta(presupuesto.hasta, empieza), 0);
  return {
    gastado,
    queda,
    fraccion,
    dias,
    // Acabado el viaje o pasado del presupuesto, "al día" ya no significa nada.
    porDia: dias > 0 && queda > 0 ? queda / dias : null,
    tono: fraccion > 1 ? "pasado" : fraccion >= PRESUPUESTO_JUSTO ? "justo" : "bien",
  };
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
  const primero = gastos.reduce((min, g) => Math.min(min, g.cuando), Infinity);
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
    if (isoLocal(new Date(g.cuando)) === hoyIso) deHoy += g.valor;
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

// Días seguidos gastando lo que toca o menos, del de ayer hacia atrás: hoy aún
// no ha acabado. Lo que toca es fijo, el presupuesto entre los días del viaje,
// que con lo que queda al día la vara se movería cada vez que gastas.
const RACHA_MINIMA = 2;

function rachaPresupuesto(presupuesto, gastos, hoyIso = hoy()) {
  if (!presupuesto) return null;
  const inicio = inicioDelViaje(presupuesto, gastos, hoyIso);
  const total = diasHasta(presupuesto.hasta, inicio);
  if (total < 1) return null;
  const toca = presupuesto.importe / total;
  const porDia = new Map();
  for (const g of gastos) {
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
function hastaCuandoLlega(presupuesto, gastos, hoyIso = hoy()) {
  const estado = estadoPresupuesto(presupuesto, gastos, hoyIso);
  const dia = diaDelViaje(presupuesto, gastos, hoyIso);
  if (!estado || !dia || dia.dia < 2 || estado.queda <= 0) return null;
  const ritmo = estado.gastado / dia.dia;
  const llega = Math.floor(estado.queda / ritmo);
  if (llega >= dia.total - dia.dia) return null;
  const [a, m, d] = hoyIso.split("-").map(Number);
  return isoLocal(new Date(a, m - 1, d + llega));
}

// Cuánto habrás gastado al acabar si sigues así. Lo ya apuntado para días que
// vienen (las noches del hotel) cuenta tal cual, y su categoría no entra en el
// ritmo: si no, el hotel saldría dos veces.
function previsionViaje(presupuesto, gastos, hoyIso = hoy()) {
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
    if (!esFuturo(g) && !yaPagadas.has(g.categoria)) ritmo += g.valor / dia.dia;
  }
  const total = gastado + ritmo * (dia.total - dia.dia);
  return { total, sobra: presupuesto.importe - total, fraccion: total / presupuesto.importe, to: presupuesto.to };
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
function loQueSeLleva(presupuesto, gastos, gasto, hoyIso = hoy()) {
  if (!presupuesto || !gasto || gasto.to !== presupuesto.to || !(gasto.valor > 0)) return null;
  const estado = estadoPresupuesto(presupuesto, gastos, hoyIso);
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
  isoLocal(new Date(g.cuando)), horaLocal(g.cuando), g.concepto, tr(`cat.${g.categoria ?? CATEGORIA_POR_DEFECTO}`),
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
  const que = gasto.concepto || tr(`cat.${gasto.categoria}`);
  const cuanto = gasto.from === gasto.to ? dinero(gasto.valor, gasto.to)
    : `${dinero(gasto.valor, gasto.to)} (${dinero(gasto.cantidad, gasto.from)})`;
  return `${que} · ${cuanto}`;
}

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

function destinoPara(divisa, par) {
  if (!divisa) return { from: par.from, to: par.to };
  return { from: divisa, to: divisa === par.to ? par.from : par.to };
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
function tituloInsignia(par, rate, cambio, fecha = null) {
  const tasa = `1 ${par.from} = ${tasaLarga(rate)} ${par.to}`;
  const pct = cambio === null ? null : numeros({
    style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "exceptZero",
  }).format(cambio);
  const linea = pct === null ? tasa : tr("insignia.cambio", { tasa, cambio: pct });
  return fecha ? `${linea}\n${tr("insignia.fecha", { fecha: fechaCorta(fecha) })}` : linea;
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
// Fahrenheit. Con signo, que en invierno hace falta, y coma o punto.
const HAY_GRADOS = /^\s*([-−]?)\s*(\d+(?:[.,]\d+)?)\s*[°º]?\s*(f|c|fahrenheit|celsius)\s*$/i;

function leerGrados(texto) {
  const m = String(texto ?? "").match(HAY_GRADOS);
  if (!m) return null;
  const valor = Number(m[2].replace(",", ".")) * (m[1] ? -1 : 1);
  return { valor, de: m[3][0].toLowerCase() };
}

function convertirGrados({ valor, de }) {
  return de === "f" ? { valor: ((valor - 32) * 5) / 9, a: "c" } : { valor: (valor * 9) / 5 + 32, a: "f" };
}

function textoGrados(leido) {
  if (!leido) return "";
  const grados = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(Math.abs(n) < 0.05 ? 0 : n)} °${u.toUpperCase()}`;
  const otro = convertirGrados(leido);
  return `${grados(leido.valor, leido.de)} = ${grados(otro.valor, otro.a)}`;
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

// "cd 5lb", para la maleta. "libras" y "pounds" no, que esas son esterlinas.
const HAY_PESO = /^\s*(\d+(?:[.,]\d+)?)\s*(lbs?|kg|kilos?|kilogramos?|kilograms?)\s*$/i;
const KG_POR_LIBRA = 0.45359237;

function leerPeso(texto) {
  const m = String(texto ?? "").match(HAY_PESO);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^k/i.test(m[2]) ? "kg" : "lb" };
}

function convertirPeso({ valor, de }) {
  return de === "lb" ? { valor: valor * KG_POR_LIBRA, a: "kg" } : { valor: valor / KG_POR_LIBRA, a: "lb" };
}

function textoPeso(leido) {
  if (!leido) return "";
  const peso = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirPeso(leido);
  return `${peso(leido.valor, leido.de)} = ${peso(otro.valor, otro.a)}`;
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
// distancia, así que aquí solo entra lo que lleva "por hora".
const HAY_VELOCIDAD = /^\s*(\d+(?:[.,]\d+)?)\s*(mph|millas? por hora|miles? per hour|km\/h|kmh|kph|km por hora|kil[oó]metros? por hora|kilometers? per hour)\s*$/i;

function leerVelocidad(texto) {
  const m = String(texto ?? "").match(HAY_VELOCIDAD);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^(mph|mil)/i.test(m[2]) ? "mph" : "km/h" };
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
// precio. Galón americano, que es el que te vas a encontrar.
const HAY_VOLUMEN = /^\s*(\d+(?:[.,]\d+)?)\s*(gal(?:lons?|ones|[oó]n)?|l|litros?|liters?|litres?)\s*$/i;
const L_POR_GALON = 3.78541178;

function leerVolumen(texto) {
  const m = String(texto ?? "").match(HAY_VOLUMEN);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^g/i.test(m[2]) ? "gal" : "l" };
}

function convertirVolumen({ valor, de }) {
  return de === "gal" ? { valor: valor * L_POR_GALON, a: "l" } : { valor: valor / L_POR_GALON, a: "gal" };
}

function textoVolumen(leido) {
  if (!leido) return "";
  const volumen = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirVolumen(leido);
  return `${volumen(leido.valor, leido.de)} = ${volumen(otro.valor, otro.a)}`;
}

// "cd 55in", para pantallas, tallas y la maleta de cabina. Las comillas también
// valen, que es como sale en las tiendas: 55".
const HAY_LONGITUD = /^\s*(\d+(?:[.,]\d+)?)\s*(in|inch(?:es)?|pulgadas?|"|cm|cent[ií]metros?|centimet(?:er|re)s?)\s*$/i;
const CM_POR_PULGADA = 2.54;

function leerLongitud(texto) {
  const m = String(texto ?? "").match(HAY_LONGITUD);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^c/i.test(m[2]) ? "cm" : "in" };
}

function convertirLongitud({ valor, de }) {
  return de === "in" ? { valor: valor * CM_POR_PULGADA, a: "cm" } : { valor: valor / CM_POR_PULGADA, a: "in" };
}

function textoLongitud(leido) {
  if (!leido) return "";
  const longitud = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirLongitud(leido);
  return `${longitud(leido.valor, leido.de)} = ${longitud(otro.valor, otro.a)}`;
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

// "cd 30mpg", para el coche de alquiler. Millas por galón americano; el inglés
// es más grande y daría otra cifra, pero allí casi no se ve.
const HAY_CONSUMO = /^\s*(\d+(?:[.,]\d+)?)\s*(mpg|miles? per gallon|millas? por gal[oó]n|l\/100\s*km|l\/100)\s*$/i;

function leerConsumo(texto) {
  const m = String(texto ?? "").match(HAY_CONSUMO);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  // Va al revés (cuanto más mpg, menos litros), así que el cero no tiene vuelta.
  if (!valor) return null;
  return { valor, de: /^l/i.test(m[2]) ? "l/100 km" : "mpg" };
}

// La misma cuenta sirve para ir y para volver.
function convertirConsumo({ valor, de }) {
  return { valor: (100 * L_POR_GALON) / (valor * KM_POR_MILLA), a: de === "mpg" ? "l/100 km" : "mpg" };
}

function textoConsumo(leido) {
  if (!leido) return "";
  const consumo = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirConsumo(leido);
  return `${consumo(leido.valor, leido.de)} = ${consumo(otro.valor, otro.a)}`;
}

// "cd 35psi", para inflar las ruedas en la gasolinera.
const HAY_PRESION = /^\s*(\d+(?:[.,]\d+)?)\s*(psi|bar|bares)\s*$/i;
const BAR_POR_PSI = 0.0689475729;

function leerPresion(texto) {
  const m = String(texto ?? "").match(HAY_PRESION);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^b/i.test(m[2]) ? "bar" : "psi" };
}

function convertirPresion({ valor, de }) {
  return de === "psi" ? { valor: valor * BAR_POR_PSI, a: "bar" } : { valor: valor / BAR_POR_PSI, a: "psi" };
}

// Los psi, enteros: es lo que marca el inflador.
function textoPresion(leido) {
  if (!leido) return "";
  const presion = (n, u) => `${numeros({ maximumFractionDigits: u === "bar" ? 1 : 0 }).format(n)} ${u}`;
  const otro = convertirPresion(leido);
  return `${presion(leido.valor, leido.de)} = ${presion(otro.valor, otro.a)}`;
}

// "cd 2 cups", para las recetas americanas. La taza de allí, no la métrica de 250.
const HAY_TAZAS = /^\s*(\d+(?:[.,]\d+)?)\s*(cups?|tazas?|ml|mililitros?|millilit(?:er|re)s?)\s*$/i;
const ML_POR_TAZA = 236.5882365;

function leerTazas(texto) {
  const m = String(texto ?? "").match(HAY_TAZAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^m/i.test(m[2]) ? "ml" : "cups" };
}

function convertirTazas({ valor, de }) {
  return de === "cups" ? { valor: valor * ML_POR_TAZA, a: "ml" } : { valor: valor / ML_POR_TAZA, a: "cups" };
}

// Los ml, enteros, y las tazas con dos decimales, que media taza de más ya se nota.
function textoTazas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: u === "ml" ? 0 : 2 }).format(n)} ${u === "cups" && n === 1 ? "cup" : u}`;
  const otro = convertirTazas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
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

// "cd 12 fl oz", lo que pone en las latas y las botellas de allí. Solo hacia
// los ml, que los 250 ml ya los pasan las tazas.
const HAY_ONZAS_LIQUIDAS = /^\s*(\d+(?:[.,]\d+)?)\s*(fl\.?\s*oz|fluid\s+ounces?|onzas?\s+l[ií]quidas?)\s*$/i;
const ML_POR_ONZA_LIQUIDA = 29.5735295625;

function leerOnzasLiquidas(texto) {
  const m = String(texto ?? "").match(HAY_ONZAS_LIQUIDAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "fl oz" };
}

function convertirOnzasLiquidas({ valor }) {
  return { valor: valor * ML_POR_ONZA_LIQUIDA, a: "ml" };
}

function textoOnzasLiquidas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirOnzasLiquidas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 1 pint", la del pub. Va la británica (568 ml) y no la americana (473):
// en Estados Unidos casi nadie la pide en pintas.
const HAY_PINTAS = /^\s*(\d+(?:[.,]\d+)?)\s*(pints?|pintas?|pt)\s*$/i;
const ML_POR_PINTA = 568.26125;

function leerPintas(texto) {
  const m = String(texto ?? "").match(HAY_PINTAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "pt" };
}

function convertirPintas({ valor }) {
  return { valor: valor * ML_POR_PINTA, a: "ml" };
}

// En ml enteros, que es como viene en la carta.
function textoPintas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: u === "ml" ? 0 : 1 }).format(n)} ${u}`;
  const otro = convertirPintas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 2 qt", la leche y los helados del súper americano. Un cuarto de galón.
const HAY_CUARTOS = /^\s*(\d+(?:[.,]\d+)?)\s*(qt|quarts?|cuartos?\s+de\s+gal[oó]n)\s*$/i;
const L_POR_CUARTO = 0.946352946;

function leerCuartos(texto) {
  const m = String(texto ?? "").match(HAY_CUARTOS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "qt" };
}

function convertirCuartos({ valor }) {
  return { valor: valor * L_POR_CUARTO, a: "l" };
}

// En litros con dos decimales: "946 ml" se entiende, pero "1.893 ml" ya no.
function textoCuartos(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: u === "l" ? 2 : 1 }).format(n)} ${u}`;
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

// "cd 2 acres", para la casa rural o el parque. Sin "ac", que suena a otra cosa.
const HAY_ACRES = /^\s*(\d+(?:[.,]\d+)?)\s*(acres?)\s*$/i;
const HA_POR_ACRE = 0.40468564224;

function leerAcres(texto) {
  const m = String(texto ?? "").match(HAY_ACRES);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "acres" };
}

function convertirAcres({ valor }) {
  return { valor: valor * HA_POR_ACRE, a: "ha" };
}

// Dos decimales, que un acre se queda en 0,4 ha y con uno no se distinguen.
function textoAcres(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 2 }).format(n)} ${u === "acres" && n === 1 ? "acre" : u}`;
  const otro = convertirAcres(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
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

function resumenAyerBarra(viaje, hoyIso = hoy()) {
  if (!viaje) return null;
  const dinero = (n) => numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const [y, m, d] = hoyIso.split("-").map(Number);
  const ayerIso = isoLocal(new Date(y, m - 1, d - 1));
  const gastado = gastadoHoy(viaje.gastos, ayerIso);
  if (!gastado) return { principal: tr("barra.ayerNada"), detalle: [] };
  const deAyer = viaje.gastos.filter((g) => g.to === gastado.to && isoLocal(new Date(g.cuando)) === ayerIso);
  const caro = deAyer.reduce((a, b) => (b.valor > a.valor ? b : a));
  const principal = tr(deAyer.length === 1 ? "barra.ayerUno" : "barra.ayer", { gastado: `${dinero(gastado.total)} ${gastado.to}`, n: deAyer.length });
  const detalle = deAyer.length > 1
    ? [tr("barra.ayerCaro", { gasto: `${caro.concepto || tr("barra.ayerSinConcepto")} ${dinero(caro.valor)}` })]
    : [];
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

const esAvisoMueve = (a) => a.sentido === "mueve" && typeof a.pct === "number" && a.pct > 0 && a.pct <= AVISO_PCT_MAX;

function leerAvisos(guardado) {
  if (!Array.isArray(guardado)) return [];
  return guardado
    .filter((a) => a && typeof a.id === "string" && isValidCode(a.from) && isValidCode(a.to)
      && (a.sentido === "sube" || a.sentido === "baja" || esAvisoMueve(a)) && typeof a.umbral === "number" && a.umbral > 0)
    .slice(0, AVISOS_MAX);
}

// El margen es para que un 2 % justo no se quede en 1,99999 por los decimales.
const movimiento = (aviso, rate) => rate / aviso.umbral - 1;

function avisoCumplido(aviso, rate) {
  if (typeof rate !== "number") return false;
  if (aviso.sentido === "mueve") return Math.abs(movimiento(aviso, rate)) >= aviso.pct / 100 - 1e-9;
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
  const falta = aviso.sentido === "sube" ? aviso.umbral / suya - 1 : 1 - aviso.umbral / suya;
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
  if (aviso.sentido === "mueve") {
    const cambio = movimiento(aviso, rate);
    const pct = numeros({ style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Math.abs(cambio));
    return {
      titulo: tr("avisos.notiTitulo", { from: aviso.from, tasa: tasaLarga(rate), to: aviso.to }),
      cuerpo: tr(cambio > 0 ? "avisos.notiMueveSube" : "avisos.notiMueveBaja", { pct, umbral: tasaLarga(aviso.umbral) }),
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
  // La C ya copia el resultado: K, que suena igual, copia la chuleta.
  KeyK: "chuleta",
  // L de lista: las otras divisas, también para WhatsApp.
  KeyL: "extras",
  // F de fijar: la chincheta del par que tienes puesto, que no sale en las pastillas.
  KeyF: "fijar",
  KeyZ: "deshacer",
  KeyH: "ayuda",
};

// Con Shift, la versión larga: la frase entera, o la chuleta en papel.
const CON_SHIFT = { copiar: "copiarFrase", chuleta: "imprimirChuleta" };

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
  return datos;
}

// Las claves que borro antes de restaurar: las de la copia y las de antes de
// los viajes, para que no vuelvan a aparecer mezcladas.
const CLAVES_COPIA = [
  "viajes", "gastosViaje", "presupuestoViaje", "lastPair", "paresRecientes", "divisasExtra", "avisos",
  "historialConversiones", "rangoGrafico", "comisionBanco", "impuestoVenta", "pagoGasto", "cuentaReparto", "insigniaActiva", "tasaAlReves", "idioma",
  "recordatorioActivo", "recordatorioHora", "precioCafe", "sueldoHora",
];

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

function resumenCopia(datos) {
  return {
    viajes: datos.viajes.lista.length,
    gastos: datos.viajes.lista.reduce((suma, v) => suma + v.gastos.length, 0),
    avisos: datos.avisos?.length ?? 0,
    conversiones: datos.historialConversiones?.length ?? 0,
  };
}

// El popup lo carga como script normal y lo lee del ámbito global; Node necesita
// el export. Sin esto habría que montar un build, y aquí no hay ninguno.
if (typeof module !== "undefined") {
  module.exports = {
    CURRENCIES, isValidCode, nombreDe, parseAmount, isoLocal, hoy, isFresh,
    evaluar, completar, leerImporte, UNIDADES, quitarUnidad, porUnidadMetrica, esOperacion, pasoCantidad, leerCantidad,
    normalizar, filtrarDivisas, buildPaths, startDateFor, errorMessageFor,
    RECIENTES_MAX, FIJOS_MAX, apuntarReciente, fijarReciente, leerRecientes, recientesVisibles,
    RANGOS, RANGO_POR_DEFECTO, leerRango, siguienteRango, coordenadas, alturaEn, MOMENTO_UMBRAL, momento, textoMomento,
    SEMANAS_MINIMAS, mejorDiaSemana, nombreDiaSemana, textoDiaSemana, indiceCercano, extremos, fechaCorta, largoEnPantalla,
    leerNumero, divisaDe, leerSeleccion, destinoPara, leerPegado, buscarPrecios, precioEntero, leerOmnibox, leerGastoBarra, gastoDeBarra, escaparXml,
    divisaDeIdioma, parPorIdioma, banderaDe, banderaDivisa,
    HISTORIAL_MAX, leerHistorial, apuntarConversion, quitarConversion, haceCuanto, ultimoDeHoy, textoParaCopiar, fraseParaCopiar, gastoParaCopiar, totalParaCopiar, simboloDe, textoConSimbolo,
    celdaCsv, csvHistorial, csvGastos, csvViajes,
    GASTOS_MAX, CONCEPTO_MAX, crearGasto, leerGastos, apuntarGasto, NOCHES_MAX, repartirCentimos, repartirNoches, apuntarNoches, quitarGasto, cambiarConcepto, cambiarDia, buscarGastos, trozosResaltados, repetirGasto, devolverGasto, devolverTodos, sumarPorDivisa, gastosPorDia, huecoEntre, cifraEnMarcha, categoriaDelDia, pesoDeLosDias, ordenarPorImporte, masCarosDelDia, pesoDeLosGastos, RARO_VECES, mediana, gastoRaro, REPETIDO_MS, gastoRepetido, mediaPorDia, categoriasAlDia, mediaPorGasto, comisionesPagadas, cambioDelViaje, cifraCambio, textoCambio, pagadoEnEfectivo, ahorroEnEfectivo,
    RETIRADAS_MAX, leerRetiradas, crearRetirada, apuntarRetirada, quitarRetirada, efectivoQueda, EFECTIVO_POCO, tonoEfectivo, redondoDeCajero, cuantoSacar, loQueSobra, gastadoHoy, nombreDia,
    CATEGORIAS, CATEGORIA_POR_DEFECTO, adivinarCategoria, PAGOS, PAGO_POR_DEFECTO, leerPago, comisionDelPago, desglose, conceptosUsados, completarConcepto,
    EMOJI_CATEGORIA, destacados, resumenParaCompartir, FINDE_MINIMO, findeContraSemana, ESTRELLA_MINIMO, conceptoEstrella,
    COPIA_APP, COPIA_VERSION, CLAVES_COPIA, limpiarCopia, crearCopia, leerCopia, resumenCopia,
    VIAJES_MAX, NOMBRE_VIAJE_MAX, leerViajes, leerPersonas, porPersona, compararViajes, COLORES_VIAJE, leerColorViaje, colorLibre, siguienteColor, viajeActivo, crearViaje, nombreCopia, nombreDeDestino, duplicarViaje, renombrarViaje, elegirViaje, borrarViaje, cambiarViaje, resumenViaje, archivoGastos,
    diasHasta, leerPresupuesto, PRESUPUESTO_JUSTO, estadoPresupuesto, alDiaAlli, inicioDelViaje, diaDelViaje, cuentaAtras, textoCuentaAtras, loDeHoy, CELEBRADOS_MAX, leerCelebrados, anadirCelebrado, viajeParaCelebrar, textoCelebrar, RACHA_MINIMA, rachaPresupuesto, hastaCuandoLlega, previsionViaje, PREVISION_JUSTA, textoPrevision, loQueSeLleva, redondearDias,
    EXTRAS_MAX, EXTRAS_POR_DEFECTO, leerExtras, anadirExtra, quitarExtra,
    extrasVisibles, disponiblesParaAnadir, convertirExtras, semanaDe, trazoMini, CHULETA, escalaChuleta, chuleta, TRUCO_TOLERANCIA, trucoDeCabeza, textoTruco, tituloTruco, chuletaParaCompartir, extrasParaCompartir,
    urlImpresion, leerImpresion, chuletaParaImprimir,
    COMISION_MAX, COMISIONES_RAPIDAS, leerComision, leerPorcentaje, conComision,
    IMPUESTO_MAX, IMPUESTOS_RAPIDOS, leerImpuesto, leerImpuestoEscrito, loQuePagas,
    COMPARAR_IGUAL, compararPrecios, inclinacion, ZONAS, desfase, esNoche, horaAlli, textoDiferencia, relojDe, tituloHoraAlli, leerCafe, enCafes, textoCafes, HORAS_JORNADA, enHoras, textoHoras,
    PROPINAS_RAPIDAS, PROPINA_HABITUAL, propinaHabitual, PROPINA_MAX, PERSONAS_MAX, CUENTA_POR_DEFECTO, leerCuenta, redondoHaciaArriba, repartirCuenta, cuentaParaCompartir, gastoDeLaCuenta, BILLETES, PAGOS_MAX, pagosPosibles, vuelta, pagoJusto,
    MARGENES, tasaOfrecida, analizarCambio,
    domingoDePascua, hayTasaEl, tasaVieja, textoTasaVieja, horaBce, textoActualizado, proximaTasa, textoProximaTasa,
    FECHA_MINIMA, fechaLarga, fechaValida, diaDelGrafico, mesesAtras, FECHAS_RAPIDAS, leerFecha, cambioDesde, notaDiaHabil,
    textoInsignia, cambioDiario, sentidoDe, cambioDelDia, textoCambioDia, ULTIMA_VEZ_MINIMO, desdeLaUltimaVez, ultimoVisto, tituloInsignia, tituloHoy, leerGrados, convertirGrados, textoGrados, leerDistancia, convertirDistancia, textoDistancia, leerPeso, convertirPeso, textoPeso, leerOnzas, convertirOnzas, textoOnzas, leerAltura, convertirAltura, textoAltura, leerVelocidad, convertirVelocidad, textoVelocidad, leerVolumen, convertirVolumen, textoVolumen, leerLongitud, convertirLongitud, textoLongitud, leerSuperficie, convertirSuperficie, textoSuperficie, leerConsumo, convertirConsumo, textoConsumo, leerPresion, convertirPresion, textoPresion, leerTazas, convertirTazas, textoTazas, leerCucharadas, convertirCucharadas, textoCucharadas, leerYardas, convertirYardas, textoYardas, leerStone, convertirStone, textoStone, leerOnzasLiquidas, convertirOnzasLiquidas, textoOnzasLiquidas, leerPintas, convertirPintas, textoPintas, leerCuartos, convertirCuartos, textoCuartos, leerNudos, convertirNudos, textoNudos, leerAcres, convertirAcres, textoAcres, esHoyBarra, resumenHoyBarra, esAyerBarra, resumenAyerBarra, lineaTasa,
    AVISOS_MAX, AVISO_PCT_MAX, sentidoAviso, crearAviso, leerPorcentajeAviso, crearAvisoPorcentaje, leerAvisos, avisoCumplido, repartirAvisos, mensajeAviso, faltaParaAviso, cercaniaAviso, textoFalta,
    nivelPresupuesto, avisosPresupuesto, mensajePresupuesto,
    RECORDATORIO_HORA, RECORDATORIO_HORAS, leerHoraRecordatorio, viajesSinApuntar, tocaRecordar, mensajeRecordatorio,
    ATAJOS, atajoPara, textoAtajo,
  };
}
