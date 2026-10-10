// El service worker no carga logica.js solo; importScripts sí vale porque no es
// un módulo, igual que en el popup.
importScripts("textos.js", "logica.js");

const IDIOMA_KEY = "idioma";

// El de Chrome ya, y en cuanto se lea lo guardado, el que hayas elegido. Lo
// que dependa del idioma espera a esta promesa: si el service worker se acaba
// de despertar por un clic, la lectura puede no haber llegado.
ponerIdioma(idiomaPara(chrome.i18n.getUILanguage()));
let idiomaListo = aplicarIdioma();

async function aplicarIdioma() {
  const { [IDIOMA_KEY]: guardado } = await chrome.storage.local.get(IDIOMA_KEY);
  ponerIdioma(idiomaElegido(guardado, chrome.i18n.getUILanguage()));
  return guardado ?? "auto";
}

const API = "https://api.frankfurter.dev/v1/latest";
const API_HISTORY = "https://api.frankfurter.dev/v1";
const TIMEOUT_MS = 8000;

// Pedidos en el momento y no guardados al arrancar: numeros() ya los cachea, y
// así siguen el idioma aunque cambie con el service worker vivo.
const nf = { format: (n) => numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) };
const nfRate = { format: (n) => numeros({ minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(n) };

// Los títulos van en el idioma de ahora, así que al cambiarlo los rehago todos.
// Y todos de golpe: al actualizar la extensión los de antes pueden seguir ahí, y
// crear uno con un id repetido falla. En cola, porque dos a la vez (instalar y
// cambiar el idioma, o dos clics seguidos) se mezclaban y salían repetidos.
let colaMenus = Promise.resolve();

function crearMenus() {
  colaMenus = colaMenus.then(hacerMenus, hacerMenus);
  return colaMenus;
}

async function hacerMenus() {
  const elegido = await idiomaListo;
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: "convertir",
    title: tr("menu.convertir"),
    contexts: ["selection"],
  });
  chrome.contextMenus.create({
    id: "precios",
    title: tr("menu.precios"),
    contexts: ["page"],
  });
  // Estos salen al hacer clic derecho en el icono de la barra, no en la página.
  const { insigniaActiva = true } = await chrome.storage.local.get("insigniaActiva");
  chrome.contextMenus.create({
    id: "insignia",
    title: tr("menu.insignia"),
    type: "checkbox",
    checked: insigniaActiva,
    contexts: ["action"],
  });
  const { recordatorioActivo = true } = await chrome.storage.local.get("recordatorioActivo");
  chrome.contextMenus.create({
    id: "recordatorio",
    title: tr("menu.recordatorio"),
    type: "checkbox",
    checked: recordatorioActivo,
    contexts: ["action"],
  });
  chrome.contextMenus.create({ id: "idioma", title: tr("menu.idioma"), contexts: ["action"] });
  const opciones = [["auto", tr("menu.idioma.auto")], ...Object.entries(NOMBRES_IDIOMA)];
  for (const [valor, titulo] of opciones) {
    chrome.contextMenus.create({
      id: `idioma:${valor}`,
      parentId: "idioma",
      title: titulo,
      type: "radio",
      checked: valor === elegido,
      contexts: ["action"],
    });
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await crearMenus();
  // Antes se llamaba "insignia"; si vienes de esa versión, fuera la vieja para
  // no tener dos sonando a la vez.
  await chrome.alarms.clear("insignia");
  chrome.alarms.create("cada-hora", { periodInMinutes: 60 });
  actualizarInsignia();
  revisarAvisos();
});

chrome.runtime.onStartup.addListener(() => {
  actualizarInsignia();
  revisarAvisos();
  recordarGastos();
});

// Con la de cada hora basta: salta entre las nueve y las diez, y si a esa hora
// tenías Chrome cerrado, al abrirlo.
chrome.alarms.onAlarm.addListener((alarma) => {
  if (alarma.name !== "cada-hora") return;
  actualizarInsignia();
  revisarAvisos();
  recordarGastos();
});

// El popup guarda el par al cambiarlo; con esto el icono cambia a la vez.
chrome.storage.onChanged.addListener((cambios, zona) => {
  if (zona !== "local") return;
  if (cambios.viajes) revisarPresupuesto(cambios.viajes.oldValue, cambios.viajes.newValue);
  if (cambios[IDIOMA_KEY]) {
    idiomaListo = aplicarIdioma();
    crearMenus();
    actualizarInsignia();
    return;
  }
  if (cambios.lastPair || cambios.insigniaActiva) actualizarInsignia();
});

