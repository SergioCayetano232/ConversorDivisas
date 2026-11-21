// Las medidas: de grados a tallas. Cada una con su leer, su convertir y su texto.

// "cd 75f" en la barra: el tiempo de allí, que en Estados Unidos va en
// Fahrenheit. Con signo, que en invierno hace falta, y coma o punto. Los kelvin,
// solo con la palabra entera: "300k" son trescientos mil.
const HAY_GRADOS = /^\s*([-−]?)\s*(\d+(?:[.,]\d+)?)\s*[°º]?\s*(f|c|fahrenheit|celsius|kelvins?)\s*$/i;
const CERO_ABSOLUTO = 273.15;

function leerGrados(texto) {
  const m = String(texto ?? "").match(HAY_GRADOS);
  if (!m) return null;
  const valor = Number(m[2].replace(",", ".")) * (m[1] ? -1 : 1);
  const de = m[3][0].toLowerCase();
  if (de === "k" && valor < 0) return null;
  return { valor, de };
}

function convertirGrados({ valor, de }) {
  if (de === "k") return { valor: valor - CERO_ABSOLUTO, a: "c" };
  return de === "f" ? { valor: ((valor - 32) * 5) / 9, a: "c" } : { valor: (valor * 9) / 5 + 32, a: "f" };
}

function textoGrados(leido) {
  if (!leido) return "";
  const grados = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(Math.abs(n) < 0.05 ? 0 : n)} ${u === "k" ? "K" : `°${u.toUpperCase()}`}`;
  const otro = convertirGrados(leido);
  return `${grados(leido.valor, leido.de)} = ${grados(otro.valor, otro.a)}`;
}

// "cd gas 4", el horno de las recetas británicas. No es una cuenta: es la tabla
// de siempre, con los °C redondeados como vienen en los libros.
const HAY_GAS = /^\s*(?:gas(?:\s+mark)?|marca(?:\s+de)?\s+gas)\s*(¼|½|1\/4|1\/2|0[.,]25|0[.,]5|\d{1,2})\s*$/i;
const MARCAS_GAS = {
  "0.25": { c: 110, f: 225 }, "0.5": { c: 120, f: 250 }, 1: { c: 140, f: 275 }, 2: { c: 150, f: 300 },
  3: { c: 170, f: 325 }, 4: { c: 180, f: 350 }, 5: { c: 190, f: 375 }, 6: { c: 200, f: 400 },
  7: { c: 220, f: 425 }, 8: { c: 230, f: 450 }, 9: { c: 240, f: 475 }, 10: { c: 260, f: 500 },
};

function leerGas(texto) {
  const m = String(texto ?? "").match(HAY_GAS);
  if (!m) return null;
  const marca = { "¼": 0.25, "1/4": 0.25, "½": 0.5, "1/2": 0.5 }[m[1]] ?? Number(m[1].replace(",", "."));
  return MARCAS_GAS[marca] ? { marca } : null;
}

function convertirGas({ marca }) {
  return MARCAS_GAS[marca];
}

function textoGas(leido) {
  if (!leido) return "";
  const { c, f } = convertirGas(leido);
  const marca = { 0.25: "¼", 0.5: "½" }[leido.marca] ?? leido.marca;
  return `Gas ${marca} = ${c} °C (${f} °F)`;
}

// "cd 10mi" en la barra, para las señales de allí. "m" sola no vale, que en
// las cantidades son millones.
const HAY_DISTANCIA = /^\s*(\d+(?:[.,]\d+)?)\s*(mi|millas?|miles?|km|kil[oó]metros?|kilometers?)\s*$/i;
const KM_POR_MILLA = 1.609344;

function leerDistancia(texto) {
  const m = String(texto ?? "").match(HAY_DISTANCIA);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^k/i.test(m[2]) ? "km" : "mi" };
}

function convertirDistancia({ valor, de }) {
  return de === "mi" ? { valor: valor * KM_POR_MILLA, a: "km" } : { valor: valor / KM_POR_MILLA, a: "mi" };
}

function textoDistancia(leido) {
  if (!leido) return "";
  const distancia = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirDistancia(leido);
  return `${distancia(leido.valor, leido.de)} = ${distancia(otro.valor, otro.a)}`;
}

// "cd 9 min/mi" o "cd 8:30/mi", el ritmo de las carreras de allí, y al revés
// desde los min/km. En minutos y segundos, que es como se dice.
const HAY_RITMO = /^\s*(\d+:[0-5]\d|\d+(?:[.,]\d+)?)\s*(?:min(?:utos?)?)?\s*(?:\/|por|per)\s*(mi|millas?|miles?|km|kil[oó]metros?)\s*$/i;

function leerRitmo(texto) {
  const m = String(texto ?? "").match(HAY_RITMO);
  if (!m) return null;
  const [min, seg] = m[1].includes(":") ? m[1].split(":").map(Number) : [Number(m[1].replace(",", ".")), 0];
  const segundos = min * 60 + seg;
  return segundos > 0 ? { segundos, de: /^k/i.test(m[2]) ? "km" : "mi" } : null;
}

function convertirRitmo({ segundos, de }) {
  return de === "mi" ? { segundos: segundos / KM_POR_MILLA, a: "km" } : { segundos: segundos * KM_POR_MILLA, a: "mi" };
}

function textoRitmo(leido) {
  if (!leido) return "";
  const ritmo = (segundos, u) => {
    const s = Math.round(segundos);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} min/${u}`;
  };
  const otro = convertirRitmo(leido);
  return `${ritmo(leido.segundos, leido.de)} = ${ritmo(otro.segundos, otro.a)}`;
}

// "cd 5lb", para la maleta. "libras" y "pounds" no, que esas son esterlinas.
// El quintal depende de dónde: el métrico son 100 kg, pero en Centroamérica y en
// los Andes (el café, el grano) son 100 libras. Saco los dos.
// Con la arroba igual: 11,5 kg aquí y en casi toda Latinoamérica, 15 en Brasil.
const HAY_PESO = /^\s*(\d+(?:[.,]\d+)?)\s*(lbs?|kg|kilos?|kilogramos?|kilograms?|qq|quintal(?:es|s)?|@|arrobas?)\s*$/i;
const KG_POR_LIBRA = 0.45359237;
const KG_POR_ARROBA = 11.5;
const KG_POR_ARROBA_BRASIL = 15;

function leerPeso(texto) {
  const m = String(texto ?? "").match(HAY_PESO);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^k/i.test(m[2]) ? "kg" : /^q/i.test(m[2]) ? "qq" : /^(@|a)/i.test(m[2]) ? "@" : "lb" };
}

function convertirPeso({ valor, de }) {
  if (de === "qq") return { valor: valor * 100, a: "kg", otra: valor * 100, en: "lb" };
  if (de === "@") return { valor: valor * KG_POR_ARROBA, a: "kg", brasil: valor * KG_POR_ARROBA_BRASIL };
  return de === "lb" ? { valor: valor * KG_POR_LIBRA, a: "kg" } : { valor: valor / KG_POR_LIBRA, a: "lb" };
}

function textoPeso(leido) {
  if (!leido) return "";
  const peso = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirPeso(leido);
  const otra = otro.otra !== undefined ? ` · ${peso(otro.otra, otro.en)} (${peso(otro.otra * KG_POR_LIBRA, "kg")})` : otro.brasil !== undefined ? ` · 🇧🇷 ${peso(otro.brasil, "kg")}` : "";
  return `${peso(leido.valor, leido.de)} = ${peso(otro.valor, otro.a)}${otra}`;
}

// "cd 8oz", para la carne y el queso del súper. Las "fl oz" son volumen y no
// entran.
const HAY_ONZAS = /^\s*(\d+(?:[.,]\d+)?)\s*(oz|ounces?|onzas?|g|gr|gramos?|grams?)\s*$/i;
const G_POR_ONZA = 28.349523125;

function leerOnzas(texto) {
  const m = String(texto ?? "").match(HAY_ONZAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^g/i.test(m[2]) ? "g" : "oz" };
}

function convertirOnzas({ valor, de }) {
  return de === "oz" ? { valor: valor * G_POR_ONZA, a: "g" } : { valor: valor / G_POR_ONZA, a: "oz" };
}

function textoOnzas(leido) {
  if (!leido) return "";
  const peso = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirOnzas(leido);
  return `${peso(leido.valor, leido.de)} = ${peso(otro.valor, otro.a)}`;
}

// "cd 1 ozt", la onza troy del oro y la plata, que pesa más que la del súper.
const HAY_ONZAS_TROY = /^\s*(\d+(?:[.,]\d+)?)\s*(?:ozt|oz\.?\s*t|troy\s+oz|troy\s+ounces?|onzas?\s+troy)\s*$/i;
const G_POR_ONZA_TROY = 31.1034768;

function leerOnzasTroy(texto) {
  const m = String(texto ?? "").match(HAY_ONZAS_TROY);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "ozt" };
}

function convertirOnzasTroy({ valor }) {
  return { valor: valor * G_POR_ONZA_TROY, a: "g" };
}

function textoOnzasTroy(leido) {
  if (!leido) return "";
  const peso = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirOnzasTroy(leido);
  return `${peso(leido.valor, leido.de)} = ${peso(otro.valor, otro.a)}`;
}

// "cd 6ft", para alturas. Los metros, escritos enteros: "2m" son dos millones.
const HAY_ALTURA = /^\s*(\d+(?:[.,]\d+)?)\s*(ft|pies?|feet|foot|metros?|meters?|metres?)\s*$/i;
const M_POR_PIE = 0.3048;
// Allí la gente mide 5'10", pies y pulgadas juntos. Las comillas pueden venir
// dobladas ('') o curvas, que es como salen en el móvil.
const HAY_PIES_Y_PULGADAS = /^\s*(\d+)\s*(?:'|’|ft|feet|foot|pies?)\s*(\d+(?:[.,]\d+)?)\s*(?:"|”|''|’’|in|inch(?:es)?|pulgadas?)?\s*$/i;

function leerAltura(texto) {
  const juntos = String(texto ?? "").match(HAY_PIES_Y_PULGADAS);
  if (juntos) {
    const pies = Number(juntos[1]);
    const pulgadas = Number(juntos[2].replace(",", "."));
    // 5'14" no existe: serían 6'2".
    if (pulgadas >= 12) return null;
    return { valor: pies + pulgadas / 12, de: "ft", pies, pulgadas };
  }
  const m = String(texto ?? "").match(HAY_ALTURA);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^m/i.test(m[2]) ? "m" : "ft" };
}

function convertirAltura({ valor, de }) {
  return de === "ft" ? { valor: valor * M_POR_PIE, a: "m" } : { valor: valor / M_POR_PIE, a: "ft" };
}

// En metros con dos decimales, que una altura en 1,8 se queda corta.
function textoAltura(leido) {
  if (!leido) return "";
  const altura = (n, u) => `${numeros({ maximumFractionDigits: u === "m" ? 2 : 1 }).format(n)} ${u}`;
  const otro = convertirAltura(leido);
  const antes = leido.pulgadas === undefined ? altura(leido.valor, leido.de)
    : `${leido.pies} ft ${numeros({ maximumFractionDigits: 1 }).format(leido.pulgadas)} in`;
  return `${antes} = ${altura(otro.valor, otro.a)}`;
}

// "cd 65mph", para los límites de la carretera. Las millas sueltas ya son
// distancia, así que aquí solo entra lo que lleva "por hora". "mi/h" sale en
// algunos coches de alquiler en vez de "mph".
const HAY_VELOCIDAD = /^\s*(\d+(?:[.,]\d+)?)\s*(mph|mi\s*\/\s*h|millas? por hora|miles? per hour|km\/h|kmh|kph|km por hora|kil[oó]metros? por hora|kilometers? per hour)\s*$/i;

function leerVelocidad(texto) {
  const m = String(texto ?? "").match(HAY_VELOCIDAD);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^(mph|mi\b|mi\s*\/|mil)/i.test(m[2]) ? "mph" : "km/h" };
}

function convertirVelocidad({ valor, de }) {
  return de === "mph" ? { valor: valor * KM_POR_MILLA, a: "km/h" } : { valor: valor / KM_POR_MILLA, a: "mph" };
}

function textoVelocidad(leido) {
  if (!leido) return "";
  const velocidad = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirVelocidad(leido);
  return `${velocidad(leido.valor, leido.de)} = ${velocidad(otro.valor, otro.a)}`;
}

// "cd 10gal", para la gasolina. Con barra delante ("4,59/gal") sigue siendo un
// precio. Galón americano, que es el que te vas a encontrar; con "uk" detrás, el inglés.
// Con "us" detrás, el americano igual, que hay quien lo escribe para dejarlo claro.
const HAY_VOLUMEN = /^\s*(\d+(?:[.,]\d+)?)\s*(gal(?:lons?|ones|[oó]n)?|l|litros?|liters?|litres?)\s*(?:\(?\s*(?:(uk|imp(?:erial)?)|us)\s*\)?)?\s*$/i;
const L_POR_GALON = 3.78541178;
const L_POR_GALON_UK = 4.54609;

function leerVolumen(texto) {
  const m = String(texto ?? "").match(HAY_VOLUMEN);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^g/i.test(m[2]) ? "gal" : "l", ...(m[3] && { uk: true }) };
}

function convertirVolumen({ valor, de, uk }) {
  const litros = uk ? L_POR_GALON_UK : L_POR_GALON;
  return de === "gal" ? { valor: valor * litros, a: "l" } : { valor: valor / litros, a: "gal" };
}

