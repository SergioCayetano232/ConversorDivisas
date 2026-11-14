// La página de la copia de seguridad. Va aparte del popup porque al abrir el
// selector de archivos el popup pierde el foco, y Chrome puede cerrarlo.

const el = {
  cifras: document.getElementById("cifras"),
  descargar: document.getElementById("descargar"),
  descargarTexto: document.getElementById("descargar-texto"),
  soltar: document.getElementById("soltar"),
  archivo: document.getElementById("archivo"),
  error: document.getElementById("error"),
  previa: document.getElementById("previa"),
  previaFecha: document.getElementById("previa-fecha"),
  previaCifras: document.getElementById("previa-cifras"),
  restaurar: document.getElementById("restaurar"),
  cancelar: document.getElementById("cancelar"),
  hecho: document.getElementById("hecho"),
  appSoltar: document.getElementById("app-soltar"),
  appArchivo: document.getElementById("app-archivo"),
  appError: document.getElementById("app-error"),
  app: document.getElementById("app"),
  appViaje: document.getElementById("app-viaje"),
  appTu: document.getElementById("app-tu"),
  appAlli: document.getElementById("app-alli"),
  appAlliCampo: document.getElementById("app-alli-campo"),
  appLista: document.getElementById("app-lista"),
  appResumen: document.getElementById("app-resumen"),
  appImportar: document.getElementById("app-importar"),
  appCancelar: document.getElementById("app-cancelar"),
  appHecho: document.getElementById("app-hecho"),
  appHechoTexto: document.getElementById("app-hecho-texto"),
  appDeshacer: document.getElementById("app-deshacer"),
  bancoSoltar: document.getElementById("banco-soltar"),
  bancoArchivo: document.getElementById("banco-archivo"),
  bancoError: document.getElementById("banco-error"),
  banco: document.getElementById("banco"),
  bancoViaje: document.getElementById("banco-viaje"),
  bancoDivisa: document.getElementById("banco-divisa"),
  bancoDesde: document.getElementById("banco-desde"),
  bancoHasta: document.getElementById("banco-hasta"),
  bancoLista: document.getElementById("banco-lista"),
  bancoResumen: document.getElementById("banco-resumen"),
  bancoImportar: document.getElementById("banco-importar"),
  bancoCancelar: document.getElementById("banco-cancelar"),
  bancoHecho: document.getElementById("banco-hecho"),
  bancoHechoTexto: document.getElementById("banco-hecho-texto"),
  bancoDeshacer: document.getElementById("banco-deshacer"),
  grupoBajar: document.getElementById("grupo-bajar"),
  grupoTuViaje: document.getElementById("grupo-tu-viaje"),
  grupoDescargar: document.getElementById("grupo-descargar"),
  grupoSin: document.getElementById("grupo-sin"),
  grupoSoltar: document.getElementById("grupo-soltar"),
  grupoArchivo: document.getElementById("grupo-archivo"),
  grupoError: document.getElementById("grupo-error"),
  grupo: document.getElementById("grupo"),
  grupoViaje: document.getElementById("grupo-viaje"),
  grupoGente: document.getElementById("grupo-gente"),
  grupoLista: document.getElementById("grupo-lista"),
  grupoResumen: document.getElementById("grupo-resumen"),
  grupoImportar: document.getElementById("grupo-importar"),
  grupoCancelar: document.getElementById("grupo-cancelar"),
  grupoHecho: document.getElementById("grupo-hecho"),
  grupoHechoTexto: document.getElementById("grupo-hecho-texto"),
  grupoDeshacer: document.getElementById("grupo-deshacer"),
};


let pendiente = null;

function reiniciar(nodo, clase) {
  nodo.classList.remove(clase);
  void nodo.offsetWidth;
  nodo.classList.add(clase);
}

async function ponerIdiomaGuardado() {
  const { idioma } = await chrome.storage.local.get("idioma");
  ponerIdioma(idiomaElegido(idioma, chrome.i18n.getUILanguage()));
  document.documentElement.lang = idiomaActual();
  for (const nodo of document.querySelectorAll("[data-t]")) nodo.textContent = tr(nodo.dataset.t);
  for (const nodo of document.querySelectorAll("[data-t-aria-label]")) nodo.setAttribute("aria-label", tr(nodo.dataset.tAriaLabel));
  document.title = `ConversorDivisas · ${tr("copia")}`;
  el.descargar.title = tr("copia.abrir");
}

const CIFRAS = [
  ["viajes", "copia.viaje", "copia.viajes"],
  ["gastos", "copia.gasto", "copia.gastos"],
  ["avisos", "copia.aviso", "copia.avisos"],
  ["conversiones", "copia.conversion", "copia.conversiones"],
];

