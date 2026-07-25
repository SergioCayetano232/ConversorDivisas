const API = "https://api.frankfurter.dev/v1/latest";

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
};

let rate = null;
let rateDate = null;

const nf = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const nfRate = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
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

async function fetchRate(from, to) {
  const url = `${API}?base=${from}&symbols=${to}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data = await response.json();
  const value = data.rates?.[to];
  if (typeof value !== "number") throw new Error("Respuesta inesperada");

  return { rate: value, date: data.date };
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
  el.result.textContent = `${nf.format(converted)} ${to}`;
  el.resultMeta.textContent = `${nf.format(amount)} ${from}`;

  el.resultBox.classList.remove("is-updating");
  void el.resultBox.offsetWidth;
  el.resultBox.classList.add("is-updating");
}

async function refresh() {
  const from = el.from.value;
  const to = el.to.value;

  if (from === to) {
    rate = 1;
    rateDate = null;
    renderRateLine(from, to);
    renderUpdated();
    renderResult();
    return;
  }

  el.resultBox.classList.add("is-loading");

  try {
    const data = await fetchRate(from, to);
    rate = data.rate;
    rateDate = data.date;
    renderRateLine(from, to);
    renderUpdated();
    renderResult();
  } catch (error) {
    rate = null;
    el.result.textContent = "—";
    el.rateLine.textContent = "";
    console.error(error);
  } finally {
    el.resultBox.classList.remove("is-loading");
  }
}

function onSwap() {
  const from = el.from.value;
  el.from.value = el.to.value;
  el.to.value = from;

  el.swap.classList.toggle("is-swapping");

  if (rate !== null && rate !== 0) {
    rate = 1 / rate;
    renderRateLine(el.from.value, el.to.value);
    renderResult();
  }

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
}

async function init() {
  const pair = await loadPair();
  populateSelects(pair);
  bindEvents();
  refresh();
}

init();
