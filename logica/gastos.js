// El historial de conversiones y los gastos, uno a uno.

// Diez: más y ya no es "lo último que convertí", es un registro que nadie mira.
const HISTORIAL_MAX = 10;

const esEntradaBuena = (e) => Boolean(e) && isValidCode(e.from) && isValidCode(e.to)
  && Number.isFinite(e.cantidad) && Number.isFinite(e.resultado) && Number.isFinite(e.cuando);

function leerHistorial(guardado) {
  if (!Array.isArray(guardado)) return [];
  return guardado.filter(esEntradaBuena).slice(0, HISTORIAL_MAX);
}

// Si vuelves a convertir lo mismo no sale dos veces: sube arriba con la hora
// nueva. El resultado se guarda tal cual salió, con la tasa de aquel día.
function apuntarConversion(lista, entrada) {
  if (!esEntradaBuena(entrada) || entrada.cantidad <= 0) return lista;
  const { from, to, cantidad, resultado, cuando } = entrada;
  const otra = (e) => !(e.from === from && e.to === to && e.cantidad === cantidad);
  return [{ from, to, cantidad, resultado, cuando }, ...lista.filter(otra)].slice(0, HISTORIAL_MAX);
}

// No llevan id: el par y la cantidad ya no se repiten, apuntarConversion se encarga.
function quitarConversion(lista, { from, to, cantidad }) {
  return lista.filter((e) => !(e.from === from && e.to === to && e.cantidad === cantidad));
}

// Los días van por calendario y no de 24 en 24 horas: lo de anoche a las once
// es "ayer" aunque sean las nueve de la mañana.
function haceCuanto(cuando, ahora = Date.now()) {
  const min = Math.floor((ahora - cuando) / 60000);
  if (min < 1) return tr("hace.ahora");
  if (min < 60) return tr("hace.min", { n: min });
  const dia = (t) => new Date(t).setHours(0, 0, 0, 0);
  const dias = Math.round((dia(ahora) - dia(cuando)) / 86400000);
  if (dias === 0) return tr("hace.horas", { n: Math.floor(min / 60) });
  if (dias === 1) return tr("hace.ayer");
  if (dias < 7) return tr("hace.dias", { n: dias });
  return fechaCorta(isoLocal(new Date(cuando)), new Date(ahora).getFullYear());
}

// Para darte cuenta de que se te ha pasado apuntar algo. Antes de una hora no
// lo digo: acabas de apuntar y no hay nada que recordar.
function ultimoDeHoy(gastos, ahora = Date.now()) {
  const hoyIso = isoLocal(new Date(ahora));
  // Las noches de hotel van a días que aún no han llegado: esas no cuentan.
  const deHoy = gastos.filter((g) => g.cuando <= ahora && isoLocal(new Date(g.cuando)) === hoyIso);
  if (deHoy.length === 0) return null;
  const ultimo = Math.max(...deHoy.map((g) => g.cuando));
  return ahora - ultimo >= 3600000 ? ultimo : null;
}

// Doscientos dan para un viaje largo comiendo fuera todos los días; más y el
// almacenamiento se llena de cafés de hace un año.
const GASTOS_MAX = 200;
const CONCEPTO_MAX = 40;

// Pocas y gordas: con más, elegir cuesta más que apuntar el gasto.
const CATEGORIAS = ["comida", "transporte", "alojamiento", "ocio", "compras", "otros"];
const CATEGORIA_POR_DEFECTO = "otros";

// Las tuyas, además de las seis: "Buceo", "Regalos". Tres como mucho, que con
// más el abanico no cabe en el popup. El gasto guarda el id y no el nombre,
// así cambiarle el nombre no toca ningún gasto.
const CATEGORIAS_PROPIAS_MAX = 3;
const NOMBRE_CATEGORIA_MAX = 14;
const ID_PROPIA = /^p-[a-z0-9]{1,16}$/;

// Vale por la forma y no por la lista: si el gasto llega antes que la lista
// (otra pestaña, una copia a medias), no lo mando a "otros" para siempre.
const esCategoria = (c) => CATEGORIAS.includes(c) || (typeof c === "string" && ID_PROPIA.test(c));

function leerCategoriasPropias(guardado) {
  if (!Array.isArray(guardado)) return [];
  const vistos = new Set();
  return guardado
    .filter((c) => c && ID_PROPIA.test(c.id) && !vistos.has(c.id) && vistos.add(c.id))
    .map((c) => ({ id: c.id, nombre: String(c.nombre ?? "").replace(/\s+/g, " ").trim().slice(0, NOMBRE_CATEGORIA_MAX) }))
    .filter((c) => c.nombre)
    .slice(0, CATEGORIAS_PROPIAS_MAX);
}

// Como el idioma: cada página la pone al cargar, y los nombres salen de aquí.
let categoriasPropias = [];
function ponerCategoriasPropias(guardado) {
  categoriasPropias = leerCategoriasPropias(guardado);
  return categoriasPropias;
}

const todasCategorias = () => [...CATEGORIAS, ...categoriasPropias.map((c) => c.id)];
const propia = (c) => categoriasPropias.find((p) => p.id === c);

// La que ya no está sale como "Otros", que es donde acabaría.
function nombreCategoria(c) {
  if (CATEGORIAS.includes(c)) return tr(`cat.${c}`);
  return propia(c)?.nombre ?? tr(`cat.${CATEGORIA_POR_DEFECTO}`);
}

const emojiCategoria = (c) => EMOJI_CATEGORIA[c] ?? (propia(c) ? "🏷️" : EMOJI_CATEGORIA[CATEGORIA_POR_DEFECTO]);