// Si una cifra cambia mientras miras (apuntas un gasto en el popup), late.
function pintarCifras(lista, resumen) {
  const enteros = numeros({ maximumFractionDigits: 0 });
  if (lista.children.length !== CIFRAS.length) {
    lista.replaceChildren(...CIFRAS.map((_, i) => {
      const li = document.createElement("li");
      li.className = "cifra";
      li.style.setProperty("--i", i);
      li.innerHTML = '<span class="cifra__n"></span><span class="cifra__que"></span>';
      li.addEventListener("animationend", () => li.classList.remove("is-cambiada"));
      return li;
    }));
  }
  CIFRAS.forEach(([clave, uno, varios], i) => {
    const li = lista.children[i];
    const n = enteros.format(resumen[clave]);
    const numero = li.querySelector(".cifra__n");
    if (numero.textContent && numero.textContent !== n) reiniciar(li, "is-cambiada");
    numero.textContent = n;
    li.querySelector(".cifra__que").textContent = tr(resumen[clave] === 1 ? uno : varios);
    li.classList.toggle("is-cero", resumen[clave] === 0);
  });
}

async function leerTodo() {
  return chrome.storage.local.get(null);
}

async function pintarAhora() {
  pintarCifras(el.cifras, resumenCopia(crearCopia(await leerTodo()).datos));
  await pintarBajarGrupo();
}

function bajarJson(objeto, nombre) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(objeto, null, 2)], { type: "application/json" }));
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function onDescargar() {
  bajarJson(crearCopia(await leerTodo()), `${tr("copia.archivo")}-${hoy()}.json`);

  el.descargarTexto.textContent = tr("copia.descargada");
  reiniciar(el.descargar, "is-hecho");
  clearTimeout(el.descargar.vuelta);
  el.descargar.vuelta = setTimeout(() => {
    el.descargar.classList.remove("is-hecho");
    el.descargarTexto.textContent = tr("copia.descargar");
  }, 1800);
}

function mostrarError(clave) {
  pendiente = null;
  el.previa.hidden = true;
  el.hecho.hidden = true;
  el.error.textContent = tr(clave);
  el.error.hidden = false;
  reiniciar(el.soltar, "is-mal");
}

async function leerArchivo(archivo) {
  if (!archivo) return;
  el.hecho.hidden = true;
  const leida = leerCopia(await archivo.text());
  if (leida.error) return mostrarError(`copia.error.${leida.error}`);

  pendiente = leida.datos;
  el.error.hidden = true;
  el.previaFecha.textContent = leida.creada
    ? tr("copia.deFecha", { fecha: fechas({ dateStyle: "long", timeStyle: "short" }).format(new Date(leida.creada)) })
    : tr("copia.sinFecha");
  el.previaCifras.replaceChildren();
  pintarCifras(el.previaCifras, resumenCopia(pendiente));
  el.previa.hidden = false;
  reiniciar(el.previa, "is-nueva");
  el.restaurar.focus();
}

// Quito antes lo de la copia y lo de antes de los viajes, y dejo la caché de
// tasas, que no es tuya y así el popup abre con el número puesto.
async function onRestaurar() {
  if (!pendiente) return;
  try {
    await chrome.storage.local.remove(CLAVES_COPIA);
    await chrome.storage.local.set(pendiente);
  } catch (error) {
    console.warn("No se pudo restaurar la copia", error);
    return mostrarError("copia.error.guardar");
  }
  pendiente = null;
  el.archivo.value = "";
  el.previa.hidden = true;
  el.hecho.hidden = false;
  reiniciar(el.hecho, "is-nueva");
  await ponerIdiomaGuardado();
  await pintarAhora();
}

function onCancelar() {
  pendiente = null;
  el.archivo.value = "";
  el.previa.hidden = true;
  el.soltar.focus();
}

// Lo del banco: los cargos leídos, los que has quitado a mano y lo último que
// se importó, para poder deshacerlo.
let movimientos = [];
const quitados = new Set();
let importado = null;

const dineroBanco = (n) => `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} EUR`;

async function cargarViajesGuardados() {
  const { viajes, gastosViaje, presupuestoViaje, categoriasPropias } = await chrome.storage.local.get(["viajes", "gastosViaje", "presupuestoViaje", "categoriasPropias"]);
  ponerCategoriasPropias(categoriasPropias);
  return leerViajes(viajes, gastosViaje, presupuestoViaje);
}

// La divisa que más sale en el viaje; si no tiene gastos, la de arriba del popup.
// Con el euro no vale: lo del banco ya está en euros.
function divisaDelViaje(viaje, lastPair) {
  const cuentas = new Map();
  for (const g of viaje.gastos) if (g.from !== "EUR") cuentas.set(g.from, (cuentas.get(g.from) ?? 0) + 1);
  const masUsada = [...cuentas].sort((a, b) => b[1] - a[1])[0]?.[0];
  return masUsada ?? (lastPair?.from !== "EUR" && isValidCode(lastPair?.from) ? lastPair.from : "USD");
}



function visibles() {
  const desde = el.bancoDesde.value || "0000";
  const hasta = el.bancoHasta.value || "9999";
  return movimientos.map((m, i) => ({ ...m, clave: String(i) })).filter((m) => m.fecha >= desde && m.fecha <= hasta);
}

