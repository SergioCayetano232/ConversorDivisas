// Se inyecta al usar «Convertir los precios de la página», detrás de logica.js.
// No toco el texto de la web: cada precio lleva al lado su pastilla, y quitarlas
// deja la página como estaba. Partir los nodos de texto rompía las webs en React.
(() => {
  if (window.__conversorPrecios) return;

  // Con más que esto ya no es una tienda, es un listado entero, y pintarlo todo
  // se nota al hacer scroll.
  const MAX = 400;
  const NO_MIRAR = "script, style, noscript, textarea, input, select, option, code, pre, svg, [contenteditable], conversor-precio, conversor-divisas, conversor-aviso";

  const CSS_PASTILLA = `
    :host { all: initial; }

    .pastilla {
      --fondo: rgba(11, 14, 19, 0.88);
      --texto: #E8B75C;
      --borde: rgba(232, 183, 92, 0.4);
      --sheen: rgba(255, 255, 255, 0.12);

      display: inline-flex;
      align-items: baseline;
      gap: 0.3em;
      padding: 0.18em 0.55em 0.2em;
      font: 600 1em/1.15 ui-monospace, "SF Mono", "JetBrains Mono", "Cascadia Code", Menlo, monospace;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      color: var(--texto);
      background: var(--fondo);
      backdrop-filter: blur(12px) saturate(180%);
      -webkit-backdrop-filter: blur(12px) saturate(180%);
      border: 1px solid var(--borde);
      border-radius: 999px;
      box-shadow: inset 0 1px 0 var(--sheen), 0 2px 8px rgba(0, 0, 0, 0.18);
      cursor: help;
      animation: entrar 420ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
      animation-delay: calc(var(--i, 0) * 14ms);
      transition: transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @media (prefers-color-scheme: light) {
      .pastilla {
        --fondo: rgba(255, 250, 240, 0.92);
        --texto: #8A5F10;
        --borde: rgba(154, 107, 20, 0.35);
        --sheen: rgba(255, 255, 255, 0.9);
      }
    }

    .pastilla:hover { transform: translateY(-1px) scale(1.04); }

    .casi { opacity: 0.6; font-weight: 500; }

    .pastilla.is-saliendo { animation: salir 200ms ease-in forwards; }

    @keyframes entrar {
      from { opacity: 0; transform: translateY(3px) scale(0.6); }
    }

    @keyframes salir {
      to { opacity: 0; transform: scale(0.7); }
    }

    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.01ms !important; animation-delay: 0s !important; transition-duration: 0.01ms !important; }
    }
  `;

  const CSS_AVISO = `
    :host { all: initial; }

    .aviso {
      --fondo: rgba(18, 22, 29, 0.78);
      --texto: #E6EDF3;
      --tenue: #8B949E;
      --dorado: #E8B75C;
      --dorado-glow: rgba(232, 183, 92, 0.3);
      --dorado-ghost: rgba(232, 183, 92, 0.12);
      --dorado-dim: rgba(232, 183, 92, 0.45);
      --borde: rgba(255, 255, 255, 0.12);
      --sheen: rgba(255, 255, 255, 0.14);
      --cinabrio: #E5534B;

      position: relative;
      isolation: isolate;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 10px 10px 14px;
      font: 13px/1.4 system-ui, -apple-system, "Segoe UI", Inter, sans-serif;
      color: var(--texto);
      background: var(--fondo);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid var(--borde);
      border-radius: 14px;
      box-shadow: inset 0 1px 0 var(--sheen), 0 18px 48px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
      animation: subir 480ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    @media (prefers-color-scheme: light) {
      .aviso {
        --fondo: rgba(255, 255, 255, 0.82);
        --texto: #1A1D23;
        --tenue: #6B7280;
        --dorado: #9A6B14;
        --dorado-glow: rgba(154, 107, 20, 0.22);
        --dorado-ghost: rgba(154, 107, 20, 0.1);
        --dorado-dim: rgba(154, 107, 20, 0.4);
        --borde: rgba(0, 0, 0, 0.1);
        --sheen: rgba(255, 255, 255, 0.9);
      }
    }

    /* Las manchas y el grano del popup, en pequeño. */
    .aviso::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: -1;
      background:
        radial-gradient(160px circle at 0% 0%, var(--dorado-glow), transparent 70%),
        radial-gradient(140px circle at 100% 120%, rgba(96, 134, 224, 0.2), transparent 70%);
    }

    .aviso::after {
      content: "";
      position: absolute;
      inset: 0;
      z-index: -1;
      opacity: 0.05;
      pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");
    }

    .punto {
      flex-shrink: 0;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--dorado);
      box-shadow: 0 0 8px var(--dorado-glow);
      animation: respirar 2.4s ease-in-out infinite;
    }

    .is-nada .punto { background: var(--tenue); box-shadow: none; animation: none; }
    .is-error .punto { background: var(--cinabrio); box-shadow: 0 0 8px var(--cinabrio); animation: none; }

    @keyframes respirar {
      50% { transform: scale(0.7); opacity: 0.6; }
    }

    .textos { display: flex; flex-direction: column; min-width: 0; }

    .mensaje { font-weight: 600; white-space: nowrap; }
    .cuantos { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-variant-numeric: tabular-nums; color: var(--dorado); }

    .pista { font-size: 11px; color: var(--tenue); white-space: nowrap; }
    .pista:empty { display: none; }

    button {
      font: inherit;
      color: inherit;
      cursor: pointer;
    }

    .quitar {
      flex-shrink: 0;
      padding: 4px 10px;
      background: transparent;
      border: 1px solid var(--borde);
      border-radius: 8px;
      color: var(--tenue);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      transition: color 180ms ease, border-color 180ms ease, background-color 180ms ease,
        transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .quitar:hover { color: var(--dorado); border-color: var(--dorado-dim); background: var(--dorado-ghost); }
    .quitar:active { transform: scale(0.92); }
    .is-nada .quitar, .is-error .quitar { display: none; }

    .cerrar {
      display: grid;
      place-items: center;
      flex-shrink: 0;
      width: 22px;
      height: 22px;
      padding: 0;
      background: transparent;
      border: none;
      border-radius: 50%;
      color: var(--tenue);
      font-size: 13px;
      line-height: 1;
      transition: color 180ms ease, background-color 180ms ease, transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .cerrar:hover { color: var(--dorado); background: var(--dorado-ghost); transform: rotate(90deg); }

    .quitar:focus-visible,
    .cerrar:focus-visible {
      outline: 2px solid var(--dorado);
      outline-offset: 2px;
    }

    /* La barrita de abajo dice cuánto le queda al aviso. */
    .tiempo {
      position: absolute;
      left: 0;
      bottom: 0;
      height: 2px;
      width: 100%;
      background: linear-gradient(90deg, transparent, var(--dorado));
      transform-origin: left;
      animation: gastar var(--dura, 6s) linear forwards;
    }

    .aviso:hover .tiempo { animation-play-state: paused; }

    @keyframes gastar { to { transform: scaleX(0); } }

    .is-nada, .is-error { animation: subir 480ms cubic-bezier(0.34, 1.56, 0.64, 1) both, temblar 420ms ease 200ms; }

    @keyframes temblar {
      20% { translate: -4px 0; }
      40% { translate: 4px 0; }
      60% { translate: -2px 0; }
      80% { translate: 2px 0; }
    }

    .aviso.is-saliendo { animation: bajar 220ms ease-in forwards; }

    @keyframes subir {
      from { opacity: 0; transform: translateY(16px) scale(0.94); filter: blur(4px); }
    }

    @keyframes bajar {
      to { opacity: 0; transform: translateY(10px) scale(0.96); }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      .tiempo { display: none; }
    }
  `;

  const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)");
  let hallados = [];
  let pastillas = [];
  let aviso = null;
  let cierreAviso = null;

  // Lo que no se ve no lo convierto. Amazon, por ejemplo, repite cada precio en
  // un span de 1x1 px para los lectores de pantalla.
  function seVe(elemento) {
    const r = elemento.getBoundingClientRect();
    return r.width > 2 && r.height > 2 && getComputedStyle(elemento).visibility !== "hidden";
  }

  // Los precios partidos en varias etiquetas ("$" "49" "." "99"). Subo desde la
  // cifra suelta hasta tres niveles, mientras el texto sea corto, y me quedo con
  // la primera etiqueta que lo tenga entero.
  function precioPartido(nodo) {
    let el = nodo.parentElement;
    for (let nivel = 0; nivel < 3 && el && el !== document.body; nivel++, el = el.parentElement) {
      if (el.textContent.length > 30) return null;
      if (el.childElementCount === 0) continue;
      // Con <sup> los céntimos van sin coma ("49<sup>99</sup>") y leería 4999.
      if (el.querySelector("sup")) return null;
      const precio = precioEntero(el.textContent);
      if (precio) return { el, precio };
    }
    return null;
  }

  function buscar() {
    const encontrados = [];
    const partidos = new Map();
    const paseo = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let nodo = paseo.nextNode(); nodo && encontrados.length + partidos.size < MAX; nodo = paseo.nextNode()) {
      if (!/\d/.test(nodo.data)) continue;
      const padre = nodo.parentElement;
      if (!padre || padre.closest(NO_MIRAR)) continue;
      // "$49" seguido de <sup>99</sup> parece un precio entero y no lo es.
      if (nodo.nextSibling?.nodeName === "SUP") continue;
      const precios = buscarPrecios(nodo.data);
      if (precios.length) {
        if (seVe(padre)) encontrados.push({ despues: nodo, precios });
        continue;
      }
      const partido = precioPartido(nodo);
      if (partido && !partidos.has(partido.el) && seVe(partido.el)) {
        partidos.set(partido.el, { despues: partido.el, precios: [partido.precio] });
      }
    }
    // Si un trozo ya tenía su precio completo dentro, ese manda.
    const sueltos = [...partidos.values()].filter((p) => !encontrados.some((e) => p.despues.contains(e.despues)));
    return [...encontrados, ...sueltos];
  }

  function quitar() {
    clearTimeout(cierreAviso);
    const fuera = pastillas;
    pastillas = [];
    hallados = [];
    for (const host of fuera) {
      const pastilla = host.shadowRoot.querySelector(".pastilla");
      if (sinMovimiento.matches || !host.isConnected) host.remove();
      else {
        pastilla.classList.add("is-saliendo");
        pastilla.addEventListener("animationend", () => host.remove(), { once: true });
      }
    }
    cerrarAviso();
  }

  // Si ya había pastillas las quito y no devuelvo nada: el menú hace de
  // interruptor. Si no, digo qué divisas hay para que me pidan sus tasas.
  function alternar() {
    if (pastillas.length) {
      quitar();
      return null;
    }
    hallados = buscar();
    const divisas = new Set(hallados.flatMap((h) => h.precios.map((p) => p.divisa)));
    return { total: hallados.length, divisas: [...divisas] };
  }

  function pintar({ tasas, locale, textos, error }) {
    // Siempre con los miles: en español Intl deja "1467,61" sin punto.
    const formato = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: "always" });
    const formatoTasa = new Intl.NumberFormat(locale, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    const destinos = new Set();
    let i = 0;
    let total = 0;

    for (const { despues, precios } of hallados) {
      if (!despues.isConnected) continue;
      const convertidos = precios
        .map((p) => ({ ...p, ...tasas[p.divisa] }))
        .filter((p) => p.rate && p.to !== p.divisa);
      if (convertidos.length === 0) continue;

      const host = document.createElement("conversor-precio");
      host.style.cssText = "all: initial; display: inline-block; font-size: 0.78em; margin: 0 0.35em; vertical-align: 0.1em; line-height: 1;";
      const raiz = host.attachShadow({ mode: "open" });
      const pastilla = document.createElement("span");
      pastilla.className = "pastilla";
      pastilla.style.setProperty("--i", Math.min(i, 40));
      const casi = document.createElement("span");
      casi.className = "casi";
      casi.textContent = "≈";
      const cifras = document.createElement("span");
      cifras.textContent = convertidos.map((p) => `${formato.format(p.cantidad * p.rate)} ${p.to}`).join(" · ");
      pastilla.append(casi, cifras);
      pastilla.title = convertidos
        .map((p) => `${formato.format(p.cantidad)} ${p.divisa} → ${formato.format(p.cantidad * p.rate)} ${p.to}  (1 ${p.divisa} = ${formatoTasa.format(p.rate)} ${p.to})`)
        .join("\n");
      const estilo = document.createElement("style");
      estilo.textContent = CSS_PASTILLA;
      raiz.append(estilo, pastilla);
      despues.after(host);
      pastillas.push(host);
      for (const p of convertidos) destinos.add(p.to);
      total += convertidos.length;
      i++;
    }

    if (error) mostrarAviso("is-error", error);
    else if (total === 0) mostrarAviso("is-nada", textos.nada);
    else {
      const plantilla = total === 1 ? textos.uno : textos.varios;
      mostrarAviso("", plantilla.replace("{n}", total).replace("{to}", [...destinos].join(" · ")), textos, total);
    }
  }

  function mostrarAviso(clase, mensaje, textos = {}, total = 0) {
    cerrarAviso(true);
    const host = document.createElement("conversor-aviso");
    host.style.cssText = "all: initial; position: fixed; right: 20px; bottom: 20px; z-index: 2147483647; max-width: calc(100vw - 40px);";
    const raiz = host.attachShadow({ mode: "open" });
    raiz.innerHTML = `
      <style>${CSS_AVISO}</style>
      <div class="aviso ${clase}" role="status">
        <span class="punto"></span>
        <div class="textos"><span class="mensaje"></span><span class="pista"></span></div>
        <button class="quitar" type="button"></button>
        <button class="cerrar" type="button">✕</button>
        <span class="tiempo"></span>
      </div>`;
    // La cifra en dorado, que es lo que importa del mensaje.
    const [antes, despues] = mensaje.split(String(total));
    const texto = raiz.querySelector(".mensaje");
    if (clase === "" && despues !== undefined) {
      const cuantos = document.createElement("span");
      cuantos.className = "cuantos";
      cuantos.textContent = total;
      texto.append(antes, cuantos, despues);
    } else texto.textContent = mensaje;
    raiz.querySelector(".pista").textContent = clase === "" ? textos.otraVez ?? "" : "";
    raiz.querySelector(".quitar").textContent = textos.quitar ?? "Quitar";
    raiz.querySelector(".quitar").addEventListener("click", quitar);
    raiz.querySelector(".cerrar").setAttribute("aria-label", textos.cerrar ?? "Cerrar");
    raiz.querySelector(".cerrar").addEventListener("click", () => cerrarAviso());
    document.documentElement.appendChild(host);
    aviso = host;

    // Seis segundos, pero no mientras tienes el ratón encima: ahí está el Quitar.
    const DURA = 6000;
    raiz.querySelector(".aviso").style.setProperty("--dura", `${DURA}ms`);
    let queda = DURA;
    let desde = Date.now();
    const programar = () => {
      cierreAviso = setTimeout(() => cerrarAviso(), queda);
    };
    host.addEventListener("mouseenter", () => {
      clearTimeout(cierreAviso);
      queda -= Date.now() - desde;
    });
    host.addEventListener("mouseleave", () => {
      desde = Date.now();
      programar();
    });
    programar();
  }

  function cerrarAviso(deGolpe = false) {
    clearTimeout(cierreAviso);
    const host = aviso;
    aviso = null;
    if (!host) return;
    const caja = host.shadowRoot.querySelector(".aviso");
    if (deGolpe || sinMovimiento.matches) return host.remove();
    caja.classList.add("is-saliendo");
    caja.addEventListener("animationend", () => host.remove(), { once: true });
  }

  window.__conversorPrecios = { alternar, pintar, quitar };
})();
