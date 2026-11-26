// Lo que rodea a la conversión: los pares recientes, las otras divisas, la
// chuleta, la comisión y el impuesto.

// Guardo uno más de los que enseño, porque el par que tienes puesto está en la
// lista pero no sale como pastilla. Tres pastillas caben en una fila; con
// cuatro saltaba a dos y el popup pasaba de 600 px, que es donde Chrome corta.
const RECIENTES_MAX = 4;
// Uno menos que el máximo: si fijas todos, el par nuevo no tendría dónde entrar.
const FIJOS_MAX = RECIENTES_MAX - 1;

const esPar = (p, from, to) => p.from === from && p.to === to;

// Los fijos van siempre delante y en el orden en que los fijaste; detrás, el
// resto, del último al más viejo.
function apuntarReciente(lista, from, to) {
  if (from === to) return lista;
  if (lista.some((p) => p.fijo && esPar(p, from, to))) return lista;
  const fijos = lista.filter((p) => p.fijo);
  const resto = lista.filter((p) => !p.fijo && !esPar(p, from, to));
  return [...fijos, { from, to }, ...resto].slice(0, RECIENTES_MAX);
}

function fijarReciente(lista, from, to) {
  const par = lista.find((p) => esPar(p, from, to));
  if (!par) return lista;
  const fijos = lista.filter((p) => p.fijo && !esPar(p, from, to));
  const resto = lista.filter((p) => !p.fijo && !esPar(p, from, to));
  if (par.fijo) return [...fijos, { from, to }, ...resto];
  if (fijos.length >= FIJOS_MAX) return lista;
  return [...fijos, { from, to, fijo: true }, ...resto];
}

// Lo que venga del almacenamiento no me lo creo: puede no existir (versiones
// de antes) o traer una divisa que ya he quitado del array.
function leerRecientes(guardado) {
  if (!Array.isArray(guardado)) return [];
  const buenos = guardado
    .filter((p) => p && isValidCode(p.from) && isValidCode(p.to) && p.from !== p.to)
    .slice(0, RECIENTES_MAX)
    .map(({ from, to, fijo }) => (fijo === true ? { from, to, fijo } : { from, to }));
  // Por si vienen tocados a mano: más fijos de la cuenta, el resto se suelta.
  let fijos = 0;
  return buenos.map((p) => (p.fijo && ++fijos > FIJOS_MAX ? { from: p.from, to: p.to } : p));
}

function recientesVisibles(lista, from, to) {
  return lista.filter((p) => p.from !== from || p.to !== to).slice(0, RECIENTES_MAX - 1);
}

// Más de cinco filas y el popup se hace más alto que la pantalla de un portátil.
const EXTRAS_MAX = 5;
const EXTRAS_POR_DEFECTO = ["GBP", "JPY", "CHF"];

// Si no hay nada guardado es que nunca lo has tocado: le pongo unas cuantas
// para que se vea para qué sirve. Una lista vacía guardada sí la respeto.
function leerExtras(guardado) {
  if (!Array.isArray(guardado)) return [...EXTRAS_POR_DEFECTO];
  return [...new Set(guardado.filter(isValidCode))].slice(0, EXTRAS_MAX);
}

function anadirExtra(lista, code) {
  if (!isValidCode(code) || lista.includes(code) || lista.length >= EXTRAS_MAX) return lista;
  return [...lista, code];
}

function quitarExtra(lista, code) {
  return lista.filter((c) => c !== code);
}

// Las del par que tienes puesto ya salen arriba, no las repito.
function extrasVisibles(lista, from, to) {
  return lista.filter((c) => c !== from && c !== to);
}

function disponiblesParaAnadir(lista, from, to) {
  return CURRENCIES.map((c) => c.code).filter((c) => !lista.includes(c) && c !== from && c !== to);
}

// Con comisión, lo que pagarías de verdad; sin ella (0) sale lo de siempre.
function convertirExtras(cantidad, tasas, codes, comision = 0) {
  return codes.map((code) => ({
    code,
    valor: cantidad === null || typeof tasas?.[code] !== "number" ? null : conComision(cantidad * tasas[code], comision),
  }));
}

// La API da la serie como { "2026-09-29": { GBP: 0.86, JPY: 160 }, ... }: de
// ahí saco la semana de una divisa y cuánto se ha movido del primer día al último.
function semanaDe(rates, code) {
  const valores = Object.keys(rates ?? {})
    .sort()
    .map((dia) => rates[dia]?.[code])
    .filter((v) => typeof v === "number" && v > 0);
  if (valores.length < 2) return null;
  const cambio = cambioDesde(valores[0], valores.at(-1));
  return { valores, cambio, sentido: sentidoDe(cambio) };
}

