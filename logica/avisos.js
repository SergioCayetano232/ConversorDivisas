// Los resúmenes de la barra, las suscripciones, los avisos y los atajos.

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

// Las suscripciones que pagas en otra divisa: Netflix en dólares, iCloud en
// libras. Guardo la tasa del día que te diste de alta para decirte cuánto te
// ha subido (o bajado) solo por el cambio, sin que ellos toquen el precio.
const SUSCRIPCIONES_MAX = 12;
const NOMBRE_SUSCRIPCION_MAX = 24;
const PERIODOS_SUSCRIPCION = ["mes", "anio"];
// Por debajo de medio punto es ruido del cambio de cada día: ni sube ni baja.
const SUSCRIPCION_IGUAL = 0.005;

const limpiarNombreSuscripcion = (nombre) => String(nombre ?? "").replace(/\s+/g, " ").trim().slice(0, NOMBRE_SUSCRIPCION_MAX);

function crearSuscripcion({ id, nombre, importe, divisa, to, periodo, alta, tasa }) {
  const limpio = limpiarNombreSuscripcion(nombre);
  if (typeof id !== "string" || !id || !limpio) return null;
  if (!(importe > 0) || !Number.isFinite(importe) || !isValidCode(divisa) || !isValidCode(to) || divisa === to) return null;
  if (!PERIODOS_SUSCRIPCION.includes(periodo) || !esIso(alta) || !(tasa > 0) || !Number.isFinite(tasa)) return null;
  return { id, nombre: limpio, importe: Math.round(importe * 100) / 100, divisa, to, periodo, alta, tasa };
}

function leerSuscripciones(guardado) {
  if (!Array.isArray(guardado)) return [];
  const vistos = new Set();
  return guardado.map((s) => (s && typeof s === "object" ? crearSuscripcion(s) : null))
    .filter((s) => s && !vistos.has(s.id) && vistos.add(s.id))
    .slice(0, SUSCRIPCIONES_MAX);
}

// Si ya hay una con ese nombre, es que le has cambiado el precio: la sustituyo.
function ponerSuscripcion(lista, nueva) {
  const actuales = leerSuscripciones(lista);
  const buena = crearSuscripcion(nueva ?? {});
  if (!buena) return actuales;
  const clave = normalizar(buena.nombre);
  const igual = actuales.findIndex((s) => normalizar(s.nombre) === clave);
  if (igual >= 0) return actuales.map((s, i) => (i === igual ? { ...buena, id: s.id } : s));
  if (actuales.length >= SUSCRIPCIONES_MAX) return actuales;
  return [...actuales, buena];
}

const quitarSuscripcion = (lista, id) => leerSuscripciones(lista).filter((s) => s.id !== id);

// Tu divisa, la de casa: la de tus gastos de viaje, que es en la que cuentas. Sin
// viajes, la de tu idioma ("es-ES" → EUR), y si no, la de abajo del par.
function tuDivisa({ viajes = [], idiomas = [], par = null, elegida = null } = {}) {
  // La que dijiste en la bienvenida manda: lo demás es adivinar.
  if (isValidCode(elegida)) return elegida;
  const veces = new Map();
  for (const g of viajes.flatMap((v) => v.gastos ?? [])) veces.set(g.to, (veces.get(g.to) ?? 0) + 1);
  const deGastos = [...veces].sort((a, b) => b[1] - a[1])[0]?.[0];
  if (isValidCode(deGastos)) return deGastos;
  const deIdioma = idiomas.map(divisaDeIdioma).find(Boolean);
  return deIdioma ?? (isValidCode(par?.to) ? par.to : "EUR");
}

const leerDivisaCasa = (valor) => (isValidCode(valor) ? valor : null);

// La bienvenida solo al instalar. Al actualizar no, que sería salirte una
// pestaña cada vez que saco una versión.
const tocaBienvenida = (motivo) => motivo === "install";

// Si tu divisa ya está en el par de siempre no lo toco. Si no, la pongo abajo,
// que es a lo que conviertes, y arriba la que más se cruza con ella.
function parDeBienvenida(casa, par) {
  if (!isValidCode(casa) || par?.from === casa || par?.to === casa) return null;
  return { from: casa === "USD" || CERCA_DEL_EURO.includes(casa) ? "EUR" : "USD", to: casa };
}

