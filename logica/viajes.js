// Los viajes: la gente, las cuentas entre todos, los resúmenes y el cajero.

// Cada viaje con sus gastos y su presupuesto. Con más de ocho el desplegable ya
// no cabe en el popup, y quien quiera guardar viajes viejos tiene el CSV.
const VIAJES_MAX = 8;
const NOMBRE_VIAJE_MAX = 24;

const limpiarNombreViaje = (nombre) => String(nombre ?? "").replace(/\s+/g, " ").trim().slice(0, NOMBRE_VIAJE_MAX);

const viajeVacio = (id, nombre = "", color = COLOR_POR_DEFECTO) => ({ id, nombre: limpiarNombreViaje(nombre), gastos: [], presupuesto: null, cajero: [], personas: 1, color });

// El color de cada viaje, para saber de un vistazo en cuál estás apuntando. Los
// de antes, en el dorado de siempre.
const COLORES_VIAJE = ["oro", "azul", "coral", "jade", "lila", "rosa"];
const COLOR_POR_DEFECTO = "oro";
const leerColorViaje = (c) => (COLORES_VIAJE.includes(c) ? c : COLOR_POR_DEFECTO);

// Al nuevo, el primero que no tenga nadie. Con los seis cogidos, vuelta a empezar.
function colorLibre(lista) {
  const usados = new Set(lista.map((v) => v.color));
  return COLORES_VIAJE.find((c) => !usados.has(c)) ?? COLORES_VIAJE[lista.length % COLORES_VIAJE.length];
}

function siguienteColor(viajes, id) {
  return {
    ...viajes,
    lista: viajes.lista.map((v) => (v.id === id
      ? { ...v, color: COLORES_VIAJE[(COLORES_VIAJE.indexOf(leerColorViaje(v.color)) + 1) % COLORES_VIAJE.length] }
      : v)),
  };
}

// Los viajes de antes no dicen cuántos ibais: uno, que es como se veían.
const leerPersonas = (n) => (Number.isInteger(n) && n >= 1 && n <= PERSONAS_MAX ? n : 1);

// Lo que sale por cabeza en la divisa principal, que es la del total de arriba.
// Si alguno no entra en todo, "por cabeza" ya no es de nadie: va lo tuyo.
function porPersona(gastos, personas) {
  const principal = sumarPorDivisa(gastos)[0];
  if (!principal || leerPersonas(personas) < 2) return null;
  const consumo = consumoGente(gastos, personas);
  if (consumo && !consumo.igual) {
    const [tuyo] = consumo.gente;
    return { total: tuyo.parte, to: principal.to, personas, alDia: tuyo.alDia, tuyo: true };
  }
  const media = mediaPorDia(gastos);
  return { total: principal.total / personas, to: principal.to, personas, alDia: media ? media.media / personas : null };
}

// Lo que le toca a cada uno, no lo que ha pagado: lo de todos a partes iguales
// y lo de unos pocos solo entre ellos. Lo de al día, sin lo pagado aparte y con
// los mismos días que la media de arriba, como el por cabeza.
function consumoGente(gastos, personas) {
  const n = leerPersonas(personas);
  const cuentas = cuentasViaje(gastos, n);
  if (!cuentas) return null;
  const media = mediaPorDia(gastos);
  const diario = media ? cuentasViaje(delDiaADia(gastos), n) : null;
  const total = cuentas.gente.reduce((suma, p) => suma + p.parte, 0);
  return {
    to: cuentas.to,
    igual: !gastos.some((g) => g.to === cuentas.to && esRepartoDesigual(g, n)),
    gente: cuentas.gente.map((p, i) => ({
      parte: p.parte,
      fraccion: total > 0 ? p.parte / total : 0,
      alDia: diario ? diario.gente[i].parte / media.dias : null,
    })),
  };
}

const NOMBRE_PERSONA_MAX = 14;

// Solo los que has escrito; los huecos se quedan vacíos y salen como "Persona 3".
function leerGente(guardado) {
  if (!Array.isArray(guardado)) return [];
  const gente = guardado.slice(0, PERSONAS_MAX)
    .map((n) => String(typeof n === "string" ? n : "").replace(/\s+/g, " ").trim().slice(0, NOMBRE_PERSONA_MAX));
  while (gente.length && !gente.at(-1)) gente.pop();
  return gente;
}

function ponerNombre(gente, i, nombre) {
  if (!Number.isInteger(i) || i < 0 || i >= PERSONAS_MAX) return leerGente(gente);
  const nueva = [...leerGente(gente)];
  while (nueva.length <= i) nueva.push("");
  nueva[i] = nombre;
  return leerGente(nueva);
}

const nombrePersona = (gente, i) => gente?.[i] || (i === 0 ? tr("gente.tu") : tr("gente.persona", { n: i + 1 }));

// La letra del botón. Sin nombre, el número, que "P" serían todos.
function inicialPersona(gente, i) {
  const nombre = gente?.[i];
  if (nombre) return [...nombre][0].toLocaleUpperCase(localeActual());
  return i === 0 ? tr("gente.tuInicial") : String(i + 1);
}

// Quién ha puesto cuánto y quién le debe a quién, en la divisa del total. Si
// bajas la gente, lo que pagó alguien que ya no está cuenta como tuyo.
// Todo en céntimos: la parte de cada uno sale de repartirCentimos y así lo que
// se debe cuadra siempre con lo pagado, sin un céntimo de más ni de menos.
function cuentasViaje(gastos, personas, saldados = []) {
  const n = leerPersonas(personas);
  const principal = sumarPorDivisa(gastos)[0];
  if (!principal || n < 2) return null;
  const pagado = Array(n).fill(0);
  // Los de todos se reparten juntos, como siempre; los de unos pocos, cada
  // grupo por su lado. Así los viajes de antes salen al céntimo igual.
  const grupos = new Map();
  for (const g of gastos) {
    if (g.to !== principal.to) continue;
    const quien = leerPagador(g.pagador);
    const centimos = Math.round(g.valor * 100);
    pagado[quien < n ? quien : 0] += centimos;
    const entre = quienesEntran(g, n);
    const reparto = partesDe(g, n);
    const clave = `${entre.join(",")}|${JSON.stringify(reparto)}`;
    grupos.set(clave, { entre, pesos: entre.map((i) => reparto?.[i] ?? 1), centimos: (grupos.get(clave)?.centimos ?? 0) + centimos });
  }
  const partes = Array(n).fill(0);
  for (const { entre, pesos, centimos } of grupos.values()) {
    repartirPorPartes(centimos, pesos).forEach((c, k) => { partes[entre[k]] += c; });
  }
  const saldo = pagado.map((p, i) => p - partes[i]);

  // Lo ya devuelto mueve el saldo de los dos y nada más, así que si luego
  // cambia un gasto lo que queda se recalcula solo. Si alguien pagó de más,
  // le toca cobrar a él.
  let devuelto = 0;
  const hechos = [];
  for (const s of leerSaldados(saldados)) {
    const de = s.de < n ? s.de : 0;
    const a = s.a < n ? s.a : 0;
    if (s.to !== principal.to || de === a) continue;
    const centimos = Math.round(s.importe * 100);
    saldo[de] += centimos;
    saldo[a] -= centimos;
    devuelto += centimos;
    hechos.push({ ...s, de, a });
  }

  // El que más debe paga al que más tiene que cobrar, hasta que no quede nada:
  // salen como mucho n-1 pagos.
  const deben = saldo.map((s, i) => ({ i, s: -s })).filter((d) => d.s > 0).sort((a, b) => b.s - a.s);
  const cobran = saldo.map((s, i) => ({ i, s })).filter((c) => c.s > 0).sort((a, b) => b.s - a.s);
  const pagos = [];
  let d = 0;
  let c = 0;
  while (d < deben.length && c < cobran.length) {
    const importe = Math.min(deben[d].s, cobran[c].s);
    pagos.push({ de: deben[d].i, a: cobran[c].i, importe: importe / 100 });
    deben[d].s -= importe;
    cobran[c].s -= importe;
    if (deben[d].s === 0) d += 1;
    if (cobran[c].s === 0) c += 1;
  }
  return {
    to: principal.to,
    gente: pagado.map((p, i) => ({ pagado: p / 100, parte: partes[i] / 100, saldo: saldo[i] / 100 })),
    pagos,
    saldados: hechos,
    devuelto: devuelto / 100,
    queda: pagos.reduce((suma, p) => suma + Math.round(p.importe * 100), 0) / 100,
  };
}

// Lo que ya se ha pagado entre vosotros. Lo de antes no lo trae: nada.
function leerSaldados(guardado) {
  if (!Array.isArray(guardado)) return [];
  const vale = (i) => Number.isInteger(i) && i >= 0 && i < PERSONAS_MAX;
  return guardado
    .filter((s) => s && vale(s.de) && vale(s.a) && s.de !== s.a && isValidCode(s.to)
      && Number.isFinite(s.importe) && s.importe > 0 && typeof s.id === "string" && s.id)
    .map(({ id, de, a, importe, to, cuando }) => ({ id, de, a, importe: Math.round(importe * 100) / 100, to, cuando: Number.isFinite(cuando) ? cuando : 0 }));
}

function saldarPago(saldados, { de, a, importe }, to, { id, cuando = Date.now() }) {
  return leerSaldados([...leerSaldados(saldados), { id, de, a, importe, to, cuando }]);
}

const quitarSaldado = (saldados, id) => leerSaldados(saldados).filter((s) => s.id !== id);

function fraseSaldado({ de, a, importe }, gente, to) {
  const valor = `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(importe)} ${to}`;
  if (a === 0) return tr("gente.tePago", { de: nombrePersona(gente, de), valor });
  if (de === 0) return tr("gente.lesPagaste", { a: nombrePersona(gente, a), valor });
  return tr("gente.lePago", { de: nombrePersona(gente, de), a: nombrePersona(gente, a), valor });
}

// Contado desde ti, que eres quien lo lee: "Ana te debe", "le debes a Luis".
function frasePago({ de, a, importe }, gente, to) {
  const valor = `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(importe)} ${to}`;
  if (a === 0) return tr("gente.teDebe", { de: nombrePersona(gente, de), valor });
  if (de === 0) return tr("gente.lesDebes", { a: nombrePersona(gente, a), valor });
  return tr("gente.debe", { de: nombrePersona(gente, de), a: nombrePersona(gente, a), valor });
}

// El mensaje para cobrarle a uno por privado, con lo justo para que lo pueda
// repasar: lo que le toca, lo que puso y lo que ya te dio. Sale de las mismas
// cuentas que la pantalla, así que lo que pone que te debe es lo mismo al céntimo.
const COBRO_GASTOS_MAX = 6;

// Cómo te pagan: un enlace de PayPal o Revolut, tu Bizum, lo que uses. Va al
// mensaje tal cual lo escribes, en una sola línea.
const COMO_PAGAR_MAX = 80;
const leerComoPagar = (valor) => (typeof valor === "string" ? valor.replace(/\s+/g, " ").trim().slice(0, COMO_PAGAR_MAX) : "");

// Las que deja cobrar PayPal. Con otra el enlace va sin importe, que si no da error.
const DIVISAS_PAYPAL = ["AUD", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "EUR", "GBP", "HKD", "HUF", "ILS", "JPY", "MXN", "MYR", "NOK", "NZD", "PHP", "PLN", "SEK", "SGD", "THB", "USD"];
const PAYPAL_SIN_DECIMALES = ["JPY", "HUF"];

// A un paypal.me se le puede poner el importe detrás, y al abrirlo ya sale
// escrito. Si ya le pusiste tú uno, o es otra cosa, no lo toco.
function lineaDePago(como, importe, divisa) {
  const texto = leerComoPagar(como);
  const paypal = texto.match(/^(?:https?:\/\/)?(?:www\.)?paypal\.me\/([\w.-]+)\/?$/i);
  if (!paypal) return texto;
  const enlace = `https://paypal.me/${paypal[1]}`;
  if (!(importe > 0) || !DIVISAS_PAYPAL.includes(divisa)) return enlace;
  const cifra = PAYPAL_SIN_DECIMALES.includes(divisa) ? Math.round(importe) : Number(importe.toFixed(2));
  return `${enlace}/${cifra}${divisa}`;
}