function textoVolumen(leido) {
  if (!leido) return "";
  const volumen = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u === "gal" && leido.uk ? "gal UK" : u}`;
  const otro = convertirVolumen(leido);
  return `${volumen(leido.valor, leido.de)} = ${volumen(otro.valor, otro.a)}`;
}

// "cd 55in", para pantallas, tallas y la maleta de cabina. Las comillas también
// valen, que es como sale en las tiendas: 55". Y "cd 10mm", para tornillos y brocas.
const HAY_LONGITUD = /^\s*(\d+(?:[.,]\d+)?)\s*(in|inch(?:es)?|pulgadas?|"|cm|cent[ií]metros?|centimet(?:er|re)s?|mm|mil[ií]metros?|millimet(?:er|re)s?)\s*$/i;
const CM_POR_PULGADA = 2.54;

function leerLongitud(texto) {
  const m = String(texto ?? "").match(HAY_LONGITUD);
  if (!m) return null;
  const de = /^c/i.test(m[2]) ? "cm" : /^m/i.test(m[2]) ? "mm" : "in";
  return { valor: Number(m[1].replace(",", ".")), de };
}

function convertirLongitud({ valor, de }) {
  if (de === "mm") return { valor: valor / 10 / CM_POR_PULGADA, a: "in" };
  return de === "in" ? { valor: valor * CM_POR_PULGADA, a: "cm" } : { valor: valor / CM_POR_PULGADA, a: "in" };
}

// Desde los mm, las pulgadas con dos decimales: 3 mm con uno serían 0,1.
function textoLongitud(leido) {
  if (!leido) return "";
  const longitud = (n, u, d = 1) => `${numeros({ maximumFractionDigits: d }).format(n)} ${u}`;
  const otro = convertirLongitud(leido);
  return `${longitud(leido.valor, leido.de)} = ${longitud(otro.valor, otro.a, leido.de === "mm" ? 2 : 1)}`;
}

// "cd 800sqft", para los pisos de alquiler, que allí se anuncian así.
const HAY_SUPERFICIE = /^\s*(\d+(?:[.,]\d+)?)\s*(sq\.?\s*ft|ft²|ft2|square (?:feet|foot)|pies? cuadrados?|m²|m2|metros? cuadrados?|square met(?:er|re)s?)\s*$/i;
const M2_POR_PIE2 = 0.09290304;

function leerSuperficie(texto) {
  const m = String(texto ?? "").match(HAY_SUPERFICIE);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^(m|square met)/i.test(m[2]) ? "m²" : "sq ft" };
}

function convertirSuperficie({ valor, de }) {
  return de === "sq ft" ? { valor: valor * M2_POR_PIE2, a: "m²" } : { valor: valor / M2_POR_PIE2, a: "sq ft" };
}

// Los pies cuadrados, sin decimales: nadie anuncia un piso de 861,1.
function textoSuperficie(leido) {
  if (!leido) return "";
  const superficie = (n, u) => `${numeros({ maximumFractionDigits: u === "m²" ? 1 : 0 }).format(n)} ${u}`;
  const otro = convertirSuperficie(leido);
  return `${superficie(leido.valor, leido.de)} = ${superficie(otro.valor, otro.a)}`;
}

// "cd 5 sq mi", lo que mide un parque o una ciudad, y al revés desde los km².
const HAY_MILLAS_CUADRADAS = /^\s*(\d+(?:[.,]\d+)?)\s*(sq\.?\s*mi|mi²|mi2|square miles?|millas? cuadradas?|km²|km2|kil[oó]metros? cuadrados?|square kilomet(?:er|re)s?)\s*$/i;
const KM2_POR_MILLA2 = KM_POR_MILLA ** 2;

function leerMillasCuadradas(texto) {
  const m = String(texto ?? "").match(HAY_MILLAS_CUADRADAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^(k|square k)/i.test(m[2]) ? "km²" : "sq mi" };
}

function convertirMillasCuadradas({ valor, de }) {
  return de === "sq mi" ? { valor: valor * KM2_POR_MILLA2, a: "km²" } : { valor: valor / KM2_POR_MILLA2, a: "sq mi" };
}

function textoMillasCuadradas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirMillasCuadradas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 30mpg", para el coche de alquiler. Millas por galón americano, salvo con
// "uk" detrás: en Reino Unido el galón es el imperial y la cifra sale un 20 % más alta.
// Y "cd 15 km/l", que es como lo dan en Japón y en Latinoamérica.
const HAY_CONSUMO = /^\s*(\d+(?:[.,]\d+)?)\s*(mpg|miles? per gallon|millas? por gal[oó]n|l\/100\s*km|l\/100|km\/l|kmpl|km por litro|kil[oó]metros? por litro|kilomet(?:er|re)s? per lit(?:er|re))\s*(\(?\s*(?:uk|imp(?:erial)?)\s*\)?)?\s*$/i;

function leerConsumo(texto) {
  const m = String(texto ?? "").match(HAY_CONSUMO);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  // Va al revés (cuanto más mpg, menos litros), así que el cero no tiene vuelta.
  if (!valor) return null;
  if (/^k/i.test(m[2])) return m[3] ? null : { valor, de: "km/l" };
  return { valor, de: /^l/i.test(m[2]) ? "l/100 km" : "mpg", ...(m[3] && { uk: true }) };
}

// La misma cuenta sirve para ir y para volver.
function convertirConsumo({ valor, de, uk }) {
  if (de === "km/l") return { valor: 100 / valor, a: "l/100 km" };
  const litros = uk ? L_POR_GALON_UK : L_POR_GALON;
  return { valor: (100 * litros) / (valor * KM_POR_MILLA), a: de === "mpg" ? "l/100 km" : "mpg" };
}

function textoConsumo(leido) {
  if (!leido) return "";
  const consumo = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u === "mpg" && leido.uk ? "mpg UK" : u}`;
  const otro = convertirConsumo(leido);
  return `${consumo(leido.valor, leido.de)} = ${consumo(otro.valor, otro.a)}`;
}

// "cd 3,5 mi/kWh", para el eléctrico de alquiler en Estados Unidos. Como con los
// mpg, va al revés y la misma cuenta sirve para volver. Los Tesla de allí lo
// dan en Wh/mi, que va derecho a kWh/100 km.
const HAY_ELECTRICO = /^\s*(\d+(?:[.,]\d+)?)\s*(mi\/kwh|miles? per kwh|millas? por kwh|kwh\/100\s*km|wh\/mi(?:le)?|wh per mile)\s*$/i;

function leerElectrico(texto) {
  const m = String(texto ?? "").match(HAY_ELECTRICO);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  if (!valor) return null;
  return { valor, de: /^k/i.test(m[2]) ? "kWh/100 km" : /^w/i.test(m[2]) ? "Wh/mi" : "mi/kWh" };
}

function convertirElectrico({ valor, de }) {
  if (de === "Wh/mi") return { valor: valor / KM_POR_MILLA / 10, a: "kWh/100 km" };
  return { valor: 100 / (valor * KM_POR_MILLA), a: de === "mi/kWh" ? "kWh/100 km" : "mi/kWh" };
}

function textoElectrico(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirElectrico(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 35psi", para inflar las ruedas en la gasolinera. Algunos coches lo ponen
// en kPa ("250 kPa"), y eso va a psi, que es lo que marca el inflador de allí.
// En Asia y en Latinoamérica muchas gasolineras lo marcan en kg/cm², que también va a psi.
// Las atm salen en las ollas exprés y en el buceo; también van a psi.
// Los MPa, en las fichas de bombonas y de hidráulica.
const HAY_PRESION = /^\s*(\d+(?:[.,]\d+)?)\s*(psi|bar|bares|kpa|mpa|megapascal(?:es|s)?|kgf?\s*\/\s*cm[²2]|atm|atm[oó]sferas?|atmospheres?)\s*$/i;
const BAR_POR_PSI = 0.0689475729;
const BAR_POR_KG_CM2 = 0.980665;
const BAR_POR_ATM = 1.01325;

function leerPresion(texto) {
  const m = String(texto ?? "").match(HAY_PRESION);
  if (!m) return null;
  const de = /^b/i.test(m[2]) ? "bar" : /^a/i.test(m[2]) ? "atm" : /^m/i.test(m[2]) ? "MPa" : /^kg/i.test(m[2]) ? "kg/cm²" : /^k/i.test(m[2]) ? "kPa" : "psi";
  return { valor: Number(m[1].replace(",", ".")), de };
}

function convertirPresion({ valor, de }) {
  if (de === "kPa") return { valor: valor / 100 / BAR_POR_PSI, a: "psi" };
  if (de === "kg/cm²") return { valor: (valor * BAR_POR_KG_CM2) / BAR_POR_PSI, a: "psi" };
  if (de === "MPa") return { valor: (valor * 10) / BAR_POR_PSI, a: "psi" };
  if (de === "atm") return { valor: (valor * BAR_POR_ATM) / BAR_POR_PSI, a: "psi" };
  return de === "psi" ? { valor: valor * BAR_POR_PSI, a: "bar" } : { valor: valor / BAR_POR_PSI, a: "psi" };
}

// Los psi y los kPa, enteros: es lo que marca el inflador.
function textoPresion(leido) {
  if (!leido) return "";
  const presion = (n, u) => `${numeros({ maximumFractionDigits: u === "MPa" ? 2 : u === "bar" || u === "kg/cm²" || u === "atm" ? 1 : 0 }).format(n)} ${u}`;
  const otro = convertirPresion(leido);
  return `${presion(leido.valor, leido.de)} = ${presion(otro.valor, otro.a)}`;
}

// "cd 2 cups", para las recetas americanas. La taza de allí, no la métrica de 250.
// Los dl, que salen en las recetas de aquí y en las nórdicas, van a tazas.
const HAY_TAZAS = /^\s*(\d+(?:[.,]\d+)?)\s*(cups?|tazas?|ml|mililitros?|millilit(?:er|re)s?|dl|decilitros?|decilit(?:er|re)s?)\s*$/i;
const ML_POR_TAZA = 236.5882365;

function leerTazas(texto) {
  const m = String(texto ?? "").match(HAY_TAZAS);
  if (!m) return null;
  const de = /^m/i.test(m[2]) ? "ml" : /^d/i.test(m[2]) ? "dl" : "cups";
  return { valor: Number(m[1].replace(",", ".")), de };
}

function convertirTazas({ valor, de }) {
  if (de === "dl") return { valor: (valor * 100) / ML_POR_TAZA, a: "cups" };
  return de === "cups" ? { valor: valor * ML_POR_TAZA, a: "ml" } : { valor: valor / ML_POR_TAZA, a: "cups" };
}

// Los ml, enteros, y las tazas con dos decimales, que media taza de más ya se nota.
function textoTazas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: u === "ml" ? 0 : 2 }).format(n)} ${u === "cups" && n === 1 ? "cup" : u}`;
  const otro = convertirTazas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 1 cup harina": en las recetas de allí todo va en tazas, y aquí pesamos.
// Gramos por taza americana, de las tablas de repostería. El azúcar moreno,
// apretado, que es como lo piden.
const TAZA_DE = [
  { re: /^(harina|flour)$/, es: "harina", en: "flour", g: 125 },
  { re: /^(az[uú]car (moreno|morena)|brown sugar)$/, es: "azúcar moreno", en: "brown sugar", g: 220 },
  { re: /^(az[uú]car (glas|glass|gla[cs][eé])|powdered sugar|icing sugar)$/, es: "azúcar glas", en: "powdered sugar", g: 120 },
  { re: /^(az[uú]car|sugar)$/, es: "azúcar", en: "sugar", g: 200 },
  { re: /^(mantequilla|butter)$/, es: "mantequilla", en: "butter", g: 227 },
  { re: /^(arroz|rice)$/, es: "arroz", en: "rice", g: 185 },
  { re: /^(avena|copos de avena|oats)$/, es: "avena", en: "oats", g: 90 },
  { re: /^(cacao|cocoa)$/, es: "cacao", en: "cocoa", g: 85 },
  { re: /^(miel|honey)$/, es: "miel", en: "honey", g: 340 },
  { re: /^(aceite|oil)$/, es: "aceite", en: "oil", g: 218 },
  { re: /^(leche|milk)$/, es: "leche", en: "milk", g: 245 },
];
// Las recetas van con fracciones: "1/2 cup", "¾ cup".
const HAY_TAZA_DE = /^\s*(\d+(?:[.,]\d+)?|\d+\/\d+|[½⅓⅔¼¾])\s*(?:cups?|tazas?)\s+(?:de\s+|of\s+)?(.+?)\s*$/i;
const FRACCIONES = { "½": 1 / 2, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 1 / 4, "¾": 3 / 4 };

function leerTazaDe(texto) {
  const m = String(texto ?? "").match(HAY_TAZA_DE);
  if (!m) return null;
  const [arriba, abajo] = m[1].split("/").map(Number);
  const valor = FRACCIONES[m[1]] ?? (abajo === undefined ? Number(m[1].replace(",", ".")) : arriba / abajo);
  if (!(valor > 0) || !Number.isFinite(valor)) return null;
  const nombre = m[2].toLowerCase().replace(/\s+/g, " ");
  const ingrediente = TAZA_DE.find((i) => i.re.test(nombre));
  return ingrediente ? { valor, dicho: m[1], ingrediente } : null;
}

function textoTazaDe(leido) {
  if (!leido) return "";
  const { valor, dicho, ingrediente } = leido;
  const n = (x, d) => numeros({ maximumFractionDigits: d }).format(x);
  const en = idiomaActual() === "en";
  // La fracción, como la escribiste: "1/3 taza" se lee mejor que "0,33 tazas".
  const cifra = /[/½⅓⅔¼¾]/.test(dicho ?? "") ? dicho : n(valor, 2);
  const taza = `${cifra} ${en ? (valor > 1 ? "cups" : "cup") : (valor > 1 ? "tazas" : "taza")}`;
  return `${taza} ${en ? "of" : "de"} ${ingrediente[en ? "en" : "es"]} = ${n(valor * ingrediente.g, 0)} g`;
}

// "cd 2 tbsp", las cucharas de las mismas recetas. Solo hacia los ml: al revés
// ya están las tazas, y nadie pide 250 ml en cucharadas.
const HAY_CUCHARADAS = /^\s*(\d+(?:[.,]\d+)?)\s*(tbsp|tbs|tablespoons?|cucharadas?|tsp|teaspoons?|cucharaditas?)\s*$/i;
const ML_POR_CUCHARADA = 14.78676478125;

function leerCucharadas(texto) {
  const m = String(texto ?? "").match(HAY_CUCHARADAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^(tb|table|cucharadas?$)/i.test(m[2]) ? "tbsp" : "tsp" };
}

// La cucharadita es un tercio de la cucharada.
function convertirCucharadas({ valor, de }) {
  return { valor: valor * (de === "tbsp" ? ML_POR_CUCHARADA : ML_POR_CUCHARADA / 3), a: "ml" };
}

function textoCucharadas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirCucharadas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 1 stick", la barra de mantequilla de las recetas americanas: un cuarto
// de libra. Con medias, que "½ stick" sale mucho.
const HAY_STICKS = /^\s*(½|1\/2|\d+(?:[.,]\d+)?)\s*(?:sticks?|barras?)(?:\s+(?:of|de)\s+(?:butter|mantequilla))?\s*$/i;
const G_POR_STICK = KG_POR_LIBRA * 1000 / 4;

function leerSticks(texto) {
  const m = String(texto ?? "").match(HAY_STICKS);
  if (!m) return null;
  const valor = m[1] === "½" || m[1] === "1/2" ? 0.5 : Number(m[1].replace(",", "."));
  return valor > 0 ? { valor } : null;
}

function convertirSticks({ valor }) {
  return { valor: valor * G_POR_STICK, a: "g" };
}

function textoSticks(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  const cuantos = leido.valor === 0.5 ? "½" : n.format(leido.valor);
  return `${cuantos} ${leido.valor > 1 ? "sticks" : "stick"} = ${numeros({ maximumFractionDigits: 0 }).format(convertirSticks(leido).valor)} g`;
}

// "cd 12 fl oz", lo que pone en las latas y las botellas de allí. Solo hacia
// los ml, que los 250 ml ya los pasan las tazas. Los cl sí van al revés: es lo
// que pone en las botellas de vino de aquí ("75 cl"). Con "uk" detrás, la
// inglesa, que es un poco más pequeña y sale en las recetas de allí.
const HAY_ONZAS_LIQUIDAS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:(fl\.?\s*oz|fluid\s+ounces?|onzas?\s+l[ií]quidas?)\s*(?:\(?\s*(?:(uk|imp(?:erial)?)|us)\s*\)?)?|(cl|centilitros?|centilit(?:er|re)s?))\s*$/i;
const ML_POR_ONZA_LIQUIDA = 29.5735295625;
const ML_POR_ONZA_LIQUIDA_UK = 28.4130625;

function leerOnzasLiquidas(texto) {
  const m = String(texto ?? "").match(HAY_ONZAS_LIQUIDAS);
  if (!m) return null;
  if (m[3]) return { valor: Number(m[1].replace(",", ".")), de: "fl oz", uk: true };
  return { valor: Number(m[1].replace(",", ".")), de: m[2] ? "fl oz" : "cl" };
}

function convertirOnzasLiquidas({ valor, de, uk }) {
  if (uk) return { valor: valor * ML_POR_ONZA_LIQUIDA_UK, a: "ml" };
  return de === "cl" ? { valor: (valor * 10) / ML_POR_ONZA_LIQUIDA, a: "fl oz" } : { valor: valor * ML_POR_ONZA_LIQUIDA, a: "ml" };
}

function textoOnzasLiquidas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u === "fl oz" && leido.uk ? "fl oz UK" : u}`;
  const otro = convertirOnzasLiquidas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 1 pint", la del pub. Va la británica (568 ml) y no la americana (473):
