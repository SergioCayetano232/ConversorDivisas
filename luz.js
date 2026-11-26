// La luz que sigue al ratón por las tarjetas. Solo le digo al CSS dónde está
// el cursor dentro de cada una; el reflejo lo pinta .tarjeta::after.

// La sombra se va al lado contrario de la luz, como si el ratón fuera una
// lámpara. Con 8 px se nota sin que la tarjeta parezca que se despega.
const SOMBRA_MAX = 8;

function sombraDeLuz(x, y, ancho, alto, maximo = SOMBRA_MAX) {
  if (![x, y, ancho, alto].every(Number.isFinite) || ancho <= 0 || alto <= 0) return null;
  const px = Math.min(1, Math.max(0, x / ancho));
  const py = Math.min(1, Math.max(0, y / alto));
  return { x: Math.round((0.5 - px) * 2 * maximo) || 0, y: Math.round((0.5 - py) * 2 * maximo) || 0 };
}

// El hilo holográfico del resultado cambia de color según dónde esté el ratón,
// como el de un billete al ladearlo. De punta a punta, casi una vuelta entera
// de colores: la vuelta completa acabaría en el mismo y no se notaría.
const HOLO_VUELTA = 300;

function tonoHolograma(x, ancho) {
  if (!Number.isFinite(x) || !Number.isFinite(ancho) || ancho <= 0) return 0;
  return Math.round(Math.min(1, Math.max(0, x / ancho)) * HOLO_VUELTA);
}

if (typeof document !== "undefined") {
  // Con el dedo no hay nada que seguir: se quedaría encendida donde tocaste.
  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    const tarjeta = event.target.closest?.(".tarjeta");
    if (!tarjeta) return;
    const caja = tarjeta.getBoundingClientRect();
    const x = event.clientX - caja.left;
    const y = event.clientY - caja.top;
    tarjeta.style.setProperty("--luz-x", `${Math.round(x)}px`);
    tarjeta.style.setProperty("--luz-y", `${Math.round(y)}px`);
    const sombra = sombraDeLuz(x, y, caja.width, caja.height);
    if (!sombra) return;
    tarjeta.style.setProperty("--luz-sombra-x", `${sombra.x}px`);
    tarjeta.style.setProperty("--luz-sombra-y", `${sombra.y}px`);
  });
}

if (typeof module !== "undefined") {
  module.exports = { SOMBRA_MAX, sombraDeLuz, HOLO_VUELTA, tonoHolograma };
}
