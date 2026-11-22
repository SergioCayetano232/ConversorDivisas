// Sale sola al instalar. Todo se guarda al cambiarlo: no hay botón de aceptar
// porque no hay nada que aceptar, lo adivinado ya vale.

const el = {
  divisa: document.getElementById("divisa"),
  idioma: document.getElementById("idioma"),
  guardado: document.getElementById("guardado"),
  teclaAbrir: document.getElementById("tecla-abrir"),
  teclaSeleccion: document.getElementById("tecla-seleccion"),
  notaBarra: document.getElementById("nota-barra"),
  demo: document.getElementById("demo"),
  demoPrecio: document.getElementById("demo-precio"),
  demoConvertido: document.getElementById("demo-convertido"),
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
  pintarDemo();
}

function pintarTecla(nodo, tecla) {
  nodo.textContent = tecla || tr("bienvenida.sinTecla");
  nodo.classList.toggle("is-vacia", !tecla);
}

function pintarAtajos() {
  pintarTecla(el.teclaAbrir, teclas.abrir);
  pintarTecla(el.teclaSeleccion, teclas.seleccion);
  const casa = el.divisa.value;
  el.notaBarra.textContent = tr("bienvenida.barraNota", { ejemplo: `cd ${DEMO_CANTIDAD} ${divisaDeEjemplo(casa).toLowerCase()}` });
}

async function tasaDeLaDemo(from, to) {
  const { rateCache } = await chrome.storage.local.get("rateCache");
  const guardada = rateCache?.[`${from}${to}`];
  if (isFresh(guardada)) return guardada.rate;
  const respuesta = await fetch(urlTasa(from, to), { signal: AbortSignal.timeout(8000) });
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  return aFormatoV1(await respuesta.json()).rates?.[to];
}

// La tasa de verdad, para que el ejemplo no mienta. Si no llega, la demo no sale.
let tasaDemo = null;

function pintarDemo() {
  const demo = tasaDemo?.casa === el.divisa.value ? demoDeBienvenida(tasaDemo.casa, tasaDemo.rate) : null;
  el.demo.hidden = !demo;
  if (!demo) return;
  el.demoPrecio.textContent = demo.precio;
  el.demoConvertido.textContent = demo.convertido;
}

async function cargarDemo() {
  const casa = el.divisa.value;
  pintarDemo();
  try {
    const rate = await tasaDeLaDemo(divisaDeEjemplo(casa), casa);
    // Si mientras tanto has elegido otra, esta ya no vale.
    if (casa !== el.divisa.value) return;
    tasaDemo = { casa, rate };
  } catch (error) {
    console.warn("No se pudo pedir la tasa de la demo", error);
  }
  pintarDemo();
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
  cargarDemo();
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
  cargarDemo();

  el.divisa.addEventListener("change", guardarDivisa);
  el.idioma.addEventListener("change", guardarIdioma);
  // A chrome:// no se llega con un enlace normal; abriendo la pestaña sí.
  el.teclas.addEventListener("click", () => chrome.tabs.create({ url: "chrome://extensions/shortcuts" }));
}

init();
