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
};

const API_HISTORY = "https://api.frankfurter.dev/v1";

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
}

async function onDescargar() {
  const copia = crearCopia(await leerTodo());
  const url = URL.createObjectURL(new Blob([JSON.stringify(copia, null, 2)], { type: "application/json" }));
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `${tr("copia.archivo")}-${hoy()}.json`;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);

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
  const respuesta = await fetch(`${API_HISTORY}/${antes}..${hasta}?base=${from}&symbols=EUR`);
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  const datos = await respuesta.json();
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

// Las dos cajas para soltar se portan igual.
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