// en Estados Unidos casi nadie la pide en pintas. Con "us" detrás, la de allí,
// que sale en las recetas y en los helados.
// Con "uk" detrás, la británica igual, como en los galones.
const HAY_PINTAS = /^\s*(\d+(?:[.,]\d+)?)\s*(pints?|pintas?|pt)\s*(?:\(?\s*(?:(us)|uk|imp(?:erial)?)\s*\)?)?\s*$/i;
const ML_POR_PINTA = 568.26125;
const ML_POR_PINTA_US = 473.176473;

function leerPintas(texto) {
  const m = String(texto ?? "").match(HAY_PINTAS);
  if (!m) return null;
  return m[3] ? { valor: Number(m[1].replace(",", ".")), de: "pt", us: true } : { valor: Number(m[1].replace(",", ".")), de: "pt" };
}

function convertirPintas({ valor, us }) {
  return { valor: valor * (us ? ML_POR_PINTA_US : ML_POR_PINTA), a: "ml" };
}

// En ml enteros, que es como viene en la carta.
function textoPintas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: u === "ml" ? 0 : 1 }).format(n)} ${u === "pt" && leido.us ? "pt US" : u}`;
  const otro = convertirPintas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 1 gill", el de las recetas de cócteles antiguas. Es un cuarto de pinta,
// y como la pinta no es igual a cada lado del charco, saco los dos.
const HAY_GILLS = /^\s*(\d+(?:[.,]\d+)?)\s*gills?\s*$/i;

function leerGills(texto) {
  const m = String(texto ?? "").match(HAY_GILLS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "gill" };
}

function convertirGills({ valor }) {
  return { valor: valor * ML_POR_PINTA_US / 4, a: "ml", inglesa: valor * ML_POR_PINTA / 4 };
}

function textoGills(leido) {
  if (!leido) return "";
  const otro = convertirGills(leido);
  const n = numeros({ maximumFractionDigits: 0 });
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${leido.valor === 1 ? "gill" : "gills"} = 🇺🇸 ${n.format(otro.valor)} ml · 🇬🇧 ${n.format(otro.inglesa)} ml`;
}

// "cd 2 qt", la leche y los helados del súper americano. Un cuarto de galón.
// Con "uk" detrás, el inglés, que es un cuarto del galón de allí.
const HAY_CUARTOS = /^\s*(\d+(?:[.,]\d+)?)\s*(qt|quarts?|cuartos?\s+de\s+gal[oó]n)\s*(?:\(?\s*(?:(uk|imp(?:erial)?)|us)\s*\)?)?\s*$/i;
const L_POR_CUARTO = 0.946352946;
const L_POR_CUARTO_UK = 1.1365225;

function leerCuartos(texto) {
  const m = String(texto ?? "").match(HAY_CUARTOS);
  if (!m) return null;
  return m[3] ? { valor: Number(m[1].replace(",", ".")), de: "qt", uk: true } : { valor: Number(m[1].replace(",", ".")), de: "qt" };
}

function convertirCuartos({ valor, uk }) {
  return { valor: valor * (uk ? L_POR_CUARTO_UK : L_POR_CUARTO), a: "l" };
}

// En litros con dos decimales: "946 ml" se entiende, pero "1.893 ml" ya no.
function textoCuartos(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: u === "l" ? 2 : 1 }).format(n)} ${u === "qt" && leido.uk ? "qt UK" : u}`;
  const otro = convertirCuartos(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 20 kn", para el barco de la excursión o el viento del parte. Un nudo es
// una milla náutica por hora, que no es la de la carretera.
const HAY_NUDOS = /^\s*(\d+(?:[.,]\d+)?)\s*(kn|kts?|knots?|nudos?)\s*$/i;
const KM_POR_NUDO = 1.852;

function leerNudos(texto) {
  const m = String(texto ?? "").match(HAY_NUDOS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "kn" };
}

function convertirNudos({ valor }) {
  return { valor: valor * KM_POR_NUDO, a: "km/h" };
}

function textoNudos(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirNudos(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 10 m/s", que es como dan el viento muchos partes del tiempo.
// Y "cd 100 ft/s", que sale en los vídeos de allí, a m/s. "fps" no: son fotogramas.
const HAY_METROS_POR_SEGUNDO = /^\s*(\d+(?:[.,]\d+)?)\s*(m\/s|mps|metros? por segundo|met(?:er|re)s? per second|(ft\/s|feet per second|pies por segundo))\s*$/i;

function leerMetrosPorSegundo(texto) {
  const m = String(texto ?? "").match(HAY_METROS_POR_SEGUNDO);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: m[3] ? "ft/s" : "m/s" };
}

function convertirMetrosPorSegundo({ valor, de }) {
  if (de === "ft/s") return { valor: valor * 0.3048, a: "m/s" };
  return { valor: valor * 3.6, a: "km/h" };
}

function textoMetrosPorSegundo(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirMetrosPorSegundo(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 3 nmi", la del barco: las distancias que van con los nudos. "nm" también,
// que es como sale en las cartas, y nadie va a buscar aquí nanómetros.
const HAY_MILLAS_NAUTICAS = /^\s*(\d+(?:[.,]\d+)?)\s*(nmi|nm|millas? n[aá]uticas?|nautical miles?)\s*$/i;

function leerMillasNauticas(texto) {
  const m = String(texto ?? "").match(HAY_MILLAS_NAUTICAS);
  if (!m || m[2] === "Nm") return null;
  return { valor: Number(m[1].replace(",", ".")), de: "nmi" };
}

// La misma cuenta que los nudos: un nudo es una de estas por hora.
function convertirMillasNauticas({ valor }) {
  return { valor: valor * KM_POR_NUDO, a: "km" };
}

function textoMillasNauticas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirMillasNauticas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 10 fathoms", la profundidad de las cartas náuticas de allí y del buceo.
// Son seis pies justos.
const HAY_BRAZAS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:fathoms?|ftm|brazas?)\s*$/i;
const M_POR_BRAZA = 1.8288;

function leerBrazas(texto) {
  const m = String(texto ?? "").match(HAY_BRAZAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "fathom" };
}

function convertirBrazas({ valor }) {
  return { valor: valor * M_POR_BRAZA, a: "m" };
}

function textoBrazas(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  return `${n.format(leido.valor)} ${leido.valor === 1 ? "fathom" : "fathoms"} = ${n.format(convertirBrazas(leido).valor)} m`;
}

// "cd 3 leguas", la de los libros y los caminos de antes. La castellana y la
// inglesa no se parecen (5,6 y 4,8 km), así que saco las dos.
const HAY_LEGUAS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:leguas?|leagues?)\s*$/i;
const KM_POR_LEGUA = 5.5727;
const KM_POR_LEGUA_INGLESA = 3 * KM_POR_MILLA;

function leerLeguas(texto) {
  const m = String(texto ?? "").match(HAY_LEGUAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "legua" };
}

function convertirLeguas({ valor }) {
  return { valor: valor * KM_POR_LEGUA, a: "km", inglesa: valor * KM_POR_LEGUA_INGLESA };
}

function textoLeguas(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  const palabra = (idiomaActual() === "en" ? "league" : "legua") + (leido.valor === 1 ? "" : "s");
  const otro = convertirLeguas(leido);
  return `${n.format(leido.valor)} ${palabra} = 🇪🇸 ${n.format(otro.valor)} km · 🇬🇧 ${n.format(otro.inglesa)} km`;
}

// "cd 15.2 hh", la alzada de los caballos. Ojo, que no es un decimal: es 15 manos
// y 2 pulgadas, así que detrás del punto solo puede ir de 0 a 3.
const HAY_MANOS = /^\s*(\d+)(?:[.,]([0-3]))?\s*(?:hh|hands?|manos?)\s*$/i;
const CM_POR_MANO = 10.16;

function leerManos(texto) {
  const m = String(texto ?? "").match(HAY_MANOS);
  if (!m) return null;
  const manos = Number(m[1]);
  const pulgadas = Number(m[2] ?? 0);
  if (!manos && !pulgadas) return null;
  return { manos, pulgadas, de: "hh" };
}

function convertirManos({ manos, pulgadas }) {
  return { valor: manos * CM_POR_MANO + pulgadas * CM_POR_MANO / 4, a: "cm" };
}

// El punto se queda como punto también en español, que así lo escriben en todas partes.
function textoManos(leido) {
  if (!leido) return "";
  const otro = convertirManos(leido);
  return `${leido.manos}.${leido.pulgadas} hh = ${numeros({ maximumFractionDigits: 0 }).format(otro.valor)} ${otro.a}`;
}

// "cd 6 furlongs", las carreras de caballos inglesas. La "f" de las cartas de
// apuestas no la cojo, que "6 f" ya son grados Fahrenheit.
const HAY_FURLONGS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:furlongs?|fur)\s*$/i;
const M_POR_FURLONG = 201.168;

function leerFurlongs(texto) {
  const m = String(texto ?? "").match(HAY_FURLONGS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "furlong" };
}

function convertirFurlongs({ valor }) {
  return { valor: valor * M_POR_FURLONG, a: "m" };
}

function textoFurlongs(leido) {
  if (!leido) return "";
  const otro = convertirFurlongs(leido);
  return `${numeros({ maximumFractionDigits: 1 }).format(leido.valor)} ${leido.valor === 1 ? "furlong" : "furlongs"} = ${numeros({ maximumFractionDigits: 0 }).format(otro.valor)} ${otro.a}`;
}

// "cd 1 chain", lo que mide el campo de críquet y las lindes de las fincas
// inglesas. "ch" no lo cojo, que se parece demasiado a los francos suizos.
const HAY_CHAINS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:chains?|cadenas?)\s*$/i;
const M_POR_CHAIN = 20.1168;

function leerChains(texto) {
  const m = String(texto ?? "").match(HAY_CHAINS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "chain" };
}

function convertirChains({ valor }) {
  return { valor: valor * M_POR_CHAIN, a: "m" };
}

function textoChains(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  return `${n.format(leido.valor)} ${leido.valor === 1 ? "chain" : "chains"} = ${n.format(convertirChains(leido).valor)} m`;
}

// "cd 10 rods", las lindes de las fincas y los porteos de las canoas. También
// se llaman perches o poles, según quién lo cuente.
const HAY_RODS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:rods?|perch(?:es)?|poles?)\s*$/i;
const M_POR_ROD = 5.0292;

function leerRods(texto) {
  const m = String(texto ?? "").match(HAY_RODS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "rod" };
}

function convertirRods({ valor }) {
  return { valor: valor * M_POR_ROD, a: "m" };
}

function textoRods(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  return `${n.format(leido.valor)} ${leido.valor === 1 ? "rod" : "rods"} = ${n.format(convertirRods(leido).valor)} m`;
}

// "cd 2 jin", lo que pesan en los mercados de China. En China el jin es medio
// kilo justo, pero en Hong Kong sigue siendo el catty de antes, de 1⅓ libras.
const HAY_JIN = /^\s*(\d+(?:[.,]\d+)?)\s*(?:jin|j[iī]n|catt(?:y|ies)|斤)\s*$/i;
const KG_POR_JIN = 0.5;
const KG_POR_CATTY = 0.60478982;

function leerJin(texto) {
  const m = String(texto ?? "").match(HAY_JIN);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "jin" };
}

function convertirJin({ valor }) {
  return { valor: valor * KG_POR_JIN, a: "kg", hongKong: valor * KG_POR_CATTY };
}

function textoJin(leido) {
  if (!leido) return "";
  const otro = convertirJin(leido);
  const n = numeros({ maximumFractionDigits: 2 });
  return `${n.format(leido.valor)} jin = 🇨🇳 ${n.format(otro.valor)} kg · 🇭🇰 ${n.format(otro.hongKong)} kg`;
}

// "cd 2 picul", cien catties, lo que se carga al hombro con la vara. Sale en
// el arroz y el té; "dan" no lo cojo, que es lo del cinturón de judo.
const HAY_PICUL = /^\s*(\d+(?:[.,]\d+)?)\s*(?:piculs?|pikuls?|担|擔)\s*$/i;

function leerPicul(texto) {
  const m = String(texto ?? "").match(HAY_PICUL);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "picul" };
}

function convertirPicul({ valor }) {
  return { valor: valor * KG_POR_JIN * 100, a: "kg", hongKong: valor * KG_POR_CATTY * 100 };
}

function textoPicul(leido) {
  if (!leido) return "";
  const otro = convertirPicul(leido);
  const n = numeros({ maximumFractionDigits: 1 });
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} picul = 🇨🇳 ${n.format(otro.valor)} kg · 🇭🇰 ${n.format(otro.hongKong)} kg`;
}

