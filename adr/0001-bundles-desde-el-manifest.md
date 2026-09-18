# 0001. Reconstruir los bundles de eXeLearning desde el manifest

- **Estado:** aceptada
- **Fecha:** 2026-09-18

## Contexto

El editor necesita los recursos del motor de eXeLearning para previsualizar y
exportar con fidelidad. Hasta la versión 4.0.3, el paquete estático oficial los
publicaba ya empaquetados: `bundles/common.zip`, `bundles/idevices.zip`,
`bundles/libs.zip`, `bundles/content-css.zip` y un `.zip` por plantilla. El
script de sincronización solo tenía que copiarlos, y el adaptador
(`app/exe-runtime/exe-runtime.js`) los leía directamente.

Desde la 4.0.5 esos archivos ya no viajan en la release. Solo se publica
`bundles/manifest.json`, que relaciona cada archivo del paquete con la ruta que
le corresponde dentro del sitio exportado, y es la propia aplicación de
eXeLearning la que los comprime cuando hace falta. Al sincronizar sin más, el
script borró los `.zip` antiguos sin poder sustituirlos y dejó el editor sin
recursos.

## Decisión

El script de sincronización reconstruye los `.zip` a partir de
`bundles/manifest.json`, con `scripts/build-bundles-from-manifest.mjs`,
respetando exactamente la estructura interna que tenían: un archivo por
plantilla, uno de iDevices donde cada entrada lleva delante el nombre de su
iDevice, y los de `libs`, `common` y `content-css`. Al terminar se comprueba
que el número de archivos de cada bundle coincide con el que declara el
manifest.

El script admite los dos formatos y elige según lo que traiga el origen: si
encuentra los `.zip`, los copia como antes; si no, los reconstruye.

## Alternativas descartadas

**Adaptar el adaptador para leer archivos sueltos.** Es lo que parece más
simple mirando solo la versión nueva, y por eso conviene dejar escrito por qué
no se hizo. Obligaba a reescribir la parte del editor que resuelve recursos,
que es justamente la que hay que tocar con más cuidado, y a hacerlo sin ninguna
mejora visible para quien usa el programa. Además habría roto la posibilidad de
sincronizar una versión anterior, porque el código nuevo ya no entendería el
formato antiguo.

**Congelar los bundles de la 4.0.3.** Habría dejado el editor previsualizando
con un motor distinto del que usa quien edita, que es lo contrario de lo que
promete.

## Consecuencias

El adaptador y el resto del editor no cambian: siguen recibiendo los mismos
archivos que antes, de modo que los estilos creados con versiones anteriores se
siguen abriendo y editando igual.

La sincronización necesita ahora el comando `zip`, además de `gh`, `unzip` y
`node`.

Si en el futuro eXeLearning cambia la forma del manifest, el punto que hay que
revisar es `scripts/build-bundles-from-manifest.mjs`, no el adaptador. La
comprobación del número de archivos avisa si la correspondencia deja de
cuadrar.
