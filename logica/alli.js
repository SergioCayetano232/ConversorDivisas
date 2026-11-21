// Lo de allí: la propina, el enchufe, el visado, los billetes, la cuenta del
// restaurante y lo que te ofrece la casa de cambio.

// Las propinas de siempre: en Europa poco o nada (el 5 es redondear en el bar),
// en Estados Unidos del 15 al 25, que los datáfonos de allí ya empiezan a
// proponerla. El 18 porque es lo normal allí, y la sugerencia lo pone.
const PROPINAS_RAPIDAS = [0, 5, 10, 15, 18, 20, 25];
const PROPINA_MAX = 30;
const PERSONAS_MAX = 20;
const CUENTA_POR_DEFECTO = { propina: 10, personas: 2, redondear: false };

// Lo que se suele dejar en un restaurante, por la divisa de la cuenta. Es a ojo:
// en el euro cambia de un país a otro, y en Japón o Corea dejarla queda raro.
// La libra, 12,5: es el service charge que ya viene en la cuenta en Reino Unido.
const PROPINA_HABITUAL = {
  USD: 18, CAD: 15, MXN: 10, BRL: 10, GBP: 12.5, EUR: 5, CHF: 5, JPY: 0, KRW: 0, CNY: 0,
  HKD: 10, SGD: 0, AUD: 5, NZD: 5, THB: 5, IDR: 5, INR: 10, PHP: 10, MYR: 0, ZAR: 10,
  ILS: 12, TRY: 10, PLN: 10, CZK: 10, HUF: 10, RON: 10, SEK: 5, NOK: 5, DKK: 5, ISK: 0,
};

const propinaHabitual = (code) => PROPINA_HABITUAL[code] ?? null;

// "cd propina", "cd propina 60" o "cd tip 60 usd": la de allí y, con la cuenta,
// cuánto es. Sin divisa, la de arriba, igual que el enchufe.
const HAY_PROPINA = /^\s*(?:propinas?|tips?)(?:\s+(\d+(?:[.,]\d+)*))?(?:\s+([a-z]{3}))?\s*$/i;

function leerPropina(texto) {
  const m = String(texto ?? "").match(HAY_PROPINA);
  if (!m) return null;
  const code = m[2]?.toUpperCase() ?? null;
  // Una divisa de las que no tengo la propina vale: así dice que no la tengo.
  if (code && !isValidCode(code)) return null;
  const cuenta = m[1] ? leerNumero(m[1]) : null;
  if (m[1] && !(cuenta > 0)) return null;
  return { code, cuenta };
}

function textoPropina(code, cuenta = null) {
  const pct = propinaHabitual(code);
  if (pct === null) return "";
  if (pct === 0) return `${banderaDivisa(code)} ${tr("cuenta.habitualNada")}`;
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const tanto = tr("pct", { n: numeros({ maximumFractionDigits: 2 }).format(pct) });
  // Redondeo la propina antes de sumar, para que la cuenta cuadre al céntimo.
  const propina = Math.round(cuenta * pct) / 100;
  const partes = [cuenta
    ? tr("propina.conCuenta", { pct: tanto, cuenta: dinero.format(cuenta), propina: dinero.format(propina), total: `${dinero.format(cuenta + propina)} ${code}` })
    : tr("propina.habitual", { pct: tanto })];
  if (code === "GBP") partes.push(tr("propina.servicio"));
  return `${banderaDivisa(code)} ${partes.join(" · ")}`;
}

// "cd enchufe jpy": qué enchufe hay allí y si entra el tuyo. Por la divisa, así
// que el euro va con el de casi toda la zona y aviso aparte de los de la G.
// Pongo la C donde el europeo entra aunque no sea el oficial (Suiza, Israel…).
const ENCHUFES = {
  EUR: ["CF", [230]], USD: ["AB", [120]], GBP: ["G", [230]], JPY: ["AB", [100]], CHF: ["CJ", [230]],
  CAD: ["AB", [120]], AUD: ["I", [230]], CNY: ["ACI", [220]], MXN: ["AB", [127]], BRL: ["CN", [127, 220]],
  SEK: ["CF", [230]], NOK: ["CF", [230]], DKK: ["CFK", [230]], PLN: ["CE", [230]], TRY: ["CF", [230]],
  CZK: ["CE", [230]], HKD: ["G", [220]], HUF: ["CF", [230]], IDR: ["CF", [230]], ILS: ["CH", [230]],
  INR: ["CDM", [230]], ISK: ["CF", [230]], KRW: ["CF", [220]], MYR: ["G", [240]], NZD: ["I", [230]],
  PHP: ["ABC", [220]], RON: ["CF", [230]], SGD: ["G", [230]], THB: ["ABCO", [230]], ZAR: ["CMN", [230]],
  VND: ["AC", [220]], ARS: ["CI", [220]], MAD: ["CE", [220]], PEN: ["AC", [220]], COP: ["AB", [120]],
  CLP: ["CL", [220]], EGP: ["CF", [220]], AED: ["G", [230]], TWD: ["AB", [110]], UYU: ["CFIL", [230]],
  CRC: ["AB", [120]], DOP: ["AB", [120]], TND: ["CE", [230]], KES: ["G", [240]], LKR: ["DGM", [230]],
  NPR: ["CDM", [230]], KHR: ["ACG", [230]], JOD: ["CDFGJ", [230]], QAR: ["DG", [240]], SAR: ["G", [230]],
  GEL: ["CF", [220]], RSD: ["CF", [230]], GTQ: ["AB", [120]], PYG: ["C", [220]],
  // En La Paz y El Alto quedan barrios a 115 V; en el resto, 230.
  BOB: ["AC", [115, 230]],
};

const HAY_ENCHUFE = /^\s*(?:enchufes?|plugs?)(?:\s+([a-z]{3}))?\s*$/i;

function leerEnchufe(texto) {
  const m = String(texto ?? "").match(HAY_ENCHUFE);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !ENCHUFES[code] ? null : { code };
}

// De 100 a 127 V y de 220 a 240 son dos mundos: un secador de aquí allí se quema.
const voltajeBajo = (v) => v < 200;

function enchufeDe(alli, aqui) {
  const [tipos, voltios] = ENCHUFES[alli] ?? [];
  if (!tipos) return null;
  const casa = alli === aqui ? null : ENCHUFES[aqui];
  return {
    code: alli,
    tipos: [...tipos],
    voltios,
    entra: casa ? [...casa[0]].some((t) => tipos.includes(t)) : null,
    otroVoltaje: casa ? !voltios.some((v) => casa[1].some((c) => voltajeBajo(c) === voltajeBajo(v))) : false,
  };
}

// "cd emergencias jpy": a qué número llamar allí. Con el euro, el 112 vale en
// toda la zona. En Australia y Sudáfrica el 112 solo va desde el móvil.
const EMERGENCIAS = {
  EUR: [["112", "todo"]], USD: [["911", "todo"]], GBP: [["999", "todo"]], CAD: [["911", "todo"]],
  MXN: [["911", "todo"]], PHP: [["911", "todo"]], HKD: [["999", "todo"]], MYR: [["999", "todo"]],
  NZD: [["111", "todo"]], SEK: [["112", "todo"]], DKK: [["112", "todo"]], PLN: [["112", "todo"]],
  TRY: [["112", "todo"]], CZK: [["112", "todo"]], HUF: [["112", "todo"]], IDR: [["112", "todo"]],
  INR: [["112", "todo"]], ISK: [["112", "todo"]], RON: [["112", "todo"]],
  AUD: [["000", "todo"], ["112", "movil"]],
  JPY: [["110", "policia"], ["119", "ambulanciaBomberos"]],
  KRW: [["112", "policia"], ["119", "ambulanciaBomberos"]],
  SGD: [["999", "policia"], ["995", "ambulanciaBomberos"]],
  CNY: [["110", "policia"], ["120", "ambulancia"], ["119", "bomberos"]],
  BRL: [["190", "policia"], ["192", "ambulancia"], ["193", "bomberos"]],
  NOK: [["112", "policia"], ["113", "ambulancia"], ["110", "bomberos"]],
  ILS: [["100", "policia"], ["101", "ambulancia"], ["102", "bomberos"]],
  THB: [["191", "policia"], ["1669", "ambulancia"], ["199", "bomberos"]],
  CHF: [["112", "todo"], ["144", "ambulancia"]],
  ZAR: [["10111", "policia"], ["10177", "ambulancia"], ["112", "movil"]],
  COP: [["123", "todo"]], UYU: [["911", "todo"]], CRC: [["911", "todo"]], DOP: [["911", "todo"]],
  JOD: [["911", "todo"]], SAR: [["911", "todo"]], PYG: [["911", "todo"]], QAR: [["999", "todo"]],
  KES: [["999", "todo"]], GEL: [["112", "todo"]],
  TWD: [["110", "policia"], ["119", "ambulanciaBomberos"]],
  MAD: [["19", "policia"], ["15", "ambulanciaBomberos"]],
  // En Guatemala la ambulancia la llevan los bomberos voluntarios.
  GTQ: [["110", "policia"], ["122", "ambulanciaBomberos"]],
  VND: [["113", "policia"], ["115", "ambulancia"], ["114", "bomberos"]],
  ARS: [["911", "policia"], ["107", "ambulancia"], ["100", "bomberos"]],
  PEN: [["105", "policia"], ["106", "ambulancia"], ["116", "bomberos"]],
  CLP: [["133", "policia"], ["131", "ambulancia"], ["132", "bomberos"]],
  EGP: [["122", "policia"], ["123", "ambulancia"], ["180", "bomberos"]],
  AED: [["999", "policia"], ["998", "ambulancia"], ["997", "bomberos"]],
  TND: [["197", "policia"], ["190", "ambulancia"], ["198", "bomberos"]],
  LKR: [["119", "policia"], ["1990", "ambulancia"], ["110", "bomberos"]],
  NPR: [["100", "policia"], ["102", "ambulancia"], ["101", "bomberos"]],
  KHR: [["117", "policia"], ["119", "ambulancia"], ["118", "bomberos"]],
  RSD: [["192", "policia"], ["194", "ambulancia"], ["193", "bomberos"]],
  BOB: [["110", "policia"], ["118", "ambulancia"], ["119", "bomberos"]],
};

