# ConversorDivisas

Extensión de Chrome para convertir divisas sin salir de lo que estés haciendo.

La hice porque me cansé de abrir una pestaña y buscar "euro a dólar" cada vez
que necesitaba una conversión rápida. Ahora es un clic en la barra del navegador.

![Captura del popup](docs/screenshot.png)

## Qué hace

- Convierte entre las 30 divisas que publica el Banco Central Europeo
- Escribes en cualquiera de las dos cantidades y calcula la otra
- Puedes escribir una cuenta en vez de un número: `20+15`, `3*12,50`,
  `(40+60)/4` o `100-15%`. Mientras escribes te enseña el total, y al darle a
  Enter se queda con él
- Buscas la divisa escribiendo: pones "mex" y sale el peso mexicano
- Un botón para dar la vuelta al par sin tocar los dos desplegables
- Un botón para copiar el resultado
- Las últimas diez conversiones, en el reloj que hay al lado de **Copiar**. Pulsando
  una copias su resultado; con la flecha de al lado la vuelves a poner. Se
  apunta sola cuando dejas de escribir, al darle a Enter o al copiar
- Los gastos del viaje, en la cartera que hay al lado del reloj: con una
  cantidad puesta, le das a **+ 38,90 EUR** (con un concepto si quieres, "Cena",
  "Taxi"…) y se apunta. Arriba sale el total en tu divisa, y debajo los gastos
  por días con lo de cada día. Cada uno se guarda con la tasa y la comisión de
  ese momento, así que lo que gastaste el lunes no cambia aunque el euro suba
  el martes. Hasta 200, y para vaciarlo hay que darle dos veces
- Varios viajes, cada uno con sus gastos y su presupuesto: pulsando el nombre
  del viaje, arriba del panel, cambias de uno a otro, ves cuánto llevas en
  cada uno y empiezas otro ("Japón", "Lisboa"). Se les cambia el nombre con el
  lápiz, y para borrar uno hay que darle dos veces. Hasta ocho. Lo que tenías
  apuntado antes de esto pasa al primero, sin perder nada
- El resumen del viaje para mandarlo: el bocadillo que hay al lado de **CSV**
  copia el total, en qué se ha ido, lo de cada día y cómo va el presupuesto,
  con negritas y emojis para que en WhatsApp se lea bien
- Cada gasto con su categoría (comida, transporte, alojamiento, ocio, compras
  u otros), que sale sola por el concepto ("taxi", "cena", "hotel") y se cambia
  con un clic. Arriba, en qué se te va el dinero en porcentajes; pulsando una
  ves solo esos gastos
- Un presupuesto para el viaje: le dices cuánto quieres gastar y hasta qué día,
  y una barra te enseña lo que llevas (verde, dorada pasado el 80 %, roja si te
  pasas) y cuánto te queda al día
- Las conversiones y los gastos se bajan en CSV con el botón **CSV** de cada
  panel, listos para abrir en Excel o en Google Sheets: en español van con
  punto y coma y "12,50", en inglés con coma y "12.50", y las tildes no se rompen
- Dividir la cuenta, en el tique que hay al lado de la cartera: con lo que
  pone la cuenta arriba, eliges la propina (sin, 10, 15, 20 % o la que quieras)
  y entre cuántos sois, y te dice lo que paga cada uno, en esa divisa y en la
  tuya. Se redondea hacia arriba al céntimo, para que en la mesa no falte nada.
  Puedes cambiar la cantidad con el panel abierto, y la propina y la gente se
  quedan guardadas
- La comisión de tu banco: pones el % que te cobra la tarjeta (0, 1, 2, 3 o el
  que quieras) y al lado del resultado sale lo que pagarías de verdad. También
  va sumada en la chuleta y en las otras divisas. Se queda guardada para la
  próxima vez
- Seleccionas un precio en cualquier web, clic derecho, **Convertir**, y te sale
  el resultado en una tarjeta al lado del texto. Entiende "1.299,00 €",
  "$1,049.99", "R$ 10,50" o "20 euros". Sin ratón, con `Alt+Shift+C` (`⌥⇧C`
  en Mac), también dentro de un campo de texto
