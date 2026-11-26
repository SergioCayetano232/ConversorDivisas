const { test, beforeEach } = require("node:test");
const assert = require("node:assert");
const { matasellos, MATASELLOS_LARGO } = require("../logica.js");
const { ponerIdioma } = require("../textos.js");

beforeEach(() => ponerIdioma("es"));

test("el sitio en mayúsculas y sin la bandera", () => {
  assert.equal(matasellos("🇯🇵 Japón", "2026-11-26").lugar, "JAPÓN");
  assert.equal(matasellos("Lisboa ✈️", "2026-11-26").lugar, "LISBOA");
});

test("la fecha del último día, partida como en un sello", () => {
  const m = matasellos("Lisboa", "2026-03-07");
  assert.deepEqual([m.dia, m.mes, m.anio], ["7", "MAR", "2026"]);
});

test("en inglés, el mes en inglés", () => {
  ponerIdioma("en");
  assert.equal(matasellos("Lisboa", "2026-03-07").mes, "MAR");
  assert.equal(matasellos("Lisboa", "2026-06-07").mes, "JUN");
});

test("los nombres largos se cortan, que el anillo no da para más", () => {
  const m = matasellos("Vacaciones de verano en Croacia", "2026-08-01");
  assert.equal([...m.lugar].length, MATASELLOS_LARGO);
  assert.ok(m.lugar.endsWith("…"));
});

test("el anillo lleva el sitio y el nombre de la extensión", () => {
  assert.equal(matasellos("Roma", "2026-05-02").anillo, "ROMA · CONVERSORDIVISAS · ");
});

test("sin sitio o sin fecha no hay matasellos", () => {
  assert.equal(matasellos("🇯🇵", "2026-11-26"), null);
  assert.equal(matasellos("Roma", ""), null);
});

test("las ondas van seguidas, sin saltos, y hacia la izquierda", () => {
  const { ondasMatasellos } = require("../logica.js");
  const rayas = ondasMatasellos();
  assert.equal(rayas.length, 3);
  for (const raya of rayas) {
    raya.slice(1).forEach((t, i) => assert.deepEqual([t.x0, t.y0], [raya[i].x1, raya[i].y1]));
    assert.ok(raya.at(-1).x1 < raya[0].x0);
  }
});