const HAY_EMERGENCIAS = /^\s*(?:emergencias?|emergency|sos)(?:\s+([a-z]{3}))?\s*$/i;

function leerEmergencias(texto) {
  const m = String(texto ?? "").match(HAY_EMERGENCIAS);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !EMERGENCIAS[code] ? null : { code };
}

function textoEmergencias(code) {
  const telefonos = EMERGENCIAS[code];
  if (!telefonos) return "";
  const lista = telefonos.map(([n, para]) => `${n} ${tr(`emergencias.${para}`)}`).join(" · ");
  return `${banderaDivisa(code)} 🚨 ${lista}`;
}

// "cd agua": si se puede beber la del grifo. En Turquía o Brasil es potable en
// las ciudades, pero fuera de ahí no me la jugaría.
const AGUA = {
  si: ["EUR", "USD", "GBP", "JPY", "CHF", "CAD", "AUD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "ISK",
    "KRW", "NZD", "SGD", "HKD", "ILS", "RON", "AED", "QAR", "UYU", "CLP", "ARS", "RSD", "CRC"],
  ciudades: ["TRY", "BRL", "ZAR", "MYR", "COP", "GEL", "SAR"],
  no: ["CNY", "MXN", "IDR", "INR", "PHP", "THB", "VND", "MAD", "PEN", "EGP", "TWD", "DOP", "TND", "KES",
    "LKR", "NPR", "KHR", "JOD", "BOB", "GTQ", "PYG"],
};

const HAY_AGUA = /^\s*(?:agua|grifo|water)(?:\s+([a-z]{3}))?\s*$/i;

function aguaDe(code) {
  return Object.keys(AGUA).find((k) => AGUA[k].includes(code)) ?? null;
}

function leerAgua(texto) {
  const m = String(texto ?? "").match(HAY_AGUA);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !aguaDe(code) ? null : { code };
}

function textoAgua(code) {
  const agua = aguaDe(code);
  if (!agua) return "";
  return `${banderaDivisa(code)} ${agua === "si" ? "🚰" : "🚱"} ${tr(`agua.${agua}`)}`;
}

// Cómo se dice el precio allí: el idioma de cada divisa para la voz del
// navegador. Con el precio escrito como allí ("￥84,000"), la voz japonesa ya
// dice "hachiman en", sin tablas de números en palabras. El euro no está: no hay
// un idioma del euro.
const IDIOMA_DE_DIVISA = {
  USD: "en-US", GBP: "en-GB", JPY: "ja-JP", CHF: "de-CH", CAD: "en-CA", AUD: "en-AU", CNY: "zh-CN", MXN: "es-MX",
  BRL: "pt-BR", SEK: "sv-SE", NOK: "nb-NO", DKK: "da-DK", PLN: "pl-PL", TRY: "tr-TR", CZK: "cs-CZ", HKD: "zh-HK",
  HUF: "hu-HU", IDR: "id-ID", ILS: "he-IL", INR: "hi-IN", ISK: "is-IS", KRW: "ko-KR", MYR: "ms-MY", NZD: "en-NZ",
  PHP: "fil-PH", RON: "ro-RO", SGD: "en-SG", THB: "th-TH", ZAR: "en-ZA", VND: "vi-VN", ARS: "es-AR", MAD: "ar-MA",
  PEN: "es-PE", COP: "es-CO", CLP: "es-CL", EGP: "ar-EG", AED: "ar-AE", TWD: "zh-TW", UYU: "es-UY", CRC: "es-CR",
  DOP: "es-DO", TND: "ar-TN", KES: "sw-KE", LKR: "si-LK", NPR: "ne-NP", KHR: "km-KH", JOD: "ar-JO", QAR: "ar-QA",
  SAR: "ar-SA", GEL: "ka-GE", RSD: "sr-RS", BOB: "es-BO", GTQ: "es-GT", PYG: "es-PY",
};

// Pasado de cien, sin céntimos: nadie dice "ochenta y cuatro mil yenes con cero".
function paraDecir(cantidad, code) {
  const lang = IDIOMA_DE_DIVISA[code];
  if (!lang || !Number.isFinite(cantidad) || cantidad <= 0) return null;
  const valor = cantidad >= 100 ? Math.round(cantidad) : Math.round(cantidad * 100) / 100;
  const decimales = Number.isInteger(valor) ? 0 : 2;
  const texto = new Intl.NumberFormat(lang, {
    style: "currency", currency: code, minimumFractionDigits: decimales, maximumFractionDigits: decimales,
  }).format(valor);
  return { lang, texto };
}

// Enseñar el precio al vendedor: grande y escrito como allí. Donde se regatea,
// con la frase para pedirlo por ese precio. Solo las que sé decir bien; en el
// resto de mercados (Nepal, Camboya, Kenia…) va en inglés, que lo entienden.
const FRASE_REGATEO = {
  es: "¿Me lo deja en {p}?", en: "Can you do {p}?", zh: "{p}可以吗？", "zh-HK": "{p}得唔得？",
  th: "{p} ได้ไหม", vi: "{p} được không?", id: "Boleh {p}?", ms: "Boleh {p}?", fil: "Pwede ba {p}?",
  tr: "{p} olur mu?", ar: "ممكن {p}؟", hi: "क्या {p} में दे सकते हैं?",
};

function paraEnsenar(cantidad, code) {
  if (!isValidCode(code) || !Number.isFinite(cantidad) || cantidad <= 0) return null;
  const dicho = paraDecir(cantidad, code);
  // Con el euro no hay idioma de allí: en el tuyo.
  const lang = dicho?.lang ?? localeActual();
  const precio = dicho?.texto ?? new Intl.NumberFormat(lang, { style: "currency", currency: code }).format(cantidad);
  const regatea = Object.values(REGATEO).some((r) => r.codes.includes(code));
  const plantilla = regatea ? FRASE_REGATEO[lang] ?? FRASE_REGATEO[lang.split("-")[0]] ?? FRASE_REGATEO.en : null;
  return { precio, lang, rtl: lang.startsWith("ar"), frase: plantilla ? plantilla.replace("{p}", precio) : null };
}

// Las de broma de macOS: "Albert" diciendo un precio suena a robot de feria.
// Chrome las da con el nombre traducido al idioma del sistema y sin ningún id
// fijo, así que van en inglés y en español, que son los idiomas de la extensión.
const VOCES_DE_BROMA = new Set([
  "Albert", "Bad News", "Bahh", "Bells", "Boing", "Bubbles", "Cellos", "Good News", "Jester", "Organ",
  "Superstar", "Trinoids", "Whisper", "Wobble", "Zarvox", "Eddy", "Flo", "Grandma", "Grandpa", "Reed",
  "Rocko", "Sandy", "Shelley", "Fred", "Junior", "Ralph", "Kathy",
  "Malas noticias", "Buenas noticias", "Campanas", "Burbujas", "Violonchelos", "Bufón", "Órgano",
  "Superestrella", "Susurro",
]);

// La voz que más se parezca: la del país, y si no, otra de la misma lengua. De
// esas, las de Google (suenan mejor) y la que el sistema tenga por defecto.
function elegirVoz(voces, lang) {
  if (!Array.isArray(voces) || !lang) return null;
  const norm = (l) => String(l ?? "").replace("_", "-").toLowerCase();
  const nombre = (v) => String(v.name ?? "").split(" (")[0];
  const buenas = voces.filter((v) => !VOCES_DE_BROMA.has(nombre(v)));
  const puntos = (v) => (/google/i.test(v.name) ? 2 : 0) + (v.default ? 1 : 0);
  const mejor = (lista) => lista.reduce((a, b) => (a && puntos(a) >= puntos(b) ? a : b), null);
  const lengua = norm(lang).split("-")[0];
  return mejor(buenas.filter((v) => norm(v.lang) === norm(lang)))
    ?? mejor(buenas.filter((v) => norm(v.lang).split("-")[0] === lengua));
}

// "cd prefijo": el código para llamar allí. El euro no tiene uno, así que van
// los de los países a los que más se viaja. La República Dominicana comparte el +1.
const PREFIJOS = {
  EUR: ["🇪🇸 +34", "🇫🇷 +33", "🇩🇪 +49", "🇮🇹 +39", "🇵🇹 +351", "🇳🇱 +31", "🇬🇷 +30", "🇮🇪 +353"],
  USD: "+1", GBP: "+44", JPY: "+81", CHF: "+41", CAD: "+1", AUD: "+61", CNY: "+86", MXN: "+52",
  BRL: "+55", SEK: "+46", NOK: "+47", DKK: "+45", PLN: "+48", TRY: "+90", CZK: "+420", HKD: "+852",
  HUF: "+36", IDR: "+62", ILS: "+972", INR: "+91", ISK: "+354", KRW: "+82", MYR: "+60", NZD: "+64",
  PHP: "+63", RON: "+40", SGD: "+65", THB: "+66", ZAR: "+27", VND: "+84", ARS: "+54", MAD: "+212",
  PEN: "+51", COP: "+57", CLP: "+56", EGP: "+20", AED: "+971", TWD: "+886", UYU: "+598", CRC: "+506",
  DOP: "+1 809", TND: "+216", KES: "+254", LKR: "+94", NPR: "+977", KHR: "+855", JOD: "+962",
  QAR: "+974", SAR: "+966", GEL: "+995", RSD: "+381", BOB: "+591", GTQ: "+502", PYG: "+595",
};

const HAY_PREFIJO = /^\s*(?:prefijo|prefix|llamar)(?:\s+([a-z]{3}))?\s*$/i;