const TITULO = "ConversorDivisas (Ctrl+Shift+U)";
const COLORES = { sube: "#4EA96B", baja: "#E5534B", igual: "#E8B75C" };

// Pido una semana y me quedo con los dos últimos días publicados: así el lunes
// compara con el viernes y un festivo no deja la flecha sin nada con qué comparar.
async function serieCorta(from, to) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `${API_HISTORY}/${startDateFor(10)}..?base=${from}&symbols=${to}`;
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return Object.keys(data.rates ?? {})
      .sort()
      .map((fecha) => ({ fecha, valor: data.rates[fecha]?.[to] }))
      .filter((p) => typeof p.valor === "number");
  } finally {
    clearTimeout(timer);
  }
}

let insigniaId = 0;

async function actualizarInsignia() {
  const actual = ++insigniaId;
  await idiomaListo;
  const { insigniaActiva = true } = await chrome.storage.local.get("insigniaActiva");
  const par = await leerPar();

  if (!insigniaActiva || par.from === par.to) {
    await chrome.action.setBadgeText({ text: "" });
    await chrome.action.setTitle({ title: TITULO });
    return;
  }

  try {
    const puntos = await serieCorta(par.from, par.to);
    // Si mientras tanto has cambiado de par, esta respuesta ya no vale.
    if (actual !== insigniaId || puntos.length === 0) return;
    const valores = puntos.map((p) => p.valor);
    const rate = valores[valores.length - 1];
    const cambio = cambioDiario(valores);
    const texto = textoInsignia(rate);
    const color = COLORES[sentidoDe(cambio)];
    const antes = await chrome.action.getBadgeText({});

    await chrome.action.setBadgeTextColor({ color: "#0B0E13" });
    await chrome.action.setTitle({ title: `${tituloInsignia(par, rate, cambio, puntos[puntos.length - 1].fecha)}\n${TITULO}` });
    await chrome.action.setBadgeText({ text: texto });
    // Si la cifra ha cambiado, un destello en blanco antes del color: es el
    // latido de la cifra del popup, pero en el icono.
    if (antes && antes !== texto) {
      await chrome.action.setBadgeBackgroundColor({ color: "#FFFFFF" });
      await new Promise((r) => setTimeout(r, 450));
      if (actual !== insigniaId) return;
    }
    await chrome.action.setBadgeBackgroundColor({ color });
  } catch (error) {
    // Sin conexión me quedo con lo que hubiera: la tasa de hace una hora sigue
    // siendo mejor que un icono vacío.
    console.warn("No se pudo actualizar la insignia", error);
  }
}

async function leerPar() {
  const { lastPair } = await chrome.storage.local.get("lastPair");
  if (lastPair && isValidCode(lastPair.from) && isValidCode(lastPair.to)) return lastPair;
  // Lo mismo que el popup la primera vez, para que el icono no diga otra cosa.
  const { from, to } = parPorIdioma(navigator.languages);
  return { from, to };
}

// Si el popup ya pidió hoy esta tasa la aprovecho. No escribo en la caché: eso
// es cosa del popup, y dos sitios escribiendo acabarían pisándose.
async function tasa(from, to) {
  if (from === to) return { rate: 1, date: null };

  const { rateCache } = await chrome.storage.local.get("rateCache");
  const guardada = rateCache?.[`${from}${to}`];
  if (isFresh(guardada)) return { rate: guardada.rate, date: guardada.date };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${API}?base=${from}&symbols=${to}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const value = data.rates?.[to];
    if (typeof value !== "number") throw new Error("Respuesta inesperada");
    return { rate: value, date: data.date };
  } finally {
    clearTimeout(timer);
  }
}

// La tarjeta vive en la página y no carga textos.js: le mando ya traducido lo
// que va a enseñar y el idioma para los números.
function paraLaTarjeta(datos) {
  return {
    ...datos,
    locale: localeActual(),
    textos: {
      dialogo: tr("tarjeta"),
      cerrar: tr("cerrar"),
      copiar: tr("copiar"),
      copiado: tr("copiado"),
      fallo: tr("copiar.fallo"),
      cita: tr("tarjeta.cita"),
    },
  };
}

