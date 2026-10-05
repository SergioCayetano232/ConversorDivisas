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
  timo: document.getElementById("timo"),
  timoOferta: document.getElementById("timo-oferta"),
  timoDe: document.getElementById("timo-de"),
  timoA: document.getElementById("timo-a"),
  timoCampo: document.getElementById("timo-campo"),
  timoVeredicto: document.getElementById("timo-veredicto"),
  timoPerdida: document.getElementById("timo-perdida"),
  timoMargen: document.getElementById("timo-margen"),
  timoNota: document.getElementById("timo-nota"),
  abrirHistorial: document.getElementById("abrir-historial"),
  abrirGastos: document.getElementById("abrir-gastos"),
  abrirCuenta: document.getElementById("abrir-cuenta"),
  cuenta: document.getElementById("cuenta"),
  cuentaCerrar: document.getElementById("cuenta-cerrar"),
  cuentaEtiqueta: document.getElementById("cuenta-etiqueta"),
  cuentaCifra: document.getElementById("cuenta-cifra"),
  cuentaTuyo: document.getElementById("cuenta-tuyo"),
  cuentaPropinas: document.getElementById("cuenta-propinas"),
  cuentaCampo: document.getElementById("cuenta-campo"),
  cuentaMenos: document.getElementById("cuenta-menos"),
  cuentaMas: document.getElementById("cuenta-mas"),
  cuentaN: document.getElementById("cuenta-n"),
  cuentaGente: document.getElementById("cuenta-gente"),
  cuentaPie: document.getElementById("cuenta-pie"),
  gastosCuenta: document.getElementById("gastos-cuenta"),
  gastosTitulo: document.getElementById("gastos-titulo"),
  viaje: document.getElementById("viaje"),
  viajes: document.getElementById("viajes"),
  viajesLista: document.getElementById("viajes-lista"),
  viajesNuevo: document.getElementById("viajes-nuevo"),
  viajesNombre: document.getElementById("viajes-nombre"),
  viajesLleno: document.getElementById("viajes-lleno"),
  gastos: document.getElementById("gastos"),
  gastosVaciar: document.getElementById("gastos-vaciar"),
  gastosSuma: document.getElementById("gastos-suma"),
  gastosN: document.getElementById("gastos-n"),
  gastosMedia: document.getElementById("gastos-media"),
  gastosForm: document.getElementById("gastos-form"),
  gastosConcepto: document.getElementById("gastos-concepto"),
  gastosPago: document.getElementById("gastos-pago"),
  presupuestoEsto: document.getElementById("presupuesto-esto"),
  presupuestoEstoTexto: document.getElementById("presupuesto-esto-texto"),
  gastosSugerencia: document.getElementById("gastos-sugerencia"),
  gastosApuntar: document.getElementById("gastos-apuntar"),
  gastosLista: document.getElementById("gastos-lista"),
  gastosVacio: document.getElementById("gastos-vacio"),
  gastosCerrar: document.getElementById("gastos-cerrar"),
  gastosCategoria: document.getElementById("gastos-categoria"),
  categorias: document.getElementById("categorias"),
  desglose: document.getElementById("desglose"),
  presupuesto: document.getElementById("presupuesto"),
  presupuestoAnadir: document.getElementById("presupuesto-anadir"),
  presupuestoVer: document.getElementById("presupuesto-ver"),
  presupuestoLleno: document.getElementById("presupuesto-lleno"),
  presupuestoTexto: document.getElementById("presupuesto-texto"),
  presupuestoForm: document.getElementById("presupuesto-form"),
  presupuestoImporte: document.getElementById("presupuesto-importe"),
  presupuestoCodigo: document.getElementById("presupuesto-codigo"),
  presupuestoHasta: document.getElementById("presupuesto-hasta"),
  presupuestoQuitar: document.getElementById("presupuesto-quitar"),
  historialCuenta: document.getElementById("historial-cuenta"),
  historial: document.getElementById("historial"),
  historialLista: document.getElementById("historial-lista"),
  historialVacio: document.getElementById("historial-vacio"),
  historialBorrar: document.getElementById("historial-borrar"),
  historialCsv: document.getElementById("historial-csv"),
  gastosCsv: document.getElementById("gastos-csv"),
  gastosCompartir: document.getElementById("gastos-compartir"),
  deshacer: document.getElementById("gastos-deshacer"),
  deshacerTexto: document.getElementById("gastos-deshacer-texto"),
  deshacerBoton: document.getElementById("gastos-deshacer-boton"),
  deshacerTiempo: document.getElementById("gastos-deshacer-tiempo"),
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
  abrirCopia: document.getElementById("abrir-copia"),
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
let semanaBase = null;
let semanaId = 0;
let avisos = [];
// De qué par es lo que hay en el campo del aviso: al cambiar de par le pongo
// la tasa nueva, pero mientras sea el mismo no le toco lo que hayas escrito.
let parDelUmbral = null;
let comision = 0;
let tasaAlReves = false;
let historial = [];
// Abrir el popup y verlo con su 1 de siempre no es convertir nada: solo apunto
// cuando has tocado algo tú.
let tocado = false;
let apunteId = null;
let fecha = null;
// La tasa del día que miras y de qué par y fecha es, para no pintar la de otro.
let tasaDelDia = null;
let fechaId = 0;
// De qué par es la tasa escrita en la pestaña de la ventanilla, sin orden: al
// dar la vuelta al par sigue valiendo (la leo al revés), con otro par no.
let parDelTimo = null;
// Los gastos y el presupuesto de abajo son los del viaje abierto; al guardar
// vuelven a su sitio dentro de viajes.
let viajes = null;
let quedanSueltos = false;
let gastos = [];
// El que acabas de apuntar entra con su salto; los demás se quedan quietos.
let gastoNuevo = null;
let cascadaGastos = false;
let vaciarId = null;
// Lo último que has quitado, mientras se puede deshacer: un gasto y dónde
// estaba, o la lista entera si has vaciado.
let quitado = null;
let presupuesto = null;
let reparto = { ...CUENTA_POR_DEFECTO };
// La categoría del gasto que vas a apuntar. Mientras no la elijas tú, la saco
// del concepto; si la eliges, ya no te la cambio por mucho que escribas.
let categoriaNueva = CATEGORIA_POR_DEFECTO;
let categoriaAMano = false;
let pagoNuevo = PAGO_POR_DEFECTO;
let filtroCategoria = null;

// Con el mismo trazo que los iconos de las pestañas.
const ICONOS_CATEGORIA = {
  comida: '<path d="M4 1.5v3.3a1.5 1.5 0 0 0 3 0V1.5M5.5 1.5v11M10.5 12.5v-11c-1.6 0-2.6 1.6-2.6 3.8 0 1.9.9 3 2.6 3"/>',
  transporte: '<rect x="1.8" y="3" width="10.4" height="7" rx="2"/><path d="M1.8 7h10.4"/><circle cx="4.5" cy="11.2" r="1"/><circle cx="9.5" cy="11.2" r="1"/>',
  alojamiento: '<path d="M1.5 3v9.5M1.5 9.5h11v3M12.5 9.5V7.5a2 2 0 0 0-2-2H6.5v4"/><circle cx="4" cy="7.3" r="1.1"/>',
  ocio: '<path d="M1.8 4h10.4v2a1 1 0 0 0 0 2v2H1.8V8a1 1 0 0 0 0-2z"/><path d="M8.5 4.5v1M8.5 6.6v.8M8.5 8.5v1"/>',
  compras: '<path d="M3 5h8l-.6 7.5H3.6z"/><path d="M5.2 5V4a1.8 1.8 0 0 1 3.6 0v1"/>',
  otros: '<circle cx="3.2" cy="7" r="0.9"/><circle cx="7" cy="7" r="0.9"/><circle cx="10.8" cy="7" r="0.9"/>',
};
// Una tarjeta y un billete, del mismo trazo que los iconos de las categorías.
const ICONOS_PAGO = {
  tarjeta: '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="1.2" y="2.6" width="9.6" height="6.8" rx="1.3"/><path d="M1.2 4.9h9.6M3 7.6h2"/></svg>',
  efectivo: '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="1" y="3" width="10" height="6" rx="1"/><circle cx="6" cy="6" r="1.4"/><path d="M2.8 4.8v2.4M9.2 4.8v2.4"/></svg>',
};

const iconoCategoria = (categoria) =>
  `<svg viewBox="0 0 14 14" aria-hidden="true">${ICONOS_CATEGORIA[categoria] ?? ICONOS_CATEGORIA.otros}</svg>`;

// Se piden en el momento a numeros(), que los guarda por idioma: así da igual
// que el idioma elegido llegue después de cargar el archivo. Y todos agrupan
// siempre los miles, que es lo que pone numeros() por defecto.
const formatoNumero = (opciones) => ({ format: (n) => numeros(opciones).format(n) });