// "cd 6 shaku", la carpintería japonesa. El 尺 chino es otro: allí lo
// redondearon a un tercio de metro, así que saco los dos.
const HAY_SHAKU = /^\s*(\d+(?:[.,]\d+)?)\s*(?:shaku|尺)\s*$/i;
const M_POR_SHAKU = 10 / 33;

function leerShaku(texto) {
  const m = String(texto ?? "").match(HAY_SHAKU);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "shaku" };
}

function convertirShaku({ valor }) {
  return { valor: valor * M_POR_SHAKU * 100, a: "cm", china: valor * 100 / 3 };
}

function textoShaku(leido) {
  if (!leido) return "";
  const otro = convertirShaku(leido);
  const largo = (cm) => (cm >= 100 ? `${numeros({ maximumFractionDigits: 2 }).format(cm / 100)} m` : `${numeros({ maximumFractionDigits: 1 }).format(cm)} cm`);
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} shaku = 🇯🇵 ${largo(otro.valor)} · 🇨🇳 ${largo(otro.china)}`;
}

// "cd talla 42", el zapato europeo en la de Estados Unidos y la inglesa. Sale
// de la horma: el punto francés son 2/3 de cm y el inglés, 1/3 de pulgada
// empezando en 25. La de mujer americana va 1,5 por encima de la de hombre.
const HAY_TALLA = /^\s*(?:talla|size)\s*(?:eu\s*)?(\d+(?:[.,]5)?)\s*(?:eu)?\s*$/i;
// Fuera de esto son tallas de niño, que en Reino Unido van por otra escala.
const TALLA_MIN = 35;
const TALLA_MAX = 50;

function leerTalla(texto) {
  const m = String(texto ?? "").match(HAY_TALLA);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  if (valor < TALLA_MIN || valor > TALLA_MAX) return null;
  return { valor, de: "eu" };
}

function convertirTalla({ valor }) {
  const media = (x) => Math.round(x * 2) / 2;
  const uk = valor * 2 / 2.54 - 25;
  return { uk: media(uk), hombre: media(uk + 1), mujer: media(uk + 2.5) };
}

function textoTalla(leido) {
  if (!leido) return "";
  const otro = convertirTalla(leido);
  const n = numeros({ maximumFractionDigits: 1 });
  const en = idiomaActual() === "en";
  return `${en ? "Size" : "Talla"} ${n.format(leido.valor)} = 🇺🇸 ${n.format(otro.hombre)} ${en ? "men" : "hombre"} · ${n.format(otro.mujer)} ${en ? "women" : "mujer"} · 🇬🇧 ${n.format(otro.uk)}`;
}

// "cd anillo 7": la talla americana en la de aquí. Las de allí van del 3 al 13 y
// las de aquí empiezan donde acaban, así que sin decir nada, hasta 13,5 es US.
// La española es el contorno en mm menos 40; la inglesa, una letra cada 1,25 mm.
const HAY_ANILLO = /^\s*(?:anillo|ring)\s+(?:talla\s+|size\s+)?(\d+(?:[.,]\d+)?)\s*(us|es|eu)?\s*$/i;
const ANILLO_US_MAX = 13.5;

function leerAnillo(texto) {
  const m = String(texto ?? "").match(HAY_ANILLO);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  const de = m[2] ? (m[2].toLowerCase() === "us" ? "us" : "es") : (valor <= ANILLO_US_MAX ? "us" : "es");
  if (de === "us" ? valor < 1 || valor > 16 : valor < 1 || valor > 35) return null;
  return { valor, de };
}

function convertirAnillo({ valor, de }) {
  const diametro = de === "us" ? 11.63 + 0.8128 * valor : (valor + 40) / Math.PI;
  const contorno = diametro * Math.PI;
  const letra = Math.round(((contorno - 37.8) / 1.25) * 2) / 2;
  const uk = letra < 0 || letra > 25 ? null : "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(letra)] + (letra % 1 ? "½" : "");
  return {
    us: Math.round(((diametro - 11.63) / 0.8128) * 2) / 2,
    es: Math.round(contorno - 40),
    uk,
    mm: diametro,
  };
}

function textoAnillo(leido) {
  if (!leido) return "";
  const otro = convertirAnillo(leido);
  const n = numeros({ maximumFractionDigits: 1 });
  const en = idiomaActual() === "en";
  const partes = leido.de === "us" ? [`🇪🇸 ${otro.es}`] : [`🇺🇸 ${n.format(otro.us)}`];
  if (otro.uk) partes.push(`🇬🇧 ${otro.uk}`);
  partes.push(`⌀ ${n.format(otro.mm)} mm`);
  return `${en ? "Ring" : "Anillo"} ${leido.de === "us" ? "🇺🇸" : "🇪🇸"} ${n.format(leido.valor)} = ${partes.join(" · ")}`;
}

// "cd camisa 40": la del cuello, que aquí va en cm y allí en pulgadas. En tabla
// porque las tiendas redondean a su manera: el 40 es 15¾ y no 15,7.
const CAMISAS = [
  [37, 14.5, "S"], [38, 15, "S"], [39, 15.5, "M"], [40, 15.75, "M"], [41, 16, "L"],
  [42, 16.5, "L"], [43, 17, "XL"], [44, 17.5, "XL"], [45, 18, "XXL"], [46, 18.5, "XXL"],
];
const HAY_CAMISA = /^\s*(?:camisas?|shirts?)\s+(\d+(?:[.,]\d+)?(?:\s*[½¾])?|x{0,2}[sml]|xxl|xl)\s*$/i;

function leerCamisa(texto) {
  const m = String(texto ?? "").match(HAY_CAMISA);
  if (!m) return null;
  const dicho = m[1].replace(/\s+/g, "").toUpperCase();
  if (/^[XSML]+$/.test(dicho)) {
    const filas = CAMISAS.filter((f) => f[2] === dicho);
    return filas.length ? { letra: dicho, filas } : null;
  }
  const [, entero, fraccion] = dicho.match(/^(\d+(?:[.,]\d+)?)([½¾])?$/);
  const valor = Number(entero.replace(",", ".")) + ({ "½": 0.5, "¾": 0.75 }[fraccion] ?? 0);
  const fila = CAMISAS.find((f) => f[0] === valor || f[1] === valor);
  return fila ? { de: fila[0] === valor ? "eu" : "us", filas: [fila] } : null;
}

const pulgadasCamisa = (n) => `${Math.floor(n)}${{ 0.5: "½", 0.75: "¾" }[n % 1] ?? ""}`;

function textoCamisa(leido) {
  if (!leido) return "";
  const en = idiomaActual() === "en";
  const nombre = en ? "Shirt" : "Camisa";
  const { filas } = leido;
  if (leido.letra) {
    const eu = [...new Set(filas.map((f) => f[0]))].join("-");
    const us = filas.map((f) => pulgadasCamisa(f[1])).join("-");
    return `${nombre} ${leido.letra} = 🇪🇺 ${eu} · 🇺🇸🇬🇧 ${us}`;
  }
  const [eu, us, letra] = filas[0];
  return leido.de === "eu"
    ? `${nombre} 🇪🇺 ${eu} = 🇺🇸🇬🇧 ${pulgadasCamisa(us)} · ${letra}`
    : `${nombre} 🇺🇸🇬🇧 ${pulgadasCamisa(us)} = 🇪🇺 ${eu} · ${letra}`;
}

// "cd ropa 38": la talla de mujer entre Europa, Reino Unido y EE. UU., que es
// donde más cambia. El 38 europeo es un 10 inglés y un 6 americano.
// [eu, uk, us, letra]
const ROPA = [
  [32, 4, 0, "XXS"], [34, 6, 2, "XS"], [36, 8, 4, "S"], [38, 10, 6, "M"],
  [40, 12, 8, "L"], [42, 14, 10, "XL"], [44, 16, 12, "XXL"], [46, 18, 14, "3XL"],
];
// "cd traje 50": las chaquetas de hombre, que fuera van por el pecho en pulgadas.
// [eu, pecho, letra]
const TRAJES = [
  [44, 34, "XS"], [46, 36, "S"], [48, 38, "M"], [50, 40, "L"], [52, 42, "XL"], [54, 44, "XXL"], [56, 46, "3XL"],
];

const HAY_ROPA = /^\s*(ropa|vestidos?|dress(?:es)?|clothes|trajes?|chaquetas?|americanas?|suits?|jackets?)\s+(?:(eu|uk|us)\s*)?(\d{1,2}|xxs|xs|s|m|l|xl|xxl|3xl|xxxl)\s*$/i;
const ES_TRAJE = /^(?:trajes?|chaquetas?|americanas?|suits?|jackets?)$/i;

function leerRopa(texto) {
  const m = String(texto ?? "").match(HAY_ROPA);
  if (!m) return null;
  const traje = ES_TRAJE.test(m[1]);
  const de = m[2]?.toLowerCase() ?? null;
  const dicho = m[3].toUpperCase().replace("XXXL", "3XL");
  if (!/^\d+$/.test(dicho)) {
    if (de) return null;
    const fila = (traje ? TRAJES : ROPA).find((f) => f[f.length - 1] === dicho);
    return fila ? { traje, letra: dicho, fila } : null;
  }
  const n = Number(dicho);
  if (traje) {
    // Los dos se solapan en el 44 y el 46; sin decir nada, lo grande es europeo.
    if (de === "eu" || (!de && n >= 44)) {
      const fila = TRAJES.find((f) => f[0] === n);
      return fila ? { traje, de: "eu", fila } : null;
    }
    const fila = TRAJES.find((f) => f[1] === n);
    return fila ? { traje, de: "us", fila } : null;
  }
  const col = { eu: 0, uk: 1, us: 2 }[de ?? "eu"];
  const fila = ROPA.find((f) => f[col] === n);
  return fila ? { traje, de: de ?? "eu", fila } : null;
}

function textoRopa(leido) {
  if (!leido) return "";
  const en = idiomaActual() === "en";
  if (leido.traje) {
    const [eu, pecho, letra] = leido.fila;
    const nombre = en ? "Suit" : "Traje";
    if (leido.letra) return `${nombre} ${letra} = 🇪🇺 ${eu} · 🇺🇸🇬🇧 ${pecho}`;
    return leido.de === "eu"
      ? `${nombre} 🇪🇺 ${eu} = 🇺🇸🇬🇧 ${pecho} · ${letra}`
      : `${nombre} 🇺🇸🇬🇧 ${pecho} = 🇪🇺 ${eu} · ${letra}`;
  }
  const [eu, uk, us, letra] = leido.fila;
  const nombre = en ? "Women's" : "Ropa de mujer";
  const todas = { eu: `🇪🇺 ${eu}`, uk: `🇬🇧 ${uk}`, us: `🇺🇸 ${us}` };
  if (leido.letra) return `${nombre} ${letra} = ${todas.eu} · ${todas.uk} · ${todas.us}`;
  const resto = Object.keys(todas).filter((k) => k !== leido.de).map((k) => todas[k]);
  return `${nombre} ${todas[leido.de]} = ${resto.join(" · ")} · ${letra}`;
}

// "cd 100 mbps", para saber si el wifi del hotel da para algo. Megabits, no
// megabytes: ocho veces menos de lo que parece. El GB, de 1000 MB, como el operador.
// "cd 20000 mah": si la batería externa puede subir al avión. Las aerolíneas
// cuentan en Wh, y la caja pone mAh. A 3,7 V salvo que digas otra cosa, que es
// lo que usan ellas. Siempre en cabina: en la bodega no va nunca.
const HAY_MAH = /^\s*(\d+(?:[.,]\d+)?)\s*mah(?:\s*(?:a\s+|@\s*)?(\d+(?:[.,]\d+)?)\s*v)?\s*$/i;
const VOLTIOS_BATERIA = 3.7;
const WH_LIBRE = 100;
const WH_CON_PERMISO = 160;

function leerMah(texto) {
  const m = String(texto ?? "").match(HAY_MAH);
  if (!m) return null;
  const mah = Number(m[1].replace(",", "."));
  const voltios = m[2] ? Number(m[2].replace(",", ".")) : VOLTIOS_BATERIA;
  return mah > 0 && voltios > 0 && voltios <= 48 ? { mah, voltios } : null;
}

function convertirMah({ mah, voltios }) {
  const wh = (mah * voltios) / 1000;
  return { wh, avion: wh <= WH_LIBRE ? "libre" : wh <= WH_CON_PERMISO ? "permiso" : "no" };
}

function textoMah(leido) {
  if (!leido) return "";
  const { wh, avion } = convertirMah(leido);
  const n = (x, d) => numeros({ maximumFractionDigits: d }).format(x);
  const icono = { libre: "✅", permiso: "⚠️", no: "⛔" }[avion];
  return `${n(leido.mah, 0)} mAh = ${n(wh, 1)} Wh · ${icono} ${tr(`mah.${avion}`)}`;
}

const HAY_MBPS =/^\s*(\d+(?:[.,]\d+)?)\s*(k|m|g)(?:bps|bits?\/s|(b)\/s)\s*$/i;
const MBPS_POR = { k: 0.001, m: 1, g: 1000 };

function leerMbps(texto) {
  const m = String(texto ?? "").match(HAY_MBPS);
  // Con la B mayúscula son bytes, que es justo lo otro.
  if (!m || m[3] === "B") return null;
  return { valor: Number(m[1].replace(",", ".")), de: `${m[2].toLowerCase()}bps` };
}

function convertirMbps({ valor, de }) {
  const mbps = valor * MBPS_POR[de[0]];
  return { valor: mbps / 8, a: "MB/s", segundosGb: 8000 / mbps };
}

function duracion(segundos) {
  const s = Math.round(segundos);
  if (s < 60) return `${s} s`;
  if (s < 3600) return s % 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s / 60} min`;
  const min = Math.round(s / 60);
  return min % 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min / 60} h`;
}

// "cd 120 mg/dl", la glucosa: en Estados Unidos va en mg/dL y aquí casi
// siempre en mmol/L. El 18 sirve solo para la glucosa; el colesterol va con otro.
const HAY_GLUCOSA = /^\s*(\d+(?:[.,]\d+)?)\s*(?:(mg\s*\/\s*dl)|mmol(?:\s*\/\s*l)?)\s*$/i;
const MG_DL_POR_MMOL = 18;

function leerGlucosa(texto) {
  const m = String(texto ?? "").match(HAY_GLUCOSA);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: m[2] ? "mg/dL" : "mmol/L" };
}

function convertirGlucosa({ valor, de }) {
  return de === "mg/dL" ? { valor: valor / MG_DL_POR_MMOL, a: "mmol/L" } : { valor: valor * MG_DL_POR_MMOL, a: "mg/dL" };
}

function textoGlucosa(leido) {
  if (!leido) return "";
  const otro = convertirGlucosa(leido);
  const n = (x, de) => numeros({ maximumFractionDigits: de === "mg/dL" ? 0 : 1 }).format(x);
  const glucosa = idiomaActual() === "en" ? "glucose" : "glucosa";
  return `${numeros({ maximumFractionDigits: 1 }).format(leido.valor)} ${leido.de} = ${n(otro.valor, otro.a)} ${otro.a} (${glucosa})`;
}

// "cd 2 go", el vaso del arroz japonés, el de las arroceras. Son 180 ml, pero
// las recetas piensan en el arroz: un go crudo pesa unos 150 g.
const HAY_GO = /^\s*(\d+(?:[.,]\d+)?)\s*(?:go|gō|合)\s*$/i;
const ML_POR_GO = 2401 / 13.31;
const ARROZ_POR_GO = 150;

function leerGo(texto) {
  const m = String(texto ?? "").match(HAY_GO);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "go" };
}

function convertirGo({ valor }) {
  return { valor: valor * ML_POR_GO, a: "ml", arroz: valor * ARROZ_POR_GO };
}

function textoGo(leido) {
  if (!leido) return "";
  const otro = convertirGo(leido);
  const cuanto = (x, poca, mucha) => (x >= 1000 ? `${numeros({ maximumFractionDigits: 2 }).format(x / 1000)} ${mucha}` : `${numeros({ maximumFractionDigits: 0 }).format(x)} ${poca}`);
  const arroz = idiomaActual() === "en" ? "of rice" : "de arroz";
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} go = ${cuanto(otro.valor, "ml", "l")} · 🍚 ${cuanto(otro.arroz, "g", "kg")} ${arroz}`;
}

