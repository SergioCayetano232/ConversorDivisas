// La tarjeta del viaje. Lo que se ve en la página y la imagen salen de las
// mismas piezas, así lo que descargas es lo que has visto.

const el = {
  postal: document.getElementById("postal"),
  error: document.getElementById("error"),
  descargar: document.getElementById("descargar"),
  descargarTexto: document.getElementById("descargar-texto"),
  copiar: document.getElementById("copiar"),
  copiarTexto: document.getElementById("copiar-texto"),
  titulo: document.getElementById("titulo"),
  intro: document.getElementById("intro"),
  anios: document.getElementById("anios"),
};

// Los colores de los viajes, los del popup en oscuro. Repetidos aquí porque el
// canvas no lee variables CSS; la tarjeta va siempre en oscuro, como la imagen.
const COLORES_POSTAL = {
  oro: "#E8B75C", azul: "#5AA9E6", coral: "#F0806A", jade: "#3FB8AF", lila: "#A78BFA", rosa: "#E879A6",
};
const FONDO = "#0B0E13";
const TEXTO = "#E6EDF3";
const TENUE = "#8B949E";
const VERDE = "#4EA96B";
const ROJO = "#E5534B";

let piezas = null;

async function ponerIdiomaGuardado() {
  const { idioma } = await chrome.storage.local.get("idioma");
  ponerIdioma(idiomaElegido(idioma, chrome.i18n.getUILanguage()));
  document.documentElement.lang = idiomaActual();
  for (const nodo of document.querySelectorAll("[data-t]")) nodo.textContent = tr(nodo.dataset.t);
  document.title = `ConversorDivisas · ${tr("resumen.titulo")}`;
}

const dinero = (n, to) => `${numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ${to}`;

function rango(desde, hasta) {
  const [a1, m1, d1] = desde.split("-").map(Number);
  const [a2, m2, d2] = hasta.split("-").map(Number);
  const formato = fechas({ day: "numeric", month: "short", year: "numeric" });
  return desde === hasta ? formato.format(new Date(a1, m1 - 1, d1)) : formato.formatRange(new Date(a1, m1 - 1, d1), new Date(a2, m2 - 1, d2));
}

function montarPiezas(t) {
  const datos = [];
  if (t.media) datos.push([dinero(t.media.valor, t.media.to), tr("resumen.alDia")]);
  datos.push([String(t.n), tr(t.n === 1 ? "gastos.uno" : "resumen.gastos")]);
  if (t.cabeza) datos.push([dinero(t.cabeza.total, t.cabeza.to), tr(t.cabeza.tuyo ? "resumen.tuyo" : "resumen.cadaUno", { n: t.cabeza.personas })]);

  const destacados = [];
  if (t.caro) destacados.push([`${emojiCategoria(t.caro.categoria)} ${tr("resumen.caro")}`, `${t.caro.concepto} · ${dinero(t.caro.valor, t.caro.to)}`]);
  if (t.diaMas) destacados.push([`📅 ${tr("resumen.diaMas")}`, `${fechaCorta(t.diaMas.dia)} · ${dinero(t.diaMas.total, t.diaMas.to)}`]);

  let presupuesto = null;
  if (t.presupuesto) {
    const { queda, importe, to } = t.presupuesto;
    presupuesto = queda >= 0
      ? { texto: tr("resumen.sobro", { sobra: dinero(queda, to), importe: dinero(importe, to) }), tono: "bien" }
      : { texto: tr("resumen.pasado", { pasado: dinero(-queda, to), importe: dinero(importe, to) }), tono: "mal" };
  }
  const pie = [];
  if (t.cambio) pie.push(tr("resumen.cambio", { cambio: textoCambio(t.cambio.tasa, t.cambio.from, t.cambio.to) }));
  if (t.comisiones) pie.push(tr("resumen.comisiones", { total: dinero(t.comisiones.total, t.comisiones.to) }));

  return {
    color: COLORES_POSTAL[t.color] ?? COLORES_POSTAL.oro,
    nombre: t.nombre,
    fechas: `${rango(t.desde, t.hasta)} · ${tr(t.dias === 1 ? "copiar.unDia" : "copiar.dias", { n: t.dias })}`,
    total: dinero(t.total.total, t.total.to),
    otras: t.otras.map((o) => dinero(o.total, o.to)).join(" + "),
    datos,
    destacados,
    categorias: t.categorias.map((c) => ({ emoji: emojiCategoria(c.categoria), nombre: nombreCategoria(c.categoria), fraccion: c.fraccion, categoria: c.categoria })),
    presupuesto,
    pie,
  };
}

