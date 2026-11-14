// Desde el popup Chrome no enseña la pregunta del micrófono: falla callado.
// Aquí sí la enseña, y lo que se da a la extensión vale también para el popup.

const el = {
  estado: document.getElementById("estado"),
  pedir: document.getElementById("pedir"),
  microfono: document.getElementById("microfono"),
};

async function ponerIdiomaGuardado() {
  const { idioma } = await chrome.storage.local.get("idioma");
  ponerIdioma(idiomaElegido(idioma, chrome.i18n.getUILanguage()));
  document.documentElement.lang = idiomaActual();
  for (const nodo of document.querySelectorAll("[data-t]")) nodo.textContent = tr(nodo.dataset.t);
  document.title = `ConversorDivisas · ${tr("voz.permisoTitulo")}`;
}

async function pedir() {
  el.pedir.hidden = true;
  el.estado.textContent = tr("voz.permisoPidiendo");
  delete el.microfono.dataset.estado;
  try {
    const flujo = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Solo quería el permiso: lo suelto ya, que si no se queda el punto rojo en la pestaña.
    for (const pista of flujo.getTracks()) pista.stop();
    el.microfono.dataset.estado = "si";
    el.estado.textContent = tr("voz.permisoListo");
  } catch (error) {
    console.warn("Sin micrófono", error);
    el.microfono.dataset.estado = "no";
    el.estado.textContent = tr(error?.name === "NotFoundError" ? "voz.permisoSinMicro" : "voz.permisoNo");
    el.pedir.hidden = false;
  }
}

async function init() {
  await ponerIdiomaGuardado();
  el.pedir.addEventListener("click", pedir);
  pedir();
}

init();