function leerPrefijo(texto) {
  const m = String(texto ?? "").match(HAY_PREFIJO);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !PREFIJOS[code] ? null : { code };
}

function textoPrefijo(code) {
  const prefijo = PREFIJOS[code];
  if (!prefijo) return "";
  return `${banderaDivisa(code)} 📞 ${[prefijo].flat().join(" · ")}`;
}

// "cd gracias": hola, gracias y la cuenta allí, escrito como suena. Donde se
// habla español o inglés no hace falta tabla, salvo la cuenta de EE. UU., que es "check".
const ESPANOL = ["Hola", "Gracias", "La cuenta, por favor"];
const INGLES = ["Hello", "Thank you", "The bill, please"];
const FRASES = {
  MXN: "es", ARS: "es", PEN: "es", COP: "es", CLP: "es", UYU: "es", CRC: "es", DOP: "es", BOB: "es", GTQ: "es", PYG: "es",
  GBP: "en", AUD: "en", NZD: "en", SGD: "en", ZAR: "en",
  USD: ["Hello", "Thank you", "The check, please"], CAD: ["Hello", "Thank you", "The check, please"],
  JPY: ["Konnichiwa", "Arigatō", "Okaikei onegaishimasu"],
  CHF: ["Grüezi", "Merci", "Zahlen, bitte"],
  CNY: ["Nǐ hǎo", "Xièxie", "Mǎidān"], TWD: ["Nǐ hǎo", "Xièxie", "Mǎidān"],
  HKD: ["Nei hou", "M goi", "Maai daan"],
  BRL: ["Olá", "Obrigado", "A conta, por favor"],
  SEK: ["Hej", "Tack", "Notan, tack"], NOK: ["Hei", "Takk", "Regningen, takk"], DKK: ["Hej", "Tak", "Regningen, tak"],
  ISK: ["Halló", "Takk", "Reikninginn, takk"],
  PLN: ["Dzień dobry", "Dziękuję", "Poproszę rachunek"], CZK: ["Dobrý den", "Děkuji", "Zaplatím, prosím"],
  HUF: ["Jó napot", "Köszönöm", "A számlát, kérem"], RON: ["Bună ziua", "Mulțumesc", "Nota, vă rog"],
  RSD: ["Zdravo", "Hvala", "Račun, molim"], GEL: ["Gamarjoba", "Madloba", "Angarishi, tu sheidzleba"],
  TRY: ["Merhaba", "Teşekkürler", "Hesap, lütfen"],
  ILS: ["Shalom", "Todá", "Heshbón, bevakashá"],
  AED: ["Marhaba", "Shukran", "Al-hisab, min fadlak"], QAR: ["Marhaba", "Shukran", "Al-hisab, min fadlak"],
  SAR: ["Marhaba", "Shukran", "Al-hisab, min fadlak"], JOD: ["Marhaba", "Shukran", "Al-hisab, min fadlak"],
  EGP: ["Ahlan", "Shukran", "El hesab, law samaht"], MAD: ["Salam", "Shukran", "L'hsab, afak"],
  TND: ["Aslema", "Yaishek", "L'addition, s'il vous plaît"],
  INR: ["Namaste", "Dhanyavaad", "Bill dijiye"], NPR: ["Namaste", "Dhanyabad", "Bill dinus"],
  LKR: ["Ayubowan", "Stuti", "Bill eka denna"],
  IDR: ["Halo", "Terima kasih", "Minta bon"], MYR: ["Helo", "Terima kasih", "Minta bil"],
  PHP: ["Kumusta", "Salamat", "Bill po"], KRW: ["Annyeonghaseyo", "Gamsahamnida", "Gyesanhalgeyo"],
  THB: ["Sawasdee", "Khob khun", "Check bin"], VND: ["Xin chào", "Cảm ơn", "Tính tiền"],
  KHR: ["Suostei", "Arkun", "Som kit luy"], KES: ["Jambo", "Asante", "Bili, tafadhali"],
  // El euro no tiene un idioma: solo el gracias de los sitios a los que más se va.
  EUR: ["🇫🇷 Merci", "🇩🇪 Danke", "🇮🇹 Grazie", "🇵🇹 Obrigado", "🇳🇱 Dank je", "🇬🇷 Efcharistó"],
};

const HAY_GRACIAS = /^\s*(?:gracias|hola|frases|thanks|hello)(?:\s+([a-z]{3}))?\s*$/i;

function leerGracias(texto) {
  const m = String(texto ?? "").match(HAY_GRACIAS);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !FRASES[code] ? null : { code };
}

function textoGracias(code) {
  const frases = FRASES[code];
  if (!frases) return "";
  const inicio = `${banderaDivisa(code)} 💬`;
  if (code === "EUR") return `${inicio} 🙏 ${frases.join(" · ")}`;
  if (frases === idiomaActual()) return `${inicio} ${tr(`gracias.${frases}`)}`;
  const lista = typeof frases === "string" ? (frases === "es" ? ESPANOL : INGLES) : frases;
  const [hola, gracias, cuenta] = lista;
  return `${inicio} 👋 ${hola} · 🙏 ${gracias} · 🧾 ${cuenta}`;
}

// "cd cajero": si allí te apañas con la tarjeta o hay que llevar billetes, y lo
// que conviene saber de algunos sitios. "efectivo" no vale de palabra: ya la uso
// al apuntar un gasto desde la barra.
const PAGO_ALLI = {
  tarjeta: ["USD", "GBP", "CHF", "CAD", "AUD", "NZD", "SEK", "NOK", "DKK", "ISK", "PLN", "CZK", "HUF", "RON",
    "KRW", "SGD", "HKD", "ILS", "AED", "QAR", "SAR", "BRL", "CLP", "UYU", "CRC", "TRY", "ZAR", "GEL"],
  mixto: ["EUR", "JPY", "CNY", "MXN", "MYR", "THB", "IDR", "PHP", "INR", "VND", "TWD", "ARS", "PEN", "COP",
    "DOP", "RSD", "JOD", "KES", "LKR", "KHR", "GTQ", "PYG"],
  efectivo: ["MAD", "TND", "EGP", "NPR", "BOB"],
};
const CAJERO_NOTA = new Set(["EUR", "JPY", "CNY", "THB", "VND", "KHR", "KES", "MXN", "SEK", "NOK", "DKK"]);

const HAY_CAJERO = /^\s*(?:cajeros?|atm|pagar)(?:\s+([a-z]{3}))?\s*$/i;

function pagoAlli(code) {
  return Object.keys(PAGO_ALLI).find((k) => PAGO_ALLI[k].includes(code)) ?? null;
}

function leerCajero(texto) {
  const m = String(texto ?? "").match(HAY_CAJERO);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !pagoAlli(code) ? null : { code };
}

function textoCajero(code) {
  const pago = pagoAlli(code);
  if (!pago) return "";
  const icono = { tarjeta: "💳", mixto: "💳💵", efectivo: "💵" }[pago];
  const partes = [tr(`cajero.${pago}`)];
  if (CAJERO_NOTA.has(code)) partes.push(tr(`cajero.nota.${code}`));
  return `${banderaDivisa(code)} ${icono} ${partes.join(" · ")}`;
}

// "cd visado": con pasaporte español, si hace falta y cuántos días te dejan.
// Es de noviembre de 2026 y esto cambia, por eso siempre manda a Exteriores.
// [tipo, días, nombre del permiso que se pide antes por internet]
const VISADOS = {
  EUR: ["dni"], CHF: ["dni"], NOK: ["dni"], ISK: ["dni"], SEK: ["dni"], DKK: ["dni"], PLN: ["dni"],
  CZK: ["dni"], HUF: ["dni"], RON: ["dni"],
  USD: ["permiso", 90, "ESTA"], CAD: ["permiso", 180, "eTA"], GBP: ["permiso", 180, "ETA"],
  AUD: ["permiso", 90, "eVisitor"], NZD: ["permiso", 90, "NZeTA"], ILS: ["permiso", 90, "ETA-IL"],
  KES: ["permiso", 90, "eTA"], LKR: ["permiso", 30, "ETA"],
  JPY: ["libre", 90], CNY: ["libre", 30], MXN: ["libre", 180], BRL: ["libre", 90], TRY: ["libre", 90],
  HKD: ["libre", 90], KRW: ["libre", 90], MYR: ["libre", 90], PHP: ["libre", 30], SGD: ["libre", 90],
  THB: ["libre", 60], ZAR: ["libre", 90], VND: ["libre", 45], ARS: ["libre", 90], MAD: ["libre", 90],
  PEN: ["libre", 90], COP: ["libre", 90], CLP: ["libre", 90], AED: ["libre", 90], TWD: ["libre", 90],
  UYU: ["libre", 90], CRC: ["libre", 180], DOP: ["libre", 30], TND: ["libre", 90], QAR: ["libre", 90],
  GEL: ["libre", 365], RSD: ["libre", 90], BOB: ["libre", 90], GTQ: ["libre", 90], PYG: ["libre", 90],
  IDR: ["llegada", 30], EGP: ["llegada", 30], KHR: ["llegada", 30], JOD: ["llegada", 30], SAR: ["llegada", 90],
  NPR: ["llegada", 90], INR: ["evisa", 30],
};

const HAY_VISADO = /^\s*(?:visados?|visas?)(?:\s+([a-z]{3}))?\s*$/i;

function leerVisado(texto) {
  const m = String(texto ?? "").match(HAY_VISADO);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !VISADOS[code] ? null : { code };
}

function textoVisado(code) {
  const visado = VISADOS[code];
  if (!visado) return "";
  const [tipo, dias, permiso] = visado;
  const partes = [tr(`visado.${tipo}`, { dias, permiso })];
  // Dentro de Schengen y la UE no hay nada que comprobar.
  if (tipo !== "dni") partes.push(tr("visado.comprueba"));
  return `${banderaDivisa(code)} 🛂 ${partes.join(" · ")}`;
}