function pintarPostal(p) {
  el.postal.style.setProperty("--tono", p.color);
  const nodo = (etiqueta, clase, texto) => {
    const n = document.createElement(etiqueta);
    n.className = clase;
    if (texto !== undefined) n.textContent = texto;
    return n;
  };
  const partes = [
    nodo("p", "postal__app", "ConversorDivisas"),
    nodo("h3", "postal__nombre", p.nombre),
    nodo("p", "postal__fechas", p.fechas),
    nodo("p", "postal__total", p.total),
  ];
  if (p.otras) partes.push(nodo("p", "postal__otras", `+ ${p.otras}`));
  const datos = nodo("dl", "postal__datos");
  for (const [valor, etiqueta] of p.datos) {
    const caja = nodo("div", "postal__dato");
    caja.append(nodo("dt", "postal__dato-que", etiqueta), nodo("dd", "postal__dato-valor", valor));
    datos.append(caja);
  }
  partes.push(datos);
  if (p.destacados.length) {
    const lista = nodo("ul", "postal__destacados");
    for (const [que, valor] of p.destacados) {
      const li = nodo("li", "postal__destacado");
      li.append(nodo("span", "postal__destacado-que", que), nodo("span", "postal__destacado-valor", valor));
      lista.append(li);
    }
    partes.push(lista);
  }
  if (p.categorias.length) {
    const barra = nodo("div", "postal__barra");
    barra.setAttribute("aria-hidden", "true");
    p.categorias.forEach((c, i) => {
      const trozo = nodo("span", "postal__trozo");
      trozo.style.setProperty("--parte", c.fraccion);
      trozo.style.setProperty("--i", i);
      barra.append(trozo);
    });
    const leyenda = nodo("p", "postal__leyenda",
      p.categorias.map((c) => `${c.emoji} ${c.nombre} ${tr("pct", { n: Math.round(c.fraccion * 100) })}`).join("   "));
    partes.push(barra, leyenda);
  }
  if (p.presupuesto) {
    const linea = nodo("p", "postal__presupuesto", p.presupuesto.texto);
    linea.dataset.tono = p.presupuesto.tono;
    partes.push(linea);
  }
  if (p.pie.length) partes.push(nodo("p", "postal__pie", p.pie.join(" · ")));
  if (p.banderas) partes.push(nodo("p", "postal__banderas", p.banderas));
  el.postal.replaceChildren(...partes);
}

