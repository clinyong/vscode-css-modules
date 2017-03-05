# VSCode CSS Modules

[![Build Status](https://travis-ci.org/clinyong/vscode-css-modules.svg?branch=master)](https://travis-ci.org/clinyong/vscode-css-modules)

Extension for [CSS Modules](https://github.com/css-modules/css-modules), which supports

- autocomplete
- go to definition

## Demo

![](http://i.giphy.com/l0EwY2Mk4IBgIholi.gif)

## Installation

Search `css modules` on the [VS Code Marketplace](https://code.visualstudio.com/Docs/editor/extension-gallery#_browse-and-install-extensions-in-vs-code).

## Usage

Currently, this extension only support React project. That means it only enable on `tsx` or `jsx` file.

## Settings

### CamelCase for autocomplete

If you write `kebab-case` classes in css files, but want to get `camelCase` complete items, set following to true.

```json
{
   "cssModules.camelCase": true 
}
```

## Feedback

Feel free to submit any issues or pull request.
