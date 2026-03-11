# Manual de usuario

## Para qué sirve

EdEX permite crear o modificar estilos de eXeLearning sin tener que editar CSS manualmente en la mayoría de los casos.

Sirve para:

- partir de una plantilla oficial
- cargar un estilo `.zip`
- cargar un proyecto `.elpx` y cambiar su estilo
- importar muchos estilos legacy de eXe 2.x y convertirlos a una estructura moderna editable

## Flujo recomendado

1. Carga una plantilla oficial, un ZIP o un ELPX.
2. Revisa la previsualización.
3. Haz cambios globales en `Ajustes`.
4. Usa la edición por clic si necesitas afinar un elemento concreto.
5. Si hace falta, entra en `Archivos` para editar manualmente `style.css`, `config.xml` o recursos.
6. Completa `Información y exportación`.
7. Exporta ZIP o ELPX.

## Modos de trabajo

### 1. Plantilla oficial

Úsalo cuando quieres empezar desde cero con una base fiable.

Recomendado para:

- estilos nuevos
- pruebas rápidas
- usuarios que no quieren partir de CSS antiguo

### 2. Cargar ZIP

Úsalo para editar un estilo existente.

Qué hace:

- carga los archivos del tema
- intenta autocorregir faltas mínimas como `style.js` o `screenshot.png`
- permite exportar después un ZIP listo para importar en eXe

### 3. Cargar ELPX

Úsalo cuando quieres cambiar el estilo de un proyecto real.

Qué hace:

- abre el contenido real del proyecto en la previsualización
- sustituye o modifica la carpeta del tema del ELPX
- permite volver a guardar el proyecto como ELPX

## Pestaña Ajustes

Está pensada para cambios globales y seguros.

Incluye, entre otros:

- colores generales
- tipografía
- ancho de contenido
- fondo general
- títulos de página y proyecto
- logotipo institucional
- favicon del proyecto exportado
- cabecera y pie
- menú lateral
- iDevices y botones

Conviene usar `Ajustes` antes que `Archivos` cuando exista una opción equivalente.

## Edición por clic

Se activa con el botón de inspección de la previsualización.

Sirve para cambiar un elemento concreto sin buscar a mano el selector CSS.

Permite editar, según el tipo de elemento:

- color de texto
- color de fondo
- transparencia
- tamaño y peso del texto
- alineación
- margen izquierdo y derecho
- ancho y ancho máximo
- margen inferior
- padding

Notas importantes:

- si vuelves a editar el mismo selector, los cambios se acumulan; no deberían borrarse entre sí
- algunos cambios por clic se reflejan también en los ajustes rápidos cuando equivalen claramente a un ajuste global
- no todos los selectores por clic tienen equivalencia con un ajuste rápido

## Pestaña Archivos

Úsala cuando necesites control manual.

Permite:

- editar texto en `style.css`, `style.js`, `config.xml` y otros archivos
- reemplazar imágenes
- añadir fuentes
- revisar la estructura real del estilo

Es la vía adecuada cuando:

- el tema tiene reglas especiales no cubiertas por la interfaz
- quieres hacer un ajuste muy fino
- necesitas revisar un tema legacy convertido

## Importación de estilos legacy 2.x

El editor puede importar muchos estilos antiguos de eXe 2.x.

Qué intenta hacer automáticamente:

- convertir CSS legacy a selectores modernos
- adaptar `config.xml` a formato moderno
- reconstruir `style.js` a partir de JS legacy si hace falta
- copiar iconos legacy a `icons/`
- mantener ayudas de compatibilidad para cabecera, navegación y otros elementos

Qué debes tener en cuenta:

- la conversión es heurística, no una reproducción perfecta
- algunos estilos antiguos dependían mucho de HTML y JS propios
- la revisión final conviene hacerla siempre en eXeLearning

## Exportar ZIP o ELPX

### Exportar ZIP

Úsalo para:

- importar el estilo desde la interfaz de eXeLearning
- guardar una plantilla reutilizable

Antes de exportar:

- revisa `Nombre` y `Título`
- si partiste de una plantilla oficial, cambia ambos

### Exportar ELPX

Úsalo para:

- guardar un proyecto con su estilo ya modificado

Recomendado cuando has cargado antes un ELPX real.

## Información y exportación

Campos principales:

- `Nombre`: identificador interno del estilo
- `Título`: nombre visible en eXe
- `Versión`: versión del estilo
- `Autor`
- `Licencia`
- `URL licencia`
- `Descripción`
- `Descargable`

Notas:

- `Compatibilidad` se mantiene en `3.0` porque el editor trabaja sobre formato moderno
- si `Descargable` vale `0`, el estilo puede editarse y exportarse, pero eXe no lo importará desde su interfaz

## Favicon

Puedes añadir un favicon desde `Ajustes`.

Formatos aceptados:

- `.ico`
- `.png`

El editor lo guarda como:

- `img/favicon.ico`
- o `img/favicon.png`

Eso es lo que eXe usa al exportar el proyecto.

## Cuándo usar Ajustes, clic o Archivos

Usa `Ajustes` cuando:

- el cambio es global
- existe un control claro en la interfaz

Usa edición por clic cuando:

- quieres retocar un elemento concreto
- no sabes el selector CSS

Usa `Archivos` cuando:

- no existe control en la interfaz
- necesitas revisar o corregir CSS manualmente
- el estilo legacy convertido requiere ajuste fino

## Limitaciones actuales

- en temas con varios `.css` o varios `.js` en raíz, el editor los conserva, pero los ajustes rápidos escriben sobre `style.css`
- la conversión de estilos 2.x puede necesitar repasos manuales
- la previsualización ayuda mucho, pero la comprobación final debe hacerse en eXeLearning

## Recomendaciones prácticas

- exporta versiones intermedias cuando hagas cambios importantes
- si conviertes un estilo 2.x, prueba primero títulos, menú lateral, iDevices e iconos
- si un ajuste existe en `Ajustes`, úsalo antes que editar CSS manualmente
- si algo se resiste en un tema legacy, corrígelo al final en `Archivos`