// "cd 10 varas", la de las escrituras viejas. La castellana, la de Burgos, y la
// argentina, que salió más larga y todavía aparece en los terrenos de allí.
const HAY_VARA = /^\s*(\d+(?:[.,]\d+)?)\s*varas?(?:\s+castellanas?)?\s*$/i;
const CM_POR_VARA = 83.5905;
const CM_POR_VARA_ARGENTINA = 86.6;

function leerVara(texto) {
  const m = String(texto ?? "").match(HAY_VARA);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "vara" };
}

function convertirVara({ valor }) {
  return { valor: valor * CM_POR_VARA, a: "cm", argentina: valor * CM_POR_VARA_ARGENTINA };
}

function textoVara(leido) {
  if (!leido) return "";
  const otro = convertirVara(leido);
  const largo = (cm) => (cm >= 100 ? `${numeros({ maximumFractionDigits: 2 }).format(cm / 100)} m` : `${numeros({ maximumFractionDigits: 1 }).format(cm)} cm`);
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${leido.valor === 1 ? "vara" : "varas"} = 🇪🇸 ${largo(otro.valor)} · 🇦🇷 ${largo(otro.argentina)}`;
}

// "cd 2 manzanas", las fincas de Centroamérica: 100 por 100 varas castellanas.
// La manzana argentina es una cuadra de ciudad, otra cosa, así que esa no.
const HAY_MANZANA = /^\s*(\d+(?:[.,]\d+)?)\s*(?:manzanas?|mz)\s*$/i;
const M2_POR_MANZANA = 10000 * (CM_POR_VARA / 100) ** 2;

function leerManzana(texto) {
  const m = String(texto ?? "").match(HAY_MANZANA);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  if (!valor) return null;
  return { valor, de: "manzana" };
}

function convertirManzana({ valor }) {
  return { valor: valor * M2_POR_MANZANA / 10000, a: "ha", m2: valor * M2_POR_MANZANA };
}

function textoManzana(leido) {
  if (!leido) return "";
  const otro = convertirManzana(leido);
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${leido.valor === 1 ? "manzana" : "manzanas"} = ${numeros({ maximumFractionDigits: 2 }).format(otro.valor)} ha · ${numeros({ maximumFractionDigits: 0 }).format(otro.m2)} m²`;
}

// "cd 3 ri", la legua japonesa de los caminos antiguos: 12.960 shaku. El 里
// chino se escribe igual pero lo dejaron en medio kilómetro, así que van los dos.
const HAY_RI = /^\s*(\d+(?:[.,]\d+)?)\s*(ri|li|里)\s*$/i;
const M_POR_RI = 12960 * M_POR_SHAKU;
const M_POR_LI = 500;

function leerRi(texto) {
  const m = String(texto ?? "").match(HAY_RI);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: m[2].toLowerCase() === "li" ? "li" : "ri" };
}

function convertirRi({ valor }) {
  return { valor: valor * M_POR_RI / 1000, a: "km", china: valor * M_POR_LI / 1000 };
}

function textoRi(leido) {
  if (!leido) return "";
  const otro = convertirRi(leido);
  const largo = (km) => (km >= 1 ? `${numeros({ maximumFractionDigits: 2 }).format(km)} km` : `${numeros({ maximumFractionDigits: 0 }).format(km * 1000)} m`);
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${leido.de} = 🇯🇵 ${largo(otro.valor)} · 🇨🇳 ${largo(otro.china)}`;
}

function textoMbps(leido) {
  if (!leido) return "";
  const otro = convertirMbps(leido);
  const n = numeros({ maximumFractionDigits: 1 });
  const unidad = { kbps: "kbps", mbps: "Mbps", gbps: "Gbps" }[leido.de];
  const velocidad = otro.valor < 1 ? `${n.format(otro.valor * 1000)} kB/s` : `${n.format(otro.valor)} MB/s`;
  const gb = idiomaActual() === "en" ? "1 GB in" : "1 GB en";
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${unidad} = ${velocidad} · ${gb} ${duracion(otro.segundosGb)}`;
}

// "cd 3 dram", el peso de la pólvora en los cartuchos de caza, y "cd 1 fl dr"
// para los frascos de perfume y de la farmacia. "dr" solo no, que es doctor.
const HAY_DRAM = /^\s*(\d+(?:[.,]\d+)?)\s*(?:(fl\.?\s*dr|fl(?:uid)?\.?\s*drams?)|drams?|drachms?)\s*$/i;

function leerDram(texto) {
  const m = String(texto ?? "").match(HAY_DRAM);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: m[2] ? "fl dr" : "dram" };
}

function convertirDram({ valor, de }) {
  return de === "fl dr" ? { valor: valor * ML_POR_ONZA_LIQUIDA / 8, a: "ml" } : { valor: valor * G_POR_ONZA / 16, a: "g" };
}

function textoDram(leido) {
  if (!leido) return "";
  const otro = convertirDram(leido);
  const n = numeros({ maximumFractionDigits: 2 });
  return `${n.format(leido.valor)} ${leido.de} = ${n.format(otro.valor)} ${otro.a}`;
}

// "cd 300 codos", el arca de Noé y las pirámides. El de la Biblia lo tomo de
// 18 pulgadas y el egipcio real, de 52,36 cm, que es como lo dan los museos.
const HAY_CODO = /^\s*(\d+(?:[.,]\d+)?)\s*(codos?|cubits?)\s*$/i;
const CM_POR_CODO = 45.72;
const CM_POR_CODO_REAL = 52.36;

function leerCodo(texto) {
  const m = String(texto ?? "").match(HAY_CODO);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^cu/i.test(m[2]) ? "cubit" : "codo" };
}

function convertirCodo({ valor }) {
  return { valor: valor * CM_POR_CODO, a: "cm", egipto: valor * CM_POR_CODO_REAL };
}

function textoCodo(leido) {
  if (!leido) return "";
  const otro = convertirCodo(leido);
  const largo = (cm) => (cm >= 100 ? `${numeros({ maximumFractionDigits: 1 }).format(cm / 100)} m` : `${numeros({ maximumFractionDigits: 1 }).format(cm)} cm`);
  const nombre = leido.valor === 1 ? leido.de : `${leido.de}s`;
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${nombre} = 📜 ${largo(otro.valor)} · 🇪🇬 ${largo(otro.egipto)}`;
}

// "cd 20 tsubo", como anuncian los pisos en Japón. En Corea lo llaman pyeong y
// en Taiwán ping, pero es la misma medida: el tatami doble, 400/121 m².
const HAY_TSUBO = /^\s*(\d+(?:[.,]\d+)?)\s*(tsubo|坪|pye?ong|평|ping)\s*$/i;
const M2_POR_TSUBO = 400 / 121;

function leerTsubo(texto) {
  const m = String(texto ?? "").match(HAY_TSUBO);
  if (!m) return null;
  const nombre = m[2].toLowerCase();
  const de = /^py|평/.test(nombre) ? "pyeong" : nombre === "ping" ? "ping" : "tsubo";
  return { valor: Number(m[1].replace(",", ".")), de };
}

function convertirTsubo({ valor }) {
  return { valor: valor * M2_POR_TSUBO, a: "m²" };
}

function textoTsubo(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  return `${n.format(leido.valor)} ${leido.de} = ${n.format(convertirTsubo(leido).valor)} m²`;
}

// "cd 6 jo", lo que miden las habitaciones en los anuncios de pisos de Japón.
// Cada región tiene su tatami, pero los anuncios por ley cuentan 1,62 m².
const HAY_JO = /^\s*(\d+(?:[.,]\d+)?)\s*(?:j[oō]|畳|帖|tatamis?)\s*$/i;
const M2_POR_JO = 1.62;

function leerJo(texto) {
  const m = String(texto ?? "").match(HAY_JO);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  if (!valor) return null;
  return { valor, de: "jo" };
}

function convertirJo({ valor }) {
  return { valor: valor * M2_POR_JO, a: "m²" };
}

function textoJo(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  return `${n.format(leido.valor)} jo = ${n.format(convertirJo(leido).valor)} m²`;
}

// "cd 5 lakh", como dan en India los precios de pisos y coches y los sueldos.
// Un lakh son cien mil y un crore, cien lakh.
const HAY_LAKH = /^\s*(\d+(?:[.,]\d+)?)\s*(lakhs?|lacs?|crores?|cr)\s*$/i;
const LAKH = 1e5;
const CRORE = 1e7;

function leerLakh(texto) {
  const m = String(texto ?? "").match(HAY_LAKH);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^c/i.test(m[2]) ? "crore" : "lakh" };
}

function convertirLakh({ valor, de }) {
  return { valor: valor * (de === "crore" ? CRORE : LAKH) };
}

function textoLakh(leido) {
  if (!leido) return "";
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${leido.de} = ${numeros({ maximumFractionDigits: 0 }).format(convertirLakh(leido).valor)}`;
}

