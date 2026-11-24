// El presupuesto del viaje y lo que cuelga de él: la maleta, la previsión, la hucha.

// Días que quedan contando hoy: el último día del viaje también se gasta.
function diasHasta(hasta, hoyIso = hoy()) {
  const [a1, m1, d1] = hoyIso.split("-").map(Number);
  const [a2, m2, d2] = hasta.split("-").map(Number);
  // Con Date.UTC y no con la hora local: el día del cambio de hora tiene 23 horas.
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86400000) + 1;
}

// El presupuesto lleva su divisa: es la de los gastos que cuenta. Si cambias de
// divisa a mitad de viaje, lo de la otra no se suma, igual que en el total.
function leerPresupuesto(guardado) {
  if (!guardado || typeof guardado !== "object") return null;
  const { importe, to, hasta } = guardado;
  if (!Number.isFinite(importe) || importe <= 0 || !isValidCode(to)) return null;
  if (!esIso(hasta)) return null;
  // Los de antes no traen el día de salida: entonces cuenta desde el primer gasto.
  const { desde } = guardado;
  const topes = leerTopes(guardado.categorias);
  const marca = leerMarca(guardado.marca, to);
  const extra = { ...(topes ? { categorias: topes } : {}), ...(marca ? { marca } : {}) };
  if (desde === undefined || desde === null) return { importe, to, hasta, ...extra };
  if (!esIso(desde) || desde > hasta) return null;
  return { importe, to, hasta, desde, ...extra };
}

// Lo que quieres gastar como mucho en comida, en ocio…, en la divisa del
// presupuesto. Son opcionales: si no pones ninguno, ni se guarda el campo.
function leerTopes(guardado) {
  if (!guardado || typeof guardado !== "object") return null;
  const topes = Object.fromEntries(Object.keys(guardado)
    .filter((c) => esCategoria(c) && Number.isFinite(guardado[c]) && guardado[c] > 0)
    .map((c) => [c, Math.round(guardado[c] * 100) / 100]));
  return Object.keys(topes).length ? topes : null;
}

const esIso = (texto) => typeof texto === "string" && /^\d{4}-\d{2}-\d{2}$/.test(texto);

// El día que pusiste el presupuesto y a cuánto estaba allí, para decirte luego
// si el cambio te ha dado o te ha quitado. Los de antes no la traen.
function leerMarca(marca, to) {
  if (!marca || typeof marca !== "object") return null;
  const { dia, divisa, tasa } = marca;
  if (!esIso(dia) || !isValidCode(divisa) || divisa === to || !Number.isFinite(tasa) || tasa <= 0) return null;
  return { dia, divisa, tasa };
}

// Al cambiar el importe o las fechas la marca se queda: lo que cuenta es desde
// cuándo lo planeas. Solo se rehace si ahora vas a otro sitio.
function marcarPresupuesto(nuevo, anterior, destino, tasa, hoyIso = hoy()) {
  if (!nuevo) return nuevo;
  const { marca: _vieja, ...sin } = nuevo;
  const vieja = leerMarca(anterior?.marca, nuevo.to);
  if (vieja && vieja.divisa === destino) return { ...sin, marca: vieja };
  const marca = leerMarca({ dia: hoyIso, divisa: destino, tasa }, nuevo.to);
  return marca ? { ...sin, marca } : sin;
}

// Por debajo de medio punto es lo que se mueve en una semana cualquiera.
const CAMBIO_MARCA_MINIMO = 0.005;

// Solo antes de salir: luego ya lo vas gastando a la tasa de cada día. tasaHoy
// es lo que vale 1 de allí en lo tuyo, como la de la marca.
function cambioDesdeMarca(presupuesto, tasaHoy, hoyIso = hoy()) {
  const marca = presupuesto?.marca;
  if (!marca || !(tasaHoy > 0) || marca.dia >= hoyIso || cuentaAtras(presupuesto, hoyIso) === null) return null;
  const pct = marca.tasa / tasaHoy - 1;
  if (Math.abs(pct) < CAMBIO_MARCA_MINIMO) return null;
  const diferencia = presupuesto.importe / tasaHoy - presupuesto.importe / marca.tasa;
  return { pct, diferencia, divisa: marca.divisa, dia: marca.dia, importe: presupuesto.importe, to: presupuesto.to };
}

