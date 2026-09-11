const API = "https://api.frankfurter.dev/v1/latest";
const API_HISTORY = "https://api.frankfurter.dev/v1";
const TREND_DAYS = 30;

const CURRENCIES = [
  { code: "EUR", name: "Euro" },
  { code: "USD", name: "Dólar estadounidense" },
  { code: "GBP", name: "Libra esterlina" },
  { code: "JPY", name: "Yen japonés" },
  { code: "CHF", name: "Franco suizo" },
  { code: "CAD", name: "Dólar canadiense" },
  { code: "AUD", name: "Dólar australiano" },
  { code: "CNY", name: "Yuan chino" },
  { code: "MXN", name: "Peso mexicano" },
  { code: "BRL", name: "Real brasileño" },
  { code: "SEK", name: "Corona sueca" },
  { code: "NOK", name: "Corona noruega" },
  { code: "DKK", name: "Corona danesa" },
  { code: "PLN", name: "Esloti polaco" },
  { code: "TRY", name: "Lira turca" },
];

const DEFAULTS = { from: "EUR", to: "USD" };

const el = {
  form: document.getElementById("converter-form"),
  amount: document.getElementById("amount"),
  from: document.getElementById("from"),
  to: document.getElementById("to"),
  swap: document.getElementById("swap"),
  result: document.getElementById("result"),
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
  trendLine: document.getElementById("trend-line"),
  trendArea: document.getElementById("trend-area"),
};

let rate = null;
let rateDate = null;
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

function parseAmount(raw) {
  const cleaned = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (cleaned === "") return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

const STORAGE_KEY = "lastPair";

const isValidCode = (code) => CURRENCIES.some((c) => c.code === code);

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

function populateSelects(pair) {
  for (const select of [el.from, el.to]) {
    const fragment = document.createDocumentFragment();
    for (const { code, name } of CURRENCIES) {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = `${code} · ${name}`;
      fragment.appendChild(option);
    }
    select.appendChild(fragment);
  }
  el.from.value = pair.from;
  el.to.value = pair.to;
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

function startDateFor(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

async function fetchHistory(from, to) {
  const url = `${API_HISTORY}/${startDateFor(TREND_DAYS)}..?base=${from}&symbols=${to}`;
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

// Convierte la serie en dos paths SVG sobre el viewBox de 100x28 del gráfico:
// la línea y el área sombreada que queda por debajo.
function buildPaths(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;

  // Dejo un margen a los lados y arriba: el trazo se pinta centrado sobre la
  // línea, así que pegado al borde se le come la mitad.
  const PAD_X = 1.5;
  const PAD_Y = 3;
  const width = 100 - PAD_X * 2;
  const stepX = width / (values.length - 1);
  const bottom = 28 - PAD_Y;
  const height = bottom - PAD_Y;

  const points = values.map((value, index) => {
    const x = PAD_X + index * stepX;
    // Si la tasa no se ha movido, span es 0: dibujamos una línea centrada.
    const y = span === 0 ? 14 : bottom - ((value - min) / span) * height;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const line = `M${points.join("L")}`;
  const area = `${line}L${(100 - PAD_X).toFixed(2)},28L${PAD_X.toFixed(2)},28Z`;
  return { line, area };
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

  try {
    const values = await fetchHistory(from, to);
    if (currentTrend !== trendId) return;
    renderTrend(values);
  } catch (error) {
    if (currentTrend !== trendId) return;
    // El histórico es un extra: si falla, el conversor sigue funcionando y
    // no mostramos un segundo mensaje de error.
    console.warn("No se pudo obtener el histórico", error);
    hideTrend();
  }
}

function errorMessageFor(error) {
  if (error.name === "AbortError") {
    return "La conexión ha tardado demasiado.";
  }
  if (!navigator.onLine) {
    return "Sin conexión a internet.";
  }
  if (error.message.startsWith("HTTP")) {
    return "El servicio de tasas no responde.";
  }
  return "No se han podido obtener las tasas.";
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

function renderResult() {
  const from = el.from.value;
  const to = el.to.value;
  const amount = parseAmount(el.amount.value);

  if (amount === null) {
    el.result.textContent = "—";
    el.resultMeta.textContent = "";
    return;
  }

  if (rate === null) return;

  const converted = amount * rate;
  el.result.replaceChildren(
    document.createTextNode(nf.format(converted)),
    Object.assign(document.createElement("span"), {
      className: "result__code",
      textContent: to,
    })
  );
  el.resultMeta.textContent = `${nf.format(amount)} ${from}`;

  restartAnimation(el.resultBox, "is-updating");
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
  setLoading(true);
  clearError();

  try {
    const data = await fetchRate(from, to);
    if (currentRequest !== requestId) return;

    rate = data.rate;
    rateDate = data.date;
    renderRateLine(from, to);
    renderUpdated();
    renderResult();
    refreshTrend(from, to);
  } catch (error) {
    if (currentRequest !== requestId) return;

    rate = null;
    rateDate = null;
    el.result.textContent = "—";
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
  el.from.value = el.to.value;
  el.to.value = from;

  restartAnimation(el.swap, "is-swapping");

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
  const amount = parseAmount(el.amount.value);
  const invalid = el.amount.value.trim() !== "" && amount === null;

  el.amount.setAttribute("aria-invalid", String(invalid));
  el.amountError.hidden = !invalid;
  el.amountError.textContent = invalid ? "Introduce una cantidad válida" : "";

  renderResult();
}

function onCurrencyChange() {
  savePair(el.from.value, el.to.value);
  refresh();
}

function bindEvents() {
  el.form.addEventListener("submit", (event) => event.preventDefault());
  el.amount.addEventListener("input", onAmountInput);
  el.from.addEventListener("change", onCurrencyChange);
  el.to.addEventListener("change", onCurrencyChange);
  el.swap.addEventListener("click", onSwap);
  el.retry.addEventListener("click", refresh);
  window.addEventListener("online", () => {
    if (rate === null) refresh();
  });
}

async function init() {
  const pair = await loadPair();
  populateSelects(pair);
  bindEvents();
  onAmountInput();
  refresh();

  el.amount.focus();
  el.amount.select();
}

init();
