# 0002. Orden de escritura y borrado de la caché al cambiar de plantilla

- **Estado:** aceptada
- **Fecha:** 2026-09-18

## Contexto

La previsualización se sirve desde una caché propia a través del service worker
`elpx-sw.js`. Al aplicar otra plantilla a un proyecto ya cargado hay que hacer
tres cosas: escribir en la caché los archivos de la plantilla nueva, quitar los
de la anterior que ya no existen y recargar el marco de previsualización.

El orden entre las tres no es indiferente, y las dos formas equivocadas fallan
de manera distinta, lo que hace fácil corregir una y provocar la otra.

Si se borra al principio, antes de escribir, queda un intervalo largo en el que
la plantilla anterior ya no está y la nueva todavía no. La página que sigue en
pantalla puede pedir sus imágenes durante todo ese rato, y como las respuestas
se sirven con `no-store`, cada repintado las vuelve a solicitar. Así aparecían
errores 404 de `theme/img/menu_open.svg` y similares al pasar de una plantilla
a otra.

Si se aplaza el borrado hasta después de recargar, aparece un fallo peor
porque es silencioso. El HTML de un proyecto pide los iconos por una ruta fija,
`theme/icons/book.png`, sea cual sea la plantilla activa. Mientras el archivo
de la anterior siga en la caché, se sirve ese en lugar del equivalente de la
nueva, `book.svg`. El síntoma observado fue un icono naranja, de la plantilla
`base`, dentro de una previsualización por lo demás correcta de `educablue`.

## Decisión

El cambio de plantilla sobre un proyecto cargado se hace siempre en este orden,
en `replaceElpxThemeAndReloadPreview()`:

1. Escribir en la caché los archivos de la plantilla nueva.
2. Borrar de una vez los de la anterior que ya no existen.
3. Recargar la previsualización inmediatamente después.

## Alternativas descartadas

**Borrar primero y escribir después**, que es el orden que tenía el código.
Produce los 404 descritos arriba.

**Aplazar el borrado hasta que cargue la previsualización nueva.** Se probó y
provocó el icono de la plantilla anterior. Es una solución aparentemente más
cuidadosa que resulta ser peor, porque sustituye un error visible en la consola
por uno visible en pantalla.

**Una caché distinta por plantilla.** Resolvería el problema de raíz, sin
ningún intervalo de solapamiento, pero obliga a rehacer la gestión de sesiones
de la previsualización. No compensa para el residuo que queda.

## Consecuencias

Entre el borrado y la recarga queda un intervalo muy breve en el que la página
saliente todavía puede pedir alguna imagen de su plantilla y registrar un 404 en
la consola. En las pruebas apareció una vez de cada ocho, sin ningún efecto en
lo que se ve ni en lo que se exporta. Se acepta ese residuo a cambio de que el
icono servido sea siempre el de la plantilla activa.

Quien vaya a mover estas tres operaciones debería probar dos cosas antes: que no
aparecen 404 al recorrer todas las plantillas seguidas, y que el icono del
primer bloque corresponde a la plantilla elegida y no a la anterior.
