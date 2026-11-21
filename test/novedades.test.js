const { test } = require("node:test");
const assert = require("node:assert");
const { NOVEDADES, compararVersiones, novedadesDesde, versionVistaAlInstalar } = require("../logica.js");
const { TEXTOS } = require("../textos.js");
const manifest = require("../manifest.json");

test("las versiones se comparan por números, no por letras", () => {
  assert.equal(compararVersiones("1.10.0", "1.9.0"), 1);
  assert.equal(compararVersiones("1.0.0", "1.1.0"), -1);
  assert.equal(compararVersiones("1.1", "1.1.0"), 0);
  assert.equal(compararVersiones("2", "1.9.9"), 1);
});

test("viniendo de una versión anterior, sale lo nuevo", () => {
  const nuevas = novedadesDesde("1.0.0", "1.1.0");
  assert.equal(nuevas.length, 1);
  assert.equal(nuevas[0].version, "1.1.0");
  assert.ok(nuevas[0].claves.length > 0);
});

test("si ya la has visto, o no sé de cuál vienes, nada", () => {
  assert.deepEqual(novedadesDesde("1.1.0", "1.1.0"), []);
  assert.deepEqual(novedadesDesde(undefined, "1.1.0"), []);
  assert.deepEqual(novedadesDesde("la de ayer", "1.1.0"), []);
  assert.deepEqual(novedadesDesde("1.0.0", "1.0.5"), [], "lo de una versión que aún no tienes no sale");
});

test("recién instalada no hay novedades: la vista es la de ahora", () => {
  assert.equal(versionVistaAlInstalar({ reason: "install" }, undefined, "1.1.0"), "1.1.0");
});

test("al actualizar, la vista es la que tenías", () => {
  assert.equal(versionVistaAlInstalar({ reason: "update", previousVersion: "1.0.0" }, undefined, "1.1.0"), "1.0.0");
  assert.equal(versionVistaAlInstalar({ reason: "update" }, undefined, "1.1.0"), "1.1.0");
});

test("si ya estaba apuntada, no la piso", () => {
  assert.equal(versionVistaAlInstalar({ reason: "update", previousVersion: "1.0.0" }, "1.1.0", "1.1.0"), null);
  assert.equal(versionVistaAlInstalar({ reason: "chrome_update" }, undefined, "1.1.0"), null);
});

test("cada novedad está escrita en los dos idiomas", () => {
  for (const { claves } of NOVEDADES) {
    for (const clave of claves) {
      assert.ok(TEXTOS.es[clave], `es: ${clave}`);
      assert.ok(TEXTOS.en[clave], `en: ${clave}`);
    }
  }
});

test("no anuncio una versión que el manifest todavía no tiene", () => {
  for (const { version } of NOVEDADES) assert.ok(compararVersiones(version, manifest.version) <= 0, version);
});
