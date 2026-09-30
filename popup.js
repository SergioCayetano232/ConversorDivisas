// El de Chrome de entrada; init() lo cambia por el que hayas elegido en el menú
// del icono antes de pintar nada.
const idiomaDeChrome = chrome.i18n?.getUILanguage?.() ?? navigator.language;
ponerIdioma(idiomaPara(idiomaDeChrome));

const API = "https://api.frankfurter.dev/v1/latest";
const API_HISTORY = "https://api.frankfurter.dev/v1";


const el = {
  form: document.getElementById("converter-form"),
  amount: document.getElementById("amount"),
  calculo: document.getElementById("calculo"),
  from: document.getElementById("from"),
  to: document.getElementById("to"),
  swap: document.getElementById("swap"),
  result: document.getElementById("result"),
  resultCode: document.getElementById("result-code"),
  copiar: document.getElementById("copiar"),
  copiarTexto: document.getElementById("copiar-texto"),
  resultBox: document.querySelector(".result"),
  resultMeta: document.getElementById("result-meta"),
  rateLine: document.getElementById("rate-line"),
  amountError: document.getElementById("amount-error"),
  updated: document.getElementById("updated"),
  status: document.getElementById("status"),
  error: document.getElementById("error"),
  errorMessage: document.getElementById("error-message"),
  retry: document.getElementById("retry"),
  trend: document.getElementById("trend"),
  trendControles: document.getElementById("trend-controles"),
  vistas: document.getElementById("vistas"),
  botonesVista: document.querySelectorAll(".vista"),
  extras: document.getElementById("extras"),
  rejilla: document.getElementById("extras-rejilla"),
  bandeja: document.getElementById("bandeja"),
  bandejaOpciones: document.getElementById("bandeja-opciones"),
  bandejaCerrar: document.getElementById("bandeja-cerrar"),
  avisos: document.getElementById("avisos"),
  avisoForm: document.getElementById("aviso-form"),
  avisoSentido: document.getElementById("aviso-sentido"),
  avisoUmbral: document.getElementById("aviso-umbral"),
  avisoCodigo: document.getElementById("aviso-codigo"),
  avisoBoton: document.getElementById("aviso-boton"),
  avisosLista: document.getElementById("avisos-lista"),
  avisoNota: document.getElementById("aviso-nota"),
  chuleta: document.getElementById("chuleta"),
  fecha: document.getElementById("fecha"),
  fechaCampo: document.getElementById("fecha-campo"),
  fechaRapidas: document.getElementById("fecha-rapidas"),
  fechaValor: document.getElementById("fecha-valor"),
  fechaTasa: document.getElementById("fecha-tasa"),
  fechaHoy: document.getElementById("fecha-hoy"),
  fechaCambio: document.getElementById("fecha-cambio"),
  abrirHistorial: document.getElementById("abrir-historial"),
  historialCuenta: document.getElementById("historial-cuenta"),
  historial: document.getElementById("historial"),
  historialLista: document.getElementById("historial-lista"),
  historialVacio: document.getElementById("historial-vacio"),
  historialBorrar: document.getElementById("historial-borrar"),
  comision: document.getElementById("comision"),
  panelComision: document.getElementById("panel-comision"),
  comisionPct: document.getElementById("comision-pct"),
  comisionTotal: document.getElementById("comision-total"),
  burbuja: document.getElementById("comision-burbuja"),
  comisionRapidas: document.getElementById("comision-rapidas"),
  comisionCampo: document.getElementById("comision-campo"),
  chuletaTabla: document.getElementById("chuleta-tabla"),
  campana: document.getElementById("vista-avisos"),
  abrirAyuda: document.getElementById("abrir-ayuda"),
  ayuda: document.getElementById("ayuda"),
  ayudaCerrar: document.getElementById("ayuda-cerrar"),
  ayudaLista: document.getElementById("ayuda-lista"),
  ayudaNota: document.getElementById("ayuda-nota"),
  teclaFlash: document.getElementById("tecla-flash"),
  trendChange: document.getElementById("trend-change"),
  rangos: document.querySelectorAll(".rango"),
  grupoRangos: document.getElementById("rangos"),
  trendLine: document.getElementById("trend-line"),
  trendArea: document.getElementById("trend-area"),
  recientes: document.getElementById("recientes"),
  lienzo: document.getElementById("trend-lienzo"),
  marcaMax: document.getElementById("marca-max"),
  marcaMin: document.getElementById("marca-min"),
  guia: document.getElementById("trend-guia"),
  punto: document.getElementById("trend-punto"),
  tip: document.getElementById("trend-tip"),
  tipFecha: document.getElementById("tip-fecha"),
  tipValor: document.getElementById("tip-valor"),
  pie: document.getElementById("trend-pie"),
  pieMin: document.getElementById("pie-min"),
  pieMax: document.getElementById("pie-max"),
  momento: document.getElementById("momento"),
  momentoTitulo: document.getElementById("momento-titulo"),
  momentoDetalle: document.getElementById("momento-detalle"),
  lineaMedia: document.getElementById("trend-media"),
  textoMedia: document.getElementById("media-texto"),
};

let rate = null;
let rateDate = null;
// Que campo manda. Si escribes en el de abajo hay que convertir al reves, y
// sobre todo no le puedo reescribir lo que esta tecleando.
let ladoActivo = "amount";
let dias = RANGO_POR_DEFECTO;
let requestId = 0;
let trendId = 0;
let recientes = [];
// Lo que está dibujado ahora, para que el tooltip no tenga que recalcularlo.
let serie = [];
let coords = [];
let mirando = null;
let hayGrafico = false;
let vista = "evolucion";
let extras = [];
// Las tasas de la divisa de origen a todas las demás, y de qué origen son: si
// cambias el origen, las viejas no valen ni un segundo.
let tasasBase = null;
let extrasId = 0;
let avisos = [];
// De qué par es lo que hay en el campo del aviso: al cambiar de par le pongo
// la tasa nueva, pero mientras sea el mismo no le toco lo que hayas escrito.
let parDelUmbral = null;
let comision = 0;
let historial = [];
// Abrir el popup y verlo con su 1 de siempre no es convertir nada: solo apunto
// cuando has tocado algo tú.
let tocado = false;
let apunteId = null;
let fecha = null;
// La tasa del día que miras y de qué par y fecha es, para no pintar la de otro.
let tasaDelDia = null;
let fechaId = 0;

// Se piden en el momento a numeros(), que los guarda por idioma: así da igual
// que el idioma elegido llegue después de cargar el archivo. Y todos agrupan
// siempre los miles, que es lo que pone numeros() por defecto.
const formatoNumero = (opciones) => ({ format: (n) => numeros(opciones).format(n) });

const nf = formatoNumero({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nfRate = formatoNumero({ minimumFractionDigits: 4, maximumFractionDigits: 4 });
const nfEntero = formatoNumero({ maximumFractionDigits: 0 });
const nfComision = formatoNumero({ maximumFractionDigits: 2 });
const nfPercent = formatoNumero({
  style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "exceptZero",
});


const STORAGE_KEY = "lastPair";
const RANGO_KEY = "rangoGrafico";
const RECIENTES_KEY = "paresRecientes";
const EXTRAS_KEY = "divisasExtra";
const VISTA_KEY = "vistaPanel";
const AVISOS_KEY = "avisos";
const COMISION_KEY = "comisionBanco";
const FECHA_KEY = "fechaConsulta";
const HISTORIAL_KEY = "historialConversiones";
// Lo que tardo en dar por buena una cantidad: mientras escribes "1", "12",
// "125" no quiero tres entradas, solo la última.
const PAUSA_APUNTE = 2000;
const CACHE_KEY = "rateCache";
const CACHE_MAX = 40;


async function loadPair() {
  try {
    const stored = await chrome.storage.local.get(STORAGE_KEY);
    const pair = stored[STORAGE_KEY];
    if (pair && isValidCode(pair.from) && isValidCode(pair.to)) {
      return pair;
    }
  } catch (error) {
    console.warn("No se pudo leer el almacenamiento", error);
  }
  // La primera vez no hay nada guardado: tiro por el idioma del navegador, que
  // a alguien de México EUR → USD no le sirve de mucho.
  return parPorIdioma(navigator.languages);
}

async function savePair(from, to) {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: { from, to } });
  } catch (error) {
    console.warn("No se pudo guardar el almacenamiento", error);
  }
}

// Lo deja el menú de «Convertir» cuando no puede poner la tarjeta en la página.
// Lo borro al leerlo, que si no cada vez que abres el popup volvería a salir.
async function tomarPendiente() {
  try {
    const { pendiente } = await chrome.storage.session.get("pendiente");
    if (!pendiente) return null;
    await chrome.storage.session.remove("pendiente");
    if (isValidCode(pendiente.from) && isValidCode(pendiente.to) && typeof pendiente.cantidad === "number") {
      return pendiente;
    }
  } catch (error) {
    console.warn("No se pudo leer la conversión pendiente", error);
  }
  return null;
}

async function cargarExtras() {
  try {
    const guardado = await chrome.storage.local.get(EXTRAS_KEY);
    return leerExtras(guardado[EXTRAS_KEY]);
  } catch (error) {
    console.warn("No se pudieron leer las divisas extra", error);
    return leerExtras(undefined);
  }
}

async function guardarExtras() {
  try {
    await chrome.storage.local.set({ [EXTRAS_KEY]: extras });
  } catch (error) {
    console.warn("No se pudieron guardar las divisas extra", error);
  }
}

async function cargarAvisos() {
  try {
    const guardado = await chrome.storage.local.get(AVISOS_KEY);
    return leerAvisos(guardado[AVISOS_KEY]);
  } catch (error) {
    console.warn("No se pudieron leer los avisos", error);
    return [];
  }
}

async function cargarComision() {
  try {
    const guardado = await chrome.storage.local.get(COMISION_KEY);
    return leerComision(guardado[COMISION_KEY]);
  } catch (error) {
    console.warn("No se pudo leer la comisión", error);
    return 0;
  }
}

async function cargarFecha() {
  try {
    const guardado = await chrome.storage.local.get(FECHA_KEY);
    return leerFecha(guardado[FECHA_KEY]);
  } catch (error) {
    console.warn("No se pudo leer la fecha", error);
    return leerFecha(undefined);
  }
}

async function cargarHistorial() {
  try {
    const guardado = await chrome.storage.local.get(HISTORIAL_KEY);
    return leerHistorial(guardado[HISTORIAL_KEY]);
  } catch (error) {
    console.warn("No se pudo leer el historial", error);
    return [];
  }
}

async function cargarVista() {
  try {
    const guardado = await chrome.storage.local.get(VISTA_KEY);
    if (VISTAS.includes(guardado[VISTA_KEY])) return guardado[VISTA_KEY];
  } catch (error) {
    console.warn("No se pudo leer la pestaña", error);
  }
  return "evolucion";
}

