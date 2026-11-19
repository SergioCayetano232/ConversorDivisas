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
  colTique: document.getElementById("nota-col-tique"),
  tiques: document.getElementById("nota-tiques"),
  tiquesCuenta: document.getElementById("nota-tiques-cuenta"),
  fotos: document.getElementById("nota-fotos"),
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
    if (nota.tiques) tr_.append(celda(f.tique ? `#${f.tique}` : "—", "nota__n"));
    return tr_;
  }));
  el.totales.replaceChildren(...nota.totales.map((t) => {
    const fila = document.createElement("tr");
    const nombre = celda(tr("nota.total"));
    nombre.colSpan = 5;
    fila.append(nombre, celda(`${dos.format(t.total)} ${t.to}`, "nota__cifra"));
    if (nota.tiques) fila.append(celda(""));
    return fila;
  }));
  el.colTique.hidden = !nota.tiques;
  document.title = `${tr("nota.titulo")} · ${nota.nombre}`;
  el.nota.hidden = false;
}

// Debajo de la tabla, cada foto con su número y lo que es, para que quien la
// revise no tenga que ir buscando de qué gasto era.
async function pintarTiques(nota) {
  el.tiques.hidden = !nota.tiques;
  if (!nota.tiques) return;
  const dos = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  el.tiquesCuenta.textContent = `· ${tr("nota.tiquesCuenta", { n: nota.tiques, total: nota.filas.length })}`;
  const figuras = await Promise.all(nota.filas.filter((f) => f.tique).map(async (f) => {
    const foto = await fotos.leer(f.id).catch(() => null);
    if (!foto) return null;
    const figura = document.createElement("figure");
    figura.className = "nota__foto";
    const img = document.createElement("img");
    img.src = URL.createObjectURL(foto);
    img.alt = `${tr("nota.tique")} #${f.tique}: ${f.concepto}`;
    const pie = document.createElement("figcaption");
    pie.textContent = `#${f.tique} · ${fechaCorta(f.dia)} · ${f.concepto} · ${dos.format(f.valor)} ${f.to}`;
    figura.append(img, pie);
    // Hasta que no están cargadas, el diálogo de imprimir las sacaría en blanco.
    await img.decode().catch(() => {});
    return figura;
  }));
  el.fotos.replaceChildren(...figuras.filter(Boolean));
}

async function init() {
  const guardado = await chrome.storage.local.get(["idioma", "viajes", "gastosViaje", "presupuestoViaje", "categoriasPropias"]);
  ponerIdioma(idiomaElegido(guardado.idioma, chrome.i18n.getUILanguage()));
  document.documentElement.lang = idiomaActual();
  for (const nodo of document.querySelectorAll("[data-t]")) nodo.textContent = tr(nodo.dataset.t);
  ponerCategoriasPropias(guardado.categoriasPropias);
  const id = new URLSearchParams(location.search).get("viaje");
  const conTique = new Set(await fotos.claves().catch(() => []));
  const nota = notaDeGastos(todosLosViajes(leerViajes(guardado.viajes, guardado.gastosViaje, guardado.presupuestoViaje)).find((v) => v.id === id), conTique);
  if (!nota) {
    el.error.textContent = tr("nota.error");
    el.error.hidden = false;
    return;
  }
  pintar(nota);
  await pintarTiques(nota);
  el.imprimir.addEventListener("click", () => window.print());
  // Que se vea la nota antes de que el diálogo la tape.
  setTimeout(() => window.print(), 700);
}

init();