async function pintarBanco() {
  const viajes = await cargarViajesGuardados();
  const viaje = viajes.lista.find((v) => v.id === el.bancoViaje.value) ?? viajes.lista[0];
  const lista = visibles();
  // Lo repetido lo miro con el viaje elegido: ese día, ese importe, ya estaba.
  const yaEsta = (m) => viaje.gastos.some((g) => g.to === "EUR" && isoLocal(new Date(g.cuando)) === m.fecha && Math.abs(g.valor - m.importe) < 0.005);
  el.bancoLista.replaceChildren(...lista.map((m, i) => {
    const li = document.createElement("li");
    li.className = "banco__fila";
    li.style.setProperty("--i", Math.min(i, 12));
    const repetido = yaEsta(m);
    li.classList.toggle("is-repetido", repetido);
    const marca = document.createElement("input");
    marca.type = "checkbox";
    marca.checked = !repetido && !quitados.has(m.clave);
    marca.disabled = repetido;
    const concepto = conceptoBanco(m.concepto) || tr("gastos.sinConcepto");
    marca.setAttribute("aria-label", tr("banco.incluir", { concepto, importe: dineroBanco(m.importe) }));
    marca.addEventListener("change", () => {
      if (marca.checked) quitados.delete(m.clave);
      else quitados.add(m.clave);
      pintarBanco();
    });
    const categoria = adivinarCategoria(concepto) ?? "otros";
    li.innerHTML = '<span class="banco__fecha"></span><span class="banco__cat" aria-hidden="true"></span><span class="banco__concepto"></span><span class="banco__importe"></span>';
    li.prepend(marca);
    li.querySelector(".banco__fecha").textContent = fechaCorta(m.fecha);
    li.querySelector(".banco__cat").textContent = emojiCategoria(categoria);
    li.querySelector(".banco__concepto").textContent = repetido ? `${concepto} · ${tr("banco.yaEsta")}` : concepto;
    li.querySelector(".banco__concepto").title = m.concepto;
    li.querySelector(".banco__importe").textContent = dineroBanco(m.importe);
    return li;
  }));
  const elegidos = lista.filter((m) => !yaEsta(m) && !quitados.has(m.clave));
  const total = elegidos.reduce((s, m) => s + m.importe, 0);
  const libres = GASTOS_MAX - viaje.gastos.length;
  el.bancoResumen.textContent = elegidos.length > libres
    ? tr("banco.noCaben", { libres, max: GASTOS_MAX })
    : tr("banco.resumen", { n: elegidos.length, de: lista.length, total: dineroBanco(total) });
  el.bancoResumen.classList.toggle("is-mal", elegidos.length > libres);
  el.bancoImportar.disabled = elegidos.length === 0 || elegidos.length > libres;
  el.bancoImportar.textContent = tr(elegidos.length === 1 ? "banco.importarUno" : "banco.importar", { n: elegidos.length });
}

function errorBanco(clave) {
  el.banco.hidden = true;
  el.bancoError.textContent = tr(clave);
  el.bancoError.hidden = false;
  reiniciar(el.bancoSoltar, "is-mal");
}

async function leerBanco(archivo) {
  if (!archivo) return;
  el.bancoHecho.hidden = true;
  const leido = leerCsvBanco(await archivo.text());
  if (leido.error) return errorBanco(`banco.error.${leido.error}`);
  movimientos = leido.movimientos;
  quitados.clear();
  el.bancoError.hidden = true;

  const [viajes, { lastPair }] = await Promise.all([cargarViajesGuardados(), chrome.storage.local.get("lastPair")]);
  el.bancoViaje.replaceChildren(...viajes.lista.map((v) => new Option(v.nombre || tr("gastos"), v.id, false, v.id === viajes.activo)));
  el.bancoDivisa.replaceChildren(...CURRENCIES.filter((c) => c.code !== "EUR")
    .map((c) => new Option(`${c.code} · ${nombreDe(c.code)}`, c.code)));
  ponerViaje(viajes, viajes.activo, lastPair);
  el.banco.hidden = false;
  reiniciar(el.banco, "is-nueva");
  await pintarBanco();
  el.bancoImportar.focus();
}

// Las fechas del presupuesto si las tiene, que son las del viaje; si no, las del archivo.
function ponerViaje(viajes, id, lastPair) {
  const viaje = viajes.lista.find((v) => v.id === id) ?? viajes.lista[0];
  el.bancoDivisa.value = divisaDelViaje(viaje, lastPair);
  el.bancoDesde.value = viaje.presupuesto?.desde ?? movimientos[0].fecha;
  el.bancoHasta.value = viaje.presupuesto?.hasta ?? movimientos.at(-1).fecha;
}

// Una semana antes de la primera fecha: si el viaje empieza en sábado, la
// tasa que vale es la del viernes.
async function tasasDelBanco(from, desde, hasta) {
  const [a, m, d] = desde.split("-").map(Number);
  const antes = isoLocal(new Date(a, m - 1, d - 7));
  const respuesta = await fetch(urlSerie(from, "EUR", antes, hasta));
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  const datos = aFormatoV1(await respuesta.json(), true);
  return Object.fromEntries(Object.entries(datos.rates ?? {}).map(([dia, r]) => [dia, r.EUR]));
}