async function cargarRecientes() {
  try {
    const guardado = await chrome.storage.local.get(RECIENTES_KEY);
    return leerRecientes(guardado[RECIENTES_KEY]);
  } catch (error) {
    console.warn("No se pudieron leer los recientes", error);
    return [];
  }
}

async function guardarRecientes() {
  try {
    await chrome.storage.local.set({ [RECIENTES_KEY]: recientes });
  } catch (error) {
    console.warn("No se pudieron guardar los recientes", error);
  }
}

// Guardo todo en una sola clave: son cuatro pares y chrome.storage cobra por
// escritura, no por tamaño.
async function loadCache() {
  try {
    const stored = await chrome.storage.local.get(CACHE_KEY);
    return stored[CACHE_KEY] ?? {};
  } catch (error) {
    console.warn("No se pudo leer la caché", error);
    return {};
  }
}

// Recibe solo lo nuevo y lo fusiona con lo que haya. La tasa y el histórico se
// guardan casi a la vez, y si cada uno escribiera su copia entera el segundo
// borraría lo del primero. Y en cola: fusionar no basta si dos leen a la vez
// antes de que ninguno haya escrito.
let colaCache = Promise.resolve();

function saveCache(nuevas) {
  colaCache = colaCache.then(() => guardarEnCache(nuevas));
  return colaCache;
}

async function guardarEnCache(nuevas) {
  try {
    const actual = await loadCache();
    const mezcla = { ...actual, ...nuevas };

    // Si alguien va probando divisas esto crece sin parar, así que me quedo con
    // las últimas y tiro el resto.
    const entries = Object.entries(mezcla)
      .sort((a, b) => (b[1].saved ?? 0) - (a[1].saved ?? 0))
      .slice(0, CACHE_MAX);
    await chrome.storage.local.set({ [CACHE_KEY]: Object.fromEntries(entries) });
  } catch (error) {
    console.warn("No se pudo guardar la caché", error);
  }
}

// Cada desplegable guarda aqui su divisa. Le pongo un .value al boton para que
// el resto del codigo lo lea igual que cuando esto era un <select>.
const buscadores = {};

function crearBuscador(lado) {
  const boton = document.getElementById(lado);
  const panel = document.getElementById(`${lado}-panel`);
  const filtro = document.getElementById(`${lado}-filtro`);
  const lista = document.getElementById(`${lado}-lista`);

  let abierto = false;
  let marcado = 0;
  let visibles = CURRENCIES;

  function pintar() {
    visibles = filtrarDivisas(filtro.value);
    if (marcado >= visibles.length) marcado = Math.max(visibles.length - 1, 0);

    lista.replaceChildren();
    if (visibles.length === 0) {
      const vacio = document.createElement("li");
      vacio.className = "buscador__vacio";
      vacio.textContent = tr("buscar.nada");
      lista.appendChild(vacio);
      return;
    }

    const trozo = document.createDocumentFragment();
    visibles.forEach((divisa, i) => {
      const fila = document.createElement("li");
      fila.className = "buscador__opcion";
      fila.setAttribute("role", "option");
      fila.setAttribute("aria-selected", String(divisa.code === boton.value));
      fila.dataset.code = divisa.code;
      if (i === marcado) fila.classList.add("is-marcada");
      if (divisa.code === boton.value) fila.classList.add("is-elegida");

      const cod = document.createElement("span");
      cod.className = "buscador__codigo";
      cod.textContent = divisa.code;
      const nom = document.createElement("span");
      nom.className = "buscador__nombre";
      nom.textContent = nombreDe(divisa.code);

      fila.append(cod, nom);
      fila.addEventListener("mousedown", (e) => {
        e.preventDefault();
        elegir(divisa.code);
      });
      trozo.appendChild(fila);
    });
    lista.appendChild(trozo);

    const activa = lista.querySelector(".is-marcada");
    if (activa) activa.scrollIntoView({ block: "nearest" });
  }

  function abrir() {
    if (abierto) return;
    abierto = true;
    panel.hidden = false;
    boton.setAttribute("aria-expanded", "true");
    filtro.value = "";
    marcado = Math.max(CURRENCIES.findIndex((c) => c.code === boton.value), 0);
    pintar();
    filtro.focus();
  }

  function cerrar() {
    if (!abierto) return;
    abierto = false;
    panel.hidden = true;
    boton.setAttribute("aria-expanded", "false");
  }

  function elegir(code) {
    const cambia = code !== boton.value;
    poner(code);
    cerrar();
    boton.focus();
    if (cambia) onCurrencyChange();
  }

  function poner(code) {
    boton.value = code;
    boton.textContent = `${code} · ${nombreDe(code)}`;
  }

  boton.addEventListener("click", () => (abierto ? cerrar() : abrir()));
  filtro.addEventListener("input", () => {
    marcado = 0;
    pintar();
  });

  filtro.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (visibles.length === 0) return;
      marcado = (marcado + (event.key === "ArrowDown" ? 1 : -1) + visibles.length) % visibles.length;
      pintar();
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (visibles[marcado]) elegir(visibles[marcado].code);
    } else if (event.key === "Escape") {
      event.preventDefault();
      cerrar();
      boton.focus();
    } else if (event.key === "Tab") {
      cerrar();
    }
  });

  // Un clic fuera lo cierra. Uso mousedown para que llegue antes de que el
  // panel pierda el foco y se cierre solo a medias.
  document.addEventListener("mousedown", (event) => {
    if (abierto && !panel.contains(event.target) && event.target !== boton) cerrar();
  });

  return { poner, cerrar };
}

function populateSelects(pair) {
  buscadores.from = crearBuscador("from");
  buscadores.to = crearBuscador("to");
  buscadores.from.poner(pair.from);
  buscadores.to.poner(pair.to);
}

const TIMEOUT_MS = 8000;

async function fetchRate(from, to) {
  const url = `${API}?base=${from}&symbols=${to}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const value = data.rates?.[to];
    if (typeof value !== "number") throw new Error("Respuesta inesperada");

    return { rate: value, date: data.date };
  } finally {
    clearTimeout(timer);
  }
}


// Sin symbols la API devuelve todas las divisas de golpe: una petición al día
// por origen sirve para todas las filas, añadas las que añadas.
async function fetchTodas(from) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API}?base=${from}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.rates || typeof data.rates !== "object") throw new Error("Respuesta inesperada");
    return data.rates;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchDia(from, to, dia) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_HISTORY}/${dia}?base=${from}&symbols=${to}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const value = data.rates?.[to];
    if (typeof value !== "number") throw new Error("Respuesta inesperada");
    return { rate: value, date: data.date };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchHistory(from, to, desde) {
  const url = `${API_HISTORY}/${startDateFor(desde)}..?base=${from}&symbols=${to}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    // La API devuelve un objeto por fecha; el BCE no publica fines de semana
    // ni festivos, así que el número de puntos varía entre peticiones.
    return Object.keys(data.rates ?? {})
      .sort()
      .map((fecha) => ({ fecha, valor: data.rates[fecha]?.[to] }))
      .filter((p) => typeof p.valor === "number");
  } finally {
    clearTimeout(timer);
  }
}


// Quitar y volver a poner la clase no basta: el navegador agrupa los dos
// cambios y la animación no se reinicia. Leer offsetWidth le obliga a mirar.
function restartAnimation(node, className) {
  if (className) node.classList.remove(className);
  node.style.animation = "none";
  void node.offsetWidth;
  node.style.animation = "";
  if (className) node.classList.add(className);
}

function hideTrend() {
  dejarDeMirar();
  serie = [];
  coords = [];
  hayGrafico = false;
  pintarVista();
  el.trendLine.setAttribute("d", "");
  el.trendArea.setAttribute("d", "");
  el.trendChange.textContent = "";
  el.trendChange.classList.remove("is-up", "is-down");
  pintarMomento(null);
}

// Las coordenadas van sobre el viewBox de 100x28; en porcentaje valen tal cual
// para colocar encima cosas en HTML.
function colocar(nodo, { x, y }) {
  nodo.style.left = `${x}%`;
  nodo.style.top = `${(y / 28) * 100}%`;
}

function mirar(i) {
  const punto = serie[i];
  colocar(el.punto, coords[i]);
  el.guia.style.left = `${coords[i].x}%`;
  el.tipFecha.textContent = fechaCorta(punto.fecha);
  el.tipValor.textContent = nfRate.format(punto.valor);

  // Centrado sobre el punto, pero pegado al borde si no cabe: en los extremos
  // se salía de la tarjeta y lo cortaba el overflow.
  const ancho = el.lienzo.clientWidth;
  const tip = el.tip.offsetWidth;
  const centro = (coords[i].x / 100) * ancho;
  el.tip.style.left = `${Math.min(Math.max(centro - tip / 2, 0), ancho - tip)}px`;
  el.tip.style.top = el.punto.style.top;

  // La primera vez no quiero que venga deslizándose desde donde se quedó la
  // última: coloco, obligo a pintar y luego ya enciendo las transiciones.
  if (mirando === null) void el.lienzo.offsetWidth;
  el.lienzo.classList.add("is-mirando");
  mirando = i;
}

function dejarDeMirar() {
  el.lienzo.classList.remove("is-mirando");
  mirando = null;
}

function onPunteroGrafico(event) {
  if (serie.length < 2) return;
  const rect = el.lienzo.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const i = indiceCercano(x, serie.length);
  if (i !== mirando) mirar(i);
}

// Al pulsar un día, a la pestaña del día con esa fecha puesta. Antes, un latido
// en el punto para que se vea qué has pulsado.
function irAlDia(conTeclado) {
  const dia = mirando === null ? null : diaDelGrafico(serie, mirando);
  if (!dia) return;
  restartAnimation(el.punto, "is-pulsado");
  const ir = () => {
    // Primero la fecha y luego la pestaña: al revés pedía la tasa dos veces.
    ponerFecha(dia);
    cambiarVista("fecha");
    restartAnimation(el.fechaCampo, "is-cambiado");
    if (conTeclado) el.fechaCampo.focus();
  };
  if (sinMovimiento.matches) ir();
  else setTimeout(ir, 200);
}

function onTeclaGrafico(event) {
  if (serie.length < 2) return;
  if (event.key === "Enter") {
    event.preventDefault();
    irAlDia(true);
    return;
  }
  const ultimo = serie.length - 1;
  const actual = mirando ?? ultimo;
  const destino = {
    ArrowLeft: Math.max(actual - 1, 0),
    ArrowRight: Math.min(actual + 1, ultimo),
    Home: 0,
    End: ultimo,
  }[event.key];
  if (destino === undefined) return;
  event.preventDefault();
  mirar(destino);
}