// El minigráfico de cada casilla, en una caja de 100 × 20. Va de fondo detrás
// de la cifra, así que le dejo aire arriba y abajo para que no la pise entera.
function trazoMini(valores) {
  const min = Math.min(...valores);
  const span = Math.max(...valores) - min;
  const paso = 100 / (valores.length - 1);
  const puntos = valores.map((v, i) => {
    const y = span === 0 ? 10 : 17 - ((v - min) / span) * 14;
    return `${(i * paso).toFixed(2)},${y.toFixed(2)}`;
  });
  const linea = `M${puntos.join("L")}`;
  return { linea, area: `${linea}L100,20L0,20Z` };
}

const CHULETA = [1, 5, 10, 20, 50, 100];

// Con yenes o rupias una tabla de 1 a 100 no sirve para nada (100 JPY son
// céntimos), así que la subo de diez en diez hasta que la primera fila valga
// al menos medio en la otra divisa.
function escalaChuleta(rate) {
  if (!Number.isFinite(rate) || rate <= 0) return 1;
  let escala = 1;
  while (escala * rate < 0.5) escala *= 10;
  return escala;
}

// La escala sale de la tasa sin comisión: un 3 % no debe cambiar la tabla de
// 100 a 1.000 yenes.
function chuleta(rate, comision = 0) {
  const escala = escalaChuleta(rate);
  const hay = Number.isFinite(rate) && rate > 0;
  return CHULETA.map((n) => ({ cantidad: n * escala, valor: hay ? conComision(n * escala * rate, comision) : null }));
}

// En la tienda no vas a sacar el móvil para cada precio. Busco la cuenta más
// fácil que no se aparte más de un 4 %: antes "quítale un 10 %" que "por 0,92".
const TRUCO_TOLERANCIA = 0.04;

function candidatosTruco(rate) {
  const lista = [{ tipo: "igual", factor: 1, nivel: 0 }];
  for (let pct = 5; pct <= 30; pct += 5) {
    lista.push({ tipo: "mas", pct, factor: 1 + pct / 100, nivel: 1 });
    lista.push({ tipo: "menos", pct, factor: 1 - pct / 100, nivel: 1 });
  }
  const k = Math.floor(Math.log10(rate));
  for (let e = k - 1; e <= k + 1; e++) {
    // Quitar ceros y luego multiplicar es un paso más que multiplicar sin más.
    for (let d = 1; d <= 9; d++) lista.push({ tipo: "por", d, e, factor: d * 10 ** e, nivel: d === 1 ? 1 : e < 0 ? 2.5 : 2 });
  }
  for (let d = 10; d <= 99; d++) lista.push({ tipo: "por", d, e: k - 1, factor: d * 10 ** (k - 1), nivel: 4 });
  // Dividir solo entre números de 1,5 para arriba: "divide entre 0,2" no lo hace nadie.
  const kq = Math.floor(Math.log10(1 / rate));
  for (let e = Math.max(0, kq - 1); e <= kq + 1; e++) {
    // Mitades solo por debajo de 10: "entre 7,5" sí, "entre 12,5" ya no.
    for (let d = 1.5; d <= 20; d += d < 10 ? 0.5 : 1) {
      const nivel = !Number.isInteger(d) ? 3.5 : d < 10 ? 2 : 3;
      lista.push({ tipo: "entre", d, e, factor: 1 / (d * 10 ** e), nivel });
    }
  }
  return lista;
}

function trucoDeCabeza(rate) {
  if (!Number.isFinite(rate) || rate <= 0) return null;
  const lista = candidatosTruco(rate).map((c) => ({ ...c, desvio: c.factor / rate - 1 }));
  const buenos = lista.filter((c) => Math.abs(c.desvio) <= TRUCO_TOLERANCIA);
  // Si ninguno entra en el 4 % (pasa con 1,05 o 10,5), el que menos se aparte.
  if (buenos.length === 0) return lista.reduce((a, b) => (Math.abs(b.desvio) < Math.abs(a.desvio) ? b : a));
  return buenos.reduce((a, b) =>
    b.nivel < a.nivel || (b.nivel === a.nivel && Math.abs(b.desvio) < Math.abs(a.desvio)) ? b : a);
}

