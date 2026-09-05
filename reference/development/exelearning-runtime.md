# Runtime estatico de eXeLearning

EdEX prepara la integracion con el runtime real de eXeLearning copiando una
instantanea local de sus bundles estaticos a `app/exe-runtime/`.

## Sincronizar bundles

Desde este repositorio:

```bash
scripts/sync-exe-bundles.sh
```

Por defecto el script consulta la ultima release estable publicada en GitHub.
Si `app/exe-runtime/manifest.json` ya indica esa misma release, no hace nada.
Si detecta una release nueva, descarga su paquete estatico y actualiza:

```text
exelearning-static-vX.Y.Z.zip
```

El origen oficial sigue siendo:

```text
https://github.com/exelearning/exelearning
```

Opciones utiles:

```bash
scripts/sync-exe-bundles.sh --force
scripts/sync-exe-bundles.sh --from-main
scripts/sync-exe-bundles.sh --from-main --skip-build
```

- `--force`: vuelve a sincronizar desde la ultima release aunque el manifest ya
  marque esa misma version.
- `--from-main`: usa una instantanea de desarrollo de la rama `main` en lugar
  de la ultima release estable.
- `--from-main --skip-build`: copia los artefactos ya presentes en el clon de
  `main` sin reconstruirlos con `bun`.

En modo `--from-main`, el script hace un `git clone --depth 1` en un directorio
temporal, reconstruye los bundles si procede y despues copia a este repo solo
los artefactos y plantillas que usa EdEX.

Si quieres revisar o depurar el origen en local, la copia disponible en esta
maquina esta en:

```text
/home/jjdeharo/Documentos/github/OTROS_REPOSITORIOS/exelearning
```

El script copia:

- `public/app/yjs/importers.bundle.js`
- `public/app/yjs/exporters.bundle.js`
- `public/bundles/`
- `public/files/perm/themes/base/`

Despues genera `app/exe-runtime/manifest.json` con el origen usado
(`release` o `main`), release o rama, commit, version, fecha UTC y hashes
SHA-256 de los archivos copiados.

## Uso previsto

El adaptador carga ELPX, resuelve recursos y genera previsualizaciones y
exportaciones con los exportadores oficiales de eXeLearning.

El primer adaptador esta en:

```text
app/exe-runtime/exe-runtime.js
```

API inicial:

```js
import { createExeRuntime } from "./app/exe-runtime/exe-runtime.js";

const runtime = createExeRuntime();
await runtime.init();
await runtime.loadElpx(file);
const metadata = runtime.getMetadata();
const pages = runtime.getPages();
const preview = await runtime.exportPreview({ format: "html5" });
```

Estado actual:

- carga `yjs.min.js`, `importers.bundle.js` y `exporters.bundle.js`;
- crea un `Y.Doc` local sin IndexedDB ni WebSocket;
- importa ELPX con `SharedImporters.createBrowserImporter`;
- guarda assets importados en memoria;
- resuelve tema, CSS base, librerias base, librerias comunes bajo demanda,
  SCORM e iDevices desde `app/exe-runtime/resources/`;
- exporta ELPX desde el documento importado usando el tema editado de EdEX;
- expone diagnostico con `runtime.diagnostics()`.

Notas de rendimiento:

- `common.zip` e `idevices.zip` no se materializan completos para cada preview.
  El adaptador abre el ZIP y extrae solo la carpeta de la libreria o iDevice
  solicitado.
- A largo plazo sigue siendo mejor partirlos en bundles pequenos por
  libreria/iDevice o generar un indice ligero con acceso por entrada.

## Compatibilidad en futuras actualizaciones

La versión de eXeLearning de los recursos se registra en `manifest.json` y
`app/runtime-source.js`; no es la versión de EdEX ni el campo `version` de un
estilo. El campo `compatibility` del estilo tampoco identifica necesariamente
la versión exacta que lo creó.

No hace falta mantener un modo por cada versión de eXeLearning. Mientras los
contratos de estilos y exportación sean compatibles, se actualiza el conjunto
compartido. Antes de adoptar cada release:

1. Revisar sus cambios y comparar los estilos oficiales: archivos de entrada,
   `config.xml`, recursos, selectores CSS y comportamiento de `style.js`.