// Corto para la línea, que comparte fila con los botones; entero en el título.
function textoCambioMarca(r, { largo = false } = {}) {
  if (!r) return "";
  return tr(`marca.${r.pct > 0 ? "gana" : "pierde"}${largo ? "Titulo" : ""}`, {
    fecha: fechaCorta(r.dia),
    importe: `${numeros({ maximumFractionDigits: 0 }).format(r.importe)} ${r.to}`,
    cuanto: `${numeros({ maximumFractionDigits: 0 }).format(Math.abs(r.diferencia))} ${r.divisa}`,
    pct: numeros({ maximumFractionDigits: 1 }).format(Math.abs(r.pct * 100)),
  });
}

// Hasta el 80 % vas bien; de ahí al 100 %, justo; pasado, pasado.
const PRESUPUESTO_JUSTO = 0.8;

function estadoPresupuesto(presupuesto, gastos, hoyIso = hoy(), pendientes = []) {
  if (!presupuesto) return null;
  const gastado = gastos.filter((g) => g.to === presupuesto.to).reduce((suma, g) => suma + g.valor, 0);
  const pendiente = totalPendiente(pendientes, presupuesto.to);
  const queda = presupuesto.importe - gastado;
  // Lo que vas a pagar sí o sí no está para gastarlo: el al día sale de lo demás.
  const libre = queda - pendiente;
  const fraccion = gastado / presupuesto.importe;
  // Si aún no has salido, el dinero se reparte entre los días del viaje, no
  // entre los que faltan desde hoy.
  const empieza = presupuesto.desde && presupuesto.desde > hoyIso ? presupuesto.desde : hoyIso;
  const dias = Math.max(diasHasta(presupuesto.hasta, empieza), 0);
  return {
    gastado,
    queda,
    pendiente,
    libre,
    fraccion,
    fraccionPendiente: pendiente / presupuesto.importe,
    dias,
    // Acabado el viaje o pasado del presupuesto, "al día" ya no significa nada.
    porDia: dias > 0 && libre > 0 ? libre / dias : null,
    tono: fraccion > 1 ? "pasado" : fraccion >= PRESUPUESTO_JUSTO ? "justo" : "bien",
  };
}

// Cómo va cada categoría con tope, con los mismos tonos que la barra de arriba.
// Lo pagado aparte cuenta, como en el presupuesto: el hotel es alojamiento.
function estadoTopes(presupuesto, gastos) {
  if (!presupuesto?.categorias) return new Map();
  return new Map(Object.entries(presupuesto.categorias).map(([categoria, tope]) => {
    const gastado = gastos.filter((g) => g.to === presupuesto.to && g.categoria === categoria).reduce((suma, g) => suma + g.valor, 0);
    const fraccion = gastado / tope;
    return [categoria, {
      categoria, tope, gastado, queda: tope - gastado, fraccion, to: presupuesto.to,
      tono: fraccion > 1 ? "pasado" : fraccion >= PRESUPUESTO_JUSTO ? "justo" : "bien",
    }];
  }));
}

// Lo de al día en la divisa de allí, que es la de los precios que ves. A dos
// cifras y hacia abajo: "≈ 4.700 JPY" se lee de un vistazo y así no te pasas.
function alDiaAlli(porDia, tasa) {
  if (!(porDia > 0) || !(tasa > 0)) return null;
  const n = porDia / tasa;
  const paso = n < 100 ? 1 : 10 ** (Math.floor(Math.log10(n)) - 1);
  const cantidad = Math.floor(n / paso + 1e-9) * paso;
  return cantidad > 0 ? cantidad : null;
}

// El día que sales. Si el presupuesto no lo trae, el del primer gasto, y si
// aún no hay ninguno, hoy.
function inicioDelViaje(presupuesto, gastos, hoyIso = hoy()) {
  if (presupuesto?.desde) return presupuesto.desde;
  // El vuelo se compra meses antes: el viaje empieza con el primero del día a día.
  const diarios = delDiaADia(gastos);
  const primero = (diarios.length ? diarios : gastos).reduce((min, g) => Math.min(min, g.cuando), Infinity);
  return Number.isFinite(primero) ? isoLocal(new Date(primero)) : hoyIso;
}