function textoTruco(truco) {
  if (!truco) return "";
  const { tipo, d, e } = truco;
  if (tipo === "igual") return tr("truco.igual");
  if (tipo === "mas" || tipo === "menos") return tr(`truco.${tipo}`, { pct: tr("pct", { n: truco.pct }) });
  const numero = (n) => numeros({ maximumFractionDigits: 1 }).format(Number(n.toPrecision(6)));
  // En cifra y con × y ÷: al lado de los botones caben unas veinte letras.
  const ceros = (n) => tr(n === 1 ? "truco.ceros.1" : "truco.ceros", { n });
  if (tipo === "entre") {
    return e >= 3 ? tr("truco.quitaEntre", { ceros: ceros(e), d: numero(d) }) : tr("truco.entre", { n: numero(d * 10 ** e) });
  }
  if (d === 1) return tr(e > 0 ? "truco.pon" : "truco.quita", { ceros: ceros(Math.abs(e)) });
  if (e >= 3) return tr("truco.porPon", { d: numero(d), ceros: ceros(e) });
  if (d * 10 ** e < 1) return tr("truco.quitaPor", { ceros: ceros(-e), d: numero(d) });
  return tr("truco.por", { n: numero(d * 10 ** e) });
}

// Para que sepas cuánto te fías: lo que se aparta de la cuenta buena.
function tituloTruco(truco) {
  if (!truco) return "";
  const pct = Math.round(Math.abs(truco.desvio) * 100);
  if (pct === 0) return tr("truco.clavado");
  return tr(truco.desvio > 0 ? "truco.deMas" : "truco.deMenos", { pct: tr("pct", { n: pct }) });
}

// Entrena el ojo: un precio de allí para adivinar cuánto es. De la escala de la
// chuleta a cien veces más, repartido en logaritmo para que salgan tanto cafés
// como cenas, y a dos cifras, que en una tienda nadie pone 3.718 yenes.
function preguntaOjo(rate, azar = Math.random) {
  if (!Number.isFinite(rate) || rate <= 0) return null;
  const bruto = escalaChuleta(rate) * 10 ** (azar() * 2);
  const paso = 10 ** Math.max(Math.floor(Math.log10(bruto)) - 1, 0);
  return Math.max(Math.round(bruto / paso) * paso, 1);
}

// Clavado hasta un 5 %, que es lo que se aparta el truco de cabeza; cerca hasta
// un 15 %, que aún te dice si algo es caro o barato.
const OJO_CLAVADO = 0.05;
const OJO_CERCA = 0.15;

function notaOjo(respuesta, correcta) {
  if (!(respuesta > 0) || !(correcta > 0)) return null;
  const error = respuesta / correcta - 1;
  // Redondeado: 21 por 20 da un 5,0000000000004 % y no contaba como clavado.
  const cuanto = Math.round(Math.abs(error) * 1e6) / 1e6;
  const tono = cuanto <= OJO_CLAVADO ? "clavado" : cuanto <= OJO_CERCA ? "cerca" : "lejos";
  return { error, tono };
}

const rachaOjo = (racha, nota) => (nota && nota.tono !== "lejos" ? racha + 1 : 0);

// Para el grupo del viaje. Las filas van entre ``` para que WhatsApp las ponga
// en letra de máquina y los números queden en columna.
function chuletaParaCompartir(filas, from, to, comision = 0) {
  if (filas.length === 0 || filas.some((f) => f.valor === null)) return "";
  const entero = numeros({ maximumFractionDigits: 0 });
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const izquierda = filas.map((f) => `${entero.format(f.cantidad)} ${from}`);
  const derecha = filas.map((f) => `${dinero.format(f.valor)} ${to}`);
  const ancho = (lista) => Math.max(...lista.map((t) => t.length));
  const lineas = filas.map((_, i) => `${izquierda[i].padStart(ancho(izquierda))} = ${derecha[i].padStart(ancho(derecha))}`);
  const texto = [`*💱 ${tr("chuleta.titulo", { from, to })}*`, "```", ...lineas, "```"];
  if (comision > 0) texto.push(`_${tr("chuleta.conComision", { pct: tr("pct", { n: numeros({ maximumFractionDigits: 2 }).format(comision) }) })}_`);
  return texto.join("\n");
}