// "cd 10 tola", como se vende el oro en India y en Dubái. Saco también las
// onzas troy porque el precio del oro siempre viene por onza.
const HAY_TOLA = /^\s*(\d+(?:[.,]\d+)?)\s*(?:tolas?|tolay?|तोला)\s*$/i;
const G_POR_TOLA = 11.6638038;

function leerTola(texto) {
  const m = String(texto ?? "").match(HAY_TOLA);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "tola" };
}

function convertirTola({ valor }) {
  return { valor: valor * G_POR_TOLA, a: "g", troy: valor * G_POR_TOLA / G_POR_ONZA_TROY };
}

function textoTola(leido) {
  if (!leido) return "";
  const otro = convertirTola(leido);
  const n = numeros({ maximumFractionDigits: 2 });
  return `${n.format(leido.valor)} tola = ${numeros({ maximumFractionDigits: 1 }).format(otro.valor)} g · ${n.format(otro.troy)} ozt`;
}

// "cd 5 maund", el del grano y el algodón en los mercados de allí. En India y
// Bangladesh siguen con el de 3.200 tolas; Pakistán lo redondeó a 40 kg.
const HAY_MAUND = /^\s*(\d+(?:[.,]\d+)?)\s*(?:maunds?|munds?|मन|মণ|من)\s*$/i;
const TOLAS_POR_MAUND = 3200;

function leerMaund(texto) {
  const m = String(texto ?? "").match(HAY_MAUND);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "maund" };
}

function convertirMaund({ valor }) {
  return { valor: valor * TOLAS_POR_MAUND * G_POR_TOLA / 1000, a: "kg", pakistan: valor * 40 };
}

function textoMaund(leido) {
  if (!leido) return "";
  const otro = convertirMaund(leido);
  const n = numeros({ maximumFractionDigits: 1 });
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} maund = 🇮🇳 ${n.format(otro.valor)} kg · 🇵🇰 ${n.format(otro.pakistan)} kg`;
}

// "cd 1 tael", el té y el oro de Hong Kong. Es un dieciseisavo de catty, pero
// el del oro va aparte y pesa un 1 % menos; en China es la décima de un jin.
const HAY_TAEL = /^\s*(\d+(?:[.,]\d+)?)\s*(?:taels?|兩|两|liang)\s*$/i;
const G_POR_TAEL = KG_POR_CATTY * 1000 / 16;
const G_POR_TAEL_ORO = 37.429;

function leerTael(texto) {
  const m = String(texto ?? "").match(HAY_TAEL);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "tael" };
}

function convertirTael({ valor }) {
  return { valor: valor * G_POR_TAEL, a: "g", china: valor * KG_POR_JIN * 100, oro: valor * G_POR_TAEL_ORO };
}

function textoTael(leido) {
  if (!leido) return "";
  const otro = convertirTael(leido);
  const n = numeros({ maximumFractionDigits: 1 });
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} tael = 🇭🇰 ${n.format(otro.valor)} g · 🇨🇳 ${n.format(otro.china)} g · ${tr("tael.oro", { g: numeros({ maximumFractionDigits: 2 }).format(otro.oro) })}`;
}

// "cd mach 2", los aviones de las noticias. El sonido va más lento con el frío,
// así que saco el del nivel del mar y el de 11 km, donde vuelan los aviones.
const HAY_MACH = /^\s*(?:mach\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*mach)\s*$/i;
const KMH_POR_MACH = 340.294 * 3.6;
const KMH_POR_MACH_ARRIBA = 295.07 * 3.6;

function leerMach(texto) {
  const m = String(texto ?? "").match(HAY_MACH);
  if (!m) return null;
  const valor = Number((m[1] ?? m[2]).replace(",", "."));
  return valor ? { valor, de: "mach" } : null;
}

function convertirMach({ valor }) {
  return { valor: valor * KMH_POR_MACH, a: "km/h", arriba: valor * KMH_POR_MACH_ARRIBA };
}

function textoMach(leido) {
  if (!leido) return "";
  const otro = convertirMach(leido);
  const n = numeros({ maximumFractionDigits: 0 });
  return `Mach ${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} = 🌊 ${n.format(otro.valor)} km/h · ✈️ ${n.format(otro.arriba)} km/h`;
}

// "cd 2 thou", el grosor de las bolsas y del plástico en Estados Unidos. Allí
// también lo llaman "mil", pero aquí eso es otra cosa, así que solo "thou".
const HAY_THOU = /^\s*(\d+(?:[.,]\d+)?)\s*thou\s*$/i;
const MM_POR_THOU = 0.0254;

function leerThou(texto) {
  const m = String(texto ?? "").match(HAY_THOU);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "thou" };
}

function convertirThou({ valor }) {
  return { valor: valor * MM_POR_THOU, a: "mm" };
}

function textoThou(leido) {
  if (!leido) return "";
  const mm = convertirThou(leido).valor;
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} thou = ${numeros({ maximumFractionDigits: 3 }).format(mm)} mm · ${numeros({ maximumFractionDigits: 0 }).format(mm * 1000)} µm`;
}

// "cd 200 gsm", el gramaje de las toallas y del papel. En Estados Unidos las
// telas vienen en onzas por yarda cuadrada, así que entiendo las dos.
const HAY_GRAMAJE = /^\s*(\d+(?:[.,]\d+)?)\s*(gsm|g\s*\/\s*m(?:2|²)|oz\s*\/\s*yd(?:2|²))\s*$/i;
const GSM_POR_OZ_YD2 = 28.349523125 / 0.83612736;

function leerGramaje(texto) {
  const m = String(texto ?? "").match(HAY_GRAMAJE);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  if (!valor) return null;
  return { valor, de: /^oz/i.test(m[2]) ? "oz/yd²" : "g/m²" };
}

function convertirGramaje({ valor, de }) {
  if (de === "oz/yd²") return { valor: valor * GSM_POR_OZ_YD2, a: "g/m²" };
  return { valor: valor / GSM_POR_OZ_YD2, a: "oz/yd²" };
}

function textoGramaje(leido) {
  if (!leido) return "";
  const otro = convertirGramaje(leido);
  const decimales = otro.a === "g/m²" ? 0 : 1;
  return `${numeros({ maximumFractionDigits: 1 }).format(leido.valor)} ${leido.de} = ${numeros({ maximumFractionDigits: decimales }).format(otro.valor)} ${otro.a}`;
}

// "cd 22 momme". En las sábanas de seda es gramaje y en las perlas, peso, y el
// número viene solo, así que saco los dos. Lo de la seda es la cifra que se da siempre.
const HAY_MOMME = /^\s*(\d+(?:[.,]\d+)?)\s*(?:mommes?|monme|匁)\s*$/i;
const G_POR_MOMME = 3.75;
const GSM_POR_MOMME = 4.34;

function leerMomme(texto) {
  const m = String(texto ?? "").match(HAY_MOMME);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  if (!valor) return null;
  return { valor, de: "momme" };
}

function convertirMomme({ valor }) {
  return { valor: valor * GSM_POR_MOMME, a: "g/m²", peso: valor * G_POR_MOMME };
}

function textoMomme(leido) {
  if (!leido) return "";
  const otro = convertirMomme(leido);
  const n = numeros({ maximumFractionDigits: 1 });
  return `${n.format(leido.valor)} momme = 🧵 ${n.format(otro.valor)} g/m² · ⚖️ ${n.format(otro.peso)} g`;
}

// "cd 2 pood", las kettlebells rusas. El pood de verdad son 16,38 kg, pero las
// pesas se hacen de 16 kg justos por pood, y eso es lo que pone en la tienda.
const HAY_POOD = /^\s*(\d+(?:[.,]\d+)?)\s*(?:poods?|pud|пуд(?:а|ов)?)\s*$/i;
const KG_POR_POOD = 16.3807;
const KG_PESA_POR_POOD = 16;

function leerPood(texto) {
  const m = String(texto ?? "").match(HAY_POOD);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  if (!valor) return null;
  return { valor, de: "pood" };
}

function convertirPood({ valor }) {
  return { valor: valor * KG_POR_POOD, a: "kg", pesa: valor * KG_PESA_POR_POOD };
}

function textoPood(leido) {
  if (!leido) return "";
  const otro = convertirPood(leido);
  const n = numeros({ maximumFractionDigits: 1 });
  return `${n.format(leido.valor)} pood = ${n.format(otro.valor)} kg · 🏋️ ${tr("pood.pesa", { kg: n.format(otro.pesa) })}`;
}

// "cd 5 verst", las distancias de las novelas rusas. Va con y sin la ё, que en
// los teclados rusos casi nadie la pone.
const HAY_VERSTA = /^\s*(\d+(?:[.,]\d+)?)\s*(?:versts?|verstas?|в[её]рст(?:а|ы)?)\s*$/i;
const KM_POR_VERSTA = 1.0668;

function leerVersta(texto) {
  const m = String(texto ?? "").match(HAY_VERSTA);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  if (!valor) return null;
  return { valor, de: "verst" };
}

function convertirVersta({ valor }) {
  return { valor: valor * KM_POR_VERSTA, a: "km" };
}

function textoVersta(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  return `${n.format(leido.valor)} ${leido.valor === 1 ? "verst" : "versts"} = ${n.format(convertirVersta(leido).valor)} km`;
}

// "cd 4 ly" o "cd 1 parsec", por curiosidad. Sin "pc", que es lo de las piezas.
// Lo doy en billones de km, que en inglés son trillions: por eso va por tr().
const HAY_ANIO_LUZ = /^\s*(\d+(?:[.,]\d+)?)\s*(ly|light[\s-]*years?|a[ñn]os?[\s-]*luz|p[aá]rsecs?|parsecs?)\s*$/i;
const KM_POR_ANIO_LUZ = 9.4607304725808e12;
const ANIOS_LUZ_POR_PARSEC = 3.261563777;

function leerAnioLuz(texto) {
  const m = String(texto ?? "").match(HAY_ANIO_LUZ);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  if (!valor) return null;
  return { valor, de: /^p/i.test(m[2]) ? "pc" : "ly" };
}

function convertirAnioLuz({ valor, de }) {
  const ly = de === "pc" ? valor * ANIOS_LUZ_POR_PARSEC : valor;
  return { valor: ly * KM_POR_ANIO_LUZ, a: "km", ly };
}

function textoAnioLuz(leido) {
  if (!leido) return "";
  const otro = convertirAnioLuz(leido);
  const n = (x) => numeros({ maximumFractionDigits: 2 }).format(x);
  const anios = (x) => tr(x === 1 ? "luz.anio" : "luz.anios", { n: n(x) });
  const km = tr("luz.km", { n: numeros({ maximumSignificantDigits: 3 }).format(otro.valor / 1e12) });
  if (leido.de === "pc") return `${n(leido.valor)} pc = ${anios(otro.ly)} · ${km}`;
  return `${anios(leido.valor)} = ${km}`;
}

// "cd 1 acre-ft", el agua de los embalses en las noticias de allí. Con cifras
// grandes saco también los hm³, que es como se cuentan los pantanos aquí.
const HAY_ACRE_PIE = /^\s*(\d+(?:[.,]\d+)?)\s*(?:acres?|ac)[\s-]*(?:ft|feet|foot)\s*$/i;
const M3_POR_ACRE_PIE = 1233.48183754752;

function leerAcrePie(texto) {
  const m = String(texto ?? "").match(HAY_ACRE_PIE);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "acre-ft" };
}

function convertirAcrePie({ valor }) {
  return { valor: valor * M3_POR_ACRE_PIE, a: "m³" };
}

function textoAcrePie(leido) {
  if (!leido) return "";
  const m3 = convertirAcrePie(leido).valor;
  const hm3 = m3 >= 1e5 ? ` · ${numeros({ maximumFractionDigits: 2 }).format(m3 / 1e6)} hm³` : "";
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} acre-ft = ${numeros({ maximumFractionDigits: 0 }).format(m3)} m³${hm3}`;
}

// "cd 2 bigha", la de los terrenos en Bangladesh y Nepal. En India cada estado
// tiene la suya, así que me quedo con las dos que tienen un valor fijo por ley.
const HAY_BIGHA = /^\s*(\d+(?:[.,]\d+)?)\s*(?:bighas?|বিঘা|बिघा)\s*$/i;
const M2_POR_BIGHA = { bd: 14400 * 0.09290304, np: 72900 * 0.09290304 };

function leerBigha(texto) {
  const m = String(texto ?? "").match(HAY_BIGHA);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "bigha" };
}

function convertirBigha({ valor }) {
  return { valor: valor * M2_POR_BIGHA.bd, a: "m²", nepal: valor * M2_POR_BIGHA.np };
}

function textoBigha(leido) {
  if (!leido) return "";
  const otro = convertirBigha(leido);
  // Pasada la hectárea, los m² ya no se leen bien.
  const area = (m2) => (m2 >= 1e4 ? `${numeros({ maximumFractionDigits: 2 }).format(m2 / 1e4)} ha` : `${numeros({ maximumFractionDigits: 0 }).format(m2)} m²`);
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} bigha = 🇧🇩 ${area(otro.valor)} · 🇳🇵 ${area(otro.nepal)}`;
}

// "cd 10 mu", el de las fincas y las cosechas en China. Quince mu, una hectárea.
const HAY_MU = /^\s*(\d+(?:[.,]\d+)?)\s*(?:mu|亩|畝)\s*$/i;
const M2_POR_MU = 10000 / 15;

function leerMu(texto) {
  const m = String(texto ?? "").match(HAY_MU);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "mu" };
}

function convertirMu({ valor }) {
  return { valor: valor * M2_POR_MU, a: "m²" };
}

function textoMu(leido) {
  if (!leido) return "";
  const m2 = convertirMu(leido).valor;
  const area = m2 >= 1e4 ? `${numeros({ maximumFractionDigits: 2 }).format(m2 / 1e4)} ha` : `${numeros({ maximumFractionDigits: 0 }).format(m2)} m²`;
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} mu = ${area}`;
}