async function onImportarBanco() {
  const from = el.bancoDivisa.value;
  const id = el.bancoViaje.value;
  el.bancoImportar.disabled = true;
  try {
    const viajes = await cargarViajesGuardados();
    const viaje = viajes.lista.find((v) => v.id === id);
    const elegidos = visibles().filter((m) => !quitados.has(m.clave));
    const tasas = await tasasDelBanco(from, elegidos[0].fecha, elegidos.at(-1).fecha);
    const { nuevos } = gastosDelBanco(elegidos, {
      from, tasas, existentes: viaje.gastos, idBase: `b${Date.now().toString(36)}`,
    });
    if (!nuevos.length) throw new Error("sin gastos");
    // Los nuevos delante, del más reciente al más viejo, como al apuntarlos.
    const gastos = [...[...nuevos].sort((a, b) => b.cuando - a.cuando), ...viaje.gastos].slice(0, GASTOS_MAX);
    await chrome.storage.local.set({ viajes: cambiarViaje(viajes, id, { gastos }) });
    importado = { viaje: id, ids: nuevos.map((g) => g.id) };
    el.banco.hidden = true;
    el.bancoArchivo.value = "";
    el.bancoHechoTexto.textContent = tr(nuevos.length === 1 ? "banco.hechoUno" : "banco.hecho", {
      n: nuevos.length, viaje: viaje.nombre || tr("gastos"),
    });
    el.bancoDeshacer.hidden = false;
    el.bancoHecho.hidden = false;
    reiniciar(el.bancoHecho, "is-nueva");
  } catch (error) {
    console.warn("No se pudo importar del banco", error);
    errorBanco("banco.error.tasas");
    el.banco.hidden = false;
    el.bancoImportar.disabled = false;
  }
}

async function onDeshacerBanco() {
  if (!importado) return;
  const viajes = await cargarViajesGuardados();
  const viaje = viajes.lista.find((v) => v.id === importado.viaje);
  if (viaje) {
    const fuera = new Set(importado.ids);
    await chrome.storage.local.set({ viajes: cambiarViaje(viajes, viaje.id, { gastos: viaje.gastos.filter((g) => !fuera.has(g.id)) }) });
  }
  importado = null;
  el.bancoHechoTexto.textContent = tr("banco.deshecho");
  el.bancoDeshacer.hidden = true;
  reiniciar(el.bancoHecho, "is-nueva");
}

function onCancelarBanco() {
  movimientos = [];
  el.bancoArchivo.value = "";
  el.banco.hidden = true;
  el.bancoSoltar.focus();
}

// Lo del grupo: el archivo leído, quién es quién, lo que has marcado a mano y
// lo último que se juntó, para poder deshacerlo.
let paquete = null;
let mapaGrupo = [];
const decisiones = new Map();
let juntado = null;

async function pintarBajarGrupo() {
  const { lista } = await cargarViajesGuardados();
  const con = lista.filter((v) => v.gastos.length);
  const antes = el.grupoTuViaje.value;
  el.grupoTuViaje.replaceChildren(...con.map((v) => new Option(v.nombre || tr("gastos"), v.id)));
  if (con.some((v) => v.id === antes)) el.grupoTuViaje.value = antes;
  el.grupoBajar.hidden = con.length === 0;
  el.grupoSin.hidden = con.length > 0;
}

async function onDescargarGrupo() {
  const viaje = (await cargarViajesGuardados()).lista.find((v) => v.id === el.grupoTuViaje.value);
  if (!viaje) return;
  bajarJson(crearPaquete(viaje), `${archivoGastos(viaje.nombre)}-${tr("grupo.archivo")}.json`);
  el.grupoDescargar.textContent = tr("copia.descargada");
  clearTimeout(el.grupoDescargar.vuelta);
  el.grupoDescargar.vuelta = setTimeout(() => { el.grupoDescargar.textContent = tr("grupo.descargar"); }, 1800);
}

function errorGrupo(clave) {
  paquete = null;
  el.grupo.hidden = true;
  el.grupoError.textContent = tr(clave);
  el.grupoError.hidden = false;
  reiniciar(el.grupoSoltar, "is-mal");
}

function ponerGente(viaje) {
  mapaGrupo = quienEsQuien(paquete, viaje);
  const mios = Math.max(leerPersonas(viaje.personas), paquete.personas);
  el.grupoGente.replaceChildren(...mapaGrupo.map((elegido, i) => {
    const caja = document.createElement("label");
    caja.className = "campo";
    const nombre = document.createElement("span");
    nombre.className = "campo__nombre";
    nombre.textContent = i === 0 ? tr("grupo.quienManda") : paquete.gente[i] || tr("gente.persona", { n: i + 1 });
    const lista = document.createElement("select");
    lista.className = "campo__control";
    lista.append(...[...Array(mios).keys()].map((k) => new Option(nombrePersona(viaje.gente, k), String(k))));
    lista.value = String(elegido);
    lista.addEventListener("change", () => {
      mapaGrupo[i] = Number(lista.value);
      pintarGrupo();
    });
    caja.append(nombre, lista);
    return caja;
  }));
}