const nf = formatoNumero({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nfDias = formatoNumero({ maximumFractionDigits: 1 });
const nfRate = formatoNumero({ minimumFractionDigits: 4, maximumFractionDigits: 4 });
const nfEntero = formatoNumero({ maximumFractionDigits: 0 });
const nfComision = formatoNumero({ maximumFractionDigits: 2 });
const nfMargen = formatoNumero({ style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });
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
const PAGO_KEY = "pagoGasto";
const FECHA_KEY = "fechaConsulta";
const HISTORIAL_KEY = "historialConversiones";
// Estas dos son de antes de los viajes: solo se leen para pasarlas al primero.
const GASTOS_KEY = "gastosViaje";
const PRESUPUESTO_KEY = "presupuestoViaje";
const VIAJES_KEY = "viajes";
const CUENTA_KEY = "cuentaReparto";
const AL_REVES_KEY = "tasaAlReves";
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

async function cargarPago() {
  try {
    const guardado = await chrome.storage.local.get(PAGO_KEY);
    return leerPago(guardado[PAGO_KEY]);
  } catch (error) {
    console.warn("No se pudo leer cómo pagas", error);
    return PAGO_POR_DEFECTO;
  }
}

async function guardarPago() {
  try {
    await chrome.storage.local.set({ [PAGO_KEY]: pagoNuevo });
  } catch (error) {
    console.warn("No se pudo guardar cómo pagas", error);
  }
}

async function cargarTasaAlReves() {
  try {
    const guardado = await chrome.storage.local.get(AL_REVES_KEY);
    return guardado[AL_REVES_KEY] === true;
  } catch (error) {
    console.warn("No se pudo leer cómo ver la tasa", error);
    return false;
  }
}

async function guardarTasaAlReves() {
  try {
    await chrome.storage.local.set({ [AL_REVES_KEY]: tasaAlReves });
  } catch (error) {
    console.warn("No se pudo guardar cómo ver la tasa", error);
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

async function cargarViajes() {
  try {
    const guardado = await chrome.storage.local.get([VIAJES_KEY, GASTOS_KEY, PRESUPUESTO_KEY]);
    quedanSueltos = GASTOS_KEY in guardado || PRESUPUESTO_KEY in guardado;
    return leerViajes(guardado[VIAJES_KEY], guardado[GASTOS_KEY], guardado[PRESUPUESTO_KEY]);
  } catch (error) {
    console.warn("No se pudieron leer los viajes", error);
    return leerViajes(undefined);
  }
}

async function cargarReparto() {
  try {
    const guardado = await chrome.storage.local.get(CUENTA_KEY);
    return leerCuenta(guardado[CUENTA_KEY]);
  } catch (error) {
    console.warn("No se pudo leer la propina", error);
    return { ...CUENTA_POR_DEFECTO };
  }
}

async function guardarViajes() {
  viajes = cambiarViaje(viajes, viajes.activo, { gastos, presupuesto });
  try {
    await chrome.storage.local.set({ [VIAJES_KEY]: viajes });
    // Lo suelto de antes se borra cuando ya está a salvo dentro del primer viaje.
    if (quedanSueltos) {
      quedanSueltos = false;
      await chrome.storage.local.remove([GASTOS_KEY, PRESUPUESTO_KEY]);
    }
  } catch (error) {
    console.warn("No se pudieron guardar los viajes", error);
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

// Toda la semana de todas las divisas de una vez: son unos pocos días, y así
// sirve también para las que añadas luego sin volver a pedir nada.
async function fetchSemana(from) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_HISTORY}/${startDateFor(7)}..?base=${from}`, { signal: controller.signal });
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
  el.timo.hidden = vista !== "timo";
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
const VISTAS = ["evolucion", "extras", "avisos", "chuleta", "fecha", "timo"];

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

  // La semana va de fondo, detrás del código y la cifra.
  const mini = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  mini.setAttribute("class", "extra__mini");
  mini.setAttribute("viewBox", "0 0 100 20");
  mini.setAttribute("preserveAspectRatio", "none");
  mini.setAttribute("aria-hidden", "true");
  mini.innerHTML = '<path class="extra__mini-area"/><path class="extra__mini-linea" vector-effect="non-scaling-stroke"/>';
  const flecha = document.createElement("span");
  flecha.className = "extra__flecha";
  flecha.setAttribute("aria-hidden", "true");
  cod.after(flecha);
  elegir.prepend(mini);

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
    const semana = semanaBase?.de === from ? semanaDe(semanaBase.rates, code) : null;
    pintarSemana(celda, semana);
    const elegir = celda.querySelector(".extra__elegir");
    const aria = tr("extras.aria", { nombre: nombreDe(code), valor: texto });
    const cambio = semana?.cambio == null ? "" : tr("extras.semana", { cambio: nfPercent.format(semana.cambio) });
    elegir.setAttribute("aria-label", cambio ? `${aria}. ${cambio}` : aria);
    elegir.title = cambio ? `${tr("extras.elegir", { nombre: nombreDe(code) })}\n${cambio}` : tr("extras.elegir", { nombre: nombreDe(code) });
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

const FLECHAS = { sube: "▲", baja: "▼", igual: "" };

// Si cambia la forma (otra divisa de origen, el dato de hoy), la línea se
// dibuja de nuevo de izquierda a derecha.
function pintarSemana(celda, semana) {
  const mini = celda.querySelector(".extra__mini");
  const sentido = semana?.sentido ?? "";
  celda.dataset.sentido = sentido;
  celda.querySelector(".extra__flecha").textContent = FLECHAS[sentido] ?? "";
  const linea = semana ? trazoMini(semana.valores).linea : "";
  if (mini.dataset.linea === linea) return;
  mini.dataset.linea = linea;
  if (!semana) {
    mini.querySelector(".extra__mini-linea").removeAttribute("d");
    mini.querySelector(".extra__mini-area").removeAttribute("d");
    return;
  }
  const { area } = trazoMini(semana.valores);
  mini.querySelector(".extra__mini-linea").setAttribute("d", linea);
  mini.querySelector(".extra__mini-area").setAttribute("d", area);
  // Un svg no tiene offsetWidth: el reflujo para reiniciar lo fuerzo con el botón.
  mini.classList.remove("is-dibujando");
  void celda.querySelector(".extra__elegir").offsetWidth;
  mini.classList.add("is-dibujando");
}

// Como las tasas de hoy: guardada en la caché y pedida otra vez al día siguiente.
async function refreshSemana(from) {
  const actual = ++semanaId;
  const key = `semana:${from}`;
  const cache = await loadCache();
  if (actual !== semanaId) return;

  const cached = cache[key];
  if (cached?.rates) semanaBase = { de: from, rates: cached.rates };
  else if (semanaBase?.de !== from) semanaBase = null;
  pintarExtras();
  if (isFresh(cached)) return;

  try {
    const rates = await fetchSemana(from);
    if (actual !== semanaId) return;
    semanaBase = { de: from, rates };
    pintarExtras();
    saveCache({ [key]: { rates, day: hoy(), saved: Date.now() } });
  } catch (error) {
    if (actual === semanaId) console.warn("No se pudo obtener la semana de las demás divisas", error);
  }
}

async function refreshExtras(from) {
  refreshSemana(from);
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

function pintarTimo() {
  const from = el.from.value;
  const to = el.to.value;
  const par = [from, to].sort().join();
  if (par !== parDelTimo) {
    if (parDelTimo !== null) el.timoCampo.value = "";
    parDelTimo = par;
  }

  const hay = from !== to && rate !== null;
  el.timoCampo.disabled = from === to;
  el.timoCampo.placeholder = hay ? nfRate.format(rate) : "";
  const r = hay ? analizarCambio(leerImporte(el.timoCampo.value), rate, cantidadOrigen() ?? 1, comision) : null;

  // Si la has escrito al revés, giro los códigos para que se lea como la pusiste.
  const [de, a] = r?.invertida ? [to, from] : [from, to];
  el.timoDe.textContent = `1 ${de} =`;
  el.timoA.textContent = a;
  const girada = String(Boolean(r?.invertida));
  if (el.timoOferta.dataset.girada !== girada) {
    if (el.timoOferta.dataset.girada !== undefined) restartAnimation(el.timoOferta, "is-girada");
    el.timoOferta.dataset.girada = girada;
  }
  el.timoOferta.title = r?.invertida
    ? tr("timo.alReves", { de, tasa: nfRate.format(leerImporte(el.timoCampo.value)), a })
    : "";

  const veredicto = r?.veredicto ?? "";
  el.timoVeredicto.hidden = !r;
  if (el.timo.dataset.veredicto !== veredicto) {
    el.timo.dataset.veredicto = veredicto;
    if (r) {
      el.timoVeredicto.textContent = tr(`timo.${veredicto}`);
      restartAnimation(el.timoVeredicto, veredicto === "timo" ? "is-alarma" : "is-nuevo");
    }
  }

  const perdida = r ? tr("timo.pierdes", { valor: `${nf.format(r.perdida)} ${to}` }) : "—";
  if (el.timoPerdida.textContent !== perdida) {
    el.timoPerdida.textContent = perdida;
    if (r) restartAnimation(el.timoPerdida, "is-tic");
  }
  el.timoMargen.textContent = r ? `−${nfMargen.format(r.margen)}` : "";

  let nota;
  if (!r) nota = from === to ? tr("timo.mismo") : tr("timo.pista");
  else if (r.tarjeta) nota = tr(`timo.${r.tarjeta}`, { pct: tr("pct", { n: nfComision.format(comision) }) });
  else {
    nota = tr(r.sentido === "vendes" ? "timo.teDan" : "timo.pagas", {
      valor: `${nf.format(r.ofrecido)} ${to}`, justo: nf.format(r.justo),
    });
  }
  el.timoNota.textContent = nota;
  el.timoNota.dataset.tarjeta = r?.tarjeta ?? "";
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
  pintarTimo();
  pintarCuenta();
  pintarBotonGasto();
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
  cerrarGastos();
  cerrarCuenta();
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
  cuenta.title = `${nf.format(entrada.cantidad)} ${entrada.from} → ${nf.format(entrada.resultado)} ${entrada.to}`;
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
  el.historialCsv.hidden = !hay;
}

function abrirHistorial() {
  cerrarBurbuja();
  cerrarGastos();
  cerrarCuenta();
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

// El BOM del principio es para Excel: sin él abre el archivo como Latin-1 y
// "Cena en el Rincón" sale con la ó rota.
function descargarCsv(texto, nombre, boton) {
  const url = URL.createObjectURL(new Blob(["\uFEFF", texto], { type: "text/csv;charset=utf-8" }));
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `${nombre}-${hoy()}.csv`;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  boton.textContent = tr("csv.hecho");
  restartAnimation(boton, "is-hecho");
  clearTimeout(boton.vuelta);
  boton.vuelta = setTimeout(() => {
    boton.textContent = tr("csv.boton");
    boton.classList.remove("is-hecho");
  }, 1400);
}

const textoTotales = (totales) => totales.map(({ to, total }) => `${nf.format(total)} ${to}`).join(" · ");

// Lo que se ve en los dos campos, como en el historial, más la comisión: en el
// extranjero eso es lo que te cuesta de verdad.
function gastoDePantalla() {
  if (rate === null) return null;
  const valor = conComision(leerImporte(el.result.value), comisionDelPago(pagoNuevo, comision));
  return crearGasto({
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    from: el.from.value,
    to: el.to.value,
    cantidad: leerImporte(el.amount.value),
    valor,
    concepto: el.gastosConcepto.value,
    categoria: categoriaNueva,
    pago: pagoNuevo,
    cuando: Date.now(),
  });
}

function pintarCategoriaNueva(conSalto = false) {
  el.gastosCategoria.innerHTML = iconoCategoria(categoriaNueva);
  el.gastosCategoria.dataset.categoria = categoriaNueva;
  const nombre = tr(`cat.${categoriaNueva}`);
  el.gastosCategoria.title = nombre;
  el.gastosCategoria.setAttribute("aria-label", tr("cat.elegir", { nombre }));
  if (conSalto) restartAnimation(el.gastosCategoria, "is-cambiada");
}

// Lo de todos los viajes: el café de Lisboa también me vale en Japón.
function sugerenciaConcepto() {
  const todos = viajes.lista.flatMap((v) => (v.id === viajes.activo ? gastos : v.gastos));
  return completarConcepto(el.gastosConcepto.value, conceptosUsados(todos));
}

// El resto sale en gris detrás de lo escrito. El trozo escrito va invisible
// solo para empujar el resto justo hasta donde acaba el texto.
function pintarSugerencia(sugerencia) {
  const campo = el.gastosConcepto;
  // Si el texto ya no cabe, el campo se desplaza y la sugerencia caería encima.
  const cabe = campo.scrollWidth <= campo.clientWidth;
  const hay = Boolean(sugerencia) && cabe && campo.selectionStart === campo.value.length;
  const [escrito, resto] = el.gastosSugerencia.children;
  escrito.textContent = hay ? campo.value : "";
  if (hay && resto.textContent !== sugerencia.resto) restartAnimation(resto, "is-nueva");
  resto.textContent = hay ? sugerencia.resto : "";
  el.gastosSugerencia.classList.toggle("is-visible", hay);
  return hay;
}

function aceptarSugerencia() {
  const sugerencia = sugerenciaConcepto();
  if (!sugerencia || !pintarSugerencia(sugerencia)) return false;
  el.gastosConcepto.value = sugerencia.concepto;
  pintarSugerencia(null);
  restartAnimation(el.gastosConcepto, "is-completado");
  pintarBotonGasto();
  if (!categoriaAMano && sugerencia.categoria !== categoriaNueva) {
    categoriaNueva = sugerencia.categoria;
    pintarCategoriaNueva(true);
  }
  return true;
}

function onTeclaConcepto(event) {
  if (event.altKey || event.metaKey || event.ctrlKey) return;
  if ((event.key === "Tab" && !event.shiftKey) || event.key === "ArrowRight") {
    if (aceptarSugerencia()) event.preventDefault();
  } else if (event.key === "Escape" && el.gastosSugerencia.classList.contains("is-visible")) {
    // Solo me como el Escape si había algo que quitar; si no, que cierre el panel.
    event.preventDefault();
    event.stopPropagation();
    pintarSugerencia(null);
  }
}

function pintarPago(conGiro = false) {
  el.gastosPago.innerHTML = ICONOS_PAGO[pagoNuevo];
  el.gastosPago.dataset.pago = pagoNuevo;
  const nombre = tr(`pago.${pagoNuevo}`);
  el.gastosPago.title = nombre;
  el.gastosPago.setAttribute("aria-label", tr("pago.elegir", { nombre }));
  if (conGiro) restartAnimation(el.gastosPago, "is-girando");
}

// Lo dejo como lo pusiste: si pagas en efectivo, sueles hacerlo varias veces seguidas.
function onCambiarPago() {
  pagoNuevo = pagoNuevo === "efectivo" ? "tarjeta" : "efectivo";
  pintarPago(true);
  pintarBotonGasto();
  if (comision > 0) restartAnimation(el.gastosApuntar, "is-tic");
  guardarPago();
}

function onConceptoGasto() {
  pintarBotonGasto();
  const sugerencia = sugerenciaConcepto();
  const hay = pintarSugerencia(sugerencia);
  if (categoriaAMano) return;
  // Si ya lo apuntaste antes, mejor la categoría que le pusiste que la que yo adivine.
  const nueva = (hay ? sugerencia.categoria : null)
    ?? adivinarCategoria(el.gastosConcepto.value) ?? CATEGORIA_POR_DEFECTO;
  if (nueva === categoriaNueva) return;
  categoriaNueva = nueva;
  pintarCategoriaNueva(true);
}

function abrirCategorias() {
  el.categorias.replaceChildren(...CATEGORIAS.map((categoria, i) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "categorias__opcion";
    boton.style.setProperty("--i", i);
    boton.dataset.categoria = categoria;
    boton.innerHTML = iconoCategoria(categoria);
    boton.title = tr(`cat.${categoria}`);
    boton.setAttribute("aria-label", tr(`cat.${categoria}`));
    boton.setAttribute("aria-pressed", String(categoria === categoriaNueva));
    boton.addEventListener("click", () => {
      categoriaNueva = categoria;
      categoriaAMano = true;
      pintarCategoriaNueva(true);
      cerrarCategorias();
      el.gastosConcepto.focus();
    });
    return boton;
  }));
  el.categorias.hidden = false;
  el.gastosCategoria.setAttribute("aria-expanded", "true");
  el.categorias.querySelector('[aria-pressed="true"]')?.focus();
}

function cerrarCategorias() {
  if (el.categorias.hidden) return false;
  el.categorias.hidden = true;
  el.gastosCategoria.setAttribute("aria-expanded", "false");
  return true;
}

function pintarDesglose() {
  const trozos = desglose(gastos);
  // Con una sola categoría el desglose no dice nada: un 100 % y ya.
  el.desglose.hidden = trozos.length < 2;
  if (filtroCategoria && !trozos.some((t) => t.categoria === filtroCategoria)) filtroCategoria = null;
  if (el.desglose.hidden) {
    filtroCategoria = null;
    return;
  }
  el.desglose.replaceChildren(...trozos.map(({ categoria, total, fraccion, to }, i) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "desglose__trozo";
    boton.dataset.categoria = categoria;
    boton.style.setProperty("--i", i);
    boton.style.setProperty("--parte", fraccion);
    const pct = porCientoEntero(fraccion);
    boton.innerHTML = `${iconoCategoria(categoria)}<span class="desglose__pct"></span>`;
    boton.querySelector(".desglose__pct").textContent = pct;
    const nombre = tr(`cat.${categoria}`);
    boton.title = tr("cat.filtrar", { nombre, total: `${nf.format(total)} ${to}`, pct });
    boton.setAttribute("aria-label", boton.title);
    boton.setAttribute("aria-pressed", String(categoria === filtroCategoria));
    boton.addEventListener("click", () => {
      filtroCategoria = filtroCategoria === categoria ? null : categoria;
      cascadaGastos = true;
      pintarGastos();
      el.desglose.querySelector(`[data-categoria="${categoria}"]`)?.focus();
    });
    return boton;
  }));
}

const porCientoEntero = (fraccion) => tr("pct", { n: Math.round(fraccion * 100) });

// Antes de apuntarlo ya ves cuánto se come: un trozo a rayas en la barra y los
// días de presupuesto que son.
function pintarLoQueSeLleva(gasto = gastoDePantalla()) {
  const r = loQueSeLleva(presupuesto, gastos, gasto);
  const hay = Boolean(r) && (r.trozo > 0 || r.pasaria);
  el.presupuestoEsto.style.left = hay ? `${r.desde * 100}%` : "";
  el.presupuestoEsto.style.width = hay ? `${r.trozo * 100}%` : "0";
  el.presupuestoEsto.classList.toggle("is-pasa", hay && r.pasaria);

  const texto = !hay ? ""
    : r.pasaria ? tr("presupuesto.estoPasa")
    : r.dias === null ? ""
    : r.dias === 1 ? tr("presupuesto.estoUno")
    : tr("presupuesto.esto", { dias: nfDias.format(r.dias) });
  if (el.presupuestoEstoTexto.textContent === texto) return;
  el.presupuestoEstoTexto.textContent = texto;
  el.presupuestoEstoTexto.title = texto ? tr("presupuesto.estoTitulo") : "";
  el.presupuestoEstoTexto.classList.toggle("is-pasa", hay && r.pasaria);
  if (texto) restartAnimation(el.presupuestoEstoTexto, "is-tic");
}

function pintarBotonGasto() {
  const gasto = gastoDePantalla();
  pintarLoQueSeLleva(gasto);
  el.gastosApuntar.disabled = !gasto;
  if (!gasto) {
    el.gastosApuntar.textContent = "+";
    el.gastosApuntar.title = tr("gastos.nada");
    el.gastosApuntar.setAttribute("aria-label", tr("gastos.nada"));
    return;
  }
  const valor = `${nf.format(gasto.valor)} ${gasto.to}`;
  el.gastosApuntar.textContent = tr("gastos.apuntar", { valor });
  el.gastosApuntar.title = comision === 0 ? ""
    : pagoNuevo === "efectivo" ? tr("pago.efectivoNota")
    : tr("gastos.comision", { pct: tr("pct", { n: nfComision.format(comision) }) });
  el.gastosApuntar.setAttribute(
    "aria-label",
    tr("gastos.apuntarAria", { cantidad: nf.format(gasto.cantidad), from: gasto.from, valor }),
  );
}

function crearDiaGastos({ dia, gastos: suyos, totales }, peso, d) {
  const fila = document.createElement("li");
  fila.className = "gastos__dia";
  const nombre = document.createElement("span");
  nombre.textContent = nombreDia(dia);
  const suma = document.createElement("span");
  suma.className = "gastos__dia-suma";
  suma.textContent = textoTotales(totales);
  fila.append(nombre, suma);

  if (peso > 0) {
    const barra = document.createElement("span");
    barra.className = "gastos__barra";
    barra.setAttribute("aria-hidden", "true");
    barra.style.setProperty("--peso", peso);
    barra.classList.toggle("is-maximo", peso === 1);
    // Crece al abrir el panel o si el gasto nuevo es de ese día, no cada vez
    // que se pinta la lista: con cada borrado bailarían todas.
    if (cascadaGastos || suyos.some((g) => g.id === gastoNuevo)) {
      barra.classList.add("is-creciendo");
      barra.style.setProperty("--d", cascadaGastos ? Math.min(d, 8) : 0);
    }
    fila.append(barra);
  }
  return fila;
}

function crearFilaGasto(gasto, i) {
  const fila = document.createElement("li");
  fila.className = "gastos__fila";
  fila.dataset.id = gasto.id;
  if (cascadaGastos || gasto.id === gastoNuevo) {
    fila.classList.add("is-nueva");
    fila.style.setProperty("--i", cascadaGastos ? Math.min(i, 12) : 0);
  }
  const concepto = gasto.concepto || tr("gastos.sinConcepto");
  const valor = `${nf.format(gasto.valor)} ${gasto.to}`;

  const icono = document.createElement("span");
  icono.className = "gastos__icono";
  icono.dataset.categoria = gasto.categoria;
  icono.title = tr(`cat.${gasto.categoria}`);
  icono.innerHTML = iconoCategoria(gasto.categoria);
  const que = document.createElement("button");
  que.type = "button";
  que.className = "gastos__que";
  que.classList.toggle("is-sin", !gasto.concepto);
  que.textContent = concepto;
  que.title = tr("gastos.editar");
  que.setAttribute("aria-label", tr("gastos.editarDe", { concepto }));
  que.addEventListener("click", () => editarConcepto(gasto, que));
  const de = document.createElement("span");
  de.className = "gastos__de";
  de.textContent = `${nf.format(gasto.cantidad)} ${gasto.from}`;
  const cuanto = document.createElement("span");
  cuanto.className = "gastos__valor";
  cuanto.textContent = valor;
  const texto = document.createElement("span");
  texto.className = "gastos__texto";
  texto.setAttribute("aria-label", tr("gastos.fila", { concepto, cantidad: nf.format(gasto.cantidad), from: gasto.from, valor }));
  // El efectivo va como un punto en el icono: en la fila no cabe nada más.
  if (gasto.pago === "efectivo") {
    icono.classList.add("is-efectivo");
    icono.title = `${tr(`cat.${gasto.categoria}`)} · ${tr("pago.efectivo")}`;
  }
  texto.append(icono, que, de, cuanto);

  const quitar = document.createElement("button");
  quitar.type = "button";
  quitar.className = "gastos__quitar";
  quitar.textContent = "✕";
  quitar.setAttribute("aria-label", tr("gastos.quitar", { concepto, valor }));
  quitar.addEventListener("click", () => onQuitarGasto(gasto.id, fila));

  const repetir = document.createElement("button");
  repetir.type = "button";
  repetir.className = "gastos__repetir";
  repetir.innerHTML = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 5.5a3.5 3.5 0 0 1 6-2.4L9.5 4M9.5 1.8V4H7.3M9.5 6.5a3.5 3.5 0 0 1-6 2.4L2.5 8M2.5 10.2V8h2.2"/></svg>';
  repetir.title = tr("gastos.repetir");
  repetir.setAttribute("aria-label", tr("gastos.repetirDe", { concepto, cantidad: `${nf.format(gasto.cantidad)} ${gasto.from}` }));
  repetir.addEventListener("click", () => onRepetirGasto(gasto));

  fila.append(texto, repetir, quitar);
  fila.addEventListener("animationend", (event) => {
    if (event.target === fila) fila.classList.remove("is-nueva");
  });
  return fila;
}

function pintarGastos() {
  const n = gastos.length;
  el.gastosCuenta.hidden = n === 0;
  el.gastosCuenta.textContent = n;
  el.abrirGastos.setAttribute("aria-label", n ? tr("gastos.cuenta", { n }) : tr("gastos"));
  pintarBotonGasto();
  if (el.gastos.hidden) return;

  pintarTituloViaje();
  const suma = n ? textoTotales(sumarPorDivisa(gastos)) : `${nf.format(0)} ${el.to.value}`;
  if (el.gastosSuma.textContent !== suma) {
    const habia = el.gastosSuma.textContent !== "";
    el.gastosSuma.textContent = suma;
    if (habia) restartAnimation(el.gastosSuma, "is-tic");
  }
  el.gastosN.textContent = n === 0 ? "" : n === 1 ? tr("gastos.uno") : tr("gastos.n", { n });
  const media = mediaPorDia(gastos);
  el.gastosMedia.hidden = !media;
  if (media) {
    el.gastosMedia.textContent = tr("gastos.media", { media: `${nf.format(media.media)} ${media.to}` });
    el.gastosMedia.title = tr("gastos.mediaTitulo", { dias: media.dias });
  }

  pintarDesglose();
  const visibles = filtroCategoria ? gastos.filter((g) => g.categoria === filtroCategoria) : gastos;
  let i = 0;
  const dias = gastosPorDia(visibles);
  const pesos = pesoDeLosDias(dias);
  el.gastosLista.replaceChildren(...dias.flatMap((dia, d) => [
    crearDiaGastos(dia, pesos[d], d),
    ...dia.gastos.map((gasto) => crearFilaGasto(gasto, i++)),
  ]));
  cascadaGastos = false;
  gastoNuevo = null;
  pintarPresupuesto();
  el.gastosVacio.hidden = n > 0;
  el.gastosVaciar.hidden = n === 0;
  el.gastosCsv.hidden = n === 0;
  el.gastosCompartir.hidden = n === 0;
}

function pintarPresupuesto() {
  const estado = estadoPresupuesto(presupuesto, gastos);
  el.presupuestoAnadir.hidden = Boolean(estado);
  el.presupuestoVer.hidden = !estado;
  if (!estado) {
    delete el.presupuestoVer.dataset.tono;
    return;
  }
  const dinero = (n) => `${nf.format(n)} ${presupuesto.to}`;
  const partes = estado.queda < 0
    ? [tr("presupuesto.pasado", { pasado: dinero(-estado.queda) })]
    : [tr("presupuesto.queda", { queda: dinero(estado.queda) })];
  if (estado.porDia !== null) partes.push(tr("presupuesto.alDia", { porDia: nf.format(estado.porDia) }));
  el.presupuestoTexto.textContent = partes.join(" · ");
  el.presupuestoVer.title = tr("presupuesto.titulo", {
    gastado: nf.format(estado.gastado), importe: dinero(presupuesto.importe), fecha: fechaLarga(presupuesto.hasta),
  });
  el.presupuestoVer.setAttribute("aria-label", `${el.presupuestoTexto.textContent}. ${el.presupuestoVer.title}`);
  el.presupuestoLleno.style.width = `${Math.min(estado.fraccion, 1) * 100}%`;
  // El temblor solo al pasarte, no cada vez que abres el panel ya pasado.
  const antes = el.presupuestoVer.dataset.tono;
  el.presupuestoVer.dataset.tono = estado.tono;
  if (antes && antes !== "pasado" && estado.tono === "pasado") restartAnimation(el.presupuestoVer, "is-alarma");
  pintarLoQueSeLleva();
}

function editarPresupuesto() {
  noVaciar();
  const to = presupuesto?.to ?? el.to.value;
  el.presupuestoCodigo.textContent = to;
  el.presupuestoImporte.value = presupuesto ? nf.format(presupuesto.importe) : "";
  // Una semana si no hay nada, que es lo que dura un viaje normal.
  const [a, m, d] = hoy().split("-").map(Number);
  el.presupuestoHasta.min = hoy();
  el.presupuestoHasta.value = presupuesto?.hasta ?? isoLocal(new Date(a, m - 1, d + 6));
  el.presupuestoQuitar.hidden = !presupuesto;
  el.presupuestoForm.hidden = false;
  el.presupuesto.hidden = true;
  el.gastosForm.hidden = true;
  restartAnimation(el.presupuestoForm, "is-nuevo");
  el.presupuestoImporte.focus();
  el.presupuestoImporte.select();
}

function dejarDeEditarPresupuesto() {
  if (el.presupuestoForm.hidden) return false;
  el.presupuestoForm.hidden = true;
  el.presupuesto.hidden = false;
  el.gastosForm.hidden = false;
  return true;
}

function ponerPresupuesto(nuevo) {
  presupuesto = nuevo;
  dejarDeEditarPresupuesto();
  pintarPresupuesto();
  (presupuesto ? el.presupuestoVer : el.presupuestoAnadir).focus();
  if (presupuesto) restartAnimation(el.presupuestoVer, "is-nuevo");
  guardarViajes();
}

function onGuardarPresupuesto(event) {
  event.preventDefault();
  const nuevo = leerPresupuesto({
    importe: leerImporte(el.presupuestoImporte.value),
    to: el.presupuestoCodigo.textContent,
    hasta: el.presupuestoHasta.value,
  });
  if (!nuevo) {
    const mal = leerImporte(el.presupuestoImporte.value) > 0 ? el.presupuestoHasta : el.presupuestoImporte;
    restartAnimation(mal, "is-mal");
    mal.focus();
    return;
  }
  ponerPresupuesto(nuevo);
}

// Con más de diez muñecos ya no se cuentan de un vistazo: el resto va en número.
const GENTE_VISIBLE = 10;

function pintarGente() {
  const caben = Math.min(reparto.personas, GENTE_VISIBLE);
  const hay = el.cuentaGente.querySelectorAll(".cuenta__muneco").length;
  for (let i = hay; i < caben; i++) {
    const muneco = document.createElement("span");
    muneco.className = "cuenta__muneco";
    if (hay > 0) muneco.classList.add("is-nuevo");
    muneco.innerHTML = '<svg viewBox="0 0 10 12"><circle cx="5" cy="3" r="2.2"/><path d="M1 11.5a4 4 0 0 1 8 0z"/></svg>';
    const resto = el.cuentaGente.querySelector(".cuenta__mas-gente");
    if (resto) resto.before(muneco);
    else el.cuentaGente.append(muneco);
  }
  [...el.cuentaGente.querySelectorAll(".cuenta__muneco")].slice(caben).forEach((m) => m.remove());
  let resto = el.cuentaGente.querySelector(".cuenta__mas-gente");
  if (reparto.personas > GENTE_VISIBLE) {
    if (!resto) {
      resto = document.createElement("span");
      resto.className = "cuenta__mas-gente";
      el.cuentaGente.append(resto);
    }
    resto.textContent = `+${reparto.personas - GENTE_VISIBLE}`;
  } else {
    resto?.remove();
  }
}

function pintarCuenta() {
  if (el.cuenta.hidden) return;
  const from = el.from.value;
  const to = el.to.value;
  const r = repartirCuenta(cantidadOrigen(), from === to ? null : rate, reparto, comision);
  const solo = reparto.personas === 1;

  el.cuentaEtiqueta.textContent = tr(solo ? "cuenta.conPropina" : "cuenta.cadaUno");
  const cifra = r ? `${nf.format(r.cadaUno)} ${from}` : "—";
  if (el.cuentaCifra.textContent !== cifra) {
    const habia = el.cuentaCifra.textContent !== "—";
    el.cuentaCifra.textContent = cifra;
    if (habia && r) restartAnimation(el.cuentaCifra, "is-tic");
  }
  el.cuentaCifra.title = r && !solo ? tr("cuenta.redondeo") : "";
  el.cuentaTuyo.textContent = r?.cadaUnoTuyo != null ? `≈ ${nf.format(r.cadaUnoTuyo)} ${to}` : "";
  el.cuentaTuyo.title = comision > 0 ? tr("gastos.comision", { pct: tr("pct", { n: nfComision.format(comision) }) }) : "";

  el.cuentaN.textContent = reparto.personas;
  el.cuentaN.setAttribute("aria-label", solo ? tr("cuenta.una") : tr("cuenta.personas", { n: reparto.personas }));
  el.cuentaMenos.disabled = reparto.personas <= 1;
  el.cuentaMas.disabled = reparto.personas >= PERSONAS_MAX;
  pintarGente();

  if (!r) {
    el.cuentaPie.textContent = tr("cuenta.nada");
    el.cuentaPie.classList.add("is-pista");
    return;
  }
  el.cuentaPie.classList.remove("is-pista");
  const total = `${nf.format(r.total)} ${from}`;
  const texto = document.createElement("span");
  texto.textContent = reparto.propina > 0
    ? tr("cuenta.pie", { cuenta: nf.format(r.total - r.propina), propina: nf.format(r.propina), total })
    : tr("cuenta.total", { total });
  const tuyo = document.createElement("span");
  tuyo.className = "cuenta__pie-tuyo";
  if (r.totalTuyo !== null) tuyo.textContent = `${nf.format(r.totalTuyo)} ${to}`;
  el.cuentaPie.replaceChildren(texto, tuyo);
}

function guardarReparto() {
  try {
    chrome.storage.local.set({ [CUENTA_KEY]: reparto });
  } catch (error) {
    console.warn("No se pudo guardar la propina", error);
  }
}

function marcarPropina() {
  for (const boton of el.cuentaPropinas.children) {
    boton.setAttribute("aria-pressed", String(Number(boton.dataset.pct) === reparto.propina));
  }
}

function ponerPropina(pct) {
  reparto = { ...reparto, propina: pct };
  marcarPropina();
  pintarCuenta();
  guardarReparto();
}

function cambiarPersonas(paso) {
  const personas = Math.min(Math.max(reparto.personas + paso, 1), PERSONAS_MAX);
  if (personas === reparto.personas) return;
  reparto = { ...reparto, personas };
  pintarCuenta();
  restartAnimation(el.cuentaN, paso > 0 ? "is-sube" : "is-baja");
  guardarReparto();
}

function onCampoPropina() {
  const pct = leerPorcentaje(el.cuentaCampo.value, PROPINA_MAX);
  el.cuentaCampo.removeAttribute("aria-invalid");
  if (pct !== null) ponerPropina(pct);
}

function onTeclaCampoPropina(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  if (el.cuentaCampo.value.trim() !== "" && leerPorcentaje(el.cuentaCampo.value, PROPINA_MAX) === null) {
    el.cuentaCampo.setAttribute("aria-invalid", "true");
    restartAnimation(el.cuentaCampo, "is-mal");
  }
}

function abrirCuenta() {
  cerrarBurbuja();
  cerrarHistorial();
  cerrarGastos();
  el.cuenta.style.setProperty("--gastos-arriba", `${el.resultBox.offsetTop}px`);
  el.cuentaPropinas.replaceChildren(...PROPINAS_RAPIDAS.map((pct, i) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "burbuja__rapida";
    boton.style.setProperty("--i", i);
    boton.dataset.pct = pct;
    boton.textContent = pct === 0 ? tr("cuenta.sin") : tr("pct", { n: pct });
    boton.setAttribute("aria-label", pct === 0 ? tr("cuenta.sinAria") : tr("pct", { n: pct }));
    boton.addEventListener("click", () => {
      el.cuentaCampo.value = "";
      el.cuentaCampo.removeAttribute("aria-invalid");
      ponerPropina(pct);
    });
    return boton;
  }));
  marcarPropina();
  const rapida = PROPINAS_RAPIDAS.includes(reparto.propina);
  el.cuentaCampo.value = rapida ? "" : nfComision.format(reparto.propina);
  el.cuentaCampo.removeAttribute("aria-invalid");
  el.cuentaGente.replaceChildren();
  el.cuentaCifra.textContent = "—";
  el.cuenta.hidden = false;
  el.abrirCuenta.setAttribute("aria-expanded", "true");
  pintarCuenta();
  (el.cuentaPropinas.querySelector('[aria-pressed="true"]') ?? el.cuentaCampo).focus();
}

function cerrarCuenta() {
  if (el.cuenta.hidden) return;
  el.cuenta.hidden = true;
  el.abrirCuenta.setAttribute("aria-expanded", "false");
  return el.abrirCuenta;
}

// Con un solo viaje sin nombre, el título de siempre; en la lista, "Mi viaje".
const nombreViaje = (viaje) => viaje.nombre || tr("viajes.sinNombre");

function pintarTituloViaje() {
  const viaje = viajeActivo(viajes);
  el.gastosTitulo.textContent = viaje.nombre || tr(viajes.lista.length > 1 ? "viajes.sinNombre" : "gastos");
}

let borrarViajeId = null;

function crearFilaViaje(viaje, i) {
  const fila = document.createElement("li");
  fila.className = "viajes__fila";
  fila.dataset.id = viaje.id;
  fila.style.setProperty("--i", i);
  const activo = viaje.id === viajes.activo;
  fila.classList.toggle("is-activo", activo);

  const elegir = document.createElement("button");
  elegir.type = "button";
  elegir.className = "viajes__elegir";
  if (activo) elegir.setAttribute("aria-current", "true");
  const { n, total } = resumenViaje(viaje);
  const nombre = document.createElement("span");
  nombre.className = "viajes__nombre";
  nombre.textContent = nombreViaje(viaje);
  const meta = document.createElement("span");
  meta.className = "viajes__meta";
  meta.textContent = n === 0
    ? tr("viajes.vacio")
    : `${n === 1 ? tr("gastos.uno") : tr("gastos.n", { n })} · ${nf.format(total.total)} ${total.to}`;
  elegir.append(nombre, meta);
  elegir.addEventListener("click", () => onElegirViaje(viaje.id));

  const renombrar = document.createElement("button");
  renombrar.type = "button";
  renombrar.className = "viajes__accion";
  renombrar.innerHTML = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 10l.6-2.4L8.2 2a1 1 0 0 1 1.4 0l.4.4a1 1 0 0 1 0 1.4L4.4 9.4z"/></svg>';
  renombrar.setAttribute("aria-label", tr("viajes.renombrar", { nombre: nombreViaje(viaje) }));
  renombrar.title = renombrar.getAttribute("aria-label");
  renombrar.addEventListener("click", () => empezarRenombrar(fila, viaje));

  fila.append(elegir, renombrar);
  if (viajes.lista.length > 1) {
    const borrar = document.createElement("button");
    borrar.type = "button";
    borrar.className = "viajes__accion viajes__borrar";
    borrar.textContent = "✕";
    borrar.setAttribute("aria-label", tr("viajes.borrar", { nombre: nombreViaje(viaje) }));
    borrar.addEventListener("click", () => onBorrarViaje(viaje, borrar));
    fila.append(borrar);
  }
  return fila;
}

function pintarViajes() {
  el.viajesLista.replaceChildren(...viajes.lista.map(crearFilaViaje));
  const lleno = viajes.lista.length >= VIAJES_MAX;
  el.viajesNuevo.hidden = lleno;
  el.viajesLleno.hidden = !lleno;
  el.viajesLleno.textContent = tr("viajes.lleno", { n: VIAJES_MAX });
}

function abrirViajes() {
  cerrarCategorias();
  dejarDeEditarPresupuesto();
  noVaciar();
  pintarViajes();
  el.viajesNombre.value = "";
  // Justo debajo del total, que es lo que no quiero tapar.
  const arriba = el.gastosSuma.getBoundingClientRect().bottom - el.gastos.getBoundingClientRect().top;
  el.viajes.style.setProperty("--viajes-arriba", `${Math.round(arriba) + 4}px`);
  el.viajes.hidden = false;
  el.viaje.setAttribute("aria-expanded", "true");
  el.viajesLista.querySelector(".is-activo .viajes__elegir")?.focus();
}

function cerrarViajes() {
  if (el.viajes.hidden) return false;
  el.viajes.hidden = true;
  el.viaje.setAttribute("aria-expanded", "false");
  noBorrarViaje();
  return true;
}

// Al cambiar de viaje, lo que estabas a medias del otro se queda allí: el
// deshacer, el filtro de categoría y el presupuesto que editabas.
function ponerViaje(nuevos) {
  viajes = nuevos;
  ({ gastos, presupuesto } = viajeActivo(viajes));
  quitado = null;
  el.deshacer.hidden = true;
  filtroCategoria = null;
  dejarDeEditarPresupuesto();
  delete el.presupuestoVer.dataset.tono;
  cascadaGastos = true;
  pintarGastos();
  restartAnimation(el.gastosTitulo, "is-cambiado");
  guardarViajes();
}

function onElegirViaje(id) {
  cerrarViajes();
  if (id !== viajes.activo) ponerViaje(elegirViaje(viajes, id));
  el.gastosConcepto.focus();
}

function onCrearViaje(event) {
  event.preventDefault();
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const nuevos = crearViaje(viajes, id, el.viajesNombre.value);
  if (nuevos === viajes) {
    restartAnimation(el.viajesNombre, "is-mal");
    el.viajesNombre.focus();
    return;
  }
  cerrarViajes();
  ponerViaje(nuevos);
  restartAnimation(el.viaje, "is-estreno");
  el.gastosConcepto.focus();
}

function empezarRenombrar(fila, viaje) {
  noBorrarViaje();
  const campo = document.createElement("input");
  campo.type = "text";
  campo.className = "gastos__concepto viajes__campo";
  campo.maxLength = NOMBRE_VIAJE_MAX;
  campo.value = viaje.nombre;
  campo.placeholder = tr("viajes.sinNombre");
  campo.setAttribute("aria-label", tr("viajes.nombre"));
  let hecho = false;
  const acabar = (guardar) => {
    if (hecho) return;
    hecho = true;
    if (guardar && campo.value.trim() && campo.value.trim() !== viaje.nombre) {
      viajes = renombrarViaje(viajes, viaje.id, campo.value);
      pintarTituloViaje();
      guardarViajes();
    }
    pintarViajes();
    const nueva = el.viajesLista.querySelector(`[data-id="${viaje.id}"]`);
    if (guardar) restartAnimation(nueva, "is-renombrado");
    nueva?.querySelector(".viajes__accion")?.focus();
  };
  campo.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      acabar(true);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      acabar(false);
    }
  });
  campo.addEventListener("blur", () => acabar(true));
  fila.replaceChildren(campo);
  campo.focus();
  campo.select();
}

function noBorrarViaje() {
  clearTimeout(borrarViajeId);
  for (const boton of el.viajesLista.querySelectorAll(".viajes__borrar.is-seguro")) {
    boton.classList.remove("is-seguro");
    boton.textContent = "✕";
  }
}

// Como "Vaciar": un viaje entero no se va de un clic sin querer.
function onBorrarViaje(viaje, boton) {
  if (!boton.classList.contains("is-seguro")) {
    noBorrarViaje();
    boton.classList.add("is-seguro");
    boton.textContent = tr("viajes.seguro");
    boton.setAttribute("aria-label", tr("viajes.seguroAria", { nombre: nombreViaje(viaje) }));
    borrarViajeId = setTimeout(noBorrarViaje, 3000);
    return;
  }
  noBorrarViaje();
  const nuevos = borrarViaje(viajes, viaje.id);
  const fila = boton.closest(".viajes__fila");
  const acabar = () => {
    if (nuevos.activo !== viajes.activo) ponerViaje(nuevos);
    else {
      viajes = nuevos;
      pintarTituloViaje();
      guardarViajes();
    }
    pintarViajes();
    el.viajesLista.querySelector(".is-activo .viajes__elegir")?.focus();
  };
  if (sinMovimiento.matches) return acabar();
  fila.classList.add("is-saliendo");
  fila.addEventListener("animationend", acabar, { once: true });
}

// El viaje entero, aunque estés mirando una sola categoría: es lo que se manda.
async function onCompartir() {
  const viaje = viajeActivo(cambiarViaje(viajes, viajes.activo, { gastos, presupuesto }));
  const texto = resumenParaCompartir({ ...viaje, nombre: viaje.nombre || tr("gastos") });
  const bien = await copiar(texto);
  const boton = el.gastosCompartir;
  boton.classList.toggle("is-fallo", !bien);
  restartAnimation(boton, "is-hecho");
  clearTimeout(boton.vuelta);
  boton.vuelta = setTimeout(() => boton.classList.remove("is-hecho", "is-fallo"), 1600);
  mostrarFlash([tr(bien ? "compartir.flash" : "compartir.fallo")], 2200);
}

function abrirGastos() {
  cerrarBurbuja();
  cerrarHistorial();
  cerrarCuenta();
  el.gastos.style.setProperty("--gastos-arriba", `${el.resultBox.offsetTop}px`);
  el.gastos.hidden = false;
  el.abrirGastos.setAttribute("aria-expanded", "true");
  cascadaGastos = true;
  el.gastosSuma.textContent = "";
  pintarGastos();
  el.gastosConcepto.focus();
}

function cerrarGastos() {
  if (el.gastos.hidden) return;
  cerrarViajes();
  dejarDeEditarPresupuesto();
  cerrarCategorias();
  el.gastos.hidden = true;
  el.abrirGastos.setAttribute("aria-expanded", "false");
  noVaciar();
  quitado = null;
  el.deshacer.hidden = true;
  return el.abrirGastos;
}

function onApuntarGasto(event) {
  event.preventDefault();
  const gasto = gastoDePantalla();
  if (!gasto) {
    restartAnimation(el.gastosApuntar, "is-mal");
    return;
  }
  gastos = apuntarGasto(gastos, gasto);
  gastoNuevo = gasto.id;
  el.gastosConcepto.value = "";
  pintarSugerencia(null);
  categoriaNueva = CATEGORIA_POR_DEFECTO;
  categoriaAMano = false;
  // Si estabas mirando otra categoría, el que acabas de apuntar no se vería.
  if (filtroCategoria && filtroCategoria !== gasto.categoria) filtroCategoria = null;
  pintarCategoriaNueva();
  guardarViajes();
  pintarGastos();
  restartAnimation(el.abrirGastos, "is-apuntado");
  el.gastosLista.scrollTop = 0;
  el.gastosConcepto.focus();
}

// La tasa de hoy solo si es de ese par: con la pantalla en otro, la que tengo
// a mano no sirve y se queda con la que tuvo.
function tasaDeHoy(from, to) {
  if (rate !== null && el.from.value === from && el.to.value === to) return rate;
  return tasasBase?.de === from ? tasasBase.rates[to] ?? null : null;
}

function onRepetirGasto(original) {
  const gasto = repetirGasto(original, {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    cuando: Date.now(),
    tasa: tasaDeHoy(original.from, original.to),
    comision,
  });
  if (!gasto) return;
  gastos = apuntarGasto(gastos, gasto);
  gastoNuevo = gasto.id;
  if (filtroCategoria && filtroCategoria !== gasto.categoria) filtroCategoria = null;
  guardarViajes();
  pintarGastos();
  restartAnimation(el.abrirGastos, "is-apuntado");
  el.gastosLista.scrollTop = 0;
}

function editarConcepto(gasto, que) {
  const campo = document.createElement("input");
  campo.type = "text";
  campo.className = "gastos__editar";
  campo.maxLength = CONCEPTO_MAX;
  campo.value = gasto.concepto;
  campo.placeholder = tr("gastos.sinConcepto");
  campo.setAttribute("aria-label", tr("gastos.concepto"));
  let hecho = false;
  const acabar = (guardar) => {
    if (hecho) return;
    hecho = true;
    const nuevos = guardar ? cambiarConcepto(gastos, gasto.id, campo.value) : gastos;
    const cambia = nuevos !== gastos;
    if (cambia) {
      gastos = nuevos;
      guardarViajes();
    }
    pintarGastos();
    const otro = el.gastosLista.querySelector(`[data-id="${gasto.id}"] .gastos__que`);
    if (cambia) restartAnimation(otro, "is-cambiado");
    otro?.focus();
  };
  campo.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      acabar(true);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      acabar(false);
    }
  });
  campo.addEventListener("blur", () => acabar(true));
  que.replaceWith(campo);
  campo.focus();
  campo.select();
}

function onQuitarGasto(id, fila) {
  const quitar = () => {
    const indice = gastos.findIndex((g) => g.id === id);
    if (indice === -1) return;
    const gasto = gastos[indice];
    gastos = quitarGasto(gastos, id);
    guardarViajes();
    pintarGastos();
    ofrecerDeshacer({ gasto, indice });
    (el.gastosLista.querySelector(".gastos__quitar") ?? el.gastosConcepto).focus();
  };
  if (sinMovimiento.matches) return quitar();
  fila.classList.remove("is-nueva");
  fila.classList.add("is-saliendo");
  fila.addEventListener("animationend", quitar, { once: true });
}

// Se quita de verdad en el momento y deshacer lo vuelve a meter. Así, si
// cierras el popup con el aviso puesto, el gasto se queda quitado, que es lo
// que habías pedido. El tiempo lo lleva la barra del CSS, que se para al
// pasar el ratón por encima.
function ofrecerDeshacer(nuevo) {
  quitado = nuevo;
  if (nuevo.todos) {
    const n = nuevo.todos.length;
    el.deshacerTexto.textContent = tr("gastos.vaciados", { n: n === 1 ? tr("gastos.uno") : tr("gastos.n", { n }) });
  } else {
    const { gasto } = nuevo;
    const concepto = gasto.concepto || tr("gastos.sinConcepto");
    el.deshacerTexto.textContent = tr("gastos.quitado", { concepto, valor: `${nf.format(gasto.valor)} ${gasto.to}` });
  }
  el.deshacer.classList.remove("is-saliendo");
  const yaEstaba = !el.deshacer.hidden;
  el.deshacer.hidden = false;
  restartAnimation(el.deshacer, yaEstaba ? "is-otra" : "is-nuevo");
  restartAnimation(el.deshacerTiempo);
}

function olvidarDeshacer() {
  quitado = null;
  if (el.deshacer.hidden || el.deshacer.classList.contains("is-saliendo")) return;
  if (sinMovimiento.matches) {
    el.deshacer.hidden = true;
    return;
  }
  el.deshacer.classList.add("is-saliendo");
}

function onDeshacer() {
  if (!quitado) return;
  if (quitado.todos) {
    gastos = devolverTodos(gastos, quitado.todos);
    filtroCategoria = null;
    cascadaGastos = true;
    olvidarDeshacer();
    guardarViajes();
    pintarGastos();
    el.gastosConcepto.focus();
    return;
  }
  const { gasto, indice } = quitado;
  gastos = devolverGasto(gastos, gasto, indice);
  gastoNuevo = gasto.id;
  if (filtroCategoria && filtroCategoria !== gasto.categoria) filtroCategoria = null;
  olvidarDeshacer();
  guardarViajes();
  pintarGastos();
  (el.gastosLista.querySelector(`[data-id="${gasto.id}"] .gastos__quitar`) ?? el.gastosConcepto).focus();
}

function noVaciar() {
  clearTimeout(vaciarId);
  el.gastosVaciar.classList.remove("is-seguro");
  el.gastosVaciar.textContent = tr("gastos.vaciar");
}

// Un viaje entero no se borra de un clic sin querer: el primero pregunta y el
// segundo, si llega en tres segundos, vacía. Y aun así se puede deshacer.
function onVaciarGastos() {
  if (!el.gastosVaciar.classList.contains("is-seguro")) {
    el.gastosVaciar.classList.add("is-seguro");
    el.gastosVaciar.textContent = tr("gastos.seguro");
    restartAnimation(el.gastosVaciar, "is-seguro");
    clearTimeout(vaciarId);
    vaciarId = setTimeout(noVaciar, 3000);
    return;
  }
  noVaciar();
  const filas = [...el.gastosLista.children];
  const todos = gastos;
  const vaciar = () => {
    gastos = [];
    guardarViajes();
    pintarGastos();
    if (todos.length) ofrecerDeshacer({ todos });
    el.gastosConcepto.focus();
  };
  if (sinMovimiento.matches || filas.length === 0) return vaciar();
  filas.forEach((fila, i) => {
    fila.style.setProperty("--i", Math.min(i, 12));
    fila.classList.remove("is-nueva");
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
  else if (accion === "copiarFrase") onCopiar(true);
  else if (accion === "origen") el.from.click();
  else if (accion === "destino") el.to.click();
  else if (accion === "ayuda") abrirAyuda();
  else if (accion === "gastos") (el.gastos.hidden ? abrirGastos() : cerrarGastos()?.focus());
  else if (accion === "cuenta") (el.cuenta.hidden ? abrirCuenta() : cerrarCuenta()?.focus());
  else if (accion === "deshacer") onDeshacer();
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
    ctrlKey: event.ctrlKey, metaKey: event.metaKey, shiftKey: event.shiftKey, enCampo,
  });
  // Sin nada que deshacer la Z no hace nada, ni siquiera el aviso de abajo.
  if (!accion || (accion === "deshacer" && !quitado)) return;
  event.preventDefault();
  hacerAtajo(accion);
  if (accion !== "ayuda") {
    const conCmd = event.metaKey || event.ctrlKey;
    const tecla = conCmd ? (esMac ? "⌘Z" : "Ctrl+Z")
      : event.altKey ? textoAtajo(event.code, esMac) : event.code.replace(/^Key|^Digit/, "");
    const prefijo = accion === "copiarFrase" ? (esMac ? "⇧" : "Shift+") : "";
    mostrarTecla(prefijo + tecla, queHace(accion));
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
  pintarAtajoSeleccion();
}

// El de convertir lo seleccionado es de Chrome y lo puedes cambiar: lo pido en
// vez de escribirlo a mano, que si no la ayuda diría uno que ya no vale.
async function pintarAtajoSeleccion() {
  let tecla = "";
  try {
    const comandos = await chrome.commands.getAll();
    tecla = comandos.find((c) => c.name === "convertir-seleccion")?.shortcut ?? "";
  } catch (error) {
    console.warn("No se pudieron leer los atajos de Chrome", error);
    return;
  }
  const kbd = document.createElement("kbd");
  kbd.textContent = tecla;
  const [antes, despues] = tr("ayuda.seleccion").split("{tecla}");
  el.ayudaNota.append(document.createElement("br"), ...(tecla ? [antes, kbd, despues] : [tr("ayuda.sinTecla")]));
}

function abrirAyuda() {
  focoAntesDeAyuda = document.activeElement;
  cerrarBandeja();
  cerrarBurbuja();
  cerrarHistorial();
  cerrarGastos();
  cerrarCuenta();
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
  el.abrirGastos.title = `${tr("gastos")} (${pista("gastos")})`;
  el.abrirCuenta.title = `${tr("cuenta")} (${pista("cuenta")})`;
  el.deshacerBoton.title = `${tr("gastos.deshacer")} (${pista("deshacer")})`;
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
  el.rateLine.textContent = lineaTasa(rate, from, to, tasaAlReves);
}

function onDarLaVueltaATasa() {
  tasaAlReves = !tasaAlReves;
  renderRateLine(el.from.value, el.to.value);
  restartAnimation(el.rateLine, "is-vuelta");
  guardarTasaAlReves();
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
  pintarTimo();
  pintarCuenta();

  if (valor === null) {
    pintarBotonGasto();
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
  pintarBotonGasto();

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
    pintarTimo();
    pintarCuenta();
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

// Pegar "1.299,00 £" pone el 1299 y las libras de una vez. Si no es un precio
// con su divisa, el navegador pega lo que sea como siempre.
function onPegar(event) {
  const campo = event.currentTarget;
  const lado = campo === el.result ? "result" : "amount";
  const antes = { from: el.from.value, to: el.to.value };
  const pegado = leerPegado(event.clipboardData?.getData("text") ?? "", lado, antes);
  if (!pegado) return;
  event.preventDefault();

  const cambia = pegado.from !== antes.from || pegado.to !== antes.to;
  const vuelta = pegado.from === antes.to && pegado.to === antes.from;
  // Con la vuelta la tasa vale al revés; con otra divisa no vale de nada y
  // prefiero no enseñar un resultado con la tasa vieja mientras llega la nueva.
  if (vuelta && rate) rate = 1 / rate;
  else if (cambia) rate = null;

  buscadores.from.poner(pegado.from);
  buscadores.to.poner(pegado.to);
  campo.value = nf.format(pegado.cantidad);
  if (lado === "result") onResultInput();
  else onAmountInput();
  restartAnimation(campo, "is-cambiado");
  marcarTocado();

  const divisa = lado === "result" ? pegado.to : pegado.from;
  soltarEtiqueta(campo, divisa);
  if (cambia) {
    restartAnimation(lado === "result" ? el.to : el.from, "is-cambiado");
    if (vuelta) restartAnimation(el.swap, "is-swapping");
    onCurrencyChange();
  }
}

// La etiqueta con la divisa que he leído, que sube y se va.
function soltarEtiqueta(campo, divisa) {
  campo.parentElement.querySelector(".pegado")?.remove();
  const etiqueta = document.createElement("span");
  etiqueta.className = "pegado";
  etiqueta.setAttribute("aria-hidden", "true");
  etiqueta.textContent = divisa;
  campo.parentElement.appendChild(etiqueta);
  etiqueta.addEventListener("animationend", () => etiqueta.remove());
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

async function onCopiar(entera = false) {
  const valor = leerImporte(el.result.value);
  if (valor === null || rate === null) return;
  // Si lo copias es que era esa: la apunto ya, sin esperar.
  tocado = true;
  apuntarAhora();
  const frase = entera ? fraseParaCopiar({ cantidad: leerImporte(el.amount.value), from: el.from.value, valor, to: el.to.value }) : "";
  if (entera && !frase) return;
  const bien = await copiar(frase || textoParaCopiar(valor));
  avisar(tr(!bien ? "copiar.fallo" : frase ? "copiado.frase" : "copiado"));
  if (bien && frase) soltarFrase(frase);
}

// La frase sube desde el botón para que veas qué se ha llevado el portapapeles.
function soltarFrase(frase) {
  el.copiar.parentElement.querySelector(".copiar__frase")?.remove();
  const globo = document.createElement("span");
  globo.className = "copiar__frase";
  globo.setAttribute("aria-hidden", "true");
  globo.textContent = frase;
  el.copiar.parentElement.appendChild(globo);
  globo.addEventListener("animationend", () => globo.remove());
}

// Con Shift pulsado el botón ya dice lo que va a copiar, antes de hacer clic.
let conShift = false;
const etiquetaCopiar = () => tr(conShift ? "copiar.frase" : "copiar");

function onShift(event) {
  const ahora = event.type === "blur" ? false : event.shiftKey;
  if (ahora === conShift) return;
  conShift = ahora;
  el.copiar.classList.toggle("is-frase", conShift);
  if (!el.copiar.classList.contains("is-hecho")) el.copiarTexto.textContent = etiquetaCopiar();
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
    el.copiarTexto.textContent = etiquetaCopiar();
    el.copiar.classList.remove("is-hecho");
  }, 1400);
}

const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)");

// La chincheta va fuera del botón y no dentro: un botón no puede llevar otro.
function crearPastilla(par) {
  const caja = document.createElement("span");
  caja.className = "reciente-caja";
  caja.dataset.par = `${par.from}${par.to}`;
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "reciente is-nueva";
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

  const fijar = document.createElement("button");
  fijar.type = "button";
  fijar.className = "reciente__fijar";
  fijar.innerHTML = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 1.5h3M5 1.5v3L3 7h6L7 4.5v-3M6 7v3.5"/></svg>';
  fijar.addEventListener("click", () => onFijar(par.from, par.to));
  caja.append(boton, fijar);
  return caja;
}

function pintarFijo(caja, par) {
  caja.classList.toggle("is-fija", Boolean(par.fijo));
  const fijar = caja.querySelector(".reciente__fijar");
  const datos = { de: par.from, a: par.to };
  fijar.title = tr(par.fijo ? "reciente.soltar" : "reciente.fijar", datos);
  fijar.setAttribute("aria-label", fijar.title);
  fijar.setAttribute("aria-pressed", String(Boolean(par.fijo)));
}

function onFijar(from, to) {
  const nuevos = fijarReciente(recientes, from, to);
  const caja = () => el.recientes.querySelector(`[data-par="${from}${to}"]`);
  if (nuevos === recientes) {
    restartAnimation(caja(), "is-mal");
    mostrarFlash([tr("reciente.lleno", { n: FIJOS_MAX })], 2200);
    return;
  }
  recientes = nuevos;
  guardarRecientes();
  pintarRecientes();
  const fijar = caja()?.querySelector(".reciente__fijar");
  fijar?.focus();
  if (caja()?.classList.contains("is-fija")) restartAnimation(fijar, "is-clavada");
}

function pintarRecientes() {
  const visibles = recientesVisibles(recientes, el.from.value, el.to.value);

  const antes = new Map();
  for (const p of el.recientes.children) antes.set(p.dataset.par, p.getBoundingClientRect());

  const pastillas = visibles.map((par, i) => {
    const vieja = el.recientes.querySelector(`[data-par="${par.from}${par.to}"]`);
    const pastilla = vieja ?? crearPastilla(par);
    pastilla.style.setProperty("--i", i);
    pintarFijo(pastilla, par);
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
  el.amount.addEventListener("paste", onPegar);
  el.result.addEventListener("paste", onPegar);
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
  el.copiar.addEventListener("click", (event) => onCopiar(event.shiftKey));
  document.addEventListener("keydown", onShift);
  document.addEventListener("keyup", onShift);
  window.addEventListener("blur", onShift);
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
  el.abrirCopia.addEventListener("click", () => chrome.runtime.openOptionsPage());
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
  el.historialCsv.addEventListener("click", () => descargarCsv(csvHistorial(historial), tr("csv.archivoHistorial"), el.historialCsv));
  el.gastosCompartir.addEventListener("click", onCompartir);
  el.gastosCsv.addEventListener("click", () => descargarCsv(csvGastos(gastos), archivoGastos(viajeActivo(viajes).nombre), el.gastosCsv));
  el.abrirGastos.addEventListener("click", () => (el.gastos.hidden ? abrirGastos() : cerrarGastos()));
  el.abrirGastos.addEventListener("animationend", () => el.abrirGastos.classList.remove("is-apuntado"));
  el.gastosForm.addEventListener("submit", onApuntarGasto);
  el.gastosConcepto.addEventListener("input", onConceptoGasto);
  el.gastosConcepto.addEventListener("keydown", onTeclaConcepto);
  // Mover el cursor no lanza input, y la sugerencia solo vale con él al final.
  el.gastosConcepto.addEventListener("keyup", (event) => {
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) pintarSugerencia(sugerenciaConcepto());
  });
  el.gastosConcepto.addEventListener("click", () => pintarSugerencia(sugerenciaConcepto()));
  el.gastosCategoria.addEventListener("click", () => (el.categorias.hidden ? abrirCategorias() : cerrarCategorias()));
  el.gastosPago.addEventListener("click", onCambiarPago);
  el.gastosCategoria.addEventListener("animationend", () => el.gastosCategoria.classList.remove("is-cambiada"));
  el.gastosVaciar.addEventListener("click", onVaciarGastos);
  el.deshacerBoton.addEventListener("click", onDeshacer);
  el.deshacerTiempo.addEventListener("animationend", olvidarDeshacer);
  el.deshacer.addEventListener("animationend", (event) => {
    if (event.target === el.deshacer && el.deshacer.classList.contains("is-saliendo")) {
      el.deshacer.classList.remove("is-saliendo");
      el.deshacer.hidden = true;
    }
  });
  el.gastosSuma.addEventListener("animationend", () => el.gastosSuma.classList.remove("is-tic"));
  el.gastosApuntar.addEventListener("animationend", () => el.gastosApuntar.classList.remove("is-mal"));
  el.gastosCerrar.addEventListener("click", () => cerrarGastos()?.focus());
  el.viaje.addEventListener("click", () => (el.viajes.hidden ? abrirViajes() : cerrarViajes()));
  el.viaje.addEventListener("animationend", () => el.viaje.classList.remove("is-estreno"));
  el.gastosTitulo.addEventListener("animationend", () => el.gastosTitulo.classList.remove("is-cambiado"));
  el.viajesNuevo.addEventListener("submit", onCrearViaje);
  el.viajesNombre.addEventListener("animationend", () => el.viajesNombre.classList.remove("is-mal"));
  el.viajesLista.addEventListener("animationend", (event) => event.target.classList.remove("is-renombrado"));
  el.abrirCuenta.addEventListener("click", () => (el.cuenta.hidden ? abrirCuenta() : cerrarCuenta()));
  el.cuentaCerrar.addEventListener("click", () => cerrarCuenta()?.focus());
  el.cuentaCampo.addEventListener("input", onCampoPropina);
  el.cuentaCampo.addEventListener("keydown", onTeclaCampoPropina);
  el.cuentaCampo.addEventListener("animationend", () => el.cuentaCampo.classList.remove("is-mal"));
  el.cuentaMenos.addEventListener("click", () => cambiarPersonas(-1));
  el.cuentaMas.addEventListener("click", () => cambiarPersonas(1));
  el.cuentaCifra.addEventListener("animationend", () => el.cuentaCifra.classList.remove("is-tic"));
  el.cuentaN.addEventListener("animationend", () => el.cuentaN.classList.remove("is-sube", "is-baja"));
  el.cuentaGente.addEventListener("animationend", (event) => event.target.classList.remove("is-nuevo"));
  el.rateLine.addEventListener("click", onDarLaVueltaATasa);
  el.presupuestoAnadir.addEventListener("click", editarPresupuesto);
  el.presupuestoVer.addEventListener("click", editarPresupuesto);
  el.presupuestoForm.addEventListener("submit", onGuardarPresupuesto);
  el.presupuestoQuitar.addEventListener("click", () => ponerPresupuesto(null));
  el.presupuestoVer.addEventListener("animationend", () => el.presupuestoVer.classList.remove("is-nuevo", "is-alarma"));
  el.presupuestoForm.addEventListener("animationend", (event) => {
    event.target.classList.remove("is-nuevo", "is-mal");
  });
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
  el.timoCampo.addEventListener("input", pintarTimo);
  el.timoOferta.addEventListener("animationend", () => el.timoOferta.classList.remove("is-girada"));
  el.timoVeredicto.addEventListener("animationend", () => el.timoVeredicto.classList.remove("is-nuevo", "is-alarma"));
  el.timoPerdida.addEventListener("animationend", () => el.timoPerdida.classList.remove("is-tic"));
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
    if (event.key === "Escape" && !el.cuenta.hidden) {
      event.preventDefault();
      cerrarCuenta()?.focus();
    }
    if (event.key === "Escape" && !el.gastos.hidden) {
      event.preventDefault();
      // Primero se cierra lo de dentro (categorías, presupuesto), y con otro Escape el panel.
      if (cerrarViajes()) el.viaje.focus();
      else if (cerrarCategorias()) el.gastosCategoria.focus();
      else if (dejarDeEditarPresupuesto()) el.presupuestoVer.hidden ? el.presupuestoAnadir.focus() : el.presupuestoVer.focus();
      else cerrarGastos()?.focus();
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
    if (!el.gastos.hidden && !el.gastos.contains(event.target) && !el.abrirGastos.contains(event.target)) {
      cerrarGastos();
    }
    // Arriba se puede tocar la cantidad sin que se cierre: es la cuenta que reparto.
    if (!el.cuenta.hidden && !el.cuenta.contains(event.target) && !el.abrirCuenta.contains(event.target)
      && !el.form.contains(event.target)) {
      cerrarCuenta();
    }
    if (!el.viajes.hidden && !el.viajes.contains(event.target) && !el.viaje.contains(event.target)) {
      cerrarViajes();
    }
    if (!el.categorias.hidden && !el.categorias.contains(event.target) && !el.gastosCategoria.contains(event.target)) {
      cerrarCategorias();
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
  const [pair, rango, guardados, pendiente, guardadas, vistaGuardada, avisosGuardados, comisionGuardada, fechaGuardada, historialGuardado, viajesGuardados, repartoGuardado, alRevesGuardado, pagoGuardado] = await Promise.all([
    loadPair(), cargarRango(), cargarRecientes(), tomarPendiente(), cargarExtras(), cargarVista(), cargarAvisos(),
    cargarComision(), cargarFecha(), cargarHistorial(), cargarViajes(), cargarReparto(), cargarTasaAlReves(), cargarPago(),
  ]);
  pagoNuevo = pagoGuardado;
  pintarPago();
  tasaAlReves = alRevesGuardado;
  reparto = repartoGuardado;
  historial = historialGuardado;
  pintarHistorial();
  viajes = viajesGuardados;
  ({ gastos, presupuesto } = viajeActivo(viajes));
  pintarCategoriaNueva();
  pintarGastos();
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