// "cd roaming": si allí vale el roaming de la UE. Reino Unido y Suiza los pongo
// aparte porque muchas compañías los meten en la tarifa, pero no todas.
const ROAMING = {
  ue: ["EUR", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "ISK", "RON"],
  cerca: ["GBP", "CHF"],
};

const HAY_ROAMING = /^\s*(?:roaming|esim|e-sim)(?:\s+([a-z]{3}))?\s*$/i;

function leerRoaming(texto) {
  const m = String(texto ?? "").match(HAY_ROAMING);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !isValidCode(code) ? null : { code };
}

function textoRoaming(code) {
  if (!isValidCode(code)) return "";
  const tipo = Object.keys(ROAMING).find((k) => ROAMING[k].includes(code)) ?? "fuera";
  const partes = [tr(`roaming.${tipo}`)];
  // Con el euro se cuela Andorra, que no está en la UE y te cobran.
  if (code === "EUR") partes.push(tr("roaming.andorra"));
  return `${banderaDivisa(code)} ${tipo === "ue" ? "📶" : "📵"} ${partes.join(" · ")}`;
}

// "cd sanitaria": si vale la Tarjeta Sanitaria Europea. Sirve en la UE, el EEE,
// Suiza y Reino Unido; en el resto no queda otra que el seguro de viaje.
const CON_TSE = new Set(["EUR", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "ISK", "RON", "CHF", "GBP"]);

const HAY_SANITARIA = /^\s*(?:sanitaria|sanidad|tse|ehic|seguro|m[eé]dico|health)(?:\s+([a-z]{3}))?\s*$/i;

function leerSanitaria(texto) {
  const m = String(texto ?? "").match(HAY_SANITARIA);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !isValidCode(code) ? null : { code };
}

function textoSanitaria(code) {
  if (!isValidCode(code)) return "";
  const partes = [tr(CON_TSE.has(code) ? "sanitaria.tse" : "sanitaria.seguro")];
  if (code === "EUR") partes.push(tr("sanitaria.andorra"));
  // Allí una urgencia sin seguro te puede costar miles.
  if (code === "USD") partes.push(tr("sanitaria.caro"));
  return `${banderaDivisa(code)} 🏥 ${partes.join(" · ")}`;
}

// "cd taxi": las apps que funcionan allí. Es de noviembre de 2026; estas cambian
// mucho de un año a otro (Uber se fue de Hungría y Dinamarca, por ejemplo).
const APPS_TAXI = {
  EUR: ["Uber", "Bolt", "FreeNow"], USD: ["Uber", "Lyft"], GBP: ["Uber", "Bolt", "FreeNow"],
  JPY: ["GO", "Uber"], CHF: ["Uber"], CAD: ["Uber", "Lyft"], AUD: ["Uber", "DiDi"],
  CNY: ["DiDi"], MXN: ["Uber", "DiDi"], BRL: ["Uber", "99"], SEK: ["Uber", "Bolt"], NOK: ["Uber", "Bolt"],
  DKK: ["Dantaxi", "Viggo"], PLN: ["Uber", "Bolt", "FreeNow"], TRY: ["BiTaksi", "Uber"],
  CZK: ["Uber", "Bolt", "Liftago"], HKD: ["Uber", "HKTaxi"], HUF: ["Bolt", "Főtaxi"],
  IDR: ["Grab", "Gojek"], ILS: ["Gett"], INR: ["Uber", "Ola"], ISK: ["Hreyfill"], KRW: ["Kakao T", "Uber"],
  MYR: ["Grab"], NZD: ["Uber"], PHP: ["Grab"], RON: ["Uber", "Bolt"], SGD: ["Grab", "Gojek"],
  THB: ["Grab", "Bolt"], ZAR: ["Uber", "Bolt"], VND: ["Grab", "Xanh SM"], ARS: ["Uber", "Cabify", "DiDi"],
  MAD: ["inDrive", "Heetch"], PEN: ["Uber", "Cabify", "DiDi"], COP: ["Uber", "DiDi", "Cabify"],
  CLP: ["Uber", "Cabify", "DiDi"], EGP: ["Uber", "Careem"], AED: ["Careem", "Uber"], TWD: ["Uber", "55688"],
  UYU: ["Uber", "Cabify"], CRC: ["Uber", "DiDi"], DOP: ["Uber"], TND: ["Bolt"], KES: ["Uber", "Bolt"],
  LKR: ["PickMe", "Uber"], NPR: ["Pathao", "inDrive"], KHR: ["Grab", "PassApp"], JOD: ["Careem", "Uber"],
  QAR: ["Uber", "Karwa"], SAR: ["Uber", "Careem"], GEL: ["Bolt"], RSD: ["CarGo"], BOB: ["inDrive", "Yango"],
  GTQ: ["Uber", "inDrive"], PYG: ["Bolt", "Uber"],
};

const HAY_TAXI = /^\s*(?:taxis?|cab|rides?)(?:\s+([a-z]{3}))?\s*$/i;

function leerTaxi(texto) {
  const m = String(texto ?? "").match(HAY_TAXI);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !APPS_TAXI[code] ? null : { code };
}

function textoTaxi(code) {
  const apps = APPS_TAXI[code];
  if (!apps) return "";
  return `${banderaDivisa(code)} 🚕 ${tr("taxi.apps", { apps: apps.join(", ") })}`;
}

// "cd regatear": si allí se regatea y, con un precio, por cuánto empezar y dónde
// suele quedar. Donde se regatea mucho piden el doble o más; en los mercados de
// Tailandia o México, algo menos.
const REGATEO = {
  mucho: { codes: ["MAD", "EGP", "TND", "INR", "NPR", "KHR", "VND", "JOD", "LKR"], empieza: [0.4, 0.5], queda: [0.6, 0.7] },
  mercados: { codes: ["THB", "IDR", "PHP", "MYR", "CNY", "TRY", "MXN", "PEN", "BOB", "GTQ", "KES", "DOP", "COP", "AED", "QAR", "HKD"], empieza: [0.6, 0.7], queda: [0.75, 0.85] },
};

const HAY_REGATEAR = /^\s*(?:regatear|regateo|regatea|haggle|bargain)(?:\s+(\d+(?:[.,]\d+)*))?(?:\s+([a-z]{3}))?\s*$/i;

function leerRegatear(texto) {
  const m = String(texto ?? "").match(HAY_REGATEAR);
  if (!m) return null;
  const code = m[2]?.toUpperCase() ?? null;
  if (code && !isValidCode(code)) return null;
  const precio = m[1] ? leerNumero(m[1]) : null;
  if (m[1] && !(precio > 0)) return null;
  return { code, precio };
}

function textoRegatear(code, precio = null) {
  if (!isValidCode(code)) return "";
  const tipo = Object.keys(REGATEO).find((k) => REGATEO[k].codes.includes(code)) ?? "no";
  const partes = [tr(`regatear.${tipo}`)];
  if (precio && tipo !== "no") {
    // En un puesto nadie regatea céntimos: por encima de 20 lo dejo en redondo.
    const cifra = numeros({ maximumFractionDigits: precio >= 20 ? 0 : 2 });
    const tramo = ([a, b]) => `${cifra.format(precio * a)}-${cifra.format(precio * b)}`;
    const { empieza, queda } = REGATEO[tipo];
    partes.push(tr("regatear.precio", { precio: `${cifra.format(precio)} ${code}`, empieza: tramo(empieza), queda: tramo(queda) }));
  }
  return `${banderaDivisa(code)} 🤝 ${partes.join(" · ")}`;
}