const entraEnGrupo = (fila) => decisiones.get(fila.gasto.id) ?? !fila.repetido;

async function pintarGrupo() {
  if (!paquete) return;
  const viajes = await cargarViajesGuardados();
  const viaje = viajes.lista.find((v) => v.id === el.grupoViaje.value) ?? viajes.lista[0];
  const r = gastosParaJuntar(paquete, viaje, mapaGrupo);
  const dinero = (n) => `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ${r.to}`;
  el.grupoLista.replaceChildren(...r.filas.map((fila, i) => {
    const { gasto, repetido } = fila;
    const li = document.createElement("li");
    li.className = "banco__fila";
    li.style.setProperty("--i", Math.min(i, 12));
    li.classList.toggle("is-repetido", repetido);
    const que = gasto.concepto || nombreCategoria(gasto.categoria);
    const marca = document.createElement("input");
    marca.type = "checkbox";
    marca.checked = entraEnGrupo(fila);
    marca.setAttribute("aria-label", tr("banco.incluir", { concepto: que, importe: dinero(gasto.valor) }));
    marca.addEventListener("change", () => {
      decisiones.set(gasto.id, marca.checked);
      pintarGrupo();
    });
    li.innerHTML = '<span class="banco__fecha"></span><span class="banco__cat" aria-hidden="true"></span><span class="banco__concepto"></span><span class="banco__importe"></span>';
    li.prepend(marca);
    li.querySelector(".banco__fecha").textContent = fechaCorta(isoLocal(new Date(gasto.cuando)));
    li.querySelector(".banco__cat").textContent = emojiCategoria(gasto.categoria);
    li.querySelector(".banco__concepto").textContent = [que, nombrePersona(viaje.gente, gasto.pagador ?? 0), repetido ? tr("grupo.repetido") : ""].filter(Boolean).join(" · ");
    li.querySelector(".banco__importe").textContent = dinero(gasto.valor);
    return li;
  }));
  const elegidos = r.filas.filter(entraEnGrupo);
  const libres = GASTOS_MAX - viaje.gastos.length;
  const bien = mapaValido(mapaGrupo);
  const cabe = elegidos.length <= libres;
  const partes = [tr("grupo.resumen", { n: elegidos.length, de: r.filas.length, total: dinero(elegidos.reduce((s, f) => s + f.gasto.valor, 0)) })];
  if (r.yaEstan) partes.push(tr("grupo.yaEstan", { n: r.yaEstan }));
  if (r.otraDivisa) partes.push(tr("grupo.otraDivisa", { n: r.otraDivisa }));
  el.grupoResumen.textContent = !bien ? tr("grupo.iguales")
    : !cabe ? tr("grupo.noCaben", { libres, max: GASTOS_MAX })
    : partes.join(" · ");
  el.grupoResumen.classList.toggle("is-mal", !bien || !cabe);
  el.grupoImportar.disabled = !bien || !cabe || elegidos.length === 0;
  el.grupoImportar.textContent = tr(elegidos.length === 1 ? "banco.importarUno" : "banco.importar", { n: elegidos.length });
}

async function leerGrupo(archivo) {
  if (!archivo) return;
  el.grupoHecho.hidden = true;
  const leido = leerPaquete(await archivo.text());
  if (leido.error) return errorGrupo(`grupo.error.${leido.error}`);
  paquete = leido;
  decisiones.clear();
  el.grupoError.hidden = true;
  const viajes = await cargarViajesGuardados();
  el.grupoViaje.replaceChildren(...viajes.lista.map((v) => new Option(v.nombre || tr("gastos"), v.id, false, v.id === viajes.activo)));
  ponerGente(viajes.lista.find((v) => v.id === viajes.activo));
  el.grupo.hidden = false;
  reiniciar(el.grupo, "is-nueva");
  await pintarGrupo();
  el.grupoImportar.focus();
}

async function onCambiarViajeGrupo() {
  ponerGente((await cargarViajesGuardados()).lista.find((v) => v.id === el.grupoViaje.value));
  pintarGrupo();
}

async function onImportarGrupo() {
  const id = el.grupoViaje.value;
  el.grupoImportar.disabled = true;
  try {
    const viajes = await cargarViajesGuardados();
    const viaje = viajes.lista.find((v) => v.id === id);
    const r = gastosParaJuntar(paquete, viaje, mapaGrupo);
    const nuevos = r.filas.filter(entraEnGrupo).map((f) => f.gasto);
    await chrome.storage.local.set({ viajes: cambiarViaje(viajes, id, juntarGastos(viaje, nuevos, r.personas)) });
    juntado = { viaje: id, ids: nuevos.map((g) => g.id), personas: viaje.personas };
    paquete = null;
    el.grupo.hidden = true;
    el.grupoArchivo.value = "";
    el.grupoHechoTexto.textContent = tr(nuevos.length === 1 ? "grupo.hechoUno" : "grupo.hecho", { n: nuevos.length, viaje: viaje.nombre || tr("gastos") });
    el.grupoDeshacer.hidden = false;
    el.grupoHecho.hidden = false;
    reiniciar(el.grupoHecho, "is-nueva");
  } catch (error) {
    console.warn("No se pudo juntar el viaje", error);
    el.grupoError.textContent = tr("copia.error.guardar");
    el.grupoError.hidden = false;
    el.grupoImportar.disabled = false;
  }
}

