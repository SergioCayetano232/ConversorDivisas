// La lógica que no toca la pantalla, separada para poder probarla con node.
// popup.js la carga antes que a sí mismo; en los tests se importa tal cual.

const CURRENCIES = [
  { code: "EUR", name: "Euro" },
  { code: "USD", name: "Dólar estadounidense" },
  { code: "GBP", name: "Libra esterlina" },
  { code: "JPY", name: "Yen japonés" },
  { code: "CHF", name: "Franco suizo" },
  { code: "CAD", name: "Dólar canadiense" },
  { code: "AUD", name: "Dólar australiano" },
  { code: "CNY", name: "Yuan chino" },
  { code: "MXN", name: "Peso mexicano" },
  { code: "BRL", name: "Real brasileño" },
  { code: "SEK", name: "Corona sueca" },
  { code: "NOK", name: "Corona noruega" },
  { code: "DKK", name: "Corona danesa" },
  { code: "PLN", name: "Esloti polaco" },
  { code: "TRY", name: "Lira turca" },
  // Las que se usan menos van detrás, para que el desplegable empiece por las
  // de siempre. Son todas las que publica el BCE; el lev búlgaro ya no está
  // desde que Bulgaria entró en el euro.
  { code: "CZK", name: "Corona checa" },
  { code: "HKD", name: "Dólar de Hong Kong" },
  { code: "HUF", name: "Forinto húngaro" },
  { code: "IDR", name: "Rupia indonesia" },
  { code: "ILS", name: "Séquel israelí" },
  { code: "INR", name: "Rupia india" },
  { code: "ISK", name: "Corona islandesa" },
  { code: "KRW", name: "Won surcoreano" },
  { code: "MYR", name: "Ringgit malayo" },
  { code: "NZD", name: "Dólar neozelandés" },
  { code: "PHP", name: "Peso filipino" },
  { code: "RON", name: "Leu rumano" },
  { code: "SGD", name: "Dólar de Singapur" },
  { code: "THB", name: "Baht tailandés" },
  { code: "ZAR", name: "Rand sudafricano" },
];

const isValidCode = (code) => CURRENCIES.some((c) => c.code === code);

const nombreDe = (code) => CURRENCIES.find((c) => c.code === code)?.name ?? code;

function parseAmount(raw) {
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
    if (normalizar(divisa.code).startsWith(q)) porCodigo.push(divisa);
    else if (normalizar(divisa.name).includes(q)) porNombre.push(divisa);
  }

  return [...porCodigo, ...porNombre];
}

// Dejo un margen a los lados y arriba: el trazo se pinta centrado sobre la
// línea, así que pegado al borde se le come la mitad.
const PAD_X = 1.5;
const PAD_Y = 3;

// Dónde cae cada valor en el viewBox de 100x28 del gráfico.
function coordenadas(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;

  const stepX = (100 - PAD_X * 2) / (values.length - 1);
  const bottom = 28 - PAD_Y;
  const height = bottom - PAD_Y;

  return values.map((value, index) => ({
    x: PAD_X + index * stepX,
    // Si la tasa no se ha movido, span es 0: dibujamos una línea centrada.
    y: span === 0 ? 14 : bottom - ((value - min) / span) * height,
  }));
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

const nfFecha = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" });

// new Date("2026-09-29") lo lee como medianoche en UTC, y en América eso
// todavía es el día 28. Montándola a mano sale el día que pone.
function fechaCorta(iso) {
  const [a, m, d] = iso.split("-").map(Number);
  return nfFecha.format(new Date(a, m - 1, d)).replace(".", "");
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
  [/\bdolar(es)? canadienses?\b/, "CAD"],
  [/\bdolar(es)? australianos?\b/, "AUD"],
  [/\bdolar(es)? neozelandes(es)?\b/, "NZD"],
  [/\bdolar(es)? (de )?hong kong\b|\bhongkones(es)?\b/, "HKD"],
  [/\bdolar(es)? (de )?singapur\b|\bsingapurenses?\b/, "SGD"],
  [/\b(dolar(es)?|dollars?)\b/, "USD"],
  [/\b(libras?|pounds?)\b/, "GBP"],
  [/\byen(es)?\b/, "JPY"],
  [/\byuan(es)?\b/, "CNY"],
  [/\bfrancos?\b/, "CHF"],
  [/\bpesos? filipinos?\b/, "PHP"],
  [/\bpesos?\b/, "MXN"],
  [/\b(real|reales|reais)\b/, "BRL"],
  [/\bcoronas? suecas?\b/, "SEK"], [/\bcoronas? noruegas?\b/, "NOK"], [/\bcoronas? danesas?\b/, "DKK"],
  [/\bcoronas? checas?\b/, "CZK"], [/\bcoronas? islandesas?\b/, "ISK"],
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
function destinoPara(divisa, par) {
  if (!divisa) return { from: par.from, to: par.to };
  return { from: divisa, to: divisa === par.to ? par.from : par.to };
}

// La insignia del icono corta a partir de unos cuatro caracteres, así que los
// decimales se van quitando según crece la tasa: 1,14 · 20,3 · 178 · 20k.
function textoInsignia(rate) {
  if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) return "";
  const es = (n, dec) => n.toFixed(dec).replace(".", ",");
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

const nfTasaLarga = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const nfCambio = new Intl.NumberFormat("es-ES", {
  style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "exceptZero",
});

function tituloInsignia(par, rate, cambio) {
  const tasa = `1 ${par.from} = ${nfTasaLarga.format(rate)} ${par.to}`;
  return cambio === null ? tasa : `${tasa} · ${nfCambio.format(cambio)} desde el día anterior`;
}

function errorMessageFor(error) {
  if (error.name === "AbortError") {
    return "La conexión ha tardado demasiado.";
  }
  if (!navigator.onLine) {
    return "Sin conexión a internet.";
  }
  if (error.message.startsWith("HTTP")) {
    return "El servicio de tasas no responde.";
  }
  return "No se han podido obtener las tasas.";
}

// El popup lo carga como script normal y lo lee del ámbito global; Node necesita
// el export. Sin esto habría que montar un build, y aquí no hay ninguno.
if (typeof module !== "undefined") {
  module.exports = {
    CURRENCIES, isValidCode, nombreDe, parseAmount, isoLocal, hoy, isFresh,
    evaluar, completar, leerImporte, esOperacion,
    normalizar, filtrarDivisas, buildPaths, startDateFor, errorMessageFor,
    RECIENTES_MAX, apuntarReciente, leerRecientes, recientesVisibles,
    coordenadas, indiceCercano, extremos, fechaCorta, largoEnPantalla,
    leerNumero, divisaDe, leerSeleccion, destinoPara,
    EXTRAS_MAX, EXTRAS_POR_DEFECTO, leerExtras, anadirExtra, quitarExtra,
    extrasVisibles, disponiblesParaAnadir, convertirExtras,
    textoInsignia, cambioDiario, sentidoDe, tituloInsignia,
  };
}
