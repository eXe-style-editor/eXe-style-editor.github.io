# Worklog IA

Fecha: 2026-03-01

## Objetivo actual

Añadir soporte conservador para el modo de exportación `single page` de eXeLearning en este editor de estilos, minimizando riesgo de regresión.

## Lo que se va a hacer

1. Ampliar los selectores automáticos de `quick-overrides` para incluir `exe-single-page`.
2. Ajustar la lógica de migración/comprobación del bloque `quick-overrides` para que no ignore ese modo.
3. Adaptar la previsualización simulada para poder renderizar una vista de página única con `body.exe-single-page`.
4. Evitar reglas nuevas agresivas: no se tocarán estilos base del usuario fuera de `quick-overrides`, ni se impondrá una maquetación fuerte que pueda romper estilos existentes.

## Criterio técnico

- eXe renderiza `single page` con `body.exe-export.exe-single-page`.
- En ese modo, el contenido se apila en una sola página y se usa sobre todo para impresión/PDF.
- Parte del comportamiento real depende del exportador de eXe y no puede replicarse completamente desde el ZIP del estilo.
- Por eso, este editor solo debe añadir compatibilidad de tema y de previsualización, no intentar sustituir la lógica completa del exportador.

## Estado actual

- Analizado el código de eXeLearning y confirmado que existe el modo `html5-sp`.
- Confirmado que este editor actualmente:
  - reconoce la clase `exe-single-page` en la documentación,
  - pero no la incluía en los selectores automáticos,
  - y la previsualización sigue centrada en el ELPX real, no en una exportación `single page`.
- Cambios ya aplicados en `app/main.js`:
  - `exe-single-page` añadido a los selectores automáticos de modos de entrega.
  - lectura de CSS ampliada para detectar valores específicos de `single page`.
  - migración del bloque `quick-overrides` ampliada para regenerar si falta `exe-single-page`.
  - resumen de ancho por defecto ampliado para detectar pistas de maquetación `single page`.
- Verificación rápida:
  - `node --check app/main.js` ejecutado sin errores de sintaxis.
- Decisión deliberada:
  - la previsualización `single page` no se ha implementado aún en esta pasada para no romper la vista principal de ELPX. Requiere un cambio separado y más fino.
- Preparación de publicación:
  - beta subida a `v1.0.0-beta.7` en los puntos visibles del proyecto (`README.md` e `index.html`).

## Riesgos que se intentan evitar

- Romper estilos oficiales o personalizados que ya traigan reglas propias para `exe-single-page`.
- Sobrescribir CSS manual del usuario fuera del bloque `quick-overrides`.
- Alterar la exportación normal (`website`, `ims`, `scorm`) por introducir selectores demasiado amplios.

## Nota para otras IA

Si continúas este trabajo:

- Mantén el enfoque conservador.
- Prefiere ampliar selectores existentes antes que inventar nuevos bloques CSS complejos.
- Si añades reglas específicas para impresión o `single page`, que sean mínimas y seguras.