// En qué día del viaje vas. Antes de salir o acabado el viaje, no lo digo.
function diaDelViaje(presupuesto, gastos, hoyIso = hoy()) {
  if (!presupuesto) return null;
  const inicio = inicioDelViaje(presupuesto, gastos, hoyIso);
  const total = diasHasta(presupuesto.hasta, inicio);
  const dia = diasHasta(hoyIso, inicio);
  if (dia < 1 || dia > total) return null;
  return { dia, total };
}

// Lo de hoy contra lo que te toca hoy. Lo que toca sale de lo que quedaba al
// empezar el día entre los días que faltan: si contara lo de hoy, la meta
// bajaría con cada gasto que apuntas.
function loDeHoy(presupuesto, gastos, hoyIso = hoy()) {
  if (!diaDelViaje(presupuesto, gastos, hoyIso)) return null;
  let deHoy = 0;
  let antes = 0;
  for (const g of gastos) {
    if (g.to !== presupuesto.to) continue;
    if (isoLocal(new Date(g.cuando)) === hoyIso && !esFijo(g)) deHoy += g.valor;
    else antes += g.valor;
  }
  const toca = Math.max(presupuesto.importe - antes, 0) / diasHasta(presupuesto.hasta, hoyIso);
  const fraccion = toca > 0 ? deHoy / toca : deHoy > 0 ? Infinity : 0;
  return {
    gastado: deHoy,
    toca,
    fraccion,
    tono: fraccion > 1 ? "pasado" : fraccion >= PRESUPUESTO_JUSTO ? "justo" : "bien",
  };
}

// Los viajes que ya celebré, para que el confeti salga una vez y no cada vez
// que abres los gastos. Con cincuenta sobra: luego se van los más viejos.
const CELEBRADOS_MAX = 50;

function leerCelebrados(guardado) {
  if (!Array.isArray(guardado)) return [];
  return [...new Set(guardado.filter((id) => typeof id === "string" && id))].slice(-CELEBRADOS_MAX);
}

const anadirCelebrado = (celebrados, id) => leerCelebrados([...celebrados.filter((c) => c !== id), id]);

// Acabado el viaje y sin pasarte, toca fiesta. Sin ningún gasto no: eso no es
// ahorrar, es no haber apuntado.
function viajeParaCelebrar(viaje, celebrados, hoyIso = hoy()) {
  const { presupuesto, gastos } = viaje ?? {};
  if (!presupuesto || celebrados.includes(viaje.id) || hoyIso <= presupuesto.hasta) return null;
  if (!gastos.some((g) => g.to === presupuesto.to)) return null;
  const estado = estadoPresupuesto(presupuesto, gastos, hoyIso);
  if (estado.queda < 0) return null;
  return { sobra: estado.queda, to: presupuesto.to };
}

// Por debajo de un céntimo es que lo has clavado.
const textoCelebrar = ({ sobra, to }) => (sobra < 0.01
  ? tr("fin.clavado")
  : tr("fin.sobra", { importe: `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(sobra)} ${to}` }));

// Cuántos días faltan para salir. Solo con el día de salida puesto: sin él no
// sé cuándo empieza, y el mismo día ya es "Día 1".
function cuentaAtras(presupuesto, hoyIso = hoy()) {
  if (!presupuesto?.desde || presupuesto.desde <= hoyIso) return null;
  return diasHasta(presupuesto.desde, hoyIso) - 1;
}

function textoCuentaAtras(n) {
  if (n === null) return "";
  return n === 1 ? tr("presupuesto.manana") : tr("presupuesto.faltan", { n });
}

// Adónde vas, que el viaje no lo guarda: la divisa del primer tramo, la que más
// sale en los gastos o, si aún no hay nada, la que tienes arriba.
function destinoDelViaje(viaje, { aqui, from = null } = {}) {
  const tramo = leerTramos(viaje?.tramos).find((t) => t.divisa && t.divisa !== aqui);
  if (tramo) return tramo.divisa;
  const cuantos = new Map();
  for (const g of viaje?.gastos ?? []) {
    if (g.from !== aqui && isValidCode(g.from)) cuantos.set(g.from, (cuantos.get(g.from) ?? 0) + 1);
  }
  const masVisto = [...cuantos].sort((a, b) => b[1] - a[1])[0]?.[0];
  if (masVisto) return masVisto;
  return isValidCode(from) && from !== aqui ? from : null;
}

