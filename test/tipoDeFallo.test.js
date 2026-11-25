const { test } = require("node:test");
const assert = require("node:assert");
const { tipoDeFallo, errorMessageFor } = require("../logica.js");

const abortado = Object.assign(new Error("tarde"), { name: "AbortError" });

test("cada fallo con su tipo", () => {
  assert.equal(tipoDeFallo(abortado, true), "tiempo");
  assert.equal(tipoDeFallo(new Error("Failed to fetch"), false), "sinRed");
  assert.equal(tipoDeFallo(new Error("HTTP 503"), true), "servicio");
  assert.equal(tipoDeFallo(new Error("Failed to fetch"), true), "otro");
});

test("si tarda demasiado es eso, aunque además se haya ido la red", () => {
  assert.equal(tipoDeFallo(abortado, false), "tiempo");
});

test("sin red y con la tasa guardada no lo cuenta como un error", () => {
  const fallo = new Error("Failed to fetch");
  assert.equal(errorMessageFor(fallo, false, false), "Sin conexión a internet.");
  assert.equal(errorMessageFor(fallo, true, false), "Sin conexión. Sigo con la tasa guardada.");
  assert.equal(errorMessageFor(new Error("HTTP 500"), true, true), "El servicio de tasas no responde.");
});
