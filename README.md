# Editor de estilos para eXeLearning

Editor web para crear, ajustar y exportar estilos (`.zip`) compatibles con eXeLearning.

Versión actual: `v 2.0.5`

Recursos y plantillas oficiales de eXeLearning: `4.0.3`.

## Qué hace

- Carga estilos oficiales de eXe como base.
- Carga un estilo desde ZIP.
- Carga proyectos ELPX y permite modificar el estilo embebido.
- Puede importar muchos estilos legacy de eXe 2.x y convertirlos a un formato moderno editable.
- Incluye ajustes rápidos seguros (colores, tipografía, menú, iDevices, botones, cabecera, pie, fondo, favicon, logotipo institucional).
- Permite editar visualmente elementos concretos desde la previsualización mediante clic.
- Permite editar archivos del estilo (`style.css`, `config.xml`, imágenes, iconos, fuentes, etc.) desde la pestaña Archivos.
- Previsualización con el runtime real de eXeLearning: el resultado es fiel al de la exportación.
- Barra de previsualización con cuatro grupos de controles:
  - **Vista**: tamaño del marco (escritorio, tableta, móvil). No modifica el CSS.
  - **Formato**: tipo de exportación mostrado (sitio web, página única, SCORM). No modifica el CSS.
  - **Ámbito**: formatos a los que se aplican los cambios de CSS (sitio web, página única, SCORM, TinyMCE). Único grupo que modifica el CSS exportado.
  - **Elementos**: muestra u oculta elementos dentro de la previsualización. No modifica el CSS.
- Franja de estado visible con el formato y dispositivo activos.
- Navegador de páginas flotante en modo SCORM para recorrer el contenido sin salir del editor.
- Deshacer/rehacer cambios de CSS.
- Actualiza `screenshot.png` automáticamente al exportar.
- Exporta ZIP listo para importar en eXeLearning.
- Exporta ELPX con el estilo ya modificado.
- Interfaz disponible en español, inglés y catalán. El ELPX de ejemplo se carga en el idioma activo.

## Documentación de usuario

- [Manual de usuario (es)](./reference/user/manual.md)
- [User manual (en)](./reference/user/manual.en.md)
- [Manual d'usuari (ca)](./reference/user/manual.ca.md)

## Flujo recomendado

1. Carga una plantilla oficial, un ZIP o un ELPX.
2. Revisa la previsualización.
3. Haz cambios globales en **Ajustes**.
4. Usa la edición por clic si necesitas retocar un elemento concreto.
5. Si hace falta, entra en **Archivos** para editar manualmente `style.css`, `config.xml` o recursos.
6. Completa **Información y exportación**.
7. Exporta ZIP o ELPX.

## Notas de compatibilidad

- La validación final conviene hacerla en eXeLearning solo si modificas `config.xml` o usas características dependientes del entorno (SCORM, interactividades).
- Si `downloadable=0`, el estilo se puede editar aquí, pero no será importable desde la interfaz de eXe.
- En temas con varios `.css` o varios `.js` en raíz, el editor los conserva, pero los ajustes rápidos escriben sobre `style.css`.
- La preparación del runtime real de eXeLearning está documentada en [reference/development/exelearning-runtime.md](./reference/development/exelearning-runtime.md).

## Modo seguro (automático)

- Los ajustes rápidos se aplican en un bloque controlado: `quick-overrides`.
- El editor sanea automáticamente selectores inseguros heredados dentro de ese bloque.
- El usuario avanzado puede seguir haciendo cambios manuales en `style.css` desde la pestaña **Archivos**.

## Estructura mínima esperada del estilo

- `config.xml`
- `style.css`
- `style.js`
- `screenshot.png`

## Ejecutar en local

Abre `index.html` con un servidor estático (recomendado) para evitar problemas de carga de archivos locales.

```bash
cd /ruta/al/proyecto
python3 -m http.server 8000
```

Luego abre `http://localhost:8000`.

## Estadísticas de visitas

El proyecto incluye una integración mínima con un contador propio alojado en IONOS:

- Resumen visible en el pie: visitas totales y visitas de hoy.
- Panel privado separado por aplicación.
- Almacenamiento sin cookies ni IP.
- Clasificación básica por origen, referrer y campañas UTM.

Los ficheros del backend para esta aplicación están en:

- `analytics/editor-estilos/track.php`
- `analytics/editor-estilos/admin-stats.php`
- `analytics/editor-estilos/lib.php`
- `analytics/editor-estilos/config.sample.php`

El frontend solo intenta registrar visitas cuando la app se sirve por `http` o `https`. En `localhost` no envía eventos.

## Autoría y licencia

- (c) [Juan José de Haro](https://bilateria.org)
- Licencia: AGPLv3
- Proyecto independiente inspirado visualmente en eXeLearning. No está afiliado ni avalado oficialmente por eXeLearning o INTEF.