// Si ya hay una que se llama igual, sea tuya o de las seis, no hace falta otra.
function crearCategoriaPropia(lista, { id, nombre }) {
  const actuales = leerCategoriasPropias(lista);
  const [nueva] = leerCategoriasPropias([{ id, nombre }]);
  if (!nueva || actuales.length >= CATEGORIAS_PROPIAS_MAX || actuales.some((c) => c.id === id)) return actuales;
  const clave = normalizar(nueva.nombre);
  const repetida = actuales.some((c) => normalizar(c.nombre) === clave) || CATEGORIAS.some((c) => normalizar(tr(`cat.${c}`)) === clave);
  return repetida ? actuales : [...actuales, nueva];
}

const quitarCategoriaPropia = (lista, id) => leerCategoriasPropias(lista).filter((c) => c.id !== id);

// Al quitar una, sus gastos, sus pendientes y su tope pasan a "otros", en
// todos los viajes, también los archivados. Si "otros" ya tenía tope, se suman.
function sinCategoria(viajes, id) {
  const cambiar = (v) => {
    const gastos = v.gastos.map((g) => (g.categoria === id ? { ...g, categoria: CATEGORIA_POR_DEFECTO } : g));
    const pendientes = v.pendientes?.map((p) => (p.categoria === id ? { ...p, categoria: CATEGORIA_POR_DEFECTO } : p));
    const empresa = v.empresa?.map((g) => (g.categoria === id ? { ...g, categoria: CATEGORIA_POR_DEFECTO } : g));
    let presupuesto = v.presupuesto;
    const tope = presupuesto?.categorias?.[id];
    if (tope) {
      const { [id]: _, ...resto } = presupuesto.categorias;
      const categorias = { ...resto, [CATEGORIA_POR_DEFECTO]: (resto[CATEGORIA_POR_DEFECTO] ?? 0) + tope };
      presupuesto = { ...presupuesto, categorias };
    }
    return { ...v, gastos, presupuesto, ...(pendientes ? { pendientes } : {}), ...(empresa ? { empresa } : {}) };
  };
  const nuevos = { ...viajes, lista: viajes.lista.map(cambiar) };
  return viajes.archivados ? { ...nuevos, archivados: viajes.archivados.map(cambiar) } : nuevos;
}

// El transporte va antes que la comida para que "barco" no se quede en "bar".
// Las raíces cortas van con \b detrás, que si no "bar" se comía "barato".
const PISTAS_CATEGORIA = [
  ["transporte", /\b(taxi|uber|cabify|bolt|lyft|metro\b|bus\b|autobus|tren|train|vuelo|avion|flight|barco|ferry|gasolina|fuel|parking|aparcamiento|peaje|toll|bici|bike|alquiler de coche|car rental)/],
  ["alojamiento", /\b(hotel|hostal|hostel|airbnb|apartamento|alojamiento|booking|motel|camping|habitacion|room\b)/],
  ["comida", /\b(cena|comida|almuerzo|desayuno|cafe|restaurante|bar\b|tapas|cerveza|vino|pizza|super\b|supermercado|helado|menu|dinner|lunch|breakfast|coffee|food|restaurant|beer|wine|groceries|snack|brunch)/],
  ["ocio", /\b(museo|museum|entrada|ticket|concierto|concert|cine|cinema|tour|excursion|parque|park|teatro|theat|discoteca|club|espectaculo|show\b|visita)/],
  ["compras", /\b(tienda|compra|ropa|regalo|souvenir|recuerdo|shop|gift|clothes|zapat|shoes|farmacia|pharmacy|mercado|market)/],
];

function adivinarCategoria(concepto) {
  const texto = normalizar(String(concepto ?? ""));
  return PISTAS_CATEGORIA.find(([, patron]) => patron.test(texto))?.[0] ?? null;
}

// Los conceptos que ya has usado: el más repetido primero y, si empatan, el
// último. Me quedo con la categoría del último, que si la cambiaste a mano es esa.
function conceptosUsados(gastos) {
  return contarConceptos(gastos).map(({ concepto, categoria }) => ({ concepto, categoria }));
}

function contarConceptos(gastos) {
  const vistos = new Map();
  for (const g of gastos) {
    const concepto = limpiarConcepto(g.concepto);
    if (!concepto) continue;
    const clave = normalizar(concepto);
    const visto = vistos.get(clave);
    if (!visto) vistos.set(clave, { concepto, categoria: g.categoria, veces: 1, cuando: g.cuando });
    else {
      visto.veces += 1;
      if (g.cuando > visto.cuando) Object.assign(visto, { concepto, categoria: g.categoria, cuando: g.cuando });
    }
  }
  return [...vistos.values()]
    .sort((a, b) => b.veces - a.veces || b.cuando - a.cuando)
    .map(({ concepto, categoria, veces }) => ({ concepto, categoria: categoriaBuena(categoria), veces }));
}

// Los de siempre, para ponerlos con un clic con el campo aún vacío. Desde dos
// veces, que uno suelto no es costumbre; las noches repartidas no cuentan.
const FRECUENTES_MAX = 4;
function conceptosFrecuentes(gastos, max = FRECUENTES_MAX) {
  return contarConceptos(gastos.filter((g) => !/^\d+\/\d+(?: ·|$)/.test(g.concepto ?? "")))
    .filter((c) => c.veces >= 2)
    .slice(0, max)
    .map(({ concepto, categoria }) => ({ concepto, categoria }));
}

// Con una letra sola saldría siempre lo mismo, así que espero a la segunda.
function completarConcepto(texto, usados) {
  const escrito = String(texto ?? "");
  if (escrito.trim().length < 2) return null;
  const clave = normalizar(escrito);
  const hallado = usados.find((u) => u.concepto.length > escrito.length && normalizar(u.concepto).startsWith(clave));
  if (!hallado) return null;
  return { ...hallado, resto: hallado.concepto.slice(escrito.length) };
}