function pintarExtremos(values) {
  const { max, min } = extremos(values);
  // Con la tasa quieta máximo y mínimo son el mismo punto, y dos marcas una
  // encima de otra solo confunden.
  const plano = values[max] === values[min];
  el.marcaMax.hidden = plano;
  el.marcaMin.hidden = plano;
  el.pie.hidden = plano;
  if (plano) return;

  colocar(el.marcaMax, coords[max]);
  colocar(el.marcaMin, coords[min]);
  el.pieMin.textContent = `${nfRate.format(values[min])} · ${fechaCorta(serie[min].fecha)}`;
  el.pieMax.textContent = `${nfRate.format(values[max])} · ${fechaCorta(serie[max].fecha)}`;
  el.pieMin.setAttribute("aria-label", tr("grafico.minimo", { valor: el.pieMin.textContent }));
  el.pieMax.setAttribute("aria-label", tr("grafico.maximo", { valor: el.pieMax.textContent }));

  restartAnimation(el.marcaMax);
  restartAnimation(el.marcaMin);
  restartAnimation(el.pie);
}

function renderTrend(puntos) {
  // Con menos de dos puntos no hay nada que dibujar ni con qué comparar.
  if (puntos.length < 2) {
    hideTrend();
    return;
  }

  dejarDeMirar();
  serie = puntos;
  const values = puntos.map((p) => p.valor);
  coords = coordenadas(values);

  const { line, area } = buildPaths(values);
  el.trendLine.setAttribute("d", line);
  el.trendArea.setAttribute("d", area);

  const first = values[0];
  const last = values[values.length - 1];
  const change = first === 0 ? 0 : (last - first) / first;

  el.trendChange.textContent = nfPercent.format(change);
  el.trendChange.classList.toggle("is-up", change > 0);
  el.trendChange.classList.toggle("is-down", change < 0);

  hayGrafico = true;
  pintarVista();
  pintarMomento(values);
  if (!el.trend.hidden) dibujarLinea();
}

// El veredicto de arriba sale del mismo periodo que el gráfico: si cambias a
// 7 días, "buen momento" pasa a ser respecto a esa semana.
function pintarMomento(values) {
  const m = values ? momento(values) : null;
  el.momento.hidden = !m;
  el.lineaMedia.style.display = m ? "" : "none";
  el.textoMedia.hidden = !m;
  if (!m) {
    delete el.momento.dataset.veredicto;
    return;
  }

  const texto = textoMomento(m, dias, el.from.value, el.to.value);
  const cambia = el.momento.dataset.veredicto !== m.veredicto;
  el.momento.dataset.veredicto = m.veredicto;
  el.momentoTitulo.textContent = texto.titulo;
  el.momentoDetalle.textContent = texto.detalle;
  el.momento.title = texto.explicacion;
  el.momento.setAttribute("aria-label", tr("momento.aria", { ...texto, dias }));
  if (cambia) restartAnimation(el.momento, "is-nuevo");

  const y = alturaEn(values)(m.media);
  el.lineaMedia.setAttribute("y1", y);
  el.lineaMedia.setAttribute("y2", y);
  el.textoMedia.style.top = `${(y / 28) * 100}%`;
  restartAnimation(el.lineaMedia);
  restartAnimation(el.textoMedia);
}

// Se mide ya visible: con el gráfico oculto el SVG tiene ancho cero. El +1 es
// para que el redondeo no deje una rendija al final. Por eso también se llama
// al volver a la pestaña del gráfico, y de paso la línea se vuelve a dibujar.
function dibujarLinea() {
  const { width, height } = el.trendLine.ownerSVGElement.getBoundingClientRect();
  el.trendLine.style.setProperty("--len", Math.ceil(largoEnPantalla(coords, width, height)) + 1);
  restartAnimation(el.trendLine);
  pintarExtremos(serie.map((p) => p.valor));
}

async function refreshTrend(from, to) {
  const currentTrend = ++trendId;

  if (from === to) {
    hideTrend();
    return;
  }

  const cache = await loadCache();
  if (currentTrend !== trendId) return;

  const key = `hist:${from}${to}:${dias}`;
  const cached = cache[key];
  // Lo guardado antes del tooltip trae values sin fechas: no me vale, lo pido
  // otra vez y se sobrescribe.
  if (isFresh(cached) && Array.isArray(cached.puntos)) {
    renderTrend(cached.puntos);
    return;
  }

  el.trend.classList.add("is-cargando");
  dejarDeMirar();

  try {
    const puntos = await fetchHistory(from, to, dias);
    if (currentTrend !== trendId) return;
    el.trend.classList.remove("is-cargando");
    renderTrend(puntos);

    saveCache({ [key]: { puntos, day: hoy(), saved: Date.now() } });
  } catch (error) {
    if (currentTrend !== trendId) return;
    // El histórico es un extra: si falla, el conversor sigue funcionando y
    // no mostramos un segundo mensaje de error.
    console.warn("No se pudo obtener el histórico", error);
    el.trend.classList.remove("is-cargando");
    hideTrend();
  }
}


function pintarVista() {
  const enEvolucion = vista === "evolucion";
  el.trend.hidden = !(enEvolucion && hayGrafico);
  el.trendControles.hidden = !(enEvolucion && hayGrafico);
  el.extras.hidden = vista !== "extras";
  el.avisos.hidden = vista !== "avisos";
  el.chuleta.hidden = vista !== "chuleta";
  el.fecha.hidden = vista !== "fecha";
  pintarAvisoComision();
  el.vistas.dataset.vista = vista;
  for (const boton of el.botonesVista) {
    const suya = boton.dataset.vista === vista;
    boton.classList.toggle("is-activa", suya);
    boton.setAttribute("aria-selected", String(suya));
    boton.tabIndex = suya ? 0 : -1;
  }
}

function cambiarVista(nueva) {
  if (nueva === vista) return;
  vista = nueva;
  cerrarBandeja();
  dejarDeMirar();
  pintarVista();
  if (vista === "evolucion" && hayGrafico) dibujarLinea();
  // Al entrar en la rejilla las casillas vuelven a llegar en cascada.
  if (vista === "extras") {
    for (const celda of el.rejilla.children) celda.classList.add("is-nueva");
    restartAnimation(el.extras);
  }
  if (vista === "avisos") {
    for (const pastilla of el.avisosLista.children) pastilla.classList.add("is-nueva");
    restartAnimation(el.avisos);
  }
  if (vista === "chuleta") {
    for (const fila of el.chuletaTabla.children) fila.classList.add("is-nueva");
  }
  if (vista === "fecha") refreshFecha();
  try {
    chrome.storage.local.set({ [VISTA_KEY]: vista });
  } catch (error) {
    console.warn("No se pudo guardar la pestaña", error);
  }
}

// El patrón de pestañas de siempre: con las flechas cambias, y el foco va con
// la pestaña elegida.
const VISTAS = ["evolucion", "extras", "avisos", "chuleta", "fecha"];

function onTeclaVistas(event) {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  const paso = event.key === "ArrowRight" ? 1 : -1;
  const nueva = VISTAS[(VISTAS.indexOf(vista) + paso + VISTAS.length) % VISTAS.length];
  cambiarVista(nueva);
  document.getElementById(`vista-${nueva}`).focus();
}

// Lo que hay arriba, lo hayas escrito tú o salga de lo que tecleas abajo.
function cantidadOrigen() {
  if (ladoActivo === "result") {
    const valor = leerImporte(el.result.value);
    return valor === null || !rate ? null : valor / rate;
  }
  return leerImporte(el.amount.value);
}

function crearCelda(code) {
  const celda = document.createElement("li");
  celda.className = "extra is-nueva";
  celda.dataset.code = code;

  const elegir = document.createElement("button");
  elegir.type = "button";
  elegir.className = "extra__elegir";
  elegir.title = tr("extras.elegir", { nombre: nombreDe(code) });
  const cod = document.createElement("span");
  cod.className = "extra__codigo";
  cod.textContent = code;
  const valor = document.createElement("span");
  valor.className = "extra__valor";
  valor.textContent = "—";
  elegir.append(cod, valor);
  elegir.addEventListener("click", () => onElegirExtra(code));

  const quitar = document.createElement("button");
  quitar.type = "button";
  quitar.className = "extra__quitar";
  quitar.setAttribute("aria-label", tr("extras.quitar", { nombre: nombreDe(code) }));
  quitar.textContent = "✕";
  quitar.addEventListener("click", () => onQuitarExtra(code));

  celda.append(elegir, quitar);
  // Igual que las pastillas: si no la quito, reordenar la haría entrar otra vez.
  celda.addEventListener("animationend", (event) => {
    if (event.target === celda) celda.classList.remove("is-nueva");
  });
  valor.addEventListener("animationend", () => valor.classList.remove("is-tic"));
  return celda;
}

function crearCeldaAnadir() {
  const celda = document.createElement("li");
  celda.className = "extra extra--anadir is-nueva";
  celda.dataset.code = "anadir";
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "extra__elegir";
  boton.setAttribute("aria-expanded", "false");
  boton.setAttribute("aria-controls", "bandeja");
  boton.innerHTML = '<span class="extra__mas" aria-hidden="true">+</span> ';
  boton.append(tr("extras.anadir"));
  boton.addEventListener("click", abrirBandeja);
  celda.append(boton);
  celda.addEventListener("animationend", (event) => {
    if (event.target === celda) celda.classList.remove("is-nueva");
  });
  return celda;
}

function pintarExtras() {
  const from = el.from.value;
  const to = el.to.value;
  const codes = extrasVisibles(extras, from, to);
  const tasas = tasasBase?.de === from ? tasasBase.rates : null;
  const filas = convertirExtras(cantidadOrigen(), tasas, codes, comision);

  const celdas = filas.map(({ code, valor }, i) => {
    const celda = el.rejilla.querySelector(`[data-code="${code}"]`) ?? crearCelda(code);
    celda.style.setProperty("--i", i);
    const texto = valor === null ? "—" : nf.format(valor);
    const cifra = celda.querySelector(".extra__valor");
    if (cifra.textContent !== texto) {
      cifra.textContent = texto;
      // El tic solo en las que ya estaban; las nuevas ya entran con su rebote.
      if (!celda.classList.contains("is-nueva") && texto !== "—") restartAnimation(cifra, "is-tic");
    }
    celda.querySelector(".extra__elegir").setAttribute(
      "aria-label",
      tr("extras.aria", { nombre: nombreDe(code), valor: texto }),
    );
    return celda;
  });

  const puedeAnadir = extras.length < EXTRAS_MAX && disponiblesParaAnadir(extras, from, to).length > 0;
  if (puedeAnadir) {
    const anadir = el.rejilla.querySelector('[data-code="anadir"]') ?? crearCeldaAnadir();
    anadir.style.setProperty("--i", celdas.length);
    celdas.push(anadir);
  }

  // Solo muevo nodos si cambia qué hay o en qué orden: sacarlos y meterlos otra
  // vez reinicia sus animaciones, y al teclear se pintaba en cada tecla.
  const antes = [...el.rejilla.children].map((c) => c.dataset.code).join();
  const ahora = celdas.map((c) => c.dataset.code).join();
  if (antes !== ahora) el.rejilla.replaceChildren(...celdas);
}