async function calcular(texto) {
  const leido = leerSeleccion(texto);
  if (!leido) return { estado: "nada", original: texto, mensaje: tr("tarjeta.nada") };

  const { from, to } = destinoPara(leido.divisa, await leerPar());
  try {
    const { rate, date } = await tasa(from, to);
    const resultado = leido.cantidad * rate;
    return {
      estado: "ok",
      original: `${nf.format(leido.cantidad)} ${from}`,
      nota: leido.divisa ? "" : tr("tarjeta.sinDivisa", { from }),
      resultado,
      copia: textoParaCopiar(resultado),
      texto: nf.format(resultado),
      from,
      to,
      tasa: `1 ${from} = ${nfRate.format(rate)} ${to}`,
      fecha: date ? fechaCorta(date) : null,
      cantidad: leido.cantidad,
    };
  } catch (error) {
    return { estado: "error", original: texto, mensaje: errorMessageFor(error) };
  }
}

function enPagina(tabId, datos) {
  return chrome.scripting.executeScript({
    target: { tabId },
    func: (d) => window.__conversorDivisas.mostrar(d),
    args: [datos],
  });
}

async function convertirSeleccion(info, tab) {
  await idiomaListo;
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["tarjeta.js"] });
  } catch (error) {
    // En chrome://, la Web Store o el visor de PDF no se puede inyectar nada.
    // Ahí abro el popup con la cantidad ya puesta.
    const leido = leerSeleccion(info.selectionText);
    if (leido) {
      const par = destinoPara(leido.divisa, await leerPar());
      await chrome.storage.session.set({ pendiente: { cantidad: leido.cantidad, ...par } });
    }
    try {
      await chrome.action.openPopup();
    } catch (otro) {
      console.warn("No se pudo abrir el popup", otro);
    }
    return;
  }

  // La tarjeta sale ya, cargando; la cifra llega cuando responda la API.
  await enPagina(tab.id, paraLaTarjeta({ estado: "cargando", original: info.selectionText }));
  await enPagina(tab.id, paraLaTarjeta(await calcular(info.selectionText)));
}

// Va en tres pasos porque las tasas las pido yo y no la página: primero busca
// los precios, luego pido una tasa por divisa y al final pinta. Si ya estaban
// puestos, el primer paso los quita y aquí se acaba.
async function convertirPagina(tab) {
  await idiomaListo;
  const enLaPestana = async (func, args = []) => {
    const [{ result }] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func, args });
    return result;
  };
  let hallado;
  try {
    // logica.js lleva const de primer nivel: inyectarlo dos veces da error.
    if (!(await enLaPestana(() => Boolean(window.__conversorPrecios)))) {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["logica.js", "precios.js"] });
    }
    hallado = await enLaPestana(() => window.__conversorPrecios.alternar());
  } catch (error) {
    // En chrome:// o la Web Store no se puede, y ahí tampoco hay precios.
    console.warn("No se pudo mirar la página", error);
    return;
  }
  if (!hallado) return;

  const par = await leerPar();
  const tasas = {};
  let fallo = null;
  for (const divisa of hallado.divisas) {
    const { to } = destinoPara(divisa, par);
    try {
      const { rate } = await tasa(divisa, to);
      tasas[divisa] = { to, rate };
    } catch (error) {
      fallo = error;
    }
  }

  await enLaPestana((d) => window.__conversorPrecios.pintar(d), [{
    tasas,
    locale: localeActual(),
    error: fallo && Object.keys(tasas).length === 0 ? errorMessageFor(fallo) : null,
    textos: {
      uno: tr("precios.uno"),
      varios: tr("precios.varios"),
      nada: tr("precios.nada"),
      quitar: tr("precios.quitar"),
      otraVez: tr("precios.otraVez"),
      cerrar: tr("cerrar"),
    },
  }]);
}

// La barra de direcciones: "cd 20 usd". Pido todas las tasas del origen de una
// vez, que así salen también tus otras divisas, y las guardo en memoria mientras
// escribes: si no, cada tecla sería una petición.
let tasasBarra = null;
let barraId = 0;

async function tasasDe(base) {
  if (tasasBarra?.base === base && tasasBarra.dia === hoy()) return tasasBarra.rates;
  const rates = await todasLasTasas(base);
  tasasBarra = { base, dia: hoy(), rates };
  return rates;
}

