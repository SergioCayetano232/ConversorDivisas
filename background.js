// El service worker no carga logica.js solo; importScripts sí vale porque no es
// un módulo, igual que en el popup.
importScripts("logica.js");

const API = "https://api.frankfurter.dev/v1/latest";
const TIMEOUT_MS = 8000;

const nf = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nfRate = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 4, maximumFractionDigits: 4 });

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "convertir",
    title: "Convertir «%s»",
    contexts: ["selection"],
  });
});

async function leerPar() {
  const { lastPair } = await chrome.storage.local.get("lastPair");
  if (lastPair && isValidCode(lastPair.from) && isValidCode(lastPair.to)) return lastPair;
  return { from: "EUR", to: "USD" };
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

async function calcular(texto) {
  const leido = leerSeleccion(texto);
  if (!leido) return { estado: "nada", original: texto };

  const { from, to } = destinoPara(leido.divisa, await leerPar());
  try {
    const { rate, date } = await tasa(from, to);
    const resultado = leido.cantidad * rate;
    return {
      estado: "ok",
      original: `${nf.format(leido.cantidad)} ${from}`,
      adivinada: !leido.divisa,
      resultado,
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
  await enPagina(tab.id, { estado: "cargando", original: info.selectionText });
  await enPagina(tab.id, await calcular(info.selectionText));
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "convertir") convertirSeleccion(info, tab);
});