async function onDeshacerGrupo() {
  if (!juntado) return;
  const viajes = await cargarViajesGuardados();
  const viaje = viajes.lista.find((v) => v.id === juntado.viaje);
  if (viaje) {
    const fuera = new Set(juntado.ids);
    await chrome.storage.local.set({ viajes: cambiarViaje(viajes, viaje.id, { gastos: viaje.gastos.filter((g) => !fuera.has(g.id)), personas: juntado.personas }) });
  }
  juntado = null;
  el.grupoHechoTexto.textContent = tr("banco.deshecho");
  el.grupoDeshacer.hidden = true;
  reiniciar(el.grupoHecho, "is-nueva");
}

function onCancelarGrupo() {
  paquete = null;
  el.grupoArchivo.value = "";
  el.grupo.hidden = true;
  el.grupoSoltar.focus();
}

// Las dos cajas para soltar se portan igual.
// De Splitwise o Tricount. Por defecto a un viaje nuevo: uno que ya tiene su
// gente no se mezcla con la de otra app, que no sabría quién es quién.
let leidoApp = null;
let importadoApp = null;
const NUEVO_VIAJE = "__nuevo";

const dineroApp = (n, divisa) => `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ${divisa}`;

function divisaPrincipal(viaje, viajes) {
  return sumarPorDivisa(viaje?.gastos ?? [])[0]?.to
    ?? tuDivisa({ viajes: todosLosViajes(viajes), idiomas: navigator.languages });
}

// La de allí: la más repetida del archivo que no es la tuya.
function divisaDeAlli(leido, to) {
  const veces = new Map();
  for (const g of leido.gastos) if (g.divisa !== to) veces.set(g.divisa, (veces.get(g.divisa) ?? 0) + 1);
  return [...veces].sort((a, b) => b[1] - a[1])[0]?.[0] ?? (to === "USD" ? "EUR" : "USD");
}

function errorApp(clave, datos) {
  el.app.hidden = true;
  el.appError.textContent = tr(clave, datos);
  el.appError.hidden = false;
  reiniciar(el.appSoltar, "is-mal");
}

async function leerApp(archivo) {
  if (!archivo) return;
  el.appHecho.hidden = true;
  const leido = leerCsvGrupo(await archivo.text());
  if (leido.error) return errorApp(`app.error.${leido.error}`, { max: PERSONAS_MAX });
  leidoApp = leido;
  el.appError.hidden = true;
  const viajes = await cargarViajesGuardados();
  const to = divisaPrincipal(null, viajes);
  const lleno = viajes.lista.length >= VIAJES_MAX;
  const nombre = nombreDeDestino(divisaDeAlli(leido, to), viajes.lista) || tr("viajes.sinNombre");
  const nuevo = lleno ? [] : [new Option(tr("app.nuevo", { nombre }), NUEVO_VIAJE, true, true)];
  if (nuevo[0]) nuevo[0].dataset.nombre = nombre;
  el.appViaje.replaceChildren(...nuevo, ...viajes.lista.map((v) => new Option(v.nombre || tr("gastos"), v.id, false, lleno && v.id === viajes.activo)));
  el.appTu.replaceChildren(...leido.personas.map((n, i) => new Option(n, String(i))));
  el.appAlli.replaceChildren(...CURRENCIES.map((c) => new Option(`${c.code} · ${nombreDe(c.code)}`, c.code)));
  el.appAlli.value = divisaDeAlli(leido, to);
  el.app.hidden = false;
  reiniciar(el.app, "is-nueva");
  await pintarApp();
  el.appTu.focus();
}

