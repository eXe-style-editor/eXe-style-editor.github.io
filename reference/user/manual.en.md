# User manual

## What it is for

EdEX lets you create or modify eXeLearning styles without manually editing CSS in most cases.

You can use it to:

- start from an official template
- load a `.zip` style
- load a `.elpx` project and change its style
- import many legacy eXe 2.x styles and convert them into a modern editable structure

## Recommended workflow

1. Load an official template, a ZIP, or an ELPX.
2. Review the preview.
3. Make global changes in `Settings`.
4. Use click editing if you need to fine-tune a specific element.
5. If needed, go to `Files` to manually edit `style.css`, `config.xml`, or resources.
6. Complete `Information and export`.
7. Export ZIP or ELPX.

## Working modes

### 1. Official template

Use it when you want to start from scratch with a reliable base.

Recommended for:

- new styles
- quick tests
- users who do not want to start from old CSS

### 2. Load ZIP

Use it to edit an existing style.

What it does:

- loads the theme files
- tries to auto-fix minimum missing files such as `style.js` or `screenshot.png`
- lets you export a ZIP ready to import into eXe

### 3. Load ELPX

Use it when you want to change the style of a real project.

What it does:

- opens the real project content in the preview
- replaces or modifies the theme folder inside the ELPX
- lets you save the project again as ELPX

## Settings tab

It is designed for global and safe changes.

It includes, among others:

- general colors
- typography
- content width
- global background
- page and project titles
- institutional logo
- exported project favicon
- header and footer
- side menu
- iDevices and buttons

It is better to use `Settings` before `Files` whenever there is an equivalent option.

## Click editing

It is activated with the inspect button in the preview.

It lets you change a specific element without manually searching for its CSS selector.

Depending on the type of element, you can edit:

- text color
- background color
- transparency
- text size and weight
- alignment
- left and right margins
- width and maximum width
- bottom margin
- padding

Important notes:

- if you edit the same selector again, the changes accumulate; they should not overwrite each other
- some click edits are also reflected in quick settings when they clearly match a global setting
- not every click selector has an equivalent quick setting

## Files tab

Use it when you need manual control.

It lets you:

- edit text in `style.css`, `style.js`, `config.xml`, and other files
- replace images
- add fonts
- inspect the real structure of the style

It is the right option when:

- the theme has special rules not covered by the interface
- you want a very precise adjustment
- you need to review a converted legacy theme

## Importing legacy 2.x styles

The editor can import many old eXe 2.x styles.

What it tries to do automatically:

- convert legacy CSS to modern selectors
- adapt `config.xml` to a modern format
- rebuild `style.js` from legacy JS if needed
- copy legacy icons into `icons/`
- keep compatibility helpers for header, navigation, and other elements

What you should keep in mind:

- the conversion is heuristic, not a perfect reproduction
- some old styles relied heavily on their own HTML and JS
- the final check should always be done in eXeLearning

## Export ZIP or ELPX

### Export ZIP

Use it to:

- import the style from the eXeLearning interface
- save a reusable template

Before exporting:

- review `Name` and `Title`
- if you started from an official template, change both

### Export ELPX

Use it to:

- save a project with its style already modified

Recommended when you previously loaded a real ELPX.

## Information and export

Main fields:

- `Name`: internal style identifier
- `Title`: visible name in eXe
- `Version`: style version
- `Author`
- `License`
- `License URL`
- `Description`
- `Downloadable`

Notes:

- `Compatibility` stays at `3.0` because the editor works with the modern format
- if `Downloadable` is `0`, the style can still be edited and exported, but eXe will not import it from its interface

## Favicon

You can add a favicon from `Settings`.

Accepted formats:

- `.ico`
- `.png`

The editor saves it as:

- `img/favicon.ico`
- or `img/favicon.png`

That is what eXe uses when exporting the project.

## When to use Settings, click editing, or Files

Use `Settings` when:

- the change is global
- there is a clear control in the interface

Use click editing when:

- you want to fine-tune a specific element
- you do not know the CSS selector

Use `Files` when:

- there is no control in the interface
- you need to review or fix CSS manually
- the converted legacy style needs fine adjustment

## Current limitations

- in themes with multiple root `.css` or `.js` files, the editor preserves them, but quick settings write to `style.css`
- conversion of 2.x styles may need manual review
- the preview is very useful, but the final check should be done in eXeLearning

## Practical recommendations

- export intermediate versions when making important changes
- if you convert a 2.x style, first test titles, side menu, iDevices, and icons
- if a change exists in `Settings`, use it before manually editing CSS
- if something is still difficult in a legacy theme, correct it at the end in `Files`
