import {
  CompletionItemProvider,
  TextDocument,
  Position,
  CompletionItem,
  CompletionItemKind,
  Range,
  TextEdit,
} from "vscode";
import * as path from "path";
import * as _ from "lodash";
import { getAllClassNames, getCurrentLine, dashesCamelCase } from "./utils";
import { findImportModule, resolveImportPath } from "./utils/path";
import { AliasFromUserOptions, ExtensionOptions } from "./options";
import { getRealPathAlias } from "./path-alias";

// check if current character or last character is .
function isTrigger(line: string, position: Position): boolean {
  const i = position.character - 1;
  return line[i] === "." || (i > 1 && line[i - 1] === ".");
}

function getWords(line: string, position: Position): string {
  const text = line.slice(0, position.character);
  // support optional chain https://github.com/tc39/proposal-optional-chaining
  // covert ?. to .
  const convertText = text.replace(/(\?\.)/g, '.');
  const index = convertText.search(/[a-zA-Z0-9._]*$/);
  if (index === -1) {
    return "";
  }

  return convertText.slice(index);
}

export class CSSModuleCompletionProvider implements CompletionItemProvider {
  _classTransformer = null;
  pathAliasOptions: AliasFromUserOptions;

  constructor(options: ExtensionOptions) {
    switch (options.camelCase) {
      case true:
        this._classTransformer = _.camelCase;
        break;
      case "dashes":
        this._classTransformer = dashesCamelCase;
        break;
      default:
        break;
    }

    this.pathAliasOptions = options.pathAlias;
  }

  async provideCompletionItems(
    document: TextDocument,
    position: Position
  ): Promise<CompletionItem[]> {
    const currentLine = getCurrentLine(document, position);
    const currentDir = path.dirname(document.uri.fsPath);

    if (!isTrigger(currentLine, position)) {
      return Promise.resolve([]);
    }

    const words = getWords(currentLine, position);
    if (words === "" || words.indexOf(".") === -1) {
      return Promise.resolve([]);
    }

    const [obj, field] = words.split(".");

    const importModule = findImportModule(document.getText(), obj);
    const importPath = await resolveImportPath(
      importModule,
      currentDir,
      await getRealPathAlias(this.pathAliasOptions, document)
    );
    if (importPath === "") {
      return Promise.resolve([]);
    }

    const classNames = await getAllClassNames(importPath, field);

    return Promise.resolve(
      classNames.map((_class) => {
        let name = _class;
        if (this._classTransformer) {
          name = this._classTransformer(name);
        }
        // handle kebab-case classname
        if (name.includes('-')) {
          const completionItem = new CompletionItem(name, CompletionItemKind.Variable);
          completionItem.detail = `['${name}']`;
          completionItem.documentation = "kebab-casing may cause unexpected behavior when trying to access style.class-name as a dot notation. You can still work around kebab-case with bracket notation (eg. style['class-name']) but style.className is cleaner.";
          completionItem.insertText = `['${name}']`;
          completionItem.additionalTextEdits = [new TextEdit(new Range(new Position(position.line, position.character - 1),
              new Position(position.line, position.character)), '')];
          return completionItem;
        } 
        return new CompletionItem(name, CompletionItemKind.Variable);
      })
    );
  }
}

export default CSSModuleCompletionProvider;