// En efectivo ya cambiaste antes en la casa de cambio: el banco no cobra nada.
// Los de antes no lo dicen, y llevan la comisión dentro, así que son con tarjeta.
const PAGOS = ["tarjeta", "efectivo"];
const PAGO_POR_DEFECTO = "tarjeta";
const leerPago = (pago) => (PAGOS.includes(pago) ? pago : PAGO_POR_DEFECTO);
const comisionDelPago = (pago, comision) => (pago === "efectivo" ? 0 : comision);

// Una tarjeta es un nombre y su comisión, y la elegida es la que tiene la comisión
// puesta: así la web, la barra y los gastos siguen leyendo un solo número.
const TARJETAS_MAX = 4;
const NOMBRE_TARJETA_MAX = 14;

// Dos al mismo porcentaje no: serían la misma cuenta y no sabría cuál llevas.
function anadirTarjeta(lista, nombre, comision) {
  const limpio = String(nombre ?? "").replace(/\s+/g, " ").trim().slice(0, NOMBRE_TARJETA_MAX);
  if (!limpio || typeof comision !== "number" || !(comision >= 0 && comision <= COMISION_MAX) || lista.length >= TARJETAS_MAX) return null;
  const pct = redondearComision(comision);
  if (lista.some((t) => t.comision === pct || normalizar(t.nombre) === normalizar(limpio))) return null;
  return [...lista, { nombre: limpio, comision: pct }];
}

function leerTarjetas(guardado) {
  if (!Array.isArray(guardado)) return [];
  return guardado.reduce((lista, t) => anadirTarjeta(lista, t?.nombre, t?.comision) ?? lista, []);
}

const quitarTarjeta = (lista, nombre) => lista.filter((t) => t.nombre !== nombre);

const tarjetaActual = (lista, comision) => lista.find((t) => t.comision === comision) ?? null;

// Con menos de dos, tarjeta y efectivo como siempre. Con la comisión puesta a
// mano no hay ninguna elegida, y empieza por la primera.
function siguientePago({ pago, comision }, tarjetas) {
  if (tarjetas.length < 2) return { pago: pago === "efectivo" ? "tarjeta" : "efectivo", comision };
  if (pago === "efectivo") return { pago: "tarjeta", comision: tarjetas[0].comision };
  const i = tarjetas.findIndex((t) => t.comision === comision);
  return i === tarjetas.length - 1 ? { pago: "efectivo", comision } : { pago: "tarjeta", comision: tarjetas[i + 1].comision };
}

// Por menos de un céntimo no merece la pena decir nada.
function mejorTarjeta(tarjetas, comision, base) {
  if (tarjetas.length < 2 || !(base > 0)) return null;
  const tarjeta = tarjetas.reduce((mejor, t) => (t.comision < mejor.comision ? t : mejor));
  const ahorro = Math.round((conComision(base, comision) - conComision(base, tarjeta.comision)) * 100) / 100;
  return ahorro >= 0.01 ? { tarjeta, ahorro } : null;
}

const categoriaBuena = (c) => (esCategoria(c) ? c : CATEGORIA_POR_DEFECTO);

const esGastoBueno = (g) => Boolean(g) && typeof g.id === "string" && isValidCode(g.from) && isValidCode(g.to)
  // Las devoluciones van en negativo, las dos cifras a la vez.
  && Number.isFinite(g.cantidad) && Number.isFinite(g.valor) && (g.cantidad > 0 ? g.valor >= 0 : g.cantidad < 0 && g.valor <= 0)
  && Number.isFinite(g.cuando) && typeof g.concepto === "string";

// El valor se guarda ya convertido, con la tasa y la comisión de ese día. Si lo
// calculara al enseñarlo, el cambio de hoy me movería lo que gasté hace una semana.
const limpiarConcepto = (concepto) => String(concepto ?? "").replace(/\s+/g, " ").trim().slice(0, CONCEPTO_MAX);

// Quién lo pagó, por su sitio en la lista de gente del viaje. El 0 eres tú y
// no lo guardo: así los gastos de antes y los tuyos quedan como estaban.
const leerPagador = (p) => (Number.isInteger(p) && p > 0 && p < PERSONAS_MAX ? p : 0);

// Quiénes entran en un gasto, cuando no sois todos: el museo de dos de los
// cuatro. Sin esto, entran todos, que es lo que traen los de antes.
function leerEntre(entre) {
  if (!Array.isArray(entre)) return null;
  const buenos = [...new Set(entre.filter((i) => Number.isInteger(i) && i >= 0 && i < PERSONAS_MAX))].sort((a, b) => a - b);
  return buenos.length ? buenos : null;
}

// Con la gente de ahora. Igual que con el pagador, el que ya no está cuenta
// como tú, y si al final entran todos es como no decir nada.
function entreDe(gasto, personas) {
  const n = leerPersonas(personas);
  const entre = leerEntre(gasto.entre);
  if (!entre) return null;
  const ahora = [...new Set(entre.map((i) => (i < n ? i : 0)))];
  return ahora.length < n ? ahora : null;
}

// Lo que cuenta cada uno en un gasto: la pareja, 2; el niño, ½. Solo guardo a
// quien no cuenta 1, así los gastos de antes no cambian.
const PARTES_VALIDAS = [1, 2, 3, 0.5];

function leerPartes(partes) {
  if (!partes || typeof partes !== "object" || Array.isArray(partes)) return null;
  const buenas = Object.entries(partes).filter(([i, p]) => {
    const quien = Number(i);
    return Number.isInteger(quien) && quien >= 0 && quien < PERSONAS_MAX && p !== 1 && PARTES_VALIDAS.includes(p);
  });
  return buenas.length ? Object.fromEntries(buenas) : null;
}