async function refreshExtras(from) {
  const actual = ++extrasId;
  const key = `todas:${from}`;

  const cache = await loadCache();
  if (actual !== extrasId) return;

  const cached = cache[key];
  if (cached?.rates) {
    tasasBase = { de: from, rates: cached.rates };
  } else if (tasasBase?.de !== from) {
    tasasBase = null;
  }
  pintarExtras();
  if (isFresh(cached)) return;

  el.extras.classList.toggle("is-cargando", !cached);
  try {
    const rates = await fetchTodas(from);
    if (actual !== extrasId) return;
    tasasBase = { de: from, rates };
    pintarExtras();
    saveCache({ [key]: { rates, day: hoy(), saved: Date.now() } });
  } catch (error) {
    // Como el gráfico, es un extra: si falla, sin segundo mensaje de error.
    if (actual === extrasId) console.warn("No se pudieron obtener las demás tasas", error);
  } finally {
    if (actual === extrasId) el.extras.classList.remove("is-cargando");
  }
}

function onElegirExtra(code) {
  buscadores.to.poner(code);
  restartAnimation(el.to, "is-cambiado");
  onCurrencyChange();
}

function onQuitarExtra(code) {
  const celda = el.rejilla.querySelector(`[data-code="${code}"]`);
  const quitar = () => {
    extras = quitarExtra(extras, code);
    guardarExtras();
    pintarExtras();
  };
  if (!celda || sinMovimiento.matches) return quitar();
  celda.classList.remove("is-nueva");
  celda.classList.add("is-saliendo");
  celda.addEventListener("animationend", quitar, { once: true });
}

function abrirBandeja() {
  const disponibles = disponiblesParaAnadir(extras, el.from.value, el.to.value);
  el.bandejaOpciones.replaceChildren(...disponibles.map((code, i) => {
    const opcion = document.createElement("button");
    opcion.type = "button";
    opcion.className = "bandeja__opcion";
    opcion.style.setProperty("--i", i);
    opcion.textContent = code;
    opcion.title = nombreDe(code);
    opcion.setAttribute("aria-label", tr("bandeja.opcion", { nombre: nombreDe(code) }));
    opcion.addEventListener("click", () => onAnadirExtra(code));
    return opcion;
  }));
  el.bandeja.hidden = false;
  el.rejilla.querySelector('[data-code="anadir"] button')?.setAttribute("aria-expanded", "true");
  el.bandejaOpciones.firstElementChild?.focus();
}

function cerrarBandeja() {
  if (el.bandeja.hidden) return;
  el.bandeja.hidden = true;
  const boton = el.rejilla.querySelector('[data-code="anadir"] button');
  boton?.setAttribute("aria-expanded", "false");
  return boton;
}

// Con la bandeja abierta, teclear "hu" salta al forinto, como en un <select>.
let tecleado = "";
let borrarTecleado = null;

function onTeclaBandeja(event) {
  if (event.key.length !== 1 || !/\p{L}/u.test(event.key) || event.metaKey || event.ctrlKey) return;
  tecleado += event.key.toUpperCase();
  clearTimeout(borrarTecleado);
  borrarTecleado = setTimeout(() => (tecleado = ""), 700);

  const opciones = [...el.bandejaOpciones.children];
  const destino = opciones.find((o) => o.textContent.startsWith(tecleado))
    ?? opciones.find((o) => normalizar(nombreDe(o.textContent)).startsWith(normalizar(tecleado)));
  if (destino) {
    destino.focus();
    destino.scrollIntoView({ block: "nearest" });
  }
}

function onAnadirExtra(code) {
  extras = anadirExtra(extras, code);
  guardarExtras();
  cerrarBandeja();
  pintarExtras();
  // La nueva cae donde estaba el botón de añadir; que el foco no se pierda.
  el.rejilla.querySelector(`[data-code="${code}"] .extra__elegir`)?.focus();
}

function crearFilaChuleta() {
  const fila = document.createElement("li");
  fila.className = "chuleta__fila is-nueva";
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "chuleta__boton";
  boton.innerHTML =
    '<span class="chuleta__cantidad"></span><span class="chuleta__flecha" aria-hidden="true">→</span><span class="chuleta__valor"></span>';
  boton.addEventListener("click", () => onElegirChuleta(Number(fila.dataset.cantidad)));
  fila.append(boton);
  fila.addEventListener("animationend", (event) => {
    if (event.target === fila) fila.classList.remove("is-nueva");
  });
  const valor = boton.querySelector(".chuleta__valor");
  valor.addEventListener("animationend", () => valor.classList.remove("is-tic"));
  return fila;
}

function pintarChuleta() {
  const from = el.from.value;
  const to = el.to.value;
  const filas = chuleta(rate, comision);
  const tuya = cantidadOrigen();
  if (el.chuletaTabla.children.length !== filas.length) {
    el.chuletaTabla.replaceChildren(...filas.map(crearFilaChuleta));
  }
  // Si cambia la escala (de euros a yenes, por ejemplo) es otra tabla: que
  // entre de nuevo en cascada en vez de cambiar los números sin más.
  const otraEscala = el.chuletaTabla.dataset.primera !== String(filas[0].cantidad);
  el.chuletaTabla.dataset.primera = filas[0].cantidad;

  filas.forEach(({ cantidad, valor }, i) => {
    const fila = el.chuletaTabla.children[i];
    fila.style.setProperty("--i", i);
    fila.dataset.cantidad = cantidad;
    if (otraEscala && !el.chuleta.hidden) restartAnimation(fila, "is-nueva");
    fila.classList.toggle("is-tuya", tuya !== null && Math.abs(tuya - cantidad) < 1e-9);

    const texto = valor === null ? "—" : nf.format(valor);
    fila.querySelector(".chuleta__cantidad").textContent = nfEntero.format(cantidad);
    const cifra = fila.querySelector(".chuleta__valor");
    if (cifra.textContent !== texto) {
      cifra.textContent = texto;
      if (!otraEscala && texto !== "—") restartAnimation(cifra, "is-tic");
    }
    fila.querySelector("button").setAttribute(
      "aria-label",
      tr("chuleta.aria", { cantidad: nfEntero.format(cantidad), from, valor: texto, to }),
    );
  });
}

function onElegirChuleta(cantidad) {
  tocado = true;
  el.amount.value = nfEntero.format(cantidad);
  restartAnimation(el.amount, "is-cambiado");
  onAmountInput();
}

// Solo pido cuando la pestaña está a la vista: cada fecha es una petición, y
// abrir el popup para convertir no debería gastarla.
async function refreshFecha() {
  if (vista !== "fecha") return;
  const from = el.from.value;
  const to = el.to.value;
  const dia = fecha;
  const clave = `dia:${dia}:${from}${to}`;
  const actual = ++fechaId;

  if (from === to) {
    tasaDelDia = { clave, rate: 1, date: dia };
    pintarFecha();
    return;
  }

  const cache = await loadCache();
  if (actual !== fechaId) return;
  const cached = cache[clave];
  // Una tasa pasada ya no cambia; solo la de hoy caduca.
  if (cached && (dia < hoy() || isFresh(cached))) {
    tasaDelDia = { clave, rate: cached.rate, date: cached.date };
    pintarFecha();
    return;
  }

  tasaDelDia = null;
  pintarFecha();
  el.fecha.classList.add("is-cargando");
  try {
    const data = await fetchDia(from, to, dia);
    if (actual !== fechaId) return;
    tasaDelDia = { clave, ...data };
    pintarFecha();
    saveCache({ [clave]: { rate: data.rate, date: data.date, day: hoy(), saved: Date.now() } });
  } catch (error) {
    if (actual !== fechaId) return;
    console.warn("No se pudo obtener la tasa de ese día", error);
    el.fechaTasa.textContent = errorMessageFor(error);
  } finally {
    if (actual === fechaId) el.fecha.classList.remove("is-cargando");
  }
}

function pintarFecha() {
  const from = el.from.value;
  const to = el.to.value;
  const hoyIso = hoy();
  el.fechaCampo.min = FECHA_MINIMA;
  el.fechaCampo.max = hoyIso;
  if (el.fechaCampo.value !== fecha) el.fechaCampo.value = fecha;
  for (const boton of el.fechaRapidas.children) {
    boton.setAttribute("aria-pressed", String(mesesAtras(hoyIso, Number(boton.dataset.meses)) === fecha));
  }

  const datos = tasaDelDia?.clave === `dia:${fecha}:${from}${to}` ? tasaDelDia : null;
  const cantidad = cantidadOrigen() ?? 1;
  const texto = datos ? `${nf.format(cantidad * datos.rate)} ${to}` : "—";
  if (el.fechaValor.textContent !== texto) {
    el.fechaValor.textContent = texto;
    if (datos) restartAnimation(el.fechaValor, "is-tic");
  }
  el.fechaValor.title = datos ? tr("fecha.valor", { cantidad: nf.format(cantidad), from, fecha: fechaLarga(fecha) }) : "";

  if (datos) {
    const nota = notaDiaHabil(fecha, datos.date);
    el.fechaTasa.textContent = nota ? tr("fecha.del", { fecha: fechaLarga(datos.date) }) : `1 ${from} = ${nfRate.format(datos.rate)}`;
    el.fechaTasa.classList.toggle("is-otro-dia", Boolean(nota));
    el.fechaTasa.title = nota || "";
  } else if (!el.fecha.classList.contains("is-cargando")) {
    el.fechaTasa.classList.remove("is-otro-dia");
  }

  const cambio = datos && rate !== null ? cambioDesde(datos.rate, rate) : null;
  el.fechaHoy.textContent = rate === null ? "" : tr("fecha.hoy", { valor: `${nf.format(cantidad * rate)} ${to}` });
  const sentido = sentidoDe(cambio);
  // La flecha ya dice si sube o baja; el signo de delante sobraba.
  const flecha = { sube: "▲", baja: "▼", igual: "=" }[sentido];
  const textoCambio = cambio === null ? "" : `${flecha} ${nfPercent.format(Math.abs(cambio)).replace("+", "")}`;
  if (el.fechaCambio.textContent !== textoCambio) {
    el.fechaCambio.textContent = textoCambio;
    if (textoCambio) restartAnimation(el.fechaCambio, "is-nueva");
  }
  el.fechaCambio.dataset.sentido = sentido;
  el.fechaCambio.title = cambio === null ? "" : tr("fecha.cambio", { fecha: fechaLarga(fecha) });
}

function ponerFecha(nueva) {
  if (nueva === fecha) return;
  fecha = nueva;
  pintarFecha();
  refreshFecha();
  try {
    chrome.storage.local.set({ [FECHA_KEY]: fecha });
  } catch (error) {
    console.warn("No se pudo guardar la fecha", error);
  }
}