function mensajeCobro({ nombre, gastos, personas, gente, saldados, comoPagar }, quien) {
  const n = leerPersonas(personas);
  const cuentas = cuentasViaje(gastos, n, saldados);
  const pago = cuentas?.pagos.find((p) => p.de === quien && p.a === 0);
  if (!pago) return "";
  const { to } = cuentas;
  const nf = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dinero = (v) => `${nf.format(v)} ${to}`;
  const suyo = cuentas.gente[quien];
  const total = sumarPorDivisa(gastos)[0].total;
  const delPrincipal = gastos.filter((g) => g.to === to).sort((a, b) => a.cuando - b.cuando);
  const que = (g) => g.concepto || nombreCategoria(g.categoria);
  // Más de seis gastos en un mensaje ya no se leen: el resto va contado.
  const lista = (unos, texto) => {
    const lineas = unos.slice(0, COBRO_GASTOS_MAX).map(texto);
    if (unos.length > COBRO_GASTOS_MAX) lineas.push(tr("cobro.mas", { n: unos.length - COBRO_GASTOS_MAX }));
    return lineas.join(" · ");
  };

  const igual = !delPrincipal.some((g) => esRepartoDesigual(g, n));
  const lineas = [
    `*🧳 ${nombre}*`,
    tr(igual ? "cobro.toca" : "cobro.tocaDe", { nombre: nombrePersona(gente, quien), parte: `*${dinero(suyo.parte)}*`, total: dinero(total), n }),
  ];
  const conEl = delPrincipal.filter((g) => !partesDe(g, n) && entreDe(g, n)?.includes(quien));
  if (conEl.length) {
    lineas.push(`👥 ${tr("cobro.algunos", { gastos: lista(conEl, (g) => tr("cobro.entre", { que: que(g), valor: nf.format(g.valor), n: entreDe(g, n).length })) })}`);
  }
  const aPartes = delPrincipal.filter((g) => partesDe(g, n) && quienesEntran(g, n).includes(quien));
  if (aPartes.length) {
    const cuantas = numeros({ maximumFractionDigits: 1 });
    lineas.push(`⚖️ ${tr("cobro.aPartes", { gastos: lista(aPartes, (g) => {
      const reparto = partesDe(g, n);
      const total = quienesEntran(g, n).reduce((suma, i) => suma + (reparto[i] ?? 1), 0);
      return tr("cobro.parte", { que: que(g), valor: nf.format(g.valor), suyas: cuantas.format(reparto[quien] ?? 1), total: cuantas.format(total) });
    }) })}`);
  }
  // El que ya no está cuenta como tú, igual que en las cuentas.
  const puso = delPrincipal.filter((g) => { const p = leerPagador(g.pagador); return (p < n ? p : 0) === quien; });
  if (puso.length) lineas.push(`💳 ${tr("cobro.puso", { valor: dinero(suyo.pagado), gastos: lista(puso, (g) => `${que(g)} ${nf.format(g.valor)}`) })}`);
  for (const s of cuentas.saldados) {
    if (s.de === quien) lineas.push(`✓ ${s.a === 0 ? tr("cobro.meDiste", { valor: dinero(s.importe) }) : tr("cobro.leDiste", { valor: dinero(s.importe), a: nombrePersona(gente, s.a) })}`);
    else if (s.a === quien) lineas.push(`✓ ${tr("cobro.teDio", { valor: dinero(s.importe), de: nombrePersona(gente, s.de) })}`);
  }
  lineas.push(`💸 *${tr("cobro.meDebes", { valor: dinero(pago.importe) })}*`);
  const como = lineaDePago(comoPagar, pago.importe, to);
  if (como) lineas.push(`👉 ${como}`);
  for (const otro of cuentas.pagos) {
    if (otro.de === quien && otro.a !== 0) lineas.push(tr("cobro.yA", { a: nombrePersona(gente, otro.a), valor: dinero(otro.importe) }));
  }
  return lineas.join("\n");
}

// Si nadie ha marcado otro pagador es que no lo usas: no hay cuentas que contar.
const hayOtrosPagadores = (gastos, personas) => gastos.some((g) => g.pagador > 0 && g.pagador < leerPersonas(personas));

// Los viajes acabados, aparte: no cuentan para los ocho ni salen en el
// desplegable, pero siguen ahí para mirarlos. Cuarenta son años de viajes.
const ARCHIVADOS_MAX = 40;

const leerViaje = (v) => ({
  id: v.id, nombre: limpiarNombreViaje(v.nombre), gastos: leerGastos(v.gastos), presupuesto: leerPresupuesto(v.presupuesto),
  cajero: leerRetiradas(v.cajero), personas: leerPersonas(v.personas), color: leerColorViaje(v.color),
  ...(leerGente(v.gente).length ? { gente: leerGente(v.gente) } : {}),
  ...(leerSaldados(v.saldados).length ? { saldados: leerSaldados(v.saldados) } : {}),
  ...(leerTramos(v.tramos).length ? { tramos: leerTramos(v.tramos) } : {}),
  ...(leerPendientes(v.pendientes).length ? { pendientes: leerPendientes(v.pendientes) } : {}),
  ...(leerGastos(v.empresa).length ? { empresa: leerGastos(v.empresa) } : {}),
  ...(leerListo(v.listo).length ? { listo: leerListo(v.listo) } : {}),
});

// Sin archivados no lo guardo: así lo de antes sale igual que siempre.
const conArchivados = ({ archivados: _, ...viajes }, archivados) => (archivados.length ? { ...viajes, archivados } : viajes);

// Antes de los viajes había una sola lista y un presupuesto sueltos: pasan a
// ser el primer viaje, sin nombre, para que nadie pierda lo que tenía.
function leerViajes(guardado, gastosSueltos, presupuestoSuelto) {
  const vistos = new Set();
  const buenos = (lista) => (Array.isArray(lista) ? lista : [])
    .filter((v) => v && typeof v.id === "string" && v.id && !vistos.has(v.id) && vistos.add(v.id));
  const lista = buenos(guardado?.lista).slice(0, VIAJES_MAX).map(leerViaje);
  const archivados = buenos(guardado?.archivados).slice(0, ARCHIVADOS_MAX).map(leerViaje);
  if (lista.length === 0) {
    const id = vistos.has("primero") ? `primero-${vistos.size}` : "primero";
    lista.push({ ...viajeVacio(id), gastos: leerGastos(gastosSueltos), presupuesto: leerPresupuesto(presupuestoSuelto) });
  }
  const activo = lista.some((v) => v.id === guardado?.activo) ? guardado.activo : lista[0].id;
  return conArchivados({ activo, lista }, archivados);
}

const idUsado = (viajes, id) => [...viajes.lista, ...(viajes.archivados ?? [])].some((v) => v.id === id);

const viajeActivo = (viajes) => viajes.lista.find((v) => v.id === viajes.activo);

// El nuevo es al que vas: lo creas para empezar a apuntar en él.
function crearViaje(viajes, id, nombre) {
  const limpio = limpiarNombreViaje(nombre);
  if (!limpio || viajes.lista.length >= VIAJES_MAX || idUsado(viajes, id)) return viajes;
  return { ...viajes, activo: id, lista: [...viajes.lista, viajeVacio(id, limpio, colorLibre(viajes.lista))] };
}

// "Lisboa" → "Lisboa (2)", y si ya está, "Lisboa (3)". Entre paréntesis, que
// "Japón 2026" ya lleva un número. Recorto el nombre para que quepa siempre.
function nombreCopia(nombre, lista) {
  const base = limpiarNombreViaje(nombre).replace(/ \(\d+\)$/, "");
  if (!base) return "";
  const usados = new Set(lista.map((v) => v.nombre));
  for (let n = 2; ; n += 1) {
    const cola = ` (${n})`;
    const nuevo = `${base.slice(0, NOMBRE_VIAJE_MAX - cola.length).trim()}${cola}`;
    if (!usados.has(nuevo)) return nuevo;
  }
}

// El nombre del viaje nuevo, si no escribes otro: el país de la divisa de allí,
// con su bandera. Con el euro no: no dice a qué país vas.
function nombreDeDestino(code, lista = []) {
  if (!isValidCode(code) || code === "EUR") return "";
  const region = code.slice(0, 2);
  const nombres = (style) => new Intl.DisplayNames([localeActual()], { type: "region", style }).of(region);
  // "RAE de Hong Kong (China)" no cabe; el corto se queda en "Hong Kong".
  const largo = nombres("long");
  const pais = /\(|SAR/.test(largo) ? nombres("short") : largo;
  const nombre = limpiarNombreViaje(`${banderaDivisa(code)} ${pais}`);
  return lista.some((v) => v.nombre === nombre) ? nombreCopia(nombre, lista) : nombre;
}

// Para la escapada que repites: el presupuesto y la gente, sin un solo gasto.
// Las fechas del otro ya pasaron, así que empieza hoy y dura lo mismo. Con otro
// color, que si no no sabrías en cuál apuntas.
function duplicarViaje(viajes, id, nuevoId, { nombre = "", hoyIso = hoy() } = {}) {
  const origen = viajes.lista.find((v) => v.id === id);
  if (!origen || viajes.lista.length >= VIAJES_MAX || idUsado(viajes, nuevoId)) return viajes;
  let presupuesto = null;
  if (origen.presupuesto) {
    const dias = Math.max(diasHasta(origen.presupuesto.hasta, inicioDelViaje(origen.presupuesto, origen.gastos, hoyIso)), 1);
    const [a, m, d] = hoyIso.split("-").map(Number);
    presupuesto = { importe: origen.presupuesto.importe, to: origen.presupuesto.to, desde: hoyIso, hasta: isoLocal(new Date(a, m - 1, d + dias - 1)) };
    if (origen.presupuesto.categorias) presupuesto.categorias = { ...origen.presupuesto.categorias };
  }
  const copia = {
    ...viajeVacio(nuevoId, limpiarNombreViaje(nombre) || nombreCopia(origen.nombre, viajes.lista), colorLibre(viajes.lista)),
    presupuesto,
    personas: origen.personas,
    ...(origen.gente?.length ? { gente: origen.gente } : {}),
  };
  return { ...viajes, activo: nuevoId, lista: [...viajes.lista, copia] };
}

function renombrarViaje(viajes, id, nombre) {
  const limpio = limpiarNombreViaje(nombre);
  if (!limpio) return viajes;
  return { ...viajes, lista: viajes.lista.map((v) => (v.id === id ? { ...v, nombre: limpio } : v)) };
}

function elegirViaje(viajes, id) {
  return viajes.lista.some((v) => v.id === id) ? { ...viajes, activo: id } : viajes;
}

// El último no se borra: para dejarlo limpio ya está "Vaciar". Si borras el que
// tenías abierto, pasas al que tenía al lado.
function borrarViaje(viajes, id) {
  const i = viajes.lista.findIndex((v) => v.id === id);
  if (i === -1 || viajes.lista.length <= 1) return viajes;
  const lista = viajes.lista.filter((v) => v.id !== id);
  const activo = viajes.activo === id ? lista[Math.min(i, lista.length - 1)].id : viajes.activo;
  return { ...viajes, activo, lista };
}

// Al archivo, el primero de la lista: el último que acabas es el que buscarás.
// Como al borrar, el último que queda no se va, y si era el abierto pasas al de al lado.
function archivarViaje(viajes, id) {
  const archivados = viajes.archivados ?? [];
  const viaje = viajes.lista.find((v) => v.id === id);
  if (!viaje || viajes.lista.length <= 1 || archivados.length >= ARCHIVADOS_MAX) return viajes;
  return conArchivados(borrarViaje(viajes, id), [viaje, ...archivados]);
}

// Lo sacas para mirarlo o apuntar algo que faltaba: vuelve a la lista y se abre.
function desarchivarViaje(viajes, id) {
  const archivados = viajes.archivados ?? [];
  const viaje = archivados.find((v) => v.id === id);
  if (!viaje || viajes.lista.length >= VIAJES_MAX) return viajes;
  return conArchivados({ ...viajes, activo: id, lista: [...viajes.lista, viaje] }, archivados.filter((v) => v.id !== id));
}

function borrarArchivado(viajes, id) {
  const archivados = viajes.archivados ?? [];
  if (!archivados.some((v) => v.id === id)) return viajes;
  return conArchivados(viajes, archivados.filter((v) => v.id !== id));
}

const todosLosViajes = (viajes) => [...viajes.lista, ...(viajes.archivados ?? [])];

// Para el gasto que apuntaste con el viaje equivocado abierto. Va con su tasa
// y su fecha, como estaba. Si el otro ya tiene 200, no cabe y no se mueve.
// Con el sitio de antes, para que deshacerlo lo deje donde estaba.
function moverGasto(viajes, gastoId, desdeId, aId, indice) {
  const desde = viajes.lista.find((v) => v.id === desdeId);
  const destino = viajes.lista.find((v) => v.id === aId);
  if (!desde || !destino || desde === destino) return viajes;
  const gasto = desde.gastos.find((g) => g.id === gastoId);
  if (!gasto || destino.gastos.length >= GASTOS_MAX || destino.gastos.some((g) => g.id === gastoId)) return viajes;
  return {
    ...viajes,
    lista: viajes.lista.map((v) => {
      if (v === desde) return { ...v, gastos: quitarGasto(v.gastos, gastoId) };
      if (v === destino) return { ...v, gastos: Number.isInteger(indice) ? devolverGasto(v.gastos, gasto, indice) : apuntarGasto(v.gastos, gasto) };
      return v;
    }),
  };
}

function cambiarViaje(viajes, id, cambios) {
  return { ...viajes, lista: viajes.lista.map((v) => (v.id === id ? { ...v, ...cambios } : v)) };
}

// El viaje al calendario (.ics): las fechas del viaje, cada tramo y lo
// pendiente con el día en que toca pagarlo, con un aviso a las nueve. Todo de
// día entero, que la hora de un vuelo no la sé y un calendario con horas
// inventadas es peor que uno sin ellas.
const AVISO_PENDIENTE_ICS = "PT9H";

const otroDia = (iso, paso) => {
  const [a, m, d] = iso.split("-").map(Number);
  return isoLocal(new Date(a, m - 1, d + paso));
};
const diaSiguiente = (iso) => otroDia(iso, 1);
const fechaIcs = (iso) => iso.replaceAll("-", "");
// Las comas, los puntos y comas y las barras van escapados; los saltos, como \n.
const textoIcs = (texto) => String(texto).replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, "\\n");

