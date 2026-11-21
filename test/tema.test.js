const { test } = require("node:test");
const assert = require("node:assert");
const { TEMAS, leerTema, MEDIA_CLARO, mediaDeTema } = require("../tema.js");
const { limpiarCopia, limpiarSync } = require("../logica.js");
const { TEXTOS } = require("../textos.js");

test("lo que no es un tema es el automático", () => {
  assert.equal(leerTema("claro"), "claro");
  assert.equal(leerTema("oscuro"), "oscuro");
  assert.equal(leerTema("auto"), "auto");
  assert.equal(leerTema(undefined), "auto", "los que vienen de antes no tienen nada guardado");
  assert.equal(leerTema("dark"), "auto");
  assert.equal(leerTema(null), "auto");
});

test("el claro a mano enciende sus estilos siempre, y el oscuro nunca", () => {
  assert.equal(mediaDeTema("claro"), "all");
  assert.equal(mediaDeTema("oscuro"), "not all");
});

test("en automático la regla vuelve a preguntar al sistema", () => {
  assert.equal(mediaDeTema("auto"), MEDIA_CLARO);
  assert.equal(mediaDeTema(undefined), MEDIA_CLARO);
  assert.equal(mediaDeTema("rosa"), MEDIA_CLARO);
});

test("el tema va en la copia y a tus otros ordenadores", () => {
  assert.equal(limpiarCopia({ tema: "oscuro" }).tema, "oscuro");
  assert.equal("tema" in limpiarCopia({ tema: "rosa" }), false);
  assert.equal("tema" in limpiarCopia({}), false);
  assert.deepEqual(limpiarSync({ tema: "claro" }), { tema: "claro" });
});

test("cada tema tiene su nombre en el menú, en los dos idiomas", () => {
  for (const tema of TEMAS) {
    assert.ok(TEXTOS.es[`menu.tema.${tema}`], tema);
    assert.ok(TEXTOS.en[`menu.tema.${tema}`], tema);
  }
});

test("el CSS sigue escribiendo el claro como lo busco", () => {
  const fs = require("node:fs");
  for (const hoja of ["popup.css", "copia.css"]) {
    assert.ok(fs.readFileSync(`${__dirname}/../${hoja}`, "utf8").includes(`@media ${MEDIA_CLARO}`), hoja);
  }
});