function pistaBarra(texto) {
  chrome.omnibox.setDefaultSuggestion({ description: escaparXml(texto) });
}

// Lo que hace falta para apuntar desde la barra, con la tasa de hoy.
async function prepararGasto(texto) {
  const leido = leerGastoBarra(texto, await leerPar());
  if (!leido) return null;
  const guardado = await chrome.storage.local.get(["viajes", "gastosViaje", "presupuestoViaje", "comisionBanco", "pagoGasto"]);
  const viajes = leerViajes(guardado.viajes, guardado.gastosViaje, guardado.presupuestoViaje);
  const rates = await tasasDe(leido.from);
  const gasto = gastoDeBarra(leido, {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    cuando: Date.now(),
    tasa: rates[leido.to],
    comision: leerComision(guardado.comisionBanco),
    pago: guardado.pagoGasto,
    usados: conceptosUsados(viajes.lista.flatMap((v) => v.gastos)),
  });
  return gasto && { gasto, viajes, viaje: viajeActivo(viajes) };
}

const cifraGasto = (n, divisa) => `${nf.format(n)} ${divisa}`;

async function sugerirGasto(texto, sugerir, actual) {
  sugerir([]);
  try {
    const listo = await prepararGasto(texto);
    if (actual !== barraId) return;
    if (!listo) {
      pistaBarra(tr("barra.gastoPista"));
      return;
    }
    const { gasto, viaje } = listo;
    const que = [cifraGasto(gasto.cantidad, gasto.from), gasto.concepto || tr(`cat.${gasto.categoria}`)].join(" · ");
    const donde = viaje.nombre ? tr("barra.gastoEn", { viaje: viaje.nombre }) : tr("barra.gastoApunta");
    chrome.omnibox.setDefaultSuggestion({
      description: `${escaparXml(donde)} <match>${escaparXml(que)}</match>`
        + ` <dim>${escaparXml(`= ${cifraGasto(gasto.valor, gasto.to)} · ${tr(`pago.${gasto.pago}`)} · ${tr("barra.gastoEnter")}`)}</dim>`,
    });
  } catch (error) {
    if (actual !== barraId) return;
    pistaBarra(errorMessageFor(error));
  }
}

async function apuntarDesdeBarra(texto) {
  try {
    const listo = await prepararGasto(texto);
    if (!listo) return false;
    const { gasto, viajes, viaje } = listo;
    await chrome.storage.local.set({ viajes: cambiarViaje(viajes, viaje.id, { gastos: apuntarGasto(viaje.gastos, gasto) }) });
    await chrome.storage.local.remove(["gastosViaje", "presupuestoViaje"]);
    const cuerpo = [gasto.concepto || tr(`cat.${gasto.categoria}`), cifraGasto(gasto.valor, gasto.to)].join(" · ");
    await chrome.notifications.create(`gasto:${viaje.id}:${gasto.id}`, {
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: viaje.nombre ? tr("barra.apuntadoEn", { importe: cifraGasto(gasto.cantidad, gasto.from), viaje: viaje.nombre })
        : tr("barra.apuntado", { importe: cifraGasto(gasto.cantidad, gasto.from) }),
      message: cuerpo,
      priority: 0,
    });
  } catch (error) {
    console.warn("No se pudo apuntar el gasto", error);
    pistaBarra(errorMessageFor(error));
  }
  return true;
}

async function sugerirEnBarra(texto, sugerir) {
  const actual = ++barraId;
  await idiomaListo;
  if (/^\s*\+/.test(texto)) return sugerirGasto(texto, sugerir, actual);
  const leido = leerOmnibox(texto, await leerPar());
  if (actual !== barraId) return;
  if (!leido) {
    pistaBarra(tr(texto.trim() ? "barra.no" : "barra.pista"));
    sugerir([]);
    return;
  }

  const { cantidad, from, to } = leido;
  const de = `${nf.format(cantidad)} ${from}`;
  try {
    const rates = await tasasDe(from);
    const { divisasExtra } = await chrome.storage.local.get("divisasExtra");
    if (actual !== barraId) return;
    const rate = rates[to];
    if (typeof rate !== "number") throw new Error("Respuesta inesperada");
    chrome.omnibox.setDefaultSuggestion({
      description: `<match>${escaparXml(`${de} = ${nf.format(cantidad * rate)} ${to}`)}</match>`
        + ` <dim>${escaparXml(`· 1 ${from} = ${nfRate.format(rate)} ${to} · ${tr("barra.enter")}`)}</dim>`,
    });
    // Debajo, tus otras divisas. Lo que va en content es lo que se vuelve a
    // leer si eliges esa, así que va escrito como lo escribirías tú.
    sugerir(leerExtras(divisasExtra)
      .filter((code) => code !== from && code !== to && typeof rates[code] === "number")
      .map((code) => ({
        content: `${textoParaCopiar(cantidad)} ${from} ${code}`,
        description: `${escaparXml(`${de} =`)} <match>${escaparXml(`${nf.format(cantidad * rates[code])} ${code}`)}</match>`,
      })));
  } catch (error) {
    if (actual !== barraId) return;
    pistaBarra(errorMessageFor(error));
    sugerir([]);
  }
}