async function pintarApp() {
  if (!leidoApp) return;
  const viajes = await cargarViajesGuardados();
  const viaje = viajes.lista.find((v) => v.id === el.appViaje.value) ?? null;
  const to = divisaPrincipal(viaje, viajes);
  const tu = Number(el.appTu.value);
  // Solo hace falta si hay algo en tu divisa: se guarda en la de allí.
  el.appAlliCampo.hidden = !leidoApp.gastos.some((g) => g.divisa === to);
  el.appLista.replaceChildren(...leidoApp.gastos.map((g) => {
    const li = document.createElement("li");
    li.className = "banco__fila";
    li.innerHTML = '<span class="banco__fecha"></span><span class="banco__cat" aria-hidden="true"></span><span class="banco__concepto"></span><span class="banco__importe"></span>';
    li.querySelector(".banco__fecha").textContent = fechaCorta(g.fecha);
    li.querySelector(".banco__cat").textContent = emojiCategoria(g.categoria);
    const quien = g.pagador === null ? "" : g.pagador === tu ? tr("app.pagasteTu") : tr("app.pago", { quien: leidoApp.personas[g.pagador] });
    const entre = g.entre ? ` · ${tr("app.entre", { n: g.entre.length })}` : "";
    li.querySelector(".banco__concepto").textContent = `${g.concepto || tr("gastos.sinConcepto")}${quien ? ` · ${quien}` : ""}${entre}`;
    li.querySelector(".banco__importe").textContent = dineroApp(g.importe, g.divisa);
    return li;
  }));
  const conGente = viaje && viaje.personas > 1;
  const libres = GASTOS_MAX - (viaje?.gastos.length ?? 0);
  let aviso = null;
  if (conGente) aviso = tr("app.yaTieneGente", { viaje: viaje.nombre || tr("gastos") });
  else if (leidoApp.gastos.length > libres) aviso = tr("banco.noCaben", { libres, max: GASTOS_MAX });
  el.appResumen.textContent = aviso ?? tr("app.resumen", {
    n: leidoApp.gastos.length, app: leidoApp.app === "tricount" ? "Tricount" : "Splitwise", personas: leidoApp.personas.length,
  });
  el.appResumen.classList.toggle("is-mal", Boolean(aviso));
  el.appImportar.disabled = Boolean(aviso);
  el.appImportar.textContent = tr(leidoApp.gastos.length === 1 ? "banco.importarUno" : "banco.importar", { n: leidoApp.gastos.length });
}

// Lo que vale 1 de esa divisa en la tuya cada día. Una semana antes, que si el
// primero cae en sábado la tasa que vale es la del viernes.
async function tasasSerie(from, to, desde, hasta) {
  const [a, m, d] = desde.split("-").map(Number);
  const antes = isoLocal(new Date(a, m - 1, d - 7));
  const respuesta = await fetch(urlSerie(from, to, antes, hasta));
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  const datos = aFormatoV1(await respuesta.json(), true);
  return Object.fromEntries(Object.entries(datos.rates ?? {}).map(([dia, r]) => [dia, r[to]]));
}

async function onImportarApp() {
  el.appImportar.disabled = true;
  try {
    let viajes = await cargarViajesGuardados();
    let id = el.appViaje.value;
    const nuevo = id === NUEVO_VIAJE;
    const alli = el.appAlli.value;
    const to = divisaPrincipal(viajes.lista.find((v) => v.id === id), viajes);
    const desde = leidoApp.gastos[0].fecha;
    const hasta = leidoApp.gastos.at(-1).fecha;
    const divisas = [...new Set(leidoApp.gastos.map((g) => (g.divisa === to ? alli : g.divisa)))].filter((c) => c !== to);
    const tasas = Object.fromEntries(await Promise.all(divisas.map(async (c) => [c, await tasasSerie(c, to, desde, hasta)])));
    if (nuevo) {
      id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const creado = crearViaje(viajes, id, el.appViaje.selectedOptions[0].dataset.nombre);
      if (creado === viajes) throw new Error("sin sitio");
      viajes = creado;
    }
    const viaje = viajes.lista.find((v) => v.id === id);
    const r = gastosDelGrupo(leidoApp, {
      tu: Number(el.appTu.value), to, alli, tasas, existentes: viaje.gastos, idBase: `s${Date.now().toString(36)}`,
    });
    if (!r.nuevos.length) throw new Error(r.repetidos ? "repetidos" : "sin tasas");
    const gastos = [...[...r.nuevos].sort((a, b) => b.cuando - a.cuando), ...viaje.gastos].slice(0, GASTOS_MAX);
    importadoApp = { viaje: id, ids: r.nuevos.map((g) => g.id), nuevo, antes: { personas: viaje.personas, gente: viaje.gente } };
    await chrome.storage.local.set({ viajes: cambiarViaje(viajes, id, { gastos, personas: r.personas, gente: r.gente }) });
    el.app.hidden = true;
    el.appArchivo.value = "";
    const fuera = r.repetidos + r.sinTasa;
    el.appHechoTexto.textContent = tr(r.nuevos.length === 1 ? "banco.hechoUno" : "banco.hecho", { n: r.nuevos.length, viaje: viaje.nombre || tr("gastos") })
      + (fuera ? ` ${tr("app.fuera", { n: fuera })}` : "");
    el.appDeshacer.hidden = false;
    el.appHecho.hidden = false;
    reiniciar(el.appHecho, "is-nueva");
  } catch (error) {
    console.warn("No se pudo importar de la app", error);
    errorApp(error.message === "repetidos" ? "app.error.repetidos" : "banco.error.tasas");
    el.app.hidden = false;
    el.appImportar.disabled = false;
  }
}

