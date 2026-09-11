const API = "https://api.frankfurter.dev/v1/latest";
const API_HISTORY = "https://api.frankfurter.dev/v1";
const RANGOS = [7, 30, 90];
const RANGO_POR_DEFECTO = 30;

const DEFAULTS = { from: "EUR", to: "USD" };

const el = {
  form: document.getElementById("converter-form"),
  amount: document.getElementById("amount"),
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
  trendChange: document.getElementById("trend-change"),
  rangos: document.querySelectorAll(".rango"),
  trendLine: document.getElementById("trend-line"),
  trendArea: document.getElementById("trend-area"),
};

let rate = null;
let rateDate = null;
// Que campo manda. Si escribes en el de abajo hay que convertir al reves, y
// sobre todo no le puedo reescribir lo que esta tecleando.
let ladoActivo = "amount";
let dias = RANGO_POR_DEFECTO;
let requestId = 0;
let trendId = 0;

const nf = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const nfRate = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

const nfPercent = new Intl.NumberFormat("es-ES", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});


const STORAGE_KEY = "lastPair";
const RANGO_KEY = "rangoGrafico";
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
  return DEFAULTS;
}

async function savePair(from, to) {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: { from, to } });
  } catch (error) {
    console.warn("No se pudo guardar el almacenamiento", error);
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
// borraría lo del primero.
async function saveCache(nuevas) {
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
      vacio.textContent = "Ninguna divisa";
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
      nom.textContent = divisa.name;

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
      .map((date) => data.rates[date]?.[to])
      .filter((value) => typeof value === "number");
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
  el.trend.hidden = true;
  el.trendLine.setAttribute("d", "");
  el.trendArea.setAttribute("d", "");
  el.trendChange.textContent = "";
  el.trendChange.classList.remove("is-up", "is-down");
}

function renderTrend(values) {
  // Con menos de dos puntos no hay nada que dibujar ni con qué comparar.
  if (values.length < 2) {
    hideTrend();
    return;
  }

  const { line, area } = buildPaths(values);
  el.trendLine.setAttribute("d", line);
  el.trendArea.setAttribute("d", area);

  // La animación de dibujo necesita saber lo que mide la línea, y eso solo lo
  // sabe el SVG una vez tiene el path puesto.
  el.trendLine.style.setProperty("--len", el.trendLine.getTotalLength());
  restartAnimation(el.trendLine);

  const first = values[0];
  const last = values[values.length - 1];
  const change = first === 0 ? 0 : (last - first) / first;

  el.trendChange.textContent = nfPercent.format(change);
  el.trendChange.classList.toggle("is-up", change > 0);
  el.trendChange.classList.toggle("is-down", change < 0);

  el.trend.hidden = false;
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
  if (isFresh(cached) && Array.isArray(cached.values)) {
    renderTrend(cached.values);
    return;
  }

  el.trend.classList.add("is-cargando");

  try {
    const values = await fetchHistory(from, to, dias);
    if (currentTrend !== trendId) return;
    el.trend.classList.remove("is-cargando");
    renderTrend(values);

    saveCache({ [key]: { values, day: hoy(), saved: Date.now() } });
  } catch (error) {
    if (currentTrend !== trendId) return;
    // El histórico es un extra: si falla, el conversor sigue funcionando y
    // no mostramos un segundo mensaje de error.
    console.warn("No se pudo obtener el histórico", error);
    el.trend.classList.remove("is-cargando");
    hideTrend();
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
  el.updated.textContent = rateDate ? `Act. ${rateDate}` : "";
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
  el.status.textContent = active ? "Obteniendo tasas…" : "";
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
  const valor = parseAmount(origen.value);

  if (valor === null) {
    destino.value = "—";
    ajustarAncho();
    el.resultMeta.textContent = "";
    return;
  }

  if (rate === null) return;

  const convertido = escribiendoAbajo ? valor / rate : valor * rate;
  destino.value = nf.format(convertido);
  ajustarAncho();

  const enviados = escribiendoAbajo ? convertido : valor;
  el.resultMeta.textContent = `${nf.format(enviados)} ${from}`;

  // El latido solo cuando cambia la cifra grande, que si no parpadea al teclear.
  if (!escribiendoAbajo) restartAnimation(el.resultBox, "is-updating");
}

async function refresh() {
  const from = el.from.value;
  const to = el.to.value;

  if (from === to) {
    rate = 1;
    rateDate = null;
    clearError();
    renderRateLine(from, to);
    renderUpdated();
    renderResult();
    refreshTrend(from, to);
    return;
  }

  const currentRequest = ++requestId;
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
  refresh();
}

function onAmountInput() {
  ladoActivo = "amount";
  const amount = parseAmount(el.amount.value);
  const invalid = el.amount.value.trim() !== "" && amount === null;

  el.amount.setAttribute("aria-invalid", String(invalid));
  el.amountError.hidden = !invalid;
  el.amountError.textContent = invalid ? "Introduce una cantidad válida" : "";

  renderResult();
}

function onResultInput() {
  ladoActivo = "result";
  ajustarAncho();
  const valor = parseAmount(el.result.value);
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
  const valor = parseAmount(el.result.value);
  if (valor === null || rate === null) return;

  // Copio el número a secas, sin el código ni separadores de miles: lo normal
  // es que acabe pegado en una hoja de cálculo y ahí el punto estorba.
  const texto = valor.toFixed(2).replace(".", ",");

  try {
    await navigator.clipboard.writeText(texto);
    avisar("Copiado");
  } catch (error) {
    // El portapapeles moderno puede negarse según cómo esté el foco. El truco
    // del campo oculto es viejo pero no pide permisos y aquí siempre funciona.
    if (copiarALaAntigua(texto)) {
      avisar("Copiado");
      return;
    }
    console.warn("No se pudo copiar", error);
    avisar("No se pudo");
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
    el.copiarTexto.textContent = "Copiar";
    el.copiar.classList.remove("is-hecho");
  }, 1400);
}

async function cargarRango() {
  try {
    const guardado = await chrome.storage.local.get(RANGO_KEY);
    const valor = guardado[RANGO_KEY];
    if (RANGOS.includes(valor)) return valor;
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
  refresh();
}

function bindEvents() {
  el.form.addEventListener("submit", (event) => event.preventDefault());
  el.amount.addEventListener("input", onAmountInput);
  el.result.addEventListener("input", onResultInput);
  el.result.addEventListener("focus", () => el.result.select());
  el.swap.addEventListener("click", onSwap);
  el.retry.addEventListener("click", refresh);
  el.copiar.addEventListener("click", onCopiar);
  for (const boton of el.rangos) boton.addEventListener("click", onRango);
  window.addEventListener("online", () => {
    if (rate === null) refresh();
  });
}

async function init() {
  const [pair, rango] = await Promise.all([loadPair(), cargarRango()]);
  dias = rango;
  marcarRango();
  populateSelects(pair);
  bindEvents();
  onAmountInput();
  refresh();

  el.amount.focus();
  el.amount.select();
}

init();
