import { CompletionItemProvider, TextDocument, Position, CompletionItem } from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as _ from "lodash";

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

function findImportPath(text: string, key: string, parentPath: string): string {
    // const match = `${key}\\s+from\\s+["'](.+)["']`
    const match = `${key}\\s+=\\s+require\\(["'](.+)["']\\)`;
    const re = new RegExp(match, "g");
    const results = re.exec(text);
    if (!!results && results.length > 0) {
        return path.resolve(parentPath, results[1]);
    } else {
        return ""
    }
}

function isCSSLikeFile(filePath: string): boolean {
    const ext = path.extname(filePath);
    return ext === ".css" || ext === ".scss";
}

function getAllClassNames(filePath: string): string[] {
    const content = fs.readFileSync(filePath, { encoding: "utf8" });
    const lines = content.match(/.*{/g)
    if (lines === null) {
        return [];
    }

    const classNames = lines.join(' ').match(/\.[_A-Za-z0-9\-]+/g)
    if (classNames === null) {
        return [];
    }

    return _.uniq(classNames).map(item => item.slice(1));
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

        return Promise.resolve(classNames.map(name => new CompletionItem(name)));
    }
}

export default CSSModuleCompletionProvider;