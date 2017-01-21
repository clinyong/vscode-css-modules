import { CompletionItemProvider, TextDocument, Position, CompletionItem, CompletionItemKind } from "vscode";
import * as path from "path";
import {
    isCSSLikeFile,
    findImportPath,
    getAllClassNames,
    getCurrentLine
} from "./utils";

function getTrigger(line: string, position: Position): string {
    return line.substr(position.character - 1, 1);
}

function getVar(line: string, position: Position): string {
    const text = line.slice(0, position.character - 1)

    const indexBySpace = text.lastIndexOf(" ");
    const indexByBracket = text.lastIndexOf("{");

    if (indexBySpace > indexByBracket) {
        return text.slice(indexBySpace + 1)
    } else {
        return text.slice(indexByBracket + 1)
    }
}

export class CSSModuleCompletionProvider implements CompletionItemProvider {
    provideCompletionItems(document: TextDocument, position: Position): Thenable<CompletionItem[]> {
        const currentLine = getCurrentLine(document, position);
        const currentDir = path.dirname(document.uri.fsPath);

        const trigger = getTrigger(currentLine, position);
        if (trigger !== ".") {
            return Promise.resolve([]);
        }

        const word = getVar(currentLine, position);

        const importPath = findImportPath(document.getText(), word, currentDir)
        if (!isCSSLikeFile(importPath)) {
            return Promise.resolve([]);
        }

        const classNames = getAllClassNames(importPath);

        return Promise.resolve(classNames.map(name => new CompletionItem(name, CompletionItemKind.Variable)));
    }
}

export default CSSModuleCompletionProvider;