// "cd 10 fanegas", la de las escrituras viejas y las fincas del pueblo. Cada
// comarca tenía la suya; me quedo con la de Castilla, la del marco real.
const HAY_FANEGA = /^\s*(\d+(?:[.,]\d+)?)\s*(?:fanegas?|fanegadas?|fan\.)\s*$/i;
const M2_POR_FANEGA = 6439.56;

function leerFanega(texto) {
  const m = String(texto ?? "").match(HAY_FANEGA);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "fanega" };
}

function convertirFanega({ valor }) {
  return { valor: valor * M2_POR_FANEGA / 1e4, a: "ha" };
}

function textoFanega(leido) {
  if (!leido) return "";
  const nombre = leido.valor === 1 ? "fanega" : "fanegas";
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${nombre} = ${numeros({ maximumFractionDigits: 2 }).format(convertirFanega(leido).valor)} ha`;
}

// "cd 2 acres", para la casa rural o el parque, y "cd 2 ha" al revés. Sin
// "ac", que suena a otra cosa.
const HAY_ACRES = /^\s*(\d+(?:[.,]\d+)?)\s*(acres?|ha|hect[aá]reas?|hectares?)\s*$/i;
const HA_POR_ACRE = 0.40468564224;

function leerAcres(texto) {
  const m = String(texto ?? "").match(HAY_ACRES);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^h/i.test(m[2]) ? "ha" : "acres" };
}

function convertirAcres({ valor, de }) {
  return de === "ha" ? { valor: valor / HA_POR_ACRE, a: "acres" } : { valor: valor * HA_POR_ACRE, a: "ha" };
}

// Dos decimales, que un acre se queda en 0,4 ha y con uno no se distinguen.
function textoAcres(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 2 }).format(n)} ${u === "acres" && n === 1 ? "acre" : u}`;
  const otro = convertirAcres(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 10 arpents", las fincas de Quebec y de las escrituras viejas de Luisiana.
// Es el arpent cuadrado; el de longitud apenas sale ya en ningún sitio.
const HAY_ARPENT = /^\s*(\d+(?:[.,]\d+)?)\s*arpents?\s*$/i;
const HA_POR_ARPENT = 0.341889;

function leerArpent(texto) {
  const m = String(texto ?? "").match(HAY_ARPENT);
  if (!m) return null;
  const valor = Number(m[1].replace(",", "."));
  if (!valor) return null;
  return { valor, de: "arpent" };
}

function convertirArpent({ valor }) {
  return { valor: valor * HA_POR_ARPENT, a: "ha", acres: valor * HA_POR_ARPENT / HA_POR_ACRE };
}

function textoArpent(leido) {
  if (!leido) return "";
  const otro = convertirArpent(leido);
  const n = (x) => numeros({ maximumFractionDigits: 2 }).format(x);
  return `${n(leido.valor)} ${leido.valor === 1 ? "arpent" : "arpents"} = ${n(otro.valor)} ha · ${n(otro.acres)} acres`;
}

// "cd 250 kcal" o "cd 1000 kJ": en Australia las etiquetas solo traen kJ. Las
// "calorías" de la comida son kilocalorías, así que "cal" a secas cuenta igual.
const HAY_CALORIAS = /^\s*(\d+(?:[.,]\d+)?)\s*(kcal|cal|calor[ií]as?|calories?|kj|kilojul(?:io)?s?|kilojoules?)\s*$/i;
const KJ_POR_KCAL = 4.184;

function leerCalorias(texto) {
  const m = String(texto ?? "").match(HAY_CALORIAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: /^k(j|ilo)/i.test(m[2]) ? "kJ" : "kcal" };
}

function convertirCalorias({ valor, de }) {
  return de === "kcal" ? { valor: valor * KJ_POR_KCAL, a: "kJ" } : { valor: valor / KJ_POR_KCAL, a: "kcal" };
}

// Sin decimales, como en las etiquetas.
function textoCalorias(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 0 }).format(n)} ${u}`;
  const otro = convertirCalorias(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 150 hp", el coche de alquiler. Aquí la ficha va en kW y lo que se dice
// son CV, que no son lo mismo: el hp inglés es un poco más grande.
// Los PS de los coches alemanes son el mismo caballo que el CV.
const HAY_POTENCIA = /^\s*(\d+(?:[.,]\d+)?)\s*(b?hp|horsepower|kw|kilovatios?|kilowatts?|cv|caballos?|ps|pferdest(?:ä|ae)rke)\s*$/i;
const KW_POR_HP = 0.745699872;
const KW_POR_CV = 0.73549875;

function leerPotencia(texto) {
  const m = String(texto ?? "").match(HAY_POTENCIA);
  if (!m) return null;
  const de = /^k/i.test(m[2]) ? "kW" : /^c/i.test(m[2]) ? "CV" : /^p/i.test(m[2]) ? "PS" : "hp";
  return { valor: Number(m[1].replace(",", ".")), de };
}

// De hp y de CV, a kW y a la otra: son las dos que se confunden.
function convertirPotencia({ valor, de }) {
  if (de === "kW") return { valor: valor / KW_POR_HP, a: "hp" };
  const kw = valor * (de === "hp" ? KW_POR_HP : KW_POR_CV);
  return de === "hp" ? { valor: kw, a: "kW", otra: kw / KW_POR_CV, en: "CV" } : { valor: kw, a: "kW", otra: kw / KW_POR_HP, en: "hp" };
}

function textoPotencia(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 0 }).format(n)} ${u}`;
  const otro = convertirPotencia(leido);
  const otra = otro.otra === undefined ? "" : ` · ${cuanto(otro.otra, otro.en)}`;
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}${otra}`;
}

// "cd 12000 btu", el aire acondicionado del hotel en Estados Unidos. Siempre
// son miles, así que "12.000" y "12,000" van como doce mil y no como doce.
const HAY_BTU = /^\s*(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)\s*(?:btus?|btu\/h)\s*$/i;
const KW_POR_BTU = 0.00029307107;

function leerBtu(texto) {
  const m = String(texto ?? "").match(HAY_BTU);
  if (!m) return null;
  const miles = /^\d{1,3}(?:[.,]\d{3})+$/.test(m[1]);
  return { valor: Number(miles ? m[1].replace(/[.,]/g, "") : m[1].replace(",", ".")), de: "BTU" };
}

function convertirBtu({ valor }) {
  return { valor: valor * KW_POR_BTU, a: "kW" };
}

function textoBtu(leido) {
  if (!leido) return "";
  const otro = convertirBtu(leido);
  return `${numeros({ maximumFractionDigits: 0 }).format(leido.valor)} ${leido.de} = ${numeros({ maximumFractionDigits: 1 }).format(otro.valor)} ${otro.a}`;
}

// "cd 50 therm", la factura del gas en Estados Unidos y Reino Unido, a los kWh
// de la de aquí. Un therm son cien mil BTU.
const HAY_THERMS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:therms?|thm|termias?)\s*$/i;
const KWH_POR_THERM = 29.3071;

function leerTherms(texto) {
  const m = String(texto ?? "").match(HAY_THERMS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "therm" };
}

function convertirTherms({ valor }) {
  return { valor: valor * KWH_POR_THERM, a: "kWh" };
}

function textoTherms(leido) {
  if (!leido) return "";
  const otro = convertirTherms(leido);
  return `${numeros({ maximumFractionDigits: 1 }).format(leido.valor)} ${leido.de} = ${numeros({ maximumFractionDigits: 0 }).format(otro.valor)} ${otro.a}`;
}

// "cd 30 inhg", la presión del parte del tiempo en Estados Unidos, a los hPa,
// que son los milibares de aquí. Y "cd 1013 hpa" al revés, para el barómetro de allí.
// Los mmHg, que es como da el tiempo Rusia y medio Este, también van a hPa, y
// los torr de las bombas de vacío.
const HAY_INHG = /^\s*(\d+(?:[.,]\d+)?)\s*(?:(in\.?\s*hg|"\s*hg|pulgadas? de mercurio|inch(?:es)? of mercury)|(mm\s*hg|mil[ií]metros? de mercurio|millimet(?:er|re)s? of mercury)|(torrs?)|(hpa|mbar|milibares?|millibars?))\s*$/i;
const HPA_POR_INHG = 33.8638866667;
const HPA_POR_MMHG = 1.33322387415;
// El torr es la atmósfera entre 760, que no es exactamente un mmHg aunque casi.
const HPA_POR_TORR = 1013.25 / 760;

function leerInHg(texto) {
  const m = String(texto ?? "").match(HAY_INHG);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: m[2] ? "inHg" : m[3] ? "mmHg" : m[4] ? "Torr" : "hPa" };
}

function convertirInHg({ valor, de }) {
  if (de === "mmHg") return { valor: valor * HPA_POR_MMHG, a: "hPa" };
  if (de === "Torr") return { valor: valor * HPA_POR_TORR, a: "hPa" };
  return de === "hPa" ? { valor: valor / HPA_POR_INHG, a: "inHg" } : { valor: valor * HPA_POR_INHG, a: "hPa" };
}

// Los inHg salen con dos decimales en el parte (29,92), los hPa, enteros.
function textoInHg(leido) {
  if (!leido) return "";
  const presion = (n, u) => `${numeros({ maximumFractionDigits: u === "inHg" ? 2 : 0 }).format(n)} ${u}`;
  const otro = convertirInHg(leido);
  return `${presion(leido.valor, leido.de)} = ${presion(otro.valor, otro.a)}`;
}

// "cd 10 cu ft", las neveras, los trasteros y el maletero del coche de alquiler.
// Solo hacia los litros, que es como lo pone aquí cualquier ficha.
const HAY_PIES_CUBICOS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:cu\.?\s*f(?:ee)?t|ft³|cubic f(?:ee|oo)t|pies? cúbicos?)\s*$/i;
const L_POR_PIE3 = 28.316846592;

function leerPiesCubicos(texto) {
  const m = String(texto ?? "").match(HAY_PIES_CUBICOS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "cu ft" };
}

function convertirPiesCubicos({ valor }) {
  return { valor: valor * L_POR_PIE3, a: "l" };
}

function textoPiesCubicos(leido) {
  if (!leido) return "";
  const otro = convertirPiesCubicos(leido);
  return `${numeros({ maximumFractionDigits: 1 }).format(leido.valor)} ${leido.de} = ${numeros({ maximumFractionDigits: 0 }).format(otro.valor)} ${otro.a}`;
}

// "cd 350 ci", la cilindrada de los coches americanos. Allí dicen "ci" o "cid"
// y aquí, litros. Y "cd 1000 cc" al revés, para las motos.
const HAY_PULGADAS_CUBICAS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:(cid?|cu\.?\s*in\.?|in³|cubic inch(?:es)?|pulgadas? cúbicas?)|(cc|cm³|cm3|cent[ií]metros? cúbicos?|cubic centimet(?:er|re)s?))\s*$/i;
const L_POR_PULGADA3 = 0.016387064;

function leerPulgadasCubicas(texto) {
  const m = String(texto ?? "").match(HAY_PULGADAS_CUBICAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: m[2] ? "ci" : "cc" };
}

function convertirPulgadasCubicas({ valor, de }) {
  return de === "cc" ? { valor: valor / 1000 / L_POR_PULGADA3, a: "ci" } : { valor: valor * L_POR_PULGADA3, a: "l" };
}

function textoPulgadasCubicas(leido) {
  if (!leido) return "";
  const otro = convertirPulgadasCubicas(leido);
  return `${numeros({ maximumFractionDigits: 0 }).format(leido.valor)} ${leido.de} = ${numeros({ maximumFractionDigits: otro.a === "l" ? 1 : 0 }).format(otro.valor)} ${otro.a}`;
}

// "cd 1 bbl", el barril de petróleo de las noticias. Es el de 42 galones; hay
// otros barriles (el de cerveza), pero cuando alguien lo busca es por esto.
const HAY_BARRILES = /^\s*(\d+(?:[.,]\d+)?)\s*(?:bbls?|barrels?|barril(?:es)?)\s*$/i;
const L_POR_BARRIL = 158.987294928;

function leerBarriles(texto) {
  const m = String(texto ?? "").match(HAY_BARRILES);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "bbl" };
}

function convertirBarriles({ valor }) {
  return { valor: valor * L_POR_BARRIL, a: "l" };
}

function textoBarriles(leido) {
  if (!leido) return "";
  const otro = convertirBarriles(leido);
  return `${numeros({ maximumFractionDigits: 1 }).format(leido.valor)} ${leido.de} = ${numeros({ maximumFractionDigits: 0 }).format(otro.valor)} ${otro.a}`;
}

// "cd 300 lb-ft", el par del coche de alquiler. Allí lo escriben al derecho y
// al revés (lb-ft, ft-lb) y es lo mismo.
// Y "cd 400 Nm", el de los coches de aquí, a lb-ft. Solo con esa N mayúscula:
// "nm" a secas ya son millas náuticas.
// Los kgf·m salen en las fichas de coches japoneses viejos y en las llaves dinamométricas.
const HAY_PAR_MOTOR = /^\s*(\d+(?:[.,]\d+)?)\s*(?:lbs?\s*[-·.]?\s*ft|ft\s*[-·.]?\s*lbs?|pound[- ]f(?:ee|oo)t|foot[- ]pounds?|libras?[- ]pie|(n\s*[-·.]\s*m|nm|newton[- ]?met(?:ro|er|re)s?)|(kgf?\s*[-·.]?\s*m))\s*$/i;
const NM_POR_LBFT = 1.3558179483;
const NM_POR_KGFM = 9.80665;

function leerParMotor(texto) {
  const m = String(texto ?? "").match(HAY_PAR_MOTOR);
  if (!m) return null;
  if (/^nm$/i.test(m[2] ?? "") && m[2] !== "Nm") return null;
  return { valor: Number(m[1].replace(",", ".")), de: m[2] ? "Nm" : m[3] ? "kgf·m" : "lb-ft" };
}

function convertirParMotor({ valor, de }) {
  if (de === "Nm") return { valor: valor / NM_POR_LBFT, a: "lb-ft" };
  if (de === "kgf·m") return { valor: valor * NM_POR_KGFM, a: "Nm" };
  return { valor: valor * NM_POR_LBFT, a: "Nm" };
}

function textoParMotor(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: u === "kgf·m" ? 1 : 0 }).format(n)} ${u}`;
  const otro = convertirParMotor(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 2 ton", la tonelada corta de Estados Unidos, la de los puentes y los camiones.
// "Toneladas" es la de 1.000 kg, así que esa va al revés, a las cortas.
// Y "cd 2 long ton", la inglesa, que es la que ponen los puentes de Reino Unido.
const HAY_TONELADAS_CORTAS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:((?:short\s+)?tons?)|(long\s+tons?|tons?\s*\(?\s*(?:uk|imp(?:erial)?)\s*\)?)|t|tonnes?|toneladas?)\s*$/i;
const KG_POR_TONELADA_CORTA = 907.18474;
const KG_POR_TONELADA_LARGA = 1016.0469088;

