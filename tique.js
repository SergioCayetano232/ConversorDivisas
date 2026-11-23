// Desde el popup no se puede elegir un archivo: el selector le quita el foco,
// el popup se cierra y la foto se pierde. Aquí sí, y se guarda en el mismo sitio.

const el = {
  gasto: document.getElementById("tique-gasto"),
  soltar: document.getElementById("soltar"),
  archivo: document.getElementById("archivo"),
  error: document.getElementById("error"),
  foto: document.getElementById("foto"),
  impresora: document.getElementById("impresora"),
  hecho: document.getElementById("hecho"),
};

const id = new URLSearchParams(location.search).get("gasto");

async function ponerIdiomaGuardado() {
  const { idioma } = await chrome.storage.local.get("idioma");
  ponerIdioma(idiomaElegido(idioma, chrome.i18n.getUILanguage()));
  document.documentElement.lang = idiomaActual();
  for (const nodo of document.querySelectorAll("[data-t]")) nodo.textContent = tr(nodo.dataset.t);
  document.title = `ConversorDivisas · ${tr("tique.pagina")}`;
}

// Lo busco en todos: puede estar en un viaje que no es el abierto, o en los de empresa.
async function buscarGasto() {
  const { viajes } = await chrome.storage.local.get("viajes");
  for (const v of [...(viajes?.lista ?? []), ...(viajes?.archivados ?? [])]) {
    const gasto = [...(v.gastos ?? []), ...(v.empresa ?? [])].find((g) => g.id === id);
    if (gasto) return gasto;
  }
  return null;
}

function mal(texto) {
  el.error.textContent = texto;
  el.error.hidden = false;
  el.soltar.classList.remove("is-mal");
  void el.soltar.offsetWidth;
  el.soltar.classList.add("is-mal");
}

async function guardar(archivo) {
  if (!archivo?.type.startsWith("image/")) return mal(tr("tique.mal"));
  el.error.hidden = true;
  try {
    const blob = await reducirFoto(archivo);
    await fotos.guardar(id, blob);
    if (el.foto.src) URL.revokeObjectURL(el.foto.src);
    el.foto.src = URL.createObjectURL(blob);
    // Cada foto nueva vuelve a salir por la ranura, también si cambias la que había.
    el.impresora.classList.remove("is-imprimiendo");
    el.impresora.hidden = false;
    void el.impresora.offsetWidth;
    el.impresora.classList.add("is-imprimiendo");
    el.hecho.hidden = false;
  } catch (error) {
    console.warn("No se pudo guardar el tique", error);
    mal(tr("tique.mal"));
  }
}

async function init() {
  await ponerIdiomaGuardado();
  const gasto = id ? await buscarGasto() : null;
  if (!gasto) {
    el.gasto.textContent = tr("tique.sinGasto");
    el.soltar.hidden = true;
    return;
  }
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  el.gasto.textContent = `${tr("tique.de", { concepto: gasto.concepto || tr("gastos.sinConcepto") })} · ${dinero.format(gasto.cantidad)} ${gasto.from}`;
  const yaHabia = await fotos.leer(id).catch(() => null);
  if (yaHabia) {
    el.foto.src = URL.createObjectURL(yaHabia);
    el.impresora.hidden = false;
  }
  el.archivo.addEventListener("change", () => guardar(el.archivo.files[0]));
  el.soltar.addEventListener("dragover", (event) => {
    event.preventDefault();
    el.soltar.classList.add("is-encima");
  });
  el.soltar.addEventListener("dragleave", () => el.soltar.classList.remove("is-encima"));
  el.soltar.addEventListener("drop", (event) => {
    event.preventDefault();
    el.soltar.classList.remove("is-encima");
    guardar(event.dataTransfer.files[0]);
  });
  document.addEventListener("paste", (event) => {
    const imagen = [...(event.clipboardData?.files ?? [])].find((f) => f.type.startsWith("image/"));
    if (imagen) guardar(imagen);
  });
}

init();