// "cd festivos": los de allí en los próximos 30 días, que es cuando te encuentras
// los bancos y las tiendas cerrados. Solo los nacionales y los que cierra casi todo.
// Las fechas: "12-25" fija, "P-2" días desde Pascua, "O+1" desde la ortodoxa,
// "11/4/4" el cuarto jueves de noviembre (-1, el último) y "L:fitr" las de la tabla.
const FESTIVOS = {
  EUR: [["01-01", "anio"], ["05-01", "trabajo"], ["08-15", "asuncion"], ["11-01", "todos"], ["12-25", "navidad"]],
  USD: [["01-01", "anio"], ["01/1/3", "festivo"], ["05/1/-1", "festivo"], ["07-04", "independencia"], ["09/1/1", "trabajo"], ["11/4/4", "accionGracias"], ["12-25", "navidad"]],
  GBP: [["01-01", "anio"], ["P-2", "viernes"], ["P+1", "lunesPascua"], ["05/1/1", "festivo"], ["05/1/-1", "festivo"], ["08/1/-1", "festivo"], ["12-25", "navidad"], ["12-26", "sanEsteban"]],
  JPY: [["01-01", "anio"], ["01-02", "anio"], ["01-03", "anio"], ["01/1/2", "festivo"], ["02-11", "nacional"], ["02-23", "festivo"], ["03-20", "festivo"], ["04-29", "golden"], ["05-03", "golden"], ["05-04", "golden"], ["05-05", "golden"], ["07/1/3", "festivo"], ["08-11", "festivo"], ["09/1/3", "festivo"], ["09-23", "festivo"], ["10/1/2", "festivo"], ["11-03", "festivo"], ["11-23", "festivo"]],
  CHF: [["01-01", "anio"], ["P-2", "viernes"], ["P+1", "lunesPascua"], ["P+39", "ascension"], ["P+50", "pentecostes"], ["08-01", "nacional"], ["12-25", "navidad"], ["12-26", "sanEsteban"]],
  CAD: [["01-01", "anio"], ["P-2", "viernes"], ["07-01", "nacional"], ["09/1/1", "trabajo"], ["10/1/2", "accionGracias"], ["12-25", "navidad"], ["12-26", "sanEsteban"]],
  AUD: [["01-01", "anio"], ["01-26", "nacional"], ["P-2", "viernes"], ["P+1", "lunesPascua"], ["04-25", "festivo"], ["12-25", "navidad"], ["12-26", "sanEsteban"]],
  CNY: [["01-01", "anio"], ["L:lunar", "lunar"], ["05-01", "trabajo"], ["10-01", "nacional"], ["10-02", "nacional"], ["10-03", "nacional"]],
  MXN: [["01-01", "anio"], ["02/1/1", "festivo"], ["03/1/3", "festivo"], ["P-3", "jueves"], ["P-2", "viernes"], ["05-01", "trabajo"], ["09-16", "independencia"], ["11-02", "muertos"], ["11/1/3", "festivo"], ["12-12", "festivo"], ["12-25", "navidad"]],
  BRL: [["01-01", "anio"], ["P-48", "carnaval"], ["P-47", "carnaval"], ["P-2", "viernes"], ["04-21", "festivo"], ["05-01", "trabajo"], ["P+60", "corpus"], ["09-07", "independencia"], ["10-12", "festivo"], ["11-02", "muertos"], ["11-15", "festivo"], ["11-20", "festivo"], ["12-25", "navidad"]],
  SEK: [["01-01", "anio"], ["01-06", "reyes"], ["P-2", "viernes"], ["P+1", "lunesPascua"], ["05-01", "trabajo"], ["P+39", "ascension"], ["06-06", "nacional"], ["12-24", "nochebuena"], ["12-25", "navidad"], ["12-26", "sanEsteban"]],
  NOK: [["01-01", "anio"], ["P-3", "jueves"], ["P-2", "viernes"], ["P+1", "lunesPascua"], ["05-01", "trabajo"], ["05-17", "nacional"], ["P+39", "ascension"], ["P+50", "pentecostes"], ["12-25", "navidad"], ["12-26", "sanEsteban"]],
  DKK: [["01-01", "anio"], ["P-3", "jueves"], ["P-2", "viernes"], ["P+1", "lunesPascua"], ["P+39", "ascension"], ["P+50", "pentecostes"], ["06-05", "nacional"], ["12-24", "nochebuena"], ["12-25", "navidad"], ["12-26", "sanEsteban"]],
  PLN: [["01-01", "anio"], ["01-06", "reyes"], ["P+1", "lunesPascua"], ["05-01", "trabajo"], ["05-03", "nacional"], ["P+60", "corpus"], ["08-15", "asuncion"], ["11-01", "todos"], ["11-11", "independencia"], ["12-24", "nochebuena"], ["12-25", "navidad"], ["12-26", "sanEsteban"]],
  TRY: [["01-01", "anio"], ["04-23", "festivo"], ["05-01", "trabajo"], ["05-19", "festivo"], ["L:fitr", "fitr"], ["L:adha", "adha"], ["07-15", "festivo"], ["08-30", "festivo"], ["10-29", "nacional"]],
  CZK: [["01-01", "anio"], ["P-2", "viernes"], ["P+1", "lunesPascua"], ["05-01", "trabajo"], ["05-08", "festivo"], ["07-05", "festivo"], ["07-06", "festivo"], ["09-28", "festivo"], ["10-28", "independencia"], ["11-17", "festivo"], ["12-24", "nochebuena"], ["12-25", "navidad"], ["12-26", "sanEsteban"]],
  HKD: [["01-01", "anio"], ["L:lunar", "lunar"], ["P-2", "viernes"], ["P+1", "lunesPascua"], ["05-01", "trabajo"], ["07-01", "festivo"], ["10-01", "nacional"], ["12-25", "navidad"], ["12-26", "sanEsteban"]],
  HUF: [["01-01", "anio"], ["03-15", "nacional"], ["P-2", "viernes"], ["P+1", "lunesPascua"], ["05-01", "trabajo"], ["P+50", "pentecostes"], ["08-20", "nacional"], ["10-23", "nacional"], ["11-01", "todos"], ["12-25", "navidad"], ["12-26", "sanEsteban"]],
  IDR: [["01-01", "anio"], ["L:lunar", "lunar"], ["L:fitr", "fitr"], ["05-01", "trabajo"], ["L:adha", "adha"], ["06-01", "festivo"], ["08-17", "independencia"], ["12-25", "navidad"]],
  ILS: [["L:pesaj", "pesaj"], ["L:roshHashana", "roshHashana"], ["L:yomKipur", "yomKipur"]],
  INR: [["01-26", "nacional"], ["L:holi", "holi"], ["08-15", "independencia"], ["10-02", "festivo"], ["L:diwali", "diwali"]],
  ISK: [["01-01", "anio"], ["P-3", "jueves"], ["P-2", "viernes"], ["P+1", "lunesPascua"], ["P+39", "ascension"], ["P+50", "pentecostes"], ["06-17", "nacional"], ["08/1/1", "festivo"], ["12-24", "nochebuena"], ["12-25", "navidad"], ["12-26", "sanEsteban"], ["12-31", "finDeAnio"]],
  KRW: [["01-01", "anio"], ["L:lunar", "lunar"], ["03-01", "festivo"], ["05-05", "festivo"], ["06-06", "festivo"], ["08-15", "independencia"], ["L:chuseok", "chuseok"], ["10-03", "nacional"], ["10-09", "festivo"], ["12-25", "navidad"]],
  MYR: [["L:lunar", "lunar"], ["L:fitr", "fitr"], ["05-01", "trabajo"], ["L:adha", "adha"], ["08-31", "nacional"], ["09-16", "festivo"], ["L:diwali", "diwali"], ["12-25", "navidad"]],
  NZD: [["01-01", "anio"], ["01-02", "anio"], ["02-06", "nacional"], ["P-2", "viernes"], ["P+1", "lunesPascua"], ["04-25", "festivo"], ["06/1/1", "festivo"], ["10/1/4", "trabajo"], ["12-25", "navidad"], ["12-26", "sanEsteban"]],
  PHP: [["01-01", "anio"], ["P-3", "jueves"], ["P-2", "viernes"], ["L:fitr", "fitr"], ["04-09", "festivo"], ["05-01", "trabajo"], ["06-12", "independencia"], ["08/1/-1", "festivo"], ["11-01", "todos"], ["11-30", "festivo"], ["12-25", "navidad"], ["12-30", "festivo"]],
  RON: [["01-01", "anio"], ["01-02", "anio"], ["01-24", "festivo"], ["O-2", "viernes"], ["O+0", "pascua"], ["O+1", "lunesPascua"], ["05-01", "trabajo"], ["06-01", "festivo"], ["O+50", "pentecostes"], ["08-15", "asuncion"], ["11-30", "festivo"], ["12-01", "nacional"], ["12-25", "navidad"], ["12-26", "sanEsteban"]],
  SGD: [["01-01", "anio"], ["L:lunar", "lunar"], ["P-2", "viernes"], ["L:fitr", "fitr"], ["05-01", "trabajo"], ["L:adha", "adha"], ["08-09", "nacional"], ["L:diwali", "diwali"], ["12-25", "navidad"]],
  THB: [["01-01", "anio"], ["04-06", "festivo"], ["04-13", "songkran"], ["04-14", "songkran"], ["04-15", "songkran"], ["05-01", "trabajo"], ["07-28", "festivo"], ["08-12", "festivo"], ["10-13", "festivo"], ["10-23", "festivo"], ["12-05", "nacional"], ["12-10", "festivo"], ["12-31", "finDeAnio"]],
  ZAR: [["01-01", "anio"], ["03-21", "festivo"], ["P-2", "viernes"], ["P+1", "lunesPascua"], ["04-27", "nacional"], ["05-01", "trabajo"], ["06-16", "festivo"], ["08-09", "festivo"], ["09-24", "festivo"], ["12-16", "festivo"], ["12-25", "navidad"], ["12-26", "sanEsteban"]],
  VND: [["01-01", "anio"], ["L:lunar", "lunar"], ["04-30", "festivo"], ["05-01", "trabajo"], ["09-02", "nacional"]],
  ARS: [["01-01", "anio"], ["P-48", "carnaval"], ["P-47", "carnaval"], ["03-24", "festivo"], ["04-02", "festivo"], ["P-2", "viernes"], ["05-01", "trabajo"], ["05-25", "nacional"], ["06-20", "festivo"], ["07-09", "independencia"], ["12-08", "inmaculada"], ["12-25", "navidad"]],
  MAD: [["01-01", "anio"], ["01-11", "festivo"], ["L:fitr", "fitr"], ["05-01", "trabajo"], ["L:adha", "adha"], ["07-30", "nacional"], ["08-14", "festivo"], ["08-20", "festivo"], ["08-21", "festivo"], ["11-06", "festivo"], ["11-18", "independencia"]],
  PEN: [["01-01", "anio"], ["P-3", "jueves"], ["P-2", "viernes"], ["05-01", "trabajo"], ["06-29", "festivo"], ["07-28", "independencia"], ["07-29", "independencia"], ["08-30", "festivo"], ["10-08", "festivo"], ["11-01", "todos"], ["12-08", "inmaculada"], ["12-25", "navidad"]],
  COP: [["01-01", "anio"], ["P-3", "jueves"], ["P-2", "viernes"], ["05-01", "trabajo"], ["07-20", "independencia"], ["08-07", "festivo"], ["12-08", "inmaculada"], ["12-25", "navidad"]],
  CLP: [["01-01", "anio"], ["P-2", "viernes"], ["P-1", "sabadoSanto"], ["05-01", "trabajo"], ["05-21", "festivo"], ["08-15", "asuncion"], ["09-18", "independencia"], ["09-19", "festivo"], ["11-01", "todos"], ["12-08", "inmaculada"], ["12-25", "navidad"]],
  EGP: [["01-07", "navidadOrtodoxa"], ["01-25", "festivo"], ["L:fitr", "fitr"], ["04-25", "festivo"], ["05-01", "trabajo"], ["L:adha", "adha"], ["06-30", "festivo"], ["07-23", "nacional"], ["10-06", "festivo"]],
  AED: [["01-01", "anio"], ["L:fitr", "fitr"], ["L:adha", "adha"], ["12-02", "nacional"], ["12-03", "nacional"]],
  TWD: [["01-01", "anio"], ["L:lunar", "lunar"], ["02-28", "festivo"], ["04-04", "festivo"], ["10-10", "nacional"]],
  UYU: [["01-01", "anio"], ["01-06", "reyes"], ["P-48", "carnaval"], ["P-47", "carnaval"], ["P-3", "jueves"], ["P-2", "viernes"], ["05-01", "trabajo"], ["07-18", "festivo"], ["08-25", "independencia"], ["12-25", "navidad"]],
  CRC: [["01-01", "anio"], ["P-3", "jueves"], ["P-2", "viernes"], ["04-11", "festivo"], ["05-01", "trabajo"], ["07-25", "festivo"], ["08-15", "festivo"], ["09-15", "independencia"], ["12-25", "navidad"]],
  DOP: [["01-01", "anio"], ["01-06", "reyes"], ["01-21", "festivo"], ["02-27", "independencia"], ["P-2", "viernes"], ["05-01", "trabajo"], ["P+60", "corpus"], ["08-16", "festivo"], ["09-24", "festivo"], ["11-06", "festivo"], ["12-25", "navidad"]],
  TND: [["01-01", "anio"], ["03-20", "independencia"], ["L:fitr", "fitr"], ["04-09", "festivo"], ["05-01", "trabajo"], ["L:adha", "adha"], ["07-25", "festivo"], ["08-13", "festivo"], ["10-15", "festivo"], ["12-17", "festivo"]],
  KES: [["01-01", "anio"], ["P-2", "viernes"], ["P+1", "lunesPascua"], ["L:fitr", "fitr"], ["05-01", "trabajo"], ["06-01", "festivo"], ["10-10", "festivo"], ["10-20", "festivo"], ["12-12", "independencia"], ["12-25", "navidad"], ["12-26", "sanEsteban"]],
  LKR: [["02-04", "independencia"], ["04-13", "anioCingales"], ["04-14", "anioCingales"], ["05-01", "trabajo"], ["12-25", "navidad"]],
  NPR: [["L:diwali", "diwali"], ["09-19", "nacional"]],
  KHR: [["01-01", "anio"], ["01-07", "festivo"], ["04-14", "anioJemer"], ["04-15", "anioJemer"], ["04-16", "anioJemer"], ["05-01", "trabajo"], ["05-14", "festivo"], ["06-18", "festivo"], ["09-24", "festivo"], ["10-15", "festivo"], ["10-29", "festivo"], ["11-09", "independencia"]],
  JOD: [["01-01", "anio"], ["L:fitr", "fitr"], ["05-01", "trabajo"], ["05-25", "independencia"], ["L:adha", "adha"], ["12-25", "navidad"]],
  QAR: [["02/2/2", "festivo"], ["L:fitr", "fitr"], ["L:adha", "adha"], ["12-18", "nacional"]],
  SAR: [["02-22", "festivo"], ["L:fitr", "fitr"], ["L:adha", "adha"], ["09-23", "nacional"]],
  GEL: [["01-01", "anio"], ["01-02", "anio"], ["01-07", "navidadOrtodoxa"], ["01-19", "festivo"], ["03-03", "festivo"], ["03-08", "festivo"], ["04-09", "festivo"], ["O-2", "viernes"], ["O+0", "pascua"], ["O+1", "lunesPascua"], ["05-09", "festivo"], ["05-12", "festivo"], ["05-26", "independencia"], ["08-28", "festivo"], ["10-14", "festivo"], ["11-23", "festivo"]],
  RSD: [["01-01", "anio"], ["01-02", "anio"], ["01-07", "navidadOrtodoxa"], ["02-15", "nacional"], ["02-16", "nacional"], ["O-2", "viernes"], ["O+0", "pascua"], ["O+1", "lunesPascua"], ["05-01", "trabajo"], ["05-02", "trabajo"], ["11-11", "festivo"]],
  BOB: [["01-01", "anio"], ["01-22", "nacional"], ["P-48", "carnaval"], ["P-47", "carnaval"], ["P-2", "viernes"], ["05-01", "trabajo"], ["P+60", "corpus"], ["06-21", "festivo"], ["08-06", "independencia"], ["11-02", "muertos"], ["12-25", "navidad"]],
  GTQ: [["01-01", "anio"], ["P-3", "jueves"], ["P-2", "viernes"], ["P-1", "sabadoSanto"], ["05-01", "trabajo"], ["06-30", "festivo"], ["09-15", "independencia"], ["10-20", "festivo"], ["11-01", "todos"], ["12-25", "navidad"]],
  PYG: [["01-01", "anio"], ["03-01", "festivo"], ["P-3", "jueves"], ["P-2", "viernes"], ["05-01", "trabajo"], ["05-14", "independencia"], ["05-15", "independencia"], ["06-12", "festivo"], ["08-15", "festivo"], ["09-29", "festivo"], ["12-08", "inmaculada"], ["12-25", "navidad"]],
};

