const { test } = require("node:test");
const assert = require("node:assert");
const { destinoDelViaje, antesDeSalir, leerListo, marcarListo, progresoMaleta, leerViajes, CURRENCIES } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const claves = (alli, aqui) => antesDeSalir(alli, aqui).map((c) => c.clave);

test("a Japón desde España: pasaporte, seguro, eSIM, adaptador, voltaje, permiso, efectivo y teléfonos", () => {
  ponerIdioma("es");
  assert.deepEqual(claves("JPY", "EUR"), ["visado", "sanitaria", "roaming", "adaptador", "voltaje", "permiso", "efectivo", "emergencias"]);
  const cosas = Object.fromEntries(antesDeSalir("JPY", "EUR").map((c) => [c.clave, c.texto]));
  assert.equal(cosas.visado, "Pasaporte en vigor: sin visado, hasta 90 días");
  assert.equal(cosas.adaptador, "Compra un adaptador de enchufe (tipo A/B)");
  assert.equal(cosas.voltaje, "Mira el secador y la plancha: allí van a 100 V");
  assert.equal(cosas.emergencias, "Apúntate los teléfonos de emergencia: 110, 119");
});

test("a Estados Unidos, el ESTA y un seguro que cubra bien", () => {
  ponerIdioma("es");
  const cosas = Object.fromEntries(antesDeSalir("USD", "EUR").map((c) => [c.clave, c.texto]));
  assert.equal(cosas.visado, "Pide el ESTA por internet, que sin él no te dejan embarcar");
  assert.match(cosas.sanitaria, /una urgencia cuesta miles/);
  assert.equal(cosas.efectivo, undefined);
});

test("dentro de la UE, solo el DNI, la tarjeta sanitaria y los teléfonos", () => {
  ponerIdioma("es");
  assert.deepEqual(claves("PLN", "EUR"), ["visado", "sanitaria", "emergencias"]);
  // En casa ni el efectivo ni el 112.
  assert.deepEqual(claves("EUR", "EUR"), ["visado", "sanitaria"]);
});

test("Reino Unido: mira tu tarifa y el adaptador, pero el carné vale", () => {
  assert.deepEqual(claves("GBP", "EUR"), ["visado", "sanitaria", "roaming", "adaptador", "emergencias"]);
});

test("si tu enchufe entra allí no te pide adaptador", () => {
  assert.ok(!claves("MXN", "USD").includes("adaptador"));
  assert.ok(!claves("MXN", "USD").includes("voltaje"));
});

test("Marruecos, con efectivo", () => {
  ponerIdioma("es");
  const efectivo = antesDeSalir("MAD", "EUR").find((c) => c.clave === "efectivo");
  assert.equal(efectivo.texto, "Lleva efectivo: allí casi todo se paga así");
});

test("sale algo para las 55 divisas, y nada para una que no existe", () => {
  ponerIdioma("es");
  for (const { code } of CURRENCIES) {
    const cosas = antesDeSalir(code, "EUR");
    assert.ok(cosas.length >= 2, code);
    for (const c of cosas) assert.ok(c.texto && !c.texto.includes("maleta."), `${code} ${c.clave}`);
  }
  assert.deepEqual(antesDeSalir("XYZ", "EUR"), []);
  assert.deepEqual(antesDeSalir(null, "EUR"), []);
});

test("en inglés", () => {
  ponerIdioma("en");
  assert.equal(antesDeSalir("JPY", "EUR")[0].texto, "Valid passport: no visa, up to 90 days");
  ponerIdioma("es");
});

test("el destino: primero el tramo, luego los gastos y si no, lo de arriba", () => {
  const tramos = [{ id: "a", nombre: "Tokio", desde: "2026-12-01", divisa: "JPY" }];
  assert.equal(destinoDelViaje({ tramos, gastos: [] }, { aqui: "EUR", from: "USD" }), "JPY");
  const gastos = [{ from: "EUR" }, { from: "THB" }, { from: "THB" }, { from: "USD" }];
  assert.equal(destinoDelViaje({ gastos }, { aqui: "EUR", from: "GBP" }), "THB");
  assert.equal(destinoDelViaje({ gastos: [{ from: "EUR" }] }, { aqui: "EUR", from: "GBP" }), "GBP");
  assert.equal(destinoDelViaje({ gastos: [] }, { aqui: "EUR", from: "EUR" }), null);
  assert.equal(destinoDelViaje(null, { aqui: "EUR" }), null);
});

test("marcar y desmarcar", () => {
  let listo = marcarListo(undefined, "visado");
  assert.deepEqual(listo, ["visado"]);
  listo = marcarListo(listo, "roaming");
  assert.deepEqual(listo, ["visado", "roaming"]);
  assert.deepEqual(marcarListo(listo, "visado"), ["roaming"]);
});

test("lo marcado que ya no sale no cuenta", () => {
  const cosas = antesDeSalir("PLN", "EUR");
  assert.deepEqual(progresoMaleta(cosas, ["visado", "adaptador"]), { hechas: 1, total: 3 });
  assert.deepEqual(progresoMaleta(cosas, undefined), { hechas: 0, total: 3 });
});

test("lo guardado raro se limpia, y los viajes de antes salen sin lista", () => {
  assert.deepEqual(leerListo(["visado", "visado", 3, "", "Con espacios", null]), ["visado"]);
  assert.deepEqual(leerListo("visado"), []);
  const viajes = leerViajes({ activo: "a", lista: [{ id: "a", nombre: "Japón", gastos: [] }, { id: "b", nombre: "Roma", gastos: [], listo: ["visado"] }] });
  assert.equal("listo" in viajes.lista[0], false);
  assert.deepEqual(viajes.lista[1].listo, ["visado"]);
});