// Lo nuevo de cada versión, la última arriba. Al sacar una, se añade aquí y se
// sube el número del manifest; los textos van en textos.js.
const NOVEDADES = [
  { version: "1.1.0", claves: ["novedades.bienvenida", "novedades.tema", "novedades.cobro", "novedades.qrCobro", "novedades.jetlag", "novedades.precioProducto", "novedades.tarjeta", "novedades.medidas"] },
];

const esVersion = (v) => typeof v === "string" && /^\d+(\.\d+){0,3}$/.test(v);

// Número a número: como texto, la "1.10.0" quedaría por detrás de la "1.9.0".
function compararVersiones(a, b) {
  const [x, y] = [a, b].map((v) => v.split(".").map(Number));
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const resta = (x[i] ?? 0) - (y[i] ?? 0);
    if (resta) return Math.sign(resta);
  }
  return 0;
}

function novedadesDesde(vista, actual) {
  if (!esVersion(vista) || !esVersion(actual)) return [];
  return NOVEDADES
    .filter((n) => compararVersiones(n.version, vista) > 0 && compararVersiones(n.version, actual) <= 0)
    .sort((a, b) => compararVersiones(b.version, a.version));
}

// Qué versión doy por vista al instalar o actualizar. Recién instalada, la de
// ahora: todo es nuevo y para eso está la bienvenida. Devuelve null si ya lo sé.
function versionVistaAlInstalar({ reason, previousVersion } = {}, guardada, actual) {
  if (esVersion(guardada)) return null;
  if (reason === "install") return actual;
  if (reason === "update") return esVersion(previousVersion) ? previousVersion : actual;
  return null;
}

// Chrome deja la tecla vacía si otra extensión ya la tenía cogida.
function atajosDeBienvenida(comandos) {
  const tecla = (nombre) => (Array.isArray(comandos) ? comandos : []).find((c) => c?.name === nombre)?.shortcut || "";
  return { abrir: tecla("_execute_action"), seleccion: tecla("convertir-seleccion") };
}

// Las zonas horarias que pone el sistema al aterrizar, con su país. Las de
// siempre de cada sitio; si la tuya no está, no aviso y ya.
const PAIS_DE_ZONA = Object.fromEntries(Object.entries({
  ES: "Europe/Madrid Atlantic/Canary Africa/Ceuta", PT: "Europe/Lisbon Atlantic/Madeira Atlantic/Azores",
  FR: "Europe/Paris", DE: "Europe/Berlin Europe/Busingen", IT: "Europe/Rome", NL: "Europe/Amsterdam", BE: "Europe/Brussels",
  AT: "Europe/Vienna", IE: "Europe/Dublin", FI: "Europe/Helsinki", GR: "Europe/Athens", LU: "Europe/Luxembourg",
  MT: "Europe/Malta", CY: "Asia/Nicosia Asia/Famagusta Europe/Nicosia", SI: "Europe/Ljubljana", SK: "Europe/Bratislava",
  EE: "Europe/Tallinn", LV: "Europe/Riga", LT: "Europe/Vilnius", HR: "Europe/Zagreb", BG: "Europe/Sofia",
  MC: "Europe/Monaco", AD: "Europe/Andorra", ME: "Europe/Podgorica", VA: "Europe/Vatican", SM: "Europe/San_Marino",
  GB: "Europe/London Europe/Belfast", CH: "Europe/Zurich", LI: "Europe/Vaduz", SE: "Europe/Stockholm", NO: "Europe/Oslo",
  DK: "Europe/Copenhagen", PL: "Europe/Warsaw", CZ: "Europe/Prague", HU: "Europe/Budapest", RO: "Europe/Bucharest",
  TR: "Europe/Istanbul Asia/Istanbul", IS: "Atlantic/Reykjavik", RS: "Europe/Belgrade", GE: "Asia/Tbilisi",
  US: "America/New_York America/Chicago America/Denver America/Los_Angeles America/Phoenix America/Anchorage "
    + "Pacific/Honolulu America/Detroit America/Indiana/Indianapolis America/Boise America/Kentucky/Louisville",
  PR: "America/Puerto_Rico", EC: "America/Guayaquil", PA: "America/Panama", SV: "America/El_Salvador",
  CA: "America/Toronto America/Vancouver America/Edmonton America/Winnipeg America/Halifax America/St_Johns "
    + "America/Regina America/Montreal",
  MX: "America/Mexico_City America/Cancun America/Tijuana America/Monterrey America/Merida America/Mazatlan "
    + "America/Chihuahua America/Hermosillo America/Bahia_Banderas",
  BR: "America/Sao_Paulo America/Manaus America/Fortaleza America/Recife America/Bahia America/Belem America/Cuiaba America/Noronha",
  AR: "America/Argentina/Buenos_Aires America/Buenos_Aires America/Argentina/Cordoba America/Argentina/Mendoza "
    + "America/Argentina/Ushuaia America/Argentina/Salta",
  CL: "America/Santiago Pacific/Easter", PE: "America/Lima", CO: "America/Bogota", UY: "America/Montevideo",
  CR: "America/Costa_Rica", DO: "America/Santo_Domingo", BO: "America/La_Paz", GT: "America/Guatemala", PY: "America/Asuncion",
  JP: "Asia/Tokyo", CN: "Asia/Shanghai Asia/Urumqi Asia/Chongqing", HK: "Asia/Hong_Kong", TW: "Asia/Taipei", KR: "Asia/Seoul",
  SG: "Asia/Singapore", MY: "Asia/Kuala_Lumpur Asia/Kuching", TH: "Asia/Bangkok", VN: "Asia/Ho_Chi_Minh Asia/Saigon",
  KH: "Asia/Phnom_Penh", ID: "Asia/Jakarta Asia/Makassar Asia/Jayapura Asia/Pontianak", PH: "Asia/Manila",
  IN: "Asia/Kolkata Asia/Calcutta", LK: "Asia/Colombo", NP: "Asia/Kathmandu Asia/Katmandu",
  IL: "Asia/Jerusalem Asia/Tel_Aviv", JO: "Asia/Amman", AE: "Asia/Dubai", QA: "Asia/Qatar", SA: "Asia/Riyadh",
  AU: "Australia/Sydney Australia/Melbourne Australia/Brisbane Australia/Perth Australia/Adelaide Australia/Hobart Australia/Darwin",
  NZ: "Pacific/Auckland Pacific/Chatham", ZA: "Africa/Johannesburg", MA: "Africa/Casablanca", EG: "Africa/Cairo",
  TN: "Africa/Tunis", KE: "Africa/Nairobi",
}).flatMap(([pais, zonas]) => zonas.split(" ").map((zona) => [zona, pais])));

