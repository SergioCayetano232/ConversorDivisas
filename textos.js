// Todos los textos que se ven, en los dos idiomas. Lo carga todo el mundo antes
// que logica.js: el popup, el service worker y los tests.

const TEXTOS = {
  es: {
    "cantidad": "Cantidad",
    "cantidad.pista": "También vale una cuenta: 20+15, 3*12,50, (40+60)/4, 100-15%",
    "cantidad.invalida": "Introduce una cantidad válida",
    "de": "De",
    "a": "A",
    "buscar": "Buscar divisa",
    "buscar.nada": "Ninguna divisa",
    "intercambiar": "Intercambiar divisas",
    "intercambiar.titulo": "Intercambiar divisas ({tecla})",
    "recientes": "Pares recientes",
    "reciente.aria": "Cambiar a {de} → {a}",
    "resultado": "Resultado",
    "resultado.aria": "Cantidad convertida",
    "copiar": "Copiar",
    "copiar.aria": "Copiar el resultado",
    "copiar.titulo": "Copiar el resultado ({tecla})",
    "copiado": "Copiado",
    "copiar.fallo": "No se pudo",
    "cerrar": "Cerrar",
    "cargando": "Obteniendo tasas…",
    "reintentar": "Reintentar",
    "actualizado": "Act. {fecha}",
    "pie.tasasDe": "Tasas de",
    "atajos": "Atajos",
    "pct": "{n} %",

    "historial": "Últimas conversiones",
    "historial.cuenta": "Últimas conversiones ({n})",
    "historial.borrar": "Borrar",
    "historial.vacio": "Aún no has convertido nada. Lo que conviertas irá saliendo aquí.",
    "historial.fila": "{cantidad} {from} son {resultado} {to}, {cuando}. Copiar",
    "historial.copiado": "✓ copiado",
    "historial.fallo": "no se pudo",
    "historial.usar": "Volver a ponerla",
    "historial.usarAria": "Volver a poner {cantidad} {from} a {to}",

    "comision.titulo": "Comisión de tu banco",
    "comision.rapidas": "Comisiones habituales",
    "comision.otra": "otra",
    "comision.otraAria": "Otra comisión, en tanto por ciento",
    "comision.nota": "Se suma a lo convertido. Las tarjetas suelen cobrar entre un 1 y un 3 %.",
    "comision.anadir": "+ comisión",
    "comision.anadirAria": "Añadir la comisión de tu banco",
    "comision.anadirTitulo": "Añade lo que te cobra el banco por pagar en otra divisa",
    "comision.aria": "Con la comisión del {pct} pagarías {total}. Cambiarla",
    "comision.conTitulo": "Con la comisión de tu banco pagarías {total}",
    "comision.sin": "Sin",
    "comision.sinAria": "Sin comisión",
    "comision.incluida": "con comisión +{pct}",
    "comision.incluidaTitulo": "Las cifras de abajo ya llevan la comisión de tu banco",

    "vistas": "Qué ver debajo del resultado",
    "vista.evolucion": "Evolución de la tasa",
    "vista.extras": "Otras divisas",
    "vista.avisos": "Avisos de tasa",
    "vista.chuleta": "Chuleta de viaje",
    "vista.fecha": "Tasa de un día",

    "rangos": "Periodo del gráfico",
    "rango.7": "7D",
    "rango.7.largo": "7 días",
    "rango.30": "1M",
    "rango.30.largo": "1 mes",
    "rango.90": "3M",
    "rango.90.largo": "3 meses",
    "rango.365": "1A",
    "rango.365.largo": "1 año",
    "grafico": "Gráfico de la tasa. Con las flechas vas día a día y con Enter ves ese día.",
    "grafico.minimo": "Mínimo {valor}",
    "grafico.maximo": "Máximo {valor}",
    "media": "media",

    "momento.bueno": "Buen momento",
    "momento.normal": "Momento normal",
    "momento.malo": "Mal momento",
    "momento.enLaMedia": "en la media",
    "momento.sobre": "{pct} sobre la media",
    "momento.bajo": "{pct} bajo la media",
    "momento.explicacion": "Hoy la tasa es mejor que el {pct} de los días {periodo}. Cuanto más alta, más {to} te dan por cada {from}.",
    "momento.anio": "del último año",
    "momento.dias": "de los últimos {dias}",
    "momento.aria": "{titulo}, {detalle} de {dias} días. {explicacion}",

    "extras.anadir": "Añadir",
    "extras.elegir": "{nombre}. Pulsa para ponerla como destino",
    "extras.aria": "{nombre}: {valor}. Ponerla como destino",
    "extras.quitar": "Quitar {nombre}",
    "bandeja": "Añadir divisa",
    "bandeja.opcion": "Añadir {nombre}",

    "avisos.lista": "Tus avisos",
    "avisos.avisar": "Avisar",
    "avisos.sube": "▲ {from} sube de",
    "avisos.baja": "▼ {from} baja de",
    "avisos.llega": "{from} llega a",
    "avisos.subeDe": "sube de",
    "avisos.bajaDe": "baja de",
    "avisos.pastilla": "Aviso: {from} {sentido} {umbral} {to}. Ir a ese par",
    "avisos.quitar": "Quitar el aviso",
    "avisos.nota": "Te aviso aunque tengas el popup cerrado.",
    "avisos.escribe": "Escribe una tasa, por ejemplo {ejemplo}.",
    "avisos.lleno": "Ya tienes {max} avisos: quita alguno.",
    "avisos.igual": "Pon un valor distinto de la tasa de ahora.",
    "avisos.noSe": "Ese aviso no se puede crear.",
    "avisos.hecho": "Hecho. Te aviso aunque cierres el popup.",
    "avisos.notiTitulo": "1 {from} ya está a {tasa} {to}",
    "avisos.notiSube": "Ha subido de {umbral}, como pediste.",
    "avisos.notiBaja": "Ha bajado de {umbral}, como pediste.",

    "chuleta.aria": "{cantidad} {from} son {valor} {to}. Ponerlo como cantidad",

    "fecha.campo": "Día que quieres consultar",
    "fecha.rapidas": "Hace cuánto",
    "fecha.hace": "Hace {texto}",
    "fecha.1": "1 mes",
    "fecha.6": "6 meses",
    "fecha.12": "1 año",
    "fecha.valor": "{cantidad} {from} el {fecha}",
    "fecha.del": "del {fecha}",
    "fecha.hoy": "hoy {valor}",
    "fecha.cambio": "Lo que ha cambiado la tasa desde el {fecha}",
    "fecha.otroDia": "Ese día no hubo tasa; es la del {fecha}",

    "hace.ahora": "ahora",
    "hace.min": "hace {n} min",
    "hace.horas": "hace {n} h",
    "hace.ayer": "ayer",
    "hace.dias": "hace {n} días",

    "ayuda.titulo": "Atajos de teclado",
    "ayuda.nota": "Si estás escribiendo en un campo, con {alt} delante: {alt}S, {alt}C… (la ayuda, {alt}H).",
    "atajo.intercambiar": "Dar la vuelta al par",
    "atajo.copiar": "Copiar el resultado",
    "atajo.origen": "Elegir la divisa de origen",
    "atajo.destino": "Elegir la divisa de destino",
    "atajo.vista:evolucion": "Ver el gráfico",
    "atajo.vista:extras": "Ver otras divisas",
    "atajo.vista:avisos": "Ver los avisos",
    "atajo.vista:chuleta": "Ver la chuleta de viaje",
    "atajo.vista:fecha": "Ver la tasa de un día",
    "atajo.ayuda": "Esta ayuda",

    "idioma.puesta": "puesta por tu idioma",
    "idioma.cambiado": "Ahora en español",
    "ayuda.idioma": "El idioma se cambia con clic derecho en el icono de la barra.",
    "menu.idioma": "Idioma",
    "menu.idioma.auto": "Automático (el de Chrome)",

    "insignia.cambio": "{tasa} · {cambio} desde el día anterior",
    "menu.convertir": "Convertir «%s»",
    "menu.insignia": "Mostrar la tasa en el icono",

    "tarjeta": "Conversión de divisa",
    "tarjeta.cita": "«{texto}»",
    "tarjeta.sinDivisa": "Sin divisa en el texto: uso {from}",
    "tarjeta.nada": "No veo ninguna cantidad en lo que has seleccionado.",

    "error.tiempo": "La conexión ha tardado demasiado.",
    "error.sinRed": "Sin conexión a internet.",
    "error.servicio": "El servicio de tasas no responde.",
    "error.otro": "No se han podido obtener las tasas.",
  },

  en: {
    "cantidad": "Amount",
    "cantidad.pista": "You can also type a sum: 20+15, 3*12.50, (40+60)/4, 100-15%",
    "cantidad.invalida": "Enter a valid amount",
    "de": "From",
    "a": "To",
    "buscar": "Search currency",
    "buscar.nada": "No currency found",
    "intercambiar": "Swap currencies",
    "intercambiar.titulo": "Swap currencies ({tecla})",
    "recientes": "Recent pairs",
    "reciente.aria": "Switch to {de} → {a}",
    "resultado": "Result",
    "resultado.aria": "Converted amount",
    "copiar": "Copy",
    "copiar.aria": "Copy the result",
    "copiar.titulo": "Copy the result ({tecla})",
    "copiado": "Copied",
    "copiar.fallo": "Failed",
    "cerrar": "Close",
    "cargando": "Fetching rates…",
    "reintentar": "Retry",
    "actualizado": "Upd. {fecha}",
    "pie.tasasDe": "Rates from",
    "atajos": "Shortcuts",
    "pct": "{n}%",

    "historial": "Recent conversions",
    "historial.cuenta": "Recent conversions ({n})",
    "historial.borrar": "Clear",
    "historial.vacio": "Nothing converted yet. Your conversions will show up here.",
    "historial.fila": "{cantidad} {from} is {resultado} {to}, {cuando}. Copy",
    "historial.copiado": "✓ copied",
    "historial.fallo": "failed",
    "historial.usar": "Use it again",
    "historial.usarAria": "Use {cantidad} {from} to {to} again",

    "comision.titulo": "Your bank's fee",
    "comision.rapidas": "Common fees",
    "comision.otra": "other",
    "comision.otraAria": "Another fee, as a percentage",
    "comision.nota": "Added on top of the conversion. Cards usually charge between 1 and 3%.",
    "comision.anadir": "+ fee",
    "comision.anadirAria": "Add your bank's fee",
    "comision.anadirTitulo": "Add what your bank charges for paying in another currency",
    "comision.aria": "With the {pct} fee you'd pay {total}. Change it",
    "comision.conTitulo": "With your bank's fee you'd pay {total}",
    "comision.sin": "None",
    "comision.sinAria": "No fee",
    "comision.incluida": "incl. +{pct} fee",
    "comision.incluidaTitulo": "The figures below already include your bank's fee",

    "vistas": "What to show below the result",
    "vista.evolucion": "Rate history",
    "vista.extras": "Other currencies",
    "vista.avisos": "Rate alerts",
    "vista.chuleta": "Travel cheat sheet",
    "vista.fecha": "Rate on a given day",

    "rangos": "Chart period",
    "rango.7": "7D",
    "rango.7.largo": "7 days",
    "rango.30": "1M",
    "rango.30.largo": "1 month",
    "rango.90": "3M",
    "rango.90.largo": "3 months",
    "rango.365": "1Y",
    "rango.365.largo": "1 year",
    "grafico": "Rate chart. Use the arrow keys to move day by day and Enter to open that day.",
    "grafico.minimo": "Low {valor}",
    "grafico.maximo": "High {valor}",
    "media": "avg",

    "momento.bueno": "Good time",
    "momento.normal": "Normal time",
    "momento.malo": "Bad time",
    "momento.enLaMedia": "at the average",
    "momento.sobre": "{pct} above average",
    "momento.bajo": "{pct} below average",
    "momento.explicacion": "Today's rate beats {pct} of the days {periodo}. The higher it is, the more {to} you get for each {from}.",
    "momento.anio": "in the last year",
    "momento.dias": "in the last {dias} days",
    "momento.aria": "{titulo}, {detalle} over {dias} days. {explicacion}",

    "extras.anadir": "Add",
    "extras.elegir": "{nombre}. Click to make it the target",
    "extras.aria": "{nombre}: {valor}. Make it the target",
    "extras.quitar": "Remove {nombre}",
    "bandeja": "Add currency",
    "bandeja.opcion": "Add {nombre}",

    "avisos.lista": "Your alerts",
    "avisos.avisar": "Alert me",
    "avisos.sube": "▲ {from} rises above",
    "avisos.baja": "▼ {from} falls below",
    "avisos.llega": "{from} reaches",
    "avisos.subeDe": "rises above",
    "avisos.bajaDe": "falls below",
    "avisos.pastilla": "Alert: {from} {sentido} {umbral} {to}. Go to that pair",
    "avisos.quitar": "Remove the alert",
    "avisos.nota": "You'll be notified even with the popup closed.",
    "avisos.escribe": "Type a rate, for example {ejemplo}.",
    "avisos.lleno": "You already have {max} alerts: remove one first.",
    "avisos.igual": "Pick a value different from the current rate.",
    "avisos.noSe": "That alert can't be created.",
    "avisos.hecho": "Done. You'll be notified even if you close the popup.",
    "avisos.notiTitulo": "1 {from} is now {tasa} {to}",
    "avisos.notiSube": "It has risen above {umbral}, as you asked.",
    "avisos.notiBaja": "It has fallen below {umbral}, as you asked.",

    "chuleta.aria": "{cantidad} {from} is {valor} {to}. Use it as the amount",

    "fecha.campo": "Day to look up",
    "fecha.rapidas": "How long ago",
    "fecha.hace": "{texto} ago",
    "fecha.1": "1 mo",
    "fecha.6": "6 mo",
    "fecha.12": "1 yr",
    "fecha.valor": "{cantidad} {from} on {fecha}",
    "fecha.del": "from {fecha}",
    "fecha.hoy": "today {valor}",
    "fecha.cambio": "How much the rate has changed since {fecha}",
    "fecha.otroDia": "No rate that day; this is the one from {fecha}",

    "hace.ahora": "just now",
    "hace.min": "{n} min ago",
    "hace.horas": "{n} h ago",
    "hace.ayer": "yesterday",
    "hace.dias": "{n} days ago",

    "ayuda.titulo": "Keyboard shortcuts",
    "ayuda.nota": "While typing in a field, add {alt} first: {alt}S, {alt}C… (help is {alt}H).",
    "atajo.intercambiar": "Swap the pair",
    "atajo.copiar": "Copy the result",
    "atajo.origen": "Choose the source currency",
    "atajo.destino": "Choose the target currency",
    "atajo.vista:evolucion": "Show the chart",
    "atajo.vista:extras": "Show other currencies",
    "atajo.vista:avisos": "Show the alerts",
    "atajo.vista:chuleta": "Show the travel cheat sheet",
    "atajo.vista:fecha": "Show the rate on a given day",
    "atajo.ayuda": "This help",

    "idioma.puesta": "set from your language",
    "idioma.cambiado": "Now in English",
    "ayuda.idioma": "Change the language by right-clicking the toolbar icon.",
    "menu.idioma": "Language",
    "menu.idioma.auto": "Automatic (Chrome's)",

    "insignia.cambio": "{tasa} · {cambio} since the previous day",
    "menu.convertir": "Convert “%s”",
    "menu.insignia": "Show the rate on the icon",

    "tarjeta": "Currency conversion",
    "tarjeta.cita": "“{texto}”",
    "tarjeta.sinDivisa": "No currency in the text: using {from}",
    "tarjeta.nada": "I can't find an amount in what you selected.",

    "error.tiempo": "The connection took too long.",
    "error.sinRed": "No internet connection.",
    "error.servicio": "The rates service isn't responding.",
    "error.otro": "Couldn't get the rates.",
  },
};

