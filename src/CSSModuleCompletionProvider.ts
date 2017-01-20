import { CompletionItemProvider, TextDocument, Position, CompletionItem } from "vscode";

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

function getTrigger(line: string, position: Position): string {
    return line.substr(position.character - 1, 1);
}

function findImportPath(text: string, key: string): string {
    // const match = `${key}\\s+from\\s+["'](.+)["']`
    const match = `${key}\\s+=\\s+require\\(["'](.+)["']\\)`;
    const re = new RegExp(match, "g");
    const results = re.exec(text);
    if (!!results && results.length > 0) {
        return results[1];
    } else {
        return ""
    }
}

export class CSSModuleCompletionProvider implements CompletionItemProvider {
    provideCompletionItems(document: TextDocument, position: Position): Thenable<CompletionItem[]> {
        const currentLine = document.getText(document.lineAt(position).range);

        const trigger = getTrigger(currentLine, position);
        if (trigger !== ".") {
            return Promise.resolve([]);
        }

        const word = getVar(currentLine, position);

        const importPath = findImportPath(document.getText(), word)
        console.log(importPath)
        return Promise.resolve([]);
    }
}

export default CSSModuleCompletionProvider;