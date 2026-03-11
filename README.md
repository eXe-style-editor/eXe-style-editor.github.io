# Editor de estilos para eXeLearning

Editor web para crear, ajustar y exportar estilos (`.zip`) compatibles con eXeLearning.

Versión actual: `v 1.0.0-beta.11`

## Qué hace

- Carga estilos oficiales de eXe como base.
- Carga un estilo desde ZIP.
- Permite editar archivos del estilo (`style.css`, `config.xml`, imágenes, iconos, fuentes, etc.).
- Incluye ajustes rápidos seguros (colores, tipografía, menú, iDevices, botones).
- Permite añadir fuentes y logotipo institucional con controles básicos.
- Permite añadir/quitar imagen de fondo desde ajustes rápidos.
- Permite añadir/reemplazar iconos de iDevices en lote.
- Incluye ajustes avanzados de títulos (página, proyecto e iDevice) en la UI.
- Actualiza `screenshot.png` automáticamente al exportar (si falla, conserva el existente).
- Exporta ZIP listo para importar en eXeLearning.
- Permite editar visualmente elementos concretos desde la previsualización mediante clic.
- Puede importar muchos estilos legacy de eXe 2.x y convertirlos a un formato moderno editable.
- Permite cargar y exportar proyectos ELPX modificando el estilo embebido.
- Incluye aviso inicial de fase de pruebas (se muestra una sola vez y se recuerda).

## Documentación de usuario

Guía de uso recomendada:

- [Manual de usuario (es)](./reference/user/manual.md)
- [User manual (en)](./reference/user/manual.en.md)
- [Manual d'usuari (ca)](./reference/user/manual.ca.md)

Incluye:

- carga de plantillas, ZIP y ELPX
- ajustes rápidos
- edición por clic
- trabajo con archivos
- exportación ZIP y ELPX
- compatibilidad con estilos legacy 2.x
- límites y recomendaciones prácticas

## Flujo recomendado

1. Carga una plantilla oficial, un ZIP o un ELPX.
2. Ajusta visualmente en **Ajustes** y/o edita archivos en **Archivos**.
3. Usa la edición por clic si necesitas retocar un elemento concreto.
4. Completa **Proyecto > Información y exportación**.
5. Si partiste de plantilla oficial, cambia al menos:
   - `Nombre`
   - `Título`
6. Exporta ZIP o ELPX, según el caso.

## Notas de compatibilidad

- La validación final conviene hacerla en eXeLearning, sobre todo en estilos legacy.
- El editor intenta aplicar cambios automáticos de forma segura.
- Si `downloadable=0`, el estilo se puede editar aquí, pero no será importable desde la interfaz de eXe.
- Los enlaces dentro de la previsualización están desactivados para evitar navegación accidental.
- En temas con varios `.css` o varios `.js` en raíz, el editor los conserva, pero los ajustes rápidos escriben sobre `style.css`.

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

Ejemplo:

```bash
cd /ruta/al/proyecto
python3 -m http.server 8000
```

Luego abre `http://localhost:8000`.

## Estadisticas de visitas

El proyecto incluye una integracion minima con un contador propio alojado en IONOS:

- resumen visible en el pie: visitas totales y visitas de hoy
- panel privado separado por aplicacion
- almacenamiento sin cookies ni IP
- clasificacion basica por origen, referrer y campanas UTM

Los ficheros del backend para esta aplicacion estan en:

- `analytics/editor-estilos/track.php`
- `analytics/editor-estilos/admin-stats.php`
- `analytics/editor-estilos/lib.php`
- `analytics/editor-estilos/config.sample.php`

El frontend solo intenta registrar visitas cuando la app se sirve por `http` o `https`. En `localhost` no envia eventos.

## Autoría y licencia

- (c) [Juan José de Haro](https://bilateria.org)
- Licencia: AGPLv3
- Proyecto independiente inspirado visualmente en eXeLearning. No esta afiliado ni avalado oficialmente por eXeLearning o INTEF.
