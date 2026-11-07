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
  cambioDia: document.getElementById("cambio-dia"),
  tasaVieja: document.getElementById("tasa-vieja"),
  tasaViejaTexto: document.getElementById("tasa-vieja-texto"),
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
  avisoModo: document.getElementById("aviso-modo"),
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
  comparar: document.getElementById("comparar"),
  abrirComparar: document.getElementById("abrir-comparar"),
  compararCerrar: document.getElementById("comparar-cerrar"),
  compararBrazo: document.getElementById("comparar-brazo"),
  compararPlatoAlli: document.getElementById("comparar-plato-alli"),
  compararPlatoAqui: document.getElementById("comparar-plato-aqui"),
  compararLadoAlli: document.getElementById("comparar-lado-alli"),
  compararLadoAqui: document.getElementById("comparar-lado-aqui"),
  compararAlli: document.getElementById("comparar-alli"),
  compararAlliNota: document.getElementById("comparar-alli-nota"),
  compararCampo: document.getElementById("comparar-campo"),
  compararCodigo: document.getElementById("comparar-codigo"),
  compararVeredicto: document.getElementById("comparar-veredicto"),
  cuentaCerrar: document.getElementById("cuenta-cerrar"),
  cuentaCompartir: document.getElementById("cuenta-compartir"),
  cuentaEtiqueta: document.getElementById("cuenta-etiqueta"),
  cuentaCifra: document.getElementById("cuenta-cifra"),
  cuentaTuyo: document.getElementById("cuenta-tuyo"),
  cuentaRedondear: document.getElementById("cuenta-redondear"),
  cuentaPropinas: document.getElementById("cuenta-propinas"),
  cuentaCampo: document.getElementById("cuenta-campo"),
  cuentaHabitual: document.getElementById("cuenta-habitual"),
  cuentaMenos: document.getElementById("cuenta-menos"),
  cuentaMas: document.getElementById("cuenta-mas"),
  cuentaN: document.getElementById("cuenta-n"),
  cuentaGente: document.getElementById("cuenta-gente"),
  cuentaPie: document.getElementById("cuenta-pie"),
  cuentaJusto: document.getElementById("cuenta-justo"),
  cuentaJustoBilletes: document.getElementById("cuenta-justo-billetes"),
  cuentaPago: document.getElementById("cuenta-pago"),
  cuentaBilletes: document.getElementById("cuenta-billetes"),
  cuentaVuelta: document.getElementById("cuenta-vuelta"),
  cuentaApuntar: document.getElementById("cuenta-apuntar"),
  cuentaApuntarCifra: document.getElementById("cuenta-apuntar-cifra"),
  gastosCuenta: document.getElementById("gastos-cuenta"),
  gastosTitulo: document.getElementById("gastos-titulo"),
  viaje: document.getElementById("viaje"),
  viajes: document.getElementById("viajes"),
  cajero: document.getElementById("cajero"),
  cajeroCuentas: document.getElementById("cajero-cuentas"),
  cajeroForm: document.getElementById("cajero-form"),
  cajeroCantidad: document.getElementById("cajero-cantidad"),
  cajeroCoste: document.getElementById("cajero-coste"),
  cajeroEn: document.getElementById("cajero-en"),
  cajeroDivisa: document.getElementById("cajero-divisa"),
  cajeroSugerencia: document.getElementById("cajero-sugerencia"),
  gastosPersonas: document.getElementById("gastos-personas"),
  personasMenos: document.getElementById("personas-menos"),
  personasN: document.getElementById("personas-n"),
  personasMas: document.getElementById("personas-mas"),
  personasCabeza: document.getElementById("personas-cabeza"),
  gente: document.getElementById("gente"),
  genteLista: document.getElementById("gente-lista"),
  gentePagos: document.getElementById("gente-pagos"),
  gastosTramo: document.getElementById("gastos-tramo"),
  gastosPendiente: document.getElementById("gastos-pendiente"),
  pendientes: document.getElementById("pendientes"),
  pendientesLista: document.getElementById("pendientes-lista"),
  pendientesForm: document.getElementById("pendientes-form"),
  pendientesConcepto: document.getElementById("pendientes-concepto"),
  pendientesCantidad: document.getElementById("pendientes-cantidad"),
  pendientesDivisa: document.getElementById("pendientes-divisa"),
  presupuestoPendiente: document.getElementById("presupuesto-pendiente"),
  curvaAbrir: document.getElementById("curva-abrir"),
  horas: document.getElementById("horas"),
  horasFrase: document.getElementById("horas-frase"),
  horasBarras: document.getElementById("horas-barras"),
  horasNota: document.getElementById("horas-nota"),
  curva: document.getElementById("curva"),
  curvaLienzo: document.getElementById("curva-lienzo"),
  curvaSvg: document.getElementById("curva-svg"),
  curvaTip: document.getElementById("curva-tip"),
  curvaDesde: document.getElementById("curva-desde"),
  curvaHasta: document.getElementById("curva-hasta"),
  curvaTexto: document.getElementById("curva-texto"),
  curvaClavePrevision: document.getElementById("curva-clave-prevision"),
  tramos: document.getElementById("tramos"),
  tramosLista: document.getElementById("tramos-lista"),
  tramosForm: document.getElementById("tramos-form"),
  tramosNombre: document.getElementById("tramos-nombre"),
  tramosDesde: document.getElementById("tramos-desde"),
  genteDevuelto: document.getElementById("gente-devuelto"),
  cajeroLista: document.getElementById("cajero-lista"),
  viajesLista: document.getElementById("viajes-lista"),
  viajesNuevo: document.getElementById("viajes-nuevo"),
  viajesNombre: document.getElementById("viajes-nombre"),
  viajesDuplicar: document.getElementById("viajes-duplicar"),
  viajesTarjeta: document.getElementById("viajes-tarjeta"),
  viajesLleno: document.getElementById("viajes-lleno"),
  viajesArchivo: document.getElementById("viajes-archivo"),
  viajesAbrirArchivo: document.getElementById("viajes-abrir-archivo"),
  viajesArchivados: document.getElementById("viajes-archivados"),
  viajesPie: document.getElementById("viajes-pie"),
  viajesCsv: document.getElementById("viajes-csv"),
  gastos: document.getElementById("gastos"),
  gastosVaciar: document.getElementById("gastos-vaciar"),
  gastosSuma: document.getElementById("gastos-suma"),
  gastosN: document.getElementById("gastos-n"),
  gastosMedia: document.getElementById("gastos-media"),
  gastosComisiones: document.getElementById("gastos-comisiones"),
  gastosCambio: document.getElementById("gastos-cambio"),
  gastosAhorro: document.getElementById("gastos-ahorro"),
  gastosTaxFree: document.getElementById("gastos-taxfree"),
  gastosEfectivo: document.getElementById("gastos-efectivo"),
  gastosForm: document.getElementById("gastos-form"),
  gastosConcepto: document.getElementById("gastos-concepto"),
  gastosPago: document.getElementById("gastos-pago"),
  gastosPagador: document.getElementById("gastos-pagador"),
  presupuestoEsto: document.getElementById("presupuesto-esto"),
  presupuestoEstoTexto: document.getElementById("presupuesto-esto-texto"),
  gastosSugerencia: document.getElementById("gastos-sugerencia"),
  gastosApuntar: document.getElementById("gastos-apuntar"),
  gastosRaro: document.getElementById("gastos-raro"),
  gastosLista: document.getElementById("gastos-lista"),
  gastosVacio: document.getElementById("gastos-vacio"),
  gastosCerrar: document.getElementById("gastos-cerrar"),
  gastosCategoria: document.getElementById("gastos-categoria"),
  categorias: document.getElementById("categorias"),
  desglose: document.getElementById("desglose"),
  buscar: document.getElementById("buscar"),
  buscarAbrir: document.getElementById("buscar-abrir"),
  gastosOrdenar: document.getElementById("gastos-ordenar"),
  gastosDiscreto: document.getElementById("gastos-discreto"),
  buscarCampo: document.getElementById("buscar-campo"),
  buscarTotal: document.getElementById("buscar-total"),
  presupuesto: document.getElementById("presupuesto"),
  presupuestoAnadir: document.getElementById("presupuesto-anadir"),
  presupuestoVer: document.getElementById("presupuesto-ver"),
  presupuestoLleno: document.getElementById("presupuesto-lleno"),
  presupuestoRitmo: document.getElementById("presupuesto-ritmo"),
  presupuestoHoy: document.getElementById("presupuesto-hoy"),
  presupuestoDia: document.getElementById("presupuesto-dia"),
  presupuestoRacha: document.getElementById("presupuesto-racha"),
  hoy: document.getElementById("hoy"),
  noches: document.getElementById("noches"),
  nochesMenos: document.getElementById("noches-menos"),
  nochesMas: document.getElementById("noches-mas"),
  nochesN: document.getElementById("noches-n"),
  nochesLunas: document.getElementById("noches-lunas"),
  nochesCada: document.getElementById("noches-cada"),
  hoyLleno: document.getElementById("hoy-lleno"),
  presupuestoTexto: document.getElementById("presupuesto-texto"),
  presupuestoAlli: document.getElementById("presupuesto-alli"),
  presupuestoForm: document.getElementById("presupuesto-form"),
  presupuestoImporte: document.getElementById("presupuesto-importe"),
  presupuestoCodigo: document.getElementById("presupuesto-codigo"),
  presupuestoHasta: document.getElementById("presupuesto-hasta"),
  presupuestoDesde: document.getElementById("presupuesto-desde"),
  presupuestoQuitar: document.getElementById("presupuesto-quitar"),
  presupuestoTopes: document.getElementById("presupuesto-topes"),
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
  comisionImp: document.getElementById("comision-imp"),
  impuestoRapidas: document.getElementById("impuesto-rapidas"),
  impuestoCampo: document.getElementById("impuesto-campo"),
  cafeCampo: document.getElementById("cafe-campo"),
  cafeDivisa: document.getElementById("cafe-divisa"),
  resultCafes: document.getElementById("result-cafes"),
  sueldoCampo: document.getElementById("sueldo-campo"),
  sueldoDivisa: document.getElementById("sueldo-divisa"),
  resultHoras: document.getElementById("result-horas"),
  resultPistas: document.getElementById("result-pistas"),
  alli: document.getElementById("alli"),
  alliHora: document.getElementById("alli-hora"),
  burbuja: document.getElementById("comision-burbuja"),
  comisionRapidas: document.getElementById("comision-rapidas"),
  comisionCampo: document.getElementById("comision-campo"),
  chuletaTabla: document.getElementById("chuleta-tabla"),
  chuletaCompartir: document.getElementById("chuleta-compartir"),
  chuletaTruco: document.getElementById("chuleta-truco"),
  extrasCompartir: document.getElementById("extras-compartir"),
  chuletaImprimir: document.getElementById("chuleta-imprimir"),
  semana: document.getElementById("trend-semana"),
  semanaBarras: document.getElementById("semana-barras"),
  semanaTexto: document.getElementById("semana-texto"),
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
let modoCompra = false;
let comision = 0;
let impuesto = 0;
let cafe = null;
let sueldo = null;
// La última cuenta que apuntaste, para que un segundo clic no la meta dos veces.
let cuentaApuntada = null;
// El billete con el que pagas en el tique. No lo guardo: es de esa cuenta.
let pagoCon = null;
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
// Las coronas de la vez anterior: la que cambia de gasto cae con su animación.
let reyesAntes = new Set();
// El gasto raro que ya te he avisado: el segundo clic lo apunta. Cambiar la
// cantidad o la categoría vuelve a preguntar.
let raroAvisado = null;
// Igual con el que ya apuntaste hace nada. Guardo los segundos del primer clic
// para que el cartel no vaya contando mientras lo miras.
let repetidoAvisado = null;
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
// Entre cuántas noches va el alojamiento que vas a apuntar. Uno es sin repartir.
let nochesNuevas = 1;
let categoriaAMano = false;
let pagoNuevo = PAGO_POR_DEFECTO;
let filtroCategoria = null;
let busqueda = "";
// false, "caro" o "barato": el botón va pasando por los tres.
let ordenado = false;
let cajero = [];
// Quién paga lo que vas a apuntar. No lo guardo: cada vez que abres eres tú,
// que es lo normal, y si no lo cambias con un clic.
let pagadorNuevo = 0;
// El precio de aquí va en la divisa de destino: si cambia, el de antes ya no vale.
let compararDivisa = null;
let pidiendoTasa = false;
let retiradaNueva = null;
let saldadoNuevo = null;
let tramoNuevo = null;
let pendienteNuevo = null;
let curvaMirando = null;

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
const nfCajero = formatoNumero({ maximumFractionDigits: 1 });
const nfImpuesto = formatoNumero({ maximumFractionDigits: 3 });
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
const IMPUESTO_KEY = "impuestoVenta";
const CAFE_KEY = "precioCafe";
const SUELDO_KEY = "sueldoHora";
const PAGO_KEY = "pagoGasto";
const FECHA_KEY = "fechaConsulta";
const HISTORIAL_KEY = "historialConversiones";
// Estas dos son de antes de los viajes: solo se leen para pasarlas al primero.
const GASTOS_KEY = "gastosViaje";
const PRESUPUESTO_KEY = "presupuestoViaje";
const VIAJES_KEY = "viajes";
const CELEBRADOS_KEY = "viajesCelebrados";
const CUENTA_KEY = "cuentaReparto";
const AL_REVES_KEY = "tasaAlReves";
const DISCRETO_KEY = "gastosDiscretos";
const CANTIDAD_KEY = "ultimaCantidad";
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

// El sueldo se guarda con la misma forma que el café: precio y divisa.
async function cargarSueldo() {
  try {
    const guardado = await chrome.storage.local.get(SUELDO_KEY);
    return leerCafe(guardado[SUELDO_KEY]);
  } catch (error) {
    console.warn("No se pudo leer el sueldo", error);
    return null;
  }
}

async function cargarCafe() {
  try {
    const guardado = await chrome.storage.local.get(CAFE_KEY);
    return leerCafe(guardado[CAFE_KEY]);
  } catch (error) {
    console.warn("No se pudo leer el café", error);
    return null;
  }
}