// Lo mismo en varias divisas, para el grupo. Con las banderas no va en bloque de
// código: los emojis ocupan lo que quieren y la columna no cuadraría igual.
function extrasParaCompartir(cantidad, from, filas, comision = 0) {
  if (!(cantidad > 0) || filas.length === 0 || filas.some((f) => f.valor === null)) return "";
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const texto = [
    `*💱 ${tr("extras.compartirTitulo", { cantidad: `${dinero.format(cantidad)} ${from}` })}*`,
    ...filas.map((f) => `${banderaDivisa(f.code)} ${dinero.format(f.valor)} ${f.code}`),
  ];
  if (comision > 0) texto.push(`_${tr("chuleta.conComision", { pct: tr("pct", { n: numeros({ maximumFractionDigits: 2 }).format(comision) }) })}_`);
  return texto.join("\n");
}

// La chuleta para imprimir va por la URL de su pestaña: así no depende de que el
// popup siga abierto, que se cierra en cuanto sale el diálogo de imprimir.
function urlImpresion({ from, to, rate, comision = 0, fecha = null }) {
  const p = new URLSearchParams({ from, to, rate: String(rate), comision: String(comision) });
  if (fecha) p.set("fecha", fecha);
  return `imprimir.html?${p}`;
}

function leerImpresion(busqueda) {
  const p = new URLSearchParams(busqueda);
  const from = p.get("from");
  const to = p.get("to");
  const rate = Number(p.get("rate"));
  if (!isValidCode(from) || !isValidCode(to) || from === to || !(rate > 0) || !Number.isFinite(rate)) return null;
  const fecha = p.get("fecha");
  return { from, to, rate, comision: leerComision(Number(p.get("comision"))), fecha: esIso(fecha) ? fecha : null };
}

// Por las dos caras: la de los precios de allí y la de cuánto te dan por lo tuyo.
// La vuelta va sin comisión, que es lo que recibes y no lo que pagas.
function chuletaParaImprimir({ rate, comision }) {
  return { ida: chuleta(rate, comision), vuelta: chuleta(1 / rate) };
}

// Las tarjetas normales cobran entre un 1 y un 3 %. Más de un 10 % seguro que
// es un error al teclear.
const COMISION_MAX = 10;
const COMISIONES_RAPIDAS = [0, 1, 2, 3];

const redondearComision = (pct) => Math.round(pct * 100) / 100;

// Quien viene de antes no tiene nada guardado: sin comisión, como hasta ahora.
function leerComision(guardado) {
  if (typeof guardado !== "number" || !Number.isFinite(guardado)) return 0;
  if (guardado < 0 || guardado > COMISION_MAX) return 0;
  return redondearComision(guardado);
}

function leerPorcentaje(texto, max = COMISION_MAX, redondear = redondearComision) {
  const limpio = String(texto ?? "").replace(/[\s%]/g, "").replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(limpio)) return null;
  const pct = Number(limpio);
  return pct > max ? null : redondear(pct);
}

function conComision(valor, pct) {
  if (valor === null || !Number.isFinite(valor)) return null;
  return valor * (1 + pct / 100);
}

// En Estados Unidos y Canadá la etiqueta va sin el impuesto, y cada sitio pone
// el suyo. Tres decimales porque Nueva York cobra un 8,875 %.
const IMPUESTO_MAX = 25;
const IMPUESTOS_RAPIDOS = [0, 5, 8, 10];

const redondearImpuesto = (pct) => Math.round(pct * 1000) / 1000;

function leerImpuesto(guardado) {
  if (typeof guardado !== "number" || !Number.isFinite(guardado)) return 0;
  if (guardado < 0 || guardado > IMPUESTO_MAX) return 0;
  return redondearImpuesto(guardado);
}

const leerImpuestoEscrito = (texto) => leerPorcentaje(texto, IMPUESTO_MAX, redondearImpuesto);

// El banco cobra sobre lo que pasa por caja, que ya lleva el impuesto.
function loQuePagas(valor, comision = 0, impuesto = 0) {
  return conComision(conComision(valor, impuesto), comision);
}

// Allí es lo de arriba convertido, con la comisión y el impuesto; aquí, lo que
// pone la etiqueta de tu tienda. Por debajo de un 1 % lo doy por igual: es lo
// que se mueve la tasa entre que lo miras y lo pagas.
const COMPARAR_IGUAL = 0.01;

function compararPrecios(alli, aqui) {
  if (!(alli > 0) || !(aqui > 0)) return null;
  const diferencia = aqui - alli;
  const fraccion = Math.abs(diferencia) / Math.max(alli, aqui);
  const donde = fraccion < COMPARAR_IGUAL ? "igual" : diferencia > 0 ? "alli" : "aqui";
  return { donde, ahorro: Math.abs(diferencia), fraccion };
}

