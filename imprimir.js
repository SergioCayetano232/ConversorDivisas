// La chuleta en papel. Todo llega por la URL desde el popup, que se cierra en
// cuanto Chrome abre el diálogo de imprimir.

const el = {
  cartera: document.getElementById("cartera"),
  error: document.getElementById("error"),
  imprimir: document.getElementById("imprimir"),
};

async function ponerIdiomaGuardado() {
  const { idioma } = await chrome.storage.local.get("idioma");
  ponerIdioma(idiomaElegido(idioma, chrome.i18n.getUILanguage()));
  document.documentElement.lang = idiomaActual();
  for (const nodo of document.querySelectorAll("[data-t]")) nodo.textContent = tr(nodo.dataset.t);
  document.title = `ConversorDivisas · ${tr("imprimir.titulo")}`;
}

function crearCara(filas, de, a, nota) {
  const entero = numeros({ maximumFractionDigits: 0 });
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const cara = document.createElement("article");
  cara.className = "cara";
  const cabeza = document.createElement("header");
  cabeza.className = "cara__cabeza";
  const par = document.createElement("span");
  par.className = "cara__par";
  par.innerHTML = `<b>${banderaDivisa(de)} ${de}</b><i aria-hidden="true">→</i><b>${banderaDivisa(a)} ${a}</b>`;
  cabeza.append(par);
  // Si la tabla llega a los miles, toda sin céntimos: 17.730 yenes, no 17.730,50,
  // y sin mezclar filas con y sin.
  const formato = Math.max(...filas.map((f) => f.valor)) >= 1000 ? entero : dinero;
  const lista = document.createElement("ol");
  lista.className = "cara__filas";
  for (const { cantidad, valor } of filas) {
    const fila = document.createElement("li");
    const izq = document.createElement("span");
    izq.textContent = entero.format(cantidad);
    const der = document.createElement("span");
    der.textContent = formato.format(valor);
    fila.append(izq, der);
    lista.append(fila);
  }
  const pie = document.createElement("footer");
  pie.className = "cara__pie";
  pie.textContent = nota;
  cara.append(cabeza, lista, pie);
  return cara;
}

function pintar(datos) {
  const { ida, vuelta } = chuletaParaImprimir(datos);
  const fecha = datos.fecha ? tr("imprimir.fecha", { fecha: fechaCorta(datos.fecha) }) : "";
  const conComision = datos.comision > 0
    ? tr("imprimir.comision", { pct: tr("pct", { n: numeros({ maximumFractionDigits: 2 }).format(datos.comision) }) })
    : tr("imprimir.sinComision");
  el.cartera.replaceChildren(
    crearCara(ida, datos.from, datos.to, [conComision, fecha].filter(Boolean).join(" · ")),
    crearCara(vuelta, datos.to, datos.from, [tr("imprimir.teDan"), fecha].filter(Boolean).join(" · ")),
  );
}

async function init() {
  await ponerIdiomaGuardado();
  const datos = leerImpresion(location.search);
  el.imprimir.addEventListener("click", () => window.print());
  if (!datos) {
    el.error.textContent = tr("imprimir.error");
    el.error.hidden = false;
    el.imprimir.disabled = true;
    return;
  }
  pintar(datos);
  // Que se vea la tarjeta antes de que el diálogo la tape.
  setTimeout(() => window.print(), 700);
}

init();
