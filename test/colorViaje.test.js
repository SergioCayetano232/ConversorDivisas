const { test } = require("node:test");
const assert = require("node:assert");
const { COLORES_VIAJE, leerColorViaje, colorLibre, siguienteColor, leerViajes, crearViaje } = require("../logica.js");

test("los de antes, o con un color que no existe, en dorado", () => {
  assert.equal(leerColorViaje(undefined), "oro");
  assert.equal(leerColorViaje("verde fosforito"), "oro");
  assert.equal(leerColorViaje("lila"), "lila");
  assert.equal(leerViajes({ activo: "j", lista: [{ id: "j", nombre: "J", gastos: [] }] }).lista[0].color, "oro");
});

test("el viaje nuevo coge el primer color libre", () => {
  let viajes = leerViajes({ activo: "j", lista: [{ id: "j", nombre: "Japón", gastos: [] }] });
  viajes = crearViaje(viajes, "l", "Lisboa");
  viajes = crearViaje(viajes, "p", "París");
  assert.deepEqual(viajes.lista.map((v) => v.color), ["oro", "azul", "coral"]);
});

test("se salta los que ya tiene alguien", () => {
  assert.equal(colorLibre([{ color: "azul" }, { color: "oro" }]), "coral");
  const todos = COLORES_VIAJE.map((color) => ({ color }));
  assert.ok(COLORES_VIAJE.includes(colorLibre(todos)), "con todos cogidos, alguno vale");
});

test("pulsando, el siguiente, y después del último, el primero", () => {
  const viajes = { activo: "j", lista: [{ id: "j", color: "oro" }, { id: "l", color: "rosa" }] };
  assert.equal(siguienteColor(viajes, "j").lista[0].color, "azul");
  assert.equal(siguienteColor(viajes, "l").lista[1].color, "oro");
  assert.equal(siguienteColor(viajes, "j").lista[1].color, "rosa", "el otro no se toca");
});
