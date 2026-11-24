// Va en todas las webs, pero solo si diste el permiso desde el pie del popup.
// Con Alt pulsado y el ratón sobre un precio sale un globito con lo que vale en
// tu divisa. Sin Alt no lee nada ni manda nada.
(() => {
  if (window.__conversorAlt) return;
  window.__conversorAlt = true;

  const NO_MIRAR = "script, style, noscript, textarea, input, select, option, code, pre, svg, [contenteditable], conversor-precio, conversor-divisas, conversor-aviso, conversor-alt";
  // Los precios partidos ("$" "49" ".99") se juntan en un bloque corto de arriba.
  const BLOQUE_MAX = 40;

  const CSS = `
    :host { all: initial; }

    .globo {
      --fondo: rgba(11, 14, 19, 0.92);
      --texto: #E8B75C;
      --tenue: rgba(232, 183, 92, 0.7);
      --borde: rgba(232, 183, 92, 0.4);
      --sheen: rgba(255, 255, 255, 0.12);

      position: fixed;
      z-index: 2147483647;
      display: inline-flex;
      align-items: baseline;
      gap: 0.35em;
      padding: 4px 10px 5px;
      font: 600 13px/1.2 ui-monospace, "SF Mono", "JetBrains Mono", "Cascadia Code", Menlo, monospace;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      color: var(--texto);
      background: var(--fondo);
      backdrop-filter: blur(12px) saturate(180%);
      -webkit-backdrop-filter: blur(12px) saturate(180%);
      border: 1px solid var(--borde);
      border-radius: 999px;
      box-shadow: inset 0 1px 0 var(--sheen), 0 4px 14px rgba(0, 0, 0, 0.22);
      pointer-events: none;
      animation: entrar 180ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .globo[hidden] { display: none; }
    .aprox, .divisa { font-weight: 500; color: var(--tenue); }

    @keyframes entrar {
      from { opacity: 0; scale: 0.9; }
    }

    @media (prefers-color-scheme: light) {
      .globo {
        --fondo: rgba(255, 250, 240, 0.95);
        --texto: #8A5F10;
        --tenue: rgba(138, 95, 16, 0.7);
        --borde: rgba(154, 107, 20, 0.35);
        --sheen: rgba(255, 255, 255, 0.9);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .globo { animation: none; }
    }
  `;

  // Por cada trozo de texto, lo que ya dijo el background: dónde hay precios y
  // los ya convertidos. Así, moviendo el ratón por encima, no pregunta más.
  const vistos = new WeakMap();
  let alt = false;
  let raton = null;
  let enCola = false;
  let preguntando = false;
  let otraVez = false;
  let enseñado = false;
  let apagado = false;
  let globo = null;

  function crearGlobo() {
    const host = document.createElement("conversor-alt");
    const sombra = host.attachShadow({ mode: "closed" });
    sombra.innerHTML = `<style>${CSS}</style><div class="globo" role="tooltip" hidden><span class="aprox">≈</span><span class="valor"></span><span class="divisa"></span></div>`;
    document.documentElement.append(host);
    return { host, caja: sombra.querySelector(".globo"), valor: sombra.querySelector(".valor"), divisa: sombra.querySelector(".divisa") };
  }

  function textoEn(x, y) {
    let nodo, offset;
    if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(x, y);
      [nodo, offset] = [pos?.offsetNode, pos?.offset];
    } else {
      const rango = document.caretRangeFromPoint?.(x, y);
      [nodo, offset] = [rango?.startContainer, rango?.startOffset];
    }
    if (nodo?.nodeType !== Node.TEXT_NODE || !nodo.parentElement || nodo.parentElement.closest(NO_MIRAR)) return null;
    // El cursor de texto sale del más cercano aunque el ratón esté en un hueco.
    const rango = document.createRange();
    rango.selectNodeContents(nodo);
    const encima = [...rango.getClientRects()].some((c) => x >= c.left - 2 && x <= c.right + 2 && y >= c.top - 2 && y <= c.bottom + 2);
    return encima ? { nodo, offset } : null;
  }

  function bloquesDe(nodo) {
    const bloques = [];
    let caja = nodo.parentElement;
    let antes = nodo.data.trim();
    while (caja && bloques.length < 3) {
      const texto = caja.textContent.trim();
      if (texto.length > BLOQUE_MAX) break;
      if (texto !== antes) bloques.push(texto);
      antes = texto;
      caja = caja.parentElement;
    }
    return bloques;
  }

  // Con el bloque, el globo va sobre la caja de arriba que hizo de precio.
  function cajaDe(nodo, r) {
    if (r.bloque == null) {
      const rango = document.createRange();
      rango.setStart(nodo, Math.min(r.inicio, nodo.length));
      rango.setEnd(nodo, Math.min(r.fin, nodo.length));
      return rango.getBoundingClientRect();
    }
    let caja = nodo.parentElement;
    let antes = nodo.data.trim();
    let cuenta = -1;
    while (caja) {
      const texto = caja.textContent.trim();
      if (texto !== antes && ++cuenta === r.bloque) break;
      antes = texto;
      caja = caja.parentElement;
    }
    // Lo que ocupa su texto, no la caja: un <p> va de lado a lado.
    const rango = document.createRange();
    rango.selectNodeContents(caja ?? nodo.parentElement);
    return rango.getBoundingClientRect();
  }

  function enseñar(nodo, r) {
    globo ??= crearGlobo();
    if (!globo.host.isConnected) document.documentElement.append(globo.host);
    globo.valor.textContent = r.texto;
    globo.divisa.textContent = r.to;
    const caja = globo.caja;
    caja.hidden = false;
    // Encima del precio; si no cabe, debajo. Y sin salirse por los lados.
    const precio = cajaDe(nodo, r);
    const { width, height } = caja.getBoundingClientRect();
    const izquierda = Math.min(Math.max(precio.left + precio.width / 2 - width / 2, 4), innerWidth - width - 4);
    const arriba = precio.top - height - 6 >= 4 ? precio.top - height - 6 : precio.bottom + 6;
    caja.style.left = `${izquierda}px`;
    caja.style.top = `${arriba}px`;
    enseñado = true;
  }

  function ocultar() {
    if (globo) globo.caja.hidden = true;
  }

  function apagar() {
    apagado = true;
    ocultar();
    globo?.host.remove();
    removeEventListener("keydown", onTecla, true);
    removeEventListener("keyup", onSoltar, true);
    removeEventListener("mousemove", onRaton, true);
    removeEventListener("scroll", onScroll, true);
    removeEventListener("blur", onFuera);
  }

  function vigente(nodo) {
    const visto = vistos.get(nodo);
    return visto && visto.data === nodo.data ? visto : null;
  }

  function mirar() {
    enCola = false;
    if (!alt || !raton || apagado) return ocultar();
    const sitio = textoEn(raton.x, raton.y);
    if (!sitio) return ocultar();
    const { nodo, offset } = sitio;
    const visto = vigente(nodo);
    if (visto) {
      const hecho = visto.hechos.find((h) => offset >= h.inicio && offset <= h.fin);
      if (hecho) return hecho.texto ? enseñar(nodo, hecho) : ocultar();
      const falta = visto.rangos.some(([i, f]) => offset >= i && offset <= f) || (visto.rangos.length === 0 && !visto.bloquesVistos);
      if (!falta) return ocultar();
    }
    preguntar(nodo, offset);
  }

  async function preguntar(nodo, offset) {
    if (preguntando) {
      otraVez = true;
      return;
    }
    preguntando = true;
    try {
      const r = await chrome.runtime.sendMessage({ tipo: "mirarAlt", texto: nodo.data, offset, bloques: bloquesDe(nodo), url: location.href });
      if (r?.apagado) return apagar();
      if (!Array.isArray(r?.rangos)) return;
      const visto = vigente(nodo) ?? { data: nodo.data, rangos: r.rangos, hechos: [], bloquesVistos: false };
      if (r.rangos.length === 0) visto.bloquesVistos = true;
      if (r.inicio != null) visto.hechos.push(r);
      vistos.set(nodo, visto);
      otraVez = true;
    } catch (error) {
      // Si la extensión se ha recargado, esta copia ya no puede hablar con ella.
      return apagar();
    } finally {
      preguntando = false;
    }
    if (otraVez) {
      otraVez = false;
      mirar();
    }
  }

  function enCuantoPuedas() {
    if (enCola) return;
    enCola = true;
    requestAnimationFrame(mirar);
  }

  function onTecla(event) {
    if (event.key !== "Alt" || event.repeat) return;
    alt = true;
    enseñado = false;
    enCuantoPuedas();
  }

  function onSoltar(event) {
    if (event.key !== "Alt") return;
    alt = false;
    ocultar();
    // En Windows, soltar Alt lleva el foco al menú de Chrome: si lo usaste para mirar un precio, no.
    if (enseñado) event.preventDefault();
  }

  function onRaton(event) {
    raton = { x: event.clientX, y: event.clientY };
    alt = event.altKey;
    if (alt) enCuantoPuedas();
    else ocultar();
  }

  function onScroll() {
    if (alt) enCuantoPuedas();
    else ocultar();
  }

  function onFuera() {
    alt = false;
    ocultar();
  }

  addEventListener("keydown", onTecla, true);
  addEventListener("keyup", onSoltar, true);
  addEventListener("mousemove", onRaton, { capture: true, passive: true });
  addEventListener("scroll", onScroll, { capture: true, passive: true });
  addEventListener("blur", onFuera);
})();