// El año sale con las mismas piezas que un viaje: así la imagen es la misma.
// Tres destacados como mucho, que con más se pisan con las categorías.
function montarPiezasAnio(d) {
  const datos = [];
  if (d.media) datos.push([dinero(d.media.valor, d.media.to), tr("resumen.alDia")]);
  if (d.divisas.length) datos.push([String(d.divisas.length), tr(d.divisas.length === 1 ? "anio.divisa1" : "anio.divisas")]);
  datos.push([String(d.n), tr(d.n === 1 ? "gastos.uno" : "resumen.gastos")]);
  const porDia = (f) => `${f.nombre} · ${tr("anio.porDia", { valor: dinero(f.media, f.to) })}`;
  const destacados = [
    d.caroDia && [`🔥 ${tr("anio.caroDia")}`, porDia(d.caroDia)],
    d.baratoDia && [`🌿 ${tr("anio.baratoDia")}`, porDia(d.baratoDia)],
    d.caro && [`${emojiCategoria(d.caro.categoria)} ${tr("resumen.caro")}`, `${d.caro.concepto} · ${dinero(d.caro.valor, d.caro.to)}`],
    d.estrella && [`⭐ ${tr("anio.estrella")}`, tr("anio.veces", { que: d.estrella.concepto, n: d.estrella.veces })],
  ].filter(Boolean).slice(0, 3);
  const viajes = tr(d.viajes === 1 ? "anio.viaje1" : "anio.viajes", { n: d.viajes });
  const dias = tr(d.dias === 1 ? "anio.diaFuera" : "anio.diasFuera", { n: d.dias });
  return {
    color: COLORES_POSTAL.oro,
    nombre: tr("anio.nombre", { anio: d.anio }),
    fechas: `${viajes} · ${dias}`,
    total: dinero(d.total.total, d.total.to),
    otras: d.otras.map((o) => dinero(o.total, o.to)).join(" + "),
    datos,
    destacados,
    categorias: d.categorias.map((c) => ({ emoji: emojiCategoria(c.categoria), nombre: nombreCategoria(c.categoria), fraccion: c.fraccion, categoria: c.categoria })),
    presupuesto: null,
    pie: [],
    // Las banderas, grandes y al pie: es lo que más se mira de un año.
    banderas: d.divisas.map((code) => banderaDivisa(code) || code).join(" "),
    archivo: `${tr("anio.archivo")}-${d.anio}`,
  };
}

// Solo los años con algo; el que miras va marcado.
function pintarAnios(anios, actual) {
  el.anios.hidden = anios.length < 2;
  el.anios.replaceChildren(...anios.map((anio) => {
    const enlace = document.createElement("a");
    enlace.className = "anios__anio";
    enlace.href = `?anio=${anio}`;
    enlace.textContent = anio;
    if (anio === actual) enlace.setAttribute("aria-current", "page");
    return enlace;
  }));
}

// La imagen, a mano en un canvas: 1080 × 1350, lo que cabe entero en una
// historia o en el chat sin que lo recorten.
const ANCHO = 1080;
const ALTO = 1350;
const MARGEN = 96;
const LETRA = 'system-ui, -apple-system, "Segoe UI", Inter, sans-serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';

// Recorto con puntos suspensivos lo que no quepa, que un nombre largo no se salga.
function texto(ctx, cadena, x, y, ancho) {
  let s = cadena;
  if (ctx.measureText(s).width > ancho) {
    while (s.length > 1 && ctx.measureText(`${s}…`).width > ancho) s = s.slice(0, -1);
    s = `${s.trimEnd()}…`;
  }
  ctx.fillText(s, x, y);
}