// Con Enter se abre el popup con la cantidad y el par ya puestos, igual que
// cuando la selección viene de una página donde no se puede poner la tarjeta.
async function abrirDesdeBarra(texto) {
  await idiomaListo;
  if (/^\s*\+/.test(texto)) {
    await apuntarDesdeBarra(texto);
    return;
  }
  const leido = leerOmnibox(texto, await leerPar());
  if (leido) await chrome.storage.session.set({ pendiente: leido });
  try {
    await chrome.action.openPopup();
  } catch (error) {
    console.warn("No se pudo abrir el popup", error);
  }
}

chrome.omnibox.onInputStarted.addListener(async () => {
  await idiomaListo;
  pistaBarra(tr("barra.pista"));
});
chrome.omnibox.onInputChanged.addListener(sugerirEnBarra);
chrome.omnibox.onInputEntered.addListener(abrirDesdeBarra);

// Lo seleccionado, también dentro de un campo de texto: ahí getSelection() no
// ve nada. Va a la página tal cual, así que no puede usar nada de fuera.
function leerSeleccionDePagina() {
  const campo = document.activeElement;
  if (campo && typeof campo.selectionStart === "number" && typeof campo.value === "string") {
    return campo.value.slice(campo.selectionStart, campo.selectionEnd);
  }
  return String(getSelection());
}

// El atajo hace lo mismo que el clic derecho, pero primero tengo que ir a
// buscar qué hay seleccionado.
async function convertirConAtajo(tab) {
  await idiomaListo;
  let texto;
  try {
    const [{ result }] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: leerSeleccionDePagina });
    texto = String(result ?? "").trim();
  } catch (error) {
    // En chrome:// o la Web Store no hay forma de leerlo: abro el popup sin más.
    try {
      await chrome.action.openPopup();
    } catch (otro) {
      console.warn("No se pudo abrir el popup", otro);
    }
    return;
  }
  if (texto) {
    await convertirSeleccion({ selectionText: texto }, tab);
    return;
  }
  await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["tarjeta.js"] });
  await enPagina(tab.id, paraLaTarjeta({ estado: "nada", original: "", mensaje: tr("tarjeta.sinSeleccion") }));
}

chrome.commands.onCommand.addListener((comando, tab) => {
  if (comando === "convertir-seleccion" && tab) convertirConAtajo(tab);
});

// Aquí no uso la caché del popup: guarda la tasa de la mañana hasta el día
// siguiente, y el BCE publica por la tarde. Un aviso tiene que ver la nueva.
async function todasLasTasas(base) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${API}?base=${base}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.rates ?? {};
  } finally {
    clearTimeout(timer);
  }
}

async function revisarAvisos() {
  await idiomaListo;
  const { avisos: guardados } = await chrome.storage.local.get("avisos");
  const avisos = leerAvisos(guardados);
  if (avisos.length === 0) return;

  // Una petición por divisa de origen, aunque haya varios avisos con la misma.
  const tasas = {};
  for (const base of new Set(avisos.map((a) => a.from))) {
    try {
      tasas[base] = await todasLasTasas(base);
    } catch (error) {
      console.warn(`No se pudieron revisar los avisos de ${base}`, error);
    }
  }

  const { cumplidos } = repartirAvisos(avisos, tasas);
  if (cumplidos.length === 0) return;

  // Vuelvo a leer antes de guardar: si mientras pedía las tasas has creado uno
  // en el popup, con la lista de antes lo borraría.
  const hechos = new Set(cumplidos.map(({ aviso }) => aviso.id));
  const { avisos: ahora } = await chrome.storage.local.get("avisos");
  await chrome.storage.local.set({ avisos: leerAvisos(ahora).filter((a) => !hechos.has(a.id)) });

  // Las espero: si la función acaba antes, Chrome puede dormir el service
  // worker con alguna notificación sin crear.
  await Promise.all(cumplidos.map(({ aviso, rate }) => {
    const { titulo, cuerpo } = mensajeAviso(aviso, rate);
    // El par va en el id para saber cuál abrir si pulsas la notificación.
    return chrome.notifications.create(`aviso:${aviso.from}:${aviso.to}:${aviso.id}`, {
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: titulo,
      message: cuerpo,
      priority: 2,
    });
  }));
}

