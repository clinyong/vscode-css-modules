# VSCode CSS Modules

[![Github Actions](https://github.com/clinyong/vscode-css-modules/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/clinyong/vscode-css-modules/actions)
[![VSCode Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/clinyong.vscode-css-modules)](https://marketplace.visualstudio.com/items?itemName=clinyong.vscode-css-modules)
[![VSCode Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/i/clinyong.vscode-css-modules)](https://marketplace.visualstudio.com/items?itemName=clinyong.vscode-css-modules)
[![VSCode Marketplace Stars](https://img.shields.io/visual-studio-marketplace/r/clinyong.vscode-css-modules)](https://marketplace.visualstudio.com/items?itemName=clinyong.vscode-css-modules)

Extension for [CSS Modules](https://github.com/css-modules/css-modules), which supports

- Autocomplete
- Go to definition

## Demo

![](https://i.giphy.com/l0EwY2Mk4IBgIholi.gif)

## Installation

Search `css modules` on the [VS Code Marketplace](https://code.visualstudio.com/Docs/editor/extension-gallery#_browse-and-install-extensions-in-vs-code).

## Usage

Currently, this extension only support React project.

## Settings

### CamelCase for autocomplete

If you write `kebab-case` classes in css files, but want to get `camelCase` complete items, set following to true.

```json
{
  "cssModules.camelCase": true
}
```

### Path Alias

Create aliases to import or require modules. (In combination with webpack resolve options.)

```json
{
  "cssModules.pathAlias": {
    "@styles1": "${workspaceFolder}/src/styles1",
    "styles2": "${workspaceFolder}/src/styles2"
  }
}
```

If there is a jsconfig or tsconfig in your project, the `compilerOptions.paths` will become aliases. For example

```json
{
  "baseUrl": "./src",
  "paths": {
    "@styles1/*": "styles1/*"
  }
}
```

would allow to type

```js
import * as styles1 from "@styles1/demo.css";
```

## Feedback

Feel free to submit any issues or pull request.

## License

```
 _________________
< The MIT License >
 -----------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
```
