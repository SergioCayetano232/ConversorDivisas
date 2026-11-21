// Lo que entra y sale: el CSV del banco, los grupos de otras apps, la copia de
// seguridad y la sincronización.

// El CSV del banco. Los españoles lo dan en euros, con punto y coma, la coma
// para los decimales y unas líneas de cabecera con la cuenta antes de la tabla.
function partirCsv(texto, sep) {
  const filas = [];
  let fila = [];
  let campo = "";
  let comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') {
        campo += '"';
        i += 1;
      } else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === sep) {
      fila.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i += 1;
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = "";
    } else campo += c;
  }
  if (campo || fila.length) filas.push([...fila, campo]);
  return filas.map((f) => f.map((x) => x.trim())).filter((f) => f.some(Boolean));
}

// "1.234,56", "-12,50 €", "-12.50" y "1,234.56": el último signo es el decimal.
// Un punto solo con tres cifras detrás son miles, que así lo pone el banco.
function numeroBanco(texto) {
  let t = String(texto ?? "").replace(/[€\s ]|EUR/gi, "").replace(/^\+/, "").replace(/^−/, "-");
  if (!/^-?[\d.,]+$/.test(t)) return null;
  const coma = t.lastIndexOf(",");
  const punto = t.lastIndexOf(".");
  if (coma > -1 && punto > -1) t = coma > punto ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
  else if (coma > -1) t = t.replace(",", ".");
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

// 03/11/2026, 3-11-26 o 2026-11-03. Siempre día antes que mes: es un banco español.
function fechaBanco(texto) {
  const t = String(texto ?? "").trim();
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  let a, mes, d;
  if (m) [, a, mes, d] = m.map(Number);
  else {
    m = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})\b/);
    if (!m) return null;
    [, d, mes, a] = m.map(Number);
    if (a < 100) a += 2000;
  }
  const fecha = new Date(a, mes - 1, d);
  if (fecha.getFullYear() !== a || fecha.getMonth() !== mes - 1 || fecha.getDate() !== d) return null;
  return isoLocal(fecha);
}

const COLUMNAS_BANCO = {
  fecha: [/^f(echa)?\.? ?(de )?operacion/, /^fecha$/, /^fecha/],
  concepto: [/^concepto/, /^descripcion/, /^movimiento/, /^detalle/],
  importe: [/^importe/, /^cantidad/],
  cargo: [/^cargo/, /^debe$/],
};

// La primera columna que case, por orden de preferencia: "fecha operación"
// antes que "fecha valor", que es cuando lo cobra el banco y no cuando pagaste.
function columnaBanco(cabecera, patrones) {
  for (const patron of patrones) {
    const i = cabecera.findIndex((c) => patron.test(normalizar(c)) && !/valor/.test(normalizar(c)));
    if (i > -1) return i;
  }
  return -1;
}

function leerCsvBanco(texto) {
  const limpio = String(texto ?? "").replace(/^﻿/, "");
  const primeras = limpio.split(/\r?\n/).slice(0, 20).join("\n");
  const sep = [";", "\t", ","].map((c) => [c, primeras.split(c).length]).sort((a, b) => b[1] - a[1])[0][0];
  const filas = partirCsv(limpio, sep);
  const donde = filas.slice(0, 20).findIndex((f) => columnaBanco(f, COLUMNAS_BANCO.fecha) > -1
    && (columnaBanco(f, COLUMNAS_BANCO.importe) > -1 || columnaBanco(f, COLUMNAS_BANCO.cargo) > -1));
  if (donde === -1) return { error: "columnas" };
  const cabecera = filas[donde];
  const col = Object.fromEntries(Object.entries(COLUMNAS_BANCO).map(([k, p]) => [k, columnaBanco(cabecera, p)]));
  const movimientos = [];
  for (const f of filas.slice(donde + 1)) {
    const fecha = fechaBanco(f[col.fecha]);
    if (!fecha) continue;
    // Con "Importe", lo que sale va en negativo; con "Cargo", en positivo.
    const bruto = col.importe > -1 ? numeroBanco(f[col.importe]) : numeroBanco(f[col.cargo]);
    const importe = col.importe > -1 ? -bruto : bruto;
    if (!(importe > 0)) continue;
    movimientos.push({ fecha, concepto: col.concepto > -1 ? f[col.concepto] : "", importe: Math.round(importe * 100) / 100 });
  }
  if (movimientos.length === 0) return { error: "vacio" };
  return { movimientos: movimientos.sort((a, b) => a.fecha.localeCompare(b.fecha)) };
}

// "COMPRA TARJ. 5402XXXXXXXX1234 LAWSON SHIBUYA" → "Lawson Shibuya". Sin quitar
// el "COMPRA" de delante, todo acababa en la categoría de compras.
const PREFIJOS_BANCO = /^(compra|pago|cargo|adeudo|operacion)( con)?( en)?( tarj(eta|\.)?( de credito| de debito| credito| debito)?)?( en)?[\s.:-]*/i;

