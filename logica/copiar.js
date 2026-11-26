// Sacar las cosas fuera (CSV, copiar, pegar) y los detalles del popup: sonidos,
// animaciones y la insignia del icono.

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

// Lo que se escribe detrás del precio cuando lo seleccionas en un campo de
// texto: "50 USD" se queda en "50 USD (≈ 43,10 EUR)". Con una medida, igual.
function anadidoConvertido({ valor, to, texto } = {}) {
  if (Number.isFinite(valor) && isValidCode(to)) {
    return `(≈ ${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor)} ${to})`;
  }
  const limpio = String(texto ?? "").trim();
  return limpio ? `(≈ ${limpio})` : "";
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

// Lo mismo que el botón de copiar, pero con una fila del reloj: Shift la frase,
// Alt el símbolo y los dos juntos la frase con símbolos.
function conversionParaCopiar({ cantidad, from, resultado, to }, { entera = false, conSimbolo = false } = {}) {
  if (!Number.isFinite(resultado)) return "";
  const par = { cantidad, from, valor: resultado, to };
  if (entera) return conSimbolo ? fraseConSimbolo(par) : fraseParaCopiar(par);
  return conSimbolo ? textoConSimbolo(resultado, to) : textoParaCopiar(resultado);
}

// Con tu divisa elegida, un precio de fuera va a la tuya aunque el par diga otra
// cosa. Si ya está en la tuya, o no la has elegido, manda el par como siempre.
function destinoPara(divisa, par, casa = null) {
  if (!divisa) return { from: par.from, to: par.to };
  if (isValidCode(casa) && divisa !== casa) return { from: divisa, to: casa };
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

// El correo de la reserva pegado tal cual (Booking, Airbnb, el del hotel): el
// alojamiento, lo que cuesta, las noches y si se paga allí. No pretendo leer
// cualquier correo: si no hay pinta de reserva y un precio con su divisa, nada.
const PISTA_RESERVA = /\b(reserva|booking|check-?in|entrada|llegada|alojamiento|hotel|airbnb|noches?|nights?|estancia|stay|confirmaci[oó]n|confirmation)\b/i;
const LINEA_TOTAL = /\b(total|importe|you(?:'ll| will)? pay|pagar[aá]s|a pagar|amount|precio)\b/i;
const PAGAR_ALLI = /\b(pagas|pagar[aá]s|pagar|pago|se paga)\b[^.\n]{0,25}\b(en el|al|en)\b[^.\n]{0,10}\b(alojamiento|hotel|llegar|destino|propiedad)\b|\bpay(?:ment)?\b[^.\n]{0,20}\b(at the property|at the hotel|on arrival|at check-?in)\b/i;
const MESES = { ene: 1, jan: 1, feb: 2, mar: 3, abr: 4, apr: 4, may: 5, jun: 6, jul: 7, ago: 8, aug: 8, sep: 9, set: 9, oct: 10, nov: 11, dic: 12, dec: 12 };

// "12 de enero de 2027", "Jan 12, 2027", "12/01/2027" o "2027-01-12". Sin año,
// el próximo que caiga a partir de hoy, que una reserva siempre es de adelante.
function leerFechaReserva(texto, hoyIso = hoy()) {
  const t = normalizar(String(texto ?? ""));
  let a, m, d;
  let x = t.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (x) [, a, m, d] = x.map(Number);
  if (!x && (x = t.match(/\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\b/))) [, d, m, a] = x.map(Number);
  if (!x && (x = t.match(/\b(\d{1,2})(?:\s+de)?\s+([a-z]{3})[a-z]*\.?(?:\s+de)?(?:\s+(\d{4}))?/))) {
    [d, m, a] = [Number(x[1]), MESES[x[2]], x[3] ? Number(x[3]) : null];
  }
  if (!x && (x = t.match(/\b([a-z]{3})[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?(?:\s+(\d{4}))?/))) {
    [m, d, a] = [MESES[x[1]], Number(x[2]), x[3] ? Number(x[3]) : null];
  }
  if (!x || !m || !(d >= 1 && d <= 31) || m > 12) return null;
  if (a && a < 100) a += 2000;
  const anio = Number(hoyIso.slice(0, 4));
  const iso = (y) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  if (!a) a = iso(anio) >= hoyIso ? anio : anio + 1;
  return esIso(iso(a)) ? iso(a) : null;
}

// La fecha va en la misma línea que "Entrada" o en la siguiente, según el correo.
function fechaTras(lineas, patron, hoyIso) {
  const i = lineas.findIndex((l) => patron.test(l));
  if (i === -1) return null;
  return leerFechaReserva(lineas[i].replace(patron, ""), hoyIso) ?? leerFechaReserva(lineas[i + 1] ?? "", hoyIso);
}

function nombreReserva(texto) {
  const deReserva = texto.match(/\b(?:reserva|booking|estancia|stay)\b[^\n]{0,20}?\b(?:en|at|in)\s+([^\n,.!:(]{3,40})/i);
  // Con \b no vale: detrás de la "á" de "está" no hay límite de palabra para JS.
  const limpio = (n) => n.replace(/\s+(est[aá]|is|has|ha)(?=\s|$).*$/i, "").trim();
  if (deReserva) return limpio(deReserva[1]);
  // El nombre en mayúscula: si no, "pay at the hotel on arrival" salía como hotel.
  const alojamiento = texto.match(/\b((?:[Hh]otel|[Hh]ostal|[Hh]ostel|[Rr]yokan|[Aa]partamentos?|[Aa]partments?|[Rr]iad|[Pp]osada)\s+\p{Lu}[^\n,.!:(]{1,30})/u);
  if (alojamiento) return limpio(alojamiento[1]);
  return /airbnb/i.test(texto) ? "Airbnb" : null;
}

function leerReserva(texto, hoyIso = hoy()) {
  if (typeof texto !== "string" || texto.length < 40 || !PISTA_RESERVA.test(texto)) return null;
  const lineas = texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lineas.length < 3) return null;
  // El total es el mayor de las líneas de "Total": el subtotal y las tasas son menos.
  const candidatos = [];
  lineas.forEach((l, i) => {
    if (!LINEA_TOTAL.test(l)) return;
    const precios = buscarPrecios(l).length ? buscarPrecios(l) : buscarPrecios(lineas[i + 1] ?? "");
    candidatos.push(...precios);
  });
  const precios = candidatos.length ? candidatos : buscarPrecios(texto);
  if (!precios.length) return null;
  const total = precios.reduce((a, b) => (b.cantidad > a.cantidad ? b : a));
  const entrada = fechaTras(lineas, /\b(entrada|llegada|check-?in|arrival)\b:?/i, hoyIso);
  const salida = fechaTras(lineas, /\b(salida|check-?out|departure)\b:?/i, hoyIso);
  const dichas = Number(texto.match(/\b(\d{1,2})\s*(?:noches?|nights?)\b/i)?.[1]);
  const porFechas = entrada && salida && salida > entrada ? diasHasta(salida, entrada) - 1 : null;
  const noches = dichas > 0 ? dichas : porFechas;
  return {
    nombre: nombreReserva(texto),
    cantidad: total.cantidad,
    divisa: total.divisa,
    noches: noches > 0 ? Math.min(noches, NOCHES_MAX) : null,
    entrada,
    salida,
    aPagar: PAGAR_ALLI.test(texto),
  };
}

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

// La onda de un botón sale de donde has pulsado y tiene que llegar a la
// esquina más lejana, o en los botones anchos se quedaría a medias.
function radioOnda(ancho, alto, x, y) {
  if (![ancho, alto, x, y].every(Number.isFinite) || ancho <= 0 || alto <= 0) return 0;
  const dx = Math.max(x, ancho - x);
  const dy = Math.max(y, alto - y);
  return Math.ceil(Math.hypot(dx, dy));
}

// Cuánto se aplasta un botón al pulsarlo, en píxeles y no en proporción: con
// lo mismo para todos, Copiar apenas se movía y los anchos se desbordaban.
const APLASTE_ALTO = 3;
const APLASTE_ANCHO = 2;
function aplaste(ancho, alto) {
  if (!(ancho > 0 && alto > 0)) return null;
  const y = Math.min(0.14, APLASTE_ALTO / alto);
  const x = Math.min(0.06, APLASTE_ANCHO / ancho);
  return { x: +(1 + x).toFixed(3), y: +(1 - y).toFixed(3) };
}

// Deslizar un gasto a la izquierda para quitarlo. Hay que llevarlo un tercio
// largo de la fila (o 72 px en las estrechas), o lanzarlo rápido: con menos,
// un arrastre sin querer al seleccionar te lo borraba.
const DESLIZAR_MIN = 72;
const DESLIZAR_PARTE = 0.35;
const DESLIZAR_RAPIDO = 0.6;
const DESLIZAR_RAPIDO_MIN = 24;

function umbralDeslizar(ancho) {
  return Math.max(DESLIZAR_MIN, (Number.isFinite(ancho) ? ancho : 0) * DESLIZAR_PARTE);
}

// Hacia la derecha no va: tira un poco, con resistencia, para que se note que
// por ahí no es.
function tirarGasto(dx, ancho) {
  if (!Number.isFinite(dx)) return { x: 0, progreso: 0 };
  if (dx >= 0) return { x: Math.round(Math.sqrt(dx) * 2), progreso: 0 };
  return { x: Math.round(dx), progreso: Math.min(1, -dx / umbralDeslizar(ancho)) };
}

// La velocidad va en píxeles por milisegundo, negativa hacia la izquierda.
function quitarAlSoltar(dx, ancho, velocidad = 0) {
  if (!Number.isFinite(dx) || dx >= 0) return false;
  if (-dx >= umbralDeslizar(ancho)) return true;
  return velocidad <= -DESLIZAR_RAPIDO && -dx >= DESLIZAR_RAPIDO_MIN;
}

// La roseta de guilloche de la marca de agua del resultado, como la de los
// billetes. Cada divisa saca la suya del código, así que el yen siempre tiene
// el mismo dibujo y no se parece al del dólar.
const ROSETA_PASOS = 720;

function semillaDivisa(code) {
  let h = 2166136261;
  for (const c of String(code)) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return h;
}

function rosetaBillete(code, radio = 60) {
  if (typeof code !== "string" || !/^[A-Z]{3}$/.test(code)) return null;
  const h = semillaDivisa(code);
  const petalos = 7 + (h % 9);
  const hondo = 0.18 + ((h >>> 4) % 8) * 0.02;
  const lazos = 2 + ((h >>> 8) % 3);
  const trazo = (fase, escala) => {
    const puntos = [];
    for (let i = 0; i <= ROSETA_PASOS; i++) {
      const t = (i / ROSETA_PASOS) * Math.PI * 2;
      // Una onda grande de pétalos y otra pequeña de lazos encima: es lo que
      // le da el aire de máquina de grabar.
      const r = radio * escala * (1 - hondo + hondo * Math.cos(petalos * t + fase) + 0.04 * Math.sin(petalos * lazos * t));
      puntos.push(`${(r * Math.cos(t)).toFixed(1)} ${(r * Math.sin(t)).toFixed(1)}`);
    }
    return `M${puntos.join("L")}Z`;
  };
  return {
    petalos,
    trazos: [trazo(0, 1), trazo(Math.PI / petalos, 0.86), trazo(0, 0.62)],
  };
}

// La postal del viaje se ladea hacia donde está el ratón, como una de verdad
// que coges por una esquina. Siete grados como mucho: con más se leía mal.
const LADEO_MAX = 7;

function ladeoPostal(x, y, ancho, alto, maximo = LADEO_MAX) {
  if (![x, y, ancho, alto].every(Number.isFinite) || ancho <= 0 || alto <= 0) return null;
  const px = Math.min(1, Math.max(0, x / ancho));
  const py = Math.min(1, Math.max(0, y / alto));
  const redondo = (n) => Math.round(n * 100) / 100 || 0;
  return {
    girarY: redondo((px - 0.5) * 2 * maximo),
    girarX: redondo((0.5 - py) * 2 * maximo),
    luzX: Math.round(px * 100),
    luzY: Math.round(py * 100),
  };
}

// El matasellos de la postal: el sitio dando la vuelta al anillo y la fecha en
// medio, en mayúsculas como en los de correos. La bandera del nombre no entra:
// en tinta de un color sería un borrón.
const MATASELLOS_LARGO = 16;

function matasellos(nombre, hastaIso) {
  const lugar = String(nombre ?? "")
    .replace(/\p{Regional_Indicator}|\p{Extended_Pictographic}|\uFE0F/gu, "")
    .trim()
    .toLocaleUpperCase(localeActual());
  if (!lugar || !/^\d{4}-\d{2}-\d{2}$/.test(hastaIso ?? "")) return null;
  const [a, m, d] = hastaIso.split("-").map(Number);
  const partes = fechas({ day: "numeric", month: "short" }).formatToParts(new Date(a, m - 1, d));
  const dia = partes.find((p) => p.type === "day").value;
  const mes = partes.find((p) => p.type === "month").value.replace(/\./g, "").toLocaleUpperCase(localeActual());
  const corto = [...lugar].length > MATASELLOS_LARGO ? `${[...lugar].slice(0, MATASELLOS_LARGO - 1).join("").trim()}…` : lugar;
  return { lugar: corto, dia, mes, anio: String(a), anillo: `${corto} · CONVERSORDIVISAS · ` };
}

// Las rayas onduladas que salen del matasellos hacia la izquierda, las que
// tachan el sello. En curvas Q para poder pintarlas igual en SVG y en canvas.
function ondasMatasellos({ desde = -62, largo = 112, alto = 5, paso = 14, rayas = [-14, 0, 14] } = {}) {
  return rayas.map((y) => Array.from({ length: Math.round(largo / paso) }, (_, i) => ({
    x0: desde - i * paso, y0: y,
    cx: desde - i * paso - paso / 2, cy: y + (i % 2 ? alto : -alto),
    x1: desde - (i + 1) * paso, y1: y,
  })));
}

// Los sonidos, hechos con osciladores y no con archivos: dos notas cortas
// cada uno. La moneda baja y luego sube, como cuando cae en el bote; copiar es
// un tic más agudo y más corto. Las vibraciones solo valen en Android.
const SONIDO_VOLUMEN = 0.12;
const SONIDO_VOLUMEN_MAX = 0.3;
const SONIDOS = {
  moneda: [
    { hz: 1760, empieza: 0, dura: 0.08, tipo: "triangle" },
    { hz: 2637, empieza: 0.06, dura: 0.22, tipo: "sine" },
  ],
  copiar: [
    { hz: 1320, empieza: 0, dura: 0.05, tipo: "sine" },
    { hz: 1980, empieza: 0.035, dura: 0.08, tipo: "sine" },
  ],
};
const VIBRACIONES = { moneda: [14], copiar: [6] };

function notasDe(nombre, volumen = SONIDO_VOLUMEN) {
  const notas = SONIDOS[nombre];
  if (!notas) return [];
  const v = Math.min(SONIDO_VOLUMEN_MAX, Math.max(0, Number.isFinite(volumen) ? volumen : SONIDO_VOLUMEN));
  return notas.map((n) => ({ ...n, volumen: v }));
}

// El vuelo de la cifra del botón de apuntar hasta el gasto en la lista: una
// curva que sube antes de bajar, como algo que tiras, y no una recta. Cuanto
// más lejos, más alto, con un tope para que no se salga del popup.
const VUELO_PASOS = 12;

function vueloMoneda(desde, hasta) {
  const ok = (p) => p && Number.isFinite(p.x) && Number.isFinite(p.y);
  if (!ok(desde) || !ok(hasta)) return null;
  const dx = hasta.x - desde.x;
  const dy = hasta.y - desde.y;
  const alto = Math.min(70, 18 + Math.hypot(dx, dy) * 0.25);
  const pasos = [];
  for (let i = 0; i <= VUELO_PASOS; i++) {
    const t = i / VUELO_PASOS;
    // Como un tiro: sale hacia arriba y cae acelerando. Con una curva de
    // Bézier, si el gasto estaba muy abajo ni llegaba a subir.
    pasos.push({
      offset: t,
      x: Math.round(dx * t),
      y: Math.round(dy * t * t - 4 * alto * t * (1 - t)) || 0,
      // Crece al despegar y se encoge al llegar, como si se metiera dentro.
      escala: +(t < 0.2 ? 0.7 + t * 2 : 1.1 - (t - 0.2) * 0.75).toFixed(3),
      opacidad: t === 0 ? 0 : t === 1 ? 0.3 : 1,
    });
  }
  return pasos;
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
