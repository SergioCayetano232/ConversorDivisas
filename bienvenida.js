// Sale sola al instalar. Todo se guarda al cambiarlo: no hay botón de aceptar
// porque no hay nada que aceptar, lo adivinado ya vale.

const el = {
  divisa: document.getElementById("divisa"),
  idioma: document.getElementById("idioma"),
  guardado: document.getElementById("guardado"),
  teclaAbrir: document.getElementById("tecla-abrir"),
  teclaSeleccion: document.getElementById("tecla-seleccion"),
  notaBarra: document.getElementById("nota-barra"),
  teclas: document.getElementById("teclas"),
};

let idiomaGuardado = "auto";
// Si el par ya lo habías tocado tú (una copia restaurada, por ejemplo), no lo piso.
let parTuyo = false;
let teclas = { abrir: "", seleccion: "" };

function pintarTextos() {
  ponerIdioma(idiomaElegido(idiomaGuardado, chrome.i18n.getUILanguage()));
  document.documentElement.lang = idiomaActual();
  for (const nodo of document.querySelectorAll("[data-t]")) nodo.textContent = tr(nodo.dataset.t);
  document.title = `ConversorDivisas · ${tr("bienvenida.titulo")}`;

  const casa = el.divisa.value;
  el.divisa.replaceChildren(...CURRENCIES.map((d) => new Option(`${d.code} · ${nombreDe(d.code)}`, d.code)));
  el.divisa.value = casa;
  el.idioma.replaceChildren(
    new Option(tr("menu.idioma.auto"), "auto"),
    ...Object.entries(NOMBRES_IDIOMA).map(([codigo, nombre]) => new Option(nombre, codigo)),
  );
  el.idioma.value = idiomaGuardado;
  pintarAtajos();
}

function pintarTecla(nodo, tecla) {
  nodo.textContent = tecla || tr("bienvenida.sinTecla");
  nodo.classList.toggle("is-vacia", !tecla);
}

function pintarAtajos() {
  pintarTecla(el.teclaAbrir, teclas.abrir);
  pintarTecla(el.teclaSeleccion, teclas.seleccion);
  const casa = el.divisa.value;
  el.notaBarra.textContent = tr("bienvenida.barraNota", { ejemplo: `cd 20 ${casa === "USD" ? "eur" : "usd"}` });
}

function avisarGuardado() {
  el.guardado.hidden = false;
  el.guardado.classList.remove("is-nueva");
  void el.guardado.offsetWidth;
  el.guardado.classList.add("is-nueva");
}

async function guardarDivisa() {
  const casa = el.divisa.value;
  const cambios = { divisaCasa: casa };
  if (!parTuyo) {
    const par = parDeBienvenida(casa, parPorIdioma(navigator.languages));
    if (par) cambios.lastPair = par;
    else await chrome.storage.local.remove("lastPair");
  }
  await chrome.storage.local.set(cambios);
  pintarAtajos();
  avisarGuardado();
}

async function guardarIdioma() {
  idiomaGuardado = el.idioma.value;
  await chrome.storage.local.set({ idioma: idiomaGuardado });
  pintarTextos();
  avisarGuardado();
}

async function init() {
  const guardado = await chrome.storage.local.get(["idioma", "divisaCasa", "lastPair", "viajes"]);
  idiomaGuardado = guardado.idioma === "auto" || TEXTOS[guardado.idioma] ? guardado.idioma : "auto";
  parTuyo = Boolean(guardado.lastPair);
  const casa = tuDivisa({
    viajes: guardado.viajes ? todosLosViajes(leerViajes(guardado.viajes)) : [],
    idiomas: navigator.languages,
    par: guardado.lastPair,
    elegida: guardado.divisaCasa,
  });
  el.divisa.add(new Option(casa, casa));
  el.divisa.value = casa;
  // La que ves es la que vale: la dejo guardada aunque no toques nada, que es la
  // que usa la tarjeta de las webs.
  if (!leerDivisaCasa(guardado.divisaCasa)) await chrome.storage.local.set({ divisaCasa: casa });
  teclas = atajosDeBienvenida(await chrome.commands.getAll());
  pintarTextos();

  el.divisa.addEventListener("change", guardarDivisa);
  el.idioma.addEventListener("change", guardarIdioma);
  // A chrome:// no se llega con un enlace normal; abriendo la pestaña sí.
  el.teclas.addEventListener("click", () => chrome.tabs.create({ url: "chrome://extensions/shortcuts" }));
}

init();
