# 0005. El editor no recoge estadísticas de uso

- **Estado:** aceptada
- **Fecha:** 2026-10-30

## Contexto

Desde marzo de 2026 el editor enviaba cada visita a un contador propio en
bilateria.org (`track.php`, por JSONP). Con la visita iban la dirección de la
página, la página de procedencia y los parámetros UTM. No usaba cookies ni
guardaba la IP, no contaba las visitas desde `localhost` y un aviso de
privacidad del pie lo explicaba. El código del servidor estaba en la carpeta
`analytics/editor-estilos/`.

La evaluación con la rúbrica VCER de la guía «Vibe coding responsable» puntúa
con 0 el punto de datos personales si el recurso lleva analítica, sea propia o
ajena. Además, la página de procedencia puede delatar el aula virtual o el
sitio desde el que se abre el editor.

## Decisión

En la versión 2.0.9 se retira toda la analítica: el código de `app/main.js`,
las etiquetas `meta` de `index.html` y la carpeta `analytics/`. El enlace
«Privacidad» del pie se mantiene y describe ahora lo que hace el editor: los
archivos se procesan en el navegador y no se envían a ningún servidor, no hay
estadísticas de uso ni cookies, y solo se descarga de cdnjs (Cloudflare) la
biblioteca que colorea el código. Las claves de traducción `footer.analytics*`
pasan a `footer.privacyLink` y `footer.privacyNotice`, en español, catalán e
inglés.

## Alternativas descartadas

**Mantener el contador propio con el aviso de privacidad.** Aunque no usaba
cookies ni guardaba la IP, seguía enviando la dirección de la página y la de
procedencia, y la rúbrica VCER puntúa con 0 cualquier analítica.

**Quitar también el enlace «Privacidad».** Sin analítica sigue habiendo algo
que contar: que los archivos no salen del navegador y que se carga una
biblioteca de un CDN externo.

## Consecuencias

- Ya no hay cifras de uso del editor.
- Los archivos del contador y sus datos siguen en el alojamiento de IONOS
  (`/app/estadistica/editor-estilos/`) y en el panel central de estadísticas.
  Archivarlos y borrarlos de allí es una tarea aparte.
- Los navegadores que ya lo visitaron conservan en `localStorage` la clave
  `analytics:last-visit:editor-estilos`, que solo guardaba la hora de la
  última visita y ya no se lee ni se envía.