function dibujar(p) {
  const lienzo = document.createElement("canvas");
  lienzo.width = ANCHO;
  lienzo.height = ALTO;
  const ctx = lienzo.getContext("2d");
  const util = ANCHO - MARGEN * 2;

  ctx.fillStyle = FONDO;
  ctx.fillRect(0, 0, ANCHO, ALTO);
  // Las manchas de color, como en el fondo de las páginas.
  for (const [x, y, r, alfa] of [[160, 120, 760, "40"], [1000, 900, 700, "26"], [300, 1400, 600, "1A"]]) {
    const mancha = ctx.createRadialGradient(x, y, 0, x, y, r);
    mancha.addColorStop(0, `${p.color}${alfa}`);
    mancha.addColorStop(1, `${p.color}00`);
    ctx.fillStyle = mancha;
    ctx.fillRect(0, 0, ANCHO, ALTO);
  }
  // Y el grano, para que no parezca una plantilla.
  const grano = ctx.getImageData(0, 0, ANCHO, ALTO);
  for (let i = 0; i < grano.data.length; i += 4) {
    const ruido = (Math.random() - 0.5) * 14;
    grano.data[i] += ruido;
    grano.data[i + 1] += ruido;
    grano.data[i + 2] += ruido;
  }
  ctx.putImageData(grano, 0, 0);

  ctx.textBaseline = "alphabetic";
  let y = MARGEN + 30;
  ctx.fillStyle = TENUE;
  ctx.font = `600 26px ${LETRA}`;
  ctx.letterSpacing = "4px";
  ctx.fillText("CONVERSORDIVISAS", MARGEN, y);
  ctx.letterSpacing = "0px";

  y += 110;
  ctx.fillStyle = TEXTO;
  ctx.font = `700 88px ${LETRA}`;
  texto(ctx, p.nombre, MARGEN, y, util);
  y += 60;
  ctx.fillStyle = TENUE;
  ctx.font = `400 34px ${LETRA}`;
  texto(ctx, p.fechas, MARGEN, y, util);

  // El total, lo más grande que quepa entero: cortado no sirve de nada.
  y += 170;
  ctx.fillStyle = p.color;
  let tam = 128;
  do {
    ctx.font = `700 ${tam}px ${MONO}`;
    tam -= 4;
  } while (tam > 48 && ctx.measureText(p.total).width > util);
  ctx.fillText(p.total, MARGEN, y);
  if (p.otras) {
    y += 56;
    ctx.fillStyle = TENUE;
    ctx.font = `500 34px ${MONO}`;
    texto(ctx, `+ ${p.otras}`, MARGEN, y, util);
  }

  // Los datos en columnas, como en la página.
  y += 110;
  const columna = util / Math.max(p.datos.length, 1);
  p.datos.forEach(([valor, etiqueta], i) => {
    const x = MARGEN + i * columna;
    ctx.fillStyle = TEXTO;
    ctx.font = `700 44px ${MONO}`;
    texto(ctx, valor, x, y, columna - 24);
    ctx.fillStyle = TENUE;
    ctx.font = `400 28px ${LETRA}`;
    texto(ctx, etiqueta, x, y + 42, columna - 24);
  });

  y += 120;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(MARGEN, y);
  ctx.lineTo(ANCHO - MARGEN, y);
  ctx.stroke();

  for (const [que, valor] of p.destacados) {
    y += 76;
    ctx.fillStyle = TENUE;
    ctx.font = `400 30px ${LETRA}`;
    ctx.fillText(que, MARGEN, y);
    ctx.fillStyle = TEXTO;
    ctx.font = `600 34px ${LETRA}`;
    ctx.textAlign = "right";
    texto(ctx, valor, ANCHO - MARGEN, y, util * 0.6);
    ctx.textAlign = "left";
  }

  if (p.categorias.length) {
    y += 90;
    // La barra de categorías: cada trozo en el color del viaje, cada vez más suave.
    let x = MARGEN;
    const alto = 22;
    p.categorias.forEach((c, i) => {
      const ancho = Math.max(util * c.fraccion - 6, 6);
      ctx.fillStyle = `${p.color}${["FF", "99", "55"][i] ?? "33"}`;
      ctx.beginPath();
      ctx.roundRect(x, y, ancho, alto, 11);
      ctx.fill();
      x += ancho + 6;
    });
    y += 70;
    ctx.fillStyle = TEXTO;
    ctx.font = `500 30px ${LETRA}`;
    texto(ctx, p.categorias.map((c) => `${c.emoji} ${c.nombre} ${tr("pct", { n: Math.round(c.fraccion * 100) })}`).join("     "), MARGEN, y, util);
  }

  if (p.presupuesto) {
    y += 90;
    ctx.fillStyle = p.presupuesto.tono === "bien" ? VERDE : ROJO;
    ctx.font = `600 34px ${LETRA}`;
    texto(ctx, p.presupuesto.texto, MARGEN, y, util);
  }

  if (p.pie.length) {
    ctx.fillStyle = TENUE;
    ctx.font = `400 28px ${LETRA}`;
    texto(ctx, p.pie.join("  ·  "), MARGEN, ALTO - MARGEN, util);
  }
  if (p.banderas) {
    ctx.font = `400 56px ${LETRA}`;
    texto(ctx, p.banderas, MARGEN, ALTO - MARGEN, util);
  }
  return lienzo;
}

