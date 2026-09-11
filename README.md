# ConversorDivisas

Extensión de Chrome para convertir divisas sin salir de lo que estés haciendo.

La hice porque me cansé de abrir una pestaña y buscar "euro a dólar" cada vez
que necesitaba una conversión rápida. Ahora es un clic en la barra del navegador.

![Captura del popup](docs/screenshot.png)

## Qué hace

- Convierte entre 15 divisas con tasas del Banco Central Europeo
- Escribes en cualquiera de las dos cantidades y calcula la otra
- Buscas la divisa escribiendo: pones "mex" y sale el peso mexicano
- Un botón para dar la vuelta al par sin tocar los dos desplegables
- Un botón para copiar el resultado
- Un gráfico de cómo ha ido la tasa, a 7, 30 o 90 días
- Recuerda la última pareja de divisas y el periodo del gráfico
- Guarda las tasas del día, así que al abrirlo ya está el número puesto
- Se abre con `Ctrl+Shift+U` (en Mac, `Cmd+Shift+U`)
- Tiene modo claro y oscuro, según cómo tengas el sistema
- Si algo falla te dice qué ha pasado, no se queda en blanco

Solo pide dos permisos: guardar tus preferencias y hablar con la API de las
tasas. No hay analítica ni seguimiento de ningún tipo.

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
logica.js        las cuentas y los formatos, sin tocar la pantalla
popup.js         lo que reacciona a los clics
test/            tests de logica.js
icons/           16, 48 y 128 px
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

EUR, USD, GBP, JPY, CHF, CAD, AUD, CNY, MXN, BRL, SEK, NOK, DKK, PLN y TRY.

Para añadir otra basta con meter una línea en el array `CURRENCIES` de
`logica.js`, siempre que Frankfurter la soporte.

## Licencia

MIT. Haz lo que quieras con ello.
