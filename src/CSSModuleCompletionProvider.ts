import { CompletionItemProvider, TextDocument, Position, CompletionItem, CompletionItemKind } from "vscode";
import * as path from "path";
import {
    findImportPath,
    getAllClassNames,
    getCurrentLine
} from "./utils";

// check if current character or last character is .
function isTrigger(line: string, position: Position): boolean {
    const i = position.character - 1;
    return line[i] === "." || (i > 1 && line[i - 1] === ".");
}

function getWords(line: string, position: Position): string {
    const text = line.slice(0, position.character);

    const indexBySpace = text.lastIndexOf(" ");
    const indexByBracket = text.lastIndexOf("{");

    if (indexBySpace > indexByBracket) {
        return text.slice(indexBySpace + 1);
    } else {
        return text.slice(indexByBracket + 1);
    }
}

export class CSSModuleCompletionProvider implements CompletionItemProvider {
    provideCompletionItems(document: TextDocument, position: Position): Thenable<CompletionItem[]> {
        const currentLine = getCurrentLine(document, position);
        const currentDir = path.dirname(document.uri.fsPath);

        if (!isTrigger(currentLine, position)) {
            return Promise.resolve([]);
        }

        const words = getWords(currentLine, position);
        const [obj, field] = words.split(".");

        const importPath = findImportPath(document.getText(), obj, currentDir);
        const classNames = getAllClassNames(importPath, field);

        return Promise.resolve(classNames.map(name => new CompletionItem(name, CompletionItemKind.Variable)));
    }
}

export default CSSModuleCompletionProvider;
