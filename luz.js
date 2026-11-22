// La luz que sigue al ratón por las tarjetas. Solo le digo al CSS dónde está
// el cursor dentro de cada una; el reflejo lo pinta .tarjeta::after.

// Con el dedo no hay nada que seguir: se quedaría encendida donde tocaste.
document.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse") return;
  const tarjeta = event.target.closest?.(".tarjeta");
  if (!tarjeta) return;
  const caja = tarjeta.getBoundingClientRect();
  tarjeta.style.setProperty("--luz-x", `${Math.round(event.clientX - caja.left)}px`);
  tarjeta.style.setProperty("--luz-y", `${Math.round(event.clientY - caja.top)}px`);
});