// Las de fuera del BCE, que no están en DIVISA_DE_REGION.
const DIVISA_DE_MERCADO = {
  VN: "VND", AR: "ARS", MA: "MAD", PE: "PEN", CO: "COP", CL: "CLP", EG: "EGP", AE: "AED", TW: "TWD", UY: "UYU",
  CR: "CRC", DO: "DOP", TN: "TND", KE: "KES", LK: "LKR", NP: "NPR", KH: "KHR", JO: "JOD", QA: "QAR", SA: "SAR",
  GE: "GEL", RS: "RSD", BO: "BOB", GT: "GTQ", PY: "PYG",
};

function paisDeZona(zona) {
  const region = PAIS_DE_ZONA[zona];
  const divisa = region && (DIVISA_DE_REGION[region] ?? DIVISA_DE_MERCADO[region]);
  return divisa && isValidCode(divisa) ? { region, divisa } : null;
}

// Si el sistema ha cambiado de zona y la de ahora es de otra divisa, propongo
// el par de allí a la tuya. Una vez por cambio: si no le haces caso, no insiste.
// Volviendo a casa, o con el par ya puesto, no hay nada que decir.
function cambioDePais({ zona, antes, par, casa }) {
  if (!zona || zona === antes) return null;
  const ahora = paisDeZona(zona);
  const previo = paisDeZona(antes);
  if (!antes || !ahora || previo?.divisa === ahora.divisa || ahora.divisa === casa) return { guardar: zona, aviso: null };
  if (par?.from === ahora.divisa && par?.to === casa) return { guardar: zona, aviso: null };
  return { guardar: zona, aviso: { region: ahora.region, from: ahora.divisa, to: casa } };
}

function mensajeCambioDePais({ region, from, to }) {
  return {
    titulo: tr("pais.titulo", { pais: nombrePais(region), bandera: banderaDe(`x-${region}`) }),
    cuerpo: tr("pais.cuerpo", { from, to }),
  };
}

