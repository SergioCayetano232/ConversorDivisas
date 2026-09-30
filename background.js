// El service worker no carga logica.js solo; importScripts sí vale porque no es
// un módulo, igual que en el popup.
importScripts("textos.js", "logica.js");

ponerIdioma(idiomaPara(chrome.i18n.getUILanguage()));

const API = "https://api.frankfurter.dev/v1/latest";
const API_HISTORY = "https://api.frankfurter.dev/v1";
const TIMEOUT_MS = 8000;

// Pedidos en el momento y no guardados al arrancar: numeros() ya los cachea, y
// así siguen el idioma aunque cambie con el service worker vivo.
const nf = { format: (n) => numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) };
const nfRate = { format: (n) => numeros({ minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(n) };

chrome.runtime.onInstalled.addListener(async () => {
  // Al actualizar la extensión los menús de antes pueden seguir ahí, y crear
  // uno con un id repetido falla.
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: "convertir",
    title: tr("menu.convertir"),
    contexts: ["selection"],
  });
  // Este sale al hacer clic derecho en el icono de la barra, no en la página.
  const { insigniaActiva = true } = await chrome.storage.local.get("insigniaActiva");
  chrome.contextMenus.create({
    id: "insignia",
    title: tr("menu.insignia"),
    type: "checkbox",
    checked: insigniaActiva,
    contexts: ["action"],
  });
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
});

chrome.alarms.onAlarm.addListener((alarma) => {
  if (alarma.name !== "cada-hora") return;
  actualizarInsignia();
  revisarAvisos();
});

// El popup guarda el par al cambiarlo; con esto el icono cambia a la vez.
chrome.storage.onChanged.addListener((cambios, zona) => {
  if (zona === "local" && (cambios.lastPair || cambios.insigniaActiva)) actualizarInsignia();
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
      .map((fecha) => data.rates[fecha]?.[to])
      .filter((v) => typeof v === "number");
  } finally {
    clearTimeout(timer);
  }
}

let insigniaId = 0;

async function actualizarInsignia() {
  const actual = ++insigniaId;
  const { insigniaActiva = true } = await chrome.storage.local.get("insigniaActiva");
  const par = await leerPar();

  if (!insigniaActiva || par.from === par.to) {
    await chrome.action.setBadgeText({ text: "" });
    await chrome.action.setTitle({ title: TITULO });
    return;
  }

  try {
    const valores = await serieCorta(par.from, par.to);
    // Si mientras tanto has cambiado de par, esta respuesta ya no vale.
    if (actual !== insigniaId || valores.length === 0) return;
    const rate = valores[valores.length - 1];
    const cambio = cambioDiario(valores);
    const texto = textoInsignia(rate);
    const color = COLORES[sentidoDe(cambio)];
    const antes = await chrome.action.getBadgeText({});

    await chrome.action.setBadgeTextColor({ color: "#0B0E13" });
    await chrome.action.setTitle({ title: `${tituloInsignia(par, rate, cambio)}\n${TITULO}` });
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

chrome.notifications.onClicked.addListener(async (id) => {
  chrome.notifications.clear(id);
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
  if (info.menuItemId === "insignia") chrome.storage.local.set({ insigniaActiva: info.checked });
});
