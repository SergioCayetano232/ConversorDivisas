const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { TROZOS } = require("../logica.js");

const raiz = path.join(__dirname, "..");
const cargados = (texto) => [...texto.matchAll(/logica\/(\w+)\.js/g)].map((m) => m[1]);

test("cada trozo de la lógica existe, y no sobra ninguno en la carpeta", () => {
  const enCarpeta = fs.readdirSync(path.join(raiz, "logica")).map((f) => f.replace(/\.js$/, "")).sort();
  assert.deepEqual(enCarpeta, [...TROZOS].sort());
});

test("las páginas que usan la lógica cargan todos los trozos, en su orden", () => {
  const paginas = fs.readdirSync(raiz).filter((f) => f.endsWith(".html"));
  let conLogica = 0;
  for (const pagina of paginas) {
    const lista = cargados(fs.readFileSync(path.join(raiz, pagina), "utf8"));
    if (!lista.length) continue;
    conLogica++;
    assert.deepEqual(lista, TROZOS, pagina);
  }
  assert.ok(conLogica >= 7, "el popup, la copia, el resumen…");
});

test("el service worker también, que es el que no avisa si falta uno", () => {
  const fondo = fs.readFileSync(path.join(raiz, "background.js"), "utf8");
  const lista = fondo.match(/const LOGICA = \[([^\]]*)\]/)[1];
  assert.deepEqual([...lista.matchAll(/"(\w+)"/g)].map((m) => m[1]), TROZOS);
  assert.match(fondo, /importScripts\([^)]*\.\.\.LOGICA\)/);
  // Y a las webs, para los precios de la página, van los mismos.
  assert.match(fondo, /files: \[\.\.\.LOGICA, "precios\.js"\]/);
});

test("ninguna página sigue pidiendo el logica.js entero", () => {
  for (const pagina of fs.readdirSync(raiz).filter((f) => f.endsWith(".html"))) {
    assert.doesNotMatch(fs.readFileSync(path.join(raiz, pagina), "utf8"), /src="logica\.js"/, pagina);
  }
});
