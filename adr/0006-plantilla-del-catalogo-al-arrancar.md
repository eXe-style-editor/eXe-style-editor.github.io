# 0006. Al arrancar, el estilo sale del catálogo y no del ELPX de ejemplo

- **Estado:** aceptada
- **Fecha:** 2026-11-17

## Contexto

El editor arranca con un ELPX de ejemplo (`assets/manual_edex_<idioma>.elpx`)
para que la previsualización tenga contenido real. Hasta la versión 2.0.9, el
estilo que se editaba al arrancar era el que traía ese ELPX en su carpeta
`theme/`, y el selector de plantillas mostraba «base» como si fuera la
plantilla oficial.

No lo era. eXeLearning guarda en el ELPX el estilo con que se creó el
proyecto, y volver a guardarlo con una versión nueva no lo actualiza: los
ejemplos, regenerados con eXeLearning 4.0.6 (commit `e8944e6`), seguían
llevando el «base» de eXe 3.0 (`<version>2025</version>`,
`<compatibility>3.0</compatibility>`), sin las mejoras de accesibilidad del
`style.js` actual (`aria-expanded`, `inert` en el menú, el botón de búsqueda
solo si hay buscador). Quien exportaba sin tocar el selector se llevaba ese
estilo antiguo, y como el selector ya decía «base», elegir «base» no hacía
nada: había que pasar por otra plantilla para obtener la de verdad. Se vio el
17-11-2026, al investigar un aviso en el grupo de eXeLearning sobre el botón
de menú (que resultó no depender de esto: el «base» antiguo también lo crea).

## Decisión

1. Del ELPX de ejemplo solo se usa el contenido. Al cargarlo,
   `loadDefaultBootElpx()` aplica encima la plantilla oficial del catálogo
   (`app/official-styles.json`), igual que cuando el usuario elige una
   plantilla con un ELPX cargado: «base» al arrancar y, al cambiar de idioma,
   la que estuviera en uso.
2. El selector refleja lo que hay cargado (`state.officialSourceId`), no la
   última plantilla elegida. Si el estilo viene de un ZIP o de un ELPX del
   usuario, muestra «Estilo del archivo cargado», y elegir cualquier
   plantilla, también la que se usó antes, la carga.

Así el estilo de partida es siempre el que sincroniza
`scripts/sync-exe-bundles.sh`, sin depender de regenerar los ejemplos.

## Alternativas descartadas

**Regenerar los ELPX de ejemplo con el estilo nuevo.** Lo arregla hoy, pero
vuelve a quedarse atrás en cada versión de eXeLearning y obliga a recordar un
paso más en cada sincronización. Con la decisión tomada, el estilo que lleven
los ejemplos es indiferente.

**Cargar la plantilla antes que el ELPX para evitar la doble carga.** Cargar
un ELPX sustituye el estilo por el suyo, así que la plantilla tiene que ir
después.

## Consecuencias

- El arranque carga la previsualización dos veces. Medido en local con
  Chromium, pasa de 0,5 a 0,8-0,9 s.
- Como el estilo de partida es una plantilla oficial, al exportar se exige
  cambiar el nombre y el título, como con cualquier plantilla elegida a mano.
- Validado con Chromium y Firefox, en escritorio y móvil: al arrancar, la
  previsualización y el `style.js` exportado son los de
  `reference/themes/official/base`; tras cargar un ZIP o un ELPX el selector
  muestra «Estilo del archivo cargado» y elegir «base» lo carga; con
  «universal» elegido, cambiar de idioma la mantiene.
