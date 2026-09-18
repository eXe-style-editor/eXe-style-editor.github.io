# 0003. Responder con una imagen vacía a los iconos que la plantilla no tiene

- **Estado:** aceptada
- **Fecha:** 2026-09-18

## Contexto

Un proyecto guarda el icono de cada bloque como un nombre suelto, por ejemplo
`book`, sin extensión ni ruta. Al exportar, eXeLearning busca ese nombre entre
los archivos de la plantilla activa y, si no lo encuentra, escribe de todos
modos la etiqueta de imagen con la extensión `.png` por defecto. Su propio
código documenta esa salida como un 404 emitido en silencio.

La plantilla oficial `universal` trae un juego de iconos propio, con
nomenclatura DUA y en español, que no incluye los nombres que comparten las
otras seis. Un proyecto cuyo bloque use `book` acaba pidiendo
`theme/icons/book.png`, que esa plantilla no tiene en ninguna extensión, y el
bloque se queda sin icono. Ocurre igual en el propio eXeLearning.

El service worker ya cubría un caso vecino: cuando el motor pide un `.png` y la
plantilla solo trae el `.svg`, prueba las demás extensiones antes de rendirse.
Lo que faltaba era qué hacer cuando el icono no existe en ninguna.

## Decisión

Cuando la petición corresponde a un icono de plantilla (`theme/icons/`) y no se
encuentra en ninguna extensión, el service worker responde con una imagen SVG
vacía en lugar de un 404.

La excepción se limita a los iconos de plantilla. Cualquier otro archivo que
falte sigue devolviendo 404, porque ahí sí hay un problema real del estilo que
se está editando y conviene que se note.

## Alternativas descartadas

**Dejar el 404.** Es lo más fiel a lo que hace eXeLearning, y fue la primera
opción considerada. Se descartó porque ensucia la consola y las pruebas
automáticas con un error que no es del estilo que se edita, y que quien usa el
editor no puede corregir.

**Sustituirlo por un icono genérico visible.** Haría que la previsualización se
viera mejor que la exportación real, que es justo lo que el editor no debe
hacer. Con la imagen vacía, el bloque se ve igual que en eXeLearning.

**Completar los iconos que le faltan a `universal`.** Supondría modificar una
plantilla oficial, con lo que el editor dejaría de mostrar el estilo tal como
lo distribuye eXeLearning.

## Consecuencias

La previsualización enseña el mismo resultado que la exportación, sin registrar
un error de red por algo ajeno al estilo.

Las respuestas de este tipo llevan la cabecera `X-EdEX-Missing-Icon`, por si
más adelante conviene avisar en la interfaz de que la plantilla elegida no
cubre todos los iconos del proyecto.

Un icono que falte por error, y no por diseño de la plantilla, deja de dar
señal en la consola.