// Las que van con la luna no hay forma sencilla de calcularlas. Las del Ramadán y
// el Cordero dependen de cuándo se vea la luna y pueden moverse un día.
// Cuando se acabe la tabla, esas dejan de salir y el resto sigue igual.
const FESTIVOS_LUNA = {
  lunar: ["2026-02-17", "2027-02-06", "2028-01-26"],
  fitr: ["2026-03-20", "2027-03-09", "2028-02-26"],
  adha: ["2026-05-27", "2027-05-16", "2028-05-05"],
  diwali: ["2026-11-08", "2027-10-29", "2028-10-17"],
  holi: ["2026-03-04", "2027-03-22", "2028-03-11"],
  chuseok: ["2026-09-25", "2027-09-15", "2028-10-03"],
  pesaj: ["2026-04-02", "2027-04-22", "2028-04-11"],
  roshHashana: ["2026-09-12", "2027-10-02", "2028-09-21"],
  yomKipur: ["2026-09-21", "2027-10-11", "2028-09-30"],
};

// Lo que no cabe en una fecha: el sabbat en Israel, la luna llena en Sri Lanka.
const FESTIVOS_NOTA = new Set(["EUR", "ILS", "LKR"]);
const FESTIVOS_DIAS = 30;
const FESTIVOS_MAX = 4;