// Las líneas de más de 75 bytes se parten, y por bytes, no por letras: una
// tilde son dos y una bandera, ocho. Nunca por la mitad de una letra.
function plegarIcs(linea) {
  const trozos = [];
  let actual = "";
  let bytes = 0;
  for (const letra of linea) {
    const largo = new TextEncoder().encode(letra).length;
    const max = trozos.length ? 74 : 75;
    if (bytes + largo > max) {
      trozos.push(actual);
      actual = "";
      bytes = 0;
    }
    actual += letra;
    bytes += largo;
  }
  trozos.push(actual);
  return trozos.join("\r\n ");
}

function eventosDelViaje(viaje, hoyIso = hoy()) {
  const { presupuesto = null, gastos = [] } = viaje ?? {};
  const nombre = viaje?.nombre || tr("viajes.sinNombre");
  const eventos = [];
  const hasta = presupuesto?.hasta ?? null;
  const desde = hasta ? inicioDelViaje(presupuesto, gastos, hoyIso) : null;
  if (desde && hasta && desde <= hasta) {
    const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
    eventos.push({
      uid: "viaje", desde, hasta,
      titulo: `✈️ ${nombre}`,
      nota: tr("calendario.presupuesto", { importe: `${dinero.format(presupuesto.importe)} ${presupuesto.to}` }),
    });
  }
  // Cada tramo hasta el día antes del siguiente; el último, hasta la vuelta.
  const tramos = leerTramos(viaje?.tramos);
  tramos.forEach((t, i) => {
    const siguiente = tramos[i + 1];
    const fin = siguiente ? otroDia(siguiente.desde, -1) : hasta && hasta >= t.desde ? hasta : t.desde;
    eventos.push({ uid: `tramo-${t.id}`, desde: t.desde, hasta: fin, titulo: `📍 ${t.nombre}`, nota: nombre });
  });
  for (const p of leerPendientes(viaje?.pendientes)) {
    if (!p.vence) continue;
    const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const que = p.concepto || nombreCategoria(p.categoria);
    eventos.push({
      uid: `pendiente-${p.id}`, desde: p.vence, hasta: p.vence,
      titulo: tr("calendario.pagar", { que, importe: `${dinero.format(p.cantidad)} ${p.from}` }),
      nota: tr("calendario.pagarNota", { viaje: nombre, valor: `${dinero.format(p.valor)} ${p.to}` }),
      aviso: true,
    });
  }
  return eventos;
}