const quienesEntran = (gasto, n) => entreDe(gasto, n) ?? [...Array(n).keys()];

// Si todos cuentan lo mismo, aunque sea 2, es a partes iguales.
function partesDe(gasto, personas) {
  const n = leerPersonas(personas);
  const guardadas = leerPartes(gasto.partes);
  if (!guardadas) return null;
  const entran = quienesEntran(gasto, n);
  if (new Set(entran.map((i) => guardadas[i] ?? 1)).size < 2) return null;
  return Object.fromEntries(entran.filter((i) => guardadas[i]).map((i) => [i, guardadas[i]]));
}

const esRepartoDesigual = (gasto, n) => Boolean(entreDe(gasto, n) || partesDe(gasto, n));

const textoParte = (p) => (p === 0.5 ? "½" : String(p));

// "Solo Ana y tú": tú al final, que es como se dice.
function fraseEntre(entre, gente, partes = null, todos = false) {
  const conParte = (i, nombre) => (partes?.[i] ? `${nombre} ×${textoParte(partes[i])}` : nombre);
  const nombres = entre.filter((i) => i !== 0).map((i) => conParte(i, nombrePersona(gente, i)));
  if (entre.includes(0)) nombres.push(conParte(0, tr("entre.tu")));
  const lista = new Intl.ListFormat(localeActual(), { type: "conjunction" }).format(nombres);
  return todos ? lista : tr("entre.solo", { nombres: lista });
}

function cambiarEntre(gastos, id, entre, personas, partes = null) {
  const gasto = gastos.find((g) => g.id === id);
  if (!gasto) return gastos;
  const nuevo = entreDe({ entre }, personas);
  const nuevas = partesDe({ entre, partes }, personas);
  if (String(nuevo) === String(entreDe(gasto, personas))
    && JSON.stringify(nuevas) === JSON.stringify(partesDe(gasto, personas))) return gastos;
  return gastos.map((g) => {
    if (g.id !== id) return g;
    const { entre: _, partes: __, ...resto } = g;
    return { ...resto, ...(nuevo ? { entre: nuevo } : {}), ...(nuevas ? { partes: nuevas } : {}) };
  });
}

// Lo que no cabe en el concepto: "pagó Ana", "pedir factura". Una línea.
const NOTA_MAX = 80;
const limpiarNota = (nota) => String(nota ?? "").replace(/\s+/g, " ").trim().slice(0, NOTA_MAX);

function crearGasto({ id, from, to, cantidad, valor, concepto = "", cuando, categoria, pago, comision, pagador, fijo, nota, entre, partes }) {
  // Al céntimo: con la comisión salía 90,5148 y en el CSV se veía la cola.
  const gasto = {
    id, from, to, cantidad, cuando,
    valor: Number.isFinite(valor) ? Math.round(valor * 100) / 100 : valor,
    concepto: limpiarConcepto(concepto),
    categoria: categoriaBuena(categoria),
    pago: leerPago(pago),
    comision: leerComision(comision),
  };
  if (leerPagador(pagador)) gasto.pagador = leerPagador(pagador);
  if (fijo === true) gasto.fijo = true;
  if (limpiarNota(nota)) gasto.nota = limpiarNota(nota);
  if (leerEntre(entre)) gasto.entre = leerEntre(entre);
  if (leerPartes(partes)) gasto.partes = leerPartes(partes);
  return esGastoBueno(gasto) && from !== to ? gasto : null;
}

const esDevolucion = (g) => g.cantidad < 0;

// Lo que te devuelven: la compra que llevas a la tienda, la fianza del piso. Va
// en negativo, así resta del total, del día y de su categoría sin tocar nada
// más. Al cambio de aquel día pero sin la comisión, que el banco no la devuelve.
function devolucionDe(gasto, { id, cuando }) {
  if (!esGastoBueno(gasto) || !(gasto.cantidad > 0)) return null;
  const sinComision = gasto.valor / (1 + leerComision(gasto.comision) / 100);
  const devuelto = crearGasto({
    id, cuando, from: gasto.from, to: gasto.to, cantidad: -gasto.cantidad, valor: -sinComision,
    concepto: gasto.concepto, categoria: gasto.categoria, pago: gasto.pago, comision: 0, pagador: gasto.pagador, entre: gasto.entre, partes: gasto.partes,
  });
  return devuelto && Number.isFinite(gasto.alBce) ? { ...devuelto, alBce: -gasto.alBce } : devuelto;
}

function leerGastos(guardado) {
  if (!Array.isArray(guardado)) return [];
  // Los de antes de las categorías no traen ninguna: la saco del concepto, como
  // al apuntarlos, y si no dice nada van a "otros".
  return guardado.filter(esGastoBueno).slice(0, GASTOS_MAX).map(({ pagador, fijo, nota, entre, partes, alBce, ...g }) => ({
    ...g,
    categoria: esCategoria(g.categoria) ? g.categoria : adivinarCategoria(g.concepto) ?? CATEGORIA_POR_DEFECTO,
    pago: leerPago(g.pago),
    // Los de antes no la guardaban: ya va dentro del valor y no sé cuánta era.
    comision: leerComision(g.comision),
    ...(leerPagador(pagador) ? { pagador: leerPagador(pagador) } : {}),
    ...(fijo === true ? { fijo: true } : {}),
    ...(typeof nota === "string" && limpiarNota(nota) ? { nota: limpiarNota(nota) } : {}),
    ...(leerEntre(entre) ? { entre: leerEntre(entre) } : {}),
    ...(leerPartes(partes) ? { partes: leerPartes(partes) } : {}),
    ...(Number.isFinite(alBce) && Math.sign(alBce) === Math.sign(g.valor) ? { alBce } : {}),
  }));
}

