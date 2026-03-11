# Manual d'usuari

## Per a què serveix

EdEX permet crear o modificar estils d'eXeLearning sense haver d'editar CSS manualment en la majoria dels casos.

Serveix per a:

- partir d'una plantilla oficial
- carregar un estil `.zip`
- carregar un projecte `.elpx` i canviar-ne l'estil
- importar molts estils legacy d'eXe 2.x i convertir-los en una estructura moderna editable

## Flux recomanat

1. Carrega una plantilla oficial, un ZIP o un ELPX.
2. Revisa la previsualització.
3. Fes canvis globals a `Ajustes`.
4. Usa l'edició per clic si necessites afinar un element concret.
5. Si cal, entra a `Archivos` per editar manualment `style.css`, `config.xml` o recursos.
6. Completa `Información y exportación`.
7. Exporta ZIP o ELPX.

## Modes de treball

### 1. Plantilla oficial

Fes-la servir quan vulguis començar de zero amb una base fiable.

Recomanada per a:

- estils nous
- proves ràpides
- usuaris que no volen partir d'un CSS antic

### 2. Carregar ZIP

Fes-la servir per editar un estil existent.

Què fa:

- carrega els fitxers del tema
- intenta autocorregir mancances mínimes com `style.js` o `screenshot.png`
- permet exportar després un ZIP llest per importar a eXe

### 3. Carregar ELPX

Fes-la servir quan vulguis canviar l'estil d'un projecte real.

Què fa:

- obre el contingut real del projecte a la previsualització
- substitueix o modifica la carpeta del tema dins de l'ELPX
- permet tornar a desar el projecte com a ELPX

## Pestanya Ajustes

Està pensada per a canvis globals i segurs.

Inclou, entre d'altres:

- colors generals
- tipografia
- amplada del contingut
- fons general
- títols de pàgina i de projecte
- logotip institucional
- favicon del projecte exportat
- capçalera i peu
- menú lateral
- iDevices i botons

Convé fer servir `Ajustes` abans que `Archivos` quan hi haja una opció equivalent.

## Edició per clic

S'activa amb el botó d'inspecció de la previsualització.

Serveix per canviar un element concret sense buscar manualment el selector CSS.

Permet editar, segons el tipus d'element:

- color del text
- color de fons
- transparència
- mida i pes del text
- alineació
- marge esquerre i dret
- amplada i amplada màxima
- marge inferior
- padding

Notes importants:

- si tornes a editar el mateix selector, els canvis s'acumulen; no s'haurien d'esborrar entre si
- alguns canvis per clic també es reflecteixen als ajustos ràpids quan equivalen clarament a un ajust global
- no tots els selectors per clic tenen equivalència amb un ajust ràpid

## Pestanya Archivos

Fes-la servir quan necessites control manual.

Permet:

- editar text a `style.css`, `style.js`, `config.xml` i altres fitxers
- reemplaçar imatges
- afegir fonts
- revisar l'estructura real de l'estil

És la via adequada quan:

- el tema té regles especials no cobertes per la interfície
- vols un ajust molt fi
- necessites revisar un tema legacy convertit

## Importació d'estils legacy 2.x

L'editor pot importar molts estils antics d'eXe 2.x.

Què intenta fer automàticament:

- convertir CSS legacy a selectors moderns
- adaptar `config.xml` a un format modern
- reconstruir `style.js` a partir de JS legacy si cal
- copiar icones legacy a `icons/`
- mantenir ajudes de compatibilitat per a capçalera, navegació i altres elements

Què has de tenir en compte:

- la conversió és heurística, no una reproducció perfecta
- alguns estils antics depenien molt del seu propi HTML i JS
- la comprovació final convé fer-la sempre a eXeLearning

## Exportar ZIP o ELPX

### Exportar ZIP

Fes-lo servir per a:

- importar l'estil des de la interfície d'eXeLearning
- desar una plantilla reutilitzable

Abans d'exportar:

- revisa `Nombre` i `Título`
- si has partit d'una plantilla oficial, canvia'ls tots dos

### Exportar ELPX

Fes-lo servir per a:

- desar un projecte amb l'estil ja modificat

Recomanat quan abans has carregat un ELPX real.

## Información y exportación

Camps principals:

- `Nombre`: identificador intern de l'estil
- `Título`: nom visible a eXe
- `Versión`: versió de l'estil
- `Autor`
- `Licencia`
- `URL licencia`
- `Descripción`
- `Descargable`

Notes:

- `Compatibilidad` es manté a `3.0` perquè l'editor treballa amb el format modern
- si `Descargable` val `0`, l'estil es pot editar i exportar igualment, però eXe no l'importarà des de la interfície

## Favicon

Pots afegir un favicon des d'`Ajustes`.

Formats admesos:

- `.ico`
- `.png`

L'editor el desa com:

- `img/favicon.ico`
- o `img/favicon.png`

Això és el que eXe fa servir en exportar el projecte.

## Quan cal usar Ajustes, edició per clic o Archivos

Usa `Ajustes` quan:

- el canvi és global
- hi ha un control clar a la interfície

Usa l'edició per clic quan:

- vols retocar un element concret
- no coneixes el selector CSS

Usa `Archivos` quan:

- no hi ha control a la interfície
- necessites revisar o corregir CSS manualment
- l'estil legacy convertit necessita ajust fi

## Limitacions actuals

- en temes amb diversos fitxers `.css` o `.js` a l'arrel, l'editor els conserva, però els ajustos ràpids escriuen sobre `style.css`
- la conversió d'estils 2.x pot necessitar repàs manual
- la previsualització ajuda molt, però la comprovació final s'ha de fer a eXeLearning

## Recomanacions pràctiques

- exporta versions intermèdies quan facis canvis importants
- si converteixes un estil 2.x, prova primer títols, menú lateral, iDevices i icones
- si un ajust existeix a `Ajustes`, usa'l abans que editar CSS manualment
- si alguna cosa es resisteix en un tema legacy, corregeix-la al final a `Archivos`