// En cola: dos gastos seguidos leerían a la vez lo ya avisado y saldría el
// mismo aviso dos veces.
let colaPresupuesto = Promise.resolve();

function revisarPresupuesto(antes, despues) {
  colaPresupuesto = colaPresupuesto.then(() => avisarPresupuesto(antes, despues)).catch((error) => {
    console.warn("No se pudo revisar el presupuesto", error);
  });
}

async function avisarPresupuesto(antes, despues) {
  if (!despues) return;
  await idiomaListo;
  const { presupuestoAvisado } = await chrome.storage.local.get("presupuestoAvisado");
  const { avisos, avisados } = avisosPresupuesto(leerViajes(antes), leerViajes(despues), presupuestoAvisado ?? {});
  await chrome.storage.local.set({ presupuestoAvisado: avisados });
  await Promise.all(avisos.map((aviso) => {
    const { titulo, cuerpo } = mensajePresupuesto(aviso);
    // Sin par en el id: al pulsarla solo se abre el popup.
    return chrome.notifications.create(`presupuesto:${aviso.viaje.id}:${aviso.nivel}`, {
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: titulo,
      message: cuerpo,
      priority: 1,
    });
  }));
}

async function recordarGastos() {
  try {
    await idiomaListo;
    const { recordatorioActivo = true, recordatorioAvisado, viajes } = await chrome.storage.local.get(["recordatorioActivo", "recordatorioAvisado", "viajes"]);
    if (!recordatorioActivo || !viajes) return;
    const viaje = tocaRecordar(leerViajes(viajes), recordatorioAvisado);
    if (!viaje) return;
    await chrome.storage.local.set({ recordatorioAvisado: hoy() });
    const { titulo, cuerpo } = mensajeRecordatorio(viaje);
    await chrome.notifications.create(`recordatorio:${viaje.id}`, {
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: titulo,
      message: cuerpo,
      priority: 1,
    });
  } catch (error) {
    console.warn("No se pudo mirar si faltan gastos", error);
  }
}

// Te lleva a ese viaje con los gastos ya abiertos, que es a lo que vienes.
async function irAGastos(viajeId) {
  const { viajes } = await chrome.storage.local.get("viajes");
  if (viajes?.lista?.some((v) => v.id === viajeId)) await chrome.storage.local.set({ viajes: { ...viajes, activo: viajeId } });
  await chrome.storage.session.set({ abrirGastos: true });
}

chrome.notifications.onClicked.addListener(async (id) => {
  chrome.notifications.clear(id);
  if (id.startsWith("recordatorio:")) await irAGastos(id.slice(13));
  if (id.startsWith("gasto:")) await irAGastos(id.split(":")[1]);
  const [, from, to] = id.split(":");
  if (isValidCode(from) && isValidCode(to)) await chrome.storage.local.set({ lastPair: { from, to } });
  try {
    await chrome.action.openPopup();
  } catch (error) {
    console.warn("No se pudo abrir el popup", error);
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "convertir") convertirSeleccion(info, tab);
  if (info.menuItemId === "precios") convertirPagina(tab);
  if (info.menuItemId === "insignia") chrome.storage.local.set({ insigniaActiva: info.checked });
  if (info.menuItemId === "recordatorio") chrome.storage.local.set({ recordatorioActivo: info.checked });
  // El aviso es para el popup: la próxima vez que lo abras te dice en qué idioma está.
  if (String(info.menuItemId).startsWith("idioma:")) {
    chrome.storage.local.set({ [IDIOMA_KEY]: info.menuItemId.slice(7), avisarIdioma: true });
  }
});
