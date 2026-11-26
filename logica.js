// La lógica que no toca la pantalla, separada para poder probarla con node.
// Está partida por temas en logica/. En el navegador cada página carga los
// trozos con sus <script>, uno detrás de otro; este archivo es la puerta de los
// tests, y el navegador no lo carga.

// El orden importa: los de abajo usan al cargar cosas de los de arriba.
const TROZOS = ["divisas", "conversor", "alli", "leer", "gastos", "viajes", "presupuesto", "copiar", "medidas", "avisos", "datos", "web"];

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// En el navegador textos.js y tema.js ya van cargados delante; aquí hay que pedirlos.
if (typeof tr === "undefined") Object.assign(globalThis, require("./textos.js"));
if (typeof leerTema === "undefined") Object.assign(globalThis, require("./tema.js"));

// Igual que los <script>: todos en el mismo ámbito, para que se vean entre ellos
// sin tener que exportarse nada unos a otros.
for (const trozo of TROZOS) {
  const archivo = path.join(__dirname, "logica", `${trozo}.js`);
  vm.runInThisContext(fs.readFileSync(archivo, "utf8"), { filename: archivo });
}

// Lo que usan los tests. En el navegador no hace falta exportar nada: todo está
// en el ámbito global, y así no hay que montar un build.
module.exports = {
  datosTarjeta, anadidoConvertido,
  preguntaOjo, OJO_CLAVADO, OJO_CERCA, notaOjo, rachaOjo,
  NOTA_MAX, limpiarNota, cambiarNota,
  esFijo, delDiaADia, marcarFijo,
  numeroBanco, fechaBanco, leerCsvBanco, conceptoBanco, tasaDeEseDia, gastosDelBanco, cargoEnDivisa, comisionReal, textoComisionReal,
  TAX_FREE, taxFree,
  tasaLegible, DIVISAS_BCE, DIVISAS_MERCADO, esDeMercado, parDeMercado, urlTasa, urlTasaDia, urlSerie, urlsTodas, aFormatoV1, juntarTasas, pedirTodas,
  CURRENCIES, isValidCode, nombreDe, parseAmount, isoLocal, hoy, isFresh, tasaRenovada,
  RODILLO_MAX, rodillo, PANEL_MAX, panelSalidas, COLORES_BANDERA, manchasBandera, luminancia, contraste,
  evaluar, completar, leerImporte, UNIDADES, quitarUnidad, nombreUnidad, porUnidadMetrica, esOperacion, pasoCantidad, pasoPorDiez, RUEDA_PASO, pasosRueda, cifraCompleta, leerCantidad,
  normalizar, filtrarDivisas, trozosCoincidencia, buildPaths, PUNTOS_TRANSFORMAR, remuestrear, curvaEnMedio, startDateFor, tipoDeFallo, errorMessageFor,
  RECIENTES_MAX, FIJOS_MAX, apuntarReciente, fijarReciente, leerRecientes, recientesVisibles,
  RANGOS, RANGO_POR_DEFECTO, leerRango, siguienteRango, coordenadas, alturaEn, MOMENTO_UMBRAL, momento, textoMomento,
  SEMANAS_MINIMAS, mejorDiaSemana, ABANICO_MINIMO, abanicoTasa, textoAbanico, nombreDiaSemana, textoDiaSemana, indiceCercano, extremos, fechaCorta, largoEnPantalla, recorridoEnPantalla,
  FOTOGRAMAS_MONEDA, vueltaMoneda,
  leerNumero, divisaDe, DOMINIOS, divisaDeLaWeb, leerSeleccion, sumarSeleccion, notaDeSuma, leerCobro, COBRO_RARO, analizarCobro, textoCobro, destinoPara, leerPegado, leerPegadoSuelto, leerColumna, leerFechaReserva, leerReserva, cuentaDeColumna, buscarPrecios, precioEntero, precioBajoElRaton, leerOmnibox, leerMezcla, textoMezcla, precioUnidadBarra, leerGastoBarra, leerDictado, leerConversionDicha, gastoDeBarra, gastoDeTarjeta, escaparXml,
  divisaDeIdioma, parPorIdioma, banderaDe, banderaDivisa,
  HISTORIAL_MAX, leerHistorial, apuntarConversion, quitarConversion, haceCuanto, ultimoDeHoy, textoParaCopiar, fraseParaCopiar, conversionParaCopiar, gastoParaCopiar, ultimoGasto, gastoMasCaro, totalParaCopiar, hoyParaCopiar, simboloDe, textoConSimbolo, fraseConSimbolo,
  celdaCsv, csvHistorial, csvGastos, csvViajes,
  GASTOS_MAX, CONCEPTO_MAX, crearGasto, leerGastos, esDevolucion, devolucionDe, apuntarGasto, NOCHES_MAX, repartirCentimos, repartirNoches, repartoPorDias, apuntarNoches, quitarGasto, cambiarConcepto, cambiarDia, buscarGastos, preguntarGastos, textoPregunta, trozosResaltados, repetirGasto, devolverGasto, devolverTodos, sumarPorDivisa, gastosPorDia, huecoEntre, cifraEnMarcha, categoriaDelDia, pesoDeLosDias, ordenarPorImporte, masCarosDelDia, pesoDeLosGastos, RARO_VECES, mediana, gastoRaro, REPETIDO_MS, gastoRepetido, mediaPorDia, DIAS_POR_MES, COMO_EN_CASA, comparaConCasa, textoCasa, categoriasAlDia, mediaPorGasto, comisionesPagadas, cambioDelViaje, cifraCambio, textoCambio, pagadoEnEfectivo, ahorroEnEfectivo,
  RETIRADAS_MAX, leerRetiradas, crearRetirada, leerCajeroGratis, ponerCajeroGratis, inicioDelPeriodo, gratisDelMes, pasaDelGratis, cambioDelCajero, sobreElBce, alCambioDelCajero, apuntarRetirada, quitarRetirada, efectivoQueda, EFECTIVO_POCO, tonoEfectivo, redondoDeCajero, cuantoSacar, loQueSobra, gastadoHoy, nombreDia,
  CATEGORIAS, CATEGORIA_POR_DEFECTO, CATEGORIAS_PROPIAS_MAX, NOMBRE_CATEGORIA_MAX, esCategoria, leerCategoriasPropias, ponerCategoriasPropias, todasCategorias, nombreCategoria, emojiCategoria, crearCategoriaPropia, quitarCategoriaPropia, sinCategoria, adivinarCategoria, PAGOS, PAGO_POR_DEFECTO, leerPago, comisionDelPago, desglose, conceptosUsados, conceptosFrecuentes, completarConcepto,
  EMOJI_CATEGORIA, destacados, resumenParaCompartir, FINDE_MINIMO, findeContraSemana, ESTRELLA_MINIMO, conceptoEstrella, INDICE_MAX, indiceCafe,
  TARJETAS_MAX, NOMBRE_TARJETA_MAX, anadirTarjeta, leerTarjetas, quitarTarjeta, tarjetaActual, siguientePago, mejorTarjeta,
  aniosConGastos, datosAnio, COPIA_APP, COPIA_VERSION, CLAVES_COPIA, CLAVES_SYNC, limpiarSync, cambiosSync, mezclaInicial, limpiarCopia, crearCopia, leerCopia, resumenCopia,
  leerCsvGrupo, gastosDelGrupo, categoriaDeGrupo,
  crearPaquete, leerPaquete, quienEsQuien, mapaValido, gastosParaJuntar, juntarGastos,
  puedeSerDeEmpresa, pasarAEmpresa, sacarDeEmpresa, notaDeGastos,
  AVISO_MEJOR_DIAS, techoDeSerie, crearAvisoMejor, ponerTechos,
  presupuestoSugerido, leerMarca, marcarPresupuesto, CAMBIO_MARCA_MINIMO, cambioDesdeMarca, textoCambioMarca, PARTES_VALIDAS, leerPartes, partesDe, repartirPorPartes, textoParte,
  VIAJES_MAX, NOMBRE_VIAJE_MAX, leerViajes, leerPersonas, porPersona, consumoGente, leerPagador, leerGente, ponerNombre, nombrePersona, inicialPersona, cuentasViaje, frasePago, COBRO_GASTOS_MAX, mensajeCobro, COMO_PAGAR_MAX, leerComoPagar, lineaDePago, enlaceDePago, leerEntre, entreDe, fraseEntre, cambiarEntre, leerSaldados, saldarPago, quitarSaldado, fraseSaldado, hayOtrosPagadores, NOMBRE_PERSONA_MAX, compararViajes, viajeConTasasDeHoy, DIAS_ANTES_DE_CAMBIAR, cambioAntes, AHORRO_MINIMO, ahorroCambiandoAntes, textoCambioAntes, VIAJE_HOY_IGUAL, textoViajeHoy, COLORES_VIAJE, leerColorViaje, colorLibre, siguienteColor, viajeActivo, ARCHIVADOS_MAX, archivarViaje, desarchivarViaje, borrarArchivado, todosLosViajes, crearViaje, nombreCopia, nombreDeDestino, duplicarViaje, renombrarViaje, elegirViaje, borrarViaje, moverGasto, cambiarViaje, TRAMOS_MAX, NOMBRE_TRAMO_MAX, leerTramos, ponerTramo, quitarTramo, tramoDelDia, divisaDelTramo, resumenTramos, curvaPresupuesto, FRANJAS, HORAS_MINIMO, horaFiable, porFranja, PENDIENTES_MAX, leerPendientes, crearPendiente, cambiarVence, pendientesPorFecha, tocaPagar, tonoVence, textoVence, PENDIENTE_HORA, tocaPendientes, avisadosPendientes, mensajePendientes, apuntarPendiente, quitarPendiente, totalPendiente, exposicionPendientes, textoExposicion, pagarPendiente, resumenViaje, archivoGastos, plegarIcs, eventosDelViaje, calendarioViaje, archivoCalendario,
  diasHasta, leerPresupuesto, leerTopes, PRESUPUESTO_JUSTO, estadoPresupuesto, estadoTopes, alDiaAlli, inicioDelViaje, diaDelViaje, cuentaAtras, textoCuentaAtras, destinoDelViaje, antesDeSalir, JETLAG_MINIMO, planJetLag, textoJetLag, leerListo, marcarListo, progresoMaleta, huchaViaje, loDeHoy, CELEBRADOS_MAX, leerCelebrados, anadirCelebrado, viajeParaCelebrar, textoCelebrar, RACHA_MINIMA, rachaPresupuesto, hastaCuandoLlega, previsionViaje, PREVISION_JUSTA, textoPrevision, loQueSeLleva, presupuestoEnTarjeta, textoPresupuestoTarjeta, redondearDias,
  EXTRAS_MAX, EXTRAS_POR_DEFECTO, leerExtras, anadirExtra, quitarExtra,
  extrasVisibles, disponiblesParaAnadir, convertirExtras, semanaDe, trazoMini, CHULETA, escalaChuleta, chuleta, TRUCO_TOLERANCIA, trucoDeCabeza, textoTruco, tituloTruco, chuletaParaCompartir, extrasParaCompartir,
  urlImpresion, leerImpresion, chuletaParaImprimir,
  COMISION_MAX, COMISIONES_RAPIDAS, leerComision, leerPorcentaje, conComision,
  IMPUESTO_MAX, IMPUESTOS_RAPIDOS, leerImpuesto, leerImpuestoEscrito, loQuePagas,
  COMPARAR_IGUAL, compararPrecios, inclinacion, leerTamano, compararTamanos, efectivoParaTraer, traerEfectivo, quitarRetiradaDeViajes, deCadaDia, semanaDelViaje, tocaSemana, mensajeSemana, FOTO_LADO, medidasFoto, fotosSinGasto, tiquesDeCopia, restoReedSolomon, formatoQR, versionQR, bytesDeDatosQR, codigoQR, svgQR, QR_VERSION_MAX, resumenParaQR, ZONAS, desfase, esNoche, momentoDelDia, cieloAlli, horaAlli, SIGLAS_ZONA, leerHoraZona, convertirHoraZona, textoHoraZona, textoDiferencia, relojDe, tituloHoraAlli, leerCafe, enCafes, textoCafes, HORAS_JORNADA, enHoras, textoHoras,
  PROPINAS_RAPIDAS, PROPINA_HABITUAL, propinaHabitual, leerPropina, textoPropina, ENCHUFES, leerEnchufe, enchufeDe, textoEnchufe, EMERGENCIAS, leerEmergencias, textoEmergencias, AGUA, leerAgua, textoAgua, POR_LA_IZQUIERDA, CARNE_EUROPEO, leerConducir, textoConducir, IDIOMA_DE_DIVISA, paraDecir, FRASE_REGATEO, paraEnsenar, VOCES_DE_BROMA, elegirVoz, PREFIJOS, leerPrefijo, textoPrefijo, FRASES, leerGracias, textoGracias, IVA, leerIva, textoIva, PAGO_ALLI, CAJERO_NOTA, leerCajero, textoCajero, leerLlegar, textoLlegar, VISADOS, leerVisado, textoVisado, ROAMING, leerRoaming, textoRoaming, CON_TSE, leerSanitaria, textoSanitaria, APPS_TAXI, leerTaxi, textoTaxi, REGATEO, leerRegatear, textoRegatear, FESTIVOS, FESTIVOS_LUNA, pascuaOrtodoxa, fechaFestivo, festivosProximos, leerFestivos, textoFestivos, HORARIOS, leerHorario, textoHorario, PROPINA_MAX, PERSONAS_MAX, CUENTA_POR_DEFECTO, leerCuenta, redondoHaciaArriba, repartirCuenta, cuentaParaCompartir, gastoDeLaCuenta, BILLETES, leerBilletes, textoBilletes, PAGOS_MAX, pagosPosibles, vuelta, vueltaEnBilletes, pagoJusto,
  MARGENES, tasaOfrecida, analizarCambio,
  domingoDePascua, hayTasaEl, tasaVieja, textoTasaVieja, horaBce, textoActualizado, proximaTasa, textoProximaTasa,
  FECHA_MINIMA, fechaLarga, fechaValida, diaDelGrafico, mesesAtras, FECHAS_RAPIDAS, leerFecha, cambioDesde, notaDiaHabil,
  radioOnda, vueloMoneda, SONIDOS, VIBRACIONES, SONIDO_VOLUMEN, SONIDO_VOLUMEN_MAX, notasDe, LADEO_MAX, ladeoPostal, semillaDivisa, rosetaBillete, DESLIZAR_MIN, umbralDeslizar, tirarGasto, quitarAlSoltar, APLASTE_ALTO, APLASTE_ANCHO, aplaste, textoInsignia, cambioDiario, sentidoDe, cambioDelDia, textoCambioDia, ULTIMA_VEZ_MINIMO, desdeLaUltimaVez, ultimoVisto, tituloInsignia, tituloHoy, leerGrados, convertirGrados, textoGrados, leerGas, convertirGas, textoGas, leerDistancia, convertirDistancia, textoDistancia, leerRitmo, convertirRitmo, textoRitmo, leerPeso, convertirPeso, textoPeso, leerOnzas, convertirOnzas, textoOnzas, leerOnzasTroy, convertirOnzasTroy, textoOnzasTroy, leerAltura, convertirAltura, textoAltura, leerVelocidad, convertirVelocidad, textoVelocidad, leerVolumen, convertirVolumen, textoVolumen, leerLongitud, convertirLongitud, textoLongitud, leerSuperficie, convertirSuperficie, textoSuperficie, leerMillasCuadradas, convertirMillasCuadradas, textoMillasCuadradas, leerYardasCuadradas, convertirYardasCuadradas, textoYardasCuadradas, leerPulgadasCuadradas, convertirPulgadasCuadradas, textoPulgadasCuadradas, leerConsumo, convertirConsumo, textoConsumo, leerElectrico, convertirElectrico, textoElectrico, leerPresion, convertirPresion, textoPresion, leerTazas, convertirTazas, textoTazas, TAZA_DE, leerTazaDe, textoTazaDe, leerCucharadas, convertirCucharadas, textoCucharadas, leerSticks, convertirSticks, textoSticks, leerYardas, convertirYardas, textoYardas, leerStone, convertirStone, textoStone, leerLibrasYOnzas, convertirLibrasYOnzas, textoLibrasYOnzas, leerOnzasLiquidas, convertirOnzasLiquidas, textoOnzasLiquidas, leerPintas, convertirPintas, textoPintas, leerGills, convertirGills, textoGills, leerCuartos, convertirCuartos, textoCuartos, leerNudos, convertirNudos, textoNudos, leerMetrosPorSegundo, convertirMetrosPorSegundo, textoMetrosPorSegundo, leerMillasNauticas, convertirMillasNauticas, textoMillasNauticas, leerBrazas, convertirBrazas, textoBrazas, leerLeguas, convertirLeguas, textoLeguas, leerManos, convertirManos, textoManos, leerFurlongs, convertirFurlongs, textoFurlongs, leerChains, convertirChains, textoChains, leerRods, convertirRods, textoRods, leerJin, convertirJin, textoJin, leerTsubo, convertirTsubo, textoTsubo, leerJo, convertirJo, textoJo, leerLakh, convertirLakh, textoLakh, leerTola, convertirTola, textoTola, leerTael, convertirTael, textoTael, leerMach, convertirMach, textoMach, leerThou, convertirThou, textoThou, leerGramaje, convertirGramaje, textoGramaje, leerMomme, convertirMomme, textoMomme, leerPood, convertirPood, textoPood, leerVersta, convertirVersta, textoVersta, leerAnioLuz, convertirAnioLuz, textoAnioLuz, leerAcrePie, convertirAcrePie, textoAcrePie, leerBigha, convertirBigha, textoBigha, leerMu, convertirMu, textoMu, leerMaund, convertirMaund, textoMaund, leerPicul, convertirPicul, textoPicul, leerShaku, convertirShaku, textoShaku, leerTalla, convertirTalla, textoTalla, leerAnillo, convertirAnillo, textoAnillo, CAMISAS, leerCamisa, textoCamisa, ROPA, TRAJES, leerRopa, textoRopa, leerMah, convertirMah, textoMah, leerMbps, convertirMbps, textoMbps, leerGlucosa, convertirGlucosa, textoGlucosa, leerGo, convertirGo, textoGo, leerVara, convertirVara, textoVara, leerManzana, convertirManzana, textoManzana, leerRi, convertirRi, textoRi, leerDram, convertirDram, textoDram, leerFanega, convertirFanega, textoFanega, leerCodo, convertirCodo, textoCodo, leerAcres, convertirAcres, textoAcres, leerArpent, convertirArpent, textoArpent, leerCalorias, convertirCalorias, textoCalorias, leerPotencia, convertirPotencia, textoPotencia, leerBtu, convertirBtu, textoBtu, leerTherms, convertirTherms, textoTherms, leerInHg, convertirInHg, textoInHg, leerPiesCubicos, convertirPiesCubicos, textoPiesCubicos, leerYardasCubicas, convertirYardasCubicas, textoYardasCubicas, leerQuilates, convertirQuilates, textoQuilates, leerGrains, convertirGrains, textoGrains, leerPennyweight, convertirPennyweight, textoPennyweight, leerCwt, convertirCwt, textoCwt, leerCuerdas, convertirCuerdas, textoCuerdas, leerBushels, convertirBushels, textoBushels, leerPecks, convertirPecks, textoPecks, leerPulgadasCubicas, convertirPulgadasCubicas, textoPulgadasCubicas, leerBarriles, convertirBarriles, textoBarriles, leerParMotor, convertirParMotor, textoParMotor, leerToneladasCortas, convertirToneladasCortas, textoToneladasCortas, esHoyBarra, resumenHoyBarra, esAyerBarra, resumenAyerBarra, esAnteayerBarra, resumenAnteayerBarra, esSemanaBarra, resumenSemanaBarra, esMesBarra, resumenMesBarra, esTodosBarra, resumenTodosBarra, esViajeBarra, resumenViajeBarra, esCaroBarra, resumenCaroBarra, esTasaBarra, resumenTasaBarra, lineaTasa,
  SUSCRIPCIONES_MAX, NOMBRE_SUSCRIPCION_MAX, PERIODOS_SUSCRIPCION, SUSCRIPCION_IGUAL, crearSuscripcion, leerSuscripciones, ponerSuscripcion, quitarSuscripcion, tuDivisa, cuentaSuscripciones,
  AVISOS_MAX, AVISO_PCT_MAX, sentidoAviso, crearAviso, leerPorcentajeAviso, crearAvisoPorcentaje, crearCompra, leerAvisos, avisoCumplido, repartirAvisos, mensajeAviso, faltaParaAviso, cercaniaAviso, textoFalta,
  nivelPresupuesto, avisosPresupuesto, mensajePresupuesto,
  RECORDATORIO_HORA, RECORDATORIO_HORAS, leerHoraRecordatorio, viajesSinApuntar, tocaRecordar, mensajeRecordatorio, TAX_FREE_HORA, tocaTaxFree, mensajeTaxFree,
  ATAJOS, atajoPara, textoAtajo, FUNCIONES, FUNCIONES_MAX, buscarFunciones,
  esPanel, cambioDeFuera, MEDIDAS, medidaDeSeleccion,
  numeroDePrecio, precioDeLaPagina, precioComoTexto,
  AVISO_TARJETA_BAJA, maximoSugerido, avisoDesdeTarjeta,
  leerDivisaCasa, tocaBienvenida, parDeBienvenida, atajosDeBienvenida, DEMO_CANTIDAD, divisaDeEjemplo, demoDeBienvenida,
  NOVEDADES, compararVersiones, novedadesDesde, versionVistaAlInstalar,
  GUARDADO_DIAS, webDe, crearGuardado, leerGuardado, esElGuardado, compararConGuardado, textoGuardado, VISTOS_DIAS, VISTOS_MAX, paginaVista, apuntarVisto, cambioDesdeVisto, textoVisto,
  PPA_ANIO, PPA, PPA_EURO, NIVEL_IGUAL, paisDePrecios, PAIS_DE_ZONA, paisDeZona, cambioDePais, mensajeCambioDePais, IVA_UE, UMBRAL_ARANCEL, paisIva, compraDeFuera, textoCompraDeFuera, nivelDePrecios, nivelFrente, RINDE_MAX, dondeRindeMas, nombrePais, textoNivel,
};
module.exports.TROZOS = TROZOS;
