// El tema a mano: claro, oscuro o el del sistema. Va en el <head> de cada
// página, detrás del CSS, para que esté puesto antes de pintar nada.

const TEMAS = ["auto", "claro", "oscuro"];
const leerTema = (valor) => (TEMAS.includes(valor) ? valor : "auto");

// Todo lo del claro vive dentro de un @media. En vez de repetirlo con una
// clase, le cambio la condición a la regla: siempre, nunca o la suya.
const MEDIA_CLARO = "(prefers-color-scheme: light)";
const mediaDeTema = (tema) => ({ claro: "all", oscuro: "not all" })[leerTema(tema)] ?? MEDIA_CLARO;

if (typeof document !== "undefined") {
  // Las busco una vez: después de tocarlas ya no dicen "light" y no las reconocería.
  const reglas = [...document.styleSheets]
    .flatMap((hoja) => [...hoja.cssRules])
    .filter((regla) => regla instanceof CSSMediaRule && regla.media.mediaText === MEDIA_CLARO);
  let puesto = "auto";

  const ponerTema = (tema) => {
    puesto = leerTema(tema);
    for (const regla of reglas) regla.media.mediaText = mediaDeTema(puesto);
    document.documentElement.dataset.tema = puesto;
  };

  // chrome.storage tarda un instante y se vería el otro tema al abrir. Me dejo
  // una copia en localStorage, que se lee en el acto.
  const recordar = (tema) => {
    try {
      localStorage.setItem("tema", tema);
    } catch {
      // Sin localStorage solo se pierde el arranque sin parpadeo.
    }
  };

  const cambiarTema = (tema) => {
    if (leerTema(tema) === puesto) return;
    // El mismo fundido de las manchas que cuando cambia el sistema.
    const raiz = document.documentElement;
    raiz.classList.add("is-cambiando-tema");
    setTimeout(() => raiz.classList.remove("is-cambiando-tema"), 700);
    ponerTema(tema);
    recordar(puesto);
  };

  try {
    ponerTema(localStorage.getItem("tema"));
  } catch {
    ponerTema("auto");
  }

  if (globalThis.chrome?.storage) {
    chrome.storage.local.get("tema").then(({ tema }) => cambiarTema(tema)).catch((error) => console.warn("No se pudo leer el tema", error));
    // El panel lateral sigue abierto mientras lo cambias en el menú del icono.
    chrome.storage.onChanged.addListener((cambios, zona) => {
      if (zona === "local" && cambios.tema) cambiarTema(cambios.tema.newValue);
    });
  }
}

if (typeof module !== "undefined") {
  module.exports = { TEMAS, leerTema, MEDIA_CLARO, mediaDeTema };
}