function leerToneladasCortas(texto) {
  const m = String(texto ?? "").match(HAY_TONELADAS_CORTAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: m[2] ? "ton" : m[3] ? "long ton" : "t" };
}

function convertirToneladasCortas({ valor, de }) {
  if (de === "t") return { valor: (valor * 1000) / KG_POR_TONELADA_CORTA, a: "ton" };
  if (de === "long ton") return { valor: (valor * KG_POR_TONELADA_LARGA) / 1000, a: "t" };
  return { valor: (valor * KG_POR_TONELADA_CORTA) / 1000, a: "t" };
}

function textoToneladasCortas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 2 }).format(n)} ${u}`;
  const otro = convertirToneladasCortas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 1 ct", los quilates de las piedras en la joyería. "Quilates" a secas no lo
// cojo: en el oro (18 quilates) es la pureza, no el peso.
const HAY_QUILATES = /^\s*(\d+(?:[.,]\d+)?)\s*(?:cts?|carats?)\s*$/i;
const G_POR_QUILATE = 0.2;

function leerQuilates(texto) {
  const m = String(texto ?? "").match(HAY_QUILATES);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "ct" };
}

function convertirQuilates({ valor }) {
  return { valor: valor * G_POR_QUILATE, a: "g" };
}

function textoQuilates(leido) {
  if (!leido) return "";
  const otro = convertirQuilates(leido);
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${leido.de} = ${numeros({ maximumFractionDigits: 3 }).format(otro.valor)} ${otro.a}`;
}

// "cd 5 grains", lo que pone en la aspirina de las farmacias de Estados Unidos.
// "gr" no lo cojo, que aquí son gramos.
const HAY_GRAINS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:grains?|granos?)\s*$/i;
const MG_POR_GRAIN = 64.79891;

function leerGrains(texto) {
  const m = String(texto ?? "").match(HAY_GRAINS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "grain" };
}

function convertirGrains({ valor }) {
  return { valor: valor * MG_POR_GRAIN, a: "mg" };
}

function textoGrains(leido) {
  if (!leido) return "";
  const otro = convertirGrains(leido);
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${leido.de} = ${numeros({ maximumFractionDigits: 0 }).format(otro.valor)} ${otro.a}`;
}

// "cd 10 dwt", el pennyweight de los anuncios de oro y plata de allí.
const HAY_PENNYWEIGHT = /^\s*(\d+(?:[.,]\d+)?)\s*(?:dwt|pennyweights?)\s*$/i;
const G_POR_DWT = 1.55517384;

function leerPennyweight(texto) {
  const m = String(texto ?? "").match(HAY_PENNYWEIGHT);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "dwt" };
}

function convertirPennyweight({ valor }) {
  return { valor: valor * G_POR_DWT, a: "g" };
}

function textoPennyweight(leido) {
  if (!leido) return "";
  const otro = convertirPennyweight(leido);
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} dwt = ${numeros({ maximumFractionDigits: 1 }).format(otro.valor)} ${otro.a}`;
}

// "cd 2 cwt", el grano y el ganado. El americano son 100 libras y el inglés 112,
// así que saco los dos, como con las leguas.
const HAY_CWT = /^\s*(\d+(?:[.,]\d+)?)\s*(?:cwt|hundredweights?)\s*$/i;

function leerCwt(texto) {
  const m = String(texto ?? "").match(HAY_CWT);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "cwt" };
}

function convertirCwt({ valor }) {
  return { valor: valor * 100 * KG_POR_LIBRA, a: "kg", inglesa: valor * 112 * KG_POR_LIBRA };
}

function textoCwt(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  const otro = convertirCwt(leido);
  return `${n.format(leido.valor)} cwt = 🇺🇸 ${n.format(otro.valor)} kg · 🇬🇧 ${n.format(otro.inglesa)} kg`;
}

// "cd 1 cord", la leña de las casas de allí. Son 128 pies cúbicos apilados,
// con el aire de entre los troncos dentro.
const HAY_CUERDAS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:cords?|cuerdas?)\s*$/i;

function leerCuerdas(texto) {
  const m = String(texto ?? "").match(HAY_CUERDAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "cord" };
}

function convertirCuerdas({ valor }) {
  return { valor: valor * 128 * L_POR_PIE3 / 1000, a: "m³" };
}

function textoCuerdas(leido) {
  if (!leido) return "";
  const otro = convertirCuerdas(leido);
  return `${numeros({ maximumFractionDigits: 2 }).format(leido.valor)} ${leido.valor === 1 ? "cord" : "cords"} = ${numeros({ maximumFractionDigits: 2 }).format(otro.valor)} ${otro.a}`;
}

// "cd 2 bu", el trigo y el maíz de las noticias de Chicago. El inglés es algo
// más grande, pero ese ya no lo usa nadie.
const HAY_BUSHELS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:bu|bushels?)\s*$/i;
const L_POR_BUSHEL = 35.23907016688;

function leerBushels(texto) {
  const m = String(texto ?? "").match(HAY_BUSHELS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "bu" };
}

function convertirBushels({ valor }) {
  return { valor: valor * L_POR_BUSHEL, a: "l" };
}

function textoBushels(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  return `${n.format(leido.valor)} bu = ${n.format(convertirBushels(leido).valor)} l`;
}

// "cd 1 peck", la fruta de los mercados de allí, que la venden por cestas. Es un
// cuarto de bushel. "pk" no lo cojo, que en las etiquetas son paquetes.
const HAY_PECKS = /^\s*(\d+(?:[.,]\d+)?)\s*pecks?\s*$/i;

function leerPecks(texto) {
  const m = String(texto ?? "").match(HAY_PECKS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "peck" };
}

function convertirPecks({ valor }) {
  return { valor: valor * L_POR_BUSHEL / 4, a: "l" };
}

function textoPecks(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  return `${n.format(leido.valor)} ${leido.valor === 1 ? "peck" : "pecks"} = ${n.format(convertirPecks(leido).valor)} l`;
}

// "cd 2 cu yd", la tierra, la grava y el hormigón de allí, que se piden por
// yardas. A m³, que en litros salen cifras de cuatro números. Y "cd 2 m³" al
// revés, para saber cuánto pedir allí.
const HAY_YARDAS_CUBICAS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:(cu\.?\s*y(?:ar)?ds?|yd³|cubic yards?|yardas? cúbicas?)|(m³|m3|metros? cúbicos?|cubic met(?:er|re)s?))\s*$/i;
const M3_POR_YARDA3 = 0.764554857984;

function leerYardasCubicas(texto) {
  const m = String(texto ?? "").match(HAY_YARDAS_CUBICAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: m[2] ? "cu yd" : "m³" };
}

function convertirYardasCubicas({ valor, de }) {
  return de === "m³" ? { valor: valor / M3_POR_YARDA3, a: "cu yd" } : { valor: valor * M3_POR_YARDA3, a: "m³" };
}

function textoYardasCubicas(leido) {
  if (!leido) return "";
  const otro = convertirYardasCubicas(leido);
  return `${numeros({ maximumFractionDigits: 1 }).format(leido.valor)} ${leido.de} = ${numeros({ maximumFractionDigits: 2 }).format(otro.valor)} ${otro.a}`;
}

// "cd 100yd", para el golf y las telas. Solo hacia los metros: "100 metros" ya
// lo cogen las alturas, y "100m" son cien millones.
const HAY_YARDAS = /^\s*(\d+(?:[.,]\d+)?)\s*(yds?|yards?|yardas?)\s*$/i;
const M_POR_YARDA = 0.9144;

function leerYardas(texto) {
  const m = String(texto ?? "").match(HAY_YARDAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "yd" };
}

function convertirYardas({ valor }) {
  return { valor: valor * M_POR_YARDA, a: "m" };
}

function textoYardas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirYardas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 10 sq yd", las alfombras y las telas. Solo hacia los m²: al revés ya
// salen los pies cuadrados, que es lo que se usa allí para los pisos.
const HAY_YARDAS_CUADRADAS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:sq\.?\s*yds?|yd²|yd2|square yards?|yardas? cuadradas?)\s*$/i;
const M2_POR_YARDA2 = M_POR_YARDA ** 2;

function leerYardasCuadradas(texto) {
  const m = String(texto ?? "").match(HAY_YARDAS_CUADRADAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: "sq yd" };
}

function convertirYardasCuadradas({ valor }) {
  return { valor: valor * M2_POR_YARDA2, a: "m²" };
}

function textoYardasCuadradas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirYardasCuadradas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 2 sq in", las baldosas, los parches y las fotos. A cm², que en m² no se lee.
// Y "cd 100 cm²" al revés.
const HAY_PULGADAS_CUADRADAS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:(sq\.?\s*in(?:ch(?:es)?)?|in²|in2|square inch(?:es)?|pulgadas? cuadradas?)|(cm²|cm2|cent[ií]metros? cuadrados?|square centimet(?:er|re)s?))\s*$/i;

function leerPulgadasCuadradas(texto) {
  const m = String(texto ?? "").match(HAY_PULGADAS_CUADRADAS);
  if (!m) return null;
  return { valor: Number(m[1].replace(",", ".")), de: m[2] ? "sq in" : "cm²" };
}

function convertirPulgadasCuadradas({ valor, de }) {
  return de === "cm²" ? { valor: valor / CM_POR_PULGADA ** 2, a: "sq in" } : { valor: valor * CM_POR_PULGADA ** 2, a: "cm²" };
}

function textoPulgadasCuadradas(leido) {
  if (!leido) return "";
  const cuanto = (n, u) => `${numeros({ maximumFractionDigits: 1 }).format(n)} ${u}`;
  const otro = convertirPulgadasCuadradas(leido);
  return `${cuanto(leido.valor, leido.de)} = ${cuanto(otro.valor, otro.a)}`;
}

// "cd 11st", el peso de la gente en Reino Unido. Muchas veces con libras
// detrás, "11 st 4 lb", como los pies y las pulgadas. Solo hacia los kilos:
// al revés ya están las libras.
const HAY_STONE = /^\s*(\d+(?:[.,]\d+)?)\s*(?:st|stones?)\s*(?:(\d+(?:[.,]\d+)?)\s*(?:lbs?|pounds?))?\s*$/i;
const LIBRAS_POR_STONE = 14;

function leerStone(texto) {
  const m = String(texto ?? "").match(HAY_STONE);
  if (!m) return null;
  const stone = Number(m[1].replace(",", "."));
  if (m[2] === undefined) return { stone, libras: 0 };
  const libras = Number(m[2].replace(",", "."));
  // 11 st 14 lb serían 12 st.
  return libras < LIBRAS_POR_STONE ? { stone, libras } : null;
}

function convertirStone({ stone, libras }) {
  return { valor: (stone * LIBRAS_POR_STONE + libras) * KG_POR_LIBRA, a: "kg" };
}

function textoStone(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  const antes = `${n.format(leido.stone)} st${leido.libras ? ` ${n.format(leido.libras)} lb` : ""}`;
  return `${antes} = ${n.format(convertirStone(leido).valor)} kg`;
}

// "cd 5 lb 4 oz", como lo dan las básculas de allí (y el peso de los bebés).
// Las dos a la vez; solas ya están las libras y las onzas.
const HAY_LIBRAS_Y_ONZAS = /^\s*(\d+(?:[.,]\d+)?)\s*(?:lbs?|pounds?|libras?)\s*(\d+(?:[.,]\d+)?)\s*(?:oz|ounces?|onzas?)\s*$/i;
const ONZAS_POR_LIBRA = 16;

function leerLibrasYOnzas(texto) {
  const m = String(texto ?? "").match(HAY_LIBRAS_Y_ONZAS);
  if (!m) return null;
  const libras = Number(m[1].replace(",", "."));
  const onzas = Number(m[2].replace(",", "."));
  // 5 lb 16 oz serían 6 lb.
  return onzas < ONZAS_POR_LIBRA ? { libras, onzas } : null;
}

function convertirLibrasYOnzas({ libras, onzas }) {
  return { valor: (libras + onzas / ONZAS_POR_LIBRA) * KG_POR_LIBRA, a: "kg" };
}

// Con dos decimales: en un bebé, cien gramos son mucho.
function textoLibrasYOnzas(leido) {
  if (!leido) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  const kg = numeros({ maximumFractionDigits: 2 }).format(convertirLibrasYOnzas(leido).valor);
  return `${n.format(leido.libras)} lb ${n.format(leido.onzas)} oz = ${kg} kg`;
}