- Todos los precios de una web a la vez: clic derecho en la página, **Convertir
  los precios de la página**, y al lado de cada precio sale lo que vale en tu
  divisa. Solo cuenta los que llevan la divisa pegada (`49,99 €`, `$1,049.99`,
  `USD 35`), así que un "20 unidades" no se convierte. Volviendo a darle, o con
  **Quitar**, la página se queda como estaba. Lo que la web va cargando
  después (el scroll infinito de las tiendas, el "ver más") también sale
  convertido, mientras las tengas puestas. Los precios con los céntimos en
  pequeño (`$49⁹⁹`) se los salta, que los leería mal
- Pastillas con tus últimos pares, para cambiar de uno a otro con un clic
- Un gráfico de cómo ha ido la tasa, a 7 días, 1 mes, 3 meses o 1 año. Pasando
  el ratón ves la tasa de cada día, y marca el máximo y el mínimo del periodo.
  Pulsando un día (o con Enter) te lleva a la pestaña del día con esa fecha
- Si es buen momento para cambiar: arriba a la derecha sale "Buen momento",
  "Momento normal" o "Mal momento", según si la tasa de hoy es mejor que la de
  tres de cada cuatro días del periodo del gráfico, y cuánto se aparta de la
  media. En el gráfico, la media es la línea de puntos
- En la pestaña de al lado, la misma cantidad en otras divisas a la vez (hasta
  cinco, las eliges tú). Pulsando una la pones como destino
- Una chuleta de viaje en otra pestaña: 1, 5, 10, 20, 50 y 100 en las dos
  divisas, para mirar precios de un vistazo. Si la divisa es muy pequeña (yenes,
  rupias…) empieza en 100 o en 10.000, que si no la tabla no sirve. Pulsando una
  fila la pones como cantidad
- La tasa de un día concreto: eliges la fecha (o "hace 1 mes, 6 meses, 1 año")
  y te dice cuánto era tu cantidad entonces y cuánto ha cambiado hasta hoy. Si
  ese día fue fin de semana o festivo, te avisa y usa la del último día con tasa
- Si te cambian bien: en la pestaña de la lupa pones la tasa que te ofrecen en
  la casa de cambio o el cajero y te dice cuánto pierdes con tu cantidad, qué
  margen se quedan y si es "Bien", "Normal", "Caro" o "Te timan". Da igual
  que la escribas al derecho o al revés (`1 EUR = 1,10 USD` o `1 USD = 0,91
  EUR`), la entiende igual. Si tienes puesta la comisión de tu tarjeta, te dice
  qué te sale mejor
- La primera vez elige el par según el idioma del navegador: con `es-MX` empieza
  en MXN → USD, con `en-GB` en GBP → EUR. Si no lo tiene claro, EUR → USD
- Recuerda la última pareja de divisas, el periodo del gráfico, la pestaña y
  las divisas que tienes puestas
- Guarda las tasas del día, así que al abrirlo ya está el número puesto
- La tasa de tu par en el propio icono de la barra, en verde si ha subido desde
  el día anterior, en rojo si ha bajado. Se actualiza cada hora; si no la
  quieres, clic derecho en el icono y la quitas
