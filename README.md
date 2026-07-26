# ConversorDivisas

Extensión de Chrome para convertir divisas con tasas de cambio reales.

Lo hice porque me cansé de abrir una pestaña y buscar "euro a dólar" cada vez que
necesitaba una conversión rápida. Ahora es un clic en la barra del navegador.

![Captura del popup](docs/screenshot.png)

## Qué hace

- Convierte entre 15 divisas con tasas actualizadas del Banco Central Europeo
- Botón para intercambiar origen y destino sin tener que tocar los dos selectores
- Recuerda la última pareja que usaste
- Si la API falla te dice por qué, no se queda en blanco

No pide más permisos que `storage` y el acceso a la API. No hay analítica ni
seguimiento de ningún tipo.

## Instalación

Todavía no está en la Chrome Web Store, así que hay que cargarla a mano:

1. Clona el repo o descarga el ZIP
2. Abre `chrome://extensions`
3. Activa el "Modo de desarrollador" (arriba a la derecha)
4. Pulsa "Cargar descomprimida" y elige la carpeta del proyecto

El icono aparecerá en la barra. Si no lo ves, está escondido detrás del icono
de la pieza de puzzle.

## Cómo está hecho

JavaScript sin frameworks, sin build y sin dependencias. Son cuatro archivos y
una carpeta de iconos:

```
manifest.json    configuración de la extensión (Manifest V3)
popup.html       estructura del popup
popup.css        estilos
popup.js         toda la lógica
icons/           16, 48 y 128 px
```

No hay `package.json` ni `node_modules` porque no hacen falta. Editas un archivo,
le das a recargar en `chrome://extensions` y ya está.

Las tasas vienen de [Frankfurter](https://frankfurter.dev), que es gratuita, no
pide API key y saca los datos del BCE. Solo pido el par que necesito en cada
momento (`?base=EUR&symbols=USD`) en lugar de traerme las 30 divisas.

Un par de decisiones que igual no son obvias:

- Las cifras van en monoespaciada con `tabular-nums` para que el resultado no
  baile de lado mientras escribes.
- Al pulsar el botón de intercambio invierto la tasa en local (`1/rate`) y
  muestro el resultado al instante, sin esperar a la petición. La API responde
  después y corrige si hace falta.
- Hay un contador de peticiones para que, si cambias de divisa muy rápido, una
  respuesta lenta y antigua no pise a la buena.

## Divisas soportadas

EUR, USD, GBP, JPY, CHF, CAD, AUD, CNY, MXN, BRL, SEK, NOK, DKK, PLN y TRY.

Añadir una más es meter una línea en el array `CURRENCIES` de `popup.js`,
siempre que Frankfurter la soporte.

## Pendiente

- [ ] Subirla a la Chrome Web Store
- [ ] Histórico con la evolución de la tasa
- [ ] Atajo de teclado para abrir el popup

## Licencia

MIT. Haz lo que quieras con ello.
