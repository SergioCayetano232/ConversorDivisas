const { test } = require("node:test");
const assert = require("node:assert");
const { auroraBandera, legibleSobre, mezclarHex, contraste, AURORA_CONTRASTE, COLORES_BANDERA } = require("../logica.js");

const OSCURO = "#0B0E13";
const CLARO = "#F4F1EA";

test("mezclar va de un color al otro", () => {
  assert.equal(mezclarHex("#000000", "#ffffff", 0), "#000000");
  assert.equal(mezclarHex("#000000", "#ffffff", 1), "#ffffff");
  assert.equal(mezclarHex("#000000", "#ffffff", 0.5), "#808080");
});

test("un color que ya se lee no se toca", () => {
  assert.equal(legibleSobre("#FFCC00", OSCURO), "#ffcc00");
});

test("el azul marino se aclara en oscuro y el amarillo se oscurece en claro", () => {
  const azul = legibleSobre("#00008B", OSCURO);
  assert.notEqual(azul, "#00008b");
  assert.ok(contraste(azul, OSCURO) >= AURORA_CONTRASTE);
  const amarillo = legibleSobre("#FFCC00", CLARO);
  assert.ok(contraste(amarillo, CLARO) >= AURORA_CONTRASTE);
});

test("todas las banderas se leen en los dos temas", () => {
  for (const code of Object.keys(COLORES_BANDERA)) {
    for (const fondo of [OSCURO, CLARO]) {
      for (const c of auroraBandera(code, fondo)) assert.ok(contraste(c, fondo) >= AURORA_CONTRASTE, `${code} ${c} sobre ${fondo}`);
    }
  }
});

test("sin bandera no hay colores", () => {
  assert.deepEqual(auroraBandera("XXX", OSCURO), []);
});
