const { test } = require("node:test");
const assert = require("node:assert");
const { restoReedSolomon, formatoQR, versionQR, bytesDeDatosQR, codigoQR, svgQR } = require("../logica.js");

test("Reed-Solomon con el ejemplo de siempre (HELLO WORLD, 1-M)", () => {
  const datos = [32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17];
  assert.deepEqual(restoReedSolomon(datos, 10), [196, 35, 39, 119, 235, 215, 231, 226, 93, 23]);
});

test("los bits de formato del nivel M, de la tabla de la norma", () => {
  assert.equal(formatoQR(0).toString(2).padStart(15, "0"), "101010000010010");
  assert.equal(formatoQR(2).toString(2).padStart(15, "0"), "101111001111100");
  assert.equal(formatoQR(3).toString(2).padStart(15, "0"), "101101101001011");
  assert.equal(formatoQR(5).toString(2).padStart(15, "0"), "100000011001110");
  assert.equal(formatoQR(7).toString(2).padStart(15, "0"), "100101010100000");
});

test("los de versión, también de la tabla", () => {
  assert.equal(versionQR(7), 0x07c94);
  assert.equal(versionQR(40), 0x28c69);
});

test("lo que cabe en cada versión con nivel M", () => {
  assert.equal(bytesDeDatosQR(1), 16);
  assert.equal(bytesDeDatosQR(10), 216);
  assert.equal(bytesDeDatosQR(40), 2334);
});

test("elige la versión más pequeña en la que cabe", () => {
  assert.equal(codigoQR("HOLA").version, 1);
  assert.equal(codigoQR("HOLA").lado, 21);
  // 14 bytes caben en la 1 (16 menos la cabecera); 15 ya no.
  assert.equal(codigoQR("a".repeat(14)).version, 1);
  assert.equal(codigoQR("a".repeat(15)).version, 2);
  // Las tildes y los emojis ocupan más de un byte.
  assert.equal(codigoQR("ñ".repeat(7)).version, 1);
  assert.equal(codigoQR("ñ".repeat(8)).version, 2);
});

test("los localizadores y la línea de tiempo en su sitio", () => {
  const { modulos: m, lado } = codigoQR("🇯🇵 Japón: 412,30 EUR");
  for (const [x, y] of [[0, 0], [lado - 7, 0], [0, lado - 7]]) {
    assert.equal(m[y][x], true);
    assert.equal(m[y + 1][x + 1], false);
    assert.equal(m[y + 3][x + 3], true);
  }
  for (let i = 8; i < lado - 8; i += 1) assert.equal(m[6][i], i % 2 === 0);
  assert.equal(m[lado - 8][8], true, "el módulo oscuro de siempre");
});

test("de la 7 en adelante lleva la versión dibujada", () => {
  // En la 7 caben 124 bytes con nivel M: 120 y su cabecera, justo.
  const qr = codigoQR("x".repeat(120));
  assert.equal(qr.version, 7);
  const bits = versionQR(7);
  for (let i = 0; i < 18; i += 1) assert.equal(qr.modulos[Math.floor(i / 3)][qr.lado - 11 + (i % 3)], ((bits >>> i) & 1) === 1);
});

test("demasiado largo, null", () => {
  assert.equal(codigoQR("x".repeat(2331)).version, 40);
  assert.equal(codigoQR("x".repeat(2332)), null);
});

test("el SVG lleva el margen blanco y las rachas juntas", () => {
  const svg = svgQR(codigoQR("HOLA"));
  assert.match(svg, /viewBox="0 0 29 29"/);
  // La primera fila empieza por siete negros seguidos: el localizador.
  assert.match(svg, /M4 4h7v1h-7z/);
});

test("el resumen del viaje en QR, y sin los días si es muy largo", () => {
  const { resumenParaQR, crearGasto, QR_VERSION_MAX } = require("../logica.js");
  require("../textos.js").ponerIdioma("es");
  const gastos = (dias) => Array.from({ length: dias * 3 }, (_, i) => crearGasto({
    id: `g${i}`, from: "JPY", to: "EUR", cantidad: 1000 + i, valor: 6 + i / 100, concepto: "Cena", categoria: "comida",
    cuando: new Date(2026, 9, 1 + (i % dias), 13).getTime(),
  }));
  const corto = resumenParaQR({ nombre: "Lisboa", gastos: gastos(4), presupuesto: null, personas: 1 }, "2026-11-19");
  assert.equal(corto.sinDias, false);
  assert.match(corto.texto, /Por días/);
  const largo = resumenParaQR({ nombre: "Vuelta al mundo", gastos: gastos(60), presupuesto: null, personas: 1 }, "2026-11-19");
  assert.equal(largo.sinDias, true);
  assert.doesNotMatch(largo.texto, /Por días/);
  assert.ok(largo.qr.version <= QR_VERSION_MAX);
});
