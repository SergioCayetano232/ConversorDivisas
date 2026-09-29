// Se inyecta en la página al usar el menú de «Convertir». Va en un shadow DOM:
// sin él, el CSS de cada web me la deformaba y el mío se le escapaba a la web.
(() => {
  // Cada clic en el menú vuelve a inyectar el archivo; con la primera basta.
  if (window.__conversorDivisas) return;

  const ANCHO = 260;
  const HUECO = 12;

  const CSS = `
    :host { all: initial; }

    .tarjeta {
      --fondo: rgba(18, 22, 29, 0.74);
      --texto: #E6EDF3;
      --tenue: #8B949E;
      --dorado: #E8B75C;
      --dorado-glow: rgba(232, 183, 92, 0.3);
      --dorado-ghost: rgba(232, 183, 92, 0.12);
      --dorado-dim: rgba(232, 183, 92, 0.45);
      --borde: rgba(255, 255, 255, 0.12);
      --sheen: rgba(255, 255, 255, 0.14);
      --jade: #4EA96B;
      --jade-ghost: rgba(78, 169, 107, 0.14);
      --cinabrio: #E5534B;
      --sombra: 0 18px 48px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.3);
      --mono: ui-monospace, "SF Mono", "JetBrains Mono", "Cascadia Code", Menlo, monospace;
      --suave: cubic-bezier(0.16, 1, 0.3, 1);
      --muelle: cubic-bezier(0.34, 1.56, 0.64, 1);

      position: relative;
      isolation: isolate;
      box-sizing: border-box;
      width: ${ANCHO}px;
      padding: 12px 14px 12px 16px;
      font: 13px/1.45 system-ui, -apple-system, "Segoe UI", Inter, sans-serif;
      color: var(--texto);
      text-align: left;
      background: var(--fondo);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid var(--borde);
      border-radius: 16px;
      box-shadow: inset 0 1px 0 var(--sheen), var(--sombra);
      transform-origin: var(--flecha, 50%) top;
      animation: entrar 420ms var(--muelle) both;
      -webkit-font-smoothing: antialiased;
    }

    .tarjeta.arriba { transform-origin: var(--flecha, 50%) bottom; }
    .tarjeta.arriba { animation-name: entrar-arriba; }
    .tarjeta.is-saliendo { animation: salir 180ms ease-in forwards; }

    @media (prefers-color-scheme: light) {
      .tarjeta {
        --fondo: rgba(255, 255, 255, 0.8);
        --texto: #1A1D23;
        --tenue: #6B7280;
        --dorado: #9A6B14;
        --dorado-glow: rgba(154, 107, 20, 0.22);
        --dorado-ghost: rgba(154, 107, 20, 0.1);
        --dorado-dim: rgba(154, 107, 20, 0.4);
        --borde: rgba(0, 0, 0, 0.1);
        --sheen: rgba(255, 255, 255, 0.9);
        --sombra: 0 18px 48px rgba(60, 50, 30, 0.18), 0 2px 6px rgba(60, 50, 30, 0.08);
      }
    }

    /* Las manchas y el grano del popup, recortados a la tarjeta. La flecha va
       fuera, por eso el recorte está aquí y no en la tarjeta. */
    .fondo {
      position: absolute;
      inset: 0;
      z-index: -1;
      border-radius: inherit;
      overflow: hidden;
      pointer-events: none;
    }

    .fondo::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        radial-gradient(200px circle at 0% 0%, var(--dorado-glow), transparent 70%),
        radial-gradient(180px circle at 100% 110%, rgba(96, 134, 224, 0.22), transparent 70%);
    }

    .fondo::after {
      content: "";
      position: absolute;
      inset: 0;
      opacity: 0.05;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");
    }

    .flecha {
      position: absolute;
      top: -6px;
      left: var(--flecha, 50%);
      width: 11px;
      height: 11px;
      margin-left: -5.5px;
      background: var(--fondo);
      border: 1px solid var(--borde);
      border-right: none;
      border-bottom: none;
      transform: rotate(45deg);
    }

    .arriba .flecha {
      top: auto;
      bottom: -6px;
      border: 1px solid var(--borde);
      border-left: none;
      border-top: none;
    }

    .cabeza {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .marca {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--tenue);
    }

    .punto {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--dorado);
      box-shadow: 0 0 8px var(--dorado-glow);
      animation: respirar 2.4s ease-in-out infinite;
    }

    @keyframes respirar {
      50% { transform: scale(0.7); opacity: 0.6; }
    }

    button {
      font: inherit;
      color: inherit;
      cursor: pointer;
    }

    .cerrar {
      display: grid;
      place-items: center;
      width: 22px;
      height: 22px;
      margin-right: -4px;
      padding: 0;
      background: transparent;
      border: none;
      border-radius: 50%;
      color: var(--tenue);
      font-size: 15px;
      line-height: 1;
      transition: color 180ms ease, background-color 180ms ease, transform 260ms var(--muelle);
    }

    .cerrar:hover {
      color: var(--dorado);
      background: var(--dorado-ghost);
      transform: rotate(90deg);
    }

    .original {
      margin: 8px 0 0;
      font-family: var(--mono);
      font-size: 11px;
      color: var(--tenue);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-variant-numeric: tabular-nums;
    }

    .cifra {
      display: flex;
      align-items: baseline;
      gap: 6px;
      min-height: 38px;
      margin-top: 2px;
    }

    .valor {
      font-family: var(--mono);
      font-size: 28px;
      font-weight: 500;
      letter-spacing: -0.02em;
      color: var(--dorado);
      text-shadow: 0 0 24px var(--dorado-glow);
      font-variant-numeric: tabular-nums;
    }

    .codigo {
      font-family: var(--mono);
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: var(--dorado);
      opacity: 0.7;
    }

    .is-ok .cifra { animation: latido 420ms var(--muelle); }

    @keyframes latido {
      from { opacity: 0; transform: translateY(6px) scale(0.96); }
      60% { opacity: 1; transform: translateY(0) scale(1.03); }
      to { opacity: 1; transform: none; }
    }

    /* Mientras llega la tasa, una barra que brilla donde irá la cifra. */
    .barra {
      display: none;
      width: 70%;
      height: 22px;
      margin: 8px 0;
      border-radius: 6px;
      background: linear-gradient(90deg, var(--dorado-ghost) 0%, var(--dorado-glow) 50%, var(--dorado-ghost) 100%);
      background-size: 200% 100%;
      animation: brillo 1.1s linear infinite;
    }

    @keyframes brillo {
      from { background-position: 100% 0; }
      to { background-position: -100% 0; }
    }

    .is-cargando .barra { display: block; }
    .is-cargando .cifra,
    .is-cargando .meta,
    .is-cargando .pie { display: none; }

    .meta,
    .nota {
      margin: 2px 0 0;
      font-family: var(--mono);
      font-size: 10.5px;
      color: var(--tenue);
      font-variant-numeric: tabular-nums;
    }

    .nota { color: var(--dorado); opacity: 0.85; }
    .nota:empty { display: none; }

    .aviso {
      display: none;
      margin: 10px 0 2px;
      font-size: 12px;
      color: var(--cinabrio);
    }

    .is-error .aviso { display: block; }
    .is-error .cifra,
    .is-error .meta,
    .is-error .nota,
    .is-error .pie { display: none; }
    .is-error { animation: entrar 420ms var(--muelle) both, temblar 420ms ease 120ms; }

    @keyframes temblar {
      20% { translate: -4px 0; }
      40% { translate: 4px 0; }
      60% { translate: -2px 0; }
      80% { translate: 2px 0; }
    }

    .pie {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
    }

    .copiar {
      padding: 3px 9px;
      background: transparent;
      border: 1px solid var(--borde);
      border-radius: 8px;
      color: var(--tenue);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      transition: color 180ms ease, border-color 180ms ease, background-color 180ms ease,
        transform 180ms var(--muelle);
    }

    .copiar:hover {
      color: var(--dorado);
      border-color: var(--dorado-dim);
      background: var(--dorado-ghost);
    }

    .copiar:active { transform: scale(0.92); }

    .copiar.is-hecho {
      color: var(--jade);
      border-color: var(--jade);
      background: var(--jade-ghost);
      animation: latido 260ms var(--muelle);
    }

    .cerrar:focus-visible,
    .copiar:focus-visible {
      outline: 2px solid var(--dorado);
      outline-offset: 2px;
    }

    @keyframes entrar {
      from { opacity: 0; transform: translateY(-8px) scale(0.92); filter: blur(4px); }
      to { opacity: 1; transform: none; filter: none; }
    }

    @keyframes entrar-arriba {
      from { opacity: 0; transform: translateY(8px) scale(0.92); filter: blur(4px); }
      to { opacity: 1; transform: none; filter: none; }
    }

    @keyframes salir {
      to { opacity: 0; transform: translateY(-4px) scale(0.96); }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;

  const HTML = `
    <style>${CSS}</style>
    <div class="tarjeta is-cargando" role="dialog" aria-label="Conversión de divisa">
      <div class="fondo"></div>
      <span class="flecha"></span>
      <div class="cabeza">
        <span class="marca"><span class="punto"></span>ConversorDivisas</span>
        <button class="cerrar" type="button" aria-label="Cerrar">✕</button>
      </div>
      <p class="original"></p>
      <div class="barra"></div>
      <div class="cifra" aria-live="polite"><span class="valor"></span><span class="codigo"></span></div>
      <p class="meta"></p>
      <p class="nota"></p>
      <p class="aviso" role="alert"></p>
      <div class="pie"><button class="copiar" type="button">Copiar</button></div>
    </div>
  `;

  const nf = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)");

  let host = null;
  let raiz = null;
  let ancla = null;
  let datos = null;
  let cuenta = 0;
  let avisoCopiado = null;

  const $ = (sel) => raiz.querySelector(sel);

  function crear() {
    host = document.createElement("conversor-divisas");
    host.style.cssText = "all: initial; position: absolute; top: 0; left: 0; z-index: 2147483647;";
    raiz = host.attachShadow({ mode: "open" });
    raiz.innerHTML = HTML;
    $(".cerrar").addEventListener("click", cerrar);
    $(".copiar").addEventListener("click", copiar);
    document.documentElement.appendChild(host);
    document.addEventListener("mousedown", fuera, true);
    document.addEventListener("keydown", tecla, true);
  }

  // Dónde está lo seleccionado, en coordenadas de la página para que la tarjeta
  // se mueva con el scroll. En un input el rango no mide nada y uso el input.
  function medirSeleccion() {
    const sel = getSelection();
    let r = sel && sel.rangeCount ? sel.getRangeAt(0).getBoundingClientRect() : null;
    if (!r || (r.width === 0 && r.height === 0)) {
      r = document.activeElement && document.activeElement !== document.body
        ? document.activeElement.getBoundingClientRect()
        : { left: innerWidth / 2, right: innerWidth / 2, top: 80, bottom: 80, width: 0 };
    }
    return {
      centro: r.left + r.width / 2 + scrollX,
      arriba: r.top + scrollY,
      abajo: r.bottom + scrollY,
    };
  }

  // Debajo de la selección si cabe; si no, encima. Y sin salirse por los lados,
  // con la flecha apuntando siempre a la selección aunque la tarjeta se mueva.
  function colocar() {
    const tarjeta = $(".tarjeta");
    const alto = tarjeta.offsetHeight;
    const cabeAbajo = ancla.abajo - scrollY + HUECO + alto < innerHeight;
    const arriba = !cabeAbajo && ancla.arriba - scrollY - HUECO - alto > 0;

    const minX = scrollX + 8;
    const maxX = scrollX + document.documentElement.clientWidth - ANCHO - 8;
    const left = Math.min(Math.max(ancla.centro - ANCHO / 2, minX), maxX);
    const top = arriba ? ancla.arriba - HUECO - alto : ancla.abajo + HUECO;

    host.style.left = `${left}px`;
    host.style.top = `${top}px`;
    tarjeta.classList.toggle("arriba", arriba);
    const flecha = Math.min(Math.max(ancla.centro - left, 18), ANCHO - 18);
    tarjeta.style.setProperty("--flecha", `${flecha}px`);
  }

  function recortar(texto, max = 42) {
    const limpio = String(texto ?? "").replace(/\s+/g, " ").trim();
    return limpio.length > max ? `${limpio.slice(0, max - 1)}…` : limpio;
  }

  // La cifra sube desde cero en vez de aparecer de golpe.
  function contar(destino) {
    const valor = $(".valor");
    const id = ++cuenta;
    if (sinMovimiento.matches) {
      valor.textContent = nf.format(destino);
      return;
    }
    const inicio = performance.now();
    const DURA = 700;
    const paso = (ahora) => {
      if (id !== cuenta) return;
      const t = Math.min((ahora - inicio) / DURA, 1);
      const suave = 1 - (1 - t) ** 3;
      valor.textContent = nf.format(destino * suave);
      if (t < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }

  function mostrar(d) {
    if (!host) crear();
    const tarjeta = $(".tarjeta");
    tarjeta.classList.remove("is-saliendo");
    datos = d;

    if (d.estado === "cargando") {
      ancla = medirSeleccion();
      // Si ya había una abierta, que vuelva a entrar en su sitio nuevo.
      tarjeta.style.animation = "none";
      void tarjeta.offsetWidth;
      tarjeta.style.animation = "";
    }

    tarjeta.classList.toggle("is-cargando", d.estado === "cargando");
    tarjeta.classList.toggle("is-ok", d.estado === "ok");
    tarjeta.classList.toggle("is-error", d.estado === "error" || d.estado === "nada");

    if (d.estado === "ok") {
      $(".original").textContent = d.original;
      $(".codigo").textContent = d.to;
      $(".meta").textContent = d.fecha ? `${d.tasa} · ${d.fecha}` : d.tasa;
      $(".nota").textContent = d.adivinada ? `Sin divisa en el texto: uso ${d.from}` : "";
      contar(d.resultado);
    } else if (d.estado === "cargando") {
      $(".original").textContent = `«${recortar(d.original)}»`;
    } else {
      $(".original").textContent = `«${recortar(d.original)}»`;
      $(".aviso").textContent = d.estado === "nada"
        ? "No veo ninguna cantidad en lo que has seleccionado."
        : d.mensaje;
    }

    colocar();
    if (d.estado === "ok") $(".copiar").focus({ preventScroll: true });
  }

  function cerrar() {
    if (!host) return;
    const tarjeta = $(".tarjeta");
    if (tarjeta.classList.contains("is-saliendo")) return;
    cuenta++;
    document.removeEventListener("mousedown", fuera, true);
    document.removeEventListener("keydown", tecla, true);
    const quitar = () => {
      host?.remove();
      host = null;
      raiz = null;
    };
    if (sinMovimiento.matches) return quitar();
    tarjeta.classList.add("is-saliendo");
    tarjeta.addEventListener("animationend", quitar, { once: true });
  }

  function fuera(event) {
    if (host && !event.composedPath().includes(host)) cerrar();
  }

  function tecla(event) {
    if (event.key === "Escape") cerrar();
  }

  // Igual que el botón del popup: el número a secas y con coma, que es lo que
  // quieres al pegarlo en una hoja de cálculo.
  async function copiar() {
    if (!datos || datos.estado !== "ok") return;
    const texto = datos.resultado.toFixed(2).replace(".", ",");
    let hecho = false;
    try {
      await navigator.clipboard.writeText(texto);
      hecho = true;
    } catch (error) {
      const campo = document.createElement("textarea");
      campo.value = texto;
      campo.style.cssText = "position:fixed;top:-100px;opacity:0";
      document.body.appendChild(campo);
      campo.select();
      try {
        hecho = document.execCommand("copy");
      } catch (otro) {
        hecho = false;
      }
      campo.remove();
    }

    const boton = $(".copiar");
    boton.textContent = hecho ? "Copiado" : "No se pudo";
    boton.classList.toggle("is-hecho", hecho);
    clearTimeout(avisoCopiado);
    avisoCopiado = setTimeout(() => {
      if (!raiz) return;
      boton.textContent = "Copiar";
      boton.classList.remove("is-hecho");
    }, 1400);
  }

  window.__conversorDivisas = { mostrar, cerrar };
})();
