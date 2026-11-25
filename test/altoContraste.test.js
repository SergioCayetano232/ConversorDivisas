const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { contraste } = require("../logica.js");

// Las dos paletas de alto contraste, sacadas tal cual del CSS.
const css = fs.readFileSync(path.join(__dirname, "..", "popup.css"), "utf8");
const bloque = css.slice(css.indexOf("/* Alto contraste."));
const paletas = [...bloque.matchAll(/:root \{([^}]*)\}/g)].slice(0, 2).map(([, cuerpo]) =>
  Object.fromEntries([...cuerpo.matchAll(/--([a-z-]+): (#[0-9A-F]{6});/g)].map(([, nombre, color]) => [nombre, color])));

test("la cuenta de la WCAG: negro y blanco 21, iguales 1", () => {
  assert.equal(Math.round(contraste("#000000", "#FFFFFF")), 21);
  assert.equal(contraste("#777777", "#777777"), 1);
  // El gris de toda la vida, justo por encima del 4,5 del AA.
  assert.ok(Math.abs(contraste("#767676", "#FFFFFF") - 4.54) < 0.01);
});

test("están las dos paletas, la oscura y la clara", () => {
  assert.equal(paletas.length, 2);
  for (const p of paletas) assert.ok(p.graphite && p.mist && p.muted && p.brass && p.cinnabar && p.jade);
});

for (const [nombre, p] of [["oscuro", paletas[0]], ["claro", paletas[1]]]) {
  test(`en ${nombre}, todo el texto por encima de 7:1 sobre el fondo`, () => {
    for (const color of ["mist", "muted", "brass", "cinnabar", "jade"]) {
      const c = contraste(p[color], p.graphite);
      assert.ok(c >= 7, `${color} ${p[color]} sobre ${p.graphite}: ${c.toFixed(2)}`);
    }
  });
}