// Por debajo de tres horas el cuerpo ni se entera.
const JETLAG_MINIMO = 180;
const JETLAG_NOCHES = 3;

// Una hora al día es lo que se puede mover el sueño sin pasarlo mal, y con tres
// noches ya llegas con medio camino hecho. La diferencia, en minutos y con su
// signo: positiva si allí van por delante.
function planJetLag(diferencia) {
  if (!Number.isFinite(diferencia)) return null;
  // Más de doce horas por un lado son menos por el otro: +14 se lleva como −10.
  const min = diferencia > 720 ? diferencia - 1440 : diferencia < -720 ? diferencia + 1440 : diferencia;
  if (Math.abs(min) < JETLAG_MINIMO) return null;
  const horas = Math.round(Math.abs(min) / 60);
  const este = min > 0;
  // Hacia el este cuesta más: un día por hora. Hacia el oeste, dos de cada tres.
  return { diferencia, este, noches: Math.min(JETLAG_NOCHES, horas), dias: este ? horas : Math.ceil(horas * 2 / 3) };
}

function textoJetLag(plan) {
  if (!plan) return "";
  return tr(plan.este ? "maleta.jetlagEste" : "maleta.jetlagOeste", { dif: textoDiferencia(plan.diferencia), noches: plan.noches, dias: plan.dias });
}

// Lo que hay que hacer antes de salir, sacado de los cd de visado, sanitaria,
// roaming, enchufe, conducir, cajero y emergencias. Solo lo que pide hacer algo:
// si allí vale tu enchufe, no te digo que no compres adaptador.
function antesDeSalir(alli, aqui, diferencia = null) {
  if (!isValidCode(alli)) return [];
  const cosas = [];
  const pon = (clave, texto) => cosas.push({ clave, texto });
  const visado = VISADOS[alli];
  if (visado) {
    const [tipo, dias, permiso] = visado;
    pon("visado", tr(`maleta.visado.${tipo}`, { dias, permiso }));
  }
  pon("sanitaria", tr(CON_TSE.has(alli) ? "maleta.tse" : alli === "USD" ? "maleta.seguroCaro" : "maleta.seguro"));
  if (!ROAMING.ue.includes(alli)) pon("roaming", tr(ROAMING.cerca.includes(alli) ? "maleta.roamingCerca" : "maleta.esim"));
  const enchufe = enchufeDe(alli, aqui);
  if (enchufe?.entra === false) pon("adaptador", tr("maleta.adaptador", { tipos: enchufe.tipos.join("/") }));
  if (enchufe?.otroVoltaje) pon("voltaje", tr("maleta.voltaje", { voltios: enchufe.voltios.join("/") }));
  if (!CARNE_EUROPEO.has(alli)) pon("permiso", tr("maleta.permiso"));
  const pago = pagoAlli(alli);
  // Sin salir de tu divisa ya sabes cómo se paga, y el 112 te lo sabes.
  const fuera = alli !== aqui;
  if (fuera && pago && pago !== "tarjeta") pon("efectivo", tr(`maleta.${pago}`));
  if (fuera && EMERGENCIAS[alli]) {
    pon("emergencias", tr("maleta.emergencias", { numeros: EMERGENCIAS[alli].map(([n]) => n).join(", ") }));
  }
  // Al final, que es lo último que se hace: las noches de antes de salir.
  const jetlag = planJetLag(diferencia);
  if (jetlag) pon("jetlag", textoJetLag(jetlag));
  return cosas;
}

// Lo que ya has marcado, por su clave. Lo que ya no sale (cambiaste de destino)
// se queda guardado pero no cuenta.
const leerListo = (guardado) => (Array.isArray(guardado)
  ? [...new Set(guardado.filter((c) => typeof c === "string" && /^[a-z]{1,20}$/.test(c)))]
  : []);

