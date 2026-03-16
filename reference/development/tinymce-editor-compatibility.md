# Instrucciones para IA: hacer visibles los estilos en el editor de eXeLearning

Este documento define cómo debe actuar una IA que genera o modifica estilos de eXeLearning cuando el objetivo es que los cambios también se vean dentro del editor TinyMCE.

## Regla principal

En la versión actual de eXeLearning, TinyMCE no carga un `editor.css` del tema.

La referencia relevante está en el repositorio de eXeLearning:

- `public/app/editor/tinymce_5_settings.js`: `getContentCSS()` carga `tinymce_5_extra.css`, `bootstrap.min.css` y `style.css` del tema.
- Los temas oficiales incluyen ajustes para TinyMCE dentro de `style.css`, normalmente usando `body#tinymce`.

Consecuencia práctica:

- Si un estilo está en otro archivo CSS de la raíz del tema, puede funcionar en exportación y en la vista previa general.
- Pero para TinyMCE no debe asumirse que se aplicará.
- Si se quiere compatibilidad con el editor, la regla debe existir en `style.css`.

## Regla operativa para esta aplicación

Este editor:

- conserva todos los archivos del tema
- exporta todos los archivos del ZIP
- escribe los ajustes seguros y automáticos en `style.css`
- no debe repartir cambios automáticos entre varios CSS arbitrarios

Por tanto, cuando la IA genere o modifique estilos con intención de que se vean también en TinyMCE:

1. Debe escribir las reglas necesarias en `style.css`.
2. No debe depender de un archivo `editor.css`.
3. No debe mover automáticamente reglas críticas a otros CSS de raíz.
4. Si el tema ya usa varios CSS, debe mantenerlos, pero duplicar o trasladar a `style.css` las reglas necesarias para edición.

## Qué reglas suelen verse bien en TinyMCE

TinyMCE renderiza el contenido en un documento propio. Por eso funcionan mejor las reglas centradas en contenido editable:

- tipografía base
- tamaño de texto
- interlineado
- color de texto
- enlaces
- listas
- tablas
- bloques con clases aplicadas al contenido
- cajas y bloques reutilizables

Las reglas más fiables son:

- reglas basadas en clases del contenido
- reglas pensadas para `body#tinymce`
- reglas que no dependan de contenedores externos de la exportación

## Qué no debe asumir la IA

La IA no debe asumir que en TinyMCE existirán exactamente los mismos contenedores que en la exportación.

Debe evitar depender de:

- `body.exe-export`
- `body.exe-web-site`
- estructuras de navegación
- cabeceras globales del tema
- pies de página
- wrappers externos que no forman parte del contenido editable
- CSS adicionales que TinyMCE no carga

Si una regla depende de esas estructuras, la IA debe crear una versión específica para el editor.

## Patrón recomendado

Cuando una regla de contenido deba verse también en TinyMCE, la IA debe seguir este patrón:

```css
.mi-bloque {
  border: 2px solid #0a7;
  padding: 1rem;
  background: #eefbf8;
}

body#tinymce .mi-bloque {
  border: 2px solid #0a7;
  padding: 1rem;
  background: #eefbf8;
}
```

Si la regla general ya funciona en TinyMCE, la duplicación no siempre es obligatoria. Pero cuando haya dudas, debe añadirse el selector con `body#tinymce`.

## Patrón para estilos base del editor

Para tipografía y ritmo vertical del contenido editable, la IA debe preferir reglas como estas dentro de `style.css`:

```css
body#tinymce {
  font-family: "Mi Fuente", Arial, sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  color: #333;
}

body#tinymce p {
  margin: 1em 0;
}

body#tinymce a {
  color: #0d77d1;
}
```

## Si el tema tiene varios CSS

Si el tema contiene varios `.css` en raíz:

- la IA debe conservarlos
- no debe reestructurar el tema automáticamente
- debe considerar `style.css` como punto de compatibilidad con TinyMCE

Regla de decisión:

- estilos necesarios para exportación solamente: pueden quedarse en otros CSS
- estilos que también deban verse en TinyMCE: deben existir en `style.css`

## Estrategia de trabajo recomendada para la IA

Cuando el usuario pida “quiero ver esto también en el editor”, la IA debe:

1. Identificar qué reglas del tema afectan al contenido editable.
2. Comprobar si esas reglas viven fuera de `style.css`.
3. Llevar a `style.css` las reglas necesarias o crear una versión equivalente.
4. Añadir selectores con `body#tinymce` cuando la estructura del editor difiera de la exportación.
5. Evitar tocar `style.js` salvo que el cambio sea realmente de comportamiento tras exportar.

## Regla de seguridad

La IA no debe prometer “todo lo de `style.css` se verá igual en el editor”.

Debe asumir esta formulación:

- `style.css` es el archivo correcto para lograr compatibilidad con TinyMCE
- pero algunas reglas requieren adaptación específica con `body#tinymce`
- y otras, si dependen de la plantilla completa, no podrán verse igual dentro del editor

## Respuesta corta modelo para la IA

Si necesita responder en lenguaje natural, debe usar una idea como esta:

“Para que un estilo se vea en el editor de eXeLearning, la regla debe estar en `style.css`. TinyMCE no carga un `editor.css` del tema. Si no se ve bien tal como está, añade una versión específica con `body#tinymce`.”