const LOCALES = { es: "es-ES", en: "en-US" };

let idioma = "es";
let formatos = new Map();

// Español para cualquier variante (es-MX, es-419…); para el resto, inglés, que
// es lo que más gente va a entender.
function idiomaPara(etiqueta) {
  return /^es\b/i.test(String(etiqueta ?? "")) ? "es" : "en";
}

// Los nombres de cada idioma van en su propio idioma: si alguien lo ha puesto
// sin querer en uno que no entiende, tiene que poder encontrar el suyo.
const NOMBRES_IDIOMA = { es: "Español", en: "English" };

// Lo que hayas elegido en el menú manda; "auto" o nada, el de Chrome.
function idiomaElegido(guardado, etiquetaChrome) {
  return TEXTOS[guardado] ? guardado : idiomaPara(etiquetaChrome);
}

function ponerIdioma(nuevo) {
  idioma = TEXTOS[nuevo] ? nuevo : "es";
  formatos = new Map();
}

const idiomaActual = () => idioma;
const localeActual = () => LOCALES[idioma];

// Si a una traducción le faltara algo, mejor el español que la clave pelada.
function tr(clave, datos = {}) {
  const texto = TEXTOS[idioma][clave] ?? TEXTOS.es[clave] ?? clave;
  return texto.replace(/\{(\w+)\}/g, (entero, nombre) => (nombre in datos ? String(datos[nombre]) : entero));
}

// Los Intl cuestan de crear y se usan en cada tecla: uno por idioma y opciones.
function formato(Tipo, opciones) {
  const clave = `${Tipo.name}:${JSON.stringify(opciones)}`;
  if (!formatos.has(clave)) formatos.set(clave, new Tipo(localeActual(), opciones));
  return formatos.get(clave);
}

// El español de Intl deja "1650" sin punto y "16.500" con él; en una misma
// pantalla parecía un fallo, así que agrupo siempre.
const numeros = (opciones) => formato(Intl.NumberFormat, { useGrouping: "always", ...opciones });
const fechas = (opciones) => formato(Intl.DateTimeFormat, opciones);
const separadorDecimal = () => (idioma === "en" ? "." : ",");

if (typeof module !== "undefined") {
  module.exports = {
    TEXTOS, LOCALES, NOMBRES_IDIOMA, idiomaPara, idiomaElegido, ponerIdioma, idiomaActual, localeActual, tr, numeros, fechas, separadorDecimal,
  };
}