// La balanza: baja el lado que cuesta más. Con un 30 % ya está del todo, que si
// no las diferencias normales casi no se notarían.
function inclinacion(comparacion, maximo = 14) {
  if (!comparacion || comparacion.donde === "igual") return 0;
  const grados = Math.min(comparacion.fraccion / 0.3, 1) * maximo;
  return comparacion.donde === "alli" ? grados : -grados;
}

// Todo a gramos, mililitros o unidades, para poder dividir. La onza a secas es
// la de peso; la de líquidos lleva su "fl" delante.
const TAMANOS = {
  mg: [0.001, "peso"], g: [1, "peso"], kg: [1000, "peso"], oz: [28.3495231, "peso"], lb: [453.59237, "peso"],
  ml: [1, "volumen"], cl: [10, "volumen"], dl: [100, "volumen"], l: [1000, "volumen"],
  floz: [29.5735296, "volumen"], gal: [3785.41178, "volumen"],
  ud: [1, "unidades"],
};
const POR_MAGNITUD = { peso: [1000, "kg"], volumen: [1000, "l"], unidades: [1, "ud"] };

const HAY_TAMANO = /\s*(fl\.?\s*oz|kg|kilos?|mg|gr?s?|gramos?|oz|onzas?|lbs?|libras?|ml|cl|dl|l|lt|litros?|gal(?:ones|lons?|[oó]n)?|uds?|u|unidades?|units?|pcs|piezas?)\.?\s*$/i;

function unidadTamano(u) {
  const t = u.toLowerCase().replace(/[\s.]/g, "");
  if (t.startsWith("fl")) return "floz";
  if (/^(kg|kilo)/.test(t)) return "kg";
  if (t === "mg") return "mg";
  if (t.startsWith("gal")) return "gal";
  if (/^(g|gr|gram)/.test(t)) return "g";
  if (/^(oz|onza)/.test(t)) return "oz";
  if (/^(lb|libra)/.test(t)) return "lb";
  if (["ml", "cl", "dl"].includes(t)) return t;
  if (/^(l|lt|litro)/.test(t)) return "l";
  return "ud";
}

// "500 g", "1,5 l", "6 x 330 ml" o "12": sin unidad son unidades, los huevos o
// las latas. El "6 x" va con la cuenta de siempre.
function leerTamano(texto) {
  const t = String(texto ?? "").trim();
  if (!t) return null;
  const m = t.match(HAY_TAMANO);
  const resto = m && m.index > 0 ? t.slice(0, m.index) : t;
  if (m && m.index === 0) return null;
  const n = evaluar(resto.trim());
  if (!(n > 0)) return null;
  const [factor, magnitud] = TAMANOS[m ? unidadTamano(m[1]) : "ud"];
  return { cantidad: n * factor, magnitud };
}

// Lo que sale el kilo, el litro o la unidad de cada uno. El porcentaje va sobre
// el caro, como en la balanza, y por debajo de un 1 % lo doy por igual.
function compararTamanos(a, b) {
  const ta = leerTamano(a?.tamano);
  const tb = leerTamano(b?.tamano);
  if (!(a?.precio > 0) || !(b?.precio > 0) || !ta || !tb) return null;
  if (ta.magnitud !== tb.magnitud) return { donde: "distinto" };
  const [base, unidad] = POR_MAGNITUD[ta.magnitud];
  const porA = (a.precio / ta.cantidad) * base;
  const porB = (b.precio / tb.cantidad) * base;
  const fraccion = Math.abs(porA - porB) / Math.max(porA, porB);
  const donde = fraccion < COMPARAR_IGUAL ? "igual" : porA < porB ? "a" : "b";
  return { donde, porA, porB, unidad, fraccion };
}

// Lo que te cuesta un café en casa, para hacerte a la idea de lo que vale algo.
// Va con su divisa: 1,50 en euros no es lo mismo que 1,50 en libras.
function leerCafe(guardado) {
  const { precio, divisa } = guardado ?? {};
  if (!Number.isFinite(precio) || precio <= 0 || !isValidCode(divisa)) return null;
  return { precio: Math.round(precio * 100) / 100, divisa };
}