// En qué se va el dinero, solo en la divisa que más suma: mezclar euros con
// dólares en los mismos porcentajes no tiene sentido.
function desglose(gastos) {
  const [principal] = sumarPorDivisa(gastos);
  if (!principal || principal.total <= 0) return [];
  const totales = new Map();
  for (const g of gastos) {
    if (g.to === principal.to) totales.set(g.categoria, (totales.get(g.categoria) ?? 0) + g.valor);
  }
  return [...totales]
    .map(([categoria, total]) => ({ categoria, total, fraccion: total / principal.total, to: principal.to }))
    .filter((d) => d.total > 0)
    .sort((a, b) => b.total - a.total);
}

function apuntarGasto(lista, gasto) {
  if (!esGastoBueno(gasto)) return lista;
  return [gasto, ...lista].slice(0, GASTOS_MAX);
}

// El hotel de cinco noches, uno por noche desde el día que lo pagas. Si no,
// ese día parecería carísimo y la media y la corona se volverían locas.
const NOCHES_MAX = 30;

// Los céntimos que no se reparten justos van a la primera noche: así la suma
// es exacta y no aparece ni se pierde un céntimo.
function repartirCentimos(total, n) {
  const centimos = Math.round(total * 100);
  const base = Math.floor(centimos / n);
  return Array.from({ length: n }, (_, i) => (base + (i < centimos - base * n ? 1 : 0)) / 100);
}

// En céntimos enteros. Los que sobran van a quien más decimales perdió, y si
// empatan, al primero: con todos a 1 sale lo mismo que repartirCentimos.
function repartirPorPartes(centimos, pesos) {
  // Por dos para que el ½ también sea un entero y no se cuelen decimales.
  const enteros = pesos.map((p) => p * 2);
  const suma = enteros.reduce((a, b) => a + b, 0);
  const base = enteros.map((p) => Math.floor((centimos * p) / suma));
  const sobran = centimos - base.reduce((a, b) => a + b, 0);
  const orden = enteros.map((p, i) => ({ i, resto: centimos * p - base[i] * suma }))
    .sort((a, b) => b.resto - a.resto || a.i - b.i);
  orden.slice(0, sobran).forEach(({ i }) => { base[i] += 1; });
  return base;
}

function repartirNoches(gasto, noches) {
  if (!esGastoBueno(gasto) || esDevolucion(gasto) || !Number.isInteger(noches) || noches < 2 || noches > NOCHES_MAX) return [gasto];
  const cantidades = repartirCentimos(gasto.cantidad, noches);
  const valores = repartirCentimos(gasto.valor, noches);
  const alBce = Number.isFinite(gasto.alBce) ? repartirCentimos(gasto.alBce, noches) : null;
  const antes = new Date(gasto.cuando);
  return cantidades.map((cantidad, i) => {
    // La noche delante: el concepto se corta por la derecha en la lista.
    const marca = `${i + 1}/${noches}`;
    return {
      ...gasto,
      id: `${gasto.id}-${i + 1}`,
      cantidad,
      valor: valores[i],
      ...(alBce ? { alBce: alBce[i] } : {}),
      concepto: gasto.concepto ? `${marca} · ${gasto.concepto}`.slice(0, CONCEPTO_MAX) : marca,
      // Con la fecha local y no sumando milisegundos: el día del cambio de hora tiene 23 horas.
      cuando: new Date(antes.getFullYear(), antes.getMonth(), antes.getDate() + i,
        antes.getHours(), antes.getMinutes(), antes.getSeconds(), antes.getMilliseconds()).getTime(),
    };
  });
}

// Lo que se paga una vez y se usa varios días: el coche, el abono del metro, el
// forfait o la eSIM. Por el concepto, que la categoría no basta: un taxi
// también es transporte y no tiene sentido repartirlo.
const PISTAS_POR_DIAS = /\b(alquiler|rent|rental|coche|car\b|moto\b|scooter|bici|bike|abono|pase\b|pass\b|forfait|bono\b|semanal|mensual|weekly|monthly|sim\b|esim|e-sim|wifi|roaming)/;

// "noches" para el alojamiento, como siempre; "dias" para lo demás que dura.
function repartoPorDias(categoria, concepto) {
  if (categoria === "alojamiento") return "noches";
  return PISTAS_POR_DIAS.test(normalizar(String(concepto ?? ""))) ? "dias" : null;
}

function apuntarNoches(lista, noches) {
  const buenas = noches.filter(esGastoBueno);
  if (buenas.length === 0) return lista;
  return [...buenas, ...lista].sort((x, y) => y.cuando - x.cuando).slice(0, GASTOS_MAX);
}

// Lo que sabes que vas a pagar y aún no: el hotel que se paga al salir, la
// cena ya reservada. Va con lo que valía al apuntarlo, y al pagarlo pasa a
// gasto con la tasa y la comisión de ese día.
const PENDIENTES_MAX = 30;

// El día que toca pagarlo. Es opcional: los de antes no lo traen.
const leerVence = (vence) => (esIso(vence) && isoLocal(new Date(`${vence}T12:00:00`)) === vence ? vence : null);

function leerPendientes(guardado) {
  return leerGastos(guardado).filter((p) => p.cantidad > 0).slice(0, PENDIENTES_MAX)
    .map(({ vence, ...p }) => (leerVence(vence) ? { ...p, vence } : p));
}

function apuntarPendiente(lista, pendiente) {
  const buenos = leerPendientes(lista);
  if (!pendiente || !(pendiente.cantidad > 0) || buenos.length >= PENDIENTES_MAX || buenos.some((p) => p.id === pendiente.id)) return buenos;
  return [...buenos, pendiente];
}

const quitarPendiente = (lista, id) => leerPendientes(lista).filter((p) => p.id !== id);

const totalPendiente = (lista, to) => leerPendientes(lista).filter((p) => p.to === to).reduce((suma, p) => suma + p.valor, 0);