function marcarListo(listo, clave) {
  const lista = leerListo(listo);
  return lista.includes(clave) ? lista.filter((c) => c !== clave) : [...lista, clave];
}

function progresoMaleta(cosas, listo) {
  const hechas = new Set(leerListo(listo));
  return { hechas: cosas.filter((c) => hechas.has(c.clave)).length, total: cosas.length };
}

// Cuánto apartar cada semana hasta salir para llegar con el presupuesto. Lo ya
// pagado (el vuelo, el hotel reservado) ya no hay que ahorrarlo; lo pendiente sí,
// que aún no ha salido de la cuenta. Hacia arriba a la unidad: mejor que sobre.
function huchaViaje(presupuesto, gastos, hoyIso = hoy()) {
  const faltanDias = cuentaAtras(presupuesto, hoyIso);
  if (faltanDias === null) return null;
  const gastado = gastos.filter((g) => g.to === presupuesto.to).reduce((suma, g) => suma + g.valor, 0);
  const falta = presupuesto.importe - gastado;
  if (falta < 1) return null;
  // Con menos de una semana, lo que falta de una vez.
  if (faltanDias < 7) return { falta, to: presupuesto.to, semanas: 0, porSemana: Math.ceil(falta) };
  const semanas = Math.floor(faltanDias / 7);
  return { falta, to: presupuesto.to, semanas, porSemana: Math.ceil(falta / semanas) };
}

// Días seguidos gastando lo que toca o menos, del de ayer hacia atrás: hoy aún
// no ha acabado. Lo que toca es fijo, el presupuesto entre los días del viaje,
// que con lo que queda al día la vara se movería cada vez que gastas.
const RACHA_MINIMA = 2;

function rachaPresupuesto(presupuesto, gastos, hoyIso = hoy()) {
  if (!presupuesto) return null;
  const inicio = inicioDelViaje(presupuesto, gastos, hoyIso);
  const total = diasHasta(presupuesto.hasta, inicio);
  if (total < 1) return null;
  // Lo fijo sale del presupuesto antes de repartirlo: lo que toca al día es lo que queda.
  const fijo = gastos.filter((g) => esFijo(g) && g.to === presupuesto.to).reduce((s, g) => s + g.valor, 0);
  const toca = Math.max(presupuesto.importe - fijo, 0) / total;
  const porDia = new Map();
  for (const g of delDiaADia(gastos)) {
    if (g.to !== presupuesto.to) continue;
    const dia = isoLocal(new Date(g.cuando));
    porDia.set(dia, (porDia.get(dia) ?? 0) + g.valor);
  }
  const [a, m, d] = hoyIso.split("-").map(Number);
  let dias = 0;
  for (let atras = 1; ; atras += 1) {
    const dia = isoLocal(new Date(a, m - 1, d - atras));
    if (dia < inicio) break;
    if (dia > presupuesto.hasta) continue;
    // El céntimo de margen es por los decimales: justo lo que toca también vale.
    if ((porDia.get(dia) ?? 0) > toca + 0.005) break;
    dias += 1;
  }
  return dias >= RACHA_MINIMA ? { dias, toca, to: presupuesto.to } : null;
}

// Al ritmo que llevas, hasta qué día te llega lo que queda. Solo si no llega al
// final: si llega, ya lo dice la barra. El primer día no, que el hotel pagado
// por adelantado haría pensar que te arruinas.
function hastaCuandoLlega(presupuesto, gastos, hoyIso = hoy(), pendientes = []) {
  const estado = estadoPresupuesto(presupuesto, gastos, hoyIso, pendientes);
  const dia = diaDelViaje(presupuesto, gastos, hoyIso);
  if (!estado || !dia || dia.dia < 2 || estado.libre <= 0) return null;
  // Lo fijo ya está pagado y no se repite: el ritmo es solo lo del día a día.
  const fijo = gastos.filter((g) => esFijo(g) && g.to === presupuesto.to).reduce((s, g) => s + g.valor, 0);
  const ritmo = (estado.gastado - fijo) / dia.dia;
  if (!(ritmo > 0)) return null;
  const llega = Math.floor(estado.libre / ritmo);
  if (llega >= dia.total - dia.dia) return null;
  const [a, m, d] = hoyIso.split("-").map(Number);
  return isoLocal(new Date(a, m - 1, d + llega));
}