function crearFechasRapidas() {
  el.fechaRapidas.replaceChildren(...FECHAS_RAPIDAS.map(({ meses, clave }) => {
    const texto = tr(clave);
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "fecha__rapida";
    boton.dataset.meses = meses;
    boton.textContent = texto;
    boton.setAttribute("aria-label", tr("fecha.hace", { texto }));
    boton.addEventListener("click", () => ponerFecha(mesesAtras(hoy(), meses)));
    return boton;
  }));
}

// Con el teclado el campo de fecha va soltando días a medias ("0002-03-01"
// mientras escribes el año), así que solo hago caso cuando es una fecha buena.
function onCampoFecha() {
  const valor = el.fechaCampo.value;
  if (fechaValida(valor)) {
    el.fechaCampo.removeAttribute("aria-invalid");
    ponerFecha(valor);
  }
}

function onSalirCampoFecha() {
  if (fechaValida(el.fechaCampo.value)) return;
  el.fechaCampo.setAttribute("aria-invalid", "true");
  restartAnimation(el.fechaCampo, "is-mal");
  el.fechaCampo.value = fecha;
}

// Lo de abajo más la comisión: lo que te cobra el banco de verdad.
function pintarComision() {
  const hay = comision > 0;
  const total = rate === null ? null : conComision(leerImporte(el.result.value), comision);
  const texto = total === null ? "—" : `${nf.format(total)} ${el.to.value}`;

  el.comision.classList.toggle("is-puesta", hay);
  const pct = tr("pct", { n: nfComision.format(comision) });
  el.comisionPct.textContent = hay ? `+${pct}` : tr("comision.anadir");
  if (!hay) {
    el.comisionTotal.textContent = "";
    el.comision.setAttribute("aria-label", tr("comision.anadirAria"));
    el.comision.title = tr("comision.anadirTitulo");
    return;
  }
  if (el.comisionTotal.textContent !== texto) {
    const habia = el.comisionTotal.textContent !== "";
    el.comisionTotal.textContent = texto;
    if (habia && texto !== "—") restartAnimation(el.comisionTotal, "is-tic");
  }
  el.comision.setAttribute("aria-label", tr("comision.aria", { pct, total: texto }));
  el.comision.title = tr("comision.conTitulo", { total: texto });
}

// En la chuleta y en las otras divisas las cifras ya llevan la comisión: que se
// vea, que si no parece que la tasa está mal.
function pintarAvisoComision() {
  const toca = comision > 0 && (vista === "extras" || vista === "chuleta");
  el.panelComision.hidden = !toca;
  if (!toca) return;
  el.panelComision.textContent = tr("comision.incluida", { pct: tr("pct", { n: nfComision.format(comision) }) });
  el.panelComision.title = tr("comision.incluidaTitulo");
}

function ponerComision(pct) {
  const antes = comision;
  comision = pct;
  pintarComision();
  pintarExtras();
  pintarChuleta();
  pintarAvisoComision();
  for (const boton of el.comisionRapidas.children) {
    boton.setAttribute("aria-pressed", String(Number(boton.dataset.pct) === pct));
  }
  // El salto solo al pasar de no tener a tener, que al cambiar de 2 a 3 ya
  // basta con el tic de la cifra.
  if (antes === 0 && pct > 0) restartAnimation(el.comision, "is-estrenada");
  try {
    chrome.storage.local.set({ [COMISION_KEY]: comision });
  } catch (error) {
    console.warn("No se pudo guardar la comisión", error);
  }
}

function abrirBurbuja() {
  cerrarHistorial();
  el.comisionRapidas.replaceChildren(...COMISIONES_RAPIDAS.map((pct, i) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "burbuja__rapida";
    boton.style.setProperty("--i", i);
    boton.dataset.pct = pct;
    boton.textContent = pct === 0 ? tr("comision.sin") : tr("pct", { n: pct });
    boton.setAttribute("aria-label", pct === 0 ? tr("comision.sinAria") : tr("pct", { n: pct }));
    boton.setAttribute("aria-pressed", String(pct === comision));
    boton.addEventListener("click", () => {
      ponerComision(pct);
      cerrarBurbuja()?.focus();
    });
    return boton;
  }));
  const rapida = COMISIONES_RAPIDAS.includes(comision);
  el.comisionCampo.value = rapida ? "" : nfComision.format(comision);
  el.comisionCampo.removeAttribute("aria-invalid");
  el.burbuja.hidden = false;
  el.comision.setAttribute("aria-expanded", "true");
  (rapida ? el.comisionRapidas.querySelector('[aria-pressed="true"]') : el.comisionCampo).focus();
}

function cerrarBurbuja() {
  if (el.burbuja.hidden) return;
  el.burbuja.hidden = true;
  el.comision.setAttribute("aria-expanded", "false");
  return el.comision;
}

// Mientras escribes se va viendo el total detrás; lo que no se entiende no lo
// aplico, pero tampoco protesto hasta que das a Enter.
function onCampoComision() {
  const pct = leerPorcentaje(el.comisionCampo.value);
  el.comisionCampo.removeAttribute("aria-invalid");
  if (pct !== null) ponerComision(pct);
}

function onTeclaCampoComision(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  if (leerPorcentaje(el.comisionCampo.value) === null) {
    el.comisionCampo.setAttribute("aria-invalid", "true");
    restartAnimation(el.comisionCampo, "is-mal");
    return;
  }
  cerrarBurbuja()?.focus();
}

function marcarTocado() {
  tocado = true;
  programarApunte();
}

function programarApunte() {
  if (!tocado) return;
  clearTimeout(apunteId);
  apunteId = setTimeout(apuntarAhora, PAUSA_APUNTE);
}

// Leo lo que se ve en los dos campos y no lo recalculo: así lo apuntado es
// justo lo que tenías delante, con sus dos decimales.
function apuntarAhora() {
  clearTimeout(apunteId);
  if (!tocado || rate === null) return;
  const nuevo = apuntarConversion(historial, {
    from: el.from.value,
    to: el.to.value,
    cantidad: leerImporte(el.amount.value),
    resultado: leerImporte(el.result.value),
    cuando: Date.now(),
  });
  if (nuevo === historial) return;
  const esOtra = nuevo[0] !== historial[0] && nuevo.length > 0;
  historial = nuevo;
  pintarHistorial();
  if (esOtra) restartAnimation(el.abrirHistorial, "is-apuntado");
  try {
    chrome.storage.local.set({ [HISTORIAL_KEY]: historial });
  } catch (error) {
    console.warn("No se pudo guardar el historial", error);
  }
}

function crearFilaHistorial(entrada, i) {
  const fila = document.createElement("li");
  fila.className = "historial__fila";
  fila.style.setProperty("--i", i);

  const botonCopiar = document.createElement("button");
  botonCopiar.type = "button";
  botonCopiar.className = "historial__copiar";
  const cuenta = document.createElement("span");
  cuenta.className = "historial__cuenta";
  cuenta.innerHTML = '<span class="historial__de"></span><span class="historial__flecha" aria-hidden="true">→</span><span class="historial__a"></span>';
  cuenta.querySelector(".historial__de").textContent = `${nf.format(entrada.cantidad)} ${entrada.from}`;
  cuenta.querySelector(".historial__a").textContent = `${nf.format(entrada.resultado)} ${entrada.to}`;
  const cuando = document.createElement("span");
  cuando.className = "historial__cuando";
  cuando.textContent = haceCuanto(entrada.cuando);
  botonCopiar.append(cuenta, cuando);
  botonCopiar.title = tr("copiar.aria");
  botonCopiar.setAttribute(
    "aria-label",
    tr("historial.fila", {
      cantidad: nf.format(entrada.cantidad), from: entrada.from,
      resultado: nf.format(entrada.resultado), to: entrada.to, cuando: cuando.textContent,
    }),
  );
  botonCopiar.addEventListener("click", async () => {
    const bien = await copiar(textoParaCopiar(entrada.resultado));
    cuando.textContent = tr(bien ? "historial.copiado" : "historial.fallo");
    fila.classList.add(bien ? "is-copiada" : "is-fallo");
    restartAnimation(cuando, "is-tic");
    setTimeout(() => {
      cuando.textContent = haceCuanto(entrada.cuando);
      fila.classList.remove("is-copiada", "is-fallo");
    }, 1300);
  });

  const usar = document.createElement("button");
  usar.type = "button";
  usar.className = "historial__usar";
  usar.title = tr("historial.usar");
  usar.setAttribute("aria-label", tr("historial.usarAria", { cantidad: nf.format(entrada.cantidad), from: entrada.from, to: entrada.to }));
  usar.innerHTML = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7a4.5 4.5 0 1 0 1.4-3.3"/><path d="M2 1.8v2.6h2.6"/></svg>';
  usar.addEventListener("click", () => onUsarHistorial(entrada));

  fila.append(botonCopiar, usar);
  return fila;
}

function pintarHistorial() {
  const hay = historial.length > 0;
  el.historialCuenta.hidden = !hay;
  el.historialCuenta.textContent = historial.length;
  el.abrirHistorial.setAttribute("aria-label", hay ? tr("historial.cuenta", { n: historial.length }) : tr("historial"));
  if (el.historial.hidden) return;
  el.historialLista.replaceChildren(...historial.map(crearFilaHistorial));
  el.historialVacio.hidden = hay;
  el.historialBorrar.hidden = !hay;
}

function abrirHistorial() {
  cerrarBurbuja();
  el.historial.hidden = false;
  el.abrirHistorial.setAttribute("aria-expanded", "true");
  pintarHistorial();
  (el.historialLista.querySelector("button") ?? el.abrirHistorial).focus();
}

function cerrarHistorial() {
  if (el.historial.hidden) return;
  el.historial.hidden = true;
  el.abrirHistorial.setAttribute("aria-expanded", "false");
  return el.abrirHistorial;
}

function onUsarHistorial({ from, to, cantidad }) {
  cerrarHistorial();
  buscadores.from.poner(from);
  buscadores.to.poner(to);
  el.amount.value = nf.format(cantidad);
  restartAnimation(el.from, "is-cambiado");
  restartAnimation(el.to, "is-cambiado");
  restartAnimation(el.amount, "is-cambiado");
  onAmountInput();
  onCurrencyChange();
  el.amount.focus();
}

// Las filas se van en cascada y luego se vacía de verdad.
function onBorrarHistorial() {
  const filas = [...el.historialLista.children];
  const vaciar = () => {
    historial = [];
    pintarHistorial();
    el.abrirHistorial.focus();
    try {
      chrome.storage.local.set({ [HISTORIAL_KEY]: [] });
    } catch (error) {
      console.warn("No se pudo borrar el historial", error);
    }
  };
  if (sinMovimiento.matches || filas.length === 0) return vaciar();
  filas.forEach((fila, i) => {
    fila.style.setProperty("--i", i);
    fila.classList.add("is-saliendo");
  });
  filas.at(-1).addEventListener("animationend", vaciar, { once: true });
}

