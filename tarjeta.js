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
      --cinabrio-ghost: rgba(229, 83, 75, 0.16);
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
        --jade: #2E8A4E;
        --cinabrio: #C7372F;
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

    .original:empty { display: none; }

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

    .is-ok .cifra { animation: latido 420ms var(--muelle); cursor: copy; }

    /* Una medida puede ser larga ("🇺🇸 9 hombre · 10,5 mujer · 🇬🇧 8"): que parta. */
    .is-medida .cifra { flex-wrap: wrap; }
    .is-medida .valor { font-size: 22px; line-height: 1.25; overflow-wrap: anywhere; }
    .is-medida .valor.is-larga { font-size: 15px; letter-spacing: 0; }
    .is-medida .meta,
    .is-medida .concepto,
    .is-medida .gasto { display: none; }
    .is-medida .pie { justify-content: flex-end; }

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

    /* Plegado de entrada: con el hotel o la cena del viaje no pinta nada, y
       solo quien compra algo para que se lo manden lo abre. */
    .fuera[hidden] { display: none; }
    .fuera { margin-top: 6px; }
    .abrir-fuera {
      padding: 0;
      background: none;
      border: none;
      color: var(--tenue);
      font-size: 10.5px;
      transition: color 180ms ease;
    }
    .abrir-fuera::after {
      content: "›";
      display: inline-block;
      margin-left: 4px;
      transition: transform 260ms var(--muelle);
    }
    .abrir-fuera:hover { color: var(--dorado); }
    .abrir-fuera[aria-expanded="true"] { color: var(--texto); }
    .abrir-fuera[aria-expanded="true"]::after { transform: rotate(90deg); }
    .abrir-fuera:focus-visible { outline: 2px solid var(--dorado); outline-offset: 2px; border-radius: 4px; }
    .cuenta-fuera {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 320ms var(--suave);
    }
    .cuenta-fuera > div { overflow: hidden; }
    .abrir-fuera[aria-expanded="true"] + .cuenta-fuera { grid-template-rows: 1fr; }
    .fuera-total {
      margin: 4px 0 0;
      font-family: var(--mono);
      font-size: 11px;
      color: var(--texto);
      font-variant-numeric: tabular-nums;
    }
    .fuera-detalle {
      margin: 2px 0 0;
      font-size: 10.5px;
      line-height: 1.4;
      color: var(--tenue);
    }
    /* Lo que te cobrarían en tu divisa contra el cambio real. Es lo más
       importante de la tarjeta cuando sale, por eso va en caja y no en línea. */
    .dcc[hidden] { display: none; }
    .dcc {
      --tono: var(--jade);
      --tono-fondo: var(--jade-ghost);
      margin: 8px 0 0;
      padding: 6px 8px;
      font-size: 11px;
      line-height: 1.4;
      color: var(--tono);
      background: var(--tono-fondo);
      border-left: 2px solid var(--tono);
      border-radius: 4px 8px 8px 4px;
      font-variant-numeric: tabular-nums;
      animation: latido 420ms var(--muelle) 80ms both;
    }
    .guardado[hidden] { display: none; }
    .guardado {
      --tono: var(--jade);
      --tono-fondo: var(--jade-ghost);
      margin: 8px 0 0;
      padding: 6px 8px;
      font-size: 11px;
      line-height: 1.4;
      color: var(--tono);
      background: var(--tono-fondo);
      border-left: 2px solid var(--tono);
      border-radius: 4px 8px 8px 4px;
      font-variant-numeric: tabular-nums;
      overflow-wrap: anywhere;
      animation: latido 420ms var(--muelle) 160ms both;
    }
    .guardado[data-tono="normal"] { --tono: var(--dorado); --tono-fondo: var(--dorado-ghost); }
    .guardado[data-tono="caro"] { --tono: var(--cinabrio); --tono-fondo: var(--cinabrio-ghost); }
    .dcc[data-tono="normal"] { --tono: var(--dorado); --tono-fondo: var(--dorado-ghost); }
    .dcc[data-tono="caro"],
    .dcc[data-tono="timo"] { --tono: var(--cinabrio); --tono-fondo: var(--cinabrio-ghost); }
    .dcc[data-tono="timo"] { animation: latido 420ms var(--muelle) 80ms both, temblar 420ms ease 500ms; }
    /* Lo gastado del viaje, liso, y lo que se llevaría esto, a rayas detrás,
       como en la barra del presupuesto del popup. */
    .presupuesto[hidden] { display: none; }
    .presupuesto {
      --tono: var(--jade);
      margin-top: 8px;
      animation: latido 420ms var(--muelle) 120ms both;
    }
    .presupuesto[data-tono="justo"] { --tono: var(--dorado); }
    .presupuesto[data-tono="pasado"] { --tono: var(--cinabrio); }
    .pista {
      position: relative;
      height: 4px;
      border-radius: 2px;
      background: var(--borde);
      overflow: hidden;
    }
    .gastado,
    .esto {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
    }
    .gastado {
      width: var(--desde);
      background: var(--tenue);
      opacity: 0.55;
    }
    .esto {
      left: var(--desde);
      width: var(--trozo);
      background: repeating-linear-gradient(-45deg, var(--tono) 0 3px, transparent 3px 5px);
      transform-origin: left;
      animation: crecer 600ms var(--suave) 260ms both;
    }
    @keyframes crecer {
      from { transform: scaleX(0); }
    }
    .frase {
      margin: 4px 0 0;
      font-size: 11px;
      color: var(--tono);
      font-variant-numeric: tabular-nums;
    }
    .presupuesto[data-tono="pasado"] .pista { background: var(--cinabrio-ghost); }
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
      align-items: center;
      gap: 6px;
      margin-top: 10px;
    }

    .concepto {
      flex: 1;
      min-width: 0;
      box-sizing: border-box;
      height: 24px;
      padding: 0 8px;
      font: 11px system-ui, -apple-system, "Segoe UI", Inter, sans-serif;
      color: var(--texto);
      background: var(--dorado-ghost);
      border: 1px solid var(--borde);
      border-radius: 8px;
      outline: none;
      transition: border-color 180ms ease, opacity 180ms ease;
    }

    .concepto::placeholder { color: var(--tenue); }
    .concepto:focus { border-color: var(--dorado-dim); }
    .concepto:disabled { opacity: 0.6; }

    /* Arriba, al lado de la ✕: en el pie le quitaba el sitio al concepto. */
    .guardar {
      display: none;
      place-items: center;
      width: 22px;
      height: 22px;
      margin-left: auto;
      padding: 0;
      background: transparent;
      border: none;
      border-radius: 50%;
      font-size: 11px;
      line-height: 1;
      filter: grayscale(1);
      opacity: 0.55;
      transition: filter 180ms ease, opacity 180ms ease, background-color 180ms ease, transform 180ms var(--muelle);
    }
    .is-ok .guardar { display: grid; }
    .is-medida .guardar { display: none; }
    .guardar:hover,
    .avisar:hover { opacity: 1; background: var(--dorado-ghost); }
    .guardar:active,
    .avisar:active { transform: scale(0.85); }

    .avisar {
      display: grid;
      place-items: center;
      width: 22px;
      height: 22px;
      margin-left: auto;
      padding: 0;
      background: transparent;
      border: none;
      border-radius: 50%;
      font-size: 11px;
      line-height: 1;
      filter: grayscale(1);
      opacity: 0.55;
      transition: filter 180ms ease, opacity 180ms ease, background-color 180ms ease, transform 180ms var(--muelle);
    }
    .avisar[hidden] { display: none; }
    .avisar + .guardar { margin-left: 0; }
    .avisar[hidden] + .guardar { margin-left: auto; }
    .avisar[aria-expanded="true"],
    .avisar.is-hecho { filter: none; opacity: 1; background: var(--dorado-ghost); }
    .avisar.is-hecho { animation: sonar 620ms ease; }
    .avisar:focus-visible { outline: 2px solid var(--dorado); outline-offset: 2px; }

    @keyframes sonar {
      20% { rotate: -18deg; }
      40% { rotate: 14deg; }
      60% { rotate: -9deg; }
      80% { rotate: 5deg; }
    }

    .alerta[hidden] { display: none; }
    .alerta {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
      font-size: 11px;
      color: var(--tenue);
      animation: latido 320ms var(--muelle) both;
    }
    .alerta label { flex: 1; min-width: 0; }
    .alerta-max {
      flex: none;
      box-sizing: border-box;
      width: 62px;
      height: 24px;
      padding: 0 6px;
      font: 11px var(--mono);
      font-variant-numeric: tabular-nums;
      text-align: right;
      color: var(--dorado);
      background: var(--dorado-ghost);
      border: 1px solid var(--borde);
      border-radius: 8px;
      outline: none;
      transition: border-color 180ms ease;
    }
    .alerta-max:focus { border-color: var(--dorado-dim); }
    .alerta.is-mal { animation: temblar 420ms ease; }
    .alerta.is-mal .alerta-max { border-color: var(--cinabrio); }
    .guardar[aria-pressed="true"] {
      filter: none;
      opacity: 1;
      background: var(--dorado-ghost);
      transform: rotate(-20deg);
    }
    .guardar:focus-visible { outline: 2px solid var(--dorado); outline-offset: 2px; }

    .copiar,
    .alerta-ok,
    .gasto {
      flex: none;
      height: 24px;
      padding: 0 9px;
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

    .copiar:hover,
    .alerta-ok:hover,
    .gasto:hover:not(:disabled) {
      color: var(--dorado);
      border-color: var(--dorado-dim);
      background: var(--dorado-ghost);
    }

    .copiar:active,
    .gasto:active:not(:disabled) { transform: scale(0.92); }

    .gasto:disabled { cursor: default; }

    .copiar.is-hecho,
    .gasto.is-hecho {
      color: var(--jade);
      border-color: var(--jade);
      background: var(--jade-ghost);
      animation: latido 260ms var(--muelle);
    }

    .cerrar:focus-visible,
    .alerta-ok:focus-visible,
    .gasto:focus-visible,
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
        <button class="avisar" type="button" aria-expanded="false" hidden>🔔</button>
        <button class="guardar" type="button" aria-pressed="false">📌</button>
        <button class="cerrar" type="button" aria-label="Cerrar">✕</button>
      </div>
      <p class="original"></p>
      <div class="barra"></div>
      <div class="cifra" aria-live="polite"><span class="valor"></span><span class="codigo"></span></div>
      <p class="meta"></p>
      <p class="nota"></p>
      <p class="dcc" hidden></p>
      <p class="guardado" hidden></p>
      <div class="alerta" hidden>
        <label for="alerta-max"></label>
        <input class="alerta-max" id="alerta-max" type="text" inputmode="decimal" maxlength="12" autocomplete="off">
        <button class="alerta-ok" type="button"></button>
      </div>
      <div class="presupuesto" hidden>
        <div class="pista"><span class="gastado"></span><span class="esto"></span></div>
        <p class="frase"></p>
      </div>
      <div class="fuera" hidden>
        <button class="abrir-fuera" type="button" aria-expanded="false"></button>
        <div class="cuenta-fuera"><div><p class="fuera-total"></p><p class="fuera-detalle"></p></div></div>
      </div>
      <p class="aviso" role="alert"></p>
      <div class="pie">
        <input class="concepto" type="text" maxlength="40" autocomplete="off" placeholder="Concepto" aria-label="Concepto">
        <button class="gasto" type="button">+ Gasto</button>
        <button class="copiar" type="button">Copiar</button>
      </div>
    </div>
  `;

  // Los números, en el idioma que diga el background; hasta que llegue, español.
  const formatoDe = (locale) =>
    new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: "always" });
  let nf = formatoDe("es-ES");
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
    $(".cifra").addEventListener("dblclick", copiar);
    $(".gasto").addEventListener("click", apuntar);
    $(".guardar").addEventListener("click", guardar);
    $(".avisar").addEventListener("click", abrirAlerta);
    $(".alerta-ok").addEventListener("click", avisar);
    $(".abrir-fuera").addEventListener("click", (event) => {
      const boton = event.currentTarget;
      boton.setAttribute("aria-expanded", String(boton.getAttribute("aria-expanded") !== "true"));
      // Al abrirse crece, y si estaba encima de la selección tiene que subir.
      setTimeout(colocar, 340);
    });
    const campo = $(".concepto");
    campo.addEventListener("keydown", (event) => {
      // En japonés o chino el Enter acepta el carácter, no es que hayas acabado.
      if (event.key === "Enter" && !event.isComposing) apuntar();
    });
    $(".alerta-max").addEventListener("keydown", (event) => {
      if (event.key === "Enter") avisar();
    });
    // Si no, al escribir aquí saltan los atajos de la web (YouTube, Gmail…).
    for (const c of [campo, $(".alerta-max")]) {
      for (const tipo of ["keydown", "keypress", "keyup"]) c.addEventListener(tipo, (event) => event.stopPropagation());
    }
    document.documentElement.appendChild(host);
    document.addEventListener("mousedown", fuera, true);
    document.addEventListener("keydown", tecla, true);
    // Si estrechas la ventana con la tarjeta abierta, se quedaba cortada.
    addEventListener("resize", colocar);
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

  const citar = (texto) => (datos.textos?.cita ?? "«{texto}»").replace("{texto}", recortar(texto));

  function traducir(d) {
    if (d.locale) nf = formatoDe(d.locale);
    if (!d.textos) return;
    $(".tarjeta").setAttribute("aria-label", d.textos.dialogo);
    $(".cerrar").setAttribute("aria-label", d.textos.cerrar);
    const copiar = $(".copiar");
    if (!copiar.classList.contains("is-hecho")) copiar.textContent = d.textos.copiar;
    const gasto = $(".gasto");
    if (!gasto.classList.contains("is-hecho")) gasto.textContent = d.textos.gasto;
    $(".avisar").title = d.textos.avisar;
    $(".avisar").setAttribute("aria-label", d.textos.avisar);
    $(".alerta label").textContent = d.textos.avisoEtiqueta;
    $(".alerta-ok").textContent = d.textos.avisoOk;
    $(".guardar").title = d.textos.guardar;
    $(".guardar").setAttribute("aria-label", d.textos.guardar);
    $(".concepto").placeholder = d.textos.concepto;
    $(".concepto").setAttribute("aria-label", d.textos.concepto);
  }

  // Con la tarjeta ya abierta, otra conversión no puede heredar el "Apuntado".
  function prepararGasto() {
    const boton = $(".gasto");
    boton.disabled = false;
    boton.classList.remove("is-hecho");
    $(".concepto").disabled = false;
    $(".concepto").value = "";
  }

  function mostrar(d) {
    if (!host) crear();
    const tarjeta = $(".tarjeta");
    tarjeta.classList.remove("is-saliendo");
    datos = d;
    if (d.estado === "cargando") prepararGasto();
    traducir(d);

    if (d.estado === "cargando") {
      ancla = medirSeleccion();
      // Si ya había una abierta, que vuelva a entrar en su sitio nuevo.
      tarjeta.style.animation = "none";
      void tarjeta.offsetWidth;
      tarjeta.style.animation = "";
    }

    tarjeta.classList.toggle("is-cargando", d.estado === "cargando");
    tarjeta.classList.toggle("is-ok", d.estado === "ok" || d.estado === "medida");
    tarjeta.classList.toggle("is-medida", d.estado === "medida");
    tarjeta.classList.toggle("is-error", d.estado === "error" || d.estado === "nada");

    if (d.estado === "ok") {
      $(".original").textContent = d.original;
      $(".codigo").textContent = d.to;
      $(".meta").textContent = d.fecha ? `${d.tasa} · ${d.fecha}` : d.tasa;
      $(".nota").textContent = d.nota ?? "";
      pintarDcc(d.dcc);
      pintarGuardado(d.guardado);
      pintarAlerta(d.aviso);
      pintarFuera(d.fuera);
      pintarPresupuesto(d.presupuesto);
      contar(d.resultado);
    } else if (d.estado === "medida") {
      // Aquí no hay cifra que contar: es un texto, y a veces con dos resultados.
      cuenta++;
      $(".original").textContent = d.original;
      $(".valor").textContent = d.texto;
      $(".valor").classList.toggle("is-larga", d.texto.length > 16);
      $(".codigo").textContent = "";
      $(".nota").textContent = "";
      pintarDcc(null);
      pintarGuardado(null);
      pintarAlerta(null);
      pintarFuera(null);
      pintarPresupuesto(null);
    } else if (d.estado === "cargando") {
      $(".original").textContent = citar(d.original);
      pintarDcc(null);
      pintarGuardado(null);
      pintarAlerta(null);
      pintarFuera(null);
      pintarPresupuesto(null);
    } else {
      // Con el atajo y nada seleccionado no hay texto que citar: mejor nada que «».
      $(".original").textContent = d.original ? citar(d.original) : "";
      $(".aviso").textContent = d.mensaje;
      pintarDcc(null);
      pintarGuardado(null);
      pintarAlerta(null);
      pintarFuera(null);
      pintarPresupuesto(null);
    }

    // Con el atajo y nada seleccionado llega sin pasar por "cargando", y sin
    // esto se quedaba en la esquina de la página.
    if (!ancla) ancla = medirSeleccion();
    colocar();
    if (d.estado === "ok" || d.estado === "medida") $(".copiar").focus({ preventScroll: true });
  }

  // Cerrado cada vez: lo que abriste para otro precio no tiene por qué seguir abierto.
  function pintarFuera(f) {
    const caja = $(".fuera");
    caja.hidden = !f;
    $(".abrir-fuera").setAttribute("aria-expanded", "false");
    if (!f) return;
    $(".abrir-fuera").textContent = f.boton;
    $(".fuera-total").textContent = f.total;
    $(".fuera-detalle").textContent = f.detalle;
  }

  // Plegada cada vez, con lo propuesto: la de otro precio no vale para este.
  function pintarAlerta(a) {
    const boton = $(".avisar");
    boton.hidden = !a;
    boton.setAttribute("aria-expanded", "false");
    boton.classList.remove("is-hecho");
    $(".alerta").hidden = true;
    $(".alerta").classList.remove("is-mal");
    if (!a) return;
    $(".alerta-max").value = a.sugerido;
    $(".alerta-max").setAttribute("aria-label", a.campo);
  }

  function abrirAlerta() {
    const boton = $(".avisar");
    const abrir = boton.getAttribute("aria-expanded") !== "true";
    boton.setAttribute("aria-expanded", String(abrir));
    $(".alerta").hidden = !abrir;
    colocar();
    if (abrir) {
      $(".alerta-max").focus({ preventScroll: true });
      $(".alerta-max").select();
    } else {
      boton.focus({ preventScroll: true });
    }
  }

  async function avisar() {
    if (!datos || datos.estado !== "ok") return;
    const enviados = datos;
    let respuesta;
    try {
      respuesta = await chrome.runtime.sendMessage({
        tipo: "avisarTarjeta",
        cantidad: enviados.cantidad,
        from: enviados.from,
        to: enviados.to,
        maximo: $(".alerta-max").value,
      });
    } catch (error) {
      respuesta = null;
    }
    if (!raiz || datos !== enviados) return;
    const caja = $(".alerta");
    if (respuesta?.ok) {
      caja.hidden = true;
      $(".avisar").setAttribute("aria-expanded", "false");
      $(".avisar").classList.add("is-hecho");
      $(".copiar").focus({ preventScroll: true });
    } else {
      caja.classList.remove("is-mal");
      void caja.offsetWidth;
      caja.classList.add("is-mal");
    }
    $(".nota").textContent = respuesta?.mensaje ?? "";
    colocar();
  }

  function pintarGuardado(g) {
    const caja = $(".guardado");
    caja.hidden = !g;
    $(".guardar").setAttribute("aria-pressed", String(Boolean(g?.esEste)));
    if (!g) return;
    caja.dataset.tono = g.tono;
    caja.textContent = g.texto;
  }

  function pintarDcc(d) {
    const caja = $(".dcc");
    caja.hidden = !d;
    if (!d) return;
    caja.dataset.tono = d.tono;
    caja.textContent = d.texto;
    caja.style.animation = "none";
    void caja.offsetWidth;
    caja.style.animation = "";
  }

  // Va con la tarjeta del viaje abierto; sin presupuesto o en otra divisa no sale.
  function pintarPresupuesto(p) {
    const caja = $(".presupuesto");
    caja.hidden = !p;
    if (!p) return;
    caja.dataset.tono = p.tono;
    caja.style.setProperty("--desde", `${p.desde * 100}%`);
    caja.style.setProperty("--trozo", `${p.trozo * 100}%`);
    $(".frase").textContent = p.texto;
    // Si cambia de conversión con la tarjeta abierta, que vuelva a crecer.
    for (const el of [caja, $(".esto")]) {
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
    }
  }

  function cerrar() {
    if (!host) return;
    const tarjeta = $(".tarjeta");
    if (tarjeta.classList.contains("is-saliendo")) return;
    cuenta++;
    document.removeEventListener("mousedown", fuera, true);
    document.removeEventListener("keydown", tecla, true);
    removeEventListener("resize", colocar);
    const quitar = () => {
      host?.remove();
      host = null;
      raiz = null;
      ancla = null;
    };
    if (sinMovimiento.matches) return quitar();
    tarjeta.classList.add("is-saliendo");
    tarjeta.addEventListener("animationend", quitar, { once: true });
  }

  function fuera(event) {
    if (host && !event.composedPath().includes(host)) cerrar();
  }

  function tecla(event) {
    if (event.key !== "Escape") return;
    // Con la fila del aviso abierta, el primer Esc cierra solo la fila.
    if ($(".alerta").hidden) cerrar();
    else abrirAlerta();
  }

  // Igual que el botón del popup: el número a secas, que es lo que quieres al
  // pegarlo en una hoja de cálculo. Me llega hecho, con el decimal del idioma.
  // Con Shift, la frase entera, como en el popup.
  async function copiar(event) {
    if (!datos || (datos.estado !== "ok" && datos.estado !== "medida")) return;
    const numero = datos.copia ?? datos.resultado.toFixed(2).replace(".", ",");
    const texto = event?.shiftKey && datos.frase ? datos.frase : numero;
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
    boton.textContent = hecho ? datos.textos?.copiado ?? "Copiado" : datos.textos?.fallo ?? "No se pudo";
    boton.classList.toggle("is-hecho", hecho);
    clearTimeout(avisoCopiado);
    avisoCopiado = setTimeout(() => {
      if (!raiz) return;
      boton.textContent = datos?.textos?.copiar ?? "Copiar";
      boton.classList.remove("is-hecho");
    }, 1400);
  }

  async function apuntar() {
    const boton = $(".gasto");
    if (!datos || datos.estado !== "ok" || boton.disabled) return;
    const enviados = datos;
    boton.disabled = true;
    let respuesta;
    try {
      respuesta = await chrome.runtime.sendMessage({
        tipo: "apuntarTarjeta",
        cantidad: enviados.cantidad,
        from: enviados.from,
        to: enviados.to,
        concepto: $(".concepto").value,
      });
    } catch (error) {
      // Pasa si recargas la extensión con la tarjeta abierta.
      respuesta = { ok: false, mensaje: enviados.textos.noApuntado };
    }
    if (!raiz || datos !== enviados) return;

    // Se queda en verde y sin poder pulsarse, para no apuntarlo dos veces.
    if (respuesta?.ok) {
      boton.textContent = enviados.textos.apuntado;
      boton.classList.add("is-hecho");
      $(".concepto").disabled = true;
    } else {
      boton.disabled = false;
    }
    $(".nota").textContent = respuesta?.mensaje ?? enviados.textos.noApuntado;
    colocar();
  }

  async function guardar() {
    if (!datos || datos.estado !== "ok") return;
    const enviados = datos;
    let respuesta;
    try {
      respuesta = await chrome.runtime.sendMessage({
        tipo: "guardarTarjeta",
        cantidad: enviados.cantidad,
        from: enviados.from,
        web: location.hostname,
      });
    } catch (error) {
      respuesta = null;
    }
    if (!raiz || datos !== enviados) return;
    // Al guardar este, lo que decía del otro ya no vale: el otro ya no está.
    if (respuesta?.ok) pintarGuardado(respuesta.guardado ? { esEste: true, tono: "normal", texto: respuesta.mensaje } : null);
    if (!respuesta?.guardado) $(".nota").textContent = respuesta?.mensaje ?? "";
    colocar();
  }

  window.__conversorDivisas = { mostrar, cerrar };
})();