async function cargarImpuesto() {
  try {
    const guardado = await chrome.storage.local.get(IMPUESTO_KEY);
    return leerImpuesto(guardado[IMPUESTO_KEY]);
  } catch (error) {
    console.warn("No se pudo leer el impuesto", error);
    return 0;
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

// Para enseñar la pantalla sin que se vea lo que llevas gastado. Se queda como
// lo dejes: si lo quieres discreto, lo quieres también mañana en el metro.
let discreto = false;

async function cargarDiscreto() {
  try {
    const guardado = await chrome.storage.local.get(DISCRETO_KEY);
    return guardado[DISCRETO_KEY] === true;
  } catch (error) {
    console.warn("No se pudo leer el modo discreto", error);
    return false;
  }
}

function pintarDiscreto() {
  el.gastos.classList.toggle("is-discreto", discreto);
  el.gastosDiscreto.setAttribute("aria-pressed", String(discreto));
  el.gastosDiscreto.title = tr(discreto ? "discreto.ensenar" : "discreto.ocultar");
  el.gastosDiscreto.setAttribute("aria-label", el.gastosDiscreto.title);
}

async function onDiscreto() {
  discreto = !discreto;
  pintarDiscreto();
  try {
    await chrome.storage.local.set({ [DISCRETO_KEY]: discreto });
  } catch (error) {
    console.warn("No se pudo guardar el modo discreto", error);
  }
}

async function cargarCantidad() {
  try {
    const guardado = await chrome.storage.local.get(CANTIDAD_KEY);
    return leerCantidad(guardado[CANTIDAD_KEY]);
  } catch (error) {
    console.warn("No se pudo leer la última cantidad", error);
    return null;
  }
}

// Con cada tecla, pero esperando un poco: si cierras el popup a medias se
// queda lo último que dio tiempo a guardar, que es casi lo mismo.
let cantidadId = 0;
function guardarCantidad() {
  clearTimeout(cantidadId);
  cantidadId = setTimeout(async () => {
    const cantidad = leerCantidad(cantidadOrigen());
    if (cantidad === null) return;
    try {
      await chrome.storage.local.set({ [CANTIDAD_KEY]: cantidad });
    } catch (error) {
      console.warn("No se pudo guardar la cantidad", error);
    }
  }, 250);
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
  viajes = cambiarViaje(viajes, viajes.activo, { gastos, presupuesto, cajero });
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

      fila.append(crearBandera(divisa.code), cod, nom);
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
    const cambia = boton.value !== code;
    boton.value = code;
    const bandera = crearBandera(code);
    const texto = document.createElement("span");
    texto.textContent = `${code} · ${nombreDe(code)}`;
    boton.replaceChildren(bandera, texto);
    // Al abrir el popup no salta: solo cuando cambias tú la divisa.
    if (cambia && boton.dataset.puesto) bandera.classList.add("is-nueva");
    boton.dataset.puesto = "1";
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

function crearBandera(code) {
  const bandera = document.createElement("span");
  bandera.className = "buscador__bandera";
  bandera.setAttribute("aria-hidden", "true");
  bandera.textContent = banderaDivisa(code);
  return bandera;
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
  pintarDiaSemana(null);
  parDeLaSerie = "";
  pintarCambioDia();
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
  pintarDiaSemana(puntos);
  parDeLaSerie = `${el.from.value}-${el.to.value}`;
  pintarCambioDia(true);
  mirarUltimaVez();
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

// De lunes a viernes, cada barra lo que ese día se aparta de su semana. Con 7
// días o un mes no hay semanas bastantes y no sale.
function pintarDiaSemana(puntos) {
  const r = puntos ? mejorDiaSemana(puntos) : null;
  el.semana.hidden = !r;
  if (!r) return;
  const medias = r.porDia.map((d) => d.media);
  const max = Math.max(...medias);
  const min = Math.min(...medias);
  // La inicial corta del idioma: en español el miércoles es la X, que con la
  // primera letra martes y miércoles salían iguales.
  const inicial = (dia) => fechas({ weekday: "narrow" }).format(new Date(2026, 0, 4 + dia));
  el.semanaBarras.replaceChildren(...r.porDia.map(({ dia, media }, i) => {
    const barra = document.createElement("span");
    barra.className = "semana__barra";
    barra.style.setProperty("--alto", max === min ? 0.5 : 0.25 + (0.75 * (media - min)) / (max - min));
    barra.style.setProperty("--i", i);
    barra.dataset.dia = inicial(dia);
    if (!r.igual && dia === r.mejor) barra.classList.add("is-mejor");
    return barra;
  }));
  el.semanaTexto.textContent = textoDiaSemana(r);
  el.semana.title = tr("semana.titulo", { semanas: r.semanas });
  el.semana.dataset.igual = r.igual;
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
  el.extrasCompartir.hidden = !textoExtras();
}

// La de arriba primero, con la comisión como las otras, y luego las de la rejilla.
function textoExtras() {
  const from = el.from.value;
  const to = el.to.value;
  const cantidad = cantidadOrigen();
  const tasas = tasasBase?.de === from ? tasasBase.rates : null;
  const codes = extrasVisibles(extras, from, to);
  if (codes.length === 0) return "";
  const principal = from === to || rate === null || cantidad === null ? [] : [{ code: to, valor: conComision(cantidad * rate, comision) }];
  return extrasParaCompartir(cantidad, from, [...principal, ...convertirExtras(cantidad, tasas, codes, comision)], comision);
}

async function onCompartirExtras() {
  const texto = textoExtras();
  if (!texto) return;
  const bien = await copiar(texto);
  const boton = el.extrasCompartir;
  boton.classList.toggle("is-fallo", !bien);
  restartAnimation(boton, "is-hecho");
  clearTimeout(boton.vuelta);
  boton.vuelta = setTimeout(() => boton.classList.remove("is-hecho", "is-fallo"), 1600);
  if (bien) {
    restartAnimation(el.rejilla, "is-copiada");
    setTimeout(() => el.rejilla.classList.remove("is-copiada"), 1000);
  }
  mostrarFlash([tr(bien ? "extras.copiadas" : "compartir.fallo")], 2200);
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
  el.chuletaCompartir.disabled = filas[0].valor === null;
  el.chuletaImprimir.disabled = filas[0].valor === null;
  // Con la comisión dentro, que si no el truco y la tabla no dirían lo mismo.
  const truco = trucoDeCabeza(conComision(rate, comision));
  el.chuletaTruco.textContent = textoTruco(truco);
  el.chuletaTruco.title = tituloTruco(truco);
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

async function onCompartirChuleta() {
  const texto = chuletaParaCompartir(chuleta(rate, comision), el.from.value, el.to.value, comision);
  if (!texto) return;
  const bien = await copiar(texto);
  const boton = el.chuletaCompartir;
  boton.classList.toggle("is-fallo", !bien);
  restartAnimation(boton, "is-hecho");
  clearTimeout(boton.vuelta);
  boton.vuelta = setTimeout(() => boton.classList.remove("is-hecho", "is-fallo"), 1600);
  // Una ola por las filas, como si se las llevara el portapapeles.
  if (bien) {
    restartAnimation(el.chuletaTabla, "is-copiada");
    setTimeout(() => el.chuletaTabla.classList.remove("is-copiada"), 1000);
  }
  mostrarFlash([tr(bien ? "chuleta.copiada" : "compartir.fallo")], 2200);
}

function onImprimirChuleta() {
  if (rate === null) return;
  chrome.tabs.create({ url: urlImpresion({ from: el.from.value, to: el.to.value, rate, comision, fecha: rateDate }) });
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

// Lo de abajo más el impuesto y la comisión: lo que pagas de verdad.
// Al lado de la cifra pequeña, cuántos cafés de los de casa son. Sin café
// puesto no sale nada: la invitación ya está en la burbuja de la comisión.
function pintarCafes() {
  const n = enCafes(cafe, [
    { valor: leerImporte(el.amount.value), divisa: el.from.value },
    { valor: leerImporte(el.result.value), divisa: el.to.value },
  ]);
  const texto = textoCafes(n);
  const nodo = el.resultCafes;
  const habia = nodo.textContent;
  nodo.hidden = !texto;
  if (!texto) {
    nodo.textContent = "";
    return;
  }
  // En la pastilla, la taza y el número: con "cafés" no cabía al lado de la comisión.
  const corto = n === 0.5 ? "½" : `≈ ${nfEntero.format(n)}`;
  nodo.textContent = corto;
  nodo.title = `${texto}. ${tr("cafe.cuenta", { precio: `${nf.format(cafe.precio)} ${cafe.divisa}` })}`;
  nodo.setAttribute("aria-label", nodo.title);
  if (habia !== corto) restartAnimation(nodo, habia ? "is-tic" : "is-entra");
}

// Al lado de los cafés, el rato que tendrías que trabajar para pagarlo.
function pintarHoras() {
  const min = enHoras(sueldo, [
    { valor: leerImporte(el.amount.value), divisa: el.from.value },
    { valor: leerImporte(el.result.value), divisa: el.to.value },
  ]);
  const nodo = el.resultHoras;
  const habia = nodo.textContent;
  const corto = textoHoras(min, true);
  nodo.hidden = !corto;
  nodo.textContent = corto;
  if (!corto) return;
  nodo.title = `${textoHoras(min)}. ${tr("horas.cuenta", { precio: `${nf.format(sueldo.precio)} ${sueldo.divisa}` })}`;
  nodo.setAttribute("aria-label", nodo.title);
  if (habia !== corto) restartAnimation(nodo, habia ? "is-tic" : "is-entra");
}

// La hora de la divisa de origen, que es la de allí. Las agujas giran hasta su
// sitio cuando cambias de divisa; con el paso de los minutos solo se mueven.
function pintarHoraAlli() {
  const code = el.from.value;
  const h = horaAlli(code);
  const nodo = el.alli;
  nodo.hidden = !h;
  if (!h) {
    delete nodo.dataset.code;
    return;
  }
  nodo.style.setProperty("--h", `${(h.horas % 12) * 30 + h.minutos / 2}deg`);
  nodo.style.setProperty("--m", `${h.minutos * 6}deg`);
  nodo.classList.toggle("is-noche", esNoche(h.horas));
  el.alliHora.textContent = relojDe(h);
  nodo.title = tituloHoraAlli(h);
  nodo.setAttribute("aria-label", nodo.title);
  if (nodo.dataset.code !== code) {
    nodo.dataset.code = code;
    restartAnimation(nodo, "is-entra");
  }
}

// Cafés y horas juntos no caben al lado de la comisión, así que se turnan en
// el mismo sitio. Con el ratón encima se queda quieto, para poder leerlo.
const TURNO_PISTAS = 4000;

function pintarPistas() {
  const ambas = !el.resultCafes.hidden && !el.resultHoras.hidden;
  el.resultPistas.classList.toggle("is-turnos", ambas);
  if (!ambas) el.resultPistas.classList.remove("is-horas");
  const horas = el.resultPistas.classList.contains("is-horas");
  el.resultCafes.inert = ambas && horas;
  el.resultHoras.inert = ambas && !horas;
}

function turnarPistas() {
  const pistas = el.resultPistas;
  if (!pistas.classList.contains("is-turnos") || pistas.matches(":hover, :focus-within")) return;
  const horas = pistas.classList.toggle("is-horas");
  pintarPistas();
  restartAnimation(horas ? el.resultHoras : el.resultCafes, "is-entra");
}

function onCampoSueldo() {
  const texto = el.sueldoCampo.value.trim();
  el.sueldoCampo.removeAttribute("aria-invalid");
  const divisa = sueldo?.divisa ?? el.to.value;
  const nuevo = texto === "" ? null : leerCafe({ precio: leerImporte(texto), divisa });
  if (texto !== "" && !nuevo) return;
  sueldo = nuevo;
  pintarHoras();
  pintarPistas();
  try {
    if (sueldo) chrome.storage.local.set({ [SUELDO_KEY]: sueldo });
    else chrome.storage.local.remove(SUELDO_KEY);
  } catch (error) {
    console.warn("No se pudo guardar el sueldo", error);
  }
}

function onTeclaCampoSueldo(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  const texto = el.sueldoCampo.value.trim();
  if (texto !== "" && !leerCafe({ precio: leerImporte(texto), divisa: "EUR" })) {
    el.sueldoCampo.setAttribute("aria-invalid", "true");
    restartAnimation(el.sueldoCampo, "is-mal");
    return;
  }
  cerrarBurbuja()?.focus();
}

function pintarCampoSueldo() {
  const divisa = sueldo?.divisa ?? el.to.value;
  el.sueldoCampo.value = sueldo ? nf.format(sueldo.precio) : "";
  el.sueldoCampo.removeAttribute("aria-invalid");
  el.sueldoDivisa.textContent = divisa;
  el.sueldoCampo.setAttribute("aria-label", tr("horas.campo", { divisa }));
}

// La divisa es la que tenga ya el café; si no hay, la de destino, que suele ser
// la tuya. Vacío lo quita.
function onCampoCafe() {
  const texto = el.cafeCampo.value.trim();
  el.cafeCampo.removeAttribute("aria-invalid");
  const divisa = cafe?.divisa ?? el.to.value;
  const nuevo = texto === "" ? null : leerCafe({ precio: leerImporte(texto), divisa });
  if (texto !== "" && !nuevo) return;
  cafe = nuevo;
  pintarCafes();
  pintarPistas();
  try {
    if (cafe) chrome.storage.local.set({ [CAFE_KEY]: cafe });
    else chrome.storage.local.remove(CAFE_KEY);
  } catch (error) {
    console.warn("No se pudo guardar el café", error);
  }
}

function onTeclaCampoCafe(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  const texto = el.cafeCampo.value.trim();
  if (texto !== "" && !leerCafe({ precio: leerImporte(texto), divisa: "EUR" })) {
    el.cafeCampo.setAttribute("aria-invalid", "true");
    restartAnimation(el.cafeCampo, "is-mal");
    return;
  }
  cerrarBurbuja()?.focus();
}

function pintarCampoCafe() {
  const divisa = cafe?.divisa ?? el.to.value;
  el.cafeCampo.value = cafe ? nf.format(cafe.precio) : "";
  el.cafeCampo.removeAttribute("aria-invalid");
  el.cafeDivisa.textContent = divisa;
  el.cafeCampo.setAttribute("aria-label", tr("cafe.campo", { divisa }));
}

function pintarComision() {
  const hay = comision > 0 || impuesto > 0;
  const total = rate === null ? null : loQuePagas(leerImporte(el.result.value), comision, impuesto);
  const texto = total === null ? "—" : `${nf.format(total)} ${el.to.value}`;

  el.comision.classList.toggle("is-puesta", hay);
  const pct = tr("pct", { n: nfComision.format(comision) });
  // Con solo el impuesto, la pastilla de la comisión sobra.
  el.comisionPct.hidden = hay && comision === 0;
  el.comisionPct.textContent = comision > 0 ? `+${pct}` : tr("comision.anadir");
  const imp = impuesto > 0 ? tr("impuesto.pastilla", { pct: tr("pct", { n: nfImpuesto.format(impuesto) }) }) : "";
  if (el.comisionImp.textContent !== imp && imp) restartAnimation(el.comisionImp, "is-tic");
  el.comisionImp.hidden = !imp;
  el.comision.classList.toggle("is-con-impuesto", Boolean(imp));
  el.comisionImp.textContent = imp;
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
  if (impuesto === 0) {
    el.comision.setAttribute("aria-label", tr("comision.aria", { pct, total: texto }));
    el.comision.title = tr("comision.conTitulo", { total: texto });
    return;
  }
  el.comision.title = tr(comision > 0 ? "impuesto.yComisionTitulo" : "impuesto.conTitulo", { total: texto });
  el.comision.setAttribute("aria-label", `${el.comision.title}. ${tr("impuesto.cambiar")}`);
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
  pintarComparar();
  pintarBotonGasto();
  pintarAvisoComision();
  pintarAhorro();
  for (const boton of el.comisionRapidas.children) {
    boton.setAttribute("aria-pressed", String(Number(boton.dataset.pct) === pct));
  }
  // El salto solo al pasar de no tener a tener, que al cambiar de 2 a 3 ya
  // basta con el tic de la cifra.
  if (antes === 0 && pct > 0 && impuesto === 0) restartAnimation(el.comision, "is-estrenada");
  try {
    chrome.storage.local.set({ [COMISION_KEY]: comision });
  } catch (error) {
    console.warn("No se pudo guardar la comisión", error);
  }
}

function ponerImpuesto(pct) {
  const antes = impuesto;
  impuesto = pct;
  pintarComision();
  pintarComparar();
  for (const boton of el.impuestoRapidas.children) {
    boton.setAttribute("aria-pressed", String(Number(boton.dataset.pct) === pct));
  }
  if (antes === 0 && pct > 0 && comision === 0) restartAnimation(el.comision, "is-estrenada");
  try {
    chrome.storage.local.set({ [IMPUESTO_KEY]: impuesto });
  } catch (error) {
    console.warn("No se pudo guardar el impuesto", error);
  }
}

function onCampoImpuesto() {
  const pct = leerImpuestoEscrito(el.impuestoCampo.value);
  el.impuestoCampo.removeAttribute("aria-invalid");
  if (pct !== null) ponerImpuesto(pct);
}

function onTeclaCampoImpuesto(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  if (leerImpuestoEscrito(el.impuestoCampo.value) === null) {
    el.impuestoCampo.setAttribute("aria-invalid", "true");
    restartAnimation(el.impuestoCampo, "is-mal");
    return;
  }
  cerrarBurbuja()?.focus();
}

function abrirBurbuja() {
  cerrarHistorial();
  cerrarGastos();
  cerrarCuenta();
  cerrarComparar();
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
  el.impuestoRapidas.replaceChildren(...IMPUESTOS_RAPIDOS.map((pct, i) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "burbuja__rapida";
    // Entran detrás de las de la comisión, que están encima.
    boton.style.setProperty("--i", i + COMISIONES_RAPIDAS.length);
    boton.dataset.pct = pct;
    boton.textContent = pct === 0 ? tr("comision.sin") : tr("pct", { n: pct });
    boton.setAttribute("aria-label", pct === 0 ? tr("impuesto.sinAria") : tr("pct", { n: pct }));
    boton.setAttribute("aria-pressed", String(pct === impuesto));
    boton.addEventListener("click", () => {
      ponerImpuesto(pct);
      cerrarBurbuja()?.focus();
    });
    return boton;
  }));
  el.impuestoCampo.value = IMPUESTOS_RAPIDOS.includes(impuesto) ? "" : nfImpuesto.format(impuesto);
  el.impuestoCampo.removeAttribute("aria-invalid");
  const rapida = COMISIONES_RAPIDAS.includes(comision);
  el.comisionCampo.value = rapida ? "" : nfComision.format(comision);
  el.comisionCampo.removeAttribute("aria-invalid");
  pintarCampoCafe();
  pintarCampoSueldo();
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

  const quitar = document.createElement("button");
  quitar.type = "button";
  quitar.className = "gastos__quitar historial__quitar";
  quitar.textContent = "✕";
  quitar.setAttribute("aria-label", tr("historial.quitar", { cantidad: nf.format(entrada.cantidad), from: entrada.from, to: entrada.to }));
  quitar.addEventListener("click", () => onQuitarConversion(entrada, fila));

  fila.append(botonCopiar, usar, quitar);
  return fila;
}

function pintarCuentaHistorial() {
  const hay = historial.length > 0;
  el.historialCuenta.hidden = !hay;
  el.historialCuenta.textContent = historial.length;
  el.abrirHistorial.setAttribute("aria-label", hay ? tr("historial.cuenta", { n: historial.length }) : tr("historial"));
}

function pintarHistorial() {
  const hay = historial.length > 0;
  pintarCuentaHistorial();
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
  cerrarComparar();
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

function onQuitarConversion(entrada, fila) {
  // El foco a la de al lado, que si no se va al body y el teclado se pierde.
  const siguiente = (fila.nextElementSibling ?? fila.previousElementSibling)?.querySelector(".gastos__quitar");
  const quitar = () => {
    historial = quitarConversion(historial, entrada);
    // Solo esa fila: repintar la lista entera haría saltar otra vez a todas.
    if (historial.length) {
      fila.remove();
      pintarCuentaHistorial();
    } else {
      pintarHistorial();
    }
    (siguiente ?? el.abrirHistorial).focus();
    try {
      chrome.storage.local.set({ [HISTORIAL_KEY]: historial });
    } catch (error) {
      console.warn("No se pudo guardar el historial", error);
    }
  };
  if (sinMovimiento.matches) return quitar();
  fila.style.setProperty("--i", 0);
  fila.classList.add("is-saliendo");
  fila.addEventListener("animationend", quitar, { once: true });
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
  return alCambioDelCajero(crearGasto({
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    from: el.from.value,
    to: el.to.value,
    cantidad: leerImporte(el.amount.value),
    valor,
    concepto: el.gastosConcepto.value,
    categoria: categoriaNueva,
    pago: pagoNuevo,
    comision: comisionDelPago(pagoNuevo, comision),
    cuando: Date.now(),
    pagador: pagadorNuevo < viajeActivo(viajes).personas ? pagadorNuevo : 0,
  }), cajero);
}

function pintarCategoriaNueva(conSalto = false) {
  el.gastosCategoria.innerHTML = iconoCategoria(categoriaNueva);
  el.gastosCategoria.dataset.categoria = categoriaNueva;
  const nombre = tr(`cat.${categoriaNueva}`);
  el.gastosCategoria.title = nombre;
  el.gastosCategoria.setAttribute("aria-label", tr("cat.elegir", { nombre }));
  if (conSalto) restartAnimation(el.gastosCategoria, "is-cambiada");
  pintarNoches();
}

// Las noches solo tienen sentido en el alojamiento. Al cambiar de categoría
// vuelve a una, que si no un taxi se repartiría sin querer.
function pintarNoches() {
  const toca = categoriaNueva === "alojamiento";
  if (!toca) nochesNuevas = 1;
  const estaba = !el.noches.hidden;
  el.noches.hidden = !toca;
  if (!toca) return;
  if (!estaba) restartAnimation(el.noches, "is-entra");
  el.nochesN.textContent = nochesNuevas;
  el.nochesMenos.disabled = nochesNuevas <= 1;
  el.nochesMas.disabled = nochesNuevas >= NOCHES_MAX;
  // Una luna por noche hasta siete; más ya no caben y no se cuentan.
  const lunas = Math.min(nochesNuevas, 7);
  if (el.nochesLunas.childElementCount !== lunas) {
    el.nochesLunas.replaceChildren(...Array.from({ length: lunas }, (_, i) => {
      const luna = document.createElement("span");
      luna.className = "noches__luna";
      luna.textContent = "☾";
      luna.style.setProperty("--i", i);
      return luna;
    }));
  }
  const gasto = gastoDePantalla();
  el.nochesCada.textContent = gasto && nochesNuevas > 1
    ? tr("noches.porNoche", { valor: `${nf.format(repartirNoches(gasto, nochesNuevas)[0].valor)} ${gasto.to}` })
    : "";
}

function cambiarNoches(paso) {
  const n = Math.min(Math.max(nochesNuevas + paso, 1), NOCHES_MAX);
  if (n === nochesNuevas) return;
  nochesNuevas = n;
  raroAvisado = null;
  pintarNoches();
  pintarBotonGasto();
  restartAnimation(el.nochesN, paso > 0 ? "is-sube" : "is-baja");
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
  // Con Alt: cuando lo quieres cambiar sueles estar escribiendo el concepto.
  el.gastosPago.title = `${nombre} (${textoAtajo("KeyE", esMac)})`;
  el.gastosPago.setAttribute("aria-label", tr("pago.elegir", { nombre }));
  if (conGiro) restartAnimation(el.gastosPago, "is-girando");
}

// Lo dejo como lo pusiste: si pagas en efectivo, sueles hacerlo varias veces seguidas.
function onCambiarPago() {
  pagoNuevo = pagoNuevo === "efectivo" ? "tarjeta" : "efectivo";
  pintarPago(true);
  pintarBotonGasto();
  pintarEfectivo();
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
  pintarBotonGasto();
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
      pintarBotonGasto();
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

// El tono de cada tope la última vez, para que tiemble al pasarte y no cada
// vez que se repinta.
const tonosTope = new Map();

function pintarDesglose() {
  const trozos = desglose(gastos);
  const topes = estadoTopes(presupuesto, gastos);
  // Con una sola categoría el desglose no dice nada: un 100 % y ya. Salvo que
  // le hayas puesto tope, que entonces dice cómo vas.
  el.desglose.hidden = trozos.length < 2 && !trozos.some((t) => topes.has(t.categoria) && t.to === presupuesto.to);
  if (filtroCategoria && !trozos.some((t) => t.categoria === filtroCategoria)) filtroCategoria = null;
  if (el.desglose.hidden) {
    filtroCategoria = null;
    cerrarHoras();
    return;
  }
  const alDia = categoriasAlDia(gastos);
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
    const datos = { nombre, total: `${nf.format(total)} ${to}`, pct };
    boton.title = alDia.has(categoria)
      ? tr("cat.filtrarDia", { ...datos, dia: nf.format(alDia.get(categoria)) })
      : tr("cat.filtrar", datos);
    const tope = to === presupuesto?.to ? topes.get(categoria) : null;
    if (tope) pintarTope(boton, tope);
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
  pintarBotonHoras(trozos.length);
}

// Al final de las categorías, la franja que más se lleva. Abre el reparto por horas.
function pintarBotonHoras(despues) {
  const r = porFranja(gastos);
  if (!r) return cerrarHoras();
  const mas = r.franjas.find((f) => f.id === r.mas);
  const pct = porCientoEntero(mas.fraccion);
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "desglose__trozo desglose__horas";
  boton.id = "horas-abrir";
  boton.style.setProperty("--i", despues);
  boton.style.setProperty("--parte", mas.fraccion);
  boton.textContent = tr("horas.boton", { emoji: mas.emoji, pct });
  boton.title = tr("horas.botonTitulo", { franja: tr(`horas.${mas.id}El`), pct });
  boton.setAttribute("aria-label", boton.title);
  boton.setAttribute("aria-controls", "horas");
  boton.setAttribute("aria-expanded", String(!el.horas.hidden));
  boton.addEventListener("click", () => (el.horas.hidden ? abrirHoras() : cerrarHoras()));
  el.desglose.append(boton);
  if (!el.horas.hidden) pintarHoras();
}

function pintarHoras() {
  const r = porFranja(gastos);
  if (!r) return cerrarHoras();
  const mas = r.franjas.find((f) => f.id === r.mas);
  const pct = porCientoEntero(mas.fraccion);
  const franja = tr(`horas.${mas.id}El`);
  el.horasFrase.textContent = `${mas.emoji} ${mas.categoria
    ? tr("horas.frase", { franja, pct, cat: tr(`cat.${mas.categoria}`).toLocaleLowerCase(localeActual()) })
    : tr("horas.fraseSola", { franja, pct })}`;
  const maximo = Math.max(...r.franjas.map((f) => f.fraccion));
  const hora = (h) => `${String(h).padStart(2, "0")}:00`;
  el.horasBarras.replaceChildren(...r.franjas.map((f, i) => {
    const li = document.createElement("li");
    li.className = "horas__franja";
    li.classList.toggle("is-mas", f.id === r.mas);
    li.style.setProperty("--i", i);
    li.style.setProperty("--alto", maximo > 0 ? f.fraccion / maximo : 0);
    const siguiente = FRANJAS[i + 1]?.desde ?? 24;
    li.title = tr("horas.barra", {
      franja: tr(`horas.${f.id}`), desde: hora(f.desde), hasta: hora(siguiente),
      valor: `${nf.format(f.total)} ${r.to}`, n: f.n === 1 ? tr("gastos.uno") : tr("gastos.n", { n: f.n }),
    });
    li.setAttribute("aria-label", li.title);
    li.innerHTML = '<span class="horas__pct"></span><span class="horas__barra" aria-hidden="true"></span><span class="horas__emoji" aria-hidden="true"></span><span class="horas__nombre"></span>';
    li.querySelector(".horas__pct").textContent = f.n ? porCientoEntero(f.fraccion) : "";
    li.querySelector(".horas__emoji").textContent = f.emoji;
    li.querySelector(".horas__nombre").textContent = tr(`horas.${f.id}`);
    return li;
  }));
  el.horasNota.textContent = tr("horas.nota");
}

function abrirHoras() {
  cerrarViajes();
  cerrarCajero();
  cerrarTramos();
  cerrarPendientes();
  cerrarCurva();
  cerrarGente();
  cerrarCategorias();
  dejarDeEditarPresupuesto();
  const boton = document.getElementById("horas-abrir");
  // Debajo del total como los demás: pegado a la pastilla se salía por abajo.
  const arriba = el.gastosSuma.getBoundingClientRect().bottom - el.gastos.getBoundingClientRect().top;
  el.horas.style.setProperty("--cajero-arriba", `${Math.round(arriba) + 4}px`);
  el.horas.hidden = false;
  boton?.setAttribute("aria-expanded", "true");
  pintarHoras();
}

function cerrarHoras() {
  if (el.horas.hidden) return false;
  el.horas.hidden = true;
  document.getElementById("horas-abrir")?.setAttribute("aria-expanded", "false");
  return true;
}

function pintarTope(boton, { categoria, tope, gastado, queda, fraccion, tono, to }) {
  boton.dataset.tono = tono;
  boton.style.setProperty("--tope", Math.min(fraccion, 1));
  boton.title += `\n${tono === "pasado"
    ? tr("cat.topePasado", { pasado: `${nf.format(-queda)} ${to}`, tope: nf.format(tope) })
    : tr("cat.tope", { gastado: nf.format(gastado), tope: nf.format(tope), queda: `${nf.format(queda)} ${to}` })}`;
  const clave = `${viajes.activo}:${categoria}`;
  const antes = tonosTope.get(clave);
  tonosTope.set(clave, tono);
  if (antes && antes !== "pasado" && tono === "pasado") restartAnimation(boton, "is-alarma");
}

const porCientoEntero = (fraccion) => tr("pct", { n: Math.round(fraccion * 100) });

// Antes de apuntarlo ya ves cuánto se come: un trozo a rayas en la barra y los
// días de presupuesto que son.
function pintarLoQueSeLleva(gasto = gastoDePantalla()) {
  const r = loQueSeLleva(presupuesto, gastos, gasto, hoy(), viajeActivo(viajes).pendientes);
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

const claveRaro = (g) => `${g.valor} ${g.to} ${g.categoria}`;
const claveRepetido = (g) => `${g.cantidad} ${g.from} ${g.concepto.toLowerCase()}`;
const haceSegundos = (s) => (s < 60 ? `${s} s` : `${Math.floor(s / 60)} min`);

// Mientras escribes ya ves que es raro; al apuntar, el primer clic pregunta.
function pintarGastoRaro(gasto, entero = gasto) {
  const raro = gasto ? gastoRaro(gastos, gasto) : null;
  if (!raro || raroAvisado !== claveRaro(gasto)) raroAvisado = null;
  if (!entero || repetidoAvisado?.clave !== claveRepetido(entero)) repetidoAvisado = null;
  if (!raroAvisado && !repetidoAvisado) el.gastosRaro.classList.remove("is-insiste");
  const texto = repetidoAvisado ? tr("gastos.repetido", { hace: haceSegundos(repetidoAvisado.segundos) })
    : !raro ? ""
    : raro.categoria ? tr("gastos.raro", { veces: raro.veces, categoria: tr(`cat.${raro.categoria}`).toLowerCase() })
    : tr("gastos.raroTodo", { veces: raro.veces });
  if (el.gastosRaro.textContent !== texto) {
    el.gastosRaro.textContent = texto;
    el.gastosRaro.hidden = !texto;
    if (texto) restartAnimation(el.gastosRaro, "is-entra");
  }
  el.gastosRaro.title = raro && !repetidoAvisado ? tr("gastos.raroTitulo", { normal: `${nf.format(raro.normal)} ${raro.to}` }) : "";
  return Boolean(raro || repetidoAvisado);
}

function pintarBotonGasto() {
  const gasto = gastoDePantalla();
  if (!el.noches.hidden) pintarNoches();
  pintarLoQueSeLleva(gasto);
  el.gastosApuntar.disabled = !gasto;
  if (!gasto) {
    pintarGastoRaro(null);
    el.gastosApuntar.classList.remove("is-raro", "is-seguro");
    el.gastosApuntar.textContent = "+";
    el.gastosApuntar.title = tr("gastos.nada");
    el.gastosApuntar.setAttribute("aria-label", tr("gastos.nada"));
    return;
  }
  const valor = `${nf.format(gasto.valor)} ${gasto.to}`;
  const unaNoche = repartirNoches(gasto, nochesNuevas)[0];
  const raro = pintarGastoRaro(unaNoche, gasto);
  el.gastosApuntar.classList.toggle("is-raro", raro);
  if (!raroAvisado && !repetidoAvisado) el.gastosApuntar.classList.remove("is-seguro");
  const avisado = repetidoAvisado || (raro && raroAvisado === claveRaro(unaNoche));
  el.gastosApuntar.textContent = tr(avisado ? "gastos.raroSeguro" : "gastos.apuntar", { valor });
  el.gastosApuntar.title = comision === 0 ? ""
    : pagoNuevo === "efectivo" ? tr("pago.efectivoNota")
    : tr("gastos.comision", { pct: tr("pct", { n: nfComision.format(comision) }) });
  el.gastosApuntar.setAttribute(
    "aria-label",
    tr("gastos.apuntarAria", { cantidad: nf.format(gasto.cantidad), from: gasto.from, valor }),
  );
}

function crearHueco({ dias, desde, hasta }, d) {
  const fila = document.createElement("li");
  fila.className = "gastos__hueco";
  fila.style.setProperty("--d", Math.min(d, 8));
  const zen = document.createElement("span");
  zen.className = "gastos__hueco-zen";
  zen.setAttribute("aria-hidden", "true");
  zen.textContent = "🧘";
  const texto = document.createElement("span");
  texto.textContent = dias === 1 ? tr("gastos.huecoUno", { dia: nombreDia(desde) }) : tr("gastos.hueco", { n: dias });
  fila.append(zen, texto);
  if (dias > 1) fila.title = tr("gastos.huecoTitulo", { desde: fechaCorta(desde), hasta: fechaCorta(hasta) });
  return fila;
}

// Como la cabecera de un día, pero sin barra: no se comparan con los días.
function crearCabezaFijos(fijos) {
  const fila = document.createElement("li");
  fila.className = "gastos__dia gastos__dia--fijos";
  fila.title = tr("fijos.cabezaTitulo");
  const nombre = document.createElement("span");
  nombre.textContent = tr("fijos.cabeza");
  if (fijos.length > 1) {
    const n = document.createElement("span");
    n.className = "gastos__dia-n";
    n.textContent = fijos.length;
    nombre.append(n);
  }
  const suma = document.createElement("span");
  suma.className = "gastos__dia-suma";
  suma.textContent = textoTotales(sumarPorDivisa(fijos));
  fila.append(nombre, suma);
  return fila;
}

function crearDiaGastos({ dia, gastos: suyos, totales }, peso, d) {
  const fila = document.createElement("li");
  fila.className = "gastos__dia";
  const nombre = document.createElement("span");
  nombre.textContent = nombreDia(dia);
  // Con uno solo sobra: ya lo ves debajo.
  if (suyos.length > 1) {
    const n = document.createElement("span");
    n.className = "gastos__dia-n";
    n.textContent = suyos.length;
    n.title = tr("gastos.diaN", { n: suyos.length });
    if (suyos.some((g) => g.id === gastoNuevo)) n.classList.add("is-nueva");
    nombre.append(n);
  }
  const ultimo = dia === hoy() ? ultimoDeHoy(suyos) : null;
  if (ultimo) {
    const hace = document.createElement("span");
    hace.className = "gastos__ultimo";
    hace.textContent = ` · ${tr("gastos.ultimo", { hace: haceCuanto(ultimo) })}`;
    hace.title = tr("gastos.ultimoTitulo");
    nombre.append(hace);
  }
  const suma = document.createElement("span");
  suma.className = "gastos__dia-suma";
  suma.textContent = textoTotales(totales);
  const manda = categoriaDelDia(suyos);
  if (manda) {
    const emoji = document.createElement("span");
    emoji.className = "gastos__dia-cat";
    emoji.textContent = EMOJI_CATEGORIA[manda.categoria];
    emoji.title = tr("gastos.diaCategoria", { cat: tr(`cat.${manda.categoria}`).toLocaleLowerCase(), pct: tr("pct", { n: Math.round(manda.fraccion * 100) }) });
    suma.prepend(emoji);
  }
  const empieza = leerTramos(viajeActivo(viajes).tramos).find((t) => t.desde === dia);
  if (empieza) {
    const marca = document.createElement("span");
    marca.className = "gastos__dia-tramo";
    marca.textContent = `📍 ${empieza.nombre}`;
    marca.title = tr("tramos.empieza", { nombre: empieza.nombre });
    nombre.append(marca);
  }
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

function crearFilaGasto(gasto, i, peso, rey = false) {
  const fila = document.createElement("li");
  fila.className = "gastos__fila";
  // Ordenados por importe, una barra de fondo con lo que pesa al lado del más caro.
  if (peso !== undefined) {
    fila.classList.add("is-peso");
    fila.style.setProperty("--peso", peso);
  }
  fila.dataset.id = gasto.id;
  fila.classList.toggle("is-fijo", esFijo(gasto));
  fila.classList.toggle("is-devolucion", esDevolucion(gasto));
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
  if (busqueda && gasto.concepto) {
    que.replaceChildren(...trozosResaltados(concepto, busqueda).map(({ texto, resaltado }) => {
      if (!resaltado) return texto;
      const marca = document.createElement("mark");
      marca.className = "gastos__marca";
      marca.textContent = texto;
      return marca;
    }));
  } else {
    que.textContent = concepto;
  }
  que.title = tr("gastos.editar");
  que.setAttribute("aria-label", tr("gastos.editarDe", { concepto }));
  que.addEventListener("click", () => editarConcepto(gasto, que));
  const de = document.createElement("span");
  de.className = "gastos__de";
  de.textContent = `${nf.format(gasto.cantidad)} ${gasto.from}`;
  // Sin los días como cabecera, el día va en la fila en vez de lo pagado, que
  // con los dos no le quedaba sitio al concepto.
  if (peso !== undefined) {
    de.title = de.textContent;
    de.textContent = nombreDia(isoLocal(new Date(gasto.cuando)));
  }
  const cuanto = document.createElement("span");
  cuanto.className = "gastos__valor";
  cuanto.textContent = valor;
  cuanto.title = tr("gastos.copiar");
  cuanto.addEventListener("dblclick", () => onCopiarGasto(gasto, cuanto));
  const texto = document.createElement("span");
  texto.className = "gastos__texto";
  texto.setAttribute("aria-label", tr("gastos.fila", { concepto, cantidad: nf.format(gasto.cantidad), from: gasto.from, valor }));
  // El efectivo va como un punto en el icono: en la fila no cabe nada más.
  if (gasto.pago === "efectivo") {
    icono.classList.add("is-efectivo");
    icono.title = `${tr(`cat.${gasto.categoria}`)} · ${tr("pago.efectivo")}`;
  }
  if (rey) {
    fila.classList.add("is-rey");
    icono.classList.add("is-rey");
    icono.title += ` · ${tr("gastos.rey")}`;
    texto.setAttribute("aria-label", `${texto.getAttribute("aria-label")}. ${tr("gastos.rey")}`);
    if (cascadaGastos || !reyesAntes.has(gasto.id)) icono.classList.add("is-coronado");
  }
  const { personas, gente } = viajeActivo(viajes);
  const quien = leerPagador(gasto.pagador);
  if (quien && quien < personas) {
    const cara = document.createElement("span");
    cara.className = "gastos__quien";
    cara.dataset.n = quien % 6;
    cara.textContent = inicialPersona(gente, quien);
    cara.title = tr("gente.pago", { nombre: nombrePersona(gente, quien) });
    texto.setAttribute("aria-label", `${texto.getAttribute("aria-label")}. ${cara.title}`);
    // En la esquina del icono, como el punto del efectivo: en la fila el concepto se quedaba en "T…".
    icono.classList.add("is-de-otro");
    icono.append(cara);
  }
  texto.append(icono, que, de, cuanto);
  const entre = entreDe(gasto, personas);
  if (entre) {
    const linea = document.createElement("span");
    linea.className = "gastos__nota gastos__entre";
    linea.textContent = fraseEntre(entre, gente);
    texto.classList.add("con-nota");
    texto.append(linea);
    texto.setAttribute("aria-label", `${texto.getAttribute("aria-label")}. ${linea.textContent}`);
  }
  if (gasto.nota) {
    const nota = document.createElement("span");
    nota.className = "gastos__nota";
    nota.title = gasto.nota;
    nota.replaceChildren(...(busqueda ? trozosResaltados(gasto.nota, busqueda) : [{ texto: gasto.nota }]).map(({ texto: trozo, resaltado }) => {
      if (!resaltado) return trozo;
      const marca = document.createElement("mark");
      marca.className = "gastos__marca";
      marca.textContent = trozo;
      return marca;
    }));
    texto.classList.add("con-nota");
    texto.append(nota);
    texto.setAttribute("aria-label", `${texto.getAttribute("aria-label")}. ${tr("notas.aria", { nota: gasto.nota })}`);
  }

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
  // Volver a apuntar hoy una devolución no tiene sentido: te devuelven una vez.
  if (esDevolucion(gasto)) {
    repetir.disabled = true;
    repetir.classList.add("is-nada");
    texto.setAttribute("aria-label", `${texto.getAttribute("aria-label")}. ${tr("devolver.aria")}`);
  }

  fila.append(texto, repetir, quitar);
  fila.addEventListener("animationend", (event) => {
    if (event.target === fila) fila.classList.remove("is-nueva");
  });
  return fila;
}

// El total que se ve, para contar desde ahí la próxima vez, y la cuenta en marcha.
let sumaContada = null;
let contador = null;

function pararContador() {
  if (!contador) return;
  cancelAnimationFrame(contador.raf);
  el.gastosSuma.classList.remove("is-contando");
  el.gastosSuma.removeAttribute("aria-busy");
  contador = null;
}

// La cifra corre de lo que había a lo nuevo. Mientras cuenta, aria-busy, que si
// no el lector de pantalla leería cada número por el camino.
function contarSuma(desde, { to, total }, final) {
  pararContador();
  const nodo = el.gastosSuma;
  const empieza = performance.now();
  const yo = { final, va: desde };
  contador = yo;
  nodo.setAttribute("aria-busy", "true");
  nodo.classList.add("is-contando");
  const paso = (ahora) => {
    if (contador !== yo) return;
    // Si lo copias a medias, el "Copiado" manda y luego vuelve el total bueno.
    if (nodo.classList.contains("is-copiado") || nodo.classList.contains("is-fallo")) {
      nodo.dataset.antes = final;
      return pararContador();
    }
    const t = (ahora - empieza) / 650;
    if (t >= 1) {
      nodo.textContent = final;
      return pararContador();
    }
    yo.va = cifraEnMarcha(desde, total, t);
    nodo.textContent = `${nf.format(yo.va)} ${to}`;
    yo.raf = requestAnimationFrame(paso);
  };
  yo.raf = requestAnimationFrame(paso);
}

// La cifra dice "Copiado" un momento en su sitio y vuelve.
async function copiarEnSuSitio(cifra, texto) {
  // El doble clic ya ha seleccionado media cifra; queda feo con el "Copiado".
  getSelection()?.removeAllRanges();
  const bien = await copiar(texto);
  if (!cifra.classList.contains("is-copiado") && !cifra.classList.contains("is-fallo")) cifra.dataset.antes = cifra.textContent;
  cifra.textContent = tr(bien ? "copiado" : "copiar.fallo");
  cifra.classList.remove("is-copiado", "is-fallo");
  restartAnimation(cifra, bien ? "is-copiado" : "is-fallo");
  clearTimeout(cifra.vuelta);
  cifra.vuelta = setTimeout(() => {
    cifra.textContent = cifra.dataset.antes;
    cifra.classList.remove("is-copiado", "is-fallo");
  }, 1300);
}

const onCopiarGasto = (gasto, cuanto) => copiarEnSuSitio(cuanto, gastoParaCopiar(gasto));

function onCopiarTotal() {
  const texto = totalParaCopiar(viajeActivo(viajes));
  if (texto) copiarEnSuSitio(el.gastosSuma, texto);
}

// Con la J y la Q los gastos pueden estar cerrados, así que lo dice la tecla de abajo y no la cifra.
async function copiarTotalDesdeAtajo() {
  if (!(await copiar(totalParaCopiar(viajeActivo(viajes))))) avisar(tr("copiar.fallo"));
}

async function copiarHoyDesdeAtajo() {
  if (!(await copiar(hoyParaCopiar(viajeActivo(viajes))))) avisar(tr("copiar.fallo"));
}

async function copiarGastoDesdeAtajo() {
  if (!(await copiar(gastoParaCopiar(ultimoGasto(gastos))))) avisar(tr("copiar.fallo"));
}

async function copiarMasCaroDesdeAtajo() {
  if (!(await copiar(gastoParaCopiar(gastoMasCaro(gastos))))) avisar(tr("copiar.fallo"));
}

// Estas tres líneas van sin la divisa, como la media: con los botones de al
// lado no cabían y salía "en comisione". Con su divisa, en el title.
function pintarComisiones() {
  const pagadas = comisionesPagadas(gastos);
  const texto = pagadas ? tr("gastos.comisiones", { importe: nf.format(pagadas.total) }) : "";
  const habia = el.gastosComisiones.textContent;
  el.gastosComisiones.hidden = !pagadas;
  el.gastosComisiones.textContent = texto;
  el.gastosComisiones.title = pagadas
    ? `${tr("gastos.comisiones", { importe: `${nf.format(pagadas.total)} ${pagadas.to}` })}. ${tr("gastos.comisionesTitulo")}`
    : "";
  if (habia && texto && habia !== texto) restartAnimation(el.gastosComisiones, "is-tic");
  pintarAhorro();
  pintarCambioViaje();
}

// Con la de hoy en el título: si hoy sale más barato, ya sabes que la divisa
// se ha movido a tu favor durante el viaje. Menos de un 1 % es lo mismo.
function pintarCambioViaje() {
  const c = cambioDelViaje(gastos);
  const nodo = el.gastosCambio;
  const habia = nodo.textContent;
  nodo.hidden = !c;
  if (!c) {
    nodo.textContent = "";
    nodo.title = "";
    return;
  }
  const { cifra, otra } = cifraCambio(c.tasa, c.from, c.to);
  const texto = tr("gastos.cambio", { cifra: `${cifra} ${otra}` });
  nodo.textContent = texto;
  nodo.title = tr("gastos.cambioTitulo", { n: c.n, tasa: textoCambio(c.tasa, c.from, c.to) });
  const tasa = tasaDeHoy(c.from, c.to);
  if (tasa) {
    const hoyCuesta = conComision(tasa, comision);
    const diferencia = hoyCuesta / c.tasa - 1;
    const datos = { tasa: textoCambio(hoyCuesta, c.from, c.to), pct: porCientoEntero(Math.abs(diferencia)) };
    nodo.title += `\n${tr(Math.abs(diferencia) < 0.01 ? "gastos.cambioIgual" : diferencia < 0 ? "gastos.cambioBarato" : "gastos.cambioCaro", datos)}`;
  }
  if (habia && habia !== texto) restartAnimation(nodo, "is-tic");
}

function pintarAhorro() {
  const ahorro = ahorroEnEfectivo(gastos, comision);
  // En negativo es que el cajero se ha llevado más de lo que habría cobrado la tarjeta.
  const pierdes = ahorro?.total < 0;
  const clave = pierdes ? "gastos.ahorroNo" : "gastos.ahorro";
  const importe = ahorro ? Math.abs(ahorro.total) : 0;
  const texto = ahorro ? tr(clave, { importe: nf.format(importe) }) : "";
  const habia = el.gastosAhorro.textContent;
  el.gastosAhorro.hidden = !ahorro;
  el.gastosAhorro.textContent = texto;
  el.gastosAhorro.classList.toggle("is-pierdes", pierdes);
  el.gastosAhorro.title = ahorro
    ? `${tr(clave, { importe: `${nf.format(importe)} ${ahorro.to}` })}. ${tr(pierdes ? "gastos.ahorroNoTitulo" : "gastos.ahorroTitulo", { pct: tr("pct", { n: nfComision.format(comision) }) })}`
    : "";
  if (habia && texto && habia !== texto) restartAnimation(el.gastosAhorro, "is-tic");
  pintarTaxFree();
}

// Solo el país que más da; si el viaje pasa por varios, los otros van en el title.
function pintarTaxFree() {
  const lista = taxFree(gastos);
  const nodo = el.gastosTaxFree;
  const habia = nodo.textContent;
  nodo.hidden = lista.length === 0;
  if (!lista.length) {
    nodo.textContent = "";
    nodo.title = "";
    return;
  }
  const minimo = (d) => `${nfComision.format(d.minimo)} ${d.divisa}`;
  const [primero] = lista;
  const texto = primero.tuya
    ? tr("taxfree.linea", { importe: nf.format(primero.tuya.valor) })
    : tr("taxfree.lineaNada", { minimo: minimo(primero) });
  nodo.textContent = texto;
  nodo.classList.toggle("is-nada", !primero.tuya);
  nodo.title = [
    ...lista.map((d) => {
      if (!d.pasan) return tr("taxfree.nada", { minimo: minimo(d) });
      const partes = [
        tr(d.pasan === 1 ? "taxfree.pasaUna" : "taxfree.pasan", { n: d.pasan, minimo: minimo(d) }),
        tr("taxfree.hasta", {
          valor: `${nf.format(d.devolucion)} ${d.divisa}${d.tuya ? ` (${nf.format(d.tuya.valor)} ${d.tuya.to})` : ""}`,
          iva: tr("pct", { n: nfComision.format(d.iva) }),
        }),
      ];
      if (d.cerca) partes.push(tr(d.cerca === 1 ? "taxfree.cercaUna" : "taxfree.cerca", { n: d.cerca }));
      return partes.join(" ");
    }),
    tr("taxfree.como"),
  ].join("\n");
  if (habia && habia !== texto) restartAnimation(nodo, "is-tic");
}

// Los yenes sin decimales, que "18.000,00 JPY" no lo dice nadie.
const cifraEfectivo = (n, divisa) => `${Number.isInteger(n) ? nfEntero.format(n) : nf.format(n)} ${divisa}`;

// Con algo sacado, lo que te queda; si no, lo pagado en efectivo como antes.
// Y si vas a pagar en efectivo y no hay nada, la invitación a apuntarlo.
function pintarEfectivo() {
  const [cuenta] = efectivoQueda(cajero, gastos);
  const pagado = pagadoEnEfectivo(gastos);
  const habia = el.gastosEfectivo.textContent;
  let texto = "";
  const sobra = cuenta && presupuesto
    ? loQueSobra(presupuesto, gastos, cajero, tasaDeHoy(cuenta.divisa, presupuesto.to))
    : null;
  if (sobra) {
    const dice = tr(sobra.cuando === "ultimo" ? "cajero.sobraUltimo" : "cajero.sobra", { importe: cifraEfectivo(sobra.queda, sobra.divisa) });
    // Sin la divisa, como lo de cada uno: al lado del número de gastos no cabe.
    texto = sobra.valor === null ? dice : tr("cajero.sobraValor", { texto: dice, valor: nf.format(sobra.valor) });
    el.gastosEfectivo.dataset.tono = "sobra";
    el.gastosEfectivo.title = (sobra.valor === null ? "" : tr("cajero.sobraCambio", { valor: `${nf.format(sobra.valor)} ${sobra.to}` }))
      + tr(sobra.cuando === "ultimo" ? "cajero.sobraUltimoTitulo" : "cajero.sobraTitulo");
  } else if (cuenta) {
    texto = cuenta.queda < 0
      ? tr("cajero.faltan", { importe: cifraEfectivo(-cuenta.queda, cuenta.divisa) })
      : tr("cajero.quedan", { importe: cifraEfectivo(cuenta.queda, cuenta.divisa) });
    el.gastosEfectivo.dataset.tono = tonoEfectivo(cuenta);
    el.gastosEfectivo.title = tr("cajero.titulo.quedan", {
      sacado: cifraEfectivo(cuenta.sacado, cuenta.divisa), gastado: cifraEfectivo(cuenta.gastado, cuenta.divisa),
    });
  } else {
    texto = pagado ? tr("gastos.efectivo", { importe: nf.format(pagado.total) })
      : pagoNuevo === "efectivo" ? tr("cajero.anadir") : "";
    delete el.gastosEfectivo.dataset.tono;
    el.gastosEfectivo.title = pagado
      ? `${tr("gastos.efectivo", { importe: `${nf.format(pagado.total)} ${pagado.to}` })}. ${tr("cajero.anadirTitulo")}`
      : tr("cajero.anadirTitulo");
  }
  el.gastosEfectivo.hidden = !texto;
  el.gastosEfectivo.textContent = texto;
  el.gastosEfectivo.classList.toggle("is-vacio", !cuenta && !pagado);
  if (habia && texto && habia !== texto) restartAnimation(el.gastosEfectivo, "is-tic");
  if (!el.cajero.hidden) pintarCajero();
}

// Lo que daría el BCE por lo que has escrito, para que veas de un vistazo si el
// banco te ha cobrado de más.
function pintarPistaCoste() {
  const cantidad = leerImporte(el.cajeroCantidad.value);
  const tasa = tasaDeHoy(el.from.value, el.to.value);
  el.cajeroCoste.placeholder = Number.isFinite(cantidad) && cantidad > 0 && tasa
    ? `≈ ${nf.format(cantidad * tasa)}`
    : tr("cajero.coste");
}

function pintarCajero() {
  const divisa = el.from.value;
  el.cajeroDivisa.textContent = divisa;
  el.cajeroEn.textContent = el.to.value;
  el.cajeroCoste.title = tr("cajero.costeTitulo", { divisa: el.to.value });
  pintarPistaCoste();
  el.cajeroCuentas.replaceChildren(...efectivoQueda(cajero, gastos).map((cuenta) => {
    const fila = document.createElement("li");
    fila.className = "cajero__cuenta";
    fila.dataset.tono = tonoEfectivo(cuenta);
    const cifra = document.createElement("span");
    cifra.className = "cajero__queda";
    cifra.textContent = cuenta.queda < 0 ? `−${cifraEfectivo(-cuenta.queda, cuenta.divisa)}` : cifraEfectivo(cuenta.queda, cuenta.divisa);
    const de = document.createElement("span");
    de.className = "cajero__de";
    de.textContent = cuenta.queda < 0
      ? tr("cajero.falta")
      : tr("cajero.de", { sacado: cifraEfectivo(cuenta.sacado, cuenta.divisa) });
    const barra = document.createElement("span");
    barra.className = "cajero__barra";
    barra.setAttribute("aria-hidden", "true");
    barra.style.setProperty("--queda", cuenta.fraccion);
    fila.append(cifra, de, barra);
    if (retiradaNueva && cajero.some((r) => r.id === retiradaNueva && r.divisa === cuenta.divisa)) fila.classList.add("is-sube");
    return fila;
  }));
  el.cajeroLista.replaceChildren(...cajero.map((r, i) => {
    const fila = document.createElement("li");
    fila.className = "cajero__retirada";
    if (r.id === retiradaNueva) fila.classList.add("is-nueva");
    fila.style.setProperty("--i", i);
    const texto = document.createElement("span");
    texto.textContent = `${nombreDia(isoLocal(new Date(r.cuando)))} · ${cifraEfectivo(r.cantidad, r.divisa)}`;
    if (r.coste) {
      const coste = `${nf.format(r.coste)} ${r.en}`;
      const sobre = sobreElBce(r);
      const cobro = document.createElement("span");
      cobro.className = "cajero__cobro";
      // Medio punto arriba o abajo es lo que se mueve la tasa en un día: lo doy por igual.
      if (sobre !== null && Math.abs(sobre) >= 0.005) {
        cobro.dataset.tono = sobre > 0 ? "caro" : "barato";
        cobro.textContent = ` · ${nf.format(r.coste)} (${sobre > 0 ? "+" : "−"}${tr("pct", { n: nfCajero.format(Math.abs(sobre) * 100) })})`;
      } else {
        cobro.textContent = ` · ${nf.format(r.coste)}`;
      }
      const pct = sobre === null ? "" : tr("pct", { n: nfCajero.format(Math.abs(sobre) * 100) });
      fila.title = sobre === null ? tr("cajero.sinBce", { coste })
        : Math.abs(sobre) < 0.005 ? tr("cajero.igualBce", { coste })
          : tr(sobre > 0 ? "cajero.sobreBce" : "cajero.bajoBce", { coste, pct });
      texto.append(cobro);
    }
    const quitar = document.createElement("button");
    quitar.type = "button";
    quitar.className = "gastos__quitar historial__quitar";
    quitar.textContent = "✕";
    quitar.setAttribute("aria-label", tr("cajero.quitar", { importe: cifraEfectivo(r.cantidad, r.divisa) }));
    quitar.addEventListener("click", () => {
      cajero = quitarRetirada(cajero, r.id);
      guardarViajes();
      pintarEfectivo();
      (el.cajeroLista.querySelector(".gastos__quitar") ?? el.cajeroCantidad).focus();
    });
    fila.append(texto, quitar);
    return fila;
  }));
  retiradaNueva = null;
  pintarSugerenciaCajero();
}

function pintarPersonas(conSalto = false) {
  const { personas } = viajeActivo(viajes);
  el.gastosPersonas.hidden = gastos.length === 0;
  el.gastosPersonas.dataset.varios = personas > 1;
  el.personasN.textContent = `${personas > 1 ? "👥" : "👤"} ${personas}`;
  el.personasN.title = personas > 1 ? tr("personas.titulo", { n: personas }) : tr("personas.solo");
  el.personasMenos.disabled = personas <= 1;
  el.personasMas.disabled = personas >= PERSONAS_MAX;
  const cabeza = porPersona(gastos, personas);
  // Sin la divisa, como la media: al lado de los botones no cabe y ya está en el total.
  // Corto: al lado de los botones "cada uno" no cabía y salía "cada un…". Por
  // encima de mil, sin céntimos, que tampoco cabían. Entero, en el title.
  const corto = cabeza && (cabeza.total >= 1000 ? numeros({ maximumFractionDigits: 0 }) : nf).format(cabeza.total);
  el.personasCabeza.textContent = cabeza ? tr(cabeza.tuyo ? "personas.tuyoCorto" : "personas.cadaCorto", { valor: corto }) : tr("personas.cuantos");
  const datos = cabeza && { valor: `${nf.format(cabeza.total)} ${cabeza.to}`, dia: cabeza.alDia ? `${nf.format(cabeza.alDia)} ${cabeza.to}` : null };
  el.personasCabeza.title = !cabeza ? ""
    : cabeza.tuyo ? tr(datos.dia ? "personas.tuyoAlDia" : "personas.tuyo", datos)
    : tr(datos.dia ? "personas.cadaAlDia" : "personas.cada", datos);
  if (cabeza) el.personasCabeza.title += `. ${tr("gente.abrir")}`;
  el.personasCabeza.disabled = !cabeza;
  if (conSalto) restartAnimation(cabeza ? el.personasCabeza : el.personasN, "is-tic");
}

function onPersonas(paso) {
  const personas = leerPersonas(viajeActivo(viajes).personas + paso);
  if (personas === viajeActivo(viajes).personas) return;
  viajes = cambiarViaje(viajes, viajes.activo, { personas });
  guardarViajes();
  pintarPersonas(true);
  // Las iniciales de la lista dependen de cuántos sois: el que se va deja de salir.
  pintarGastos();
}

function pintarPagador(conSalto = false) {
  const { personas, gente } = viajeActivo(viajes);
  if (pagadorNuevo >= personas) pagadorNuevo = 0;
  const boton = el.gastosPagador;
  boton.hidden = personas < 2;
  boton.textContent = inicialPersona(gente, pagadorNuevo);
  boton.dataset.n = pagadorNuevo % 6;
  boton.classList.toggle("is-otro", pagadorNuevo > 0);
  const nombre = nombrePersona(gente, pagadorNuevo);
  const tuyo = pagadorNuevo === 0;
  boton.title = tuyo ? tr("gente.pagasTitulo") : tr("gente.pagaTitulo", { nombre });
  boton.setAttribute("aria-label", tuyo ? tr("gente.pagas") : tr("gente.paga", { nombre }));
  if (conSalto) restartAnimation(boton, "is-tic");
}

function onCambiarPagador() {
  pagadorNuevo = (pagadorNuevo + 1) % viajeActivo(viajes).personas;
  pintarPagador(true);
}

function pintarCuentasGente() {
  const { personas, gente, saldados } = viajeActivo(viajes);
  const cuentas = cuentasViaje(gastos, personas, saldados);
  if (!cuentas) return cerrarGente();
  const consumo = consumoGente(gastos, personas);
  const dinero = (n) => `${nf.format(n)} ${cuentas.to}`;
  // Los campos se quedan si ya están: si los rehiciera, al escribir un nombre perderías el foco.
  const filas = [...el.genteLista.children];
  while (filas.length > personas) filas.pop().remove();
  cuentas.gente.forEach((p, i) => {
    let fila = filas[i];
    if (!fila) {
      fila = document.createElement("li");
      fila.className = "gente__fila";
      fila.innerHTML = '<span class="gastos__quien"></span><input class="gente__nombre" type="text" autocomplete="off" spellcheck="false"><span class="gente__pagado"><span class="gente__puso"></span><span class="gente__toca"></span></span><span class="gente__saldo"></span>';
      const campo = fila.querySelector("input");
      campo.maxLength = NOMBRE_PERSONA_MAX;
      campo.addEventListener("input", () => onNombrePersona(i, campo.value));
      campo.addEventListener("keydown", (event) => {
        if (event.key === "Enter") campo.blur();
      });
      el.genteLista.append(fila);
    }
    const cara = fila.querySelector(".gastos__quien");
    cara.dataset.n = i % 6;
    cara.textContent = inicialPersona(gente, i);
    const campo = fila.querySelector("input");
    campo.placeholder = nombrePersona([], i);
    campo.setAttribute("aria-label", tr("gente.nombre", { n: i + 1 }));
    if (document.activeElement !== campo) campo.value = gente?.[i] ?? "";
    fila.querySelector(".gente__puso").textContent = tr("gente.puso", { valor: dinero(p.pagado) });
    // Lo que le toca solo si no es igual para todos: si no, es el por cabeza repetido.
    const toca = fila.querySelector(".gente__toca");
    toca.hidden = !consumo || consumo.igual;
    if (!toca.hidden) toca.textContent = tr("gente.toca", { valor: dinero(consumo.gente[i].parte) });
    const saldo = fila.querySelector(".gente__saldo");
    const centimos = Math.round(p.saldo * 100);
    saldo.dataset.tono = centimos > 0 ? "cobra" : centimos < 0 ? "debe" : "";
    saldo.textContent = centimos === 0 ? "✓" : `${centimos > 0 ? "+" : "−"}${nf.format(Math.abs(p.saldo))}`;
  });
  const linea = (clase, texto, i) => {
    const li = document.createElement("li");
    li.className = clase;
    li.style.setProperty("--i", i);
    const frase = document.createElement("span");
    frase.textContent = texto;
    li.append(frase);
    return li;
  };
  const pendientes = cuentas.pagos.length
    ? cuentas.pagos.map((pago, i) => {
      const li = linea("gente__pago", frasePago(pago, gente, cuentas.to), i);
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "gente__saldar";
      boton.textContent = tr("gente.saldar");
      boton.title = tr("gente.saldarTitulo");
      boton.addEventListener("click", () => onSaldar(pago, cuentas.to));
      // Solo a quien te debe a ti: lo que se deben entre ellos no lo cobras tú.
      if (pago.a === 0) {
        const nombre = nombrePersona(gente, pago.de);
        const cobrar = document.createElement("button");
        cobrar.type = "button";
        cobrar.className = "gente__cobrar";
        cobrar.textContent = "💬";
        cobrar.title = tr("gente.cobrar", { nombre });
        cobrar.setAttribute("aria-label", tr("gente.cobrar", { nombre }));
        cobrar.addEventListener("click", () => onCobrar(pago.de, cobrar));
        li.append(cobrar);
      }
      li.append(boton);
      return li;
    })
    : [linea("gente__pago", tr("gente.enPaz"), 0)];
  const hechos = cuentas.saldados.map((s, i) => {
    const li = linea("gente__pago is-saldado", `✓ ${fraseSaldado(s, gente, cuentas.to)}`, pendientes.length + i);
    if (s.id === saldadoNuevo) li.classList.add("is-nueva");
    const quitar = document.createElement("button");
    quitar.type = "button";
    quitar.className = "gastos__quitar historial__quitar";
    quitar.textContent = "✕";
    quitar.title = tr("gente.desaldar");
    quitar.setAttribute("aria-label", tr("gente.desaldar"));
    quitar.addEventListener("click", () => onDesaldar(s.id));
    li.append(quitar);
    return li;
  });
  saldadoNuevo = null;
  el.gentePagos.replaceChildren(...pendientes, ...hechos);
  el.genteDevuelto.hidden = cuentas.devuelto === 0;
  el.genteDevuelto.textContent = tr("gente.devuelto", { devuelto: dinero(cuentas.devuelto), queda: dinero(cuentas.queda) });
}

// Queda apuntado con su importe: si luego cambia un gasto, lo que falte sale solo.
function onSaldar(pago, to) {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const { saldados } = viajeActivo(viajes);
  viajes = cambiarViaje(viajes, viajes.activo, { saldados: saldarPago(saldados, pago, to, { id }) });
  saldadoNuevo = id;
  guardarViajes();
  pintarCuentasGente();
  (el.gentePagos.querySelector(".gente__saldar") ?? el.gentePagos.querySelector(".gastos__quitar"))?.focus();
}

async function onCobrar(quien, boton) {
  const viaje = viajeActivo(viajes);
  const texto = mensajeCobro({ ...viaje, nombre: viaje.nombre || tr("gastos"), gastos }, quien);
  if (!texto) return;
  const bien = await copiar(texto);
  boton.classList.toggle("is-fallo", !bien);
  restartAnimation(boton, "is-hecho");
  clearTimeout(boton.vuelta);
  boton.vuelta = setTimeout(() => boton.classList.remove("is-hecho", "is-fallo"), 1600);
  mostrarFlash([bien ? tr("gente.cobrado", { nombre: nombrePersona(viaje.gente, quien) }) : tr("compartir.fallo")], 2200);
}

function onDesaldar(id) {
  const { saldados } = viajeActivo(viajes);
  viajes = cambiarViaje(viajes, viajes.activo, { saldados: quitarSaldado(saldados, id) });
  guardarViajes();
  pintarCuentasGente();
  (el.gentePagos.querySelector(".gente__saldar") ?? el.genteLista.querySelector("input"))?.focus();
}

function onNombrePersona(i, nombre) {
  const { gente } = viajeActivo(viajes);
  viajes = cambiarViaje(viajes, viajes.activo, { gente: ponerNombre(gente, i, nombre) });
  guardarViajes();
  pintarCuentasGente();
  pintarPagador();
  pintarGastos();
}

function abrirGente() {
  if (!cuentasViaje(gastos, viajeActivo(viajes).personas)) return;
  cerrarViajes();
  cerrarCajero();
  cerrarCategorias();
  dejarDeEditarPresupuesto();
  const arriba = el.gastosPersonas.getBoundingClientRect().bottom - el.gastos.getBoundingClientRect().top;
  el.gente.style.setProperty("--cajero-arriba", `${Math.round(arriba) + 4}px`);
  el.genteLista.replaceChildren();
  el.gente.hidden = false;
  el.personasCabeza.setAttribute("aria-expanded", "true");
  pintarCuentasGente();
  el.genteLista.querySelector("input")?.focus();
}

function cerrarGente() {
  if (el.gente.hidden) return false;
  el.gente.hidden = true;
  el.personasCabeza.setAttribute("aria-expanded", "false");
  return true;
}

// La tasa de arriba solo vale si va a la divisa del presupuesto.
function pintarSugerenciaCajero() {
  const boton = el.cajeroSugerencia;
  const tasa = presupuesto && el.to.value === presupuesto.to ? rate : null;
  const s = presupuesto ? cuantoSacar(presupuesto, gastos, cajero, el.from.value, tasa) : null;
  const habia = boton.textContent;
  boton.hidden = !s;
  if (!s) return;
  boton.disabled = s.sacar === 0;
  boton.dataset.sacar = s.sacar;
  boton.textContent = s.sacar === 0 ? tr("cajero.llega")
    : tr(s.dias === 1 ? "cajero.sacaHoy" : "cajero.saca", { importe: cifraEfectivo(s.sacar, s.divisa), dias: s.dias });
  const pct = numeros({ style: "percent", maximumFractionDigits: 0 }).format(s.parte);
  boton.title = s.sacar === 0 ? "" : s.parte < 1 ? tr("cajero.sacaParte", { pct }) : tr("cajero.sacaTodo");
  if (habia !== boton.textContent) restartAnimation(boton, "is-nueva");
}

function onSugerencia() {
  el.cajeroCantidad.value = nfEntero.format(Number(el.cajeroSugerencia.dataset.sacar));
  restartAnimation(el.cajeroCantidad, "is-cambiado");
  el.cajeroCantidad.focus();
}

// Donde estás hoy, con lo que llevas al día allí. Sin tramos, una invitación
// discreta, y solo cuando ya hay gastos: antes no hay nada que partir.
function pintarTramo() {
  const { tramos } = viajeActivo(viajes);
  const boton = el.gastosTramo;
  boton.hidden = gastos.length === 0 && leerTramos(tramos).length === 0;
  if (boton.hidden) return;
  const hoyIso = hoy();
  const resumen = resumenTramos(gastos, tramos, { hoyIso, hasta: presupuesto?.hasta });
  const ahora = resumen.find((t) => t.actual) ?? resumen.filter((t) => t.id).at(-1);
  boton.classList.toggle("is-vacio", !ahora);
  if (!ahora) {
    boton.textContent = tr("tramos.invitar");
    boton.title = tr("tramos.invitarTitulo");
  } else {
    boton.textContent = ahora.alDia === null ? tr("tramos.boton", { nombre: ahora.nombre })
      : tr("tramos.botonDia", { nombre: ahora.nombre, valor: nf.format(ahora.alDia) });
    boton.title = tr("tramos.botonTitulo", { nombre: ahora.nombre, desde: nombreDia(ahora.desde, hoyIso).toLocaleLowerCase(localeActual()) });
  }
  if (!el.tramos.hidden) pintarTramos();
}

function pintarTramos() {
  const { tramos } = viajeActivo(viajes);
  const hoyIso = hoy();
  const resumen = resumenTramos(gastos, tramos, { hoyIso, hasta: presupuesto?.hasta });
  const maximo = Math.max(...resumen.map((t) => t.alDia ?? 0), 0);
  el.tramosLista.replaceChildren(...resumen.map((t, i) => {
    const fila = document.createElement("li");
    fila.className = "tramos__fila";
    fila.style.setProperty("--i", i);
    fila.style.setProperty("--peso", maximo > 0 && t.alDia ? t.alDia / maximo : 0);
    fila.classList.toggle("is-actual", t.actual);
    fila.classList.toggle("is-antes", !t.id);
    if (t.id && t.id === tramoNuevo) fila.classList.add("is-nueva");
    const nombre = document.createElement("span");
    nombre.className = "tramos__nombre";
    nombre.textContent = t.id ? t.nombre : tr("tramos.antes");
    if (t.caro) {
      const fuego = document.createElement("span");
      fuego.className = "tramos__caro";
      fuego.textContent = "🔥";
      fuego.title = tr("tramos.caro");
      nombre.append(fuego);
    }
    const cuando = document.createElement("span");
    cuando.className = "tramos__cuando";
    if (t.id) {
      const desde = nombreDia(t.desde, hoyIso).toLocaleLowerCase(localeActual());
      cuando.textContent = t.dias > 0
        ? tr("tramos.dias", { desde, dias: t.dias === 1 ? tr("tramos.dia1") : tr("tramos.diasN", { n: t.dias }) })
        : tr("tramos.aun", { desde });
    }
    const cifras = document.createElement("span");
    cifras.className = "tramos__cifras";
    const total = document.createElement("span");
    total.className = "tramos__total";
    total.textContent = t.to ? `${nf.format(t.total)} ${t.to}` : "";
    const dia = document.createElement("span");
    dia.className = "tramos__dia";
    dia.textContent = t.alDia === null ? "" : tr("tramos.alDia", { valor: nf.format(t.alDia) });
    cifras.append(total, dia);
    fila.append(nombre, cuando, cifras);
    if (t.id) {
      const quitar = document.createElement("button");
      quitar.type = "button";
      quitar.className = "gastos__quitar historial__quitar";
      quitar.textContent = "✕";
      quitar.setAttribute("aria-label", tr("tramos.quitar", { nombre: t.nombre }));
      quitar.addEventListener("click", () => onQuitarTramo(t.id));
      fila.append(quitar);
    } else {
      fila.append(document.createElement("span"));
    }
    return fila;
  }));
  tramoNuevo = null;
  el.tramosForm.title = tr("tramos.pista");
}

// Con algo pendiente, cuánto suma. Si no hay nada, la invitación solo con
// presupuesto: es donde se nota.
function pintarPendiente() {
  const { pendientes } = viajeActivo(viajes);
  const lista = leerPendientes(pendientes);
  const boton = el.gastosPendiente;
  boton.hidden = lista.length === 0 && !presupuesto;
  if (boton.hidden) return;
  boton.classList.toggle("is-vacio", lista.length === 0);
  if (lista.length === 0) {
    boton.textContent = tr("pendientes.invitar");
    boton.title = tr("pendientes.invitarTitulo");
  } else {
    const to = presupuesto?.to ?? sumarPorDivisa(lista)[0].to;
    boton.textContent = tr("pendientes.boton", { valor: nf.format(totalPendiente(lista, to)) });
    boton.title = tr("pendientes.botonTitulo", { n: lista.length });
  }
  if (!el.pendientes.hidden) pintarPendientes();
}

function pintarPendientes() {
  const lista = leerPendientes(viajeActivo(viajes).pendientes);
  el.pendientesDivisa.textContent = el.from.value;
  el.pendientesLista.replaceChildren(...lista.map((p, i) => {
    const fila = document.createElement("li");
    fila.className = "pendientes__fila";
    fila.style.setProperty("--i", i);
    if (p.id === pendienteNuevo) fila.classList.add("is-nueva");
    const que = document.createElement("span");
    que.className = "pendientes__que";
    que.textContent = `${EMOJI_CATEGORIA[p.categoria]} ${p.concepto || tr("gastos.sinConcepto")}`;
    const cuanto = document.createElement("span");
    cuanto.className = "pendientes__cuanto";
    cuanto.textContent = p.from === p.to ? `${nf.format(p.valor)} ${p.to}` : `${nf.format(p.cantidad)} ${p.from} ≈ ${nf.format(p.valor)} ${p.to}`;
    const pagar = document.createElement("button");
    pagar.type = "button";
    pagar.className = "gente__saldar";
    pagar.textContent = tr("pendientes.pagar");
    pagar.title = tr("pendientes.pagarTitulo");
    pagar.addEventListener("click", () => onPagarPendiente(p.id));
    const quitar = document.createElement("button");
    quitar.type = "button";
    quitar.className = "gastos__quitar historial__quitar";
    quitar.textContent = "✕";
    quitar.setAttribute("aria-label", tr("pendientes.quitar", { concepto: p.concepto || tr("gastos.sinConcepto") }));
    quitar.addEventListener("click", () => onQuitarPendiente(p.id));
    fila.append(que, cuanto, pagar, quitar);
    return fila;
  }));
  pendienteNuevo = null;
}

function abrirPendientes() {
  cerrarViajes();
  cerrarCajero();
  cerrarTramos();
  cerrarCurva();
  cerrarHoras();
  cerrarGente();
  cerrarCategorias();
  dejarDeEditarPresupuesto();
  const arriba = el.gastosSuma.getBoundingClientRect().bottom - el.gastos.getBoundingClientRect().top;
  el.pendientes.style.setProperty("--cajero-arriba", `${Math.round(arriba) + 4}px`);
  el.pendientesConcepto.value = "";
  el.pendientesCantidad.value = "";
  el.pendientes.hidden = false;
  el.gastosPendiente.setAttribute("aria-expanded", "true");
  pintarPendientes();
  el.pendientesConcepto.focus();
}

function cerrarPendientes() {
  if (el.pendientes.hidden) return false;
  el.pendientes.hidden = true;
  el.gastosPendiente.setAttribute("aria-expanded", "false");
  return true;
}

// En la divisa del presupuesto, que es donde cuenta; sin él, en la de abajo.
// En la misma de arriba no, igual que un gasto: no hay nada que convertir.
function onApuntarPendiente(event) {
  event.preventDefault();
  const from = el.from.value;
  const to = presupuesto?.to ?? el.to.value;
  const cantidad = leerImporte(el.pendientesCantidad.value);
  if (!(cantidad > 0)) {
    restartAnimation(el.pendientesCantidad, "is-mal");
    el.pendientesCantidad.focus();
    return;
  }
  const tasa = from === to ? null : tasaDeHoy(from, to);
  if (!tasa) {
    el.pendientesCantidad.title = tr("pendientes.sinTasa", { from, to });
    restartAnimation(el.pendientesCantidad, "is-mal");
    return;
  }
  const pendiente = crearPendiente({
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    from, to, cantidad, valor: cantidad * tasa, concepto: el.pendientesConcepto.value, cuando: Date.now(),
  });
  if (!pendiente) return;
  const { pendientes } = viajeActivo(viajes);
  viajes = cambiarViaje(viajes, viajes.activo, { pendientes: apuntarPendiente(pendientes, pendiente) });
  pendienteNuevo = pendiente.id;
  el.pendientesConcepto.value = "";
  el.pendientesCantidad.value = "";
  el.pendientesCantidad.title = "";
  guardarViajes();
  pintarGastos();
  el.pendientesConcepto.focus();
}

function onQuitarPendiente(id) {
  const { pendientes } = viajeActivo(viajes);
  viajes = cambiarViaje(viajes, viajes.activo, { pendientes: quitarPendiente(pendientes, id) });
  guardarViajes();
  pintarGastos();
  (el.pendientesLista.querySelector(".gente__saldar") ?? el.pendientesConcepto).focus();
}

// Pasa a la lista como uno recién apuntado, con la tasa y la comisión de ahora.
function onPagarPendiente(id) {
  const { pendientes } = viajeActivo(viajes);
  const pendiente = leerPendientes(pendientes).find((p) => p.id === id);
  if (!pendiente) return;
  const gasto = alCambioDelCajero(pagarPendiente(pendiente, {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    cuando: Date.now(),
    tasa: tasaDeHoy(pendiente.from, pendiente.to),
    comision,
  }), cajero);
  if (!gasto) return;
  viajes = cambiarViaje(viajes, viajes.activo, { pendientes: quitarPendiente(pendientes, id) });
  gastos = apuntarGasto(gastos, gasto);
  gastoNuevo = gasto.id;
  if (filtroCategoria && filtroCategoria !== gasto.categoria) filtroCategoria = null;
  dejarVerGasto(gasto);
  guardarViajes();
  pintarGastos();
  restartAnimation(el.abrirGastos, "is-apuntado");
  el.gastosLista.scrollTop = 0;
  (el.pendientesLista.querySelector(".gente__saldar") ?? el.pendientesConcepto).focus();
}

// El botón solo tiene sentido con un presupuesto de varios días.
function pintarCurvaBoton() {
  const curva = curvaPresupuesto(presupuesto, gastos, hoy(), viajeActivo(viajes).pendientes);
  el.curvaAbrir.hidden = !curva;
  if (!curva) cerrarCurva();
  else if (!el.curva.hidden) pintarCurva();
}

function abrirCurva() {
  cerrarViajes();
  cerrarCajero();
  cerrarTramos();
  cerrarPendientes();
  cerrarHoras();
  cerrarGente();
  cerrarCategorias();
  dejarDeEditarPresupuesto();
  const arriba = el.gastosSuma.getBoundingClientRect().bottom - el.gastos.getBoundingClientRect().top;
  el.curva.style.setProperty("--cajero-arriba", `${Math.round(arriba) + 4}px`);
  el.curva.hidden = false;
  el.curvaAbrir.setAttribute("aria-expanded", "true");
  pintarCurva(true);
  el.curvaSvg.focus();
}

function cerrarCurva() {
  if (el.curva.hidden) return false;
  el.curva.hidden = true;
  el.curvaAbrir.setAttribute("aria-expanded", "false");
  curvaMirando = null;
  return true;
}

const SVG_NS = "http://www.w3.org/2000/svg";
const trazo = (tipo, atributos) => {
  const nodo = document.createElementNS(SVG_NS, tipo);
  for (const [k, v] of Object.entries(atributos)) nodo.setAttribute(k, v);
  return nodo;
};

// En píxeles de verdad y no con un viewBox estirado: así las líneas son de 2px
// y los puntos, redondos, mida lo que mida el panel.
function pintarCurva(entrando = false) {
  const curva = curvaPresupuesto(presupuesto, gastos, hoy(), viajeActivo(viajes).pendientes);
  if (!curva) return;
  const ancho = Math.max(el.curvaLienzo.clientWidth, 120);
  const alto = 96;
  const margen = { arriba: 8, abajo: 4, lados: 5 };
  const { puntos, importe, prevision } = curva;
  const n = puntos.length;
  const maximo = Math.max(importe, prevision ?? 0, ...puntos.map((p) => p.gastado ?? 0)) * 1.04;
  // De la salida (0) al final de cada día (1…n): todo arranca de cero.
  const x = (k) => margen.lados + (k / n) * (ancho - 2 * margen.lados);
  const y = (v) => alto - margen.abajo - (v / maximo) * (alto - margen.arriba - margen.abajo);
  const svg = el.curvaSvg;
  svg.setAttribute("viewBox", `0 0 ${ancho} ${alto}`);
  svg.setAttribute("width", ancho);
  svg.setAttribute("height", alto);
  const linea = (lista) => lista.map(([i, v], k) => `${k ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const partes = [
    trazo("line", { class: "curva__base", x1: 0, x2: ancho, y1: y(0), y2: y(0) }),
    trazo("line", { class: "curva__tope", x1: 0, x2: ancho, y1: y(importe), y2: y(importe) }),
    trazo("path", { class: "curva__ideal", d: linea([[0, 0], ...puntos.map((p, i) => [i + 1, p.ideal])]) }),
  ];
  const hechos = puntos.map((p, i) => [i + 1, p.gastado]).filter(([, v]) => v !== null);
  const ultimo = hechos.at(-1);
  if (ultimo && prevision !== null && curva.hoy !== null && ultimo[0] < n) {
    partes.push(trazo("path", {
      class: `curva__prevision${prevision > importe ? " is-pasa" : ""}`,
      d: linea([ultimo, [n, prevision]]),
    }));
  }
  if (hechos.length) {
    const torcio = curva.torcio ? puntos.findIndex((p) => p.dia === curva.torcio) : -1;
    if (torcio >= 0) partes.push(trazo("line", { class: "curva__torcio", x1: x(torcio + 1), x2: x(torcio + 1), y1: margen.arriba, y2: y(0) }));
    partes.push(trazo("path", { class: `curva__gastado${entrando ? " is-dibujando" : ""}`, d: linea([[0, 0], ...hechos]), pathLength: 100 }));
    partes.push(trazo("circle", { class: "curva__punto", cx: x(ultimo[0]), cy: y(ultimo[1]), r: 4 }));
  }
  partes.push(trazo("line", { class: "curva__cruz", id: "curva-cruz", x1: 0, x2: 0, y1: margen.arriba, y2: y(0), visibility: "hidden" }));
  svg.replaceChildren(...partes);
  svg.dataset.n = n;
  svg.dataset.ancho = ancho;

  el.curvaClavePrevision.hidden = !(prevision !== null && curva.hoy !== null);
  el.curvaDesde.textContent = nombreDia(puntos[0].dia).toLocaleLowerCase(localeActual());
  el.curvaHasta.textContent = nombreDia(puntos[n - 1].dia).toLocaleLowerCase(localeActual());
  const dinero = (v) => `${nf.format(v)} ${curva.to}`;
  let texto = "";
  if (!ultimo) texto = tr("curva.antes");
  else if (curva.hoy === null) texto = tr("curva.acabado", { gastado: dinero(ultimo[1]), importe: dinero(importe) });
  else if (curva.torcio) {
    const hoyPunto = puntos[ultimo[0] - 1];
    // Con la fecha y no "ayer": "desde el ayer" no se dice.
    texto = tr("curva.torcio", { dia: fechaCorta(curva.torcio), sobra: dinero(hoyPunto.gastado - hoyPunto.ideal) });
  } else texto = tr("curva.debajo", { margen: dinero(puntos[ultimo[0] - 1].ideal - ultimo[1]) });
  el.curvaTexto.textContent = texto;
  svg.setAttribute("aria-label", tr("curva.aria", { texto }));
  if (curvaMirando !== null) mirarCurva(null, curvaMirando);
}

// El día más cerca del ratón (o de las flechas), con su raya y su cuenta.
function mirarCurva(fraccion, indice = null) {
  const curva = curvaPresupuesto(presupuesto, gastos, hoy(), viajeActivo(viajes).pendientes);
  const cruz = el.curvaSvg.querySelector("#curva-cruz");
  if (!curva || !cruz || (fraccion === null && indice === null)) {
    curvaMirando = null;
    el.curvaTip.hidden = true;
    cruz?.setAttribute("visibility", "hidden");
    return;
  }
  const n = curva.puntos.length;
  const i = indice ?? Math.min(Math.max(Math.round(fraccion * n) - 1, 0), n - 1);
  curvaMirando = i;
  const p = curva.puntos[i];
  const ancho = Number(el.curvaSvg.dataset.ancho);
  const cx = 5 + ((i + 1) / n) * (ancho - 10);
  cruz.setAttribute("x1", cx);
  cruz.setAttribute("x2", cx);
  cruz.setAttribute("visibility", "visible");
  const dinero = (v) => `${nf.format(v)} ${curva.to}`;
  const dia = nombreDia(p.dia);
  el.curvaTip.textContent = p.gastado === null
    ? tr("curva.tipFuturo", { dia, ideal: dinero(p.ideal) })
    : tr("curva.tip", { dia, gastado: dinero(p.gastado), ideal: dinero(p.ideal) });
  el.curvaTip.hidden = false;
  // Pegado a la raya, pero sin salirse del panel por ningún lado.
  const tip = el.curvaTip.offsetWidth;
  el.curvaTip.style.left = `${Math.min(Math.max(cx - tip / 2, 0), ancho - tip)}px`;
}

function onTeclaCurva(event) {
  const n = curvaPresupuesto(presupuesto, gastos, hoy(), viajeActivo(viajes).pendientes)?.puntos.length ?? 0;
  if (!n || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const ahora = curvaMirando ?? (event.key === "ArrowLeft" ? n : -1);
  const siguiente = event.key === "Home" ? 0 : event.key === "End" ? n - 1
    : Math.min(Math.max(ahora + (event.key === "ArrowRight" ? 1 : -1), 0), n - 1);
  mirarCurva(null, siguiente);
}

function abrirTramos() {
  cerrarViajes();
  cerrarCajero();
  cerrarPendientes();
  cerrarCurva();
  cerrarHoras();
  cerrarGente();
  cerrarCategorias();
  dejarDeEditarPresupuesto();
  const arriba = el.gastosSuma.getBoundingClientRect().bottom - el.gastos.getBoundingClientRect().top;
  el.tramos.style.setProperty("--cajero-arriba", `${Math.round(arriba) + 4}px`);
  el.tramosNombre.value = "";
  el.tramosDesde.value = hoy();
  el.tramos.hidden = false;
  el.gastosTramo.setAttribute("aria-expanded", "true");
  pintarTramos();
  el.tramosNombre.focus();
}

function cerrarTramos() {
  if (el.tramos.hidden) return false;
  el.tramos.hidden = true;
  el.gastosTramo.setAttribute("aria-expanded", "false");
  return true;
}

function onPonerTramo(event) {
  event.preventDefault();
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const { tramos } = viajeActivo(viajes);
  const desde = el.tramosDesde.value || hoy();
  const nuevos = ponerTramo(tramos, { id, nombre: el.tramosNombre.value, desde });
  if (JSON.stringify(nuevos) === JSON.stringify(leerTramos(tramos))) {
    restartAnimation(el.tramosNombre, "is-mal");
    el.tramosNombre.focus();
    return;
  }
  tramoNuevo = nuevos.find((t) => t.desde === desde)?.id ?? null;
  viajes = cambiarViaje(viajes, viajes.activo, { tramos: nuevos });
  el.tramosNombre.value = "";
  guardarViajes();
  pintarGastos();
  el.tramosNombre.focus();
}

function onQuitarTramo(id) {
  const { tramos } = viajeActivo(viajes);
  viajes = cambiarViaje(viajes, viajes.activo, { tramos: quitarTramo(tramos, id) });
  guardarViajes();
  pintarGastos();
  (el.tramosLista.querySelector(".gastos__quitar") ?? el.tramosNombre).focus();
}

function abrirCajero() {
  cerrarViajes();
  cerrarTramos();
  cerrarPendientes();
  cerrarCurva();
  cerrarHoras();
  cerrarGente();
  cerrarCategorias();
  dejarDeEditarPresupuesto();
  const arriba = el.gastosSuma.getBoundingClientRect().bottom - el.gastos.getBoundingClientRect().top;
  el.cajero.style.setProperty("--cajero-arriba", `${Math.round(arriba) + 4}px`);
  el.cajeroCantidad.value = "";
  el.cajero.hidden = false;
  el.gastosEfectivo.setAttribute("aria-expanded", "true");
  pintarCajero();
  el.cajeroCantidad.focus();
}

function cerrarCajero() {
  if (el.cajero.hidden) return false;
  el.cajero.hidden = true;
  el.gastosEfectivo.setAttribute("aria-expanded", "false");
  return true;
}

// Vale lo mismo que en la cantidad de arriba: "20k" son veinte mil.
function onSacar(event) {
  event.preventDefault();
  const retirada = crearRetirada({
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    cantidad: leerImporte(el.cajeroCantidad.value),
    divisa: el.from.value,
    cuando: Date.now(),
    coste: leerImporte(el.cajeroCoste.value),
    en: el.to.value,
    bce: tasaDeHoy(el.from.value, el.to.value),
  });
  if (!retirada) {
    restartAnimation(el.cajeroCantidad, "is-mal");
    el.cajeroCantidad.focus();
    return;
  }
  cajero = apuntarRetirada(cajero, retirada);
  retiradaNueva = retirada.id;
  el.cajeroCantidad.value = "";
  el.cajeroCoste.value = "";
  guardarViajes();
  pintarEfectivo();
  el.cajeroCantidad.focus();
}

function pintarGastos() {
  const n = gastos.length;
  el.gastosCuenta.hidden = n === 0;
  el.gastosCuenta.textContent = n;
  el.abrirGastos.setAttribute("aria-label", n ? tr("gastos.cuenta", { n }) : tr("gastos"));
  pintarBotonGasto();
  if (el.gastos.hidden) return;

  pintarTituloViaje();
  const totales = n ? sumarPorDivisa(gastos) : [{ to: el.to.value, total: 0 }];
  const suma = textoTotales(totales);
  const una = totales.length === 1 ? totales[0] : null;
  // Si está diciendo "Copiado", el total nuevo espera a que acabe.
  if (el.gastosSuma.classList.contains("is-copiado") || el.gastosSuma.classList.contains("is-fallo")) {
    pararContador();
    el.gastosSuma.dataset.antes = suma;
  } else if (el.gastosSuma.textContent !== suma && contador?.final !== suma) {
    const habia = el.gastosSuma.textContent !== "";
    const desde = contador?.va ?? sumaContada?.total;
    // Al abrir o cambiar de viaje no cuento: solo cuando apuntas o quitas algo.
    if (habia && !cascadaGastos && una && sumaContada?.to === una.to && desde !== undefined && !sinMovimiento.matches) {
      contarSuma(desde, una, suma);
    } else {
      pararContador();
      el.gastosSuma.textContent = suma;
    }
    if (habia) restartAnimation(el.gastosSuma, "is-tic");
  }
  sumaContada = una;
  el.gastosN.textContent = n === 0 ? "" : n === 1 ? tr("gastos.uno") : tr("gastos.n", { n });
  const porGasto = mediaPorGasto(gastos);
  el.gastosN.title = porGasto ? tr("gastos.porGasto", { valor: `${nf.format(porGasto.media)} ${porGasto.to}` }) : "";
  const media = mediaPorDia(gastos);
  el.gastosMedia.hidden = !media;
  if (media) {
    // Hoy solo al lado de la media: solo, ya lo dice la lista; con ella ves si hoy vas por encima.
    // Sin la divisa, que ya está en el total y si no, al lado de los botones no cabe.
    const deHoy = gastadoHoy(gastos);
    el.gastosMedia.textContent = deHoy
      ? tr("gastos.hoyMedia", { hoy: nf.format(deHoy.total), media: nf.format(media.media) })
      : tr("gastos.media", { media: `${nf.format(media.media)} ${media.to}` });
    el.gastosMedia.title = tr("gastos.mediaTitulo", { dias: media.dias });
  }
  pintarComisiones();
  pintarEfectivo();
  pintarTramo();
  pintarPendiente();
  pintarPersonas();
  pintarPagador();
  if (!el.gente.hidden) pintarCuentasGente();

  pintarDesglose();
  // Buscando, las categorías se esconden: busco en todos.
  if (n < 2) cerrarBusqueda();
  if (!el.buscar.hidden) el.desglose.hidden = true;
  const visibles = buscarGastos(filtroCategoria ? gastos.filter((g) => g.categoria === filtroCategoria) : gastos, busqueda);
  pintarBusqueda(visibles);
  if (n < 3) ordenado = false;
  el.gastosOrdenar.hidden = n < 3;
  el.gastosOrdenar.setAttribute("aria-pressed", String(Boolean(ordenado)));
  el.gastosOrdenar.dataset.orden = ordenado || "";
  el.gastosOrdenar.title = tr(ordenado === "caro" ? "ordenar.barato" : ordenado ? "ordenar.dias" : "ordenar");
  el.gastosOrdenar.setAttribute("aria-label", el.gastosOrdenar.title);
  if (ordenado && visibles.length > 0) {
    const lista = ordenarPorImporte(visibles, ordenado === "barato");
    const pesos = pesoDeLosGastos(lista);
    const cabeza = document.createElement("li");
    cabeza.className = "gastos__dia gastos__dia--orden";
    const nombre = document.createElement("span");
    nombre.textContent = tr(ordenado === "barato" ? "ordenar.cabezaBarato" : "ordenar.cabeza");
    const suma = document.createElement("span");
    suma.className = "gastos__dia-suma";
    suma.textContent = textoTotales(sumarPorDivisa(lista));
    cabeza.append(nombre, suma);
    el.gastosLista.replaceChildren(cabeza, ...lista.map((gasto, i) => crearFilaGasto(gasto, i, pesos[i])));
  } else {
    let i = 0;
    const fijos = visibles.filter(esFijo);
    const dias = gastosPorDia(delDiaADia(visibles));
    const pesos = pesoDeLosDias(dias);
    // Con todos los del día, no solo los que se ven: filtrando por comida, la
    // cena sigue sin ser lo más caro si ese día estuvo el hotel.
    const reyes = masCarosDelDia(gastos);
    // Filtrando o buscando, un día sin taxis no es un día sin gastos.
    const conHuecos = !filtroCategoria && !busqueda.trim();
    const arriba = fijos.length ? [crearCabezaFijos(fijos), ...fijos.map((gasto) => crearFilaGasto(gasto, i++))] : [];
    el.gastosLista.replaceChildren(...arriba, ...dias.flatMap((dia, d) => {
      const hueco = conHuecos && d > 0 ? huecoEntre(dias[d - 1].dia, dia.dia) : null;
      return [
        ...(hueco ? [crearHueco(hueco, d)] : []),
        crearDiaGastos(dia, pesos[d], d),
        ...dia.gastos.map((gasto) => crearFilaGasto(gasto, i++, undefined, reyes.has(gasto.id))),
      ];
    }));
    reyesAntes = reyes;
  }
  cascadaGastos = false;
  gastoNuevo = null;
  pintarPresupuesto();
  const nada = n > 0 && visibles.length === 0;
  el.gastosVacio.hidden = n > 0 && !nada;
  el.gastosVacio.textContent = nada ? tr("buscar.nada", { busqueda: busqueda.trim() }) : tr("gastos.vacio");
  el.gastosVacio.classList.toggle("is-busqueda", nada);
  el.buscarAbrir.hidden = n < 2;
  el.gastosVaciar.hidden = n === 0;
  el.gastosCsv.hidden = n === 0;
  el.gastosCompartir.hidden = n === 0;
}

function pintarBusqueda(visibles) {
  const texto = el.buscar.hidden || !busqueda.trim() ? ""
    : visibles.length === 0 ? tr("buscar.ninguno")
      : tr(visibles.length === 1 ? "buscar.uno" : "buscar.total", { n: visibles.length, total: textoTotales(sumarPorDivisa(visibles)) });
  if (el.buscarTotal.textContent === texto) return;
  el.buscarTotal.textContent = texto;
  el.buscarTotal.classList.toggle("is-nada", visibles.length === 0);
  if (texto) restartAnimation(el.buscarTotal, "is-tic");
}

function abrirBusqueda() {
  cerrarCategorias();
  filtroCategoria = null;
  el.buscar.hidden = false;
  el.buscarAbrir.setAttribute("aria-expanded", "true");
  restartAnimation(el.buscar, "is-nuevo");
  pintarGastos();
  el.buscarCampo.focus();
}

// Sin pintar: quien la cierra ya pinta después.
function cerrarBusqueda() {
  if (el.buscar.hidden) return false;
  el.buscar.hidden = true;
  busqueda = "";
  el.buscarCampo.value = "";
  el.buscarTotal.textContent = "";
  el.buscarAbrir.setAttribute("aria-expanded", "false");
  return true;
}

// Si lo que apuntas no casa con lo que buscas, no lo verías: fuera la búsqueda.
function dejarVerGasto(gasto) {
  if (busqueda && buscarGastos([gasto], busqueda).length === 0) cerrarBusqueda();
}

function onTeclaBuscar(event) {
  if (event.key !== "Escape") return;
  event.preventDefault();
  event.stopPropagation();
  // El primer Escape borra lo escrito; el segundo, cierra.
  if (el.buscarCampo.value) {
    el.buscarCampo.value = "";
    busqueda = "";
  } else {
    cerrarBusqueda();
    el.buscarAbrir.focus();
  }
  pintarGastos();
}

function pintarPresupuesto() {
  const { pendientes } = viajeActivo(viajes);
  const estado = estadoPresupuesto(presupuesto, gastos, hoy(), pendientes);
  el.presupuestoAnadir.hidden = Boolean(estado);
  el.presupuestoVer.hidden = !estado;
  pintarCurvaBoton();
  if (!estado) {
    delete el.presupuestoVer.dataset.tono;
    return;
  }
  const dinero = (n) => `${nf.format(n)} ${presupuesto.to}`;
  const dia = diaDelViaje(presupuesto, gastos);
  // Si a este ritmo no llegas, eso importa más que el "al día", que pasa al título.
  // Y "Quedan" a secas y sin divisa, que si no la fecha no cabe.
  const llega = hastaCuandoLlega(presupuesto, gastos, hoy(), pendientes);
  const alli = llega ? pintarAlDiaAlli(null) : pintarAlDiaAlli(estado.porDia);
  const partes = estado.queda < 0
    ? [tr("presupuesto.pasado", { pasado: dinero(-estado.queda) })]
    : llega || alli
      ? [tr("presupuesto.quedaCorto", { queda: nf.format(estado.queda) })]
      : [tr("presupuesto.queda", { queda: dinero(estado.queda) })];
  if (llega) partes.push(tr("presupuesto.llega", { fecha: fechaCorta(llega) }));
  else if (estado.porDia !== null && !alli) partes.push(tr("presupuesto.alDia", { porDia: nf.format(estado.porDia) }));
  el.presupuestoTexto.textContent = partes.join(" · ");
  // Antes de salir, el hueco del "Día 3/7" es para la cuenta atrás.
  const falta = dia ? null : cuentaAtras(presupuesto);
  el.presupuestoDia.hidden = !dia && falta === null;
  el.presupuestoDia.classList.toggle("is-cuenta", falta !== null);
  if (dia) el.presupuestoDia.textContent = tr("presupuesto.dia", dia);
  if (falta !== null) {
    const texto = textoCuentaAtras(falta);
    if (el.presupuestoDia.textContent !== texto) restartAnimation(el.presupuestoDia, "is-despega");
    el.presupuestoDia.textContent = texto;
  }
  el.presupuestoVer.title = tr("presupuesto.titulo", {
    gastado: nf.format(estado.gastado), importe: dinero(presupuesto.importe), fecha: fechaLarga(presupuesto.hasta),
  });
  if (alli) el.presupuestoVer.title += `\n${tr("presupuesto.alliTitulo", { porDia: dinero(estado.porDia), importe: alli })}`;
  if (llega) el.presupuestoVer.title += `\n${tr("presupuesto.llegaTitulo", { fecha: fechaLarga(llega), porDia: dinero(estado.porDia) })}`;
  if (falta !== null) el.presupuestoVer.title += `\n${tr(falta === 1 ? "presupuesto.saleManana" : "presupuesto.saleEl", { fecha: fechaLarga(presupuesto.desde), n: falta })}`;
  if (estado.pendiente > 0) {
    el.presupuestoVer.title += `\n${tr("pendientes.presupuesto", { pendiente: dinero(estado.pendiente), libre: dinero(estado.libre) })}`;
  }
  const prevision = previsionViaje(presupuesto, gastos, hoy(), pendientes);
  if (prevision) el.presupuestoVer.title += `\n${textoPrevision(prevision, presupuesto.importe)}`;
  // La marca es hasta dónde deberías llevar gastado al acabar hoy, si fueras
  // parejo. El último día no la pongo: estaría pegada al final y no dice nada.
  const marca = dia && dia.dia < dia.total;
  el.presupuestoHoy.hidden = !marca;
  if (marca) {
    el.presupuestoHoy.style.left = `${(dia.dia / dia.total) * 100}%`;
    el.presupuestoHoy.classList.toggle("is-adelantado", estado.fraccion > dia.dia / dia.total);
    el.presupuestoVer.title += `\n${tr("presupuesto.marca", dia)}`;
  }
  pintarLoDeHoy();
  const racha = pintarRacha();
  if (racha) el.presupuestoVer.title += `\n${racha}`;
  const leido = !el.presupuestoDia.hidden ? `${el.presupuestoDia.textContent}. ${el.presupuestoTexto.textContent}` : el.presupuestoTexto.textContent;
  el.presupuestoVer.setAttribute("aria-label", `${leido}. ${el.presupuestoVer.title}`);
  el.presupuestoLleno.style.width = `${Math.min(estado.fraccion, 1) * 100}%`;
  // Detrás de lo gastado, una sombra hasta donde llegarías al acabar.
  const lleno = Math.min(estado.fraccion, 1);
  const hasta = prevision ? Math.min(prevision.fraccion, 1) : lleno;
  el.presupuestoRitmo.style.left = `${lleno * 100}%`;
  el.presupuestoRitmo.style.width = `${Math.max(hasta - lleno, 0) * 100}%`;
  // Lo pendiente, a rayas justo detrás de lo gastado: es dinero que ya tiene dueño.
  el.presupuestoPendiente.style.left = `${lleno * 100}%`;
  el.presupuestoPendiente.style.width = `${Math.max(Math.min(lleno + estado.fraccionPendiente, 1) - lleno, 0) * 100}%`;
  el.presupuestoRitmo.classList.toggle("is-pasa", Boolean(prevision) && prevision.fraccion > 1 + PREVISION_JUSTA);
  // El temblor solo al pasarte, no cada vez que abres el panel ya pasado.
  const antes = el.presupuestoVer.dataset.tono;
  el.presupuestoVer.dataset.tono = estado.tono;
  if (antes && antes !== "pasado" && estado.tono === "pasado") restartAnimation(el.presupuestoVer, "is-alarma");
  if (antes === "bien" && estado.tono === "justo") restartAnimation(el.presupuestoVer, "is-justo");
  pintarLoQueSeLleva();
}

// Detrás de lo de al día, lo mismo en la divisa de allí, como la sugerencia del
// cajero: solo si la de arriba va a la del presupuesto, que si no no tengo tasa.
function pintarAlDiaAlli(porDia) {
  const from = el.from.value;
  const cantidad = el.to.value === presupuesto.to && from !== presupuesto.to ? alDiaAlli(porDia, rate) : null;
  const nodo = el.presupuestoAlli;
  const habia = nodo.dataset.clave;
  nodo.hidden = cantidad === null;
  if (cantidad === null) {
    delete nodo.dataset.clave;
    return null;
  }
  const importe = `${nfEntero.format(cantidad)} ${from}`;
  nodo.dataset.clave = importe;
  nodo.replaceChildren(
    Object.assign(document.createElement("span"), { className: "presupuesto__alli-bandera", textContent: banderaDivisa(from) }),
    tr("presupuesto.alli", { importe }),
  );
  if (habia && habia !== importe) restartAnimation(nodo, "is-tic");
  return importe;
}

// La llama se aviva al aparecer y cuando cambia, no cada vez que se repinta.
// Solo el aro: la cifra ya sale en "Hoy", debajo del total. El respingo, al
// pasarte, no cada vez que lo pinto.
function pintarLoDeHoy() {
  const r = loDeHoy(presupuesto, gastos);
  const nodo = el.hoy;
  const antes = nodo.dataset.tono;
  nodo.hidden = !r;
  if (!r) {
    delete nodo.dataset.tono;
    return;
  }
  const lleno = Math.min(r.fraccion, 1) * 100;
  el.hoyLleno.style.strokeDasharray = `${lleno} 100`;
  const dinero = (n) => `${nf.format(n)} ${presupuesto.to}`;
  nodo.title = r.toca === 0 ? tr("presupuesto.hoyNada")
    : r.tono === "pasado" ? tr("presupuesto.hoyPasado", { pasado: dinero(r.gastado - r.toca), toca: dinero(r.toca) })
    : tr("presupuesto.hoyLlevas", { gastado: nf.format(r.gastado), toca: dinero(r.toca) });
  nodo.setAttribute("aria-label", nodo.title);
  nodo.dataset.tono = r.tono;
  if (antes && antes !== "pasado" && r.tono === "pasado") restartAnimation(nodo, "is-pasa");
}

function pintarRacha() {
  const racha = rachaPresupuesto(presupuesto, gastos);
  const nodo = el.presupuestoRacha;
  const antes = nodo.dataset.dias;
  nodo.hidden = !racha;
  nodo.dataset.dias = `${viajes.activo}:${racha?.dias ?? 0}`;
  if (!racha) return "";
  nodo.textContent = `🔥 ${racha.dias}`;
  nodo.title = tr("presupuesto.racha", { dias: racha.dias, toca: `${nf.format(racha.toca)} ${racha.to}` });
  if (antes !== nodo.dataset.dias) restartAnimation(nodo, "is-sube");
  return nodo.title;
}

function editarPresupuesto() {
  noVaciar();
  const to = presupuesto?.to ?? el.to.value;
  el.presupuestoCodigo.textContent = to;
  el.presupuestoImporte.value = presupuesto ? nf.format(presupuesto.importe) : "";
  el.presupuestoDesde.value = inicioDelViaje(presupuesto, gastos);
  ajustarHasta();
  // Una semana si no hay nada, que es lo que dura un viaje normal.
  const [a, m, d] = el.presupuestoHasta.min.split("-").map(Number);
  el.presupuestoHasta.value = presupuesto?.hasta ?? isoLocal(new Date(a, m - 1, d + 6));
  el.presupuestoQuitar.hidden = !presupuesto;
  pintarCamposTopes();
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
  pintarDesglose();
  (presupuesto ? el.presupuestoVer : el.presupuestoAnadir).focus();
  if (presupuesto) restartAnimation(el.presupuestoVer, "is-nuevo");
  guardarViajes();
}

function pintarCamposTopes() {
  el.presupuestoTopes.replaceChildren(...CATEGORIAS.map((categoria) => {
    const caja = document.createElement("label");
    caja.className = "presupuesto__tope";
    caja.innerHTML = iconoCategoria(categoria);
    const campo = Object.assign(document.createElement("input"), {
      type: "text", inputMode: "decimal", autocomplete: "off", spellcheck: false, placeholder: "—",
      className: "presupuesto__tope-campo",
      value: presupuesto?.categorias?.[categoria] ? nf.format(presupuesto.categorias[categoria]) : "",
    });
    campo.dataset.categoria = categoria;
    campo.setAttribute("aria-label", tr("presupuesto.tope", { nombre: tr(`cat.${categoria}`).toLowerCase() }));
    caja.title = campo.getAttribute("aria-label");
    caja.append(campo);
    return caja;
  }));
}

// Vacío es sin tope; lo que no sea un número de verdad, error, que un "2o" no
// se tiene que quedar en nada sin avisar.
function leerCamposTopes() {
  const topes = {};
  for (const campo of el.presupuestoTopes.querySelectorAll("input")) {
    if (!campo.value.trim()) continue;
    const n = leerImporte(campo.value);
    if (!(n > 0)) return { mal: campo };
    topes[campo.dataset.categoria] = n;
  }
  return { topes };
}

// La vuelta no puede ser antes de hoy ni antes de salir.
function ajustarHasta() {
  const desde = el.presupuestoDesde.value;
  el.presupuestoHasta.min = desde > hoy() ? desde : hoy();
}

function onGuardarPresupuesto(event) {
  event.preventDefault();
  const desde = el.presupuestoDesde.value;
  const hasta = el.presupuestoHasta.value;
  const { topes, mal: topeMal } = leerCamposTopes();
  if (topeMal) {
    restartAnimation(topeMal, "is-mal");
    topeMal.focus();
    return;
  }
  const nuevo = leerPresupuesto({
    importe: leerImporte(el.presupuestoImporte.value),
    to: el.presupuestoCodigo.textContent,
    hasta,
    desde: desde || null,
    categorias: topes,
  });
  if (!nuevo) {
    const mal = !(leerImporte(el.presupuestoImporte.value) > 0) ? el.presupuestoImporte
      : desde && hasta && desde > hasta ? el.presupuestoDesde : el.presupuestoHasta;
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
  el.cuentaRedondear.setAttribute("aria-pressed", String(reparto.redondear));
  el.cuentaRedondear.textContent = reparto.redondear && r?.sobra >= 0.005
    ? tr("cuenta.redondeado", { sobra: nf.format(r.sobra) })
    : tr(reparto.redondear ? "cuenta.redondeadoYa" : "cuenta.redondear");

  pintarPropinaHabitual(from);
  el.cuentaN.textContent = reparto.personas;
  el.cuentaN.setAttribute("aria-label", solo ? tr("cuenta.una") : tr("cuenta.personas", { n: reparto.personas }));
  el.cuentaMenos.disabled = reparto.personas <= 1;
  el.cuentaMas.disabled = reparto.personas >= PERSONAS_MAX;
  pintarGente();
  pintarPagoJusto(r?.cadaUno ?? null, from);
  pintarPagoCon(r?.cadaUno ?? null, from);
  el.cuentaCompartir.disabled = !r;
  pintarApuntarCuenta();

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

// Si solo son monedas no lo enseño: para eso no hace falta ayuda.
function pintarPagoJusto(cantidad, from) {
  const justo = cantidad === null ? null : pagoJusto(cantidad, from);
  const caja = el.cuentaJustoBilletes;
  el.cuentaJusto.hidden = !justo?.billetes.length;
  if (el.cuentaJusto.hidden) {
    delete caja.dataset.clave;
    return;
  }
  const clave = `${from} ${justo.billetes.map((b) => `${b.valor}x${b.n}`).join(" ")} ${justo.monedas}`;
  if (caja.dataset.clave === clave) return;
  caja.dataset.clave = clave;
  const piezas = justo.billetes.map((b, i) => {
    const billete = document.createElement("span");
    billete.className = "billete";
    billete.style.setProperty("--i", i);
    billete.textContent = nfEntero.format(b.valor);
    if (b.n > 1) {
      const veces = document.createElement("span");
      veces.className = "billete__n";
      veces.textContent = `×${b.n}`;
      billete.append(veces);
    }
    return billete;
  });
  const lista = justo.billetes.map((b) => `${b.n} × ${nfEntero.format(b.valor)}`);
  if (justo.monedas > 0) {
    // En yenes las monedas son de 500 y de 100: "800", no "800,00".
    const importe = (Number.isInteger(justo.monedas) ? nfEntero : nf).format(justo.monedas);
    const monedas = document.createElement("span");
    monedas.className = "cuenta__monedas";
    monedas.style.setProperty("--i", piezas.length);
    monedas.textContent = `+ ${importe}`;
    monedas.title = tr("cuenta.monedas", { importe: `${importe} ${from}` });
    piezas.push(monedas);
    lista.push(tr("cuenta.monedas", { importe }));
  }
  caja.replaceChildren(...piezas);
  caja.setAttribute("aria-label", `${tr("cuenta.justoAria", { lista: lista.join(", ") })} (${from})`);
}

// Los billetes se rehacen solo si cambian, que si no la entrada de las
// pastillas saltaría con cada tecla.
function pintarPagoCon(cantidad, from) {
  const pagos = cantidad === null ? [] : pagosPosibles(cantidad, from);
  if (!pagos.includes(pagoCon)) pagoCon = null;
  el.cuentaPago.hidden = pagos.length === 0;
  const clave = `${from} ${pagos.join(" ")}`;
  if (el.cuentaBilletes.dataset.clave !== clave) {
    el.cuentaBilletes.dataset.clave = clave;
    el.cuentaBilletes.replaceChildren(...pagos.map((pago, i) => {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "burbuja__rapida";
      boton.style.setProperty("--i", i);
      boton.dataset.pago = pago;
      boton.textContent = nfEntero.format(pago);
      boton.setAttribute("aria-label", tr("cuenta.pagasConAria", { importe: `${nfEntero.format(pago)} ${from}` }));
      boton.addEventListener("click", () => {
        pagoCon = pagoCon === pago ? null : pago;
        pintarCuenta();
      });
      return boton;
    }));
  }
  for (const boton of el.cuentaBilletes.children) {
    boton.setAttribute("aria-pressed", String(Number(boton.dataset.pago) === pagoCon));
  }
  pintarVuelta(cantidad, from);
}

function pintarVuelta(cantidad, from) {
  const nodo = el.cuentaVuelta;
  const habia = nodo.hidden ? "" : nodo.textContent;
  nodo.hidden = pagoCon === null;
  if (pagoCon === null) return;
  const texto = tr("cuenta.vuelta", { importe: `${nf.format(vuelta(cantidad, pagoCon))} ${from}` });
  if (texto === habia) return;
  nodo.textContent = texto;
  restartAnimation(nodo, habia ? "is-tic" : "is-entra");
}

async function onCompartirCuenta() {
  const from = el.from.value;
  const to = el.to.value;
  const r = repartirCuenta(cantidadOrigen(), from === to ? null : rate, reparto, comision);
  const texto = cuentaParaCompartir(r, from, to, reparto);
  if (!texto) return;
  const bien = await copiar(texto);
  const boton = el.cuentaCompartir;
  boton.classList.toggle("is-fallo", !bien);
  restartAnimation(boton, "is-hecho");
  clearTimeout(boton.vuelta);
  boton.vuelta = setTimeout(() => boton.classList.remove("is-hecho", "is-fallo"), 1600);
  mostrarFlash([tr(bien ? "cuenta.copiada" : "compartir.fallo")], 2200);
}

function gastoDeCuenta() {
  const from = el.from.value;
  const to = el.to.value;
  const r = repartirCuenta(cantidadOrigen(), from === to ? null : rate, reparto, comision);
  const solo = reparto.personas === 1;
  return alCambioDelCajero(gastoDeLaCuenta(r, {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    from, to, rate, comision,
    pago: pagoNuevo,
    cuando: Date.now(),
    concepto: tr(solo ? "cuenta.conceptoSolo" : "cuenta.concepto", { n: reparto.personas }),
  }), cajero);
}

const claveCuenta = (g) => `${viajes.activo} ${g.from} ${g.to} ${g.cantidad} ${g.valor} ${g.pago} ${g.concepto}`;

function pintarApuntarCuenta() {
  const gasto = gastoDeCuenta();
  const boton = el.cuentaApuntar;
  const hecho = gasto !== null && cuentaApuntada === claveCuenta(gasto);
  boton.disabled = !gasto;
  boton.classList.toggle("is-apuntado", hecho);
  boton.setAttribute("aria-disabled", String(hecho));
  const { nombre } = viajeActivo(viajes);
  const apuntado = nombre ? tr("cuenta.apuntado", { viaje: nombre }) : tr("cuenta.apuntadoGastos");
  const nota = comision === 0 ? ""
    : pagoNuevo === "efectivo" ? tr("pago.efectivoNota")
    : tr("gastos.comision", { pct: tr("pct", { n: nfComision.format(comision) }) });
  const que = tr(reparto.personas === 1 ? "cuenta.apuntarSolo" : "cuenta.apuntar");
  boton.title = hecho ? `${apuntado}. ${tr("cuenta.apuntadoTitulo")}` : [que, nota].filter(Boolean).join(". ");
  if (!gasto) {
    el.cuentaApuntarCifra.textContent = "+";
    boton.setAttribute("aria-label", que);
    return;
  }
  const valor = `${nf.format(gasto.valor)} ${gasto.to}`;
  el.cuentaApuntarCifra.textContent = hecho ? valor : `+ ${valor}`;
  boton.setAttribute("aria-label", hecho ? apuntado
    : tr("cuenta.apuntarAria", { cantidad: `${nf.format(gasto.cantidad)} ${gasto.from}`, valor }));
}

function onApuntarCuenta() {
  const gasto = gastoDeCuenta();
  if (!gasto || cuentaApuntada === claveCuenta(gasto)) return;
  gastos = apuntarGasto(gastos, gasto);
  gastoNuevo = gasto.id;
  if (filtroCategoria && filtroCategoria !== gasto.categoria) filtroCategoria = null;
  dejarVerGasto(gasto);
  guardarViajes();
  cuentaApuntada = claveCuenta(gasto);
  pintarGastos();
  pintarApuntarCuenta();
  restartAnimation(el.cuentaApuntar, "is-hecho");
  restartAnimation(el.abrirGastos, "is-apuntado");
  monedaQueSube(`+${nf.format(gasto.valor)}`);
}

// La cartera queda tapada por el panel, así que la cifra sube desde la pastilla
// y se va, como cuando sumas puntos en un juego.
function monedaQueSube(texto) {
  const desde = el.cuentaApuntar.getBoundingClientRect();
  if (sinMovimiento.matches || !desde.width) return;
  const moneda = document.createElement("span");
  moneda.className = "moneda-vuela";
  moneda.setAttribute("aria-hidden", "true");
  moneda.textContent = texto;
  moneda.style.left = `${desde.left + desde.width / 2}px`;
  moneda.style.top = `${desde.top}px`;
  document.body.append(moneda);
  setTimeout(() => moneda.remove(), 900);
}

function guardarReparto() {
  try {
    chrome.storage.local.set({ [CUENTA_KEY]: reparto });
  } catch (error) {
    console.warn("No se pudo guardar la propina", error);
  }
}

// La de la divisa de la cuenta, que es la del sitio. Solo la sugiero: la que
// tengas guardada no la toco.
function pintarPropinaHabitual(from) {
  const pct = propinaHabitual(from);
  const boton = el.cuentaHabitual;
  boton.hidden = pct === null;
  if (pct === null) return;
  const texto = pct === 0 ? tr("cuenta.habitualNada") : tr("cuenta.habitual", { pct: tr("pct", { n: nfComision.format(pct) }) });
  const puesta = reparto.propina === pct;
  boton.classList.toggle("is-puesta", puesta);
  boton.title = puesta ? tr("cuenta.habitualPuesta")
    : pct === 0 ? tr("cuenta.habitualQuitar")
    : tr("cuenta.habitualPoner", { pct: tr("pct", { n: nfComision.format(pct) }) });
  boton.setAttribute("aria-label", `${texto}. ${boton.title}`);
  if (boton.dataset.code === from && boton.dataset.texto === texto) return;
  boton.dataset.code = from;
  boton.dataset.texto = texto;
  const bandera = document.createElement("span");
  bandera.className = "cuenta__habitual-bandera";
  bandera.textContent = banderaDivisa(from);
  const frase = document.createElement("span");
  frase.textContent = texto;
  boton.replaceChildren(bandera, frase);
  restartAnimation(boton, "is-entra");
}

function onPropinaHabitual() {
  const pct = propinaHabitual(el.from.value);
  if (pct === null || pct === reparto.propina) return;
  el.cuentaCampo.value = PROPINAS_RAPIDAS.includes(pct) ? "" : nfComision.format(pct);
  el.cuentaCampo.removeAttribute("aria-invalid");
  ponerPropina(pct);
  restartAnimation(el.cuentaHabitual, "is-salto");
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

function onRedondear() {
  reparto = { ...reparto, redondear: !reparto.redondear };
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
  cerrarComparar();
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

function pintarComparar() {
  if (el.comparar.hidden) return;
  const to = el.to.value;
  if (compararDivisa !== to) {
    if (compararDivisa !== null) el.compararCampo.value = "";
    compararDivisa = to;
  }
  el.compararCodigo.textContent = to;
  el.compararCampo.setAttribute("aria-label", tr("comparar.aquiAria", { to }));
  const alli = el.from.value === to || rate === null ? null : loQuePagas(leerImporte(el.result.value), comision, impuesto);
  const aqui = leerImporte(el.compararCampo.value);
  const r = compararPrecios(alli, aqui);

  const cifra = alli === null ? "—" : `${nf.format(alli)} ${to}`;
  if (el.compararAlli.textContent !== cifra) {
    el.compararAlli.textContent = cifra;
    if (alli !== null) restartAnimation(el.compararAlli, "is-tic");
  }
  const con = comision > 0 && impuesto > 0 ? "comparar.conAmbos" : comision > 0 ? "comparar.conComision" : impuesto > 0 ? "comparar.conImpuesto" : null;
  el.compararAlliNota.textContent = alli === null ? ""
    : `${nf.format(cantidadOrigen() ?? 0)} ${el.from.value}${con ? ` · ${tr(con)}` : ""}`;

  // Los platos no giran con el brazo: suben y bajan colgados de sus puntas.
  const grados = sinMovimiento.matches ? inclinacion(r) / 2 : inclinacion(r);
  const caida = Math.sin((grados * Math.PI) / 180) * 70;
  el.compararBrazo.style.transform = `rotate(${grados}deg)`;
  el.compararPlatoAlli.style.transform = `translateY(${-caida}px)`;
  el.compararPlatoAqui.style.transform = `translateY(${caida}px)`;
  el.compararLadoAlli.classList.toggle("is-gana", r?.donde === "alli");
  el.compararLadoAqui.classList.toggle("is-gana", r?.donde === "aqui");
  el.compararPlatoAlli.classList.toggle("is-gana", r?.donde === "alli");
  el.compararPlatoAqui.classList.toggle("is-gana", r?.donde === "aqui");

  let texto;
  if (alli === null) texto = tr("comparar.faltaAlli");
  else if (!r) texto = tr("comparar.falta");
  else if (r.donde === "igual") texto = tr("comparar.igual");
  else {
    texto = tr(r.donde === "alli" ? "comparar.ganaAlli" : "comparar.ganaAqui", {
      ahorro: `${nf.format(r.ahorro)} ${to}`, pct: porCientoEntero(r.fraccion),
    });
  }
  const donde = r?.donde ?? "";
  if (el.compararVeredicto.textContent !== texto) {
    el.compararVeredicto.textContent = texto;
    if (r && el.compararVeredicto.dataset.donde !== donde) restartAnimation(el.compararVeredicto, "is-nuevo");
  }
  el.compararVeredicto.dataset.donde = donde;
}

function abrirComparar() {
  cerrarBurbuja();
  cerrarHistorial();
  cerrarGastos();
  cerrarCuenta();
  el.comparar.style.setProperty("--gastos-arriba", `${el.resultBox.offsetTop}px`);
  el.comparar.hidden = false;
  el.abrirComparar.setAttribute("aria-expanded", "true");
  pintarComparar();
  el.compararCampo.focus();
  el.compararCampo.select();
}

function cerrarComparar() {
  if (el.comparar.hidden) return;
  el.comparar.hidden = true;
  el.abrirComparar.setAttribute("aria-expanded", "false");
  return el.abrirComparar;
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
  el.gastos.dataset.color = viaje.color;
}

function onColorViaje(viaje) {
  viajes = siguienteColor(viajes, viaje.id);
  guardarViajes();
  pintarViajes();
  const boton = el.viajesLista.querySelector(`[data-id="${viaje.id}"] .viajes__color`);
  restartAnimation(boton, "is-nuevo");
  boton.focus();
  if (viaje.id === viajes.activo) {
    pintarTituloViaje();
    restartAnimation(el.gastos, "is-tinte");
  }
}

let borrarViajeId = null;

function crearFilaViaje(viaje, i) {
  const fila = document.createElement("li");
  fila.className = "viajes__fila";
  fila.dataset.id = viaje.id;
  fila.style.setProperty("--i", i);
  fila.style.setProperty("--acento-fila", `var(--viaje-${viaje.color})`);
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
  const compara = comparacion.get(viaje.id);
  if (compara?.media != null) elegir.append(crearComparacion(compara));
  elegir.addEventListener("click", () => onElegirViaje(viaje.id));

  const renombrar = document.createElement("button");
  renombrar.type = "button";
  renombrar.className = "viajes__accion";
  renombrar.innerHTML = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 10l.6-2.4L8.2 2a1 1 0 0 1 1.4 0l.4.4a1 1 0 0 1 0 1.4L4.4 9.4z"/></svg>';
  renombrar.setAttribute("aria-label", tr("viajes.renombrar", { nombre: nombreViaje(viaje) }));
  renombrar.title = renombrar.getAttribute("aria-label");
  renombrar.addEventListener("click", () => empezarRenombrar(fila, viaje));

  const color = document.createElement("button");
  color.type = "button";
  color.className = "viajes__color";
  color.setAttribute("aria-label", tr("viajes.color", { nombre: nombreViaje(viaje), color: tr(`color.${viaje.color}`) }));
  color.title = color.getAttribute("aria-label");
  color.addEventListener("click", () => onColorViaje(viaje));

  fila.append(color, elegir, renombrar);
  if (viajes.lista.length > 1) {
    // Sale al ir a borrar, al lado de "Borrar": en la fila no cabe un botón más
    // sin cortar el nombre, y si vas a quitar un viaje es cuando te interesa.
    const archivar = document.createElement("button");
    archivar.type = "button";
    archivar.hidden = true;
    archivar.className = "viajes__accion viajes__archivar";
    archivar.innerHTML = ICONO_ARCHIVO;
    archivar.setAttribute("aria-label", tr("viajes.archivar", { nombre: nombreViaje(viaje) }));
    archivar.title = archivar.getAttribute("aria-label");
    archivar.addEventListener("click", () => onArchivarViaje(viaje, fila));
    fila.append(archivar);
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

// Debajo del nombre, lo de cada día y en qué se va, con una barra que se mide
// contra el viaje que más gasta al día.
function crearComparacion(f) {
  const linea = document.createElement("span");
  linea.className = "viajes__compara";
  if (f.extremo) linea.dataset.extremo = f.extremo;
  const media = document.createElement("span");
  media.className = "viajes__media";
  media.textContent = tr("viajes.alDia", { media: nf.format(f.media) });
  linea.append(media);
  if (f.extremo) {
    const marca = document.createElement("span");
    marca.className = "viajes__extremo";
    marca.textContent = tr(`viajes.${f.extremo}`);
    linea.append(marca);
  }
  if (f.categoria) {
    const cat = document.createElement("span");
    cat.className = "viajes__cat";
    cat.textContent = `${EMOJI_CATEGORIA[f.categoria.categoria]} ${tr("pct", { n: Math.round(f.categoria.fraccion * 100) })}`;
    cat.title = tr(`cat.${f.categoria.categoria}`);
    linea.append(cat);
  }
  if (f.peso !== null) {
    const barra = document.createElement("span");
    barra.className = "viajes__peso";
    barra.setAttribute("aria-hidden", "true");
    barra.style.setProperty("--peso", f.peso);
    linea.append(barra);
  }
  linea.title = tr("viajes.compararTitulo", { media: `${nf.format(f.media)} ${f.to}`, dias: f.dias });
  return linea;
}

const ICONO_ARCHIVO = '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="1.5" y="2" width="9" height="2.6" rx="0.7"/><path d="M2.4 4.6v4.6a1 1 0 0 0 1 1h5.2a1 1 0 0 0 1-1V4.6M4.8 6.6h2.4"/></svg>';

// Los archivados, sin el color ni el lápiz: están para mirarlos. Con la tarjeta,
// que es lo que se suele querer de un viaje viejo, y para sacarlo o borrarlo.
function crearFilaArchivado(viaje, i) {
  const fila = document.createElement("li");
  fila.className = "viajes__fila is-archivado";
  fila.dataset.id = viaje.id;
  fila.style.setProperty("--i", i);
  fila.style.setProperty("--acento-fila", `var(--viaje-${viaje.color})`);
  const lleno = viajes.lista.length >= VIAJES_MAX;

  const sacar = document.createElement("button");
  sacar.type = "button";
  sacar.className = "viajes__elegir";
  const { n, total } = resumenViaje(viaje);
  const nombre = document.createElement("span");
  nombre.className = "viajes__nombre";
  nombre.textContent = nombreViaje(viaje);
  const meta = document.createElement("span");
  meta.className = "viajes__meta";
  meta.textContent = n === 0
    ? tr("viajes.vacio")
    : `${n === 1 ? tr("gastos.uno") : tr("gastos.n", { n })} · ${nf.format(total.total)} ${total.to}`;
  sacar.append(nombre, meta);
  const compara = comparacion.get(viaje.id);
  if (compara?.media != null) sacar.append(crearComparacion(compara));
  sacar.setAttribute("aria-label", tr(lleno ? "viajes.sacarLleno" : "viajes.sacar", { nombre: nombreViaje(viaje), n: VIAJES_MAX }));
  sacar.title = sacar.getAttribute("aria-label");
  sacar.addEventListener("click", () => onSacarArchivado(viaje, sacar));
  fila.append(sacar);

  if (n > 0) {
    const tarjeta = document.createElement("button");
    tarjeta.type = "button";
    tarjeta.className = "viajes__accion viajes__duplicar";
    tarjeta.innerHTML = el.viajesTarjeta.innerHTML;
    tarjeta.setAttribute("aria-label", tr("resumen.abrirDe", { nombre: nombreViaje(viaje) }));
    tarjeta.title = tarjeta.getAttribute("aria-label");
    tarjeta.addEventListener("click", () => chrome.tabs.create({ url: `resumen.html?viaje=${encodeURIComponent(viaje.id)}` }));
    fila.append(tarjeta);
  }
  const borrar = document.createElement("button");
  borrar.type = "button";
  borrar.className = "viajes__accion viajes__borrar";
  borrar.textContent = "✕";
  borrar.setAttribute("aria-label", tr("viajes.borrar", { nombre: nombreViaje(viaje) }));
  borrar.addEventListener("click", () => onBorrarArchivado(viaje, borrar));
  fila.append(borrar);
  return fila;
}

let comparacion = new Map();
let archivoAbierto = false;

function pintarArchivo() {
  const archivados = viajes.archivados ?? [];
  el.viajesArchivo.hidden = archivados.length === 0;
  if (!archivados.length) archivoAbierto = false;
  el.viajesAbrirArchivo.textContent = tr("viajes.archivados", { n: archivados.length });
  el.viajesAbrirArchivo.setAttribute("aria-expanded", String(archivoAbierto));
  el.viajesArchivados.hidden = !archivoAbierto;
  // Abierto ocupa el sitio de la lista: debajo no cabe y el popup no crece más de 600 px.
  el.viajes.classList.toggle("is-archivo", archivoAbierto);
  el.viajesArchivados.replaceChildren(...(archivoAbierto ? archivados.map(crearFilaArchivado) : []));
}

function pintarViajes() {
  // Con los archivados dentro: el más caro y el más barato, de todos tus viajes.
  comparacion = new Map(compararViajes(todosLosViajes(viajes)).map((f) => [f.id, f]));
  el.viajesLista.replaceChildren(...viajes.lista.map(crearFilaViaje));
  pintarArchivo();
  const lleno = viajes.lista.length >= VIAJES_MAX;
  el.viajesNuevo.hidden = lleno;
  el.viajesLleno.hidden = !lleno;
  el.viajesLleno.textContent = tr("viajes.lleno", { n: VIAJES_MAX });
  el.viajesDuplicar.title = tr("viajes.duplicar", { nombre: nombreViaje(viajeActivo(viajes)) });
  el.viajesDuplicar.setAttribute("aria-label", el.viajesDuplicar.title);
  // La tarjeta del viaje en el que estás, al lado de duplicarlo. En la fila de
  // cada viaje no cabía: el nombre se quedaba en puntos suspensivos.
  el.viajesTarjeta.hidden = viajeActivo(viajes).gastos.length === 0;
  el.viajesTarjeta.title = tr("resumen.abrirDe", { nombre: nombreViaje(viajeActivo(viajes)) });
  el.viajesTarjeta.setAttribute("aria-label", el.viajesTarjeta.title);
  // Lo de arriba suele ser la divisa de allí: el nombre ya lo tengo.
  const sugerido = nombreDeDestino(el.from.value, viajes.lista);
  el.viajesNombre.placeholder = sugerido ? tr("viajes.nuevoDe", { nombre: sugerido }) : tr("viajes.nuevo");
  // Con un viaje solo es el CSV de abajo otra vez.
  el.viajesPie.hidden = todosLosViajes(viajes).length < 2 || !todosLosViajes(viajes).some((v) => v.gastos.length > 0);
}

function abrirViajes() {
  cerrarCajero();
  cerrarTramos();
  cerrarPendientes();
  cerrarCurva();
  cerrarHoras();
  cerrarGente();
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
  archivoAbierto = false;
  el.viajes.hidden = true;
  el.viaje.setAttribute("aria-expanded", "false");
  noBorrarViaje();
  return true;
}

// Al cambiar de viaje, lo que estabas a medias del otro se queda allí: el
// deshacer, el filtro de categoría y el presupuesto que editabas.
function ponerViaje(nuevos) {
  viajes = nuevos;
  ({ gastos, presupuesto, cajero } = viajeActivo(viajes));
  quitado = null;
  el.deshacer.hidden = true;
  filtroCategoria = null;
  ordenado = false;
  cerrarBusqueda();
  cerrarCajero();
  cerrarTramos();
  cerrarPendientes();
  cerrarCurva();
  cerrarHoras();
  cerrarGente();
  dejarDeEditarPresupuesto();
  delete el.presupuestoVer.dataset.tono;
  cascadaGastos = true;
  pintarGastos();
  restartAnimation(el.gastosTitulo, "is-cambiado");
  guardarViajes();
  celebrarViaje();
}

function onElegirViaje(id) {
  cerrarViajes();
  if (id !== viajes.activo) ponerViaje(elegirViaje(viajes, id));
  el.gastosConcepto.focus();
}

function onCrearViaje(event) {
  event.preventDefault();
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const nuevos = crearViaje(viajes, id, el.viajesNombre.value.trim() || nombreDeDestino(el.from.value, viajes.lista));
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

// Uno como el abierto. Si has escrito un nombre, ese; si no, "Lisboa (2)".
function onDuplicarViaje() {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  // Con lo último del abierto dentro, que ponerViaje lee de la lista.
  const antes = cambiarViaje(viajes, viajes.activo, { gastos, presupuesto, cajero });
  const nuevos = duplicarViaje(antes, viajes.activo, id, { nombre: el.viajesNombre.value });
  if (nuevos === antes) {
    restartAnimation(el.viajesDuplicar, "is-mal");
    return;
  }
  cerrarViajes();
  ponerViaje(nuevos);
  restartAnimation(el.viaje, "is-estreno");
  mostrarFlash([tr("viajes.duplicado", { nombre: nombreViaje(viajeActivo(nuevos)) })], 2200);
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
  for (const boton of el.viajesLista.querySelectorAll(".viajes__archivar")) boton.hidden = true;
  for (const boton of el.viajes.querySelectorAll(".viajes__borrar.is-seguro")) {
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
    const archivar = boton.closest(".viajes__fila").querySelector(".viajes__archivar");
    if (archivar) {
      archivar.hidden = false;
      restartAnimation(archivar, "is-entra");
    }
    borrarViajeId = setTimeout(noBorrarViaje, 4000);
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

// Con lo último del abierto dentro, que si no se archivaría sin lo que acabas de apuntar.
function onArchivarViaje(viaje, fila) {
  noBorrarViaje();
  const nuevos = archivarViaje(cambiarViaje(viajes, viajes.activo, { gastos, presupuesto, cajero }), viaje.id);
  if (nuevos.lista.length === viajes.lista.length) {
    restartAnimation(fila.querySelector(".viajes__archivar"), "is-mal");
    mostrarFlash([tr("viajes.archivoLleno", { n: ARCHIVADOS_MAX })], 2200);
    return;
  }
  const acabar = () => {
    if (nuevos.activo !== viajes.activo) ponerViaje(nuevos);
    else {
      viajes = nuevos;
      guardarViajes();
    }
    pintarViajes();
    restartAnimation(el.viajesAbrirArchivo, "is-nuevo");
    mostrarFlash([tr("viajes.archivado", { nombre: nombreViaje(viaje) })], 2200);
    el.viajesLista.querySelector(".is-activo .viajes__elegir")?.focus();
  };
  if (sinMovimiento.matches) return acabar();
  fila.classList.add("is-saliendo");
  fila.addEventListener("animationend", acabar, { once: true });
}

function onSacarArchivado(viaje, boton) {
  const antes = cambiarViaje(viajes, viajes.activo, { gastos, presupuesto, cajero });
  const nuevos = desarchivarViaje(antes, viaje.id);
  if (nuevos === antes) {
    restartAnimation(boton, "is-mal");
    mostrarFlash([tr("viajes.sacarLleno", { nombre: nombreViaje(viaje), n: VIAJES_MAX })], 2600);
    return;
  }
  cerrarViajes();
  ponerViaje(nuevos);
  restartAnimation(el.viaje, "is-estreno");
  mostrarFlash([tr("viajes.sacado", { nombre: nombreViaje(viaje) })], 2200);
  el.gastosConcepto.focus();
}

function onBorrarArchivado(viaje, boton) {
  if (!boton.classList.contains("is-seguro")) {
    noBorrarViaje();
    boton.classList.add("is-seguro");
    boton.textContent = tr("viajes.seguro");
    boton.setAttribute("aria-label", tr("viajes.seguroAria", { nombre: nombreViaje(viaje) }));
    borrarViajeId = setTimeout(noBorrarViaje, 3000);
    return;
  }
  noBorrarViaje();
  const fila = boton.closest(".viajes__fila");
  const acabar = () => {
    viajes = borrarArchivado(viajes, viaje.id);
    guardarViajes();
    pintarViajes();
    (el.viajesArchivados.querySelector(".viajes__elegir") ?? el.viajesLista.querySelector(".is-activo .viajes__elegir"))?.focus();
  };
  if (sinMovimiento.matches) return acabar();
  fila.classList.add("is-saliendo");
  fila.addEventListener("animationend", acabar, { once: true });
}

// El viaje entero, aunque estés mirando una sola categoría: es lo que se manda.
async function onCompartir() {
  const viaje = viajeActivo(cambiarViaje(viajes, viajes.activo, { gastos, presupuesto, cajero }));
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
  cerrarComparar();
  el.gastos.style.setProperty("--gastos-arriba", `${el.resultBox.offsetTop}px`);
  el.gastos.hidden = false;
  el.abrirGastos.setAttribute("aria-expanded", "true");
  cascadaGastos = true;
  pararContador();
  el.gastosSuma.textContent = "";
  pintarGastos();
  el.gastosConcepto.focus();
  celebrarViaje();
}

// Los leo la primera vez que hacen falta y los tengo en memoria: si abres y
// cambias de viaje rápido, dos lecturas a la vez darían confeti doble.
let celebrados = null;

async function celebrarViaje() {
  if (celebrados === null) {
    try {
      celebrados = leerCelebrados((await chrome.storage.local.get(CELEBRADOS_KEY))[CELEBRADOS_KEY]);
    } catch (error) {
      console.warn("No se pudieron leer los viajes celebrados", error);
      celebrados = [];
    }
  }
  const viaje = viajeActivo(viajes);
  const fiesta = el.gastos.hidden ? null : viajeParaCelebrar(viaje, celebrados);
  if (!fiesta) return;
  celebrados = anadirCelebrado(celebrados, viaje.id);
  try {
    chrome.storage.local.set({ [CELEBRADOS_KEY]: celebrados });
  } catch (error) {
    console.warn("No se pudo guardar el viaje celebrado", error);
  }
  mostrarFlash([`🎉 ${textoCelebrar(fiesta)}`], 3600);
  if (!sinMovimiento.matches) lanzarConfeti(viaje.color);
}

// Sale del presupuesto hacia arriba y cae por el panel, con el color del viaje
// mezclado con el dorado y el verde.
const CONFETI = 42;

function lanzarConfeti(color) {
  const caja = document.createElement("div");
  caja.className = "confeti";
  caja.setAttribute("aria-hidden", "true");
  const colores = [`var(--viaje-${color})`, "var(--brass)", "var(--jade)", `var(--viaje-${color})`, `var(--viaje-${color === "rosa" ? "azul" : "rosa"})`];
  for (let i = 0; i < CONFETI; i += 1) {
    const trozo = document.createElement("span");
    trozo.className = "confeti__trozo";
    trozo.style.setProperty("--x", `${(Math.random() * 2 - 1) * 140}px`);
    trozo.style.setProperty("--alto", `${-25 - Math.random() * 45}px`);
    trozo.style.setProperty("--giro", `${(Math.random() * 2 - 1) * 720}deg`);
    trozo.style.setProperty("--espera", `${Math.random() * 180}ms`);
    trozo.style.setProperty("--dura", `${1100 + Math.random() * 700}ms`);
    trozo.style.background = colores[i % colores.length];
    if (i % 3 === 0) trozo.classList.add("is-tira");
    caja.append(trozo);
  }
  caja.style.setProperty("--origen", `${el.presupuesto.offsetTop + 8}px`);
  el.gastos.append(caja);
  setTimeout(() => caja.remove(), 2200);
}

function cerrarGastos() {
  if (el.gastos.hidden) return;
  cerrarViajes();
  cerrarCajero();
  cerrarTramos();
  cerrarPendientes();
  cerrarCurva();
  cerrarHoras();
  cerrarGente();
  dejarDeEditarPresupuesto();
  cerrarCategorias();
  cerrarBusqueda();
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
  const noches = repartirNoches(gasto, nochesNuevas);
  if (gastoRaro(gastos, noches[0]) && raroAvisado !== claveRaro(noches[0])) {
    raroAvisado = claveRaro(noches[0]);
    pintarBotonGasto();
    restartAnimation(el.gastosRaro, "is-insiste");
    restartAnimation(el.gastosApuntar, "is-seguro");
    return;
  }
  const repetido = gastoRepetido(gastos, gasto);
  if (repetido && repetidoAvisado?.clave !== claveRepetido(gasto)) {
    repetidoAvisado = { clave: claveRepetido(gasto), segundos: repetido.segundos };
    pintarBotonGasto();
    restartAnimation(el.gastosRaro, "is-insiste");
    restartAnimation(el.gastosApuntar, "is-seguro");
    return;
  }
  raroAvisado = null;
  repetidoAvisado = null;
  gastos = noches.length > 1 ? apuntarNoches(gastos, noches) : apuntarGasto(gastos, gasto);
  gastoNuevo = noches[0].id;
  nochesNuevas = 1;
  el.gastosConcepto.value = "";
  pintarSugerencia(null);
  categoriaNueva = CATEGORIA_POR_DEFECTO;
  categoriaAMano = false;
  // Si estabas mirando otra categoría, el que acabas de apuntar no se vería.
  if (filtroCategoria && filtroCategoria !== gasto.categoria) filtroCategoria = null;
  dejarVerGasto(gasto);
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
  const gasto = alCambioDelCajero(repetirGasto(original, {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    cuando: Date.now(),
    tasa: tasaDeHoy(original.from, original.to),
    comision,
  }), cajero);
  if (!gasto) return;
  gastos = apuntarGasto(gastos, gasto);
  gastoNuevo = gasto.id;
  if (filtroCategoria && filtroCategoria !== gasto.categoria) filtroCategoria = null;
  dejarVerGasto(gasto);
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
  const fila = que.closest(".gastos__fila");
  let hecho = false;
  const acabar = (guardar, dia, fijo) => {
    if (hecho) return;
    hecho = true;
    const conNota = guardar ? cambiarNota(gastos, gasto.id, notaCampo.value) : gastos;
    const conEntre = guardar && entreFila ? cambiarEntre(conNota, gasto.id, [...elegidos], personas) : conNota;
    const renombrados = guardar ? cambiarConcepto(conEntre, gasto.id, campo.value) : gastos;
    const fechados = dia ? cambiarDia(renombrados, gasto.id, dia) : renombrados;
    const nuevos = fijo === undefined ? fechados : marcarFijo(fechados, gasto.id, fijo);
    // Pasar a fijos o volver de ahí también es moverse de sitio en la lista.
    const movido = nuevos !== renombrados;
    if (nuevos !== gastos) {
      gastos = nuevos;
      guardarViajes();
    }
    // Como uno recién apuntado: rebota en su día y la barra del día crece.
    if (movido) gastoNuevo = gasto.id;
    pintarGastos();
    const otro = el.gastosLista.querySelector(`[data-id="${gasto.id}"] .gastos__que`);
    if (renombrados !== gastos && !movido) restartAnimation(otro, "is-cambiado");
    if (movido) otro?.closest(".gastos__fila").scrollIntoView({ block: "nearest", behavior: sinMovimiento.matches ? "auto" : "smooth" });
    otro?.focus();
  };
  const tira = tiraDeDias(gasto, (dia) => acabar(true, dia), () => acabar(true, undefined, !esFijo(gasto)));
  const notaFila = document.createElement("li");
  notaFila.className = "gastos__nota-fila";
  const notaCampo = document.createElement("input");
  notaCampo.type = "text";
  notaCampo.className = "gastos__nota-campo";
  notaCampo.maxLength = NOTA_MAX;
  notaCampo.value = gasto.nota ?? "";
  notaCampo.placeholder = tr("notas.pista");
  notaCampo.setAttribute("aria-label", tr("notas.campo"));
  notaFila.append(notaCampo);
  // Al lado de la nota y no en la tira de días, que ahí el calendario ya no cabía.
  if (!esDevolucion(gasto)) {
    const vuelta = document.createElement("button");
    vuelta.type = "button";
    vuelta.className = "gastos__devolver";
    vuelta.textContent = `↩ ${tr("devolver.corto")}`;
    vuelta.title = tr("devolver.titulo", { cantidad: `${nf.format(gasto.cantidad)} ${gasto.from}` });
    vuelta.setAttribute("aria-label", tr("devolver.boton"));
    vuelta.addEventListener("click", () => {
      acabar(true);
      onDevolverGasto(gastos.find((g) => g.id === gasto.id) ?? gasto);
    });
    notaFila.append(vuelta);
  }
  const otros = viajes.lista.filter((v) => v.id !== viajes.activo);
  if (otros.length) {
    const mover = document.createElement("select");
    mover.className = "gastos__mover";
    mover.title = tr("mover.titulo");
    mover.setAttribute("aria-label", tr("mover.titulo"));
    const pista = new Option("⇄", "", true, true);
    pista.disabled = true;
    mover.append(pista, ...otros.map((v) => {
      const lleno = v.gastos.length >= GASTOS_MAX;
      const opcion = new Option(lleno ? tr("mover.lleno", { viaje: nombreViaje(v) }) : nombreViaje(v), v.id);
      opcion.disabled = lleno;
      return opcion;
    }));
    mover.addEventListener("change", () => {
      const destino = mover.value;
      acabar(true);
      onMoverGasto(gasto.id, destino);
    });
    notaFila.append(mover);
  }
  // Siendo varios, quién entra. Al menos uno: un gasto de nadie no cuadra.
  const { personas, gente } = viajeActivo(viajes);
  const elegidos = new Set(entreDe(gasto, personas) ?? [...Array(personas).keys()]);
  let entreFila = null;
  if (personas > 1) {
    entreFila = document.createElement("li");
    entreFila.className = "gastos__entre-fila";
    const nombre = document.createElement("span");
    nombre.className = "gastos__dias-nombre";
    nombre.textContent = tr("entre.titulo");
    const cadaUno = document.createElement("span");
    cadaUno.className = "gastos__entre-cada";
    const pintarCada = () => {
      cadaUno.textContent = elegidos.size < personas
        ? tr("entre.cadaUno", { valor: `${nf.format(gasto.valor / elegidos.size)} ${gasto.to}` })
        : "";
    };
    const caras = [...Array(personas).keys()].map((i) => {
      const cara = document.createElement("button");
      cara.type = "button";
      cara.className = "gastos__quien gastos__entre-cara";
      cara.dataset.n = i % 6;
      cara.textContent = inicialPersona(gente, i);
      cara.title = nombrePersona(gente, i);
      cara.setAttribute("aria-label", tr("entre.persona", { nombre: nombrePersona(gente, i) }));
      cara.setAttribute("aria-pressed", String(elegidos.has(i)));
      cara.addEventListener("click", () => {
        if (elegidos.has(i)) {
          if (elegidos.size === 1) return restartAnimation(cara, "is-mal");
          elegidos.delete(i);
        } else {
          elegidos.add(i);
        }
        cara.setAttribute("aria-pressed", String(elegidos.has(i)));
        restartAnimation(cara, "is-tic");
        pintarCada();
      });
      return cara;
    });
    pintarCada();
    entreFila.append(nombre, ...caras, cadaUno);
  }
  for (const caja of [campo, notaCampo]) {
    caja.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        acabar(true);
      }
    });
  }
  // Pasar del concepto a los días o a la nota no es acabar; irse a otro sitio, sí.
  const fuera = (event) => {
    if (![fila, tira, notaFila, entreFila].some((parte) => parte?.contains(event.relatedTarget))) acabar(true);
  };
  for (const parte of [campo, tira, notaFila, entreFila].filter(Boolean)) {
    parte.addEventListener("focusout", fuera);
    parte.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      acabar(false);
    });
  }
  que.replaceWith(campo);
  fila.after(tira, notaFila, ...(entreFila ? [entreFila] : []));
  campo.focus();
  campo.select();
}

// Se va como uno que quitas, y el deshacer de siempre lo trae de vuelta a su sitio.
function onMoverGasto(id, destino) {
  viajes = cambiarViaje(viajes, viajes.activo, { gastos, presupuesto, cajero });
  const indice = gastos.findIndex((g) => g.id === id);
  const nuevos = moverGasto(viajes, id, viajes.activo, destino);
  if (indice === -1 || nuevos === viajes) return;
  const gasto = gastos[indice];
  const fila = el.gastosLista.querySelector(`[data-id="${id}"]`);
  const mover = () => {
    viajes = nuevos;
    ({ gastos } = viajeActivo(viajes));
    guardarViajes();
    pintarGastos();
    ofrecerDeshacer({ movido: { gasto, indice, a: destino } });
    (el.gastosLista.querySelector(".gastos__quitar") ?? el.gastosConcepto).focus();
  };
  if (sinMovimiento.matches || !fila) return mover();
  fila.classList.remove("is-nueva");
  fila.classList.add("is-saliendo");
  fila.addEventListener("animationend", mover, { once: true });
}

function onDevolverGasto(original) {
  const gasto = devolucionDe(original, {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    cuando: Date.now(),
  });
  if (!gasto) return;
  gastos = apuntarGasto(gastos, gasto);
  gastoNuevo = gasto.id;
  guardarViajes();
  pintarGastos();
  el.gastosLista.scrollTop = 0;
  el.gastosLista.querySelector(`[data-id="${gasto.id}"] .gastos__que`)?.focus();
}

function tiraDeDias(gasto, elegir, alternarFijo) {
  const tira = document.createElement("li");
  tira.className = "gastos__dias";
  const actual = isoLocal(new Date(gasto.cuando));
  const hoyIso = hoy();
  const [a, m, d] = hoyIso.split("-").map(Number);
  const ayer = isoLocal(new Date(a, m - 1, d - 1));

  const nombre = document.createElement("span");
  nombre.className = "gastos__dias-nombre";
  nombre.textContent = tr("gastos.dia");
  const rapidos = [[hoyIso, tr("dia.hoy")], [ayer, tr("dia.ayer")]].map(([dia, texto], i) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "gastos__dia-rapido";
    boton.textContent = texto;
    boton.style.setProperty("--i", i);
    boton.classList.toggle("is-elegido", dia === actual);
    boton.setAttribute("aria-pressed", String(dia === actual));
    boton.addEventListener("click", () => elegir(dia));
    return boton;
  });
  const fecha = document.createElement("input");
  fecha.type = "date";
  fecha.className = "gastos__dia-fecha";
  fecha.value = actual;
  fecha.max = hoyIso;
  fecha.style.setProperty("--i", 2);
  fecha.classList.toggle("is-elegido", actual !== hoyIso && actual !== ayer);
  fecha.setAttribute("aria-label", tr("gastos.otroDia"));
  fecha.addEventListener("change", () => {
    if (fecha.value) elegir(fecha.value);
  });
  const fijo = document.createElement("button");
  fijo.type = "button";
  fijo.className = "gastos__dia-rapido gastos__fijo";
  // Solo el alfiler: con la palabra, el calendario de al lado se quedaba sin sitio.
  fijo.textContent = "📌";
  fijo.title = tr("fijos.titulo");
  fijo.setAttribute("aria-label", tr("fijos.boton"));
  fijo.style.setProperty("--i", 3);
  fijo.classList.toggle("is-elegido", esFijo(gasto));
  fijo.setAttribute("aria-pressed", String(esFijo(gasto)));
  fijo.addEventListener("click", alternarFijo);
  tira.append(nombre, ...rapidos, fecha, fijo);
  return tira;
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
  if (nuevo.movido) {
    const { gasto, a } = nuevo.movido;
    const destino = viajes.lista.find((v) => v.id === a);
    el.deshacerTexto.textContent = tr("mover.hecho", { concepto: gasto.concepto || tr("gastos.sinConcepto"), viaje: destino ? nombreViaje(destino) : "" });
  } else if (nuevo.todos) {
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
  if (quitado.movido) {
    const { gasto, indice, a } = quitado.movido;
    viajes = moverGasto(viajes, gasto.id, a, viajes.activo, indice);
    ({ gastos } = viajeActivo(viajes));
    gastoNuevo = gasto.id;
    if (filtroCategoria && filtroCategoria !== gasto.categoria) filtroCategoria = null;
    dejarVerGasto(gasto);
    olvidarDeshacer();
    guardarViajes();
    pintarGastos();
    (el.gastosLista.querySelector(`[data-id="${gasto.id}"] .gastos__que`) ?? el.gastosConcepto).focus();
    return;
  }
  if (quitado.todos) {
    gastos = devolverTodos(gastos, quitado.todos);
    if (quitado.saldados?.length) viajes = cambiarViaje(viajes, viajes.activo, { saldados: quitado.saldados });
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
  dejarVerGasto(gasto);
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
  const { saldados } = viajeActivo(viajes);
  const vaciar = () => {
    gastos = [];
    // Sin gastos lo pagado no cuadra con nada; con deshacer vuelve.
    viajes = cambiarViaje(viajes, viajes.activo, { saldados: [] });
    guardarViajes();
    pintarGastos();
    if (todos.length) ofrecerDeshacer({ todos, saldados });
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
  el.avisoBoton.disabled = from === to || rate === null;
  if (modoCompra) return pintarCompra(from, to);
  const par = `${from}${to}`;
  if (par !== parDelUmbral && rate !== null && from !== to) {
    el.avisoUmbral.value = nfRate.format(rate);
    parDelUmbral = par;
  }

  const porcentaje = from === to ? null : leerPorcentajeAviso(el.avisoUmbral.value);
  el.avisoCodigo.textContent = porcentaje ? "" : to;
  if (porcentaje) {
    const sentido = porcentaje.signo > 0 ? "sube" : porcentaje.signo < 0 ? "baja" : "mueve";
    el.avisoSentido.textContent = tr(`avisos.${sentido}Un`, { from });
    el.avisoSentido.dataset.sentido = sentido;
  } else {
    const sentido = from === to ? null : sentidoAviso(leerImporte(el.avisoUmbral.value), rate);
    el.avisoSentido.textContent = tr(sentido === "sube" ? "avisos.sube" : sentido === "baja" ? "avisos.baja" : "avisos.llega", { from });
    el.avisoSentido.dataset.sentido = sentido ?? "";
  }
  pintarNota();
}

// Te propongo un 5 % menos de lo que cuesta ahora, que es lo que se suele
// esperar. Solo lo cambio si cambia el precio o el par, no lo que escribas.
function pintarCompra(from, to) {
  const precio = cantidadOrigen();
  const clave = `compra:${from}${to}${precio}`;
  if (clave !== parDelUmbral && precio && rate !== null && from !== to) {
    const coste = precio * rate;
    el.avisoUmbral.value = nf.format(coste >= 20 ? Math.floor(coste * 0.95) : Math.floor(coste * 95) / 100);
    parDelUmbral = clave;
  }
  const texto = precio ? `${nfComision.format(precio)} ${from}` : from;
  el.avisoSentido.textContent = tr("avisos.compra", { precio: texto });
  el.avisoSentido.title = tr("avisos.compraTitulo", { precio: texto });
  el.avisoSentido.dataset.sentido = "baja";
  el.avisoCodigo.textContent = to;
  pintarNota();
}

function onModoAviso() {
  modoCompra = !modoCompra;
  el.avisoModo.setAttribute("aria-pressed", String(modoCompra));
  const clave = modoCompra ? "avisos.tasaModo" : "avisos.compraModo";
  el.avisoModo.title = tr(clave);
  el.avisoModo.setAttribute("aria-label", tr(clave));
  el.avisoSentido.title = "";
  el.avisoUmbral.title = "";
  parDelUmbral = null;
  pintarSentidoAviso();
  restartAnimation(el.avisoSentido, "is-cambiado");
  el.avisoUmbral.focus();
  el.avisoUmbral.select();
}

// Con un porcentaje no se ve a qué tasa saltará, así que lo digo debajo. Con
// una compra, tampoco.
function previaAviso() {
  const to = el.to.value;
  if (modoCompra) {
    const precio = cantidadOrigen();
    const maximo = leerImporte(el.avisoUmbral.value);
    const vale = precio && maximo > 0 && rate !== null && el.from.value !== to && maximo < precio * rate;
    const previa = vale ? tr("avisos.previa", { tasa: `${nfRate.format(maximo / precio)} ${to}` }) : null;
    el.avisoUmbral.title = previa ?? "";
    return avisos.length ? null : previa;
  }
  const p = el.from.value === to || rate === null ? null : leerPorcentajeAviso(el.avisoUmbral.value);
  if (!p) return null;
  const tasa = (signo) => nfRate.format(rate * (1 + (signo * p.pct) / 100));
  return p.signo
    ? tr("avisos.previa", { tasa: `${tasa(p.signo)} ${to}` })
    : tr("avisos.previaMueve", { baja: tasa(-1), sube: `${tasa(1)} ${to}` });
}

let notaAviso = null;

// Lo de abajo del panel: si no tienes avisos, una pista; si acabas de hacer
// algo, un mensaje que se va solo.
function pintarNota() {
  if (el.avisoNota.classList.contains("is-mensaje")) return;
  el.avisoNota.dataset.tipo = "pista";
  el.avisoNota.textContent = previaAviso() ?? (avisos.length ? "" : tr("avisos.nota"));
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
  const mueve = aviso.sentido === "mueve";
  const pct = mueve ? tr("pct", { n: nfComision.format(aviso.pct) }) : null;
  ir.setAttribute(
    "aria-label",
    mueve ? tr("avisos.pastillaMueve", { from: aviso.from, pct, umbral, to: aviso.to })
      : tr("avisos.pastilla", {
        from: aviso.from, sentido: tr(aviso.sentido === "sube" ? "avisos.subeDe" : "avisos.bajaDe"), umbral, to: aviso.to,
      }),
  );
  const par = document.createElement("span");
  par.className = "aviso__par";
  par.textContent = `${aviso.from}→${aviso.to}`;
  const flecha = document.createElement("span");
  flecha.className = "aviso__flecha";
  flecha.dataset.sentido = aviso.sentido;
  flecha.textContent = mueve ? "⇕" : aviso.sentido === "sube" ? "▲" : "▼";
  const cifra = document.createElement("span");
  cifra.className = "aviso__umbral";
  cifra.textContent = mueve ? `±${pct}` : umbral;
  if (mueve) cifra.title = umbral;
  if (aviso.precio) {
    const precio = `${nfComision.format(aviso.precio)} ${aviso.from}`;
    const maximo = `${nfComision.format(aviso.maximo)} ${aviso.to}`;
    ir.setAttribute("aria-label", tr("avisos.pastillaCompra", { precio, maximo }));
    ir.classList.add("is-compra");
    par.textContent = precio;
    cifra.textContent = maximo;
    cifra.title = umbral;
  }
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
  pintarFaltas();
  // Un punto en la campana para que se vea que hay avisos sin entrar a mirar.
  el.campana.classList.toggle("tiene-avisos", avisos.length > 0);
  pintarNota();
}

function pintarFaltas() {
  const par = { from: el.from.value, to: el.to.value };
  for (const pastilla of el.avisosLista.children) {
    const aviso = avisos.find((a) => a.id === pastilla.dataset.id);
    const falta = aviso ? faltaParaAviso(aviso, par, rate) : null;
    const ir = pastilla.querySelector(".aviso__ir");
    ir.title = falta === null ? "" : textoFalta(falta);
    if (falta === null) ir.style.removeProperty("--cerca");
    else ir.style.setProperty("--cerca", `${cercaniaAviso(falta) * 100}%`);
  }
}

function onCrearAviso(event) {
  event.preventDefault();
  const from = el.from.value;
  const to = el.to.value;
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  if (modoCompra) return crearCompraDesdeForm(from, to, id);
  const porcentaje = leerPorcentajeAviso(el.avisoUmbral.value);
  const umbral = porcentaje ? null : leerImporte(el.avisoUmbral.value);

  let problema = null;
  if (!porcentaje && umbral === null) problema = tr("avisos.escribe", { ejemplo: nf.format(1.15) });
  else if (avisos.length >= AVISOS_MAX) problema = tr("avisos.lleno", { max: AVISOS_MAX });
  else if (!porcentaje && sentidoAviso(umbral, rate) === null) problema = tr("avisos.igual");

  const aviso = problema ? null
    : porcentaje ? crearAvisoPorcentaje(from, to, porcentaje, rate, id)
    : crearAviso(from, to, umbral, rate, id);
  if (!aviso) {
    decir(problema ?? tr("avisos.noSe"), "error");
    restartAnimation(el.avisoUmbral, "is-mal");
    return;
  }

  avisos = [...avisos, aviso];
  guardarAvisos();
  pintarAvisos();
  // Con "+2 %" se queda la tasa a la que saltará; con "2 %", lo que escribiste.
  if (aviso.sentido !== "mueve") el.avisoUmbral.value = nfRate.format(aviso.umbral);
  pintarSentidoAviso();
  restartAnimation(el.campana, "is-sonando");
  decir(tr("avisos.hecho"), "ok");
}

function crearCompraDesdeForm(from, to, id) {
  const precio = cantidadOrigen();
  const maximo = leerImporte(el.avisoUmbral.value);
  let problema = null;
  if (!precio) problema = tr("avisos.compraSinPrecio");
  else if (!(maximo > 0)) problema = tr("avisos.compraEscribe", { to });
  else if (avisos.length >= AVISOS_MAX) problema = tr("avisos.lleno", { max: AVISOS_MAX });
  else if (maximo >= Math.round(precio * rate * 100) / 100) problema = tr("avisos.yaCuesta", { cuesta: `${nf.format(precio * rate)} ${to}` });

  const compra = problema ? null : crearCompra(from, to, precio, maximo, rate, id);
  if (!compra) {
    decir(problema ?? tr("avisos.noSe"), "error");
    restartAnimation(el.avisoUmbral, "is-mal");
    return;
  }
  avisos = [...avisos, compra];
  guardarAvisos();
  pintarAvisos();
  restartAnimation(el.campana, "is-sonando");
  decir(tr("avisos.hecho"), "ok");
}

// Si es una compra, pongo también el precio: así ves lo que cuesta hoy.
function onIrAviso(aviso) {
  if (aviso.precio) {
    el.amount.value = nf.format(aviso.precio);
    ladoActivo = "amount";
    guardarCantidad();
  }
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

function buscarDesdeAtajo() {
  if (el.gastos.hidden) abrirGastos();
  // Con menos de dos gastos no hay lupa: se quedan abiertos y ya.
  if (!el.buscarAbrir.hidden) (el.buscar.hidden ? abrirBusqueda() : el.buscarCampo.focus());
}

function viajesDesdeAtajo() {
  if (!el.viajes.hidden) {
    cerrarViajes();
    el.viaje.focus();
    return;
  }
  if (el.gastos.hidden) abrirGastos();
  abrirViajes();
}

// La lista de viajes con el nombre listo para escribir. Si ya hay ocho, la
// lista sin más, que abajo ya dice que no caben.
function nuevoViajeDesdeAtajo() {
  if (el.gastos.hidden) abrirGastos();
  if (el.viajes.hidden) abrirViajes();
  if (!el.viajesNuevo.hidden) el.viajesNombre.focus();
}

// Desde otra pestaña, la primera vez solo te lleva al gráfico: así ves en qué
// periodo está antes de cambiarlo.
function rangoDesdeAtajo() {
  if (vista !== "evolucion") cambiarVista("evolucion");
  else ponerRango(siguienteRango(dias));
}

// Como el botón de + 38,90 EUR. Con el presupuesto a medio editar el botón no
// se ve, así que tampoco apunto nada.
function apuntarDesdeAtajo() {
  if (el.gastos.hidden) abrirGastos();
  if (!el.gastosForm.hidden) el.gastosForm.requestSubmit();
}

// Se queda en efectivo, como con el botón: el siguiente suele ir igual.
function apuntarEnEfectivo() {
  if (pagoNuevo !== "efectivo") onCambiarPago();
  apuntarDesdeAtajo();
}

// Te llevo a la chuleta para que veas qué se ha copiado.
function chuletaDesdeAtajo() {
  if (vista !== "chuleta") cambiarVista("chuleta");
  onCompartirChuleta();
}

// Sin ninguna elegida no hay nada que copiar, pero en la pestaña ves dónde se añaden.
function extrasDesdeAtajo() {
  if (vista !== "extras") cambiarVista("extras");
  onCompartirExtras();
}

// Con los gastos cerrados no verías nada: los abro, como con la lupa.
function discretoDesdeAtajo() {
  if (el.gastos.hidden) abrirGastos();
  onDiscreto();
}

// Copia la tasa como se ve arriba, al derecho o al revés, para compararla con
// la de la casa de cambio o mandarla.
// Con Shift, al revés de como está arriba, sin tener que girarla antes.
const tasaParaCopiar = (alReves = false) => lineaTasa(rate, el.from.value, el.to.value, tasaAlReves !== alReves);

async function copiarTasa(alReves = false) {
  if (!(await copiar(tasaParaCopiar(alReves)))) avisar(tr("copiar.fallo"));
}

// El par puesto siempre está en la lista, que se apunta al cambiarlo.
function fijarActual() {
  const datos = { de: el.from.value, a: el.to.value };
  const nuevos = fijarReciente(recientes, datos.de, datos.a);
  if (nuevos === recientes) return tr("reciente.lleno", { n: FIJOS_MAX });
  recientes = nuevos;
  guardarRecientes();
  pintarRecientes();
  const fijo = recientes.some((p) => p.fijo && p.from === datos.de && p.to === datos.a);
  return tr(fijo ? "reciente.fijado" : "reciente.soltado", datos);
}

let fijarDice = "";

function hacerAtajo(accion) {
  if (accion === "intercambiar" && !el.swap.disabled) onSwap();
  else if (accion === "copiar") onCopiar();
  else if (accion === "copiarFrase") onCopiar(true);
  else if (accion === "copiarSimbolo") onCopiar(false, true);
  else if (accion === "copiarFraseSimbolo") onCopiar(true, true);
  else if (accion === "girarTasa") onDarLaVueltaATasa();
  else if (accion === "copiarTasa") copiarTasa();
  else if (accion === "copiarTasaAlReves") copiarTasa(true);
  else if (accion === "origen") el.from.click();
  else if (accion === "destino") el.to.click();
  else if (accion === "ayuda") abrirAyuda();
  else if (accion === "gastos") (el.gastos.hidden ? abrirGastos() : cerrarGastos()?.focus());
  else if (accion === "cuenta") (el.cuenta.hidden ? abrirCuenta() : cerrarCuenta()?.focus());
  else if (accion === "comparar") (el.comparar.hidden ? abrirComparar() : cerrarComparar()?.focus());
  else if (accion === "historial") (el.historial.hidden ? abrirHistorial() : cerrarHistorial()?.focus());
  else if (accion === "buscar") buscarDesdeAtajo();
  else if (accion === "apuntar") apuntarDesdeAtajo();
  else if (accion === "apuntarEfectivo") apuntarEnEfectivo();
  else if (accion === "pago") onCambiarPago();
  else if (accion === "viajes") viajesDesdeAtajo();
  else if (accion === "nuevoViaje") nuevoViajeDesdeAtajo();
  else if (accion === "rango") rangoDesdeAtajo();
  else if (accion === "discreto") discretoDesdeAtajo();
  else if (accion === "csv") el.gastosCsv.click();
  else if (accion === "csvViajes") el.viajesCsv.click();
  else if (accion === "compartir") onCompartir();
  else if (accion === "copiarTotal") copiarTotalDesdeAtajo();
  else if (accion === "copiarHoy") copiarHoyDesdeAtajo();
  else if (accion === "copiarGasto") copiarGastoDesdeAtajo();
  else if (accion === "copiarMasCaro") copiarMasCaroDesdeAtajo();
  else if (accion === "chuleta") chuletaDesdeAtajo();
  else if (accion === "imprimirChuleta") onImprimirChuleta();
  else if (accion === "extras") extrasDesdeAtajo();
  else if (accion === "fijar") fijarDice = fijarActual();
  else if (accion === "cantidadUno") cantidadAUno();
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

const ULTIMA_VEZ_KEY = "ultimaVezVista";
// Solo te lo digo al abrir. Si luego cambias de par, apunto el nuevo y ya.
let ultimaVezMirada = false;

async function mirarUltimaVez() {
  const par = parDeLaSerie;
  const nuevo = ultimoVisto(serie, par);
  if (!nuevo) return;
  try {
    if (!ultimaVezMirada) {
      ultimaVezMirada = true;
      const { [ULTIMA_VEZ_KEY]: visto } = await chrome.storage.local.get(ULTIMA_VEZ_KEY);
      const c = desdeLaUltimaVez(visto, serie, par, tasaAlReves);
      if (c) avisarUltimaVez(c);
    }
    await chrome.storage.local.set({ [ULTIMA_VEZ_KEY]: nuevo });
  } catch (error) {
    console.warn("No se pudo guardar la última tasa vista", error);
  }
}

function avisarUltimaVez(c) {
  const cifra = document.createElement("span");
  cifra.className = "tecla-flash__cambio";
  cifra.dataset.sentido = c.sentido;
  cifra.textContent = textoCambioDia(c);
  setTimeout(() => mostrarFlash([cifra, ` ${tr("ultimaVez.desde", { fecha: fechaCorta(c.desde) })}`], 3600), 550);
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
  // Sin nada que deshacer la Z no hace nada, ni siquiera el aviso de abajo. Sin gastos, la X igual.
  if (!accion || (accion === "deshacer" && !quitado) || ((accion === "csv" || accion === "compartir" || accion === "copiarTotal") && !gastos.length)
    || (accion === "copiarGasto" && !ultimoGasto(gastos))
    || (accion === "copiarMasCaro" && !gastos.length)
    || (accion === "copiarHoy" && !hoyParaCopiar(viajeActivo(viajes)))
    || (accion === "csvViajes" && !viajes.lista.some((v) => v.gastos.length))
    || ((accion === "copiarTasa" || accion === "copiarTasaAlReves" || accion === "chuleta" || accion === "imprimirChuleta") && rate === null)
    || (accion === "copiarSimbolo" && (rate === null || leerImporte(el.result.value) === null))
    || (accion === "copiarFraseSimbolo" && !fraseSimboloAhora())) return;
  event.preventDefault();
  hacerAtajo(accion);
  // El resumen, la chuleta y las otras divisas ya avisan ellos al copiar, y si falla dicen que ha fallado.
  if (accion !== "ayuda" && accion !== "compartir" && accion !== "chuleta" && !(accion === "extras" && textoExtras())) {
    const conCmd = event.metaKey || event.ctrlKey;
    const tecla = conCmd ? (esMac ? "⌘Z" : "Ctrl+Z")
      : accion === "buscar" ? "/"
      : event.altKey ? textoAtajo(event.code, esMac) : event.code.replace(/^Key|^Digit/, "");
    const prefijo = accion === "copiarFrase" || accion === "imprimirChuleta" || accion === "copiarTasaAlReves" || accion === "csvViajes" || accion === "apuntarEfectivo" || accion === "copiarHoy" || accion === "copiarMasCaro" || accion === "copiarFraseSimbolo" ? (esMac ? "⇧" : "Shift+") : "";
    // El de pagar, el discreto y la tasa dicen cómo han quedado, que "cambiar" no te dice a qué.
    const dice = accion === "pago" ? tr("pago.ahora", { nombre: tr(`pago.${pagoNuevo}`) })
      : accion === "discreto" ? tr(discreto ? "discreto.puesto" : "discreto.quitado")
      : accion === "girarTasa" ? el.rateLine.textContent || queHace(accion)
      : accion === "copiarTasa" || accion === "copiarTasaAlReves" ? tr("copiado.tasa", { tasa: tasaParaCopiar(accion === "copiarTasaAlReves") })
      : accion === "copiarSimbolo" ? tr("copiado.tasa", { tasa: textoConSimbolo(leerImporte(el.result.value), el.to.value) })
      : accion === "copiarFraseSimbolo" ? tr("copiado.tasa", { tasa: fraseSimboloAhora() })
      : accion === "copiarTotal" ? tr("copiado.tasa", { tasa: totalParaCopiar(viajeActivo(viajes)) })
      : accion === "copiarHoy" ? tr("copiado.tasa", { tasa: hoyParaCopiar(viajeActivo(viajes)) })
      : accion === "copiarGasto" ? tr("copiado.tasa", { tasa: gastoParaCopiar(ultimoGasto(gastos)) })
      : accion === "copiarMasCaro" ? tr("copiado.tasa", { tasa: gastoParaCopiar(gastoMasCaro(gastos)) })
      : accion === "fijar" ? fijarDice
      : accion === "rango" ? tr(`rango.${dias}.largo`)
      : accion === "extras" ? tr("extras.ninguna")
      : accion === "nuevoViaje" && el.viajesNuevo.hidden ? tr("viajes.lleno", { n: VIAJES_MAX })
      : queHace(accion);
    mostrarTecla(prefijo + tecla, dice);
  }
}

let focoAntesDeAyuda = null;

function pintarAyuda() {
  const alt = esMac ? "⌥" : "Alt+";
  // La / no está en ATAJOS porque va por la tecla y no por el código; sale detrás de la G.
  const atajos = Object.entries(ATAJOS).flatMap((par) => (par[1] === "gastos" ? [par, ["/", "buscar"]] : [par]));
  el.ayudaLista.replaceChildren(...atajos.map(([code, accion], i) => {
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
  el.ayudaNota.replaceChildren(
    tr("ayuda.nota", { alt }), document.createElement("br"),
    tr("ayuda.flechas"), document.createElement("br"),
    tr("ayuda.idioma"),
  );
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
  cerrarComparar();
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
  el.viaje.title = `${tr("viajes.cambiar")} (${pista("viajes")})`;
  el.abrirCuenta.title = `${tr("cuenta")} (${pista("cuenta")})`;
  el.abrirComparar.title = `${tr("comparar")} (${pista("comparar")})`;
  el.abrirHistorial.title = `${tr("historial")} (${pista("historial")})`;
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
  pintarCambioDia();
  pintarFaltas();
  if (rate === null) {
    el.rateLine.textContent = "";
    return;
  }
  el.rateLine.textContent = lineaTasa(rate, from, to, tasaAlReves);
}

// Sale de la serie del gráfico, así que solo vale si es de este par: mientras
// llega la del par nuevo, mejor nada que el cambio del anterior.
let parDeLaSerie = "";

function pintarCambioDia(animar = false) {
  const c = parDeLaSerie === `${el.from.value}-${el.to.value}` ? cambioDelDia(serie, tasaAlReves) : null;
  el.cambioDia.hidden = !c;
  if (!c) return;
  el.cambioDia.textContent = textoCambioDia(c);
  el.cambioDia.dataset.sentido = c.sentido;
  el.cambioDia.title = tr("cambioDia.titulo", { fecha: fechaCorta(c.desde) });
  if (animar) restartAnimation(el.cambioDia, "is-nuevo");
}

function onDarLaVueltaATasa() {
  tasaAlReves = !tasaAlReves;
  renderRateLine(el.from.value, el.to.value);
  pintarCambioDia(true);
  restartAnimation(el.rateLine, "is-vuelta");
  guardarTasaAlReves();
}

function renderUpdated() {
  el.updated.textContent = textoActualizado(rateDate);
  // La de hoy lleva su puntito verde; la vieja ya sale en ámbar.
  el.updated.classList.toggle("is-hoy", rateDate === hoy());
  el.updated.title = rateDate
    ? [tr("bce.titulo", { fecha: fechaLarga(rateDate), hora: horaCorta(horaBce(rateDate)) }), textoProximaTasa(proximaTasa(rateDate))].filter(Boolean).join(". ")
    : "";
  pintarTasaVieja();
}

// Mientras pido la nueva no la saco: casi siempre llega y sería un parpadeo.
// Si ya estaba y la has pulsado, se queda dando vueltas hasta que responda.
function pintarTasaVieja() {
  const vieja = rate !== null && el.from.value !== el.to.value ? tasaVieja(rateDate) : null;
  const mostrar = Boolean(vieja) && (!pidiendoTasa || !el.tasaVieja.hidden);
  if (mostrar && el.tasaVieja.hidden) restartAnimation(el.tasaVieja, "is-nuevo");
  el.tasaVieja.hidden = !mostrar;
  el.tasaVieja.classList.toggle("is-girando", mostrar && pidiendoTasa);
  el.updated.classList.toggle("is-vieja", Boolean(vieja));
  if (!vieja) return;
  el.tasaViejaTexto.textContent = textoTasaVieja(vieja.fecha);
  el.tasaVieja.title = vieja.dias === 1
    ? tr("vieja.tituloUno", { fecha: fechaLarga(vieja.fecha) })
    : tr("vieja.titulo", { fecha: fechaLarga(vieja.fecha), n: vieja.dias });
  el.tasaVieja.setAttribute("aria-label", el.tasaVieja.title);
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
    destino.title = "";
    origen.title = "";
    ajustarAncho();
    el.resultMeta.textContent = "";
    pintarComision();
    pintarCafes();
    pintarHoras();
    pintarPistas();
    pintarComparar();
    return;
  }

  if (rate === null) {
    pintarComision();
    pintarCafes();
    pintarHoras();
    pintarPistas();
    pintarComparar();
    return;
  }

  const convertido = escribiendoAbajo ? valor / rate : valor * rate;
  destino.value = nf.format(convertido);
  pintarCifraCompleta(destino, convertido, escribiendoAbajo ? from : to);
  origen.title = "";
  ajustarAncho();

  const enviados = escribiendoAbajo ? convertido : valor;
  el.resultMeta.textContent = `${nf.format(enviados)} ${from}`;
  el.resultMeta.title = "";
  // Con "3,99/lb" arriba, aquí va lo que vale el kilo, que es lo que sabes comparar.
  const { unidad } = escribiendoAbajo ? { unidad: null } : quitarUnidad(el.amount.value);
  const metrica = porUnidadMetrica(convertido, unidad);
  el.resultMeta.classList.toggle("is-unidad", Boolean(metrica));
  if (metrica) {
    el.resultMeta.textContent = `≈ ${nf.format(metrica.valor)} ${to}/${metrica.unidad}`;
    el.resultMeta.title = `${nf.format(valor)} ${from}/${nombreUnidad(unidad)} = ${nf.format(convertido)} ${to}/${nombreUnidad(unidad)} ≈ ${nf.format(metrica.valor)} ${to}/${metrica.unidad}`;
  }
  pintarComision();
  pintarCafes();
  pintarHoras();
  pintarPistas();
  pintarComparar();
  pintarBotonGasto();

  // El latido solo cuando cambia la cifra grande, que si no parpadea al teclear.
  if (!escribiendoAbajo) restartAnimation(el.result, "is-updating");
}

function pintarCifraCompleta(campo, valor, divisa) {
  const completa = cifraCompleta(valor);
  campo.title = completa
    ? `${formatoNumero({ minimumFractionDigits: 2, maximumFractionDigits: completa.decimales }).format(completa.valor)} ${divisa}`
    : "";
}

async function refresh() {
  const from = el.from.value;
  const to = el.to.value;
  pintarHoraAlli();
  // Sube también con la misma divisa en los dos lados: si no, la petición que
  // estuviera en vuelo llegaba después y me pisaba el 1 con la tasa vieja.
  const currentRequest = ++requestId;
  refreshExtras(from);
  refreshFecha();

  if (from === to) {
    rate = 1;
    rateDate = null;
    pidiendoTasa = false;
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
  pidiendoTasa = !isFresh(cached);
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
    pidiendoTasa = false;
    renderRateLine(from, to);
    renderUpdated();
    renderResult();
    refreshTrend(from, to);

    saveCache({
      [`${from}${to}`]: { rate: data.rate, date: data.date, day: hoy(), saved: Date.now() },
    });
  } catch (error) {
    if (currentRequest !== requestId) return;
    pidiendoTasa = false;

    if (cached) {
      // Me quedo con lo viejo y aviso, que es más útil que dejarlo en blanco.
      const reintento = el.tasaVieja.classList.contains("is-girando");
      pintarTasaVieja();
      if (reintento) restartAnimation(el.tasaVieja, "is-mal");
      showError(errorMessageFor(error));
      refreshTrend(from, to);
      return;
    }

    rate = null;
    rateDate = null;
    el.result.value = "—";
    el.result.title = "";
    el.resultCode.textContent = "";
    el.resultMeta.textContent = "";
    el.rateLine.textContent = "";
    el.updated.textContent = "";
    pintarFaltas();
    pintarChuleta();
    pintarFecha();
    pintarTimo();
    pintarCuenta();
    pintarComparar();
    pintarComision();
    pintarCafes();
    pintarHoras();
    pintarPistas();
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
  ponerPegado(campo, pegado);
}

// Cmd+V sin estar en ningún campo: a la cantidad, y te deja el cursor en ella.
function onPegarFuera(event) {
  const t = event.target;
  if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t.isContentEditable) return;
  const pegado = leerPegadoSuelto(event.clipboardData?.getData("text") ?? "", { from: el.from.value, to: el.to.value });
  if (!pegado) return;
  event.preventDefault();
  ponerPegado(el.amount, pegado);
  el.amount.focus();
}

function ponerPegado(campo, pegado) {
  const lado = campo === el.result ? "result" : "amount";
  const antes = { from: el.from.value, to: el.to.value };
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

function onFlechaCantidad(event) {
  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
  if (event.metaKey || event.ctrlKey) return;
  event.preventDefault();
  moverCantidad(event.key === "ArrowUp" ? 1 : -1, event.shiftKey, event.altKey);
}

// Escape cierra el popup, y con una cantidad escrita casi siempre querías
// borrarla. Con algo abierto encima manda eso, que tiene su propio Escape.
function onEscapeCantidad(event) {
  if (event.key !== "Escape" || el.amount.value === "") return;
  const abierto = [el.bandeja, el.burbuja, el.historial, el.cuenta, el.comparar, el.gastos].some((panel) => !panel.hidden);
  if (abierto) return;
  event.preventDefault();
  el.amount.value = "";
  restartAnimation(el.amount, "is-vaciada");
  onAmountInput();
  marcarTocado();
}

function cantidadAUno() {
  ladoActivo = "amount";
  el.amount.value = "1";
  restartAnimation(el.amount, "is-resuelto");
  onAmountInput();
  marcarTocado();
}

function moverCantidad(sentido, grande, porDiez = false) {
  const antes = leerImporte(el.amount.value);
  const valor = porDiez ? pasoPorDiez(antes, sentido) : pasoCantidad(antes, sentido, grande);
  el.amount.value = Number.isInteger(valor) ? nfEntero.format(valor) : nf.format(valor);
  el.amount.classList.remove(sentido > 0 ? "is-baja" : "is-sube");
  restartAnimation(el.amount, sentido > 0 ? "is-sube" : "is-baja");
  onAmountInput();
  marcarTocado();
}

// Solo con el foco puesto, como los campos numéricos de Chrome: si no, al bajar
// por el popup con el ratón encima te cambiaría la cantidad sin querer.
let ruedaAcumulada = 0;
function onRuedaCantidad(event) {
  if (document.activeElement !== el.amount || event.ctrlKey || event.metaKey) return;
  event.preventDefault();
  // Con Shift, el Mac convierte la rueda en horizontal.
  const delta = event.deltaY || event.deltaX;
  const { pasos, resto } = pasosRueda(ruedaAcumulada, event.deltaMode === 0 ? delta : delta * RUEDA_PASO);
  ruedaAcumulada = resto;
  for (let i = 0; i < Math.abs(pasos); i++) moverCantidad(Math.sign(pasos), event.shiftKey);
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
  guardarCantidad();
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
  guardarCantidad();
}

let avisoCopiado = null;

const fraseSimboloAhora = () => (rate === null ? ""
  : fraseConSimbolo({ cantidad: leerImporte(el.amount.value), from: el.from.value, valor: leerImporte(el.result.value), to: el.to.value }));

// Con Shift la frase entera; con Alt, la cifra con su símbolo ("42,79 $"), que
// es como se escribe en un mensaje. Con los dos, la frase con símbolos.
async function onCopiar(entera = false, conSimbolo = false) {
  const valor = leerImporte(el.result.value);
  if (valor === null || rate === null) return;
  // Si lo copias es que era esa: la apunto ya, sin esperar.
  tocado = true;
  apuntarAhora();
  const par = { cantidad: leerImporte(el.amount.value), from: el.from.value, valor, to: el.to.value };
  const frase = !entera ? "" : conSimbolo ? fraseConSimbolo(par) : fraseParaCopiar(par);
  if (entera && !frase) return;
  const simbolo = !entera && conSimbolo ? textoConSimbolo(valor, el.to.value) : "";
  const bien = await copiar(frase || simbolo || textoParaCopiar(valor));
  avisar(tr(!bien ? "copiar.fallo" : frase ? "copiado.frase" : "copiado"));
  if (bien && (frase || simbolo)) soltarFrase(frase || simbolo);
}

// Un clic es para escribir en él; con doble clic lo copias sin ir al botón. El
// doble clic también selecciona una palabra, y la cifra la quiero entera.
async function onCopiarCifra(event) {
  if (leerImporte(el.result.value) === null || rate === null) return;
  el.result.select();
  restartAnimation(el.result, "is-copiada");
  await onCopiar(event.shiftKey, event.altKey);
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

// Con Shift o Alt pulsado el botón ya dice lo que va a copiar, antes de hacer clic.
let conShift = false;
let conAlt = false;
const etiquetaCopiar = () => (conShift ? tr("copiar.frase")
  : conAlt && isValidCode(el.to.value) ? tr("copiar.simbolo", { simbolo: simboloDe(el.to.value) })
  : tr("copiar"));

function onShift(event) {
  const shift = event.type === "blur" ? false : event.shiftKey;
  // Alt solo con el ratón encima: escribiendo, Alt es la tecla de los atajos y
  // Alt+C copia la cifra a secas.
  const alt = event.type === "blur" || event.type === "mouseleave" ? false : event.altKey && el.copiar.matches(":hover");
  if (shift === conShift && alt === conAlt) return;
  const antes = etiquetaCopiar();
  conShift = shift;
  conAlt = alt;
  el.copiar.classList.toggle("is-frase", conShift);
  el.copiar.classList.toggle("is-simbolo", conAlt && !conShift);
  if (el.copiar.classList.contains("is-hecho") || antes === etiquetaCopiar()) return;
  el.copiarTexto.textContent = etiquetaCopiar();
  if (conAlt && !conShift) restartAnimation(el.copiarTexto, "is-simbolo-entra");
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
  ponerRango(Number(event.currentTarget.dataset.dias));
}

function ponerRango(nuevos) {
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
  el.amount.addEventListener("keydown", onFlechaCantidad);
  el.amount.addEventListener("keydown", onEscapeCantidad);
  el.amount.addEventListener("wheel", onRuedaCantidad, { passive: false });
  document.addEventListener("paste", onPegarFuera);
  el.amount.addEventListener("animationend", () => el.amount.classList.remove("is-sube", "is-baja", "is-recuperada"));
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
  el.copiar.addEventListener("click", (event) => onCopiar(event.shiftKey, event.altKey));
  el.result.addEventListener("dblclick", onCopiarCifra);
  el.result.addEventListener("animationend", (event) => {
    if (event.animationName === "copiada") el.result.classList.remove("is-copiada");
  });
  document.addEventListener("keydown", onShift);
  document.addEventListener("keyup", onShift);
  window.addEventListener("blur", onShift);
  el.copiar.addEventListener("mouseenter", onShift);
  el.copiar.addEventListener("mouseleave", onShift);
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
  el.chuletaCompartir.addEventListener("click", onCompartirChuleta);
  el.extrasCompartir.addEventListener("click", onCompartirExtras);
  el.chuletaImprimir.addEventListener("click", onImprimirChuleta);
  el.gastosCsv.addEventListener("click", () => descargarCsv(csvGastos(gastos), archivoGastos(viajeActivo(viajes).nombre), el.gastosCsv));
  el.viajesCsv.addEventListener("click", () => descargarCsv(csvViajes(todosLosViajes(viajes)), tr("csv.archivoViajes"), el.viajesCsv));
  el.viajesAbrirArchivo.addEventListener("click", () => {
    archivoAbierto = !archivoAbierto;
    noBorrarViaje();
    pintarArchivo();
  });
  el.viajesAbrirArchivo.addEventListener("animationend", () => el.viajesAbrirArchivo.classList.remove("is-nuevo"));
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
  el.gastosSuma.addEventListener("dblclick", onCopiarTotal);
  el.gastosApuntar.addEventListener("animationend", () => el.gastosApuntar.classList.remove("is-mal"));
  el.gastosCerrar.addEventListener("click", () => cerrarGastos()?.focus());
  el.viaje.addEventListener("click", () => (el.viajes.hidden ? abrirViajes() : cerrarViajes()));
  el.gastosEfectivo.addEventListener("click", () => (el.cajero.hidden ? abrirCajero() : cerrarCajero()));
  el.gastosTramo.addEventListener("click", () => (el.tramos.hidden ? abrirTramos() : cerrarTramos()));
  el.tramosForm.addEventListener("submit", onPonerTramo);
  el.curvaAbrir.addEventListener("click", () => (el.curva.hidden ? abrirCurva() : cerrarCurva()));
  el.curvaSvg.addEventListener("pointermove", (event) => {
    const caja = el.curvaSvg.getBoundingClientRect();
    mirarCurva((event.clientX - caja.left) / caja.width);
  });
  el.curvaSvg.addEventListener("pointerleave", () => mirarCurva(null));
  el.curvaSvg.addEventListener("blur", () => mirarCurva(null));
  el.curvaSvg.addEventListener("keydown", onTeclaCurva);
  el.gastosPendiente.addEventListener("click", () => (el.pendientes.hidden ? abrirPendientes() : cerrarPendientes()));
  el.pendientesForm.addEventListener("submit", onApuntarPendiente);
  for (const campo of [el.pendientesConcepto, el.pendientesCantidad]) {
    campo.addEventListener("animationend", () => campo.classList.remove("is-mal"));
  }
  el.tramosNombre.addEventListener("animationend", () => el.tramosNombre.classList.remove("is-mal"));
  el.gastosEfectivo.addEventListener("animationend", () => el.gastosEfectivo.classList.remove("is-tic"));
  el.cajeroForm.addEventListener("submit", onSacar);
  el.cajeroCantidad.addEventListener("input", pintarPistaCoste);
  el.cajeroCantidad.addEventListener("animationend", () => el.cajeroCantidad.classList.remove("is-mal", "is-cambiado"));
  el.cajeroSugerencia.addEventListener("click", onSugerencia);
  el.personasMenos.addEventListener("click", () => onPersonas(-1));
  el.personasMas.addEventListener("click", () => onPersonas(1));
  el.personasCabeza.addEventListener("click", () => (el.gente.hidden ? abrirGente() : cerrarGente()));
  el.gastosPagador.addEventListener("click", onCambiarPagador);
  el.viaje.addEventListener("animationend", () => el.viaje.classList.remove("is-estreno"));
  el.gastosTitulo.addEventListener("animationend", () => el.gastosTitulo.classList.remove("is-cambiado"));
  el.viajesNuevo.addEventListener("submit", onCrearViaje);
  el.viajesDuplicar.addEventListener("click", onDuplicarViaje);
  el.viajesTarjeta.addEventListener("click", () => chrome.tabs.create({ url: `resumen.html?viaje=${encodeURIComponent(viajes.activo)}` }));
  el.viajesNombre.addEventListener("animationend", () => el.viajesNombre.classList.remove("is-mal"));
  el.viajesLista.addEventListener("animationend", (event) => event.target.classList.remove("is-renombrado"));
  el.abrirCuenta.addEventListener("click", () => (el.cuenta.hidden ? abrirCuenta() : cerrarCuenta()));
  el.cuentaApuntar.addEventListener("click", onApuntarCuenta);
  el.cuentaCerrar.addEventListener("click", () => cerrarCuenta()?.focus());
  el.tasaVieja.addEventListener("click", () => {
    if (pidiendoTasa) return;
    refresh();
  });
  el.tasaVieja.addEventListener("animationend", (event) => {
    if (event.target === el.tasaVieja) el.tasaVieja.classList.remove("is-nuevo", "is-mal");
  });
  el.abrirComparar.addEventListener("click", () => (el.comparar.hidden ? abrirComparar() : cerrarComparar()));
  el.compararCerrar.addEventListener("click", () => cerrarComparar()?.focus());
  el.compararCampo.addEventListener("input", pintarComparar);
  el.compararAlli.addEventListener("animationend", () => el.compararAlli.classList.remove("is-tic"));
  el.compararVeredicto.addEventListener("animationend", () => el.compararVeredicto.classList.remove("is-nuevo"));
  el.cuentaCompartir.addEventListener("click", onCompartirCuenta);
  el.cuentaCampo.addEventListener("input", onCampoPropina);
  el.cuentaHabitual.addEventListener("click", onPropinaHabitual);
  el.cuentaCampo.addEventListener("keydown", onTeclaCampoPropina);
  el.cuentaCampo.addEventListener("animationend", () => el.cuentaCampo.classList.remove("is-mal"));
  el.cuentaMenos.addEventListener("click", () => cambiarPersonas(-1));
  el.cuentaRedondear.addEventListener("click", onRedondear);
  el.cuentaMas.addEventListener("click", () => cambiarPersonas(1));
  el.cuentaCifra.addEventListener("animationend", () => el.cuentaCifra.classList.remove("is-tic"));
  el.cuentaN.addEventListener("animationend", () => el.cuentaN.classList.remove("is-sube", "is-baja"));
  el.cuentaGente.addEventListener("animationend", (event) => event.target.classList.remove("is-nuevo"));
  el.rateLine.addEventListener("click", onDarLaVueltaATasa);
  el.presupuestoAnadir.addEventListener("click", editarPresupuesto);
  el.presupuestoVer.addEventListener("click", editarPresupuesto);
  el.presupuestoForm.addEventListener("submit", onGuardarPresupuesto);
  el.presupuestoDesde.addEventListener("input", ajustarHasta);
  el.presupuestoQuitar.addEventListener("click", () => ponerPresupuesto(null));
  el.presupuestoVer.addEventListener("animationend", () => el.presupuestoVer.classList.remove("is-nuevo", "is-alarma"));
  el.presupuestoForm.addEventListener("animationend", (event) => {
    event.target.classList.remove("is-nuevo", "is-mal");
  });
  // Si cierras el popup antes de los dos segundos, que no se pierda.
  window.addEventListener("pagehide", apuntarAhora);
  el.momento.addEventListener("animationend", () => el.momento.classList.remove("is-nuevo"));
  el.cambioDia.addEventListener("animationend", () => el.cambioDia.classList.remove("is-nuevo"));
  el.gastosComisiones.addEventListener("animationend", () => el.gastosComisiones.classList.remove("is-tic"));
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
  el.impuestoCampo.addEventListener("input", onCampoImpuesto);
  el.cafeCampo.addEventListener("input", onCampoCafe);
  el.cafeCampo.addEventListener("keydown", onTeclaCampoCafe);
  el.cafeCampo.addEventListener("animationend", () => el.cafeCampo.classList.remove("is-mal"));
  el.resultCafes.addEventListener("click", () => (el.burbuja.hidden ? abrirBurbuja() : cerrarBurbuja()));
  el.sueldoCampo.addEventListener("input", onCampoSueldo);
  el.sueldoCampo.addEventListener("keydown", onTeclaCampoSueldo);
  el.sueldoCampo.addEventListener("animationend", () => el.sueldoCampo.classList.remove("is-mal"));
  el.resultHoras.addEventListener("click", () => (el.burbuja.hidden ? abrirBurbuja() : cerrarBurbuja()));
  el.nochesMenos.addEventListener("click", () => cambiarNoches(-1));
  el.nochesMas.addEventListener("click", () => cambiarNoches(1));
  setInterval(turnarPistas, TURNO_PISTAS);
  setInterval(pintarHoraAlli, 30000);
  el.buscarAbrir.addEventListener("click", () => {
    if (el.buscar.hidden) return abrirBusqueda();
    cerrarBusqueda();
    pintarGastos();
  });
  el.buscarCampo.addEventListener("input", () => {
    busqueda = el.buscarCampo.value;
    pintarGastos();
  });
  el.buscarCampo.addEventListener("keydown", onTeclaBuscar);
  // Las filas vuelven a entrar en cascada: así se ve que se han recolocado.
  el.gastosDiscreto.addEventListener("click", onDiscreto);
  el.gastosOrdenar.addEventListener("click", () => {
    ordenado = ordenado === "caro" ? "barato" : ordenado ? false : "caro";
    cascadaGastos = true;
    pintarGastos();
    el.gastosLista.scrollTop = 0;
  });
  el.buscarTotal.addEventListener("animationend", () => el.buscarTotal.classList.remove("is-tic"));
  el.impuestoCampo.addEventListener("keydown", onTeclaCampoImpuesto);
  el.impuestoCampo.addEventListener("animationend", () => el.impuestoCampo.classList.remove("is-mal"));
  el.comisionImp.addEventListener("animationend", () => el.comisionImp.classList.remove("is-tic"));
  el.avisoForm.addEventListener("submit", onCrearAviso);
  el.avisoModo.addEventListener("click", onModoAviso);
  el.avisoSentido.addEventListener("animationend", () => el.avisoSentido.classList.remove("is-cambiado"));
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
    if (event.key === "Escape" && !el.comparar.hidden) {
      event.preventDefault();
      cerrarComparar()?.focus();
    }
    if (event.key === "Escape" && !el.gastos.hidden) {
      event.preventDefault();
      // Primero se cierra lo de dentro (categorías, presupuesto), y con otro Escape el panel.
      if (cerrarViajes()) el.viaje.focus();
      else if (cerrarCajero()) el.gastosEfectivo.focus();
      else if (cerrarTramos()) el.gastosTramo.focus();
      else if (cerrarPendientes()) el.gastosPendiente.focus();
      else if (cerrarCurva()) el.curvaAbrir.focus();
      else if (cerrarHoras()) document.getElementById("horas-abrir")?.focus();
      else if (cerrarGente()) el.personasCabeza.focus();
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
    // Como en la cuenta, arriba se puede cambiar el precio de allí sin cerrarlo.
    if (!el.comparar.hidden && !el.comparar.contains(event.target) && !el.abrirComparar.contains(event.target)
      && !el.form.contains(event.target)) {
      cerrarComparar();
    }
    if (!el.cuenta.hidden && !el.cuenta.contains(event.target) && !el.abrirCuenta.contains(event.target)
      && !el.form.contains(event.target)) {
      cerrarCuenta();
    }
    if (!el.viajes.hidden && !el.viajes.contains(event.target) && !el.viaje.contains(event.target)) {
      cerrarViajes();
    }
    if (!el.cajero.hidden && !el.cajero.contains(event.target) && !el.gastosEfectivo.contains(event.target)) {
      cerrarCajero();
    }
    if (!el.horas.hidden && !el.horas.contains(event.target) && !document.getElementById("horas-abrir")?.contains(event.target)) {
      cerrarHoras();
    }
    if (!el.curva.hidden && !el.curva.contains(event.target) && !el.curvaAbrir.contains(event.target)) {
      cerrarCurva();
    }
    if (!el.pendientes.hidden && !el.pendientes.contains(event.target) && !el.gastosPendiente.contains(event.target)) {
      cerrarPendientes();
    }
    if (!el.tramos.hidden && !el.tramos.contains(event.target) && !el.gastosTramo.contains(event.target)) {
      cerrarTramos();
    }
    if (!el.gente.hidden && !el.gente.contains(event.target) && !el.personasCabeza.contains(event.target)) {
      cerrarGente();
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
  const [pair, rango, guardados, pendiente, guardadas, vistaGuardada, avisosGuardados, comisionGuardada, fechaGuardada, historialGuardado, viajesGuardados, repartoGuardado, alRevesGuardado, pagoGuardado, cantidadGuardada, impuestoGuardado, cafeGuardado, sueldoGuardado, discretoGuardado] = await Promise.all([
    loadPair(), cargarRango(), cargarRecientes(), tomarPendiente(), cargarExtras(), cargarVista(), cargarAvisos(),
    cargarComision(), cargarFecha(), cargarHistorial(), cargarViajes(), cargarReparto(), cargarTasaAlReves(), cargarPago(),
    cargarCantidad(), cargarImpuesto(), cargarCafe(), cargarSueldo(), cargarDiscreto(),
  ]);
  discreto = discretoGuardado;
  pintarDiscreto();
  pagoNuevo = pagoGuardado;
  pintarPago();
  tasaAlReves = alRevesGuardado;
  reparto = repartoGuardado;
  historial = historialGuardado;
  pintarHistorial();
  viajes = viajesGuardados;
  ({ gastos, presupuesto, cajero } = viajeActivo(viajes));
  pintarCategoriaNueva();
  pintarGastos();
  comision = comisionGuardada;
  impuesto = impuestoGuardado;
  cafe = cafeGuardado;
  sueldo = sueldoGuardado;
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
    // "cd 3,50 usd/gal" llega con su unidad, y así sale también el precio por litro.
    const unidad = UNIDADES[pendiente.unidad] ? `/${nombreUnidad(pendiente.unidad)}` : "";
    el.amount.value = nf.format(pendiente.cantidad) + unidad;
    savePair(pendiente.from, pendiente.to);
    apuntarPar();
    restartAnimation(el.amount, "is-cambiado");
  } else {
    pintarRecientes();
    if (cantidadGuardada !== null) {
      el.amount.value = Number.isInteger(cantidadGuardada) ? nfEntero.format(cantidadGuardada) : nf.format(cantidadGuardada);
      el.amount.classList.add("is-recuperada");
    }
  }
  ponerPistasDeAtajos();
  bindEvents();
  onAmountInput();
  refresh();
  // Lo que viene del clic derecho también es una conversión tuya.
  programarApunte();

  el.amount.focus();
  el.amount.select();
  if (await tomarAbrirGastos()) abrirGastos();
}

// Viene de pulsar el recordatorio de la noche.
async function tomarAbrirGastos() {
  try {
    const { abrirGastos: abrir } = await chrome.storage.session.get("abrirGastos");
    if (abrir) await chrome.storage.session.remove("abrirGastos");
    return Boolean(abrir);
  } catch (error) {
    console.warn("No se pudo leer si abrir los gastos", error);
    return false;
  }
}

init();