async function guardarAvisos() {
  try {
    await chrome.storage.local.set({ [AVISOS_KEY]: avisos });
  } catch (error) {
    console.warn("No se pudieron guardar los avisos", error);
  }
}

function pintarSentidoAviso() {
  const from = el.from.value;
  const to = el.to.value;
  const par = `${from}${to}`;
  if (par !== parDelUmbral && rate !== null && from !== to) {
    el.avisoUmbral.value = nfRate.format(rate);
    parDelUmbral = par;
  }

  el.avisoCodigo.textContent = to;
  const sentido = from === to ? null : sentidoAviso(leerImporte(el.avisoUmbral.value), rate);
  el.avisoSentido.textContent = tr(sentido === "sube" ? "avisos.sube" : sentido === "baja" ? "avisos.baja" : "avisos.llega", { from });
  el.avisoSentido.dataset.sentido = sentido ?? "";
  el.avisoBoton.disabled = from === to || rate === null;
}

let notaAviso = null;

// Lo de abajo del panel: si no tienes avisos, una pista; si acabas de hacer
// algo, un mensaje que se va solo.
function pintarNota() {
  if (el.avisoNota.classList.contains("is-mensaje")) return;
  el.avisoNota.dataset.tipo = "pista";
  el.avisoNota.textContent = avisos.length ? "" : tr("avisos.nota");
}

function decir(texto, tipo) {
  el.avisoNota.textContent = texto;
  el.avisoNota.dataset.tipo = tipo;
  restartAnimation(el.avisoNota, "is-mensaje");
  clearTimeout(notaAviso);
  notaAviso = setTimeout(() => {
    el.avisoNota.classList.remove("is-mensaje");
    pintarNota();
  }, 2600);
}

function crearPastillaAviso(aviso) {
  const pastilla = document.createElement("li");
  pastilla.className = "aviso is-nueva";
  pastilla.dataset.id = aviso.id;

  const ir = document.createElement("button");
  ir.type = "button";
  ir.className = "aviso__ir";
  const umbral = nfRate.format(aviso.umbral);
  ir.setAttribute(
    "aria-label",
    tr("avisos.pastilla", {
      from: aviso.from, sentido: tr(aviso.sentido === "sube" ? "avisos.subeDe" : "avisos.bajaDe"), umbral, to: aviso.to,
    }),
  );
  const par = document.createElement("span");
  par.className = "aviso__par";
  par.textContent = `${aviso.from}→${aviso.to}`;
  const flecha = document.createElement("span");
  flecha.className = "aviso__flecha";
  flecha.dataset.sentido = aviso.sentido;
  flecha.textContent = aviso.sentido === "sube" ? "▲" : "▼";
  const cifra = document.createElement("span");
  cifra.className = "aviso__umbral";
  cifra.textContent = umbral;
  ir.append(par, flecha, cifra);
  ir.addEventListener("click", () => onIrAviso(aviso));

  const quitar = document.createElement("button");
  quitar.type = "button";
  quitar.className = "aviso__quitar";
  quitar.setAttribute("aria-label", tr("avisos.quitar"));
  quitar.textContent = "✕";
  quitar.addEventListener("click", () => onQuitarAviso(aviso.id));

  pastilla.append(ir, quitar);
  pastilla.addEventListener("animationend", (event) => {
    if (event.target === pastilla) pastilla.classList.remove("is-nueva");
  });
  return pastilla;
}

function pintarAvisos() {
  const pastillas = avisos.map((aviso, i) => {
    const pastilla = el.avisosLista.querySelector(`[data-id="${aviso.id}"]`) ?? crearPastillaAviso(aviso);
    pastilla.style.setProperty("--i", i);
    return pastilla;
  });
  const antes = [...el.avisosLista.children].map((p) => p.dataset.id).join();
  if (antes !== avisos.map((a) => a.id).join()) el.avisosLista.replaceChildren(...pastillas);
  // Un punto en la campana para que se vea que hay avisos sin entrar a mirar.
  el.campana.classList.toggle("tiene-avisos", avisos.length > 0);
  pintarNota();
}

function onCrearAviso(event) {
  event.preventDefault();
  const from = el.from.value;
  const to = el.to.value;
  const umbral = leerImporte(el.avisoUmbral.value);

  let problema = null;
  if (umbral === null) problema = tr("avisos.escribe", { ejemplo: nf.format(1.15) });
  else if (avisos.length >= AVISOS_MAX) problema = tr("avisos.lleno", { max: AVISOS_MAX });
  else if (sentidoAviso(umbral, rate) === null) problema = tr("avisos.igual");

  const aviso = problema ? null
    : crearAviso(from, to, umbral, rate, `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`);
  if (!aviso) {
    decir(problema ?? tr("avisos.noSe"), "error");
    restartAnimation(el.avisoUmbral, "is-mal");
    return;
  }

  avisos = [...avisos, aviso];
  guardarAvisos();
  pintarAvisos();
  el.avisoUmbral.value = nfRate.format(aviso.umbral);
  restartAnimation(el.campana, "is-sonando");
  decir(tr("avisos.hecho"), "ok");
}

function onIrAviso(aviso) {
  buscadores.from.poner(aviso.from);
  buscadores.to.poner(aviso.to);
  restartAnimation(el.from, "is-cambiado");
  restartAnimation(el.to, "is-cambiado");
  onCurrencyChange();
}

function onQuitarAviso(id) {
  const pastilla = el.avisosLista.querySelector(`[data-id="${id}"]`);
  const quitar = () => {
    avisos = avisos.filter((a) => a.id !== id);
    guardarAvisos();
    pintarAvisos();
  };
  if (!pastilla || sinMovimiento.matches) return quitar();
  pastilla.classList.remove("is-nueva");
  pastilla.classList.add("is-saliendo");
  pastilla.addEventListener("animationend", quitar, { once: true });
}

const esMac = /mac|iphone|ipad/i.test(navigator.userAgentData?.platform ?? navigator.platform ?? "");

const queHace = (accion) => tr(`atajo.${accion}`);

function hacerAtajo(accion) {
  if (accion === "intercambiar" && !el.swap.disabled) onSwap();
  else if (accion === "copiar") onCopiar();
  else if (accion === "origen") el.from.click();
  else if (accion === "destino") el.to.click();
  else if (accion === "ayuda") abrirAyuda();
  else if (accion.startsWith("vista:")) cambiarVista(accion.slice(6));
}

let teclaFlash = null;

// La tecla que acabas de pulsar sale un momento abajo, para que se note que
// ha hecho algo aunque el cambio sea pequeño (un copiar, por ejemplo).
function mostrarTecla(tecla, texto) {
  const kbd = document.createElement("kbd");
  kbd.textContent = tecla;
  mostrarFlash([kbd, ` ${texto}`]);
}

function mostrarFlash(contenido, ms = 1300) {
  el.teclaFlash.replaceChildren(...contenido);
  el.teclaFlash.style.setProperty("--dura", `${ms}ms`);
  restartAnimation(el.teclaFlash, "is-visible");
  clearTimeout(teclaFlash);
  teclaFlash = setTimeout(() => el.teclaFlash.classList.remove("is-visible"), ms);
}

// Solo sale la primera vez, que es cuando el par lo he elegido yo y no tú: que
// sepas de dónde viene y que se cambia como siempre.
function saludarPorIdioma({ from, idioma }) {
  const bandera = document.createElement("span");
  bandera.className = "tecla-flash__bandera";
  bandera.textContent = banderaDe(idioma) || "🌐";
  const kbd = document.createElement("kbd");
  kbd.textContent = from;
  restartAnimation(el.from, "is-cambiado");
  restartAnimation(el.to, "is-cambiado");
  // Espero a que acabe la entrada del popup, que si no se pierde entre todo.
  setTimeout(() => mostrarFlash([bandera, kbd, ` ${tr("idioma.puesta")}`], 3200), 550);
}

function onAtajo(event) {
  if (!el.ayuda.hidden) {
    if (event.key === "Escape" || event.key === "?") {
      event.preventDefault();
      cerrarAyuda();
    }
    return;
  }
  const t = event.target;
  const enCampo = t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t.isContentEditable;
  const accion = atajoPara({
    code: event.code, key: event.key, altKey: event.altKey,
    ctrlKey: event.ctrlKey, metaKey: event.metaKey, enCampo,
  });
  if (!accion) return;
  event.preventDefault();
  hacerAtajo(accion);
  if (accion !== "ayuda") {
    mostrarTecla(event.altKey ? textoAtajo(event.code, esMac) : event.code.replace(/^Key|^Digit/, ""), queHace(accion));
  }
}

let focoAntesDeAyuda = null;

function pintarAyuda() {
  const alt = esMac ? "⌥" : "Alt+";
  el.ayudaLista.replaceChildren(...Object.entries(ATAJOS).map(([code, accion], i) => {
    const fila = document.createElement("li");
    fila.className = "ayuda__fila";
    fila.style.setProperty("--i", i);
    const kbd = document.createElement("kbd");
    kbd.textContent = accion === "ayuda" ? "?" : code.replace(/^Key|^Digit/, "");
    const texto = document.createElement("span");
    texto.textContent = queHace(accion);
    fila.append(kbd, texto);
    return fila;
  }));
  el.ayudaNota.replaceChildren(tr("ayuda.nota", { alt }), document.createElement("br"), tr("ayuda.idioma"));
}

function abrirAyuda() {
  focoAntesDeAyuda = document.activeElement;
  cerrarBandeja();
  cerrarBurbuja();
  cerrarHistorial();
  pintarAyuda();
  el.ayuda.hidden = false;
  el.abrirAyuda.setAttribute("aria-expanded", "true");
  el.ayudaCerrar.focus();
}

function cerrarAyuda() {
  if (el.ayuda.hidden) return;
  el.ayuda.hidden = true;
  el.abrirAyuda.setAttribute("aria-expanded", "false");
  focoAntesDeAyuda?.focus?.();
}

// Las pistas de los botones dicen su atajo, para ir aprendiéndolos sin abrir
// la ayuda.
function ponerPistasDeAtajos() {
  const pista = (accion) => {
    const code = Object.keys(ATAJOS).find((c) => ATAJOS[c] === accion);
    return code.replace(/^Key|^Digit/, "");
  };
  el.swap.title = tr("intercambiar.titulo", { tecla: pista("intercambiar") });
  el.copiar.title = tr("copiar.titulo", { tecla: pista("copiar") });
  for (const boton of el.botonesVista) {
    boton.title = `${boton.title} (${pista(`vista:${boton.dataset.vista}`)})`;
  }
}

// Lo fijo del HTML lleva la clave en data-t (el texto) o data-t-title y
// compañía (los atributos). El español se queda escrito por si esto fallara.
function traducirPagina() {
  document.documentElement.lang = idiomaActual();
  for (const nodo of document.querySelectorAll("[data-t]")) nodo.textContent = tr(nodo.dataset.t);
  for (const atributo of ["title", "aria-label", "placeholder"]) {
    for (const nodo of document.querySelectorAll(`[data-t-${atributo}]`)) {
      nodo.setAttribute(atributo, tr(nodo.getAttribute(`data-t-${atributo}`)));
    }
  }
}

