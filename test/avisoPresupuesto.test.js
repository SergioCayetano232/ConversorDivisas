const { test } = require("node:test");
const assert = require("node:assert");
const { nivelPresupuesto, avisosPresupuesto, mensajePresupuesto } = require("../logica.js");

const HOY = "2026-10-08";
const gasto = (id, valor) => ({ id, from: "JPY", to: "EUR", cantidad: valor * 160, valor, concepto: "", cuando: 0 });
const presupuesto = { importe: 1000, to: "EUR", hasta: "2026-10-12" };
const viajes = (gastos, extra = {}) => ({ activo: "j", lista: [{ id: "j", nombre: "Japón", gastos, presupuesto, ...extra }] });

test("el nivel: bien, pasado el 80 % y pasado del todo", () => {
  assert.equal(nivelPresupuesto(0.5), 0);
  assert.equal(nivelPresupuesto(0.8), 1);
  assert.equal(nivelPresupuesto(1), 1, "justo en el 100 % aún no te has pasado");
  assert.equal(nivelPresupuesto(1.01), 2);
});

test("avisa al pasar del 80 % apuntando un gasto", () => {
  const { avisos, avisados } = avisosPresupuesto(viajes([gasto("a", 700)]), viajes([gasto("b", 150), gasto("a", 700)]), {}, HOY);
  assert.equal(avisos.length, 1);
  assert.equal(avisos[0].nivel, 1);
  assert.deepEqual(avisados, { j: { firma: "1000|EUR", nivel: 1 } });
});

test("no avisa si no cruzas nada", () => {
  const { avisos } = avisosPresupuesto(viajes([gasto("a", 100)]), viajes([gasto("b", 50), gasto("a", 100)]), {}, HOY);
  assert.equal(avisos.length, 0);
});

test("de bien a pasado de golpe, un solo aviso, el de pasado", () => {
  const { avisos } = avisosPresupuesto(viajes([gasto("a", 700)]), viajes([gasto("b", 400), gasto("a", 700)]), {}, HOY);
  assert.deepEqual(avisos.map((a) => a.nivel), [2]);
});

test("ya avisado del 80 %, sí avisa al pasarte", () => {
  const avisados = { j: { firma: "1000|EUR", nivel: 1 } };
  const { avisos } = avisosPresupuesto(viajes([gasto("a", 850)]), viajes([gasto("b", 200), gasto("a", 850)]), avisados, HOY);
  assert.deepEqual(avisos.map((a) => a.nivel), [2]);
});

test("quitar el gasto y deshacerlo no vuelve a avisar", () => {
  const con = viajes([gasto("b", 150), gasto("a", 700)]);
  const sin = viajes([gasto("a", 700)]);
  const primero = avisosPresupuesto(sin, con, {}, HOY);
  const quitado = avisosPresupuesto(con, sin, primero.avisados, HOY);
  assert.equal(quitado.avisos.length, 0);
  assert.equal(quitado.avisados.j.nivel, 1, "se acuerda aunque ahora vaya bien");
  assert.equal(avisosPresupuesto(sin, con, quitado.avisados, HOY).avisos.length, 0);
});

test("si cambias el importe puede volver a avisar", () => {
  const avisados = { j: { firma: "1000|EUR", nivel: 1 } };
  const mas = { importe: 1200, to: "EUR", hasta: "2026-10-12" };
  // Subirlo no avisa: lo estás viendo.
  const subido = avisosPresupuesto(viajes([gasto("a", 850)]), viajes([gasto("a", 850)], { presupuesto: mas }), avisados, HOY);
  assert.equal(subido.avisos.length, 0);
  assert.deepEqual(subido.avisados.j, { firma: "1200|EUR", nivel: 0 });
  const otra = avisosPresupuesto(
    viajes([gasto("a", 850)], { presupuesto: mas }), viajes([gasto("b", 150), gasto("a", 850)], { presupuesto: mas }), subido.avisados, HOY,
  );
  assert.deepEqual(otra.avisos.map((a) => a.nivel), [1]);
});

test("poner un presupuesto que ya te pasas no avisa", () => {
  const { avisos } = avisosPresupuesto(viajes([gasto("a", 900)], { presupuesto: null }), viajes([gasto("a", 900)]), {}, HOY);
  assert.equal(avisos.length, 0);
});

test("con varios gastos nuevos a la vez no avisa: es una copia restaurada", () => {
  const { avisos } = avisosPresupuesto(viajes([]), viajes([gasto("b", 500), gasto("a", 450)]), {}, HOY);
  assert.equal(avisos.length, 0);
});

test("un gasto en otra divisa no cuenta", () => {
  const dolares = { ...gasto("b", 300), to: "USD" };
  const { avisos } = avisosPresupuesto(viajes([gasto("a", 700)]), viajes([dolares, gasto("a", 700)]), {}, HOY);
  assert.equal(avisos.length, 0);
});

test("los viajes borrados se olvidan", () => {
  const { avisados } = avisosPresupuesto(viajes([]), viajes([]), { viejo: { firma: "500|EUR", nivel: 2 } }, HOY);
  assert.equal(avisados.viejo, undefined);
});

test("el mensaje al 80 % dice cuánto queda al día, con el nombre del viaje", () => {
  const [aviso] = avisosPresupuesto(viajes([gasto("a", 700)]), viajes([gasto("b", 150), gasto("a", 700)]), {}, HOY).avisos;
  assert.deepEqual(mensajePresupuesto(aviso), {
    titulo: "Japón · Llevas el 85\u00a0% del presupuesto",
    cuerpo: "Te quedan 150,00 EUR, 30,00 EUR al día.",
  });
});

test("el porcentaje va hacia abajo y sin nombre no lleva el punto", () => {
  const viaje = { nombre: "", presupuesto };
  const { titulo } = mensajePresupuesto({ viaje, nivel: 1, estado: { fraccion: 0.8996, queda: 100.4, porDia: null, gastado: 899.6 } });
  assert.equal(titulo, "Llevas el 89\u00a0% del presupuesto");
});

test("el mensaje al pasarte dice por cuánto", () => {
  const [aviso] = avisosPresupuesto(viajes([gasto("a", 900)]), viajes([gasto("b", 150), gasto("a", 900)]), {}, HOY).avisos;
  assert.deepEqual(mensajePresupuesto(aviso), {
    titulo: "Japón · Te has pasado del presupuesto",
    cuerpo: "1.050,00 EUR de 1.000,00 EUR: 50,00 EUR de más.",
  });
});
