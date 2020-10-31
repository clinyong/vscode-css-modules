import { CompletionItemProvider, TextDocument, Position, CompletionItem, CompletionItemKind } from "vscode";
import * as path from "path";
import * as _ from "lodash";
import {
    findImportPath,
    getAllClassNames,
    getCurrentLine,
} from "./utils";
import { dashesCamelCase, CamelCaseValues } from "./utils";

// check if current character or last character is .
function isTrigger(line: string, position: Position): boolean {
    const i = position.character - 1;
    return line[i] === "." || (i > 1 && line[i - 1] === ".");
}

function getWords(line: string, position: Position): string {
    const text = line.slice(0, position.character);
    const index = text.search(/[a-zA-Z0-9\._]*$/);
    if (index === -1) {
        return "";
    }

    return text.slice(index);
}

export class CSSModuleCompletionProvider implements CompletionItemProvider {
    _classTransformer = null;

    constructor(camelCaseConfig?: CamelCaseValues) {
        switch (camelCaseConfig) {
            case true:
              this._classTransformer = _.camelCase;
              break;
            case "dashes":
              this._classTransformer = dashesCamelCase;
              break;
            default: break;
        }
    }

    provideCompletionItems(document: TextDocument, position: Position): Thenable<CompletionItem[]> {
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

        const importPath = findImportPath(document.getText(), obj, currentDir);
        if (importPath === "") {
            return Promise.resolve([]);
        }

        const classNames = getAllClassNames(importPath, field);

        return Promise.resolve(classNames.map(_class => {
            let name = _class;
            if (!!this._classTransformer) {
                name = this._classTransformer(name);
            }
            return new CompletionItem(name, CompletionItemKind.Variable);
        }));
    }
}

export default CSSModuleCompletionProvider;