function renderRateLine(from, to) {
  if (rate === null) {
    el.rateLine.textContent = "";
    return;
  }
  el.rateLine.textContent = `1 ${from} = ${nfRate.format(rate)} ${to}`;
}

function renderUpdated() {
  el.updated.textContent = rateDate ? tr("actualizado", { fecha: rateDate }) : "";
}

function showError(message) {
  el.errorMessage.textContent = message;
  el.error.hidden = false;
}

function clearError() {
  el.error.hidden = true;
  el.errorMessage.textContent = "";
}

function setLoading(active) {
  el.resultBox.classList.toggle("is-loading", active);
  el.status.hidden = !active;
  el.status.textContent = active ? tr("cargando") : "";
  el.swap.disabled = active;
}

// El ancho de un input lo manda el atributo size, no el CSS. Lo ajusto a lo que
// hay escrito para que el código de divisa no se vaya al otro extremo, y si la
// cifra es muy larga encojo la letra: con un millón largo no cabía y se comía
// el último dígito por debajo del código.
function ajustarAncho() {
  const largo = String(el.result.value).length;
  el.result.size = Math.max(largo, 1);

  const tam = largo > 12 ? 22 : largo > 9 ? 27 : 34;
  el.resultBox.style.setProperty("--tam-cifra", `${tam}px`);
}

function renderResult() {
  const from = el.from.value;
  const to = el.to.value;

  el.resultCode.textContent = to;

  // El campo que estas tocando se queda como lo has dejado; relleno el otro.
  const escribiendoAbajo = ladoActivo === "result";
  const origen = escribiendoAbajo ? el.result : el.amount;
  const destino = escribiendoAbajo ? el.amount : el.result;
  const valor = leerImporte(origen.value);

  pintarExtras();
  pintarSentidoAviso();
  pintarChuleta();
  pintarFecha();

  if (valor === null) {
    destino.value = "—";
    ajustarAncho();
    el.resultMeta.textContent = "";
    pintarComision();
    return;
  }

  if (rate === null) {
    pintarComision();
    return;
  }

  const convertido = escribiendoAbajo ? valor / rate : valor * rate;
  destino.value = nf.format(convertido);
  ajustarAncho();

  const enviados = escribiendoAbajo ? convertido : valor;
  el.resultMeta.textContent = `${nf.format(enviados)} ${from}`;
  pintarComision();

  // El latido solo cuando cambia la cifra grande, que si no parpadea al teclear.
  if (!escribiendoAbajo) restartAnimation(el.result, "is-updating");
}

async function refresh() {
  const from = el.from.value;
  const to = el.to.value;
  // Sube también con la misma divisa en los dos lados: si no, la petición que
  // estuviera en vuelo llegaba después y me pisaba el 1 con la tasa vieja.
  const currentRequest = ++requestId;
  refreshExtras(from);
  refreshFecha();

  if (from === to) {
    rate = 1;
    rateDate = null;
    setLoading(false);
    clearError();
    renderRateLine(from, to);
    renderUpdated();
    renderResult();
    refreshTrend(from, to);
    return;
  }

  clearError();

  const cache = await loadCache();
  if (currentRequest !== requestId) return;

  const cached = cache[`${from}${to}`];
  if (cached) {
    // Aunque esté caducada la pinto: ver la tasa de ayer un segundo es mejor
    // que ver un guion. Si sigue valiendo, ya no pido nada.
    rate = cached.rate;
    rateDate = cached.date;
    renderRateLine(from, to);
    renderUpdated();
    renderResult();
  }

  if (isFresh(cached)) {
    refreshTrend(from, to);
    return;
  }

  setLoading(!cached);

  try {
    const data = await fetchRate(from, to);
    if (currentRequest !== requestId) return;

    rate = data.rate;
    rateDate = data.date;
    renderRateLine(from, to);
    renderUpdated();
    renderResult();
    refreshTrend(from, to);

    saveCache({
      [`${from}${to}`]: { rate: data.rate, date: data.date, day: hoy(), saved: Date.now() },
    });
  } catch (error) {
    if (currentRequest !== requestId) return;

    if (cached) {
      // Me quedo con lo viejo y aviso, que es más útil que dejarlo en blanco.
      showError(errorMessageFor(error));
      refreshTrend(from, to);
      return;
    }

    rate = null;
    rateDate = null;
    el.result.value = "—";
    el.resultCode.textContent = "";
    el.resultMeta.textContent = "";
    el.rateLine.textContent = "";
    el.updated.textContent = "";
    pintarChuleta();
    pintarFecha();
    pintarComision();
    hideTrend();
    showError(errorMessageFor(error));
  } finally {
    if (currentRequest === requestId) setLoading(false);
  }
}

function onSwap() {
  const from = el.from.value;
  buscadores.from.poner(el.to.value);
  buscadores.to.poner(from);

  restartAnimation(el.swap, "is-swapping");

  // Al dar la vuelta mando yo desde arriba. Si se quedara el lado de abajo, la
  // cantidad que escribiste se recalcularía a partir del resultado y bailaría.
  ladoActivo = "amount";

  if (rate !== null && rate !== 0) {
    rate = 1 / rate;
    renderRateLine(el.from.value, el.to.value);
    renderResult();
  }

  hideTrend();

  savePair(el.from.value, el.to.value);
  apuntarPar();
  refresh();
  programarApunte();
}

// El "= 35,00" que sale dentro del campo mientras escribes una cuenta. Le dejo
// sitio al texto con padding para que lo que tecleas no se meta por debajo.
function pintarCalculo() {
  const texto = el.amount.value;
  const valor = esOperacion(texto) ? leerImporte(texto) : null;
  const hay = valor !== null;
  if (hay) el.calculo.textContent = `= ${nf.format(valor)}`;
  el.calculo.classList.toggle("is-visible", hay);
  el.amount.classList.toggle("is-calculando", hay);
  el.amount.style.setProperty("--hueco-calculo", hay ? `${el.calculo.offsetWidth + 20}px` : "");
}

// Con Enter o al salir del campo, la cuenta se queda en su resultado.
function resolverCalculo(campo) {
  if (!esOperacion(campo.value)) return;
  const valor = leerImporte(campo.value);
  if (valor === null) return;

  campo.value = nf.format(valor);
  if (campo === el.amount) {
    onAmountInput();
    // El fantasma se va hacia la izquierda como si se metiera en el número.
    restartAnimation(el.calculo, "is-resuelto");
  } else {
    onResultInput();
  }
  restartAnimation(campo, "is-resuelto");
}

function onAmountInput() {
  ladoActivo = "amount";
  pintarCalculo();
  const amount = leerImporte(el.amount.value);
  const invalid = el.amount.value.trim() !== "" && amount === null;

  el.amount.setAttribute("aria-invalid", String(invalid));
  el.amountError.hidden = !invalid;
  el.amountError.textContent = invalid ? tr("cantidad.invalida") : "";

  renderResult();
}

function onResultInput() {
  ladoActivo = "result";
  ajustarAncho();
  const valor = leerImporte(el.result.value);
  const invalid = el.result.value.trim() !== "" && valor === null;

  el.result.setAttribute("aria-invalid", String(invalid));
  if (invalid) {
    el.amount.value = "—";
    el.resultMeta.textContent = "";
    return;
  }

  // Un valor invalido arriba deja de serlo en cuanto escribo aqui abajo.
  el.amount.setAttribute("aria-invalid", "false");
  el.amountError.hidden = true;
  el.amountError.textContent = "";

  renderResult();
}

let avisoCopiado = null;

async function onCopiar() {
  const valor = leerImporte(el.result.value);
  if (valor === null || rate === null) return;
  // Si lo copias es que era esa: la apunto ya, sin esperar.
  tocado = true;
  apuntarAhora();
  avisar(tr(await copiar(textoParaCopiar(valor)) ? "copiado" : "copiar.fallo"));
}

async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (error) {
    // El portapapeles moderno puede negarse según cómo esté el foco. El truco
    // del campo oculto es viejo pero no pide permisos y aquí siempre funciona.
    if (copiarALaAntigua(texto)) return true;
    console.warn("No se pudo copiar", error);
    return false;
  }
}

function copiarALaAntigua(texto) {
  const campo = document.createElement("textarea");
  campo.value = texto;
  campo.setAttribute("aria-hidden", "true");
  campo.style.cssText = "position:fixed;top:-100px;opacity:0";
  document.body.appendChild(campo);

  try {
    campo.select();
    return document.execCommand("copy");
  } catch (error) {
    return false;
  } finally {
    campo.remove();
    el.result.focus();
  }
}

function avisar(texto) {
  el.copiarTexto.textContent = texto;
  el.copiar.classList.add("is-hecho");

  clearTimeout(avisoCopiado);
  avisoCopiado = setTimeout(() => {
    el.copiarTexto.textContent = tr("copiar");
    el.copiar.classList.remove("is-hecho");
  }, 1400);
}

const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)");

function crearPastilla(par) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "reciente is-nueva";
  boton.dataset.par = `${par.from}${par.to}`;
  boton.setAttribute("aria-label", tr("reciente.aria", { de: nombreDe(par.from), a: nombreDe(par.to) }));

  const de = document.createElement("span");
  de.textContent = par.from;
  const flecha = document.createElement("span");
  flecha.className = "reciente__flecha";
  flecha.setAttribute("aria-hidden", "true");
  flecha.textContent = "→";
  const a = document.createElement("span");
  a.textContent = par.to;

  boton.append(de, flecha, a);
  boton.addEventListener("click", () => onReciente(par));
  // Si no la quito, al reordenar vuelve a entrar con rebote: sacar un nodo del
  // DOM y meterlo otra vez reinicia sus animaciones.
  boton.addEventListener("animationend", () => boton.classList.remove("is-nueva"));
  return boton;
}