2. Comprobar las API utilizadas por `exe-runtime.js` y el HTML generado:
   clases, estructura de navegación, títulos, iDevices y botones que utilizan
   los ajustes rápidos y la edición por clic.
3. Probar el ejemplo ELPX, plantillas oficiales y un estilo personalizado de
   la versión anterior; comprobar ajustes, ZIP y exportaciones Website,
   Single Page y SCORM. Verificar que las personalizaciones se conservan.
4. Revisar juntos los cambios de runtime, plantillas y catálogo; registrar el
   resultado antes de publicar. Un cambio de número por sí solo no justifica
   separar versiones.

Si aparece una ruptura real, no sustituir el único conjunto compartido y dar
por hecho que los estilos antiguos funcionarán. Antes de publicar esa release:

- Conservar la familia anterior con sus plantillas, bundles y recursos.
- Incorporar la nueva familia con su adaptador de importación/exportación,
  selectores de ajustes y previsualización cuando sean distintos.
- Mantener un catálogo que relacione versiones verificadas con familias y
  rutas. Cargar siempre un conjunto coherente; aislar o recargar el motor al
  cambiar de familia para no mezclar los globals de sus bundles.
- Detectar la familia a partir de metadatos y estructura reconocibles. Si no
  basta, ofrecer una selección explícita con una explicación sencilla.
  Una estructura desconocida no debe recibir ajustes automáticos que se
  presuponen compatibles. Conservar los archivos originales y permitir su
  recuperación; cualquier migración debe ser explícita y reversible.
- Repetir las pruebas con ambas familias y documentar los límites del soporte.

Esta es la política para futuras rupturas, no una función de detección o un
selector de versiones ya implementados. El editor sigue usando un único
conjunto de recursos mientras no se necesite esa separación.

### Revisión de 4.0.1 a 4.0.3 (2026-09-05)

- Recursos obtenidos de la release oficial `v4.0.3`, publicada el 2026-08-06,
  mediante `scripts/sync-exe-bundles.sh`.
- Las seis plantillas conservan sus archivos de entrada y estructura. Se
  elimina `downloadable` de sus XML (el editor ya interpreta su ausencia como
  permitido) y Nova añade indicadores de modo docente. No se ha identificado
  una ruptura que requiera separar familias.
- Comprobados los 482 archivos del manifest por tamaño y SHA-256, la igualdad
  de las dos copias de plantillas y las entradas del catálogo. Una segunda
  sincronización detecta que la release ya está actualizada y no modifica nada.
- Pruebas en Chromium: carga del editor sin errores JavaScript; importación
  del manual ELPX de seis páginas; generación de HTML con las seis plantillas;
  exportación Website, Single Page, SCORM 1.2 (con `imsmanifest.xml`) y ELPX.
  El ELPX exportado se reimporta con las seis páginas.
- Importación por la interfaz de un ZIP personalizado construido con Base
  de 4.0.1, cambio de color mediante ajustes rápidos y exportación ZIP:
  conserva el CSS personalizado e incluye el nuevo ajuste. Corregida una
  consulta a campos obsoletos del informe de validación que impedía mostrar
  el mensaje final de éxito tras descargar el ZIP.
- En la prueba automatizada del ZIP se utilizó el fallback previsto de
  `screenshot.png`: se conservó la captura existente. Estas comprobaciones no
  equivalen a probar todos los iDevices ni la ejecución en un LMS externo.

## Globals expuestos por los bundles

`importers.bundle.js` expone en navegador:

- `window.SharedImporters`
- `window.ElpxImporter`
- `window.ElpxImporterCore`
- `window.BrowserAssetHandler`
- `window.createBrowserImporter`

`exporters.bundle.js` expone en navegador:

- `window.SharedExporters`
- `window.createSharedExporter`
- `window.createExporter`
- `window.ElpxExporter`
- `window.generatePrintPreview`

Clases/factorias utiles dentro de `SharedExporters`:

- `YjsDocumentAdapter`
- `BrowserResourceProvider`
- `BrowserAssetProvider`
- `FflateZipProvider`
- `Html5Exporter`
- `PageExporter`
- `Scorm12Exporter`
- `ElpxExporter`
- `generatePreviewForSW`