// Para descargar, JPG: con el grano un PNG pasaba de 2 MB. Para copiar tiene que
// ser PNG, que es lo único que acepta el portapapeles de Chrome.
const aImagen = (lienzo, tipo = "image/png") => new Promise((resolver, fallar) => {
  lienzo.toBlob((b) => (b ? resolver(b) : fallar(new Error("sin imagen"))), tipo, 0.92);
});

function avisar(boton, nodoTexto, clave, vuelta) {
  nodoTexto.textContent = tr(clave);
  boton.classList.remove("is-hecho");
  void boton.offsetWidth;
  boton.classList.add("is-hecho");
  clearTimeout(boton.vuelta);
  boton.vuelta = setTimeout(() => {
    boton.classList.remove("is-hecho");
    nodoTexto.textContent = tr(vuelta);
  }, 1800);
}

async function onDescargar() {
  if (!piezas) return;
  const url = URL.createObjectURL(await aImagen(dibujar(piezas), "image/jpeg"));
  const enlace = document.createElement("a");
  enlace.href = url;
  const nombre = normalizar(piezas.nombre).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  enlace.download = piezas.archivo ? `${piezas.archivo}.jpg` : `${tr("resumen.archivo")}${nombre ? `-${nombre}` : ""}.jpg`;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  avisar(el.descargar, el.descargarTexto, "resumen.descargada", "resumen.descargar");
}

async function onCopiar() {
  if (!piezas) return;
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": aImagen(dibujar(piezas)) })]);
    avisar(el.copiar, el.copiarTexto, "resumen.copiada", "resumen.copiar");
  } catch (error) {
    console.warn("No se pudo copiar la imagen", error);
    avisar(el.copiar, el.copiarTexto, "resumen.noCopia", "resumen.copiar");
  }
}

async function init() {
  await ponerIdiomaGuardado();
  const params = new URLSearchParams(location.search);
  const id = params.get("viaje");
  const { viajes, gastosViaje, presupuestoViaje, categoriasPropias } = await chrome.storage.local.get(["viajes", "gastosViaje", "presupuestoViaje", "categoriasPropias"]);
  ponerCategoriasPropias(categoriasPropias);
  const todos = leerViajes(viajes, gastosViaje, presupuestoViaje);
  const anio = params.has("anio") ? Number.parseInt(params.get("anio"), 10) || new Date().getFullYear() : null;
  if (anio !== null) {
    el.titulo.textContent = tr("anio.titulo");
    el.intro.textContent = tr("anio.intro");
    document.title = `ConversorDivisas · ${tr("anio.titulo")}`;
    pintarAnios(aniosConGastos(todosLosViajes(todos)), anio);
  }
  const datos = anio !== null ? datosAnio(todosLosViajes(todos), anio) : datosTarjeta(todosLosViajes(todos).find((v) => v.id === id) ?? viajeActivo(todos));
  if (!datos) {
    el.error.textContent = anio !== null ? tr("anio.vacio", { anio }) : tr("resumen.vacio");
    el.error.hidden = false;
    el.postal.hidden = true;
    el.descargar.disabled = true;
    el.copiar.disabled = true;
    return;
  }
  piezas = anio !== null ? montarPiezasAnio(datos) : montarPiezas(datos);
  pintarPostal(piezas);
  el.descargar.addEventListener("click", onDescargar);
  el.copiar.addEventListener("click", onCopiar);
}

init();