// tasas[tu divisa][la suya]: lo que vale hoy 1 de la suya en la tuya. Sin
// tasa, sale sin cifras.
function cuentaSuscripciones(lista, tasas = {}) {
  const filas = leerSuscripciones(lista).map((s) => {
    const tasa = tasas[s.to]?.[s.divisa];
    const meses = s.periodo === "mes" ? 1 : 12;
    if (!(tasa > 0)) return { ...s, alMes: null, alAnio: null, cambio: null, diferenciaAnio: null };
    const hoy = s.importe * tasa;
    const antes = s.importe * s.tasa;
    const cambio = hoy / antes - 1;
    return {
      ...s,
      alMes: hoy / meses,
      alAnio: (hoy * 12) / meses,
      cambio: Math.abs(cambio) < SUSCRIPCION_IGUAL ? 0 : cambio,
      // Lo que pagas de más (o de menos) al año contra lo que pagabas al darte de alta.
      diferenciaAnio: ((hoy - antes) * 12) / meses,
    };
  }).sort((a, b) => (b.alMes ?? -1) - (a.alMes ?? -1));
  // Los totales por tu divisa: si cambiaste de casa, no se mezclan.
  const totales = new Map();
  for (const f of filas) {
    if (f.alMes === null) continue;
    const t = totales.get(f.to) ?? { to: f.to, alMes: 0, alAnio: 0, diferenciaAnio: 0, n: 0 };
    totales.set(f.to, { ...t, alMes: t.alMes + f.alMes, alAnio: t.alAnio + f.alAnio, diferenciaAnio: t.diferenciaAnio + f.diferenciaAnio, n: t.n + 1 });
  }
  return { filas, totales: [...totales.values()].sort((a, b) => b.n - a.n) };
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

// La foto del tique, a lo justo para leerla: una del móvil pesa 4 MB y con
// 1600 px por el lado largo el total y el CIF se siguen leyendo.
const FOTO_LADO = 1600;

function medidasFoto(ancho, alto, lado = FOTO_LADO) {
  if (!(ancho > 0) || !(alto > 0)) return null;
  const escala = Math.min(1, lado / Math.max(ancho, alto));
  return { ancho: Math.round(ancho * escala), alto: Math.round(alto * escala) };
}

// Las fotos cuyo gasto ya no está en ningún viaje, ni archivado ni de empresa.
// Lo que está esperando a que se pueda deshacer aún cuenta como suyo.
function fotosSinGasto(claves, viajes, esperando = []) {
  const vivos = new Set(esperando);
  for (const v of [...(viajes?.lista ?? []), ...(viajes?.archivados ?? [])]) {
    for (const g of [...(v.gastos ?? []), ...(v.empresa ?? [])]) vivos.add(g.id);
  }
  return claves.filter((id) => !vivos.has(id));
}

// Cada siete días de viaje, la semana en un aviso. El último día no, que para
// eso está el resumen del viaje entero. Sin fechas no sé qué día del viaje es.
const SEMANA = 7;

function semanaDelViaje(viaje, hoyIso = hoy()) {
  const d = diaDelViaje(viaje?.presupuesto, viaje?.gastos ?? [], hoyIso);
  if (!d || d.dia % SEMANA !== 0 || d.dia >= d.total) return null;
  const { to } = viaje.presupuesto;
  const [y, m, dd] = hoyIso.split("-").map(Number);
  const desde = (n) => isoLocal(new Date(y, m - 1, dd - n));
  const entre = (a, b) => delDiaADia(viaje.gastos).filter((g) => {
    const dia = isoLocal(new Date(g.cuando));
    return g.to === to && dia >= a && dia <= b;
  });
  const estas = entre(desde(SEMANA - 1), hoyIso);
  const total = estas.reduce((s, g) => s + g.valor, 0);
  if (!(total > 0)) return null;
  const [mas] = desglose(estas);
  const semana = d.dia / SEMANA;
  const antes = semana > 1 ? entre(desde(2 * SEMANA - 1), desde(SEMANA)).reduce((s, g) => s + g.valor, 0) : 0;
  return {
    semana, total, to, porDia: total / SEMANA,
    categoria: mas.categoria, fraccion: mas.fraccion,
    ...(antes > 0 ? { cambio: total / antes - 1 } : {}),
  };
}

// Una vez por viaje y semana, a la hora del recordatorio, que es cuando ya has cenado.
function tocaSemana(viajes, avisadas = [], ahora = new Date(), hora = RECORDATORIO_HORA) {
  if (ahora.getHours() < leerHoraRecordatorio(hora)) return null;
  const hoyIso = isoLocal(ahora);
  for (const viaje of viajes?.lista ?? []) {
    const resumen = semanaDelViaje(viaje, hoyIso);
    if (resumen && !avisadas.includes(`${viaje.id}:${resumen.semana}`)) return { viaje, resumen };
  }
  return null;
}

// Por debajo de un 5 % arriba o abajo es ir igual: un café más o menos.
const SEMANA_IGUAL = 0.05;

function mensajeSemana(viaje, r) {
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pct = (f) => tr("pct", { n: Math.round(Math.abs(f) * 100) });
  const lineas = [
    tr("semanaViaje.total", { total: `${dinero.format(r.total)} ${r.to}`, dia: dinero.format(r.porDia) }),
    tr("semanaViaje.mas", { categoria: `${emojiCategoria(r.categoria)} ${nombreCategoria(r.categoria)}`, pct: pct(r.fraccion) }),
  ];
  if (r.cambio !== undefined) {
    lineas.push(Math.abs(r.cambio) < SEMANA_IGUAL ? tr("semanaViaje.igual")
      : tr(r.cambio > 0 ? "semanaViaje.subes" : "semanaViaje.bajas", { pct: pct(r.cambio) }));
  }
  return {
    titulo: tr("semanaViaje.titulo", { viaje: viaje.nombre || tr("semanaViaje.viaje"), n: r.semana }),
    cuerpo: lineas.join("\n"),
  };
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
  Digit7: "vista:suscripciones",
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

// El buscador de funciones (Ctrl+K): con todo lo que hay en el popup, escribir
// "tax free" es más rápido que acordarse de dónde estaba. Las de los atajos
// tienen ya su texto en la ayuda; las claves son lo que alguien escribiría
// buscándolas y no sale en el nombre, en los dos idiomas.
const FUNCIONES = [
  { accion: "gastos", claves: "viaje apuntar cartera tax free devolucion iva expenses trip wallet refund" },
  { accion: "apuntar", claves: "gasto añadir nuevo add expense log" },
  { accion: "buscar", claves: "lupa encontrar find search filter" },
  { accion: "viajes", claves: "viaje lista elegir cambiar trips switch" },
  { accion: "nuevoViaje", claves: "crear empezar viaje new trip start" },
  { accion: "presupuesto", claves: "presupuesto limite tope dinero budget limit" },
  { accion: "tramos", claves: "ciudades etapas paradas ciudad cities legs stops" },
  { accion: "cajero", claves: "efectivo cajero billetes sacar atm cash withdraw" },
  { accion: "pendientes", claves: "pendiente por pagar hotel reserva pending unpaid" },
  { accion: "empresa", claves: "trabajo empresa nota de gastos business work reimburse" },
  { accion: "gente", claves: "quien pago deudas cuentas amigos grupo who paid debts split group" },
  { accion: "curva", claves: "grafico ritmo dia a dia evolucion pace chart" },
  { accion: "horas", claves: "hora franja noche mañana time of day night" },
  { accion: "indiceCafe", claves: "cafe precios comparar mismo coffee prices compare" },
  { accion: "archivados", claves: "archivo viejos acabados archive old" },
  { accion: "tarjetaViaje", claves: "imagen foto compartir postal image share card" },
  { accion: "anio", claves: "año resumen anual wrapped year annual" },
  { accion: "calendario", claves: "calendario ics google agenda fechas recordatorio calendar dates reminder" },
  { accion: "compartir", claves: "whatsapp resumen mandar enviar share summary send" },
  { accion: "csv", claves: "excel hoja exportar descargar export download spreadsheet" },
  { accion: "csvViajes", claves: "excel todos exportar export all" },
  { accion: "copiarTotal", claves: "total copiar copy" },
  { accion: "copiarGasto", claves: "ultimo copiar last copy" },
  { accion: "pago", claves: "tarjeta efectivo metalico card cash" },
  { accion: "discreto", claves: "ocultar privado esconder ojo hide private eye" },
  { accion: "deshacer", claves: "recuperar volver undo restore" },
  { accion: "intercambiar", claves: "invertir girar par swap reverse" },
  { accion: "copiar", claves: "resultado copy result" },
  { accion: "copiarSimbolo", claves: "simbolo $ € copy symbol" },
  { accion: "copiarTasa", claves: "tasa cambio copy rate" },
  { accion: "girarTasa", claves: "tasa al reves inversa rate inverse" },
  { accion: "cantidadUno", claves: "uno 1 tasa rate one" },
  { accion: "origen", claves: "divisa moneda de from currency" },
  { accion: "destino", claves: "divisa moneda a to currency" },
  { accion: "fijar", claves: "chincheta guardar par favorito pin favourite favorite" },
  { accion: "historial", claves: "recientes conversiones anteriores history recent" },
  { accion: "cuenta", claves: "dividir restaurante propina cuenta split bill tip" },
  { accion: "ensenar", claves: "enseñar mostrar vendedor regatear grande pantalla show seller haggle big screen" },
  { accion: "comparar", claves: "barato caro precio balanza cheaper price compare" },
  { accion: "comision", claves: "comision banco tarjeta impuesto iva cafes horas fee bank tax" },
  { accion: "vista:evolucion", claves: "grafico historico tendencia chart trend" },
  { accion: "rango", claves: "periodo semana mes año period week month" },
  { accion: "vista:extras", claves: "otras divisas varias monedas other currencies" },
  { accion: "extras", claves: "otras divisas whatsapp other currencies" },
  { accion: "vista:avisos", claves: "alerta notificacion avisame alert notify" },
  { accion: "vista:chuleta", claves: "chuleta tabla viaje precios cheat sheet table" },
  { accion: "chuleta", claves: "chuleta whatsapp cheat sheet" },
  { accion: "imprimirChuleta", claves: "imprimir cartera print wallet" },
  { accion: "vista:fecha", claves: "historico dia fecha pasado date past" },
  { accion: "vista:timo", claves: "casa de cambio timo comision exchange office fair" },
  { accion: "vista:suscripciones", claves: "netflix spotify icloud suscripcion mensual subscription monthly" },
  { accion: "copiaSeguridad", claves: "copia backup restaurar exportar restore" },
  { accion: "bienvenida", claves: "mi divisa casa moneda idioma atajos bienvenida home currency language welcome" },
  { accion: "panel", claves: "lateral fijo abierto al lado side panel dock pin" },
  { accion: "ayuda", claves: "teclado atajos ayuda keyboard shortcuts help" },
];
const FUNCIONES_MAX = 8;

// Cada palabra de lo que escribes tiene que empezar alguna palabra del nombre o
// de las claves: "tax" encuentra "tax free" pero "ax" no, que sería ruido. Lo
// que sale en el nombre pesa más que lo de las claves, y al principio, más aún.
function buscarFunciones(consulta, funciones, max = FUNCIONES_MAX) {
  const palabras = normalizar(String(consulta ?? "")).split(/[^a-z0-9$€]+/).filter(Boolean);
  if (!palabras.length) return funciones.slice(0, max);
  const trocear = (texto) => normalizar(String(texto ?? "")).split(/[^a-z0-9$€]+/).filter(Boolean);
  return funciones
    .map((f, orden) => {
      const nombre = trocear(f.nombre);
      const claves = trocear(f.claves);
      let puntos = 0;
      for (const p of palabras) {
        const enNombre = nombre.findIndex((w) => w.startsWith(p));
        if (enNombre === 0) puntos += 4;
        else if (enNombre > 0) puntos += 3;
        else if (claves.some((w) => w.startsWith(p))) puntos += 2;
        else return null;
      }
      return { ...f, puntos, orden };
    })
    .filter(Boolean)
    .sort((a, b) => b.puntos - a.puntos || a.orden - b.orden)
    .slice(0, max)
    .map(({ puntos, orden, ...f }) => f);
}

// Escribiendo en un campo las letras son letras (la x es "por" en las
// cuentas), así que ahí hace falta Alt. Cmd y Ctrl no los toco nunca: son
// copiar, pegar y compañía.
function atajoPara({ code, key, altKey, ctrlKey, metaKey, shiftKey, enCampo }) {
  // La única excepción: Cmd+Z fuera de un campo no hace nada en el navegador, y
  // es lo primero que pulsas cuando borras algo sin querer.
  if ((ctrlKey || metaKey) && code === "KeyZ" && !enCampo && !altKey && !shiftKey) return "deshacer";
  // Ctrl+K, como en tantas apps: el buscador de funciones, también desde un campo.
  if ((ctrlKey || metaKey) && code === "KeyK" && !altKey && !shiftKey) return "funciones";
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
