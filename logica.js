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
      fichas.push({ tipo: "num", v });
      i += num[0].length;
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
  if (!HAY_OPERACION.test(texto)) return parseAmount(texto);

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
  return HAY_OPERACION.test(String(texto).trim());
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

function apuntarReciente(lista, from, to) {
  if (from === to) return lista;
  const resto = lista.filter((p) => p.from !== from || p.to !== to);
  return [{ from, to }, ...resto].slice(0, RECIENTES_MAX);
}

// Lo que venga del almacenamiento no me lo creo: puede no existir (versiones
// de antes) o traer una divisa que ya he quitado del array.
function leerRecientes(guardado) {
  if (!Array.isArray(guardado)) return [];
  return guardado
    .filter((p) => p && isValidCode(p.from) && isValidCode(p.to) && p.from !== p.to)
    .slice(0, RECIENTES_MAX);
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

function convertirExtras(cantidad, tasas, codes) {
  return codes.map((code) => ({
    code,
    valor: cantidad === null || typeof tasas?.[code] !== "number" ? null : cantidad * tasas[code],
  }));
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

function chuleta(rate) {
  const escala = escalaChuleta(rate);
  const hay = Number.isFinite(rate) && rate > 0;
  return CHULETA.map((n) => ({ cantidad: n * escala, valor: hay ? n * escala * rate : null }));
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

function leerPorcentaje(texto) {
  const limpio = String(texto ?? "").replace(/[\s%]/g, "").replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(limpio)) return null;
  const pct = Number(limpio);
  return pct > COMISION_MAX ? null : redondearComision(pct);
}

function conComision(valor, pct) {
  if (valor === null || !Number.isFinite(valor)) return null;
  return valor * (1 + pct / 100);
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

// El número a secas, sin código ni separador de miles: lo normal es que acabe
// pegado en una hoja de cálculo y ahí estorba. El decimal, el del idioma.
function textoParaCopiar(valor) {
  return valor.toFixed(2).replace(".", separadorDecimal());
}

function destinoPara(divisa, par) {
  if (!divisa) return { from: par.from, to: par.to };
  return { from: divisa, to: divisa === par.to ? par.from : par.to };
}

// La insignia del icono corta a partir de unos cuatro caracteres, así que los
// decimales se van quitando según crece la tasa: 1,14 · 20,3 · 178 · 20k.
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

const tasaLarga = (n) => numeros({ minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(n);

function tituloInsignia(par, rate, cambio) {
  const tasa = `1 ${par.from} = ${tasaLarga(rate)} ${par.to}`;
  if (cambio === null) return tasa;
  const pct = numeros({
    style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "exceptZero",
  }).format(cambio);
  return tr("insignia.cambio", { tasa, cambio: pct });
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

function mensajeAviso(aviso, rate) {
  return {
    titulo: tr("avisos.notiTitulo", { from: aviso.from, tasa: tasaLarga(rate), to: aviso.to }),
    cuerpo: tr(aviso.sentido === "sube" ? "avisos.notiSube" : "avisos.notiBaja", { umbral: tasaLarga(aviso.umbral) }),
  };
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
  KeyH: "ayuda",
};

// Escribiendo en un campo las letras son letras (la x es "por" en las
// cuentas), así que ahí hace falta Alt. Cmd y Ctrl no los toco nunca: son
// copiar, pegar y compañía.
function atajoPara({ code, key, altKey, ctrlKey, metaKey, enCampo }) {
  if (ctrlKey || metaKey) return null;
  if (!enCampo && key === "?") return "ayuda";
  if (enCampo && !altKey) return null;
  return ATAJOS[code] ?? null;
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

// El popup lo carga como script normal y lo lee del ámbito global; Node necesita
// el export. Sin esto habría que montar un build, y aquí no hay ninguno.
if (typeof module !== "undefined") {
  module.exports = {
    CURRENCIES, isValidCode, nombreDe, parseAmount, isoLocal, hoy, isFresh,
    evaluar, completar, leerImporte, esOperacion,
    normalizar, filtrarDivisas, buildPaths, startDateFor, errorMessageFor,
    RECIENTES_MAX, apuntarReciente, leerRecientes, recientesVisibles,
    RANGOS, RANGO_POR_DEFECTO, leerRango, coordenadas, alturaEn, MOMENTO_UMBRAL, momento, textoMomento, indiceCercano, extremos, fechaCorta, largoEnPantalla,
    leerNumero, divisaDe, leerSeleccion, destinoPara,
    divisaDeIdioma, parPorIdioma, banderaDe,
    HISTORIAL_MAX, leerHistorial, apuntarConversion, haceCuanto, textoParaCopiar,
    EXTRAS_MAX, EXTRAS_POR_DEFECTO, leerExtras, anadirExtra, quitarExtra,
    extrasVisibles, disponiblesParaAnadir, convertirExtras, CHULETA, escalaChuleta, chuleta,
    COMISION_MAX, COMISIONES_RAPIDAS, leerComision, leerPorcentaje, conComision,
    FECHA_MINIMA, fechaLarga, fechaValida, mesesAtras, FECHAS_RAPIDAS, leerFecha, cambioDesde, notaDiaHabil,
    textoInsignia, cambioDiario, sentidoDe, tituloInsignia,
    AVISOS_MAX, sentidoAviso, crearAviso, leerAvisos, avisoCumplido, repartirAvisos, mensajeAviso,
    ATAJOS, atajoPara, textoAtajo,
  };
}
