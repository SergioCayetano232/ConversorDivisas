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
  return evaluar(completar(texto));
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

// El primer día que publicó el BCE; antes la API contesta "not found".
const FECHA_MINIMA = "1999-01-04";

function fechaLarga(iso) {
  const [a, m, d] = iso.split("-").map(Number);
  return fechas({ weekday: "short", day: "numeric", month: "short", year: "numeric" })
    .format(new Date(a, m - 1, d))
    .replace(".", "");
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

// Las propinas de siempre: en Europa poco o nada, en Estados Unidos del 15 al 20.
const PROPINAS_RAPIDAS = [0, 10, 15, 20];
const PROPINA_MAX = 30;
const PERSONAS_MAX = 20;
const CUENTA_POR_DEFECTO = { propina: 10, personas: 2 };

function leerCuenta(guardado) {
  const { propina, personas } = guardado ?? {};
  return {
    propina: Number.isFinite(propina) && propina >= 0 && propina <= PROPINA_MAX
      ? redondearComision(propina) : CUENTA_POR_DEFECTO.propina,
    personas: Number.isInteger(personas) && personas >= 1 && personas <= PERSONAS_MAX
      ? personas : CUENTA_POR_DEFECTO.personas,
  };
}

// Hacia arriba: mejor que en la mesa sobre un céntimo a que falte. El margen
// es para que 10,00 no se vaya a 10,01 por los decimales del ordenador.
const alCentimo = (n) => Math.ceil(n * 100 - 1e-6) / 100;

// La propina va sobre la cuenta tal cual, y la comisión sobre lo que te cobran
// después en tu divisa, igual que en el resto del popup.
function repartirCuenta(cantidad, rate, { propina, personas }, comision = 0) {
  if (!Number.isFinite(cantidad) || cantidad <= 0) return null;
  const total = cantidad * (1 + propina / 100);
  const tuyo = Number.isFinite(rate) && rate > 0 ? conComision(total * rate, comision) : null;
  return {
    propina: total - cantidad,
    total,
    cadaUno: alCentimo(total / personas),
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

const viajeVacio = (id, nombre = "") => ({ id, nombre: limpiarNombreViaje(nombre), gastos: [], presupuesto: null, cajero: [] });

// Antes de los viajes había una sola lista y un presupuesto sueltos: pasan a
// ser el primer viaje, sin nombre, para que nadie pierda lo que tenía.
function leerViajes(guardado, gastosSueltos, presupuestoSuelto) {
  const vistos = new Set();
  const lista = (Array.isArray(guardado?.lista) ? guardado.lista : [])
    .filter((v) => v && typeof v.id === "string" && v.id && !vistos.has(v.id) && vistos.add(v.id))
    .slice(0, VIAJES_MAX)
    .map((v) => ({
      id: v.id, nombre: limpiarNombreViaje(v.nombre), gastos: leerGastos(v.gastos), presupuesto: leerPresupuesto(v.presupuesto),
      cajero: leerRetiradas(v.cajero),
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
  return { activo: id, lista: [...viajes.lista, viajeVacio(id, limpio)] };
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

const EMOJI_CATEGORIA = {
  comida: "🍽️", transporte: "🚕", alojamiento: "🏨", ocio: "🎟️", compras: "🛍️", otros: "📌",
};

// Lo que se comenta en el grupo. Con un gasto, el más caro es el total; y con
// dos días, el que más se ve a simple vista en la lista de días.
function destacados(gastos) {
  const [principal] = sumarPorDivisa(gastos);
  if (!principal || gastos.length < 2) return { caro: null, dia: null };
  const suyos = gastos.filter((g) => g.to === principal.to);
  const caro = suyos.reduce((max, g) => (g.valor > max.valor ? g : max));
  const dias = gastosPorDia(suyos).map(({ dia, totales }) => ({ dia, total: totales[0].total, to: principal.to }));
  const dia = dias.length >= 3 ? dias.reduce((max, d) => (d.total > max.total ? d : max)) : null;
  return { caro, dia };
}

// Para pegarlo en WhatsApp: lo de entre asteriscos sale en negrita, y en
// cualquier otro sitio se lee igual de bien. Los días van del primero al último,
// que es como se cuenta un viaje.
function resumenParaCompartir({ nombre, gastos, presupuesto }, hoyIso = hoy()) {
  if (gastos.length === 0) return "";
  const dinero = (n, to) => `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ${to}`;
  const sumas = (totales) => totales.map(({ total, to }) => dinero(total, to)).join(" + ");
  const n = gastos.length;

  const lineas = [
    `*🧳 ${nombre}*`,
    tr("compartir.total", { total: `*${sumas(sumarPorDivisa(gastos))}*`, n: n === 1 ? tr("gastos.uno") : tr("gastos.n", { n }) }),
  ];

  const { caro, dia } = destacados(gastos);
  if (caro) {
    const que = caro.concepto || tr(`cat.${caro.categoria}`);
    lineas.push(tr("compartir.caro", { que, valor: dinero(caro.valor, caro.to), dia: nombreDia(isoLocal(new Date(caro.cuando)), hoyIso) }));
  }
  if (dia) lineas.push(tr("compartir.diaMas", { dia: nombreDia(dia.dia, hoyIso), valor: dinero(dia.total, dia.to) }));
  const pagadas = comisionesPagadas(gastos);
  if (pagadas) lineas.push(tr("compartir.comisiones", { valor: dinero(pagadas.total, pagadas.to) }));

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

function mediaPorDia(gastos) {
  const principal = sumarPorDivisa(gastos)[0];
  if (!principal) return null;
  const dias = gastosPorDia(gastos);
  const total = diasHasta(dias[0].dia, dias[dias.length - 1].dia);
  if (total < 2) return null;
  return { media: principal.total / total, to: principal.to, dias: total };
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
function csvGastos(lista) {
  return filasCsv(
    [tr("csv.fecha"), tr("csv.hora"), tr("csv.concepto"), tr("csv.categoria"), tr("csv.cantidad"), tr("csv.de"), tr("csv.importe"), tr("csv.a"), tr("csv.pago"), tr("csv.comision")],
    [...lista].reverse().map((g) => [
      isoLocal(new Date(g.cuando)), horaLocal(g.cuando), g.concepto, tr(`cat.${g.categoria ?? CATEGORIA_POR_DEFECTO}`),
      numeroCsv(g.cantidad), g.from, numeroCsv(g.valor), g.to, tr(`pago.${leerPago(g.pago)}`), numeroCsv(comisionDe(g)),
    ]),
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

function textoParaCopiar(valor) {
  return valor.toFixed(2).replace(".", separadorDecimal());
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

function leerAvisos(guardado) {
  if (!Array.isArray(guardado)) return [];
  return guardado
    .filter((a) => a && typeof a.id === "string" && isValidCode(a.from) && isValidCode(a.to)
      && (a.sentido === "sube" || a.sentido === "baja") && typeof a.umbral === "number" && a.umbral > 0)
    .slice(0, AVISOS_MAX);
}

function avisoCumplido(aviso, rate) {
  if (typeof rate !== "number") return false;
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

// Por event.code y no por event.key: en Mac, Opción+S escribe "ß", y en otros
// teclados la tecla de la S puede traer otra letra.
const ATAJOS = {
  KeyS: "intercambiar",
  KeyC: "copiar",
  KeyD: "origen",
  KeyA: "destino",
  Digit1: "vista:evolucion",
  Digit2: "vista:extras",
  Digit3: "vista:avisos",
  Digit4: "vista:chuleta",
  Digit5: "vista:fecha",
  Digit6: "vista:timo",
  KeyG: "gastos",
  KeyP: "cuenta",
  // La H ya es la ayuda: R de "recientes".
  KeyR: "historial",
  // B de balanza.
  KeyB: "comparar",
  KeyZ: "deshacer",
  KeyH: "ayuda",
};

// Escribiendo en un campo las letras son letras (la x es "por" en las
// cuentas), así que ahí hace falta Alt. Cmd y Ctrl no los toco nunca: son
// copiar, pegar y compañía.
function atajoPara({ code, key, altKey, ctrlKey, metaKey, shiftKey, enCampo }) {
  // La única excepción: Cmd+Z fuera de un campo no hace nada en el navegador, y
  // es lo primero que pulsas cuando borras algo sin querer.
  if ((ctrlKey || metaKey) && code === "KeyZ" && !enCampo && !altKey && !shiftKey) return "deshacer";
  if (ctrlKey || metaKey) return null;
  if (!enCampo && key === "?") return "ayuda";
  if (enCampo && !altKey) return null;
  const accion = ATAJOS[code] ?? null;
  return accion === "copiar" && shiftKey ? "copiarFrase" : accion;
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
  if (d.pagoGasto !== undefined) datos.pagoGasto = leerPago(d.pagoGasto);
  if (d.cuentaReparto !== undefined) datos.cuentaReparto = leerCuenta(d.cuentaReparto);
  if (typeof d.insigniaActiva === "boolean") datos.insigniaActiva = d.insigniaActiva;
  if (typeof d.tasaAlReves === "boolean") datos.tasaAlReves = d.tasaAlReves;
  if (d.idioma === "auto" || TEXTOS[d.idioma]) datos.idioma = d.idioma;
  return datos;
}

// Las claves que borro antes de restaurar: las de la copia y las de antes de
// los viajes, para que no vuelvan a aparecer mezcladas.
const CLAVES_COPIA = [
  "viajes", "gastosViaje", "presupuestoViaje", "lastPair", "paresRecientes", "divisasExtra", "avisos",
  "historialConversiones", "rangoGrafico", "comisionBanco", "impuestoVenta", "pagoGasto", "cuentaReparto", "insigniaActiva", "tasaAlReves", "idioma",
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
    evaluar, completar, leerImporte, esOperacion, pasoCantidad, leerCantidad,
    normalizar, filtrarDivisas, buildPaths, startDateFor, errorMessageFor,
    RECIENTES_MAX, FIJOS_MAX, apuntarReciente, fijarReciente, leerRecientes, recientesVisibles,
    RANGOS, RANGO_POR_DEFECTO, leerRango, coordenadas, alturaEn, MOMENTO_UMBRAL, momento, textoMomento, indiceCercano, extremos, fechaCorta, largoEnPantalla,
    leerNumero, divisaDe, leerSeleccion, destinoPara, leerPegado, buscarPrecios, precioEntero, leerOmnibox, escaparXml,
    divisaDeIdioma, parPorIdioma, banderaDe, banderaDivisa,
    HISTORIAL_MAX, leerHistorial, apuntarConversion, quitarConversion, haceCuanto, textoParaCopiar, fraseParaCopiar,
    celdaCsv, csvHistorial, csvGastos,
    GASTOS_MAX, CONCEPTO_MAX, crearGasto, leerGastos, apuntarGasto, quitarGasto, cambiarConcepto, cambiarDia, buscarGastos, trozosResaltados, repetirGasto, devolverGasto, devolverTodos, sumarPorDivisa, gastosPorDia, pesoDeLosDias, mediaPorDia, comisionesPagadas, pagadoEnEfectivo,
    RETIRADAS_MAX, leerRetiradas, crearRetirada, apuntarRetirada, quitarRetirada, efectivoQueda, EFECTIVO_POCO, tonoEfectivo, gastadoHoy, nombreDia,
    CATEGORIAS, CATEGORIA_POR_DEFECTO, adivinarCategoria, PAGOS, PAGO_POR_DEFECTO, leerPago, comisionDelPago, desglose, conceptosUsados, completarConcepto,
    EMOJI_CATEGORIA, destacados, resumenParaCompartir,
    COPIA_APP, COPIA_VERSION, CLAVES_COPIA, limpiarCopia, crearCopia, leerCopia, resumenCopia,
    VIAJES_MAX, NOMBRE_VIAJE_MAX, leerViajes, viajeActivo, crearViaje, renombrarViaje, elegirViaje, borrarViaje, cambiarViaje, resumenViaje, archivoGastos,
    diasHasta, leerPresupuesto, PRESUPUESTO_JUSTO, estadoPresupuesto, inicioDelViaje, diaDelViaje, hastaCuandoLlega, loQueSeLleva, redondearDias,
    EXTRAS_MAX, EXTRAS_POR_DEFECTO, leerExtras, anadirExtra, quitarExtra,
    extrasVisibles, disponiblesParaAnadir, convertirExtras, semanaDe, trazoMini, CHULETA, escalaChuleta, chuleta, chuletaParaCompartir,
    COMISION_MAX, COMISIONES_RAPIDAS, leerComision, leerPorcentaje, conComision,
    IMPUESTO_MAX, IMPUESTOS_RAPIDOS, leerImpuesto, leerImpuestoEscrito, loQuePagas,
    COMPARAR_IGUAL, compararPrecios, inclinacion,
    PROPINAS_RAPIDAS, PROPINA_MAX, PERSONAS_MAX, CUENTA_POR_DEFECTO, leerCuenta, repartirCuenta, cuentaParaCompartir,
    MARGENES, tasaOfrecida, analizarCambio,
    FECHA_MINIMA, fechaLarga, fechaValida, diaDelGrafico, mesesAtras, FECHAS_RAPIDAS, leerFecha, cambioDesde, notaDiaHabil,
    textoInsignia, cambioDiario, sentidoDe, cambioDelDia, textoCambioDia, tituloInsignia, lineaTasa,
    AVISOS_MAX, sentidoAviso, crearAviso, leerAvisos, avisoCumplido, repartirAvisos, mensajeAviso, faltaParaAviso, cercaniaAviso, textoFalta,
    nivelPresupuesto, avisosPresupuesto, mensajePresupuesto,
    ATAJOS, atajoPara, textoAtajo,
  };
}