- Avisos de tasa: pones a cuánto quieres que llegue ("avísame si el dólar pasa
  de 1,15") y te salta una notificación cuando pase, aunque tengas el popup
  cerrado. Hasta cuatro a la vez
- Se abre con `Ctrl+Shift+U` (en Mac, `Cmd+Shift+U`)
- Desde la barra de direcciones, sin abrir nada: escribes `cd`, espacio, y
  luego `20 usd`, `50 eur a gbp` o `100-15% jpy`. El resultado sale en las
  sugerencias de Chrome, con tus otras divisas debajo, y con Enter se abre el
  popup con esa conversión puesta
- Atajos dentro del popup: `S` da la vuelta al par, `C` copia, `D` y `A` abren
  los desplegables, `G` los gastos, `P` dividir la cuenta y del `1` al `6` cambian de pestaña. Si estás escribiendo en
  un campo, con `Alt` delante (`⌥` en Mac). Con `?` salen todos
- Tiene modo claro y oscuro, según cómo tengas el sistema
- En español o en inglés, según el idioma de Chrome o el que elijas con clic
  derecho en el icono → **Idioma**. En inglés los números van a la inglesa
  (1,084.70), pero si escribes "12,50" también lo entiende
- Si algo falla te dice qué ha pasado, no se queda en blanco

Pide lo justo: guardar tus preferencias, hablar con la API de las tasas, una
alarma para refrescar el icono y mirar los avisos cada hora, mandar las
notificaciones de esos avisos y, para lo del clic derecho, el menú y poner la
tarjeta en la pestaña en la que estás.
Esto último solo pasa cuando pulsas **Convertir**, **Convertir los precios de
la página** o el atajo; no lee ninguna web por su cuenta, y por eso Chrome no avisa de nada al instalarla. No hay analítica ni
seguimiento de ningún tipo.

En Mac, para ver los avisos Chrome necesita permiso para mandar notificaciones
(Ajustes del Sistema → Notificaciones → Google Chrome).

En las páginas donde Chrome no deja meter nada (las de `chrome://`, la Web Store
o el visor de PDF) se abre el popup con la cantidad ya puesta.

## Instalación

No está en la Chrome Web Store, así que se carga a mano:

1. Descarga el repo (clonándolo o como ZIP)
2. Abre `chrome://extensions`
3. Activa el **Modo de desarrollador**, arriba a la derecha
4. Pulsa **Cargar descomprimida** y elige la carpeta del proyecto

El icono aparecerá en la barra. Si no lo ves, está escondido detrás del icono de
la pieza de puzzle.

¿El atajo no funciona? Chrome no lo asigna si ya lo está usando otra extensión.
Se cambia en `chrome://extensions/shortcuts`.

## Cómo está hecho

JavaScript a pelo: sin frameworks, sin build y sin dependencias.

```
manifest.json    configuración de la extensión (Manifest V3)
popup.html       estructura del popup
popup.css        estilos
textos.js        todos los textos, en español y en inglés
logica.js        las cuentas y los formatos, sin tocar la pantalla
popup.js         lo que reacciona a los clics
background.js    el menú del clic derecho y la tasa para la tarjeta
tarjeta.js       la tarjeta que sale en la web, en un shadow DOM
precios.js       las pastillas con los precios de toda la página
test/            tests de logica.js
icons/           16, 48 y 128 px
_locales/        el nombre y la descripción que enseña Chrome, en los dos idiomas
```

Lo que se puede probar solo está en `logica.js`, aparte del resto. Los tests van
con lo que ya trae Node, así que no hay `node_modules` que instalar:

```
npm test
```

Para lo demás, editas un archivo, le das a recargar en `chrome://extensions` y
ya está.

Las tasas vienen de [Frankfurter](https://frankfurter.dev), que es gratuita, no
pide API key y saca los datos del BCE. Como el BCE publica una vez al día
laborable, el gráfico no tiene puntos en fines de semana ni festivos, y las
tasas guardadas valen hasta el día siguiente.

## Divisas soportadas

Las 30 que publica el BCE. Primero las de siempre:

EUR, USD, GBP, JPY, CHF, CAD, AUD, CNY, MXN, BRL, SEK, NOK, DKK, PLN y TRY.

Y detrás el resto:

CZK, HKD, HUF, IDR, ILS, INR, ISK, KRW, MYR, NZD, PHP, RON, SGD, THB y ZAR.

Si el BCE añade alguna, basta con meter una línea en el array `CURRENCIES` de
`logica.js`, con el nombre en español y en inglés (hay un test que comprueba
que la lista es justo la del BCE, así que habrá que tocarlo también). Para que
la tarjeta del clic derecho la reconozca por su símbolo o su nombre, va en
`PISTAS`, en el mismo archivo.

## Licencia

MIT. Haz lo que quieras con ello.