// Lo pendiente se guarda con la tasa del día en que lo apuntas, pero lo pagarás
// con la del día que toque. Cuánto vale hoy y, con lo que suele moverse el par
// en un mes (el ± del gráfico), cuánto te puede bailar. Solo lo del par que
// tienes puesto, que es la tasa que tengo.
function exposicionPendientes(lista, { from, to, rate, pct = null }) {
  if (from === to || !(rate > 0)) return null;
  const suyos = leerPendientes(lista).filter((p) => p.from === from && p.to === to);
  if (suyos.length === 0) return null;
  const cantidad = suyos.reduce((suma, p) => suma + p.cantidad, 0);
  const apuntado = suyos.reduce((suma, p) => suma + p.valor, 0);
  const hoy = cantidad * rate;
  return { from, to, cantidad, apuntado, hoy, diferencia: hoy - apuntado, baila: pct > 0 ? hoy * pct : null };
}

// La cifra y su divisa juntas, que en el panel "EUR" se quedaba solo en otra línea.
function textoExposicion(r) {
  if (!r) return null;
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const diferencia = Math.round(r.diferencia * 100) / 100;
  const hoy = tr(diferencia === 0 ? "pendientes.hoyIgual" : diferencia > 0 ? "pendientes.hoyMas" : "pendientes.hoyMenos", {
    hoy: `${dinero.format(r.hoy)}\u00a0${r.to}`,
    diferencia: dinero.format(Math.abs(diferencia)),
  });
  const baila = r.baila === null ? "" : tr("pendientes.baila", { from: r.from, baila: `${dinero.format(r.baila)}\u00a0${r.to}` });
  return { hoy, baila };
}

// Como un gasto, con la categoría sacada del concepto. Sin comisión: esa se
// pone al pagarlo, que es cuando el banco la cobra.
function crearPendiente({ id, from, to, cantidad, valor, concepto = "", cuando, vence }) {
  if (!(cantidad > 0)) return null;
  const pendiente = crearGasto({ id, from, to, cantidad, valor, concepto, cuando, categoria: adivinarCategoria(limpiarConcepto(concepto)) ?? CATEGORIA_POR_DEFECTO });
  return pendiente && leerVence(vence) ? { ...pendiente, vence } : pendiente;
}

const pagarPendiente = (pendiente, opciones) => repetirGasto(pendiente, opciones);

// Con la fecha vacía se la quita: es lo que manda el "Borrar" del calendario.
function cambiarVence(lista, id, vence) {
  return leerPendientes(lista).map(({ vence: antes, ...p }) => {
    const dia = p.id === id ? leerVence(vence) : antes;
    return dia ? { ...p, vence: dia } : p;
  });
}

// Lo que corre más prisa arriba, y los que no tienen día al final.
const pendientesPorFecha = (lista) => [...leerPendientes(lista)].sort((a, b) => (a.vence ?? "9999").localeCompare(b.vence ?? "9999"));

const tocaPagar = (lista, hoyIso = hoy()) => leerPendientes(lista).filter((p) => p.vence && p.vence <= hoyIso);

function tonoVence(vence, hoyIso = hoy()) {
  const dias = diasHasta(vence, hoyIso) - 1;
  if (dias < 0) return "pasado";
  if (dias === 0) return "hoy";
  return dias <= 3 ? "pronto" : "luego";
}

function textoVence(vence, hoyIso = hoy()) {
  const dias = diasHasta(vence, hoyIso) - 1;
  if (dias === -1) return tr("vence.ayer");
  if (dias < 0) return tr("vence.era", { fecha: fechaCorta(vence) });
  if (dias === 0) return tr("vence.hoy");
  if (dias === 1) return tr("vence.manana");
  return dias < 7 ? tr("vence.dias", { n: dias }) : tr("vence.dia", { fecha: fechaCorta(vence) });
}

// A las nueve, que antes de desayunar no hace falta. Si ese día no abriste Chrome,
// salta el siguiente que lo abras. Con el día en la clave: si lo cambias, vuelve a avisar.
const PENDIENTE_HORA = 9;
const claveAvisoPendiente = (p) => `${p.id}:${p.vence}`;

function tocaPendientes(viajes, avisados, ahora = new Date()) {
  if (ahora.getHours() < PENDIENTE_HORA) return null;
  const ya = new Set(Array.isArray(avisados) ? avisados : []);
  for (const viaje of viajes?.lista ?? []) {
    const pagos = tocaPagar(viaje.pendientes, isoLocal(ahora)).filter((p) => !ya.has(claveAvisoPendiente(p)));
    if (pagos.length) return { viaje, pagos };
  }
  return null;
}

// Solo los que siguen ahí, que si no la lista crecería para siempre.
function avisadosPendientes(avisados, viajes, pagos) {
  const vivos = new Set((viajes?.lista ?? []).flatMap((v) => leerPendientes(v.pendientes).filter((p) => p.vence).map(claveAvisoPendiente)));
  return [...new Set([...(Array.isArray(avisados) ? avisados : []).filter((c) => vivos.has(c)), ...pagos.map(claveAvisoPendiente)])];
}

function mensajePendientes({ viaje, pagos }, hoyIso = hoy()) {
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const nombre = (p) => p.concepto || tr("gastos.sinConcepto");
  const [pago] = pagos;
  const enViaje = (que) => (viaje.nombre ? tr("pendientes.aviso.en", { que, viaje: viaje.nombre }) : que);
  if (pagos.length === 1) {
    const importe = pago.from === pago.to ? `${dinero.format(pago.valor)} ${pago.to}` : `${dinero.format(pago.cantidad)} ${pago.from} ≈ ${dinero.format(pago.valor)} ${pago.to}`;
    return {
      titulo: tr(pago.vence < hoyIso ? "pendientes.aviso.pasado" : "pendientes.aviso.hoy", { concepto: nombre(pago) }),
      cuerpo: enViaje(importe),
    };
  }
  // Si fueran de dos divisas, sumarlas no diría nada.
  const [suma, otra] = sumarPorDivisa(pagos);
  const que = pagos.map(nombre).join(", ");
  return {
    titulo: tr("pendientes.aviso.varios", { n: pagos.length }),
    cuerpo: enViaje(otra ? que : `${que} · ${dinero.format(suma.total)} ${suma.to}`),
  };
}

