const { test } = require("node:test");
const assert = require("node:assert");
const { PAIS_DE_ZONA, paisDeZona, cambioDePais, mensajeCambioDePais, isValidCode } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

const par = { from: "EUR", to: "USD" };

test("todas las zonas de la tabla existen y dan una divisa que tenemos", () => {
  for (const zona of Object.keys(PAIS_DE_ZONA)) {
    assert.doesNotThrow(() => new Intl.DateTimeFormat("en", { timeZone: zona }), zona);
    assert.ok(isValidCode(paisDeZona(zona)?.divisa), zona);
  }
});

test("de la zona al país y su divisa", () => {
  assert.deepEqual(paisDeZona("Asia/Tokyo"), { region: "JP", divisa: "JPY" });
  assert.deepEqual(paisDeZona("Asia/Ho_Chi_Minh"), { region: "VN", divisa: "VND" });
  assert.deepEqual(paisDeZona("America/Los_Angeles"), { region: "US", divisa: "USD" });
  assert.equal(paisDeZona("Antarctica/Troll"), null);
  assert.equal(paisDeZona(undefined), null);
});

test("al aterrizar en otro país con otra divisa, propone su par a la tuya", () => {
  assert.deepEqual(cambioDePais({ zona: "Asia/Tokyo", antes: "Europe/Madrid", par, casa: "EUR" }),
    { guardar: "Asia/Tokyo", aviso: { region: "JP", from: "JPY", to: "EUR" } });
  // De un país del viaje a otro, a tu divisa y no a la del anterior.
  assert.deepEqual(cambioDePais({ zona: "Asia/Seoul", antes: "Asia/Tokyo", par: { from: "JPY", to: "EUR" }, casa: "EUR" }).aviso,
    { region: "KR", from: "KRW", to: "EUR" });
});

test("sin aviso: la primera vez, misma zona, misma divisa, de vuelta a casa o con el par ya puesto", () => {
  const callado = (datos) => assert.equal(cambioDePais({ par, casa: "EUR", ...datos })?.aviso ?? null, null);
  callado({ zona: "Asia/Tokyo", antes: undefined });
  callado({ zona: "Asia/Tokyo", antes: "Asia/Tokyo" });
  callado({ zona: "Europe/Paris", antes: "Europe/Madrid" });
  callado({ zona: "Europe/Madrid", antes: "Asia/Tokyo" });
  callado({ zona: "Asia/Tokyo", antes: "Europe/Madrid", par: { from: "JPY", to: "EUR" } });
  callado({ zona: "Antarctica/Troll", antes: "Europe/Madrid" });
  // Aunque no avise, se queda con la zona nueva para la próxima.
  assert.equal(cambioDePais({ zona: "Asia/Tokyo", antes: undefined, par, casa: "EUR" }).guardar, "Asia/Tokyo");
  assert.equal(cambioDePais({ zona: "Asia/Tokyo", antes: "Asia/Tokyo", par, casa: "EUR" }), null);
});

test("el mensaje, con el país y su bandera", () => {
  ponerIdioma("es");
  assert.deepEqual(mensajeCambioDePais({ region: "JP", from: "JPY", to: "EUR" }),
    { titulo: "¿Estás en Japón? 🇯🇵", cuerpo: "Pulsa para poner JPY → EUR y ver lo de allí en tu divisa." });
  ponerIdioma("en");
  assert.equal(mensajeCambioDePais({ region: "GB", from: "GBP", to: "EUR" }).titulo, "Are you in the United Kingdom? 🇬🇧");
  ponerIdioma("es");
});