function conceptoBanco(texto) {
  // El importe de allí y la tasa, si el banco los pone, ya van en el gasto: en el
  // concepto solo estorban ("Lawson Shibuya 3.400,00 Jpy").
  let sinImporte = String(texto ?? "").replace(TASA_EN_CONCEPTO, " ").replace(/\bimporte (de )?origen\b:?/gi, " ");
  for (const p of buscarPrecios(sinImporte).reverse()) sinImporte = sinImporte.slice(0, p.inicio) + sinImporte.slice(p.fin);
  const t = sinImporte
    .replace(/\s+/g, " ")
    .trim()
    .replace(PREFIJOS_BANCO, "")
    .replace(/[:*]*\b\d{4,}[\dX*]*\b/gi, "")
    // ", Tarjeta 1234." detrás del comercio; delante ya lo quita el prefijo.
    .replace(/[,;]\s*tarj(eta|\.)?\b.*$/i, "")
    .replace(/[\s.,;:-]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
  const bonito = t.toLocaleLowerCase(localeActual()).replace(/(^|\s)(\p{L})/gu, (_, sp, l) => sp + l.toLocaleUpperCase(localeActual()));
  return limpiarConcepto(bonito);
}

// Fines de semana y festivos el BCE no publica: vale la del último día que sí.
function tasaDeEseDia(tasas, fecha) {
  const dias = Object.keys(tasas ?? {}).sort();
  if (!dias.length) return null;
  const antes = dias.filter((d) => d <= fecha).at(-1) ?? dias[0];
  return tasas[antes];
}

// El CSV de Splitwise o Tricount: lo que llevabais en otra app, con quién pagó
// y entre quiénes. Por los nombres de las columnas y no por su sitio, que cada
// app (y cada idioma) las pone a su manera.
const COLUMNAS_GRUPO = {
  fecha: [/^(date|fecha|datum)/],
  concepto: [/^(description|title|titulo|descripcion|concepto|what|wat)$/],
  categoria: [/^(category|categoria)$/],
  importe: [/^(cost|amount|importe|cantidad|coste|bedrag)$/],
  divisa: [/^(currency|moneda|divisa|valuta)$/],
  pagador: [/^(paid by|pagado por|payer|betaald door)$/],
  tipo: [/^(type|tipo|transaction type)$/],
};
// En Tricount, una columna por persona con lo que le toca: "Paid for Ana".
const PARA_PERSONA = /^(?:paid for|impact for|pagado para|para|betaald voor)\s+(.+)$/i;
// Lo que es saldar deudas, no gastar: Splitwise lo marca como "Payment".
const ES_PAGO_GRUPO = /^(payment|pago|transfer|transferencia|money transfer|reembolso|reimbursement)$/i;

const CATEGORIAS_GRUPO = [
  ["comida", /dining|groceries|food|liquor|restaurant|comida|supermercado|bar|cafe/],
  ["transporte", /taxi|transport|bus|train|plane|flight|car|gas|fuel|parking|bicycle|transporte|vuelo|tren/],
  ["alojamiento", /hotel|lodging|rent|accommodation|alojamiento|alquiler/],
  ["ocio", /entertainment|games|movies|music|sports|ocio|entradas/],
  ["compras", /clothing|gifts|household|electronics|shopping|compras|ropa|regalos/],
];

function categoriaDeGrupo(concepto, categoria) {
  const t = normalizar(String(categoria ?? ""));
  return adivinarCategoria(concepto) ?? CATEGORIAS_GRUPO.find(([, patron]) => patron.test(t))?.[0] ?? CATEGORIA_POR_DEFECTO;
}

function leerCsvGrupo(texto) {
  const limpio = String(texto ?? "").replace(/^﻿/, "");
  const primeras = limpio.split(/\r?\n/).slice(0, 5).join("\n");
  const sep = [",", ";", "\t"].map((c) => [c, primeras.split(c).length]).sort((a, b) => b[1] - a[1])[0][0];
  const filas = partirCsv(limpio, sep);
  const donde = filas.slice(0, 10).findIndex((f) => columnaBanco(f, COLUMNAS_GRUPO.fecha) > -1
    && columnaBanco(f, COLUMNAS_GRUPO.importe) > -1 && columnaBanco(f, COLUMNAS_GRUPO.divisa) > -1);
  if (donde === -1) return { error: "columnas" };
  const cabecera = filas[donde];
  const col = Object.fromEntries(Object.entries(COLUMNAS_GRUPO).map(([k, p]) => [k, columnaBanco(cabecera, p)]));

  // Splitwise: una columna por persona detrás de la divisa, con lo que puso
  // menos lo que le tocaba. Tricount: "Pagado por" y una "Paid for X" por persona.
  const tricount = col.pagador > -1;
  const columnasPersona = tricount
    ? cabecera.map((c, i) => [i, c.match(PARA_PERSONA)?.[1]?.trim()]).filter(([, n]) => n)
    : cabecera.map((c, i) => [i, c.trim()]).filter(([i, n]) => i > col.divisa && n);
  const personas = columnasPersona.map(([, n]) => n);
  if (personas.length > PERSONAS_MAX) return { error: "personas" };

  const gastos = [];
  for (const f of filas.slice(donde + 1)) {
    const fecha = fechaBanco(f[col.fecha]);
    const importe = numeroBanco(f[col.importe]);
    const divisa = String(f[col.divisa] ?? "").trim().toUpperCase();
    // La línea del total de Splitwise no tiene fecha; los pagos entre vosotros no son gastos.
    if (!fecha || !(importe > 0) || !isValidCode(divisa)) continue;
    if (ES_PAGO_GRUPO.test(f[col.categoria] ?? "") || ES_PAGO_GRUPO.test(f[col.tipo] ?? "")) continue;
    let pagador = null;
    let entre = [];
    if (tricount) {
      const nombre = normalizar(String(f[col.pagador] ?? "").trim());
      pagador = personas.findIndex((n) => normalizar(n) === nombre);
      entre = columnasPersona.map(([i], k) => [k, numeroBanco(f[i])]).filter(([, v]) => Math.abs(v ?? 0) >= 0.005).map(([k]) => k);
    } else {
      const netos = columnasPersona.map(([i]) => numeroBanco(f[i]) ?? 0);
      // El que puso el dinero es el que sale en positivo; si son varios, el que más.
      const max = Math.max(...netos);
      pagador = max > 0.005 ? netos.indexOf(max) : -1;
      // A cada uno le tocaba lo que puso menos su neto; los que no ponen nada ni deben, no entran.
      entre = netos.map((v, k) => [k, (k === pagador ? importe : 0) - v]).filter(([, parte]) => parte >= 0.005).map(([k]) => k);
    }
    const concepto = col.concepto > -1 ? String(f[col.concepto] ?? "").trim() : "";
    gastos.push({
      fecha, concepto, importe: Math.round(importe * 100) / 100, divisa,
      categoria: categoriaDeGrupo(concepto, col.categoria > -1 ? f[col.categoria] : ""),
      pagador: pagador >= 0 ? pagador : null,
      entre: entre.length && entre.length < personas.length ? entre : null,
    });
  }
  if (!gastos.length) return { error: "vacio" };
  return { app: tricount ? "tricount" : "splitwise", personas, gastos: gastos.sort((a, b) => a.fecha.localeCompare(b.fecha)) };
}

// De lo leído a gastos del viaje. "tu" es tu columna: pasas a ser la persona 0,
// como en el resto de la extensión, y los demás van detrás en su orden.
// tasas[divisa][día] es lo que vale 1 de esa divisa en la tuya ese día. Lo que
// ya viene en tu divisa se guarda en la de allí, como lo del banco, porque un
// gasto no puede ir de una divisa a sí misma.
function gastosDelGrupo(leido, { tu = 0, to, alli, tasas, existentes = [], idBase = "s", cuando = 12 }) {
  const n = leido.personas.length;
  const orden = [tu, ...leido.personas.map((_, i) => i).filter((i) => i !== tu)];
  const nuevoIndice = (i) => orden.indexOf(i);
  const nuevos = [];
  let repetidos = 0;
  let sinTasa = 0;
  leido.gastos.forEach((g, k) => {
    const enLaTuya = g.divisa === to;
    const from = enLaTuya ? alli : g.divisa;
    const tasa = tasaDeEseDia(tasas?.[from], g.fecha);
    if (!(tasa > 0) || from === to) {
      sinTasa += 1;
      return;
    }
    const valor = enLaTuya ? g.importe : Math.round(g.importe * tasa * 100) / 100;
    if (yaApuntado([...existentes, ...nuevos], g.fecha, valor, to)) {
      repetidos += 1;
      return;
    }
    const [a, m, d] = g.fecha.split("-").map(Number);
    const gasto = crearGasto({
      id: `${idBase}${k.toString(36)}`, from, to, valor,
      cantidad: enLaTuya ? Math.round((g.importe / tasa) * 100) / 100 : g.importe,
      cuando: new Date(a, m - 1, d, cuando).getTime(),
      concepto: g.concepto, categoria: g.categoria, pago: "tarjeta", comision: 0,
      pagador: g.pagador === null ? 0 : nuevoIndice(g.pagador),
      entre: g.entre?.map(nuevoIndice),
    });
    if (gasto) nuevos.push(gasto);
  });
  // Tu nombre no: en la extensión tú eres "tú".
  const gente = orden.map((i, k) => (k === 0 ? "" : leido.personas[i]));
  return { nuevos, repetidos, sinTasa, personas: n, gente };
}

// Lo de un mismo día con el mismo importe ya está: lo apuntaste a mano o lo
// importaste antes. El concepto no lo miro, que el del banco nunca es el tuyo.
const yaApuntado = (gastos, fecha, importe, to) => gastos.some((g) => g.to === to
  && isoLocal(new Date(g.cuando)) === fecha && Math.abs(g.valor - importe) < 0.005);

function gastosDelBanco(movimientos, { from, to = "EUR", tasas, existentes = [], idBase = "b" }) {
  const nuevos = [];
  let repetidos = 0;
  movimientos.forEach((m, i) => {
    if (yaApuntado([...existentes, ...nuevos], m.fecha, m.importe, to)) {
      repetidos += 1;
      return;
    }
    const tasa = tasaDeEseDia(tasas, m.fecha);
    // Si el concepto trae lo que pagaste allí, esa es la cantidad, y lo que se
    // aparta del BCE es la comisión. Si no, la cantidad sale del BCE y la
    // comisión no la sé.
    const fuera = cargoEnDivisa(m.concepto);
    const real = fuera?.divisa === from ? fuera.cantidad : null;
    if (!real && !(tasa > 0)) return;
    const margen = real && tasa > 0 ? m.importe / (real * tasa) - 1 : null;
    const comision = margen !== null && margen >= COMISION_RARA.min && margen <= COMISION_RARA.max
      ? Math.max(0, redondearComision(margen * 100)) : 0;
    const [a, mes, d] = m.fecha.split("-").map(Number);
    const concepto = conceptoBanco(m.concepto);
    const gasto = crearGasto({
      id: `${idBase}${i.toString(36)}`, from, to, cuando: new Date(a, mes - 1, d, 12).getTime(),
      cantidad: real ?? Math.round((m.importe / tasa) * 100) / 100,
      valor: m.importe,
      concepto,
      categoria: adivinarCategoria(concepto) ?? CATEGORIA_POR_DEFECTO,
      pago: "tarjeta",
      comision,
    });
    if (gasto) nuevos.push(gasto);
  });
  return { nuevos, repetidos };
}

// Muchos bancos ponen en el concepto lo que pagaste allí: "LAWSON TOKYO
// 3.400,00 JPY" o "Importe origen 45,00 USD". Con eso y la tasa del BCE de ese
// día sale lo que te cobra de verdad la tarjeta. Lo de "1 EUR = 162,12 JPY" lo
// quito antes, que si no los 162 yenes parecían la compra.
const TASA_EN_CONCEPTO = /\b1\s*(?:EUR|€)\s*=\s*[\d.,]+\s*[A-Z]{3}\b|\b(?:tipo|cambio|tasa|rate)\b[^\d]{0,12}[\d.,]+/gi;

function cargoEnDivisa(concepto) {
  const limpio = String(concepto ?? "").replace(TASA_EN_CONCEPTO, " ");
  const precio = buscarPrecios(limpio).find((p) => p.divisa !== "EUR");
  return precio ? { cantidad: precio.cantidad, divisa: precio.divisa } : null;
}

// La comisión por compra en el extranjero, cuando el banco la cobra en otra línea.
const LINEA_COMISION = /\bcomisi[oó]n\b|\bfee\b/i;

// Lo que se aparta mucho no es comisión, es que he leído mal el concepto o la
// compra se devolvió a medias: fuera del 15 % por arriba o del 3 % por abajo.
const COMISION_RARA = { max: 0.15, min: -0.03 };

// tasas[divisa][fecha]: lo que vale 1 de esa divisa en euros ese día, del BCE.
function comisionReal(movimientos, tasas) {
  if (!Array.isArray(movimientos)) return null;
  const cargos = [];
  let comisiones = 0;
  for (const m of movimientos) {
    const fuera = cargoEnDivisa(m.concepto);
    if (!fuera) {
      if (LINEA_COMISION.test(m.concepto ?? "")) comisiones += m.importe;
      continue;
    }
    const tasa = tasaDeEseDia(tasas?.[fuera.divisa], m.fecha);
    if (!(tasa > 0)) continue;
    const justo = fuera.cantidad * tasa;
    const margen = m.importe / justo - 1;
    if (margen > COMISION_RARA.max || margen < COMISION_RARA.min) continue;
    cargos.push({ ...m, ...fuera, justo, margen });
  }
  if (cargos.length === 0) return null;
  // Las comisiones sueltas solo cuentan si hay compras fuera: si no, serán del
  // mantenimiento de la cuenta.
  const pagado = cargos.reduce((t, c) => t + c.importe, 0) + comisiones;
  const justo = cargos.reduce((t, c) => t + c.justo, 0);
  const pct = Math.max(0, Math.min(Math.round((pagado / justo - 1) * 1000) / 10, COMISION_MAX));
  return { n: cargos.length, pagado, justo, deMas: pagado - justo, comisiones, pct, divisas: [...new Set(cargos.map((c) => c.divisa))] };
}

function textoComisionReal(r, actual = 0) {
  if (!r) return null;
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // Sin partir el "2,9 %" en dos líneas.
  const pct = porCiento(numeros({ maximumFractionDigits: 1 }).format(r.pct)).replace(" ", "\u00a0");
  return {
    titulo: tr("comisionReal.titulo", { pct }),
    detalle: tr(r.n === 1 ? "comisionReal.detalleUna" : "comisionReal.detalle", { n: r.n, deMas: `${dinero.format(r.deMas)} EUR` }),
    igual: Math.abs(r.pct - actual) < 0.05,
  };
}

// La tarjeta del viaje, para enseñarla al volver: lo que cuenta de un vistazo.
// Los días son los del presupuesto si los tiene; si no, del primer gasto del día
// a día al último, como la media.
function datosTarjeta(viaje, hoyIso = hoy()) {
  const { gastos = [], presupuesto = null } = viaje ?? {};
  const [total] = sumarPorDivisa(gastos);
  if (!total) return null;
  const diarios = delDiaADia(gastos);
  const fechas = gastosPorDia(diarios.length ? diarios : gastos).map((d) => d.dia).sort();
  const desde = presupuesto?.desde ?? fechas[0];
  const hasta = presupuesto?.hasta ?? fechas.at(-1);
  const { caro, dia } = destacados(gastos, hoyIso);
  const estado = estadoPresupuesto(presupuesto, gastos, hoyIso);
  const media = mediaPorDia(gastos);
  return {
    nombre: viaje.nombre || tr("viajes.sinNombre"),
    color: viaje.color ?? COLOR_POR_DEFECTO,
    desde,
    hasta,
    dias: Math.max(diasHasta(hasta, desde), 1),
    n: gastos.length,
    total,
    otras: sumarPorDivisa(gastos).slice(1),
    media: media ? { valor: media.media, to: media.to } : null,
    caro: caro ? { concepto: caro.concepto || nombreCategoria(caro.categoria), valor: caro.valor, to: caro.to, categoria: caro.categoria } : null,
    diaMas: dia ? { dia: dia.dia, total: dia.total, to: dia.to } : null,
    categorias: desglose(gastos).slice(0, 3),
    presupuesto: estado ? { importe: presupuesto.importe, to: presupuesto.to, queda: estado.queda } : null,
    comisiones: comisionesPagadas(gastos),
    cambio: cambioDelViaje(gastos),
    cabeza: porPersona(gastos, viaje.personas),
  };
}

// Tu año viajando: todos los viajes, archivados también, contados solo con lo
// que gastaste ese año. Un viaje de Nochevieja cuenta en los dos.
const anioDe = (g) => new Date(g.cuando).getFullYear();

function aniosConGastos(lista) {
  const anios = new Set(lista.flatMap((v) => v.gastos.map(anioDe)));
  return [...anios].sort((a, b) => b - a);
}

function datosAnio(lista, anio) {
  const delAnio = lista
    .map((v) => ({ ...v, gastos: v.gastos.filter((g) => anioDe(g) === anio) }))
    .filter((v) => v.gastos.length > 0);
  const todos = delAnio.flatMap((v) => v.gastos);
  const totales = sumarPorDivisa(todos);
  const [total] = totales;
  if (!total) return null;
  const suyos = (gastos) => gastos.filter((g) => g.to === total.to);

  // Los días fuera, sin contar dos veces los que se solapan: la escapada
  // dentro de un viaje largo no te da más días.
  const dias = new Set();
  for (const v of delAnio) {
    const diarios = delDiaADia(v.gastos);
    const fechas = gastosPorDia(diarios.length ? diarios : v.gastos).map((d) => d.dia).sort();
    const [a, m, d] = fechas[0].split("-").map(Number);
    for (let i = 0; i < diasHasta(fechas.at(-1), fechas[0]); i += 1) dias.add(isoLocal(new Date(a, m - 1, d + i)));
  }

  const filas = compararViajes(delAnio).filter((f) => f.media !== null && f.to === total.to);
  const nombre = (id) => delAnio.find((v) => v.id === id)?.nombre || tr("viajes.sinNombre");
  const porMedia = [...filas].sort((a, b) => b.media - a.media);
  const fila = (f) => (f ? { nombre: nombre(f.id), media: f.media, to: f.to } : null);
  const diarios = suyos(delDiaADia(todos));
  const caro = diarios.length ? diarios.reduce((max, g) => (g.valor > max.valor ? g : max)) : null;
  const diasDiarios = new Set(diarios.map((g) => isoLocal(new Date(g.cuando))));
  const sumaDiarios = diarios.reduce((suma, g) => suma + g.valor, 0);
  // Las divisas por orden de llegada: es el orden del año.
  const divisas = [...new Set([...todos].sort((a, b) => a.cuando - b.cuando).map((g) => g.from))]
    .filter((code) => code !== total.to);

  return {
    anio,
    viajes: delAnio.length,
    dias: dias.size,
    total,
    otras: totales.slice(1),
    n: todos.length,
    // Contra los días fuera y no contra los días con gastos: el día del museo
    // gratis también estabas de viaje.
    media: dias.size >= 2 && diasDiarios.size ? { valor: sumaDiarios / dias.size, to: total.to } : null,
    // Con un viaje solo no hay más caro ni más barato.
    caroDia: porMedia.length >= 2 ? fila(porMedia[0]) : null,
    baratoDia: porMedia.length >= 2 ? fila(porMedia.at(-1)) : null,
    caro: caro ? { concepto: caro.concepto || nombreCategoria(caro.categoria), valor: caro.valor, to: caro.to, categoria: caro.categoria } : null,
    estrella: conceptoEstrella(todos),
    divisas,
    categorias: desglose(todos).slice(0, 3),
  };
}

// La copia de seguridad guarda lo tuyo: viajes, avisos, historial y
// preferencias. Las tasas guardadas no, que caducan en un día.
const COPIA_APP = "ConversorDivisas";
const COPIA_VERSION = 1;

// Todo pasa por los mismos lectores que al abrir el popup: una copia tocada a
// mano o a medias no puede meter nada que el popup no se trague.
function limpiarCopia(crudo) {
  const d = crudo && typeof crudo === "object" ? crudo : {};
  const datos = { viajes: leerViajes(d.viajes, d.gastosViaje, d.presupuestoViaje) };
  const { from, to } = d.lastPair ?? {};
  if (isValidCode(from) && isValidCode(to)) datos.lastPair = { from, to };
  if (Array.isArray(d.paresRecientes)) datos.paresRecientes = leerRecientes(d.paresRecientes);
  if (Array.isArray(d.divisasExtra)) datos.divisasExtra = leerExtras(d.divisasExtra);
  if (Array.isArray(d.avisos)) datos.avisos = leerAvisos(d.avisos);
  if (leerSuscripciones(d.suscripciones).length) datos.suscripciones = leerSuscripciones(d.suscripciones);
  if (Array.isArray(d.historialConversiones)) datos.historialConversiones = leerHistorial(d.historialConversiones);
  if (d.rangoGrafico !== undefined) datos.rangoGrafico = leerRango(d.rangoGrafico);
  if (d.comisionBanco !== undefined) datos.comisionBanco = leerComision(d.comisionBanco);
  if (Array.isArray(d.tarjetasBanco)) datos.tarjetasBanco = leerTarjetas(d.tarjetasBanco);
  if (Object.keys(leerCajeroGratis(d.cajeroGratis)).length) datos.cajeroGratis = leerCajeroGratis(d.cajeroGratis);
  if (d.impuestoVenta !== undefined) datos.impuestoVenta = leerImpuesto(d.impuestoVenta);
  if (leerCafe(d.precioCafe)) datos.precioCafe = leerCafe(d.precioCafe);
  if (leerCafe(d.sueldoHora)) datos.sueldoHora = leerCafe(d.sueldoHora);
  if (d.pagoGasto !== undefined) datos.pagoGasto = leerPago(d.pagoGasto);
  if (d.cuentaReparto !== undefined) datos.cuentaReparto = leerCuenta(d.cuentaReparto);
  if (typeof d.insigniaActiva === "boolean") datos.insigniaActiva = d.insigniaActiva;
  if (typeof d.recordatorioActivo === "boolean") datos.recordatorioActivo = d.recordatorioActivo;
  if (RECORDATORIO_HORAS.includes(d.recordatorioHora)) datos.recordatorioHora = d.recordatorioHora;
  if (typeof d.tasaAlReves === "boolean") datos.tasaAlReves = d.tasaAlReves;
  if (d.idioma === "auto" || TEXTOS[d.idioma]) datos.idioma = d.idioma;
  if (leerDivisaCasa(d.divisaCasa)) datos.divisaCasa = d.divisaCasa;
  if (TEMAS.includes(d.tema)) datos.tema = d.tema;
  if (leerComoPagar(d.comoMePagan)) datos.comoMePagan = leerComoPagar(d.comoMePagan);
  if (leerCategoriasPropias(d.categoriasPropias).length) datos.categoriasPropias = leerCategoriasPropias(d.categoriasPropias);
  return datos;
}

// Las claves que borro antes de restaurar: las de la copia y las de antes de
// los viajes, para que no vuelvan a aparecer mezcladas.
const CLAVES_COPIA = [
  "viajes", "gastosViaje", "presupuestoViaje", "lastPair", "paresRecientes", "divisasExtra", "avisos",
  "historialConversiones", "rangoGrafico", "comisionBanco", "tarjetasBanco", "impuestoVenta", "pagoGasto", "cuentaReparto", "insigniaActiva", "tasaAlReves", "idioma",
  "recordatorioActivo", "recordatorioHora", "precioCafe", "sueldoHora", "categoriasPropias", "suscripciones", "cajeroGratis", "divisaCasa", "tema", "comoMePagan",
];

// Lo que se lleva tu cuenta de Chrome a tus otros ordenadores: cómo lo tienes
// puesto, no lo que haces. Los viajes no, que no caben (la nube da 100 KB) y
// pisarse los gastos entre dos ordenadores sería peor. Los avisos de tasa
// tampoco: saltarían en cada ordenador que tengas abierto.
const CLAVES_SYNC = [
  "comisionBanco", "tarjetasBanco", "impuestoVenta", "precioCafe", "sueldoHora", "pagoGasto", "cuentaReparto", "divisasExtra",
  "paresRecientes", "rangoGrafico", "insigniaActiva", "tasaAlReves", "idioma", "recordatorioActivo", "recordatorioHora", "cajeroGratis", "divisaCasa", "tema", "comoMePagan",
];

// Lo que llega de otro ordenador pasa por los mismos lectores que la copia: si
// en el otro hay una versión vieja de la extensión, aquí no entra nada raro.
function limpiarSync(crudo) {
  const d = crudo && typeof crudo === "object" ? crudo : {};
  const limpio = limpiarCopia(Object.fromEntries(CLAVES_SYNC.filter((c) => c in d).map((c) => [c, d[c]])));
  return Object.fromEntries(CLAVES_SYNC.filter((c) => c in limpio).map((c) => [c, limpio[c]]));
}

// Solo lo que es distinto: si no, cada cambio volvería rebotado del otro lado.
function cambiosSync(origen, destino) {
  const limpio = limpiarSync(origen);
  const otro = destino ?? {};
  return Object.fromEntries(Object.entries(limpio).filter(([c, v]) => JSON.stringify(v) !== JSON.stringify(otro[c])));
}

// Al arrancar: lo que hay en la nube manda, que es lo último que tocaste en
// algún sitio; lo que solo tienes aquí sube. Así el ordenador nuevo coge lo
// tuyo y el de siempre no pierde nada la primera vez.
function mezclaInicial(local, nube) {
  const deNube = limpiarSync(nube);
  const deLocal = limpiarSync(local);
  const sube = Object.fromEntries(Object.entries(deLocal).filter(([c]) => !(c in deNube)));
  return { aLocal: cambiosSync(deNube, deLocal), aNube: sube };
}

// Las fotos de los tiques van al lado de los datos y no dentro: no están en el
// almacenamiento, sino en IndexedDB. Sin subir la versión, que una copia con
// fotos se puede restaurar igual con la extensión de antes; solo no las verá.
const TIQUE_EN_COPIA = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/;

// Solo las de gastos que van en la copia, y solo si son imágenes de verdad.
function tiquesDeCopia(tiques, viajes) {
  if (!tiques || typeof tiques !== "object" || Array.isArray(tiques)) return {};
  const ids = new Set(todosLosViajes(viajes).flatMap((v) => [...v.gastos, ...(v.empresa ?? [])].map((g) => g.id)));
  return Object.fromEntries(Object.entries(tiques).filter(([id, url]) => ids.has(id) && typeof url === "string" && TIQUE_EN_COPIA.test(url)));
}

function crearCopia(crudo, ahora = new Date(), tiques = {}) {
  const datos = limpiarCopia(crudo);
  const fotos = tiquesDeCopia(tiques, datos.viajes);
  return { app: COPIA_APP, version: COPIA_VERSION, creada: ahora.toISOString(), datos, ...(Object.keys(fotos).length ? { tiques: fotos } : {}) };
}

function leerCopia(texto) {
  let copia;
  try {
    copia = JSON.parse(texto);
  } catch {
    return { error: "json" };
  }
  if (!copia || copia.app !== COPIA_APP || !copia.datos || typeof copia.datos !== "object") return { error: "otra" };
  if (!Number.isInteger(copia.version) || copia.version > COPIA_VERSION) return { error: "version" };
  const creada = typeof copia.creada === "string" && !Number.isNaN(Date.parse(copia.creada)) ? copia.creada : null;
  const datos = limpiarCopia(copia.datos);
  const tiques = tiquesDeCopia(copia.tiques, datos.viajes);
  return { datos, creada, ...(Object.keys(tiques).length ? { tiques } : {}) };
}

// Un viaje para pasárselo al grupo. Con su propio tipo, para que no se pueda
// restaurar como copia y te borre todo. Las notas no viajan, que son tuyas.
const PAQUETE_TIPO = "viaje";
const PAQUETE_VERSION = 1;

function crearPaquete(viaje) {
  return {
    app: COPIA_APP, tipo: PAQUETE_TIPO, version: PAQUETE_VERSION,
    nombre: viaje.nombre, personas: viaje.personas, gente: viaje.gente ?? [],
    gastos: viaje.gastos.map(({ nota: _, ...g }) => g),
  };
}

function leerPaquete(texto) {
  let crudo;
  try {
    crudo = JSON.parse(texto);
  } catch {
    return { error: "json" };
  }
  if (!crudo || crudo.app !== COPIA_APP || crudo.tipo !== PAQUETE_TIPO) return { error: "otra" };
  if (!Number.isInteger(crudo.version) || crudo.version > PAQUETE_VERSION) return { error: "version" };
  const gastos = leerGastos(crudo.gastos);
  if (!gastos.length) return { error: "vacio" };
  return { nombre: limpiarNombreViaje(crudo.nombre), personas: leerPersonas(crudo.personas), gente: leerGente(crudo.gente), gastos };
}

// Cada uno tiene a la gente numerada a su manera: en su lista él es el 0.
// Primero por el nombre; el resto, a los huecos libres, tú el último, porque
// quien te manda el archivo no eres tú.
function quienEsQuien(paquete, viaje) {
  const n = paquete.personas;
  const mios = Math.max(leerPersonas(viaje.personas), n);
  const mapa = Array(n).fill(null);
  const libres = new Set([...Array(mios).keys()].slice(1).concat(0));
  for (let i = 1; i < n; i += 1) {
    const nombre = normalizar(paquete.gente[i] ?? "");
    if (!nombre) continue;
    const j = [...libres].find((k) => normalizar(viaje.gente?.[k] ?? "") === nombre);
    if (j !== undefined) {
      mapa[i] = j;
      libres.delete(j);
    }
  }
  return mapa.map((j) => {
    if (j !== null) return j;
    const [primero] = libres;
    libres.delete(primero);
    return primero;
  });
}

const mapaValido = (mapa) => new Set(mapa).size === mapa.length;

// Si lo del otro va entre dos y tú sois cuatro, su "todos" no son tus cuatro:
// por eso pongo quiénes entran. Con una sola persona en su viaje no dice nada.
function aMiViaje({ pagador, entre: _e, partes: _p, ...gasto }, original, n, mapa, personas) {
  const mio = (i) => mapa[i < n ? i : 0];
  const quien = mio(leerPagador(pagador));
  const entran = n > 1 ? quienesEntran(original, n).map(mio) : [];
  const suyas = partesDe(original, n);
  return {
    ...gasto,
    ...(quien ? { pagador: quien } : {}),
    ...(entran.length && entran.length < personas ? { entre: leerEntre(entran) } : {}),
    ...(suyas ? { partes: Object.fromEntries(Object.entries(suyas).map(([i, p]) => [mio(Number(i)), p])) } : {}),
  };
}

// Lo mismo el mismo día y por lo mismo puede ser la cena que apuntasteis los
// dos, o dos cafés iguales: lo marco y decide quien lo importa.
function gastosParaJuntar(paquete, viaje, mapa) {
  const ids = new Set(viaje.gastos.map((g) => g.id));
  const to = sumarPorDivisa(viaje.gastos)[0]?.to ?? viaje.presupuesto?.to ?? sumarPorDivisa(paquete.gastos)[0].to;
  const personas = Math.max(leerPersonas(viaje.personas), paquete.personas);
  const parecido = (g) => viaje.gastos.some((m) => m.from === g.from && Math.abs(m.cantidad - g.cantidad) < 0.005
    && isoLocal(new Date(m.cuando)) === isoLocal(new Date(g.cuando)));
  const nuevos = paquete.gastos.filter((g) => !ids.has(g.id));
  const validos = nuevos.filter((g) => g.to === to);
  return {
    to,
    personas,
    yaEstan: paquete.gastos.length - nuevos.length,
    otraDivisa: nuevos.length - validos.length,
    filas: validos.map((g) => ({ gasto: aMiViaje(g, g, paquete.personas, mapa, personas), repetido: parecido(g) })),
  };
}

// Ordenados por fecha: la lista va siempre de lo último a lo primero.
function juntarGastos(viaje, nuevos, personas) {
  return { gastos: [...nuevos, ...viaje.gastos].sort((a, b) => b.cuando - a.cuando), personas: Math.max(leerPersonas(viaje.personas), personas) };
}

function resumenCopia(datos) {
  return {
    viajes: todosLosViajes(datos.viajes).length,
    gastos: todosLosViajes(datos.viajes).reduce((suma, v) => suma + v.gastos.length + (v.empresa?.length ?? 0), 0),
    avisos: datos.avisos?.length ?? 0,
    conversiones: datos.historialConversiones?.length ?? 0,
  };
}