function quitarGasto(lista, id) {
  return lista.filter((g) => g.id !== id);
}

// El metro de cada mañana: la misma cantidad, pero con la tasa y la comisión de
// hoy. Si no tengo la de hoy para ese par, uso la que tuvo, que es lo más cerca.
// La nota no viaja: "pedir factura" era de aquel, no del de hoy.
function repetirGasto({ nota, ...gasto }, { id, cuando, tasa = null, comision = 0 }) {
  if (!(Number.isFinite(tasa) && tasa > 0)) return crearGasto({ ...gasto, id, cuando });
  const pct = comisionDelPago(gasto.pago, comision);
  const valor = Math.round(conComision(gasto.cantidad * tasa, pct) * 100) / 100;
  return crearGasto({ ...gasto, id, cuando, valor, comision: pct });
}

// La categoría solo la cambio si estaba en "otros": si ya era otra, puede que
// la eligieras tú, y corregir una falta no debería deshacértela.
// El vuelo, el hotel pagado antes de salir, el seguro: cuentan en el total y
// en el presupuesto, pero no son lo que gastas al día y no deben subir la media.
const esFijo = (g) => g.fijo === true;
const delDiaADia = (gastos) => gastos.filter((g) => !esFijo(g));

// El metro, el desayuno del hotel: si lo apuntaste ayer y anteayer y hoy aún
// no, te lo propongo. Por el concepto y la divisa, que el importe puede variar
// un poco; va el de la última vez. Las noches repartidas no, que ya están todas.
const CADA_DIA_MAX = 3;
const claveCadaDia = (g) => `${normalizar(g.concepto).trim()}|${g.from}`;

function deCadaDia(gastos, hoyIso = hoy(), descartados = []) {
  const [y, m, d] = hoyIso.split("-").map(Number);
  const ayer = isoLocal(new Date(y, m - 1, d - 1));
  const anteayer = isoLocal(new Date(y, m - 1, d - 2));
  const porClave = new Map();
  for (const g of gastos) {
    if (esFijo(g) || esDevolucion(g) || g.pagador || !g.concepto || /^\d+\/\d+(?: ·|$)/.test(g.concepto)) continue;
    const clave = claveCadaDia(g);
    const c = porClave.get(clave) ?? { dias: new Set(), ultimo: g };
    c.dias.add(isoLocal(new Date(g.cuando)));
    if (g.cuando > c.ultimo.cuando) c.ultimo = g;
    porClave.set(clave, c);
  }
  return [...porClave.entries()]
    .filter(([clave, c]) => c.dias.has(ayer) && c.dias.has(anteayer) && !c.dias.has(hoyIso) && !descartados.includes(clave))
    .map(([clave, c]) => ({ clave, gasto: c.ultimo, dias: c.dias.size }))
    .sort((a, b) => b.dias - a.dias || b.gasto.cuando - a.gasto.cuando)
    .slice(0, CADA_DIA_MAX);
}

function marcarFijo(lista, id, fijo) {
  return lista.map((g) => {
    if (g.id !== id || esFijo(g) === fijo) return g;
    const { fijo: _, ...resto } = g;
    return fijo ? { ...resto, fijo: true } : resto;
  });
}

function cambiarNota(lista, id, nota) {
  const limpia = limpiarNota(nota);
  const gasto = lista.find((g) => g.id === id);
  if (!gasto || (gasto.nota ?? "") === limpia) return lista;
  return lista.map((g) => {
    if (g.id !== id) return g;
    const { nota: _, ...resto } = g;
    return limpia ? { ...resto, nota: limpia } : resto;
  });
}

function cambiarConcepto(lista, id, concepto) {
  const limpio = limpiarConcepto(concepto);
  const gasto = lista.find((g) => g.id === id);
  if (!gasto || gasto.concepto === limpio) return lista;
  const categoria = gasto.categoria === CATEGORIA_POR_DEFECTO ? adivinarCategoria(limpio) ?? gasto.categoria : gasto.categoria;
  return lista.map((g) => (g.id === id ? { ...g, concepto: limpio, categoria } : g));
}

// Para el gasto que se te olvidó apuntar. Dejo la hora, así dentro del día
// sigue en su sitio, y el valor: de un día a otro la tasa apenas se mueve y no
// merece otra petición por unos céntimos.
function cambiarDia(lista, id, dia, hoyIso = hoy()) {
  if (!esIso(dia) || dia > hoyIso) return lista;
  const gasto = lista.find((g) => g.id === id);
  if (!gasto || isoLocal(new Date(gasto.cuando)) === dia) return lista;
  const antes = new Date(gasto.cuando);
  const [a, m, d] = dia.split("-").map(Number);
  const cuando = new Date(a, m - 1, d, antes.getHours(), antes.getMinutes(), antes.getSeconds(), antes.getMilliseconds()).getTime();
  // Reordeno porque los días salen en el orden de la lista: si no, el de ayer
  // quedaría arriba de hoy.
  return lista.map((g) => (g.id === id ? { ...g, cuando } : g)).sort((x, y) => y.cuando - x.cuando);
}

