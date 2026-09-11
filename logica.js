// La lógica que no toca la pantalla, separada para poder probarla con node.
// popup.js la carga antes que a sí mismo; en los tests se importa tal cual.

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

const isValidCode = (code) => CURRENCIES.some((c) => c.code === code);

const nombreDe = (code) => CURRENCIES.find((c) => c.code === code)?.name ?? code;

function parseAmount(raw) {
  // Ahora que el resultado se puede editar me llega ya formateado ("1.084,70"),
  // así que el punto de los miles hay que quitarlo antes de nada: sin esto,
  // "1.000" se leía como un 1.
  const cleaned = raw
    .trim()
    .replace(/\s/g, "")
    .replace(/\u00A0/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  if (cleaned === "") return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

// Fecha local en formato ISO. No uso toISOString() porque pasa a UTC y aquí,
// a partir de las dos de la tarde en verano, ya me daba el día siguiente.
function isoLocal(date) {
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mes}-${dia}`;
}

function hoy() {
  return isoLocal(new Date());
}

// El BCE saca las tasas una vez al día laborable, sobre las cuatro de la tarde.
// Guardo el día en que pedí los datos y los doy por buenos mientras siga siendo
// el mismo día: un TTL de horas me haría pedir de madrugada para nada.
function isFresh(entry) {
  return Boolean(entry) && entry.day === hoy();
}

// Sin tildes y en minúscula, para que "dolar" encuentre "Dólar" y "peso
// mexicano" no dependa de cómo lo escribas.
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function filtrarDivisas(consulta) {
  const q = normalizar(consulta.trim());
  if (q === "") return CURRENCIES;

  // El código primero: si escribes "usd" quieres el dólar arriba del todo, no
  // el peso uruguayo porque su nombre lleva una u.
  const porCodigo = [];
  const porNombre = [];

  for (const divisa of CURRENCIES) {
    if (normalizar(divisa.code).startsWith(q)) porCodigo.push(divisa);
    else if (normalizar(divisa.name).includes(q)) porNombre.push(divisa);
  }

  return [...porCodigo, ...porNombre];
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

function startDateFor(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return isoLocal(date);
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

// El popup lo carga como script normal y lo lee del ámbito global; Node necesita
// el export. Sin esto habría que montar un build, y aquí no hay ninguno.
if (typeof module !== "undefined") {
  module.exports = {
    CURRENCIES, isValidCode, nombreDe, parseAmount, isoLocal, hoy, isFresh,
    normalizar, filtrarDivisas, buildPaths, startDateFor, errorMessageFor,
  };
}
