# AGENTS.md

## Repositorio canónico
- Repositorio público canónico: `eXe-style-editor/eXe-style-editor.github.io`.
- URL pública canónica: `https://eXe-style-editor.github.io/`.
- Usar solo el repo canónico en referencias, enlaces, documentación y publicación.
- No introducir referencias nuevas al repo antiguo.
- No publicar nunca en `jjdeharo/editor-estilos.git`.
- Si existe un remoto `legacy`, debe conservarse solo como referencia histórica o redirección, nunca como destino de publicación.

## Contexto del proyecto
Editor web local para crear, previsualizar y exportar estilos de eXeLearning.
Prioridad acordada: **compatibilidad real con eXeLearning** y cambios automáticos seguros para usuarios no técnicos.

## Estado actual
- App estática: `index.html`, `app/main.js`, `app/styles.css`.
- ZIP en cliente con `vendor/jszip.min.js`.
- Carga inicial automática del estilo oficial `base`.
- Previsualización simulada fija en panel derecho (enlaces inactivos para evitar navegación accidental).

## Estructura relevante
- `index.html`: interfaz y controles.
- `app/main.js`: lógica de carga, edición, sanitización, validación y exportación.
- `app/styles.css`: estilos de la interfaz del editor.
- `app/official-styles.json`: catálogo de plantillas oficiales (`base`, `flux`, `neo`, `nova`, `universal`, `zen`).
- `reference/development/styles.md`: referencia de campos y empaquetado de estilos eXe.
- `reference/themes/official/`: copia de estilos oficiales para comparación y pruebas.
- Repo local de eXeLearning ya disponible para consulta (no clonar de nuevo): `/home/jjdeharo/Documentos/github/OTROS_REPOSITORIOS/exelearning`.

## Funcionalidades implementadas
- Carga de plantilla oficial y carga de ZIP.
- Edición de archivos (texto e imágenes) desde pestaña **Archivos**.
- Reemplazo de iconos/imágenes y añadido de fuentes.
- Ajustes rápidos (colores, tipografía, menú, iDevices, botones).
- Ajustes avanzados de títulos (página, curso e iDevice) desde la UI.
- Carga y retirada de imagen de fondo desde ajustes rápidos.
- Carga de iconos de iDevices en lote (con reemplazo por nombre base).
- Logotipo institucional (subida, tamaño, posición y márgenes).
- Autocreación de obligatorios faltantes (`style.js`, `screenshot.png`) para evitar bloqueos por ZIP incompletos.
- Intento de actualización automática de `screenshot.png` al exportar desde la previsualización (con fallback seguro).
- Metadatos completos de `config.xml`:
  - `name`, `title`, `version`, `compatibility`, `author`, `license`, `license-url`, `description`, `downloadable`.
- Exportación ZIP con validación automática.

## Reglas de compatibilidad y seguridad
- Los ajustes rápidos escriben solo dentro del bloque `quick-overrides`.
- Sanitización automática de selectores inseguros en `quick-overrides`.
- Selectores protegidos para evitar efectos colaterales (`.box-toggle`, togglers, etc.).
- El editor no debe exigir conocimientos de CSS para resolver errores comunes: corrige automáticamente cuando es posible.
- Para actualizar recursos desde eXeLearning, usar `scripts/sync-exe-bundles.sh`. Por defecto sincroniza contra la ultima release estable y solo actualiza si detecta una nueva; `--from-main` queda reservado para snapshots de desarrollo. Debe mantener sincronizados tanto `app/exe-runtime/` como `reference/themes/official/` y regenerar `app/official-styles.json`; no actualizar solo una de esas partes.
- Compatibilidad entre versiones de eXeLearning: antes de cada actualización, comparar estructura y metadatos de los estilos, selectores/HTML de la exportación y API de los importadores/exportadores. Probar plantillas y estilos personalizados anteriores con la nueva versión. No crear un modo distinto por cada número de versión: las versiones compatibles deben compartir soporte.
- Si una actualización rompe esa compatibilidad, conservar el soporte anterior y separar los recursos, plantillas y adaptadores necesarios por familia compatible antes de adoptarla. Cada previsualización/exportación debe usar recursos de una misma familia, sin mezclarlos. No sobrescribir estilos del usuario ni convertirlos silenciosamente. Detectar la familia cuando haya evidencia suficiente; si es ambigua, permitir elegirla e informar de las limitaciones, sin prometer soporte para estructuras desconocidas. Procedimiento y comprobaciones en `reference/development/exelearning-runtime.md`.

## Reglas de exportación
- Se bloquea exportación solo por incidencias críticas:
  - faltan archivos obligatorios no autocorregibles (`config.xml`, `style.css`), o
  - bloque `quick-overrides` inválido.
- Si el estilo parte de plantilla oficial, para exportar deben cambiarse **Nombre** y **Título** respecto al oficial.
- Si `downloadable=0`, se permite editar/exportar, pero se avisa de que no será importable desde la interfaz de eXe.

## UX/operación
- Aviso superior de “fase de pruebas” al iniciar; al cerrarlo no vuelve a mostrarse (persistencia en `localStorage`).
- La barra de previsualización debe arrancar siempre con el estado por defecto y en este orden visual: Vista, Formato, Ámbito, Elementos. No guardar ni restaurar en `localStorage` la selección del usuario para Vista, Formato, Ámbito ni Elementos.
- Pie visible con autoría y licencia AGPLv3.

## Criterio de calidad
- Cambios automáticos del programa: siempre seguros.
- Evitar regresiones visuales en componentes internos de eXe.
- Mantener diferencia clara entre ajustes seguros (UI) y edición avanzada (Archivos).