// Deshacer lo deja como estaba: si el viaje era nuevo, se va entero.
async function onDeshacerApp() {
  if (!importadoApp) return;
  const viajes = await cargarViajesGuardados();
  const viaje = viajes.lista.find((v) => v.id === importadoApp.viaje);
  if (viaje && importadoApp.nuevo) {
    await chrome.storage.local.set({ viajes: borrarViaje(viajes, viaje.id) });
  } else if (viaje) {
    const fuera = new Set(importadoApp.ids);
    await chrome.storage.local.set({ viajes: cambiarViaje(viajes, viaje.id, {
      gastos: viaje.gastos.filter((g) => !fuera.has(g.id)), ...importadoApp.antes,
    }) });
  }
  el.appHechoTexto.textContent = tr(importadoApp.nuevo ? "app.deshechoNuevo" : "banco.deshecho", { viaje: viaje?.nombre ?? "" });
  importadoApp = null;
  el.appDeshacer.hidden = true;
  reiniciar(el.appHecho, "is-nueva");
}

function onCancelarApp() {
  leidoApp = null;
  el.appArchivo.value = "";
  el.app.hidden = true;
  el.appSoltar.focus();
}

function zonaDeSoltar(zona, alSoltar) {
  for (const tipo of ["dragenter", "dragover"]) {
    zona.addEventListener(tipo, (event) => {
      event.preventDefault();
      zona.classList.add("is-encima");
    });
  }
  zona.addEventListener("dragleave", (event) => {
    if (!zona.contains(event.relatedTarget)) zona.classList.remove("is-encima");
  });
  zona.addEventListener("drop", (event) => {
    event.preventDefault();
    zona.classList.remove("is-encima");
    alSoltar(event.dataTransfer.files[0]);
  });
  zona.addEventListener("animationend", () => zona.classList.remove("is-mal"));
}

function bindEvents() {
  zonaDeSoltar(el.appSoltar, leerApp);
  el.appArchivo.addEventListener("change", () => leerApp(el.appArchivo.files[0]));
  for (const campo of [el.appViaje, el.appTu, el.appAlli]) campo.addEventListener("change", pintarApp);
  el.appImportar.addEventListener("click", onImportarApp);
  el.appCancelar.addEventListener("click", onCancelarApp);
  el.appDeshacer.addEventListener("click", onDeshacerApp);
  zonaDeSoltar(el.grupoSoltar, leerGrupo);
  el.grupoArchivo.addEventListener("change", () => leerGrupo(el.grupoArchivo.files[0]));
  el.grupoDescargar.addEventListener("click", onDescargarGrupo);
  el.grupoViaje.addEventListener("change", onCambiarViajeGrupo);
  el.grupoImportar.addEventListener("click", onImportarGrupo);
  el.grupoCancelar.addEventListener("click", onCancelarGrupo);
  el.grupoDeshacer.addEventListener("click", onDeshacerGrupo);
  zonaDeSoltar(el.bancoSoltar, leerBanco);
  el.bancoArchivo.addEventListener("change", () => leerBanco(el.bancoArchivo.files[0]));
  el.bancoViaje.addEventListener("change", async () => {
    ponerViaje(await cargarViajesGuardados(), el.bancoViaje.value, (await chrome.storage.local.get("lastPair")).lastPair);
    pintarBanco();
  });
  for (const campo of [el.bancoDesde, el.bancoHasta]) campo.addEventListener("change", pintarBanco);
  el.bancoImportar.addEventListener("click", onImportarBanco);
  el.bancoCancelar.addEventListener("click", onCancelarBanco);
  el.bancoDeshacer.addEventListener("click", onDeshacerBanco);
  el.descargar.addEventListener("click", onDescargar);
  el.archivo.addEventListener("change", () => leerArchivo(el.archivo.files[0]));
  el.restaurar.addEventListener("click", onRestaurar);
  el.cancelar.addEventListener("click", onCancelar);
  el.soltar.addEventListener("animationend", () => el.soltar.classList.remove("is-mal"));
  // Sin el preventDefault del dragover, Chrome abre el archivo en la pestaña.
  for (const tipo of ["dragenter", "dragover"]) {
    el.soltar.addEventListener(tipo, (event) => {
      event.preventDefault();
      el.soltar.classList.add("is-encima");
    });
  }
  el.soltar.addEventListener("dragleave", (event) => {
    if (!el.soltar.contains(event.relatedTarget)) el.soltar.classList.remove("is-encima");
  });
  el.soltar.addEventListener("drop", (event) => {
    event.preventDefault();
    el.soltar.classList.remove("is-encima");
    leerArchivo(event.dataTransfer.files[0]);
  });
  // Soltarlo fuera de la caja tampoco debe abrir el JSON en la pestaña.
  window.addEventListener("dragover", (event) => event.preventDefault());
  window.addEventListener("drop", (event) => event.preventDefault());
  chrome.storage.onChanged.addListener((cambios, zona) => {
    if (zona !== "local") return;
    if (cambios.idioma) ponerIdiomaGuardado().then(pintarAhora);
    else pintarAhora();
  });
}

async function init() {
  await ponerIdiomaGuardado();
  bindEvents();
  await pintarAhora();
}

init();