// "taxis" tiene que encontrar el "Taxi" que apuntaste, y "hoteles", el "Hotel".
const raicesDe = (p) => [p, p.length > 4 && p.endsWith("es") && p.slice(0, -2), p.length > 3 && p.endsWith("s") && p.slice(0, -1)].filter(Boolean);
const casaPalabra = (texto, p) => raicesDe(p).some((r) => texto.includes(r));

// Tienen que estar todas las palabras, en el concepto o en el nombre de la
// categoría: así "comida" encuentra la cena aunque no lo pusieras.
function buscarGastos(gastos, consulta) {
  const palabras = normalizar(String(consulta ?? "")).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return gastos;
  return gastos.filter((g) => {
    const texto = normalizar(`${g.concepto} ${nombreCategoria(g.categoria)} ${g.nota ?? ""}`);
    return palabras.every((p) => casaPalabra(texto, p));
  });
}

// Preguntar a los gastos desde Ctrl+K: "cuánto llevo en taxis en Kioto", "comida
// ayer", "efectivo hoy". Lo que sobra de la frase se tira; lo que queda se busca
// como en la lupa.
const RELLENO_PREGUNTA = new Set(("cuanto cuanta cuantos cuantas llevo llevamos he hemos gastado gaste gastamos "
  + "gasto gastos en de del el la los las mi mis total y con pagado pague al a por que "
  + "how much many did i we spend spent on in the my have for paid with what").split(" "));
const DIAS_PREGUNTA = { hoy: 0, today: 0, ayer: 1, yesterday: 1, anteayer: 2 };
const PAGO_PREGUNTA = { efectivo: "efectivo", cash: "efectivo", metalico: "efectivo", tarjeta: "tarjeta", tarjetas: "tarjeta", card: "tarjeta" };

function preguntarGastos(consulta, viaje, hoyIso = hoy()) {
  let resto = ` ${normalizar(String(consulta ?? "")).replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim()} `;
  if (!resto.trim() || !viaje?.gastos?.length) return null;
  // El tramo primero, que su nombre puede tener varias palabras ("San Francisco").
  const tramos = leerTramos(viaje.tramos);
  let tramo = null;
  for (const [i, t] of tramos.entries()) {
    const nombre = ` ${normalizar(t.nombre).replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim()} `;
    if (nombre.trim() && resto.includes(nombre)) {
      tramo = { desde: t.desde, hasta: tramos[i + 1]?.desde ?? null };
      resto = resto.replace(nombre, " ");
      break;
    }
  }
  let dia = null;
  let pago = null;
  const palabras = [];
  for (const p of resto.split(" ").filter(Boolean)) {
    if (p in DIAS_PREGUNTA) dia = otroDia(hoyIso, -DIAS_PREGUNTA[p]);
    else if (p in PAGO_PREGUNTA) pago = PAGO_PREGUNTA[p];
    else if (!RELLENO_PREGUNTA.has(p)) palabras.push(p);
  }
  // Sin nada por lo que filtrar no es una pregunta: "cuánto" a secas es el total.
  if (!tramo && !dia && !pago && !palabras.length) return null;
  const lista = viaje.gastos.filter((g) => {
    const d = isoLocal(new Date(g.cuando));
    if (dia && d !== dia) return false;
    if (tramo && (d < tramo.desde || (tramo.hasta && d >= tramo.hasta))) return false;
    if (pago && g.pago !== pago) return false;
    const texto = normalizar(`${g.concepto} ${nombreCategoria(g.categoria)} ${g.nota ?? ""}`);
    return palabras.every((p) => casaPalabra(texto, p));
  });
  return { n: lista.length, totales: sumarPorDivisa(lista), palabras };
}

function textoPregunta({ n, totales }) {
  if (n === 0) return tr("pregunta.nada");
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const total = totales.map((t) => `${dinero.format(t.total)} ${t.to}`).join(" + ");
  return tr(n === 1 ? "pregunta.uno" : "pregunta.varios", { n, total });
}

// El concepto en trozos, marcando lo que coincide con la búsqueda. Normalizo
// letra a letra para que las posiciones casen: "é" sigue ocupando una.
function trozosResaltados(texto, consulta) {
  const palabras = normalizar(String(consulta ?? "")).split(/\s+/).filter(Boolean);
  const plano = [...texto].map((c) => normalizar(c).charAt(0) || c).join("");
  const marcadas = new Array(plano.length).fill(false);
  for (const palabra of palabras) {
    // Con "taxis", lo que se marca es el "Taxi" que hay.
    const p = raicesDe(palabra).find((r) => plano.includes(r)) ?? palabra;
    for (let i = plano.indexOf(p); i !== -1; i = plano.indexOf(p, i + p.length)) marcadas.fill(true, i, i + p.length);
  }
  const trozos = [];
  [...texto].forEach((c, i) => {
    const ultimo = trozos[trozos.length - 1];
    if (ultimo && ultimo.resaltado === marcadas[i]) ultimo.texto += c;
    else trozos.push({ texto: c, resaltado: marcadas[i] });
  });
  return trozos;
}

// Deshacer un "Vaciar": vuelven todos detrás de lo que hayas apuntado entretanto,
// que es más nuevo y va arriba.
function devolverTodos(lista, vaciados) {
  const ids = new Set(lista.map((g) => g.id));
  return [...lista, ...vaciados.filter((g) => esGastoBueno(g) && !ids.has(g.id))].slice(0, GASTOS_MAX);
}

// Al deshacer vuelve a donde estaba, no arriba del todo como uno nuevo.
function devolverGasto(lista, gasto, indice) {
  if (!esGastoBueno(gasto) || lista.some((g) => g.id === gasto.id)) return lista;
  const copia = [...lista];
  copia.splice(Math.min(Math.max(indice, 0), copia.length) || 0, 0, gasto);
  return copia.slice(0, GASTOS_MAX);
}