// Cuánto habrás gastado al acabar si sigues así. Lo ya apuntado para días que
// vienen (las noches del hotel) cuenta tal cual, y su categoría no entra en el
// ritmo: si no, el hotel saldría dos veces.
function previsionViaje(presupuesto, gastos, hoyIso = hoy(), pendientes = []) {
  const dia = diaDelViaje(presupuesto, gastos, hoyIso);
  // El primer día no, por lo mismo que arriba, y el último ya no hay nada que prever.
  if (!dia || dia.dia < 2 || dia.dia >= dia.total) return null;
  const suyos = gastos.filter((g) => g.to === presupuesto.to);
  const esFuturo = (g) => isoLocal(new Date(g.cuando)) > hoyIso;
  const yaPagadas = new Set(suyos.filter(esFuturo).map((g) => g.categoria));
  let gastado = 0;
  let ritmo = 0;
  for (const g of suyos) {
    gastado += g.valor;
    if (!esFuturo(g) && !esFijo(g) && !yaPagadas.has(g.categoria)) ritmo += g.valor / dia.dia;
  }
  // Lo pendiente suele ser de lo que ya va en el ritmo (el hotel al salir), pero
  // aún no está pagado: cuenta tal cual, como las noches que vienen.
  const total = gastado + totalPendiente(pendientes, presupuesto.to) + ritmo * (dia.total - dia.dia);
  return { total, sobra: presupuesto.importe - total, fraccion: total / presupuesto.importe, to: presupuesto.to };
}

// Lo gastado día a día contra lo que tocaría yendo parejo, para ver cuándo se
// torció la cosa. Lo comprado antes de salir (el vuelo) va en el primer día, y
// lo apuntado para días que vienen (las noches del hotel), en el suyo, aunque
// la línea solo llega hasta hoy. "Torció" es desde cuándo vas por encima sin
// volver a bajar: un día malo suelto no es que se haya torcido.
function curvaPresupuesto(presupuesto, gastos, hoyIso = hoy(), pendientes = []) {
  if (!presupuesto) return null;
  const inicio = inicioDelViaje(presupuesto, gastos, hoyIso);
  const total = diasHasta(presupuesto.hasta, inicio);
  if (total < 2) return null;
  const [a, m, d] = inicio.split("-").map(Number);
  const dias = Array.from({ length: total }, (_, i) => isoLocal(new Date(a, m - 1, d + i)));
  const porDia = new Array(total).fill(0);
  for (const g of gastos) {
    if (g.to !== presupuesto.to) continue;
    const i = Math.min(Math.max(diasHasta(isoLocal(new Date(g.cuando)), inicio) - 1, 0), total - 1);
    porDia[i] += g.valor;
  }
  const hasta = hoyIso < inicio ? -1 : Math.min(diasHasta(hoyIso, inicio), total) - 1;
  let suma = 0;
  const puntos = dias.map((dia, i) => {
    suma += porDia[i];
    return { dia, gastado: i <= hasta ? Math.round(suma * 100) / 100 : null, ideal: (presupuesto.importe * (i + 1)) / total };
  });
  let torcio = null;
  for (let i = hasta; i >= 0 && puntos[i].gastado > puntos[i].ideal + 0.005; i -= 1) torcio = i;
  const prevision = previsionViaje(presupuesto, gastos, hoyIso, pendientes);
  return {
    to: presupuesto.to,
    importe: presupuesto.importe,
    puntos,
    hoy: hasta >= 0 && hoyIso <= presupuesto.hasta ? hasta : null,
    torcio: torcio === null ? null : puntos[torcio].dia,
    prevision: prevision ? prevision.total : null,
  };
}

// Por debajo de un 2 % del presupuesto lo doy por clavado: es una previsión, no
// una cuenta.
const PREVISION_JUSTA = 0.02;