function pintarRecientes() {
  const visibles = recientesVisibles(recientes, el.from.value, el.to.value);

  const antes = new Map();
  for (const p of el.recientes.children) antes.set(p.dataset.par, p.getBoundingClientRect());

  const pastillas = visibles.map((par, i) => {
    const vieja = el.recientes.querySelector(`[data-par="${par.from}${par.to}"]`);
    const pastilla = vieja ?? crearPastilla(par);
    pastilla.style.setProperty("--i", i);
    return pastilla;
  });
  el.recientes.replaceChildren(...pastillas);
  el.recientes.hidden = pastillas.length === 0;

  if (sinMovimiento.matches) return;

  // Las que ya estaban se deslizan desde donde estaban hasta su sitio nuevo, en
  // vez de saltar de golpe.
  for (const pastilla of pastillas) {
    const donde = antes.get(pastilla.dataset.par);
    if (!donde) continue;
    const ahora = pastilla.getBoundingClientRect();
    const dx = donde.left - ahora.left;
    const dy = donde.top - ahora.top;
    if (dx === 0 && dy === 0) continue;
    pastilla.animate(
      [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
      { duration: 380, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
  }
}

function apuntarPar() {
  recientes = apuntarReciente(recientes, el.from.value, el.to.value);
  guardarRecientes();
  pintarRecientes();
}

function onReciente(par) {
  buscadores.from.poner(par.from);
  buscadores.to.poner(par.to);
  restartAnimation(el.from, "is-cambiado");
  restartAnimation(el.to, "is-cambiado");
  onCurrencyChange();
}

async function cargarRango() {
  try {
    const guardado = await chrome.storage.local.get(RANGO_KEY);
    return leerRango(guardado[RANGO_KEY]);
  } catch (error) {
    console.warn("No se pudo leer el rango", error);
  }
  return RANGO_POR_DEFECTO;
}

async function guardarRango(valor) {
  try {
    await chrome.storage.local.set({ [RANGO_KEY]: valor });
  } catch (error) {
    console.warn("No se pudo guardar el rango", error);
  }
}

function marcarRango() {
  el.grupoRangos.style.setProperty("--indice", RANGOS.indexOf(dias));
  for (const boton of el.rangos) {
    const suyo = Number(boton.dataset.dias) === dias;
    boton.classList.toggle("is-activo", suyo);
    boton.setAttribute("aria-pressed", String(suyo));
  }
}

function onRango(event) {
  const nuevos = Number(event.currentTarget.dataset.dias);
  if (nuevos === dias) return;

  dias = nuevos;
  marcarRango();
  guardarRango(dias);
  refreshTrend(el.from.value, el.to.value);
}

function onCurrencyChange() {
  savePair(el.from.value, el.to.value);
  apuntarPar();
  refresh();
  programarApunte();
}

function bindEvents() {
  el.form.addEventListener("submit", (event) => event.preventDefault());
  el.amount.addEventListener("input", onAmountInput);
  el.result.addEventListener("input", onResultInput);
  el.amount.addEventListener("input", marcarTocado);
  el.result.addEventListener("input", marcarTocado);
  el.result.addEventListener("focus", () => el.result.select());
  for (const campo of [el.amount, el.result]) {
    campo.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        resolverCalculo(campo);
        apuntarAhora();
      }
    });
    campo.addEventListener("blur", () => resolverCalculo(campo));
    campo.addEventListener("animationend", () => campo.classList.remove("is-resuelto"));
  }
  el.calculo.addEventListener("animationend", () => el.calculo.classList.remove("is-resuelto"));
  el.swap.addEventListener("click", onSwap);
  el.retry.addEventListener("click", refresh);
  el.copiar.addEventListener("click", onCopiar);
  for (const boton of el.rangos) boton.addEventListener("click", onRango);
  el.lienzo.addEventListener("pointermove", onPunteroGrafico);
  el.lienzo.addEventListener("pointerdown", onPunteroGrafico);
  el.lienzo.addEventListener("pointerleave", dejarDeMirar);
  el.lienzo.addEventListener("keydown", onTeclaGrafico);
  el.lienzo.addEventListener("click", () => irAlDia(false));
  el.punto.addEventListener("animationend", () => el.punto.classList.remove("is-pulsado"));
  el.lienzo.addEventListener("focus", () => {
    if (serie.length >= 2 && mirando === null) mirar(serie.length - 1);
  });
  el.lienzo.addEventListener("blur", dejarDeMirar);
  for (const boton of el.botonesVista) {
    boton.addEventListener("click", () => cambiarVista(boton.dataset.vista));
  }
  el.vistas.addEventListener("keydown", onTeclaVistas);
  el.bandejaCerrar.addEventListener("click", () => cerrarBandeja()?.focus());
  el.bandeja.addEventListener("keydown", onTeclaBandeja);
  document.addEventListener("keydown", onAtajo);
  el.abrirAyuda.addEventListener("click", abrirAyuda);
  el.ayudaCerrar.addEventListener("click", cerrarAyuda);
  el.ayuda.addEventListener("mousedown", (event) => {
    if (event.target !== el.ayuda) return;
    // Sin esto, el propio clic se lleva el foco al body justo después de
    // devolverlo al botón.
    event.preventDefault();
    cerrarAyuda();
  });
  // Dentro de la ayuda solo hay un botón: el Tabulador no tiene adónde ir fuera.
  el.ayuda.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      el.ayudaCerrar.focus();
    }
  });
  el.abrirHistorial.addEventListener("click", () => (el.historial.hidden ? abrirHistorial() : cerrarHistorial()));
  el.abrirHistorial.addEventListener("animationend", () => el.abrirHistorial.classList.remove("is-apuntado"));
  el.historialBorrar.addEventListener("click", onBorrarHistorial);
  // Si cierras el popup antes de los dos segundos, que no se pierda.
  window.addEventListener("pagehide", apuntarAhora);
  el.momento.addEventListener("animationend", () => el.momento.classList.remove("is-nuevo"));
  el.fechaCampo.addEventListener("input", onCampoFecha);
  el.fechaCampo.addEventListener("blur", onSalirCampoFecha);
  el.fechaCampo.addEventListener("animationend", () => {
    el.fechaCampo.classList.remove("is-mal");
    el.fechaCampo.removeAttribute("aria-invalid");
  });
  el.fechaValor.addEventListener("animationend", () => el.fechaValor.classList.remove("is-tic"));
  el.fechaCambio.addEventListener("animationend", () => el.fechaCambio.classList.remove("is-nueva"));
  el.comision.addEventListener("click", () => (el.burbuja.hidden ? abrirBurbuja() : cerrarBurbuja()));
  el.comision.addEventListener("animationend", () => el.comision.classList.remove("is-estrenada"));
  el.comisionTotal.addEventListener("animationend", () => el.comisionTotal.classList.remove("is-tic"));
  el.comisionCampo.addEventListener("input", onCampoComision);
  el.comisionCampo.addEventListener("keydown", onTeclaCampoComision);
  el.comisionCampo.addEventListener("animationend", () => el.comisionCampo.classList.remove("is-mal"));
  el.avisoForm.addEventListener("submit", onCrearAviso);
  el.avisoUmbral.addEventListener("input", pintarSentidoAviso);
  el.avisoUmbral.addEventListener("animationend", () => el.avisoUmbral.classList.remove("is-mal"));
  // Solo al acabar el vaivén: el punto verde tiene su propia animación, más
  // corta, y su animationend también llega aquí y cortaba la campana a medias.
  el.campana.addEventListener("animationend", (event) => {
    if (event.animationName === "campana") el.campana.classList.remove("is-sonando");
  });
  // Cuando salta un aviso lo borra el service worker; si tienes el popup
  // abierto, que la pastilla desaparezca también.
  chrome.storage.onChanged.addListener((cambios, zona) => {
    if (zona !== "local" || !cambios[AVISOS_KEY]) return;
    avisos = leerAvisos(cambios[AVISOS_KEY].newValue);
    pintarAvisos();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !el.bandeja.hidden) {
      // Que el Escape cierre la bandeja y no el popup entero.
      event.preventDefault();
      cerrarBandeja()?.focus();
    }
    if (event.key === "Escape" && !el.burbuja.hidden) {
      event.preventDefault();
      cerrarBurbuja()?.focus();
    }
    if (event.key === "Escape" && !el.historial.hidden) {
      event.preventDefault();
      cerrarHistorial()?.focus();
    }
  });
  document.addEventListener("mousedown", (event) => {
    if (!el.bandeja.hidden && !el.bandeja.contains(event.target)) cerrarBandeja();
    // La pastilla se cierra a sí misma con su clic; si la cerrara aquí, el clic
    // la volvería a abrir.
    if (!el.burbuja.hidden && !el.burbuja.contains(event.target) && !el.comision.contains(event.target)) {
      cerrarBurbuja();
    }
    if (!el.historial.hidden && !el.historial.contains(event.target) && !el.abrirHistorial.contains(event.target)) {
      cerrarHistorial();
    }
  });
  window.addEventListener("online", () => {
    if (rate === null) refresh();
  });
}

async function cargarIdioma() {
  try {
    const guardado = await chrome.storage.local.get(["idioma", "avisarIdioma"]);
    ponerIdioma(idiomaElegido(guardado.idioma, idiomaDeChrome));
    if (guardado.avisarIdioma) {
      chrome.storage.local.remove("avisarIdioma");
      return true;
    }
  } catch (error) {
    console.warn("No se pudo leer el idioma", error);
  }
  return false;
}

// Después de cambiarlo en el menú del icono, la primera vez que abres te dice
// en qué idioma está, en ese idioma.
function saludarIdioma() {
  const globo = document.createElement("span");
  globo.className = "tecla-flash__bandera";
  globo.textContent = "🌐";
  setTimeout(() => mostrarFlash([globo, ` ${tr("idioma.cambiado")}`], 2600), 550);
}

async function init() {
  const idiomaCambiado = await cargarIdioma();
  traducirPagina();
  if (idiomaCambiado) saludarIdioma();
  const [pair, rango, guardados, pendiente, guardadas, vistaGuardada, avisosGuardados, comisionGuardada, fechaGuardada, historialGuardado] = await Promise.all([
    loadPair(), cargarRango(), cargarRecientes(), tomarPendiente(), cargarExtras(), cargarVista(), cargarAvisos(),
    cargarComision(), cargarFecha(), cargarHistorial(),
  ]);
  historial = historialGuardado;
  pintarHistorial();
  comision = comisionGuardada;
  fecha = fechaGuardada;
  crearFechasRapidas();
  dias = rango;
  marcarRango();
  extras = guardadas;
  avisos = avisosGuardados;
  pintarAvisos();
  vista = vistaGuardada;
  pintarVista();
  populateSelects(pendiente ?? pair);
  // El par de ahora entra en la lista, pero no lo guardo hasta que cambies:
  // abrir el popup no es elegir nada.
  recientes = apuntarReciente(guardados, pair.from, pair.to);

  if (pair.idioma && !pendiente) {
    // Lo guardo ya: así el icono de la barra enseña el mismo par y el aviso no
    // vuelve a salir cada vez que abres.
    savePair(pair.from, pair.to);
    saludarPorIdioma(pair);
  }

  if (pendiente) {
    // Esto sí es elegir: viene de lo que has seleccionado en la página.
    tocado = true;
    el.amount.value = nf.format(pendiente.cantidad);
    savePair(pendiente.from, pendiente.to);
    apuntarPar();
    restartAnimation(el.amount, "is-cambiado");
  } else {
    pintarRecientes();
  }
  ponerPistasDeAtajos();
  bindEvents();
  onAmountInput();
  refresh();
  // Lo que viene del clic derecho también es una conversión tuya.
  programarApunte();

  el.amount.focus();
  el.amount.select();
}

init();
