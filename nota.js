// La nota de gastos para imprimir. Lee el viaje del almacenamiento y no de la
// URL, que con muchos gastos no cabrían.

const el = {
  nota: document.getElementById("nota"),
  viaje: document.getElementById("nota-viaje"),
  periodo: document.getElementById("nota-periodo"),
  filas: document.getElementById("nota-filas"),
  totales: document.getElementById("nota-totales"),
  imprimir: document.getElementById("imprimir"),
  error: document.getElementById("error"),
};

function celda(texto, clase) {
  const td = document.createElement("td");
  td.textContent = texto;
  if (clase) td.className = clase;
  return td;
}

function pintar(nota) {
  const dos = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  el.viaje.textContent = nota.nombre;
  el.periodo.textContent = nota.desde === nota.hasta ? fechaLarga(nota.desde)
    : tr("nota.periodo", { desde: fechaLarga(nota.desde), hasta: fechaLarga(nota.hasta) });
  el.filas.replaceChildren(...nota.filas.map((f) => {
    const tr_ = document.createElement("tr");
    tr_.append(
      celda(fechaCorta(f.dia)),
      celda(f.concepto),
      celda(f.categoria),
      celda(f.pago),
      celda(`${dos.format(f.cantidad)} ${f.from}`, "nota__cifra"),
      celda(`${dos.format(f.valor)} ${f.to}`, "nota__cifra"),
    );
    return tr_;
  }));
  el.totales.replaceChildren(...nota.totales.map((t) => {
    const fila = document.createElement("tr");
    const nombre = celda(tr("nota.total"));
    nombre.colSpan = 5;
    fila.append(nombre, celda(`${dos.format(t.total)} ${t.to}`, "nota__cifra"));
    return fila;
  }));
  document.title = `${tr("nota.titulo")} · ${nota.nombre}`;
  el.nota.hidden = false;
}

async function init() {
  const guardado = await chrome.storage.local.get(["idioma", "viajes", "gastosViaje", "presupuestoViaje", "categoriasPropias"]);
  ponerIdioma(idiomaElegido(guardado.idioma, chrome.i18n.getUILanguage()));
  document.documentElement.lang = idiomaActual();
  for (const nodo of document.querySelectorAll("[data-t]")) nodo.textContent = tr(nodo.dataset.t);
  ponerCategoriasPropias(guardado.categoriasPropias);
  const id = new URLSearchParams(location.search).get("viaje");
  const nota = notaDeGastos(todosLosViajes(leerViajes(guardado.viajes, guardado.gastosViaje, guardado.presupuestoViaje)).find((v) => v.id === id));
  if (!nota) {
    el.error.textContent = tr("nota.error");
    el.error.hidden = false;
    return;
  }
  pintar(nota);
  el.imprimir.addEventListener("click", () => window.print());
  // Que se vea la nota antes de que el diálogo la tape.
  setTimeout(() => window.print(), 700);
}

init();