// La ortodoxa, con el calendario juliano y pasada al nuestro (13 días hasta 2099).
function pascuaOrtodoxa(ano) {
  const a = ano % 4, b = ano % 7, c = ano % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const mes = Math.floor((d + e + 114) / 31);
  const dia = ((d + e + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia + 13);
}

function fechaFestivo(regla, ano) {
  if (regla.startsWith("L:")) {
    const fecha = FESTIVOS_LUNA[regla.slice(2)]?.find((f) => f.startsWith(`${ano}-`));
    return fecha ? new Date(ano, Number(fecha.slice(5, 7)) - 1, Number(fecha.slice(8))) : null;
  }
  if (/^[PO][+-]\d+$/.test(regla)) {
    const base = regla[0] === "P" ? domingoDePascua(ano) : pascuaOrtodoxa(ano);
    return new Date(base.getFullYear(), base.getMonth(), base.getDate() + Number(regla.slice(1)));
  }
  const semana = regla.match(/^(\d\d)\/(\d)\/(-?\d)$/);
  if (semana) {
    const [, mes, dia, n] = semana.map(Number);
    if (n < 0) {
      const ultimo = new Date(ano, mes, 0);
      return new Date(ano, mes - 1, ultimo.getDate() - ((ultimo.getDay() - dia + 7) % 7));
    }
    const primero = new Date(ano, mes - 1, 1);
    return new Date(ano, mes - 1, 1 + ((dia - primero.getDay() + 7) % 7) + (n - 1) * 7);
  }
  const [mes, dia] = regla.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

// Los que caen entre hoy y dentro de 30 días, ordenados. Miro también el año
// que viene, que en diciembre la ventana se pasa de enero.
function festivosProximos(code, hoy = new Date(), dias = FESTIVOS_DIAS) {
  const reglas = FESTIVOS[code];
  if (!reglas) return null;
  const desde = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const hasta = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + dias);
  const lista = [];
  for (const ano of [desde.getFullYear(), desde.getFullYear() + 1]) {
    for (const [regla, clave] of reglas) {
      const fecha = fechaFestivo(regla, ano);
      if (fecha && fecha >= desde && fecha <= hasta) lista.push({ fecha: isoLocal(fecha), clave });
    }
  }
  return lista.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

const HAY_FESTIVOS = /^\s*(?:festivos?|fiestas?|holidays?)(?:\s+([a-z]{3}))?\s*$/i;

function leerFestivos(texto) {
  const m = String(texto ?? "").match(HAY_FESTIVOS);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !FESTIVOS[code] ? null : { code };
}

function textoFestivos(code, hoy = new Date()) {
  const lista = festivosProximos(code, hoy);
  if (!lista) return "";
  const formato = fechas({ weekday: "short", day: "numeric", month: "short" });
  const dia = ({ fecha, clave }) => {
    const [a, m, d] = fecha.split("-").map(Number);
    return `${formato.format(new Date(a, m - 1, d)).replace(/\./g, "").replace(",", "")} ${tr(`festivos.${clave}`)}`;
  };
  const partes = [lista.length
    ? tr("festivos.lista", { dias: FESTIVOS_DIAS, lista: lista.slice(0, FESTIVOS_MAX).map(dia).join(", ") })
    : tr("festivos.ninguno", { dias: FESTIVOS_DIAS })];
  if (lista.length > FESTIVOS_MAX) partes[0] += ` ${tr("festivos.mas", { n: lista.length - FESTIVOS_MAX })}`;
  if (FESTIVOS_NOTA.has(code)) partes.push(tr(`festivos.nota.${code}`));
  return `${banderaDivisa(code)} 📅 ${partes.join(" · ")}`;
}

// "cd horario": a qué hora se come y se cena allí y hasta cuándo abren las
// tiendas. [comida, cena, cierre de las tiendas, qué hacen el domingo]
const HORARIOS = {
  EUR: ["12-14", "19-21", "19", "cierra"], USD: ["11:30-13:30", "17:30-20", "21", "abre"], GBP: ["12-14", "18-21", "20", "corto"], JPY: ["11:30-13:30", "18-21", "20", "abre"],
  CHF: ["12-13:30", "18:30-20:30", "18:30", "cierra"], CAD: ["12-13", "17:30-20", "21", "abre"], AUD: ["12-14", "18-20:30", "17", "corto"], CNY: ["11:30-13", "17:30-20", "22", "abre"],
  MXN: ["14-16", "20-22", "21", "abre"], BRL: ["12-14", "20-22", "22", "abre"], SEK: ["11-13", "17-19", "19", "corto"], NOK: ["11-13", "17-19", "18", "cierra"],
  DKK: ["12-13", "18-20", "19", "corto"], PLN: ["13-15", "18-20", "21", "cierra"], TRY: ["12-14", "19-21", "22", "abre"], CZK: ["11:30-13:30", "18-20", "20", "abre"],
  HKD: ["12-14", "19-21", "22", "abre"], HUF: ["12-14", "18-20", "19", "corto"], IDR: ["12-13", "18-20", "22", "abre"], ILS: ["12-14", "19-22", "20", "abre"],
  INR: ["13-15", "20-22:30", "21", "abre"], ISK: ["12-13", "18-20", "18", "corto"], KRW: ["12-13", "18-20", "22", "abre"], MYR: ["12-14", "19-21", "22", "abre"],
  NZD: ["12-14", "18-20:30", "17:30", "corto"], PHP: ["12-13", "19-21", "21", "abre"], RON: ["13-15", "19-21", "20", "corto"], SGD: ["12-14", "18:30-20:30", "22", "abre"],
  THB: ["11:30-13:30", "18-20", "22", "abre"], ZAR: ["12-14", "18:30-20:30", "17", "corto"], VND: ["11-13", "18-20", "22", "abre"], ARS: ["13-15", "21-23", "20", "corto"],
  MAD: ["13-15", "20-22", "21", "abre"], PEN: ["13-15", "19-21", "21", "abre"], COP: ["12-14", "19-21", "20", "abre"], CLP: ["13-15", "20-22", "21", "abre"],
  EGP: ["14-17", "21-23", "23", "abre"], AED: ["13-15", "20-22", "22", "abre"], TWD: ["11:30-13:30", "17:30-19:30", "22", "abre"], UYU: ["13-15", "21-23", "20", "corto"],
  CRC: ["12-13", "18-20", "20", "abre"], DOP: ["12-14", "19-21", "21", "corto"], TND: ["12:30-14:30", "20-22", "20", "corto"], KES: ["13-14", "19-21", "19", "corto"],
  LKR: ["12-14", "19:30-21:30", "20", "abre"], NPR: ["10-11", "19-21", "20", "abre"], KHR: ["11-13", "18-20", "21", "abre"], JOD: ["14-16", "20-22", "22", "abre"],
  QAR: ["13-15", "20-22", "22", "abre"], SAR: ["13-15", "21-23", "23", "abre"], GEL: ["13-15", "20-22", "21", "abre"], RSD: ["13-15", "19-21", "21", "corto"],
  BOB: ["12-14", "19-21", "20", "corto"], GTQ: ["12-14", "19-21", "19", "corto"], PYG: ["12-14", "20-22", "20", "corto"],
};

// Lo que cambia el resto: el sabbat, el sábado de Nepal, los rezos en Arabia.
const HORARIO_NOTA = new Set(["EUR", "ILS", "NPR", "SAR"]);

const HAY_HORARIO = /^\s*(?:horarios?|cenar|comer|hours)(?:\s+([a-z]{3}))?\s*$/i;

function leerHorario(texto) {
  const m = String(texto ?? "").match(HAY_HORARIO);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !HORARIOS[code] ? null : { code };
}

function textoHorario(code) {
  const horario = HORARIOS[code];
  if (!horario) return "";
  const [comida, cena, tiendas, domingo] = horario;
  const partes = [
    tr("horario.comida", { horas: comida }),
    tr("horario.cena", { horas: cena }),
    tr("horario.tiendas", { hora: tiendas }) + tr(`horario.domingo.${domingo}`),
  ];
  if (HORARIO_NOTA.has(code)) partes.push(tr(`horario.nota.${code}`));
  return `${banderaDivisa(code)} 🕐 ${partes.join(" · ")}`;
}

// "cd llegar": lo de enchufe, agua, emergencias, coche y prefijo en una línea,
// para mirarlo nada más aterrizar. Cada cosa sale solo si la tengo de ese país.
const HAY_LLEGAR = /^\s*(?:llegar|llegada|aterrizar|arrival|arrive)(?:\s+([a-z]{3}))?\s*$/i;

function leerLlegar(texto) {
  const m = String(texto ?? "").match(HAY_LLEGAR);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !isValidCode(code) ? null : { code };
}

function textoLlegar(alli, aqui) {
  if (!isValidCode(alli)) return "";
  const partes = [];
  const enchufe = enchufeDe(alli, aqui);
  if (enchufe) {
    const adaptador = enchufe.entra === false ? ` (${tr("llegar.adaptador")})` : "";
    partes.push(`🔌 ${enchufe.tipos.join("/")} ${enchufe.voltios.join("/")} V${adaptador}`);
  }
  const agua = aguaDe(alli);
  if (agua) partes.push(`${agua === "si" ? "🚰" : "🚱"} ${tr(`llegar.agua.${agua}`)}`);
  if (EMERGENCIAS[alli]) partes.push(`🚨 ${EMERGENCIAS[alli].map(([n]) => n).join("/")}`);
  partes.push(`🚗 ${tr(POR_LA_IZQUIERDA.has(alli) ? "llegar.izquierda" : "llegar.derecha")}`);
  // El euro tiene ocho prefijos: para eso está cd prefijo.
  if (typeof PREFIJOS[alli] === "string") partes.push(`📞 ${PREFIJOS[alli]}`);
  return `${banderaDivisa(alli)} ${partes.join(" · ")}`;
}

// "cd conducir": por qué lado se va y si hace falta el permiso internacional.
// Fuera del Espacio Económico Europeo, Suiza y Reino Unido digo que lo lleves
// siempre: hay sitios que no lo piden, pero en un control te ahorra el lío.
const POR_LA_IZQUIERDA = new Set(["GBP", "JPY", "AUD", "NZD", "HKD", "SGD", "MYR", "IDR", "INR", "THB", "ZAR", "KES", "LKR", "NPR"]);
const CARNE_EUROPEO = new Set(["EUR", "GBP", "CHF", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "ISK", "RON"]);

const HAY_CONDUCIR = /^\s*(?:conducir|conduce|coche|drive|driving)(?:\s+([a-z]{3}))?\s*$/i;

function leerConducir(texto) {
  const m = String(texto ?? "").match(HAY_CONDUCIR);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !isValidCode(code) ? null : { code };
}

function textoConducir(code) {
  if (!isValidCode(code)) return "";
  const partes = [tr(POR_LA_IZQUIERDA.has(code) ? "conducir.izquierda" : "conducir.derecha")];
  // Irlanda, Malta y Chipre van por la izquierda aunque tengan el euro.
  if (code === "EUR") partes.push(tr("conducir.euro"));
  partes.push(tr(CARNE_EUROPEO.has(code) ? "conducir.carne" : "conducir.permiso"));
  return `${banderaDivisa(code)} 🚗 ${partes.join(" · ")}`;
}

function textoEnchufe(e) {
  if (!e) return "";
  const partes = [
    `${banderaDivisa(e.code)} ${tr("enchufe.tipo", { tipos: e.tipos.join("/") })} · ${e.voltios.join("/")} V`,
  ];
  if (e.code === "EUR") partes.push(tr("enchufe.euro"));
  if (e.entra !== null) partes.push(tr(e.entra ? "enchufe.entra" : "enchufe.adaptador"));
  if (e.otroVoltaje) partes.push(tr("enchufe.voltaje"));
  return partes.join(" · ");
}

// Los billetes que de verdad se ven por la calle. Los de 500 € o 2.000 yenes
// existen, pero nadie paga con ellos.
const BILLETES = {
  EUR: [5, 10, 20, 50, 100, 200], USD: [1, 5, 10, 20, 50, 100], GBP: [5, 10, 20, 50],
  JPY: [1000, 5000, 10000], CHF: [10, 20, 50, 100, 200], CAD: [5, 10, 20, 50, 100],
  AUD: [5, 10, 20, 50, 100], CNY: [1, 5, 10, 20, 50, 100], MXN: [20, 50, 100, 200, 500, 1000],
  BRL: [2, 5, 10, 20, 50, 100, 200], SEK: [20, 50, 100, 200, 500], NOK: [50, 100, 200, 500, 1000],
  DKK: [50, 100, 200, 500, 1000], PLN: [10, 20, 50, 100, 200, 500], TRY: [5, 10, 20, 50, 100, 200],
  CZK: [100, 200, 500, 1000, 2000, 5000], HKD: [10, 20, 50, 100, 500, 1000],
  HUF: [500, 1000, 2000, 5000, 10000, 20000], IDR: [1000, 2000, 5000, 10000, 20000, 50000, 100000],
  ILS: [20, 50, 100, 200], INR: [10, 20, 50, 100, 200, 500], ISK: [500, 1000, 5000, 10000],
  KRW: [1000, 5000, 10000, 50000], MYR: [1, 5, 10, 20, 50, 100], NZD: [5, 10, 20, 50, 100],
  PHP: [20, 50, 100, 200, 500, 1000], RON: [1, 5, 10, 50, 100, 200], SGD: [2, 5, 10, 50, 100],
  THB: [20, 50, 100, 500, 1000], ZAR: [10, 20, 50, 100, 200],
};

// "cd billetes jpy": los de allí y lo que vale cada uno en la tuya, para no
// tener que pensarlo con el billete en la mano.
const HAY_BILLETES = /^\s*(?:billetes?|banknotes?|bills?)(?:\s+([a-z]{3}))?\s*$/i;

function leerBilletes(texto) {
  const m = String(texto ?? "").match(HAY_BILLETES);
  if (!m) return null;
  const code = m[1]?.toUpperCase() ?? null;
  return code && !isValidCode(code) ? null : { code };
}

function textoBilletes(code, tuya = null, tasa = null) {
  const billetes = BILLETES[code];
  if (!billetes) return "";
  const enteros = numeros({ maximumFractionDigits: 0 });
  const conTasa = tuya && tuya !== code && Number.isFinite(tasa) && tasa > 0;
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const lista = billetes.map((b) => (conTasa ? `${enteros.format(b)} ≈ ${dinero.format(b * tasa)}` : enteros.format(b)));
  return `${banderaDivisa(code)} ${tr("billetes.titulo")}: ${lista.join(" · ")} ${conTasa ? tuya : code}`;
}

const PAGOS_MAX = 3;

// Con qué puedes pagar: lo justo hacia arriba con cada billete (37,20 € son
// 40 con billetes de 5, 10 o 20; 50 con uno de 50…). Lo exacto no sale, que
// ahí no hay vuelta.
function pagosPosibles(cantidad, code) {
  const billetes = BILLETES[code];
  if (!billetes || !Number.isFinite(cantidad) || cantidad <= 0) return [];
  const pagos = billetes.map((b) => Math.ceil(cantidad / b - 1e-9) * b).filter((p) => p > cantidad + 1e-9);
  return [...new Set(pagos)].sort((a, b) => a - b).slice(0, PAGOS_MAX);
}

// Para pagarlo justo: de mayor a menor, cada billete las veces que quepa, y lo
// que no llega al más pequeño va en monedas. Con estos billetes tomar siempre
// el más grande que cabe ya da los menos posibles.
function pagoJusto(cantidad, code) {
  const billetes = BILLETES[code];
  if (!billetes || !Number.isFinite(cantidad) || cantidad <= 0) return null;
  let resto = Math.round(cantidad * 100);
  const montones = [];
  for (const b of [...billetes].reverse()) {
    const n = Math.floor(resto / (b * 100));
    if (n > 0) montones.push({ valor: b, n });
    resto -= n * b * 100;
  }
  return { billetes: montones, monedas: resto / 100 };
}

const vuelta = (cantidad, pago) => Math.round((pago - cantidad) * 100) / 100;

// Cómo debería llegarte la vuelta: "10 + 2,80 en monedas". Si te dan otra cosa
// que suma lo mismo, bien; pero si te faltan billetes, se ve al momento.
function vueltaEnBilletes(cantidad, pago, code) {
  const resto = vuelta(cantidad, pago);
  if (!(resto > 0)) return "";
  const justo = pagoJusto(resto, code);
  if (!justo) return "";
  const enteros = numeros({ maximumFractionDigits: 0 });
  const piezas = justo.billetes.flatMap((b) => Array(b.n).fill(enteros.format(b.valor)));
  if (justo.monedas > 0) {
    const monedas = numeros(Number.isInteger(justo.monedas)
      ? { maximumFractionDigits: 0 } : { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(justo.monedas);
    piezas.push(tr("cuenta.monedas", { importe: monedas }));
  }
  return piezas.join(" + ");
}

function leerCuenta(guardado) {
  const { propina, personas } = guardado ?? {};
  return {
    propina: Number.isFinite(propina) && propina >= 0 && propina <= PROPINA_MAX
      ? redondearComision(propina) : CUENTA_POR_DEFECTO.propina,
    personas: Number.isInteger(personas) && personas >= 1 && personas <= PERSONAS_MAX
      ? personas : CUENTA_POR_DEFECTO.personas,
    // Los guardados de antes no lo traen: sin redondear, como estaban.
    redondear: guardado?.redondear === true,
  };
}

// Hacia arriba: mejor que en la mesa sobre un céntimo a que falte. El margen
// es para que 10,00 no se vaya a 10,01 por los decimales del ordenador.
const alCentimo = (n) => Math.ceil(n * 100 - 1e-6) / 100;

// A la unidad hasta 999; con divisas pequeñas, a la decena o la centena, que
// redondear 2.347 yenes a 2.348 no le ahorra nada a nadie.
function redondoHaciaArriba(n) {
  const paso = 10 ** Math.max(0, Math.floor(Math.log10(n)) - 2);
  return Math.ceil(n / paso - 1e-9) * paso;
}

// La propina va sobre la cuenta tal cual, y la comisión sobre lo que te cobran
// después en tu divisa, igual que en el resto del popup.
function repartirCuenta(cantidad, rate, { propina, personas, redondear = false }, comision = 0) {
  if (!Number.isFinite(cantidad) || cantidad <= 0) return null;
  const total = cantidad * (1 + propina / 100);
  const conTasa = Number.isFinite(rate) && rate > 0;
  const tuyo = conTasa ? conComision(total * rate, comision) : null;
  if (redondear) {
    const cadaUno = redondoHaciaArriba(total / personas);
    return {
      propina: total - cantidad,
      total,
      cadaUno,
      // Lo que se deja de más al redondear, que acaba siendo propina.
      sobra: cadaUno * personas - total,
      totalTuyo: tuyo,
      cadaUnoTuyo: conTasa ? alCentimo(conComision(cadaUno * rate, comision)) : null,
    };
  }
  return {
    propina: total - cantidad,
    total,
    cadaUno: alCentimo(total / personas),
    sobra: 0,
    totalTuyo: tuyo,
    cadaUnoTuyo: tuyo === null ? null : alCentimo(tuyo / personas),
  };
}

// Para pegarlo en el grupo de la cena: lo que paga cada uno, en negrita, que es
// lo único que se lee. Lo de tu divisa solo si es otra.
function cuentaParaCompartir(r, from, to, { propina, personas }) {
  if (!r) return "";
  const dinero = numeros({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const texto = [`*🧾 ${tr("cuenta.compartir.total", { total: `${dinero.format(r.total)} ${from}` })}*`];
  if (propina > 0) {
    texto.push(tr("cuenta.compartir.propina", {
      cuenta: dinero.format(r.total - r.propina),
      propina: dinero.format(r.propina),
      pct: tr("pct", { n: numeros({ maximumFractionDigits: 2 }).format(propina) }),
    }));
  }
  if (personas > 1) texto.push(`*👥 ${tr("cuenta.compartir.cadaUno", { cada: `${dinero.format(r.cadaUno)} ${from}`, n: personas })}*`);
  const tuyo = personas > 1 ? r.cadaUnoTuyo : r.totalTuyo;
  if (tuyo != null && to !== from) texto.push(`_≈ ${dinero.format(tuyo)} ${to}_`);
  return texto.join("\n");
}

// Lo que pagas tú, para el viaje: tu parte con la propina dentro. Va a comida,
// que una cuenta a medias casi siempre es de cenar; si no, se cambia con un clic.
function gastoDeLaCuenta(r, { id, from, to, rate, pago, comision, cuando, concepto }) {
  if (!r || !Number.isFinite(rate) || rate <= 0) return null;
  const suya = comisionDelPago(pago, comision);
  return crearGasto({
    id, from, to, cuando, concepto, pago,
    cantidad: r.cadaUno,
    valor: alCentimo(conComision(r.cadaUno * rate, suya)),
    categoria: "comida",
    comision: suya,
  });
}

// Hasta un 1 % es lo que cobra una buena tarjeta; del 7 % para arriba ya es
// tarifa de aeropuerto.
const MARGENES = [
  { hasta: 0.01, veredicto: "bien" },
  { hasta: 0.03, veredicto: "normal" },
  { hasta: 0.07, veredicto: "caro" },
  { hasta: Infinity, veredicto: "timo" },
];

// En la ventanilla igual pone "1 EUR = 1,12 USD" que "1 USD = 0,89 EUR", así
// que me quedo con la lectura que más se parezca a la real. Si empatan, la del par.
function tasaOfrecida(numero, real) {
  if (!Number.isFinite(numero) || numero <= 0 || !Number.isFinite(real) || real <= 0) return null;
  const directa = Math.abs(Math.log(numero / real));
  const alReves = Math.abs(Math.log(numero * real));
  return alReves < directa ? { tasa: 1 / numero, invertida: true } : { tasa: numero, invertida: false };
}

// La casa siempre gana, así que hacia dónde se aparta de la real dice qué haces:
// por debajo te dan menos de lo tuyo (vendes), por encima pagas más (compras).
function analizarCambio(numero, real, cantidad, comision = 0) {
  const ofrecida = tasaOfrecida(numero, real);
  if (!ofrecida || !Number.isFinite(cantidad) || cantidad < 0) return null;
  const { tasa, invertida } = ofrecida;
  const vendes = tasa <= real;
  const margen = vendes ? 1 - tasa / real : 1 - real / tasa;
  // La comisión de la tarjeta se cuenta sobre lo justo, no sobre lo que pagas:
  // para comparar paso el margen a esa misma cuenta.
  const sobrecoste = margen / (1 - margen);
  // 1 - 0,99 no da 0,01 justo, da 0,010000000000000009: sin la holgura un 1 %
  // exacto salía "normal".
  const HOLGURA = 1e-9;
  return {
    tasa,
    invertida,
    margen,
    veredicto: MARGENES.find((m) => margen <= m.hasta + HOLGURA).veredicto,
    sentido: vendes ? "vendes" : "compras",
    justo: cantidad * real,
    ofrecido: cantidad * tasa,
    perdida: cantidad * Math.abs(tasa - real),
    tarjeta: comision > 0 ? (sobrecoste > comision / 100 + HOLGURA ? "tarjeta" : "aqui") : null,
  };
}
