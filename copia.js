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

function bindEvents() {
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
