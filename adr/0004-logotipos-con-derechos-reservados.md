# 0004. No publicar ni exportar los logotipos con derechos reservados

- **Estado:** aceptada
- **Fecha:** 2026-10-29

## Contexto

eXeLearning 4.0.6 incorpora cuatro plantillas oficiales, `cedec`, `etwinning`,
`intef` y `kids`, que llevan logotipos institucionales: los del Ministerio de
Educación, Formación Profesional y Deportes, INTEF, Cedec, eTwinning y la Unión
Europea, y un `favicon.ico` con la misma identidad. El párrafo final de la
`description` de su `config.xml` los declara «ALL RIGHTS RESERVED», fuera de la
licencia CC BY-SA del estilo, y prohíbe usarlos, reproducirlos o distribuirlos
sin autorización de sus titulares, también como parte de una obra derivada.
Quien reutilice el estilo debe quitarlos o sustituirlos. Su `style.js` tiene un
interruptor `logos` que limita la franja de logotipos al dominio de la
institución.

El editor existe para que cada docente haga su propio estilo partiendo de una
plantilla. Si los logotipos llegaran al estilo exportado, la persona estaría
distribuyendo material que no puede distribuir. Además, la web del editor
publicaba una copia de las plantillas oficiales con esos archivos. El
autor del proyecto pidió que no se incumpla ninguna restricción de derechos de
autor y que el editor no los muestre, para que nadie crea que su estilo
quedará así.

## Decisión

- `scripts/sync-exe-bundles.sh` borra esos archivos de todo lo que publica el
  editor: la copia de `reference/themes/official/`, la de
  `app/exe-runtime/resources/themes/base/` y los paquetes
  `resources/bundles/themes/*.zip`. La lista sale de
  `scripts/restricted-files.mjs`, que lee el párrafo «ALL RIGHTS RESERVED» de
  cada `config.xml`, y queda en `restrictedFiles` de `app/official-styles.json`.
- Al cargar una plantilla con `restrictedFiles`, el editor pone el interruptor
  `logos` de `style.js` a `false`, quita de la descripción el párrafo de los
  logotipos y lo avisa en el mensaje de estado. El estilo resultante, y todo lo
  que se exporte desde él, ya no los menciona ni los contiene.
- Sin su `favicon.ico`, la exportación usa el de eXeLearning, como cualquier
  plantilla que no trae uno.

## Alternativas descartadas

**Dejarlos y confiar en el interruptor `logos`.** El interruptor solo evita que
se vean fuera del dominio de la institución; los archivos seguirían viajando en
cada estilo exportado.

**Quitarlos solo al exportar.** La web seguiría publicándolos y el editor los
enseñaría en la pestaña de archivos mientras se trabaja, como si fueran parte
del estilo.

**Escribir a mano la lista de archivos de cada plantilla.** Se quedaría vieja
en cuanto eXeLearning cambie o añada una plantilla. Sale del texto que la
propia plantilla escribe para avisar de esos archivos, y
`restricted-files.mjs` detiene la sincronización si una plantilla tiene el
interruptor `logos` y no se encuentra la lista, o al revés. Así, un cambio de
formato no deja pasar los logotipos sin que nadie se dé cuenta.

## Consecuencias

Las cuatro plantillas se ven en el editor como cualquier persona las verá en su
propio estilo: sin franja de logotipos. El resto de la plantilla (diseño,
iconos, fuentes) se conserva con su licencia y su atribución.

La copia de las plantillas oficiales del repositorio ya no es idéntica a la del
paquete de eXeLearning: le faltan esos archivos.

Los archivos estuvieron en el commit `adbc8b8` (versión 2.0.7), publicado el
mismo día, y siguen en el historial de git.