function calendarioViaje(viaje, { ahora = Date.now(), hoyIso = hoy() } = {}) {
  const eventos = eventosDelViaje(viaje, hoyIso);
  if (!eventos.length) return null;
  const sello = new Date(ahora).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lineas = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ConversorDivisas//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  for (const e of eventos) {
    lineas.push(
      "BEGIN:VEVENT",
      // El mismo uid cada vez: si lo importas otra vez, se actualiza en vez de duplicarse.
      `UID:${viaje.id}-${e.uid}@conversordivisas`,
      `DTSTAMP:${sello}`,
      `DTSTART;VALUE=DATE:${fechaIcs(e.desde)}`,
      // El final de un evento de día entero es el día siguiente, no el último.
      `DTEND;VALUE=DATE:${fechaIcs(diaSiguiente(e.hasta))}`,
      `SUMMARY:${textoIcs(e.titulo)}`,
      `DESCRIPTION:${textoIcs(e.nota)}`,
      "TRANSP:TRANSPARENT",
    );
    if (e.aviso) lineas.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${textoIcs(e.titulo)}`, `TRIGGER;RELATED=START:${AVISO_PENDIENTE_ICS}`, "END:VALARM");
    lineas.push("END:VEVENT");
  }
  lineas.push("END:VCALENDAR");
  return `${lineas.map(plegarIcs).join("\r\n")}\r\n`;
}

const archivoCalendario = (nombre) => archivoGastos(nombre).replace(/^[^-]+/, tr("calendario.archivo"));

// "Japón 2026" → "gastos-japon-2026": sin tildes ni espacios, que algunos
// sistemas los llevan mal en los nombres de archivo. Sin nombre, el de siempre.
function archivoGastos(nombre) {
  const limpio = normalizar(String(nombre ?? "")).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return limpio ? tr("csv.archivoViaje", { nombre: limpio }) : tr("csv.archivoGastos");
}

function resumenViaje(viaje) {
  return { n: viaje.gastos.length, total: sumarPorDivisa(viaje.gastos)[0] ?? null };
}

// Para comparar viajes, lo justo es lo de cada día: una semana en Japón siempre
// suma más que un finde en Lisboa. Cuento del primer día con gastos al último.
// Solo se comparan los de la divisa más repetida; con otra no tengo con qué.
function compararViajes(lista) {
  const filas = lista.map((viaje) => {
    const diarios = delDiaADia(viaje.gastos);
    const total = sumarPorDivisa(diarios)[0];
    if (!total) return { id: viaje.id, media: null };
    const dias = gastosPorDia(diarios).map((d) => d.dia).sort();
    const n = diasHasta(dias[dias.length - 1], dias[0]);
    const [top] = desglose(viaje.gastos);
    return { id: viaje.id, media: total.total / n, to: total.to, dias: n, categoria: top ?? null };
  });
  const veces = new Map();
  for (const f of filas) if (f.media !== null) veces.set(f.to, (veces.get(f.to) ?? 0) + 1);
  const comun = [...veces].sort((a, b) => b[1] - a[1])[0]?.[0];
  const comparables = filas.filter((f) => f.media !== null && f.to === comun);
  const max = Math.max(...comparables.map((f) => f.media));
  const min = Math.min(...comparables.map((f) => f.media));
  return filas.map((f) => {
    if (f.media === null) return f;
    const cuenta = f.to === comun && comparables.length > 1;
    return {
      ...f,
      peso: cuenta ? f.media / max : null,
      // Si todos gastan lo mismo, ninguno es el caro ni el barato.
      extremo: !cuenta || max === min ? null : f.media === max ? "caro" : f.media === min ? "barato" : null,
    };
  });
}

// Lo mismo que gastaste, con el cambio de hoy y la comisión que llevaba cada
// gasto: si el yen ha caído, Japón te sale más barato que cuando fuiste. Solo
// es la divisa, los precios de allí también habrán cambiado. tasas[code] es lo
// que vale hoy 1 de esa divisa en la del viaje; sin tasa, el gasto cuenta igual.
function viajeConTasasDeHoy(viaje, tasas) {
  const total = sumarPorDivisa(viaje?.gastos ?? [])[0];
  if (!total || !tasas) return null;
  const suyos = viaje.gastos.filter((g) => g.to === total.to);
  let antes = 0;
  let hoy = 0;
  let sinTasa = 0;
  for (const g of suyos) {
    antes += g.valor;
    const t = tasas[g.from];
    if (t > 0) {
      hoy += conComision(g.cantidad * t, g.comision ?? 0);
    } else {
      hoy += g.valor;
      sinTasa += 1;
    }
  }
  if (sinTasa === suyos.length || !(antes > 0)) return null;
  const diferencia = hoy - antes;
  return { to: total.to, antes, hoy, diferencia, pct: diferencia / antes, parcial: sinTasa > 0 };
}

// Por debajo de un 1 % no lo cuento como cambio: son los decimales de la tasa.
const VIAJE_HOY_IGUAL = 0.01;

function textoViajeHoy(r) {
  if (!r) return null;
  const dinero = numeros({ maximumFractionDigits: 0 });
  const titulo = tr("viajeHoy.titulo", { antes: `${dinero.format(r.antes)} ${r.to}`, hoy: `${dinero.format(r.hoy)} ${r.to}` });
  if (Math.abs(r.pct) < VIAJE_HOY_IGUAL) return { tono: "igual", texto: tr("viajeHoy.igual"), titulo };
  const pct = porCiento(Math.round(Math.abs(r.pct) * 100));
  const diferencia = `${r.diferencia > 0 ? "+" : "−"}${dinero.format(Math.abs(r.diferencia))}\u00a0${r.to}`;
  return {
    tono: r.diferencia > 0 ? "caro" : "barato",
    texto: tr(r.diferencia > 0 ? "viajeHoy.caro" : "viajeHoy.barato", { pct, diferencia }),
    titulo,
  };
}

// ¿Y si hubieras cambiado antes? En un viaje acabado, lo que te habrías
// ahorrado comprando la divisa de allí el mejor día del mes de antes de salir.
// Solo la tasa: la comisión la habrías pagado igual.
const DIAS_ANTES_DE_CAMBIAR = 30;

function cambioAntes(viaje) {
  const gastos = (viaje?.gastos ?? []).filter((g) => g.cantidad > 0 && g.from !== g.to);
  if (!gastos.length) return null;
  const to = sumarPorDivisa(gastos)[0].to;
  const porDivisa = new Map();
  for (const g of gastos) if (g.to === to) porDivisa.set(g.from, (porDivisa.get(g.from) ?? 0) + g.valor);
  const from = [...porDivisa].sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!from) return null;
  const primero = isoLocal(new Date(Math.min(...gastos.map((g) => g.cuando))));
  const inicio = viaje.presupuesto?.desde && viaje.presupuesto.desde < primero ? viaje.presupuesto.desde : primero;
  return { from, to, desde: otroDia(inicio, -DIAS_ANTES_DE_CAMBIAR), hasta: otroDia(inicio, -1) };
}

// Por debajo de un 1 % no merece la pena: cambiaste bien.
const AHORRO_MINIMO = 0.01;

function ahorroCambiandoAntes(viaje, serie) {
  const par = cambioAntes(viaje);
  const puntos = (Array.isArray(serie) ? serie : []).filter((p) => p.valor > 0 && esIso(p.fecha));
  if (!par || !puntos.length) return null;
  const mejor = puntos.reduce((a, b) => (b.valor < a.valor ? b : a));
  let pagado = 0;
  let conMejor = 0;
  for (const g of viaje.gastos) {
    if (g.from !== par.from || g.to !== par.to || !(g.cantidad > 0)) continue;
    pagado += g.valor / (1 + leerComision(g.comision) / 100);
    conMejor += g.cantidad * mejor.valor;
  }
  if (!(pagado > 0)) return null;
  const ahorro = pagado - conMejor;
  return { ...par, dia: mejor.fecha, tasa: mejor.valor, pagado, ahorro, pct: ahorro / pagado, bien: ahorro / pagado < AHORRO_MINIMO };
}

function textoCambioAntes(r) {
  if (!r) return null;
  const titulo = tr("cambioAntes.titulo", { from: r.from, dia: fechaCorta(r.dia), tasa: `1 ${r.from} = ${tasaLegible(r.tasa)} ${r.to}` });
  if (r.bien) return { texto: tr("cambioAntes.bien"), titulo };
  const dinero = numeros({ maximumFractionDigits: 0 });
  const texto = tr("cambioAntes.ahorro", {
    ahorro: `${dinero.format(r.ahorro)}\u00a0${r.to}`,
    pct: porCiento(Math.round(r.pct * 100)),
    dia: fechaCorta(r.dia),
  });
  return { texto, titulo };
}

const EMOJI_CATEGORIA = {
  comida: "🍽️", transporte: "🚕", alojamiento: "🏨", ocio: "🎟️", compras: "🛍️", otros: "📌",
};

// Lo que se comenta en el grupo. Con un gasto, el más caro es el total; y con
// dos días, el que más se ve a simple vista en la lista de días.
function destacados(todos, hoyIso = hoy()) {
  const gastos = delDiaADia(todos);
  const [principal] = sumarPorDivisa(gastos);
  if (!principal || gastos.length < 2) return { caro: null, dia: null, barato: null };
  const suyos = gastos.filter((g) => g.to === principal.to);
  const caro = suyos.reduce((max, g) => (g.valor > max.valor ? g : max));
  const dias = gastosPorDia(suyos).map(({ dia, totales }) => ({ dia, total: totales[0].total, to: principal.to }));
  const dia = dias.length >= 3 ? dias.reduce((max, d) => (d.total > max.total ? d : max)) : null;
  // Hoy no cuenta para el barato: a mediodía siempre ganaría, y aún no ha acabado.
  const cerrados = dias.filter((d) => d.dia !== hoyIso);
  const menor = cerrados.length >= 3 ? cerrados.reduce((min, d) => (d.total < min.total ? d : min)) : null;
  const barato = dia && menor && menor.total < dia.total ? menor : null;
  return { caro, dia, barato };
}

// ¿El finde se gasta más? Media por día de cada lado, con los días sin nada
// como cero, que en el viaje estabas igual. Hoy fuera, que aún no ha acabado.
// Por debajo de un 10 % de diferencia no lo cuento: es lo mismo.
const FINDE_MINIMO = 0.1;

function findeContraSemana(todos, hoyIso = hoy()) {
  const gastos = delDiaADia(todos);
  const [principal] = sumarPorDivisa(gastos);
  if (!principal) return null;
  const porDia = new Map();
  for (const g of gastos) {
    const dia = isoLocal(new Date(g.cuando));
    if (g.to === principal.to && dia < hoyIso) porDia.set(dia, (porDia.get(dia) ?? 0) + g.valor);
  }
  const dias = [...porDia.keys()].sort();
  if (dias.length === 0) return null;
  const lados = { finde: { total: 0, dias: 0 }, semana: { total: 0, dias: 0 } };
  const [a, m, d] = dias[0].split("-").map(Number);
  for (let i = 0; i < diasHasta(dias[dias.length - 1], dias[0]); i += 1) {
    const fecha = new Date(a, m - 1, d + i);
    const lado = lados[fecha.getDay() % 6 === 0 ? "finde" : "semana"];
    lado.total += porDia.get(isoLocal(fecha)) ?? 0;
    lado.dias += 1;
  }
  if (lados.finde.dias === 0 || lados.semana.dias === 0) return null;
  const finde = lados.finde.total / lados.finde.dias;
  const semana = lados.semana.total / lados.semana.dias;
  const [mayor, menor] = finde > semana ? [finde, semana] : [semana, finde];
  if (!(menor > 0) || mayor / menor - 1 < FINDE_MINIMO) return null;
  // "Un 590 % más" no se entiende; a partir del doble lo digo en veces.
  const veces = mayor / menor >= 2 ? Math.round(mayor / menor) : null;
  return { gana: finde > semana ? "finde" : "semana", mas: mayor / menor - 1, veces, finde, semana, to: principal.to };
}

// Lo que más se repite: "☕ Café: 12 veces". Con menos de tres no es costumbre.
// "café" y "Cafe" son el mismo, y se escribe como la última vez.
const ESTRELLA_MINIMO = 3;

function conceptoEstrella(gastos) {
  const [principal] = sumarPorDivisa(gastos);
  if (!principal) return null;
  const grupos = new Map();
  for (const g of [...gastos].sort((a, b) => a.cuando - b.cuando)) {
    const clave = normalizar(g.concepto);
    if (!clave || g.to !== principal.to || esDevolucion(g)) continue;
    const grupo = grupos.get(clave) ?? { veces: 0, total: 0 };
    grupos.set(clave, { veces: grupo.veces + 1, total: grupo.total + g.valor, concepto: g.concepto, categoria: g.categoria });
  }
  // A igual número de veces, el que más suma: es del que se habla.
  const [mejor] = [...grupos.values()].sort((a, b) => b.veces - a.veces || b.total - a.total);
  return mejor && mejor.veces >= ESTRELLA_MINIMO ? { ...mejor, to: principal.to } : null;
}

// El índice del café: lo mismo comprado en cada viaje, lado a lado. Con la
// mediana y no la media, que un "café" de cuatro no me suba el de Lisboa.
// Fuera las noches repartidas, lo pagado aparte y las devoluciones.
const INDICE_MAX = 5;

function indiceCafe(lista) {
  const principales = lista.map((v) => sumarPorDivisa(v.gastos)[0]?.to).filter(Boolean);
  const veces = new Map();
  for (const to of principales) veces.set(to, (veces.get(to) ?? 0) + 1);
  const comun = [...veces].sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!comun) return [];
  const conceptos = new Map();
  for (const viaje of lista) {
    const suyos = [...viaje.gastos]
      .filter((g) => g.to === comun && g.valor > 0 && !esFijo(g) && !esDevolucion(g) && !/-\d+$/.test(g.id))
      .sort((a, b) => a.cuando - b.cuando);
    for (const g of suyos) {
      const clave = normalizar(g.concepto.trim());
      if (!clave) continue;
      const concepto = conceptos.get(clave) ?? { porViaje: new Map() };
      const precios = concepto.porViaje.get(viaje.id) ?? [];
      concepto.porViaje.set(viaje.id, [...precios, g.valor]);
      // Se escribe como la última vez, igual que en la estrella.
      conceptos.set(clave, { ...concepto, concepto: g.concepto.trim(), categoria: g.categoria, ultimo: g.cuando });
    }
  }
  return [...conceptos.values()]
    .filter((c) => c.porViaje.size >= 2)
    .map((c) => {
      const viajes = [...c.porViaje].map(([id, precios]) => ({ id, precio: mediana(precios), veces: precios.length }))
        .sort((a, b) => a.precio - b.precio);
      const min = viajes[0].precio;
      const max = viajes[viajes.length - 1].precio;
      const n = viajes.reduce((suma, v) => suma + v.veces, 0);
      return {
        concepto: c.concepto, categoria: c.categoria, to: comun, n, ultimo: c.ultimo,
        // Por debajo de un céntimo es lo mismo: ni caro ni barato.
        veces: max - min >= 0.01 && min > 0 ? max / min : null,
        viajes: viajes.map((v) => ({
          ...v, peso: v.precio / max,
          extremo: max - min < 0.01 ? null : v.precio === min ? "barato" : v.precio === max ? "caro" : null,
        })),
      };
    })
    // Lo que sale en más viajes primero; luego lo que más compras.
    .sort((a, b) => b.viajes.length - a.viajes.length || b.n - a.n || b.ultimo - a.ultimo)
    .slice(0, INDICE_MAX)
    .map(({ ultimo, ...c }) => c);
}

// Para pegarlo en WhatsApp: lo de entre asteriscos sale en negrita, y en
// cualquier otro sitio se lee igual de bien. Los días van del primero al último,
// que es como se cuenta un viaje.
function resumenParaCompartir({ nombre, gastos, presupuesto, personas, gente, saldados }, hoyIso = hoy(), { sinDias = false } = {}) {
  if (gastos.length === 0) return "";
  const dinero = (n, to) => `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ${to}`;
  const sumas = (totales) => totales.map(({ total, to }) => dinero(total, to)).join(" + ");
  const n = gastos.length;

  const lineas = [
    `*🧳 ${nombre}*`,
    tr("compartir.total", { total: `*${sumas(sumarPorDivisa(gastos))}*`, n: n === 1 ? tr("gastos.uno") : tr("gastos.n", { n }) }),
  ];
  const porGasto = mediaPorGasto(gastos);
  if (porGasto) lineas[1] += ` ${tr("compartir.porGasto", { valor: dinero(porGasto.media, porGasto.to) })}`;
  const cabeza = porPersona(gastos, personas);
  if (cabeza?.tuyo) {
    const { gente: partes, to } = consumoGente(gastos, personas);
    const cada = partes.map((p, i) => `${nombrePersona(gente, i)} *${dinero(p.parte, to)}*`).join(" · ");
    lineas.push(tr("compartir.cadaUno", { cada }));
  } else if (cabeza) {
    const datos = { personas: cabeza.personas, valor: dinero(cabeza.total, cabeza.to) };
    lineas.push(cabeza.alDia
      ? tr("compartir.porPersonaDia", { ...datos, dia: dinero(cabeza.alDia, cabeza.to) })
      : tr("compartir.porPersona", datos));
  }
  if (hayOtrosPagadores(gastos, personas)) {
    const cuentas = cuentasViaje(gastos, personas, saldados);
    for (const pago of cuentas.pagos) lineas.push(`💸 ${frasePago(pago, gente, cuentas.to)}`);
    if (cuentas.pagos.length === 0) lineas.push(tr("gente.enPaz"));
  }

  const { caro, dia, barato } = destacados(gastos, hoyIso);
  if (caro) {
    const que = caro.concepto || nombreCategoria(caro.categoria);
    lineas.push(tr("compartir.caro", { que, valor: dinero(caro.valor, caro.to), dia: nombreDia(isoLocal(new Date(caro.cuando)), hoyIso) }));
  }
  if (dia) lineas.push(tr("compartir.diaMas", { dia: nombreDia(dia.dia, hoyIso), valor: dinero(dia.total, dia.to) }));
  if (barato) lineas.push(tr("compartir.diaMenos", { dia: nombreDia(barato.dia, hoyIso), valor: dinero(barato.total, barato.to) }));
  const estrella = conceptoEstrella(gastos);
  if (estrella) {
    lineas.push(tr("compartir.estrella", {
      emoji: emojiCategoria(estrella.categoria),
      que: estrella.concepto, veces: estrella.veces, valor: dinero(estrella.total, estrella.to),
    }));
  }
  const finde = findeContraSemana(gastos, hoyIso);
  if (finde) {
    lineas.push(finde.veces
      ? tr(`compartir.${finde.gana}Veces`, { veces: finde.veces })
      : tr(`compartir.${finde.gana}`, { pct: tr("pct", { n: Math.round(finde.mas * 100) }) }));
  }
  const pagadas = comisionesPagadas(gastos);
  if (pagadas) lineas.push(tr("compartir.comisiones", { valor: dinero(pagadas.total, pagadas.to) }));
  // Solo si hay de las dos: "100 % con tarjeta" no le dice nada a nadie.
  const efectivo = pagadoEnEfectivo(gastos);
  const pctEfectivo = efectivo ? Math.round((efectivo.total / sumarPorDivisa(gastos)[0].total) * 100) : 0;
  if (pctEfectivo > 0 && pctEfectivo < 100) {
    lineas.push(tr("compartir.pago", { tarjeta: tr("pct", { n: 100 - pctEfectivo }), efectivo: tr("pct", { n: pctEfectivo }) }));
  }
  const cambio = cambioDelViaje(gastos);
  if (cambio) lineas.push(tr("compartir.cambio", { tasa: textoCambio(cambio.tasa, cambio.from, cambio.to) }));

  const trozos = desglose(gastos);
  if (trozos.length > 1) {
    lineas.push("", `*${tr("compartir.categorias")}*`);
    for (const { categoria, total, fraccion, to } of trozos) {
      const pct = tr("pct", { n: Math.round(fraccion * 100) });
      lineas.push(`${emojiCategoria(categoria)} ${nombreCategoria(categoria)}: ${dinero(total, to)} (${pct})`);
    }
  }

  const fijos = gastos.filter(esFijo);
  if (fijos.length) lineas.push("", tr("compartir.fijos", { total: sumas(sumarPorDivisa(fijos)) }));
  const dias = gastosPorDia(delDiaADia(gastos));
  if (dias.length > 1 && !sinDias) {
    lineas.push("", `*${tr("compartir.dias")}*`);
    for (const { dia, totales } of [...dias].reverse()) lineas.push(`${nombreDia(dia, hoyIso)}: ${sumas(totales)}`);
  }

  const estado = estadoPresupuesto(presupuesto, gastos, hoyIso);
  if (estado) {
    const datos = { gastado: dinero(estado.gastado, presupuesto.to), importe: dinero(presupuesto.importe, presupuesto.to) };
    lineas.push("", estado.queda < 0
      ? tr("compartir.pasado", { ...datos, pasado: dinero(-estado.queda, presupuesto.to) })
      : tr("compartir.queda", { ...datos, queda: dinero(estado.queda, presupuesto.to) }));
  }
  return lineas.join("\n");
}

// En qué se fue cada día. Con un gasto ya lo dice su icono, y si empatan dos
// no elijo ninguna.
function categoriaDelDia(delDia) {
  if (delDia.length < 2) return null;
  const [primera, segunda] = desglose(delDia);
  if (!primera || (segunda && segunda.total === primera.total)) return null;
  return primera;
}

// Si a mitad de viaje cambias de divisa no las mezclo: un total por cada una,
// la que más suma primero.
function sumarPorDivisa(gastos) {
  const totales = new Map();
  for (const g of gastos) totales.set(g.to, (totales.get(g.to) ?? 0) + g.valor);
  return [...totales].map(([to, total]) => ({ to, total })).sort((a, b) => b.total - a.total);
}

// La lista ya va de lo último a lo primero, así que los días salen en ese orden
// sin tener que ordenar nada.
function gastosPorDia(gastos) {
  const dias = new Map();
  for (const g of gastos) {
    const dia = isoLocal(new Date(g.cuando));
    if (!dias.has(dia)) dias.set(dia, []);
    dias.get(dia).push(g);
  }
  return [...dias].map(([dia, lista]) => ({ dia, gastos: lista, totales: sumarPorDivisa(lista) }));
}

// El más caro de cada día, en la divisa que más suma en el viaje. Con uno solo
// no hay con qué compararlo, y si empatan los dos primeros no marco ninguno:
// dos cafés iguales no tienen rey.
function masCarosDelDia(todos) {
  const gastos = delDiaADia(todos);
  const principal = sumarPorDivisa(gastos)[0]?.to;
  const ids = new Set();
  for (const { gastos: delDia } of gastosPorDia(gastos)) {
    const suyos = delDia.filter((g) => g.to === principal).sort((a, b) => b.valor - a.valor);
    if (suyos.length >= 2 && suyos[0].valor > suyos[1].valor) ids.add(suyos[0].id);
  }
  return ids;
}

// Los más caros primero. Los de otra divisa van detrás: 50 USD y 50 EUR no son
// lo mismo y no tengo con qué compararlos. A igual importe, el más reciente.
// Lo que enseña el total a mitad de cuenta. Frena al final, como el resto de
// animaciones, y va al céntimo para que no bailen los decimales.
// Los porcentajes van como fracción (0,0179), así que esos piden 4 decimales.
function cifraEnMarcha(desde, hasta, t, decimales = 2) {
  const avance = 1 - (1 - Math.min(Math.max(t, 0), 1)) ** 3;
  const escala = 10 ** decimales;
  return Math.round((desde + (hasta - desde) * avance) * escala) / escala;
}

// Los días que no apuntaste nada entre dos que sí. La lista va de lo último a lo
// primero, así que "despues" es el de arriba. Si no hay hueco, nada.
function huecoEntre(despues, antes) {
  const dias = diasHasta(despues, antes) - 2;
  if (!(dias > 0)) return null;
  const [a, m, d] = antes.split("-").map(Number);
  const [a2, m2, d2] = despues.split("-").map(Number);
  return { dias, desde: isoLocal(new Date(a, m - 1, d + 1)), hasta: isoLocal(new Date(a2, m2 - 1, d2 - 1)) };
}

// Al revés, los de otra divisa siguen detrás: lo que se da la vuelta es el orden.
function ordenarPorImporte(gastos, alReves = false) {
  const principal = sumarPorDivisa(gastos)[0]?.to;
  const signo = alReves ? -1 : 1;
  return [...gastos].sort((a, b) => {
    const suyaA = a.to === principal;
    if (suyaA !== (b.to === principal)) return suyaA ? -1 : 1;
    return signo * (b.valor - a.valor) || b.cuando - a.cuando;
  });
}

// Un cero de más se cuela fácil, y luego descuadra el viaje entero. Comparo con
// lo normal de su categoría, que un hotel al lado de los cafés siempre parece caro.
const RARO_VECES = 5;

function mediana(valores) {
  const orden = [...valores].sort((a, b) => a - b);
  const mitad = Math.floor(orden.length / 2);
  return orden.length % 2 ? orden[mitad] : (orden[mitad - 1] + orden[mitad]) / 2;
}

// Un fijo siempre parecería raro al lado de los cafés: el vuelo es caro y ya está.
function gastoRaro(gastos, gasto) {
  if (!gasto || esFijo(gasto) || esDevolucion(gasto)) return null;
  const suyos = delDiaADia(gastos).filter((g) => g.to === gasto.to && !esDevolucion(g));
  const deSuCategoria = suyos.filter((g) => g.categoria === gasto.categoria);
  // Con pocos de su categoría tiro de todo el viaje, menos el alojamiento: el
  // primer hotel siempre sería "raro" al lado de los cafés.
  const base = deSuCategoria.length >= 3 ? deSuCategoria
    : suyos.length >= 5 && gasto.categoria !== "alojamiento" ? suyos
    : null;
  if (!base) return null;
  const normal = mediana(base.map((g) => g.valor));
  if (!(normal > 0)) return null;
  const veces = gasto.valor / normal;
  if (veces < RARO_VECES) return null;
  return { veces: Math.round(veces), normal, to: gasto.to, categoria: base === deSuCategoria ? gasto.categoria : null };
}

// Un doble clic sin querer y el café cuenta dos veces. Solo miro los de hace
// nada: el metro de ida y el de vuelta son el mismo gasto y los dos van.
const REPETIDO_MS = 2 * 60 * 1000;

function gastoRepetido(gastos, gasto, ahora = Date.now()) {
  if (!gasto) return null;
  const mismo = gastos.find((g) => g.from === gasto.from
    && Math.abs(g.cantidad - gasto.cantidad) < 0.005
    && g.concepto.toLowerCase() === gasto.concepto.toLowerCase()
    // Las noches de hotel van a días que no han llegado: esas no.
    && ahora - g.cuando >= 0 && ahora - g.cuando < REPETIDO_MS);
  return mismo ? { segundos: Math.max(1, Math.round((ahora - mismo.cuando) / 1000)) } : null;
}

// Lo que pesa cada gasto al lado del más caro de su divisa, para la barra de
// fondo. Cada divisa con su máximo, por lo mismo de arriba.
function pesoDeLosGastos(gastos) {
  const maximos = new Map();
  for (const g of gastos) maximos.set(g.to, Math.max(maximos.get(g.to) ?? 0, g.valor));
  return gastos.map((g) => (maximos.get(g.to) > 0 ? Math.max(g.valor, 0) / maximos.get(g.to) : 0));
}

// Lo que pesa cada día al lado del que más, en la divisa que más suma. Un día
// con solo de la otra divisa se queda sin barra: no se pueden comparar.
function pesoDeLosDias(dias) {
  const principal = sumarPorDivisa(dias.flatMap((d) => d.gastos))[0];
  const suyos = dias.map((d) => d.totales.find((t) => t.to === principal?.to)?.total ?? 0);
  const maximo = Math.max(0, ...suyos);
  return suyos.map((total) => (maximo > 0 ? total / maximo : 0));
}

// Del primer día al último con gastos, contando los de en medio sin nada: en el
// viaje estabas igual. Con un solo día la media sería el total, no la enseño.
// Lo que se ha quedado el banco, en la divisa que más suma, como el total. El
// valor ya la lleva dentro, así que sale de quitársela.
// En efectivo no hay comisión de tarjeta, pero lo que el cajero cobró sobre el
// BCE también se lo ha llevado el banco.
const comisionDe = (g) => (g.comision > 0 ? g.valor - g.valor / (1 + g.comision / 100)
  : Number.isFinite(g.alBce) ? g.valor - g.alBce : 0);

function comisionesPagadas(gastos) {
  const principal = sumarPorDivisa(gastos)[0];
  if (!principal) return null;
  const total = gastos
    .filter((g) => g.to === principal.to)
    .reduce((suma, g) => suma + comisionDe(g), 0);
  return total >= 0.005 ? { total, to: principal.to } : null;
}

// A cuánto te ha salido el cambio, comisión incluida: lo que pagaste allí entre
// lo que te costó aquí. Solo el par que más pesa, que yenes y wones juntos no
// dan ninguna tasa. Con un gasto solo es la tasa de ese día, y eso ya lo sabes.
function cambioDelViaje(gastos) {
  const principal = sumarPorDivisa(gastos)[0];
  if (!principal) return null;
  const pares = new Map();
  for (const g of gastos) {
    if (g.to !== principal.to || g.from === g.to || !(g.valor > 0)) continue;
    const par = pares.get(g.from) ?? { from: g.from, cantidad: 0, valor: 0, n: 0 };
    par.cantidad += g.cantidad;
    par.valor += g.valor;
    par.n += 1;
    pares.set(g.from, par);
  }
  const [par] = [...pares.values()].sort((a, b) => b.valor - a.valor);
  if (!par || par.n < 2) return null;
  return { from: par.from, to: principal.to, tasa: par.valor / par.cantidad, n: par.n };
}

// Del lado que da más de uno, que "1 EUR = 158,2 JPY" se lee y "1 JPY = 0,0063
// EUR" no. Cuatro cifras bastan para ver la diferencia con la de hoy.
function cifraCambio(tasa, from, to) {
  if (!(tasa > 0)) return null;
  const alReves = tasa < 1;
  const valor = alReves ? 1 / tasa : tasa;
  const decimales = Math.max(0, 3 - Math.floor(Math.log10(valor)));
  const cifra = numeros({ minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(valor);
  return alReves ? { uno: to, cifra, otra: from } : { uno: from, cifra, otra: to };
}

function textoCambio(tasa, from, to) {
  const c = cifraCambio(tasa, from, to);
  return c ? `1 ${c.uno} = ${c.cifra} ${c.otra}` : "";
}

// Lo que se habría quedado el banco si lo de efectivo hubiera ido con tarjeta.
// Esos no guardan comisión, así que tiro de la que tienes puesta ahora. Si el
// cajero cobró más que la tarjeta, sale en negativo: el efectivo te ha costado.
function ahorroEnEfectivo(gastos, comision) {
  const pagado = pagadoEnEfectivo(gastos);
  if (!pagado) return null;
  const pct = leerComision(comision);
  const efectivo = gastos.filter((g) => g.to === pagado.to && g.pago === "efectivo");
  const alBce = efectivo.reduce((suma, g) => suma + (Number.isFinite(g.alBce) ? g.alBce : g.valor), 0);
  // Por separado: sin cajero, lo de antes sale igual al céntimo.
  const cajero = efectivo.reduce((suma, g) => suma + (Number.isFinite(g.alBce) ? g.valor - g.alBce : 0), 0);
  const total = alBce * pct / 100 - cajero;
  return Math.abs(total) >= 0.005 ? { total, to: pagado.to } : null;
}

function gastadoHoy(todos, hoyIso = hoy()) {
  const gastos = delDiaADia(todos);
  const principal = sumarPorDivisa(gastos)[0];
  if (!principal) return null;
  const total = gastos
    .filter((g) => g.to === principal.to && isoLocal(new Date(g.cuando)) === hoyIso)
    .reduce((suma, g) => suma + g.valor, 0);
  return total >= 0.005 ? { total, to: principal.to } : null;
}

function pagadoEnEfectivo(gastos) {
  const principal = sumarPorDivisa(gastos)[0];
  if (!principal) return null;
  const total = gastos
    .filter((g) => g.to === principal.to && g.pago === "efectivo")
    .reduce((suma, g) => suma + g.valor, 0);
  return total >= 0.005 ? { total, to: principal.to } : null;
}

// Lo que sacas del cajero en cada viaje. Treinta dan para un viaje largo.
const RETIRADAS_MAX = 30;

const esRetiradaBuena = (r) => Boolean(r) && typeof r.id === "string" && r.id !== ""
  && Number.isFinite(r.cantidad) && r.cantidad > 0 && isValidCode(r.divisa) && Number.isFinite(r.cuando);

// Lo que te cobró el banco por ella, en tu divisa, y la del BCE de ese momento
// para saber cuánto se ha quedado. Las de antes no lo traen: van como siempre.
function costeDeRetirada({ divisa, coste, en, bce }) {
  if (!(Number.isFinite(coste) && coste > 0 && isValidCode(en) && en !== divisa)) return {};
  return { coste: Math.round(coste * 100) / 100, en, ...(Number.isFinite(bce) && bce > 0 ? { bce } : {}) };
}

// Los viajes de antes no traen cajero: sin retiradas, como si no hubieras sacado.
function leerRetiradas(guardado) {
  if (!Array.isArray(guardado)) return [];
  return guardado.filter(esRetiradaBuena).slice(0, RETIRADAS_MAX)
    .map((r) => ({ id: r.id, cantidad: r.cantidad, divisa: r.divisa, cuando: r.cuando, ...costeDeRetirada(r), ...enlaceDeRetirada(r), ...tarjetaDeRetirada(r) }));
}

// Con qué tarjeta la sacaste ("" si no tienes ninguna puesta) y lo que valía al
// BCE en la tuya: es lo que cuenta para el límite sin comisión del mes.
function tarjetaDeRetirada({ tarjeta, vale, valeEn }) {
  if (typeof tarjeta !== "string") return {};
  const nombre = tarjeta.slice(0, NOMBRE_TARJETA_MAX);
  return Number.isFinite(vale) && vale > 0 && isValidCode(valeEn) ? { tarjeta: nombre, vale: Math.round(vale * 100) / 100, valeEn } : { tarjeta: nombre };
}

// Lo que te llevas de un viaje a otro va en los dos con el mismo id: en el
// nuevo con "de", como si lo sacaras; en el viejo con "a", como si lo gastaras.
function enlaceDeRetirada({ de, a }) {
  if (typeof a === "string" && a) return { a };
  return typeof de === "string" && de ? { de } : {};
}

function crearRetirada({ id, cantidad, divisa, cuando, coste, en, bce, tarjeta }) {
  const r = { id, cantidad: Math.round(cantidad * 100) / 100, divisa, cuando };
  if (!esRetiradaBuena(r)) return null;
  const vale = divisa === en ? r.cantidad : Number.isFinite(bce) && bce > 0 ? r.cantidad * bce : null;
  return { ...r, ...costeDeRetirada({ divisa, coste, en, bce }), ...tarjetaDeRetirada({ tarjeta, vale, valeEn: en }) };
}

// Lo que te deja sacar gratis cada tarjeta al mes ("" es la de sin nombre).
// Aparte de las tarjetas, que esas solo son nombre y comisión. El día es en el
// que tu banco vuelve a empezar a contar; el 1 no lo guardo, que es lo normal.
const diaDeReinicio = (dia) => (Number.isInteger(dia) && dia >= 2 && dia <= 31 ? dia : null);

function leerCajeroGratis(guardado) {
  const limpio = {};
  if (!guardado || typeof guardado !== "object") return limpio;
  for (const [tarjeta, limite] of Object.entries(guardado)) {
    if (tarjeta.length <= NOMBRE_TARJETA_MAX && Number.isFinite(limite?.importe) && limite.importe > 0 && isValidCode(limite.en)) {
      const dia = diaDeReinicio(limite.dia);
      limpio[tarjeta] = { importe: Math.round(limite.importe * 100) / 100, en: limite.en, ...(dia ? { dia } : {}) };
    }
  }
  return limpio;
}

function ponerCajeroGratis(gratis, tarjeta, importe, en, dia = 1) {
  const { [tarjeta]: _, ...resto } = gratis;
  const reinicio = diaDeReinicio(dia);
  return importe > 0 && isValidCode(en)
    ? { ...resto, [tarjeta]: { importe: Math.round(importe * 100) / 100, en, ...(reinicio ? { dia: reinicio } : {}) } }
    : resto;
}

// Desde cuándo cuenta el periodo de hoy. Con el 31, en los meses cortos cuenta
// el último día, que es lo que hacen los bancos.
function inicioDelPeriodo(hoyIso, dia = 1) {
  const [y, m, d] = hoyIso.split("-").map(Number);
  const diaEn = (anio, mes) => Math.min(dia, new Date(anio, mes, 0).getDate());
  if (d >= diaEn(y, m)) return isoLocal(new Date(y, m - 1, diaEn(y, m)));
  const [ya, ma] = m === 1 ? [y - 1, 12] : [y, m - 1];
  return isoLocal(new Date(ya, ma - 1, diaEn(ya, ma)));
}

// Lo sacado este mes con esa tarjeta, en todos los viajes. Lo que pasa de un
// viaje a otro no cuenta, que no ha salido de ningún cajero.
function gratisDelMes(viajes, tarjeta, limite, hoyIso = hoy()) {
  if (!limite) return null;
  const desde = inicioDelPeriodo(hoyIso, limite.dia ?? 1);
  let usado = 0;
  for (const v of [...(viajes?.lista ?? []), ...(viajes?.archivados ?? [])]) {
    for (const r of v.cajero ?? []) {
      const dia = isoLocal(new Date(r.cuando));
      if (r.tarjeta !== tarjeta || r.de || r.a || dia < desde || dia > hoyIso) continue;
      if (r.valeEn === limite.en) usado += r.vale;
    }
  }
  usado = Math.round(usado * 100) / 100;
  return {
    usado, queda: Math.max(limite.importe - usado, 0), pasado: Math.max(usado - limite.importe, 0),
    importe: limite.importe, en: limite.en, desde, dia: limite.dia ?? 1,
  };
}

// Si lo que vas a sacar se come lo que queda: cuánto te van a cobrar con comisión.
function pasaDelGratis(gratis, vale) {
  if (!gratis || !(vale > 0)) return 0;
  return Math.round(Math.max(vale - gratis.queda, 0) * 100) / 100;
}

// A cuánto te ha salido cada yen de verdad, con todo lo que has sacado y sabes
// lo que te costó. La media y no la última: los billetes se mezclan en la cartera.
function cambioDelCajero(retiradas, from, to) {
  const con = leerRetiradas(retiradas).filter((r) => r.divisa === from && r.en === to);
  if (!con.length) return null;
  const cantidad = con.reduce((suma, r) => suma + r.cantidad, 0);
  const coste = con.reduce((suma, r) => suma + r.coste, 0);
  return { tasa: coste / cantidad, n: con.length };
}

// Lo que se ha quedado por encima del BCE: "+4,7 %". Sin la del BCE no lo sé.
const sobreElBce = (r) => (r.coste > 0 && r.bce > 0 ? r.coste / (r.cantidad * r.bce) - 1 : null);

// Lo pagado en efectivo a lo que te costaron esos billetes, no a la del BCE. Lo
// del BCE se queda en alBce para saber cuánto se llevó el cajero.
function alCambioDelCajero(gasto, retiradas) {
  if (!gasto || gasto.pago !== "efectivo" || !(gasto.cantidad > 0)) return gasto;
  const cambio = cambioDelCajero(retiradas, gasto.from, gasto.to);
  if (!cambio) return gasto;
  return { ...gasto, valor: Math.round(gasto.cantidad * cambio.tasa * 100) / 100, alBce: gasto.valor };
}

function apuntarRetirada(lista, retirada) {
  if (!esRetiradaBuena(retirada)) return lista;
  return [retirada, ...lista].slice(0, RETIRADAS_MAX);
}

const quitarRetirada = (lista, id) => lista.filter((r) => r.id !== id);

// Lo que te queda en la cartera, en cada divisa que hayas sacado. Cuenta la
// cantidad pagada y no lo convertido: los billetes son yenes, no euros.
function efectivoQueda(retiradas, gastos) {
  const cuentas = new Map();
  for (const r of retiradas) {
    const c = cuentas.get(r.divisa) ?? { divisa: r.divisa, sacado: 0, gastado: 0 };
    if (r.a) c.gastado += r.cantidad;
    else c.sacado += r.cantidad;
    cuentas.set(r.divisa, c);
  }
  for (const g of gastos) {
    // Lo que pagó otro salió de su cartera, no de la tuya.
    if (g.pago === "efectivo" && !g.pagador && cuentas.has(g.from)) cuentas.get(g.from).gastado += g.cantidad;
  }
  return [...cuentas.values()]
    .map((c) => ({ ...c, queda: c.sacado - c.gastado, fraccion: Math.max(0, (c.sacado - c.gastado) / c.sacado) }))
    .sort((a, b) => b.sacado - a.sacado);
}

// Por debajo de una quinta parte toca ir pensando en el cajero.
const EFECTIVO_POCO = 0.2;

const tonoEfectivo = (cuenta) => (cuenta.queda < 0 ? "falta" : cuenta.fraccion < EFECTIVO_POCO ? "poco" : "bien");

// A la cifra redonda de arriba que saca un cajero: 11.234 yenes son 12.000.
// Menos de diez no da ninguno.
function redondoDeCajero(n) {
  const paso = Math.max(10, 10 ** (Math.floor(Math.log10(n)) - 1));
  return Math.ceil(n / paso - 1e-9) * paso;
}

// Cuánto sacar para lo que queda de viaje, a lo que te toca al día. Cuenta solo
// la parte que sueles pagar en efectivo; sin gastos aún, todo, que es lo seguro.
// La tasa es de la divisa del cajero a la del presupuesto.
function cuantoSacar(presupuesto, gastos, retiradas, divisa, tasa, hoyIso = hoy(), empresa = []) {
  const estado = estadoPresupuesto(presupuesto, gastos, hoyIso);
  if (!estado?.porDia || !(tasa > 0) || divisa === presupuesto.to) return null;
  const contados = gastos.filter((g) => g.to === presupuesto.to);
  const enEfectivo = contados.filter((g) => g.pago === "efectivo").reduce((suma, g) => suma + g.valor, 0);
  const parte = contados.length ? enEfectivo / estado.gastado : 1;
  if (!(parte > 0)) return null;
  const hace = (estado.porDia * estado.dias * parte) / tasa;
  const cuenta = efectivoQueda(retiradas, [...gastos, ...empresa]).find((c) => c.divisa === divisa);
  const tienes = Math.max(cuenta?.queda ?? 0, 0);
  const falta = hace - tienes;
  return { sacar: falta > 0 ? redondoDeCajero(falta) : 0, divisa, dias: estado.dias, parte, tienes };
}

// El último día y a la vuelta, lo que queda en la cartera ya no es para el
// viaje: te digo cuánto vale en tu divisa, para gastarlo o cambiarlo. Sin fecha
// de vuelta no sé cuándo acaba, y no digo nada.
function loQueSobra(presupuesto, gastos, retiradas, tasa, hoyIso = hoy(), empresa = []) {
  if (!presupuesto?.hasta || hoyIso < presupuesto.hasta) return null;
  const [cuenta] = efectivoQueda(retiradas, [...gastos, ...empresa]);
  if (!cuenta || cuenta.queda <= 0) return null;
  const valor = cuenta.divisa === presupuesto.to ? cuenta.queda
    : Number.isFinite(tasa) && tasa > 0 ? cuenta.queda * tasa
    : null;
  return {
    queda: cuenta.queda, divisa: cuenta.divisa, valor, to: presupuesto.to,
    cuando: hoyIso === presupuesto.hasta ? "ultimo" : "acabado",
  };
}

// Los billetes que te sobraron en otro viaje, para el que tienes abierto. Del
// más reciente si hay varios, que son los que aún llevas en el cajón.
function efectivoParaTraer(viajes, divisa, to) {
  const activo = viajeActivo(viajes);
  if (!activo || !isValidCode(divisa)) return null;
  let mejor = null;
  for (const v of todosLosViajes(viajes)) {
    // Lo que te llevaste de aquí no se ofrece de vuelta: para eso se quita.
    if (v.id === activo.id || v.cajero.some((r) => r.de === activo.id && r.divisa === divisa)) continue;
    const cuenta = efectivoQueda(v.cajero ?? [], [...v.gastos, ...(v.empresa ?? [])]).find((c) => c.divisa === divisa);
    // Un céntimo de yen no es nada que llevarse.
    if (!(cuenta?.queda >= 0.5)) continue;
    const ultima = Math.max(...v.cajero.filter((r) => r.divisa === divisa).map((r) => r.cuando));
    if (mejor && mejor.ultima >= ultima) continue;
    const queda = Math.round(cuenta.queda * 100) / 100;
    const cambio = to && to !== divisa ? cambioDelCajero(v.cajero, divisa, to) : null;
    mejor = { ultima, desde: { id: v.id, nombre: v.nombre }, divisa, queda, ...(cambio ? { coste: queda * cambio.tasa, en: to } : {}) };
  }
  if (!mejor) return null;
  const { ultima: _, ...traer } = mejor;
  return traer;
}

const cambiarCajeroDe = (viajes, id, cambiar) => {
  const cambio = (v) => (v.id === id ? { ...v, cajero: cambiar(v.cajero) } : v);
  return { ...viajes, lista: viajes.lista.map(cambio), ...(viajes.archivados ? { archivados: viajes.archivados.map(cambio) } : {}) };
};

// Los billetes cambian de viaje con lo que te costaron, así lo que pagues con
// ellos sigue yendo al cambio del cajero y no al de hoy.
function traerEfectivo(viajes, divisa, to, id, cuando = Date.now()) {
  const traer = efectivoParaTraer(viajes, divisa, to);
  const activo = viajeActivo(viajes);
  const origen = traer && todosLosViajes(viajes).find((v) => v.id === traer.desde.id);
  // Con el cajero lleno se caería la retirada más vieja y las cuentas ya no saldrían.
  if (!traer || origen.cajero.length >= RETIRADAS_MAX || activo.cajero.length >= RETIRADAS_MAX) return viajes;
  const entra = { ...crearRetirada({ id, cantidad: traer.queda, divisa, cuando, coste: traer.coste, en: traer.en }), de: origen.id };
  const sale = { id, cantidad: entra.cantidad, divisa, cuando, a: activo.id };
  const conSalida = cambiarCajeroDe(viajes, origen.id, (lista) => apuntarRetirada(lista, sale));
  return cambiarCajeroDe(conSalida, activo.id, (lista) => apuntarRetirada(lista, entra));
}

// Quitar uno de los dos lados quita el otro: si no, los billetes estarían en
// los dos viajes o en ninguno.
function quitarRetiradaDeViajes(viajes, id) {
  let enlazada = false;
  for (const v of todosLosViajes(viajes)) {
    if (v.cajero.some((r) => r.id === id && (r.de || r.a))) enlazada = true;
  }
  if (!enlazada) return cambiarCajeroDe(viajes, viajes.activo, (lista) => quitarRetirada(lista, id));
  return todosLosViajes(viajes).reduce((acc, v) => cambiarCajeroDe(acc, v.id, (lista) => quitarRetirada(lista, id)), viajes);
}

// El QR, hecho a mano para no meter una librería. Solo lo que hace falta aquí:
// modo byte (UTF-8, que el resumen lleva tildes y emojis) y corrección M, que
// aguanta un 15 % de manchas o reflejos en la pantalla. Sigue la norma ISO 18004.
const QR_EC_POR_BLOQUE = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28];
const QR_BLOQUES = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49];

// Los módulos que quedan para datos después de los dibujos fijos.
function modulosDeDatosQR(version) {
  let n = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const alineados = Math.floor(version / 7) + 2;
    n -= (25 * alineados - 10) * alineados - 55;
    if (version >= 7) n -= 36;
  }
  return n;
}

const bytesDeDatosQR = (version) => Math.floor(modulosDeDatosQR(version) / 8) - QR_EC_POR_BLOQUE[version] * QR_BLOQUES[version];

// Multiplicar en GF(256) con el polinomio del QR, 0x11D.
function porGF(a, b) {
  let r = 0;
  for (let i = 7; i >= 0; i -= 1) {
    r = (r << 1) ^ ((r >>> 7) * 0x11d);
    r ^= ((b >>> i) & 1) * a;
  }
  return r;
}

function divisorReedSolomon(grado) {
  const r = new Array(grado).fill(0);
  r[grado - 1] = 1;
  let raiz = 1;
  for (let i = 0; i < grado; i += 1) {
    for (let j = 0; j < grado; j += 1) {
      r[j] = porGF(r[j], raiz);
      if (j + 1 < grado) r[j] ^= r[j + 1];
    }
    raiz = porGF(raiz, 0x02);
  }
  return r;
}

// Los bytes de corrección de un bloque: el resto de dividir por el polinomio.
function restoReedSolomon(datos, grado) {
  const divisor = divisorReedSolomon(grado);
  const r = new Array(grado).fill(0);
  for (const b of datos) {
    const factor = b ^ r.shift();
    r.push(0);
    divisor.forEach((d, i) => { r[i] ^= porGF(d, factor); });
  }
  return r;
}

// 15 bits: el nivel (M es 00) y la máscara, con su propia corrección.
function formatoQR(mascara) {
  const datos = mascara;
  let resto = datos;
  for (let i = 0; i < 10; i += 1) resto = (resto << 1) ^ ((resto >>> 9) * 0x537);
  return ((datos << 10) | resto) ^ 0x5412;
}

function versionQR(version) {
  let resto = version;
  for (let i = 0; i < 12; i += 1) resto = (resto << 1) ^ ((resto >>> 11) * 0x1f25);
  return (version << 12) | resto;
}

function posicionesAlineadoQR(version, lado) {
  if (version === 1) return [];
  const n = Math.floor(version / 7) + 2;
  const paso = Math.floor((version * 8 + n * 3 + 5) / (n * 4 - 4)) * 2;
  const r = [6];
  for (let pos = lado - 7; r.length < n; pos -= paso) r.splice(1, 0, pos);
  return r;
}

const MASCARAS_QR = [
  (x, y) => (x + y) % 2 === 0,
  (x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

// Los bytes con su cabecera, partidos en bloques y entrelazados como manda la norma.
function codewordsQR(bytes, version) {
  const bits = [];
  const poner = (valor, n) => { for (let i = n - 1; i >= 0; i -= 1) bits.push((valor >>> i) & 1); };
  poner(0b0100, 4);
  poner(bytes.length, version <= 9 ? 8 : 16);
  for (const b of bytes) poner(b, 8);
  const capacidad = bytesDeDatosQR(version) * 8;
  poner(0, Math.min(4, capacidad - bits.length));
  poner(0, (8 - (bits.length % 8)) % 8);
  for (let relleno = 0xec; bits.length < capacidad; relleno ^= 0xec ^ 0x11) poner(relleno, 8);
  const datos = [];
  for (let i = 0; i < bits.length; i += 8) datos.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));

  const bloques = QR_BLOQUES[version];
  const ec = QR_EC_POR_BLOQUE[version];
  const total = Math.floor(modulosDeDatosQR(version) / 8);
  const cortos = bloques - (total % bloques);
  const largoCorto = Math.floor(total / bloques);
  const partes = [];
  for (let i = 0, k = 0; i < bloques; i += 1) {
    const n = largoCorto - ec + (i < cortos ? 0 : 1);
    const trozo = datos.slice(k, k + n);
    k += n;
    // Los cortos llevan un hueco para que todos midan igual al entrelazar.
    partes.push([...trozo, ...(i < cortos ? [null] : []), ...restoReedSolomon(trozo, ec)]);
  }
  const salida = [];
  for (let i = 0; i < partes[0].length; i += 1) {
    for (const parte of partes) if (parte[i] !== null) salida.push(parte[i]);
  }
  return salida;
}

// Cuánto se parece a lo que confunde a un lector: rachas, cuadrados, falsos
// localizadores y demasiado de un color. Gana la máscara con menos.
function penalizacionQR(m) {
  const lado = m.length;
  let p = 0;
  const lineas = [...m, ...m.map((_, x) => m.map((fila) => fila[x]))];
  for (const linea of lineas) {
    let racha = 1;
    for (let i = 1; i <= lado; i += 1) {
      if (i < lado && linea[i] === linea[i - 1]) racha += 1;
      else {
        if (racha >= 5) p += racha - 2;
        racha = 1;
      }
    }
    const t = linea.map(Number).join("");
    for (const patron of ["10111010000", "00001011101"]) {
      for (let i = t.indexOf(patron); i !== -1; i = t.indexOf(patron, i + 1)) p += 40;
    }
  }
  for (let y = 0; y < lado - 1; y += 1) {
    for (let x = 0; x < lado - 1; x += 1) {
      const c = m[y][x];
      if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) p += 3;
    }
  }
  const oscuros = m.flat().filter(Boolean).length;
  p += Math.floor(Math.abs(oscuros * 20 - lado * lado * 10) / (lado * lado)) * 10;
  return p;
}

// El texto en módulos: filas de true (negro) y false. Si no cabe ni en el más
// grande, null.
function codigoQR(texto) {
  const bytes = [...new TextEncoder().encode(String(texto ?? ""))];
  let version = 1;
  while (version <= 40 && 4 + (version <= 9 ? 8 : 16) + bytes.length * 8 > bytesDeDatosQR(version) * 8) version += 1;
  if (version > 40) return null;

  const lado = version * 4 + 17;
  const m = Array.from({ length: lado }, () => new Array(lado).fill(false));
  const fijo = Array.from({ length: lado }, () => new Array(lado).fill(false));
  const fija = (x, y, negro) => { m[y][x] = negro; fijo[y][x] = true; };

  for (let i = 0; i < lado; i += 1) {
    fija(6, i, i % 2 === 0);
    fija(i, 6, i % 2 === 0);
  }
  for (const [cx, cy] of [[3, 3], [lado - 4, 3], [3, lado - 4]]) {
    for (let dy = -4; dy <= 4; dy += 1) {
      for (let dx = -4; dx <= 4; dx += 1) {
        const x = cx + dx;
        const y = cy + dy;
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        if (x >= 0 && x < lado && y >= 0 && y < lado) fija(x, y, d !== 2 && d !== 4);
      }
    }
  }
  const alineado = posicionesAlineadoQR(version, lado);
  const ultimo = alineado.length - 1;
  alineado.forEach((ax, i) => alineado.forEach((ay, j) => {
    // Los de las esquinas caerían encima de los localizadores.
    if ((i === 0 && j === 0) || (i === 0 && j === ultimo) || (i === ultimo && j === 0)) return;
    for (let dy = -2; dy <= 2; dy += 1) {
      for (let dx = -2; dx <= 2; dx += 1) fija(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  }));
  const ponerFormato = (mascara) => {
    const bits = formatoQR(mascara);
    const bit = (i) => ((bits >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i += 1) fija(8, i, bit(i));
    fija(8, 7, bit(6));
    fija(8, 8, bit(7));
    fija(7, 8, bit(8));
    for (let i = 9; i < 15; i += 1) fija(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i += 1) fija(lado - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i += 1) fija(8, lado - 15 + i, bit(i));
    fija(8, lado - 8, true);
  };
  ponerFormato(0);
  if (version >= 7) {
    const bits = versionQR(version);
    for (let i = 0; i < 18; i += 1) {
      const negro = ((bits >>> i) & 1) === 1;
      const a = lado - 11 + (i % 3);
      const b = Math.floor(i / 3);
      fija(a, b, negro);
      fija(b, a, negro);
    }
  }

  // En zigzag de dos columnas, de abajo arriba y vuelta, saltándose la del tiempo.
  const datos = codewordsQR(bytes, version);
  let i = 0;
  for (let derecha = lado - 1; derecha >= 1; derecha -= 2) {
    if (derecha === 6) derecha = 5;
    for (let vert = 0; vert < lado; vert += 1) {
      for (let j = 0; j < 2; j += 1) {
        const x = derecha - j;
        const subiendo = ((derecha + 1) & 2) === 0;
        const y = subiendo ? lado - 1 - vert : vert;
        if (!fijo[y][x] && i < datos.length * 8) {
          m[y][x] = ((datos[i >>> 3] >>> (7 - (i & 7))) & 1) === 1;
          i += 1;
        }
      }
    }
  }

  let mejor = null;
  for (let mascara = 0; mascara < 8; mascara += 1) {
    const prueba = m.map((fila, y) => fila.map((v, x) => (fijo[y][x] ? v : v !== MASCARAS_QR[mascara](x, y))));
    const bits = formatoQR(mascara);
    const bit = (k) => ((bits >>> k) & 1) === 1;
    for (let k = 0; k <= 5; k += 1) prueba[k][8] = bit(k);
    prueba[7][8] = bit(6);
    prueba[8][8] = bit(7);
    prueba[8][7] = bit(8);
    for (let k = 9; k < 15; k += 1) prueba[8][14 - k] = bit(k);
    for (let k = 0; k < 8; k += 1) prueba[8][lado - 1 - k] = bit(k);
    for (let k = 8; k < 15; k += 1) prueba[lado - 15 + k][8] = bit(k);
    const puntos = penalizacionQR(prueba);
    if (!mejor || puntos < mejor.puntos) mejor = { puntos, modulos: prueba, mascara };
  }
  return { version, lado, mascara: mejor.mascara, modulos: mejor.modulos };
}

// Pasada la 25 los módulos salen de 2 px en el popup y la cámara ya duda. Antes
// de rendirme quito los días, que es lo que crece con el viaje.
const QR_VERSION_MAX = 25;

function resumenParaQR(viaje, hoyIso = hoy()) {
  for (const sinDias of [false, true]) {
    const texto = resumenParaCompartir(viaje, hoyIso, { sinDias });
    const qr = codigoQR(texto);
    if (qr && qr.version <= QR_VERSION_MAX) return { texto, qr, sinDias };
  }
  return null;
}

// En SVG, un trazo por racha de negros de cada fila: con un rect por módulo el
// de la versión 20 serían miles de nodos. Con su margen blanco de cuatro.
function svgQR(qr) {
  const margen = 4;
  const total = qr.lado + margen * 2;
  let d = "";
  qr.modulos.forEach((fila, y) => {
    for (let x = 0; x < qr.lado; x += 1) {
      if (!fila[x]) continue;
      let fin = x;
      while (fin + 1 < qr.lado && fila[fin + 1]) fin += 1;
      d += `M${x + margen} ${y + margen}h${fin - x + 1}v1h${-(fin - x + 1)}z`;
      x = fin;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges"><rect width="${total}" height="${total}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}

// Por gasto y no por día: dice si vas de muchos cafés o de pocas cenas.
function mediaPorGasto(gastos) {
  const principal = sumarPorDivisa(gastos)[0];
  const suyos = gastos.filter((g) => g.to === principal?.to);
  if (suyos.length < 2) return null;
  return { media: principal.total / suyos.length, to: principal.to };
}

function mediaPorDia(todos) {
  const gastos = delDiaADia(todos);
  const principal = sumarPorDivisa(gastos)[0];
  if (!principal) return null;
  const dias = gastosPorDia(gastos);
  const total = diasHasta(dias[0].dia, dias[dias.length - 1].dia);
  if (total < 2) return null;
  return { media: principal.total / total, to: principal.to, dias: total };
}

// ¿Más caro que quedarte en casa? Lo de casa es al mes y sin el alquiler ni las
// facturas, que esos los pagas igual estés donde estés. Se compara con la media
// del viaje, que ya va sin lo pagado aparte (el vuelo, el hotel de antes).
const DIAS_POR_MES = 365.25 / 12;
// Por debajo de un 5 % es como en casa: un café arriba o abajo.
const COMO_EN_CASA = 0.05;

function comparaConCasa(media, casa) {
  if (!media || !casa || casa.divisa !== media.to || !(casa.precio > 0)) return null;
  const diaCasa = casa.precio / DIAS_POR_MES;
  const diferencia = media.media - diaCasa;
  const pct = diferencia / diaCasa;
  const tono = Math.abs(pct) < COMO_EN_CASA ? "igual" : diferencia > 0 ? "mas" : "menos";
  return { diaCasa, diferencia, pct, tono, to: media.to };
}

function textoCasa(r) {
  if (!r) return "";
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (r.tono === "igual") return tr("casa.igual");
  return tr(r.tono === "mas" ? "casa.mas" : "casa.menos", { diferencia: dinero.format(Math.abs(r.diferencia)) });
}

// Un viaje con dos cafés apuntados no dice lo que gastas al día.
const GASTOS_PARA_SUGERIR = 5;

// A dos cifras: 553 son 550 y 12.340 son 12.000, que es un presupuesto, no un tique.
function redondoPresupuesto(n) {
  const paso = Math.max(10 ** (Math.floor(Math.log10(n)) - 1), 1);
  return Math.round(n / paso) * paso;
}

// Con la mediana, para que un viaje de lujo no te infle todos los demás.
function presupuestoSugerido(viajes, to, dias) {
  if (!(dias > 0)) return null;
  const medias = todosLosViajes(viajes)
    .filter((v) => v.id !== viajes.activo && delDiaADia(v.gastos).length >= GASTOS_PARA_SUGERIR)
    .map((v) => mediaPorDia(v.gastos))
    .filter((m) => m?.to === to)
    .map((m) => m.media);
  if (!medias.length) return null;
  const porDia = mediana(medias);
  const importe = redondoPresupuesto(porDia * dias);
  return importe > 0 ? { porDia, dias, importe, to, viajes: medias.length } : null;
}

// Lo que te paga el trabajo. En su propia lista, como los pendientes: así no
// cuenta en nada de lo tuyo sin tener que filtrarlo en cada cuenta.
const puedeSerDeEmpresa = (g) => !g.pagador;
const delMasNuevo = (a, b) => b.cuando - a.cuando;

function pasarAEmpresa(gastos, empresa, id) {
  const gasto = gastos.find((g) => g.id === id);
  const lista = empresa ?? [];
  if (!gasto || !puedeSerDeEmpresa(gasto) || lista.length >= GASTOS_MAX) return null;
  return { gastos: gastos.filter((g) => g.id !== id), empresa: [...lista, gasto].sort(delMasNuevo) };
}

function sacarDeEmpresa(gastos, empresa, id) {
  const lista = empresa ?? [];
  const gasto = lista.find((g) => g.id === id);
  if (!gasto || gastos.length >= GASTOS_MAX) return null;
  return { gastos: [...gastos, gasto].sort(delMasNuevo), empresa: lista.filter((g) => g.id !== id) };
}

// Del primero al último, que es como se entrega una nota de gastos. Los que
// tienen foto llevan su número de tique, el mismo que sale debajo de la foto.
function notaDeGastos(viaje, conTique = new Set()) {
  const lista = [...(viaje?.empresa ?? [])].sort((a, b) => a.cuando - b.cuando);
  if (!lista.length) return null;
  const dia = (g) => isoLocal(new Date(g.cuando));
  let n = 0;
  const numeros = new Map(lista.filter((g) => conTique.has(g.id)).map((g) => [g.id, (n += 1)]));
  return {
    tiques: numeros.size,
    nombre: viaje.nombre || tr("viajes.sinNombre"),
    desde: dia(lista[0]),
    hasta: dia(lista.at(-1)),
    filas: lista.map((g) => ({
      id: g.id,
      ...(numeros.has(g.id) ? { tique: numeros.get(g.id) } : {}),
      dia: dia(g),
      concepto: g.concepto || nombreCategoria(g.categoria),
      categoria: nombreCategoria(g.categoria),
      cantidad: g.cantidad, from: g.from, valor: g.valor, to: g.to,
      pago: tr(`pago.${leerPago(g.pago)}`),
    })),
    totales: sumarPorDivisa(lista),
  };
}

// Los tramos del viaje: "desde el 4 estoy en Kioto". Cada uno dura hasta que
// empieza el siguiente, así los gastos caen solos en el suyo por la fecha y no
// hay que marcar nada al apuntar.
const TRAMOS_MAX = 12;
const NOMBRE_TRAMO_MAX = 20;
const limpiarNombreTramo = (nombre) => String(nombre ?? "").replace(/\s+/g, " ").trim().slice(0, NOMBRE_TRAMO_MAX);

// Dos el mismo día no tienen sentido: se queda el último que pusiste.
function leerTramos(guardado) {
  if (!Array.isArray(guardado)) return [];
  const porDia = new Map();
  for (const t of guardado) {
    if (!t || typeof t.id !== "string" || !t.id || !esIso(t.desde) || !limpiarNombreTramo(t.nombre)) continue;
    // Los de antes no traen divisa: esos no te cambian nada al llegar.
    const divisa = isValidCode(t.divisa) ? { divisa: t.divisa } : {};
    porDia.set(t.desde, { id: t.id, nombre: limpiarNombreTramo(t.nombre), desde: t.desde, ...divisa });
  }
  return [...porDia.values()].sort((a, b) => a.desde.localeCompare(b.desde)).slice(0, TRAMOS_MAX);
}

// Si ya hay uno ese día, le cambia el nombre: es que te equivocaste al ponerlo.
function ponerTramo(tramos, { id, nombre, desde, divisa }) {
  const lista = leerTramos(tramos);
  const limpio = limpiarNombreTramo(nombre);
  if (!limpio || !esIso(desde) || typeof id !== "string" || !id) return lista;
  if (lista.some((t) => t.desde === desde)) return leerTramos(lista.map((t) => (t.desde === desde ? { ...t, nombre: limpio, divisa: divisa === undefined ? t.divisa : divisa } : t)));
  if (lista.length >= TRAMOS_MAX) return lista;
  return leerTramos([...lista, { id, nombre: limpio, desde, divisa }]);
}

const quitarTramo = (tramos, id) => leerTramos(tramos).filter((t) => t.id !== id);

function tramoDelDia(tramos, dia) {
  return leerTramos(tramos).filter((t) => t.desde <= dia).at(-1) ?? null;
}

// Al llegar a Budapest, los precios ya son en forintos. Solo una vez por tramo:
// si luego cambias tú la divisa, es que querías esa, y no te la piso cada vez
// que abres. Con la tuya abajo no la pongo, que no se puede convertir a sí misma.
function divisaDelTramo(viaje, { from, to, aplicado = null, hoyIso = hoy() }) {
  const tramo = tramoDelDia(viaje?.tramos, hoyIso);
  if (!tramo?.divisa) return null;
  const clave = `${viaje.id}:${tramo.id}`;
  if (clave === aplicado) return null;
  const cambia = tramo.divisa !== from && tramo.divisa !== to;
  return { clave, divisa: cambia ? tramo.divisa : null, nombre: tramo.nombre };
}

// Lo de cada tramo, sin lo pagado aparte: el vuelo que reservaste hace meses
// no es de Tokio ni de Kioto. El último llega hasta hoy (o hasta la vuelta, si
// ya pasó), que en Kioto llevas los días que llevas aunque hoy no gastes.
// Lo de antes del primero va aparte, sin nombre.
function resumenTramos(gastos, tramos, { hoyIso = hoy(), hasta = null } = {}) {
  const lista = leerTramos(tramos);
  if (lista.length === 0) return [];
  const delDia = delDiaADia(gastos);
  const to = sumarPorDivisa(delDia)[0]?.to ?? null;
  const grupos = [{ id: null, nombre: null, desde: null }, ...lista].map((t) => ({ ...t, total: 0, n: 0, ultimo: null }));
  for (const g of delDia) {
    if (g.to !== to) continue;
    const dia = isoLocal(new Date(g.cuando));
    const grupo = grupos[lista.filter((t) => t.desde <= dia).length];
    grupo.total += g.valor;
    grupo.n += 1;
    if (!grupo.ultimo || dia > grupo.ultimo) grupo.ultimo = dia;
  }
  const antesDe = (iso) => {
    const [a, m, d] = iso.split("-").map(Number);
    return isoLocal(new Date(a, m - 1, d - 1));
  };
  const tope = hasta && hasta < hoyIso ? hasta : hoyIso;
  const salen = grupos.map((g, i) => {
    let fin = null;
    if (i > 0) {
      const siguiente = grupos[i + 1];
      fin = siguiente ? antesDe(siguiente.desde) : [tope, g.ultimo].filter((d) => d && d >= g.desde).sort().at(-1) ?? null;
    }
    const dias = fin && fin >= g.desde ? diasHasta(fin, g.desde) : 0;
    return {
      id: g.id, nombre: g.nombre, desde: g.desde, fin, dias, n: g.n, to,
      total: Math.round(g.total * 100) / 100,
      alDia: dias > 0 && g.n > 0 ? g.total / dias : null,
      actual: i > 0 && g.desde <= hoyIso && (!fin || hoyIso <= fin),
    };
  }).filter((g) => g.id !== null || g.n > 0);
  // El más caro al día lleva su marca, como en los viajes; con uno solo no.
  const conMedia = salen.filter((g) => g.id && g.alDia !== null);
  if (conMedia.length >= 2) {
    const caro = conMedia.reduce((a, b) => (b.alDia > a.alDia ? b : a));
    caro.caro = true;
  }
  return salen;
}

// A qué hora se te va el dinero. Cada gasto ya guarda cuándo lo apuntaste, así
// que no hay nada que preguntar. Fuera lo que no dice la hora de verdad: lo
// pagado aparte, las devoluciones, las noches del hotel repartidas (llevan la
// hora del día que lo pagaste) y lo traído del banco, que entra a las 12 en punto.
const FRANJAS = [
  { id: "madrugada", desde: 0, emoji: "🌃" },
  { id: "manana", desde: 6, emoji: "🌅" },
  { id: "mediodia", desde: 12, emoji: "☀️" },
  { id: "tarde", desde: 16, emoji: "🌇" },
  { id: "noche", desde: 20, emoji: "🌙" },
];
// Con menos, una cena suelta ya es "la noche se lleva el 60 %".
const HORAS_MINIMO = 8;

function horaFiable(g) {
  if (esFijo(g) || esDevolucion(g) || /-\d+$/.test(g.id)) return false;
  const d = new Date(g.cuando);
  return !(d.getHours() === 12 && d.getMinutes() === 0 && d.getSeconds() === 0 && d.getMilliseconds() === 0);
}

const franjaDe = (cuando) => {
  const hora = new Date(cuando).getHours();
  return FRANJAS.filter((f) => f.desde <= hora).at(-1);
};

function porFranja(gastos) {
  const buenos = gastos.filter(horaFiable);
  const to = sumarPorDivisa(buenos)[0]?.to;
  const suyos = buenos.filter((g) => g.to === to);
  if (suyos.length < HORAS_MINIMO) return null;
  const total = suyos.reduce((suma, g) => suma + g.valor, 0);
  if (!(total > 0)) return null;
  const franjas = FRANJAS.map((f) => {
    const dentro = suyos.filter((g) => franjaDe(g.cuando) === f);
    const suma = dentro.reduce((acc, g) => acc + g.valor, 0);
    const porCategoria = new Map();
    for (const g of dentro) porCategoria.set(g.categoria, (porCategoria.get(g.categoria) ?? 0) + g.valor);
    const [categoria] = [...porCategoria].sort((a, b) => b[1] - a[1])[0] ?? [null];
    return { id: f.id, emoji: f.emoji, desde: f.desde, total: Math.round(suma * 100) / 100, n: dentro.length, fraccion: suma / total, categoria };
  });
  const mas = franjas.reduce((a, b) => (b.total > a.total ? b : a));
  return { to, n: suyos.length, franjas, mas: mas.id };
}

// Lo de cada categoría al día, con los mismos días que la media de arriba: así
// sumadas dan esa media y no salen cuentas distintas en el mismo panel.
function categoriasAlDia(gastos) {
  const media = mediaPorDia(gastos);
  if (!media) return new Map();
  return new Map(desglose(delDiaADia(gastos)).map((t) => [t.categoria, t.total / media.dias]));
}
