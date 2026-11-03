const { test } = require("node:test");
const assert = require("node:assert");
const { leerMah, convertirMah, textoMah } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

test("lee los mAh, con el voltaje o sin él", () => {
  assert.deepEqual(leerMah("20000 mah"), { mah: 20000, voltios: 3.7 });
  assert.deepEqual(leerMah("20000mAh"), { mah: 20000, voltios: 3.7 });
  assert.deepEqual(leerMah("20000 mah a 5v"), { mah: 20000, voltios: 5 });
  assert.deepEqual(leerMah("10000 mAh @3,85V"), { mah: 10000, voltios: 3.85 });
});

test("lo que no es una batería, nada", () => {
  assert.equal(leerMah("0 mah"), null);
  assert.equal(leerMah("mah"), null);
  assert.equal(leerMah("100 wh"), null);
  assert.equal(leerMah("100 mbps"), null);
  assert.equal(leerMah("5000 mah a 0v"), null);
});

test("a 3,7 V, 20.000 mAh son 74 Wh", () => {
  assert.ok(Math.abs(convertirMah({ mah: 20000, voltios: 3.7 }).wh - 74) < 1e-9);
});

test("hasta 100 Wh, libre; hasta 160, con permiso; más, no", () => {
  assert.equal(convertirMah({ mah: 27000, voltios: 3.7 }).avion, "libre");
  assert.equal(convertirMah({ mah: 20000, voltios: 5 }).avion, "libre");
  assert.equal(convertirMah({ mah: 30000, voltios: 3.7 }).avion, "permiso");
  assert.equal(convertirMah({ mah: 43000, voltios: 3.7 }).avion, "permiso");
  assert.equal(convertirMah({ mah: 45000, voltios: 3.7 }).avion, "no");
});

test("el texto", () => {
  ponerIdioma("es");
  assert.equal(textoMah(leerMah("20000 mah")), "20.000 mAh = 74 Wh · ✅ Puede ir en cabina, nunca facturada");
  assert.equal(textoMah(leerMah("30000 mah")), "30.000 mAh = 111 Wh · ⚠️ Solo con permiso de la aerolínea, como mucho dos");
  assert.equal(textoMah(leerMah("45000 mah")), "45.000 mAh = 166,5 Wh · ⛔ No puede subir al avión");
  ponerIdioma("en");
  assert.equal(textoMah(leerMah("5000 mah")), "5,000 mAh = 18.5 Wh · ✅ OK in the cabin, never in checked bags");
  ponerIdioma("es");
  assert.equal(textoMah(null), "");
});
