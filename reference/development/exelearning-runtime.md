# Runtime estatico de eXeLearning

EdEX prepara la integracion con el runtime real de eXeLearning copiando una
instantanea local de sus bundles estaticos a `app/exe-runtime/`.

## Sincronizar bundles

Desde este repositorio:

```bash
scripts/sync-exe-bundles.sh
```

Por defecto usa:

```text
/home/jjdeharo/Documentos/github/OTROS_REPOSITORIOS/exelearning
```

Tambien se puede indicar otra copia:

```bash
scripts/sync-exe-bundles.sh --source /ruta/a/exelearning
```

Si los bundles ya estan generados y solo quieres copiarlos:

```bash
scripts/sync-exe-bundles.sh --skip-build
```

El script copia:

- `public/app/yjs/importers.bundle.js`
- `public/app/yjs/exporters.bundle.js`
- `public/bundles/`
- `public/files/perm/themes/base/`

Despues genera `app/exe-runtime/manifest.json` con la ruta de origen, rama,
commit, version, fecha UTC y hashes SHA-256 de los archivos copiados.

## Uso previsto

Esta carpeta aun no sustituye la previsualizacion actual. Es una base estable
para crear despues el adaptador local que cargue ELPX, resuelva recursos y
exporte Website, Single Page y SCORM con los exportadores oficiales.

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