function textoPrevision(prevision, importe) {
  if (!prevision) return "";
  const entero = numeros({ maximumFractionDigits: 0 });
  const total = `${entero.format(prevision.total)} ${prevision.to}`;
  if (Math.abs(prevision.sobra) < importe * PREVISION_JUSTA) return tr("prevision.justo", { total });
  const diferencia = entero.format(Math.abs(prevision.sobra));
  return tr(prevision.sobra > 0 ? "prevision.sobra" : "prevision.pasa", { total, diferencia });
}

// Lo que se llevaría el gasto que vas a apuntar: qué trozo del presupuesto y
// cuántos días de lo que te queda al día. En otra divisa no cuenta, igual que arriba.
function loQueSeLleva(presupuesto, gastos, gasto, hoyIso = hoy(), pendientes = []) {
  if (!presupuesto || !gasto || gasto.to !== presupuesto.to || !(gasto.valor > 0)) return null;
  const estado = estadoPresupuesto(presupuesto, gastos, hoyIso, pendientes);
  const trozo = gasto.valor / presupuesto.importe;
  return {
    desde: Math.min(estado.fraccion, 1),
    trozo: Math.max(0, Math.min(trozo, 1 - estado.fraccion)),
    pasaria: estado.fraccion + trozo > 1,
    dias: estado.porDia ? redondearDias(gasto.valor / estado.porDia) : null,
  };
}

// Lo mismo para la tarjeta de la web, pero contado sobre lo que te queda y no
// sobre el total: "el 18 % de lo que te queda" es lo que te hace pensártelo.
// Acabado el viaje ya no pinta nada, y por debajo del 1 % tampoco.
function presupuestoEnTarjeta(viaje, gasto, hoyIso = hoy()) {
  const presupuesto = viaje?.presupuesto;
  const seLleva = loQueSeLleva(presupuesto, viaje?.gastos ?? [], gasto, hoyIso, viaje?.pendientes);
  if (!seLleva) return null;
  const estado = estadoPresupuesto(presupuesto, viaje.gastos, hoyIso, viaje.pendientes);
  if (estado.dias === 0) return null;
  const base = { to: presupuesto.to, desde: seLleva.desde, trozo: seLleva.trozo };
  if (gasto.valor > estado.queda) {
    // Si ya ibas pasado, "te pasas en" sería todo el gasto: mejor decirlo así.
    return { ...base, tono: "pasado", exceso: gasto.valor - estado.queda, yaPasado: estado.queda <= 0 };
  }
  const fraccion = gasto.valor / estado.queda;
  if (fraccion < 0.01) return null;
  const tono = (estado.gastado + gasto.valor) / presupuesto.importe >= PRESUPUESTO_JUSTO ? "justo" : "bien";
  return { ...base, tono, fraccion, dias: seLleva.dias };
}

function textoPresupuestoTarjeta(r) {
  if (!r) return "";
  if (r.yaPasado) return tr("tarjeta.presupuestoYaPasado");
  if (r.exceso !== undefined) {
    const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return tr("tarjeta.presupuestoPasa", { exceso: `${dinero.format(r.exceso)} ${r.to}` });
  }
  const parte = tr("tarjeta.presupuesto", { pct: tr("pct", { n: Math.max(Math.round(r.fraccion * 100), 1) }) });
  if (r.dias === null) return parte;
  const dias = r.dias === 1 ? tr("presupuesto.estoUno") : tr("presupuesto.esto", { dias: numeros({ maximumFractionDigits: 1 }).format(r.dias) });
  // Sin espacios que partan: en la tarjeta, "días" se quedaba solo en otra línea.
  return `${parte}\u00a0· ${dias.replace(/ /g, "\u00a0")}`;
}

// Con un decimal hasta diez días; de ahí, sin decimales. Por debajo de una
// décima no lo digo: un café no te arruina el viaje.
function redondearDias(dias) {
  if (dias < 0.1) return null;
  return dias < 10 ? Math.round(dias * 10) / 10 : Math.round(dias);
}

function nombreDia(dia, hoyIso = hoy()) {
  const [a, m, d] = hoyIso.split("-").map(Number);
  if (dia === hoyIso) return tr("dia.hoy");
  if (dia === isoLocal(new Date(a, m - 1, d - 1))) return tr("dia.ayer");
  return fechaCorta(dia, a);
}