// Cuántos cafés son, con la cantidad de cualquiera de los dos lados que vaya en
// la divisa del café. Menos de medio no lo digo, que no ayuda.
function enCafes(cafe, cantidades) {
  if (!cafe) return null;
  const suya = cantidades.find((c) => c.divisa === cafe.divisa && Number.isFinite(c.valor));
  if (!suya) return null;
  const n = suya.valor / cafe.precio;
  if (n < 0.5) return null;
  return n < 0.75 ? 0.5 : Math.round(n);
}

function textoCafes(n) {
  if (n === null) return "";
  if (n === 0.5) return tr("cafe.medio");
  if (n === 1) return tr("cafe.uno");
  return tr("cafe.varios", { n: numeros({ maximumFractionDigits: 0 }).format(n) });
}

const HORAS_JORNADA = 8;

// Lo que ganas a la hora, con su divisa como el café. Más de cinco minutos para
// que salga: por debajo es calderilla.
function enHoras(hora, cantidades) {
  if (!hora) return null;
  const suya = cantidades.find((c) => c.divisa === hora.divisa && Number.isFinite(c.valor));
  if (!suya) return null;
  const min = (suya.valor / hora.precio) * 60;
  if (min < 5) return null;
  if (min < 60) return Math.round(min / 5) * 5;
  if (min < HORAS_JORNADA * 60 * 2) return Math.round(min / 30) * 30;
  // De dos jornadas en adelante ya se piensa en días, de medio en medio.
  return Math.round(min / (HORAS_JORNADA * 30)) * HORAS_JORNADA * 30;
}

function textoHoras(min, corto = false) {
  if (min === null) return "";
  const n = numeros({ maximumFractionDigits: 1 });
  const sufijo = corto ? ".corto" : "";
  if (min < 60) return tr(`horas.min${sufijo}`, { n: n.format(min) });
  if (min < HORAS_JORNADA * 60 * 2) return tr(`horas.h${sufijo}`, { n: n.format(min / 60) });
  return tr(`horas.dias${sufijo}`, { n: n.format(min / 60 / HORAS_JORNADA) });
}

// El cuentakilómetros del resultado. Cada dígito gira lo que giraría en uno de
// verdad: el de los céntimos pasa por todos y el de los miles casi no se mueve.
// Más de 19 pasos no se distinguen, así que se quedan en una vuelta y pico.
const RODILLO_MAX = 19;

function rodillo(desde, hasta, texto, decimales = 2) {
  const escala = 10 ** decimales;
  const a = Math.round(Math.abs(desde) * escala);
  const b = Math.round(Math.abs(hasta) * escala);
  // Las cifras que antes no estaban salen de vacío: un "0.109,35" no lo escribe nadie.
  const habia = Math.max(String(a).length, decimales + 1);
  let p = 0;
  const columnas = [...texto].reverse().map((c) => {
    if (!/\d/.test(c)) return { signo: c };
    const de = Math.floor(a / 10 ** p);
    const pasos = Math.floor(b / 10 ** p) - de;
    const nueva = p >= habia;
    p++;
    const n = Math.abs(pasos) > RODILLO_MAX ? Math.sign(pasos) * (10 + (Math.abs(pasos) % 10)) : pasos;
    const cifras = Array.from({ length: Math.abs(n) + 1 }, (_, k) => (((de + Math.sign(n) * k) % 10) + 10) % 10);
    if (nueva) cifras[0] = null;
    return { cifras };
  }).reverse();
  // El punto de los miles llega con la cifra que tiene a la izquierda.
  return columnas.map((c, i) => (c.signo && columnas[i - 1]?.cifras?.[0] === null ? { ...c, nuevo: true } : c));
}

// Las letras del par, como las de un panel de salidas: siempre giran hacia
// delante y de la Z vuelven a la A. De USD a EUR la U daría 10 vueltas; con 8
// ya se ve que gira y no hace esperar, así que empieza más cerca.
const PANEL_MAX = 8;

function panelSalidas(antes, despues) {
  const A = "A".charCodeAt(0);
  return [...despues].map((letra, i) => {
    const de = antes[i];
    if (!de || de === letra || !/[A-Z]/.test(de) || !/[A-Z]/.test(letra)) return [letra];
    const pasos = (letra.charCodeAt(0) - de.charCodeAt(0) + 26) % 26;
    const desde = pasos > PANEL_MAX ? pasos - PANEL_MAX : 0;
    return Array.from({ length: pasos - desde + 1 }, (_, k) =>
      String.fromCharCode(A + ((de.charCodeAt(0) - A + desde + k) % 26)));
  });
}
