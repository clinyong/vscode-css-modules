import { CompletionItemProvider, TextDocument, Position, CompletionItem, CompletionItemKind } from "vscode";
import * as path from "path";
import {
    getVar,
    isCSSLikeFile,
    findImportPath,
    getAllClassNames
} from "./utils";

function getTrigger(line: string, position: Position): string {
    return line.substr(position.character - 1, 1);
}

export class CSSModuleCompletionProvider implements CompletionItemProvider {
    provideCompletionItems(document: TextDocument, position: Position): Thenable<CompletionItem[]> {
        const currentLine = document.getText(document.lineAt(position).range);
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