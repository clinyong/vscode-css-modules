import { DefinitionProvider, TextDocument, Position, CancellationToken, Location, Uri } from "vscode";
import { getCurrentLine, findImportPath, isCSSLikeFile } from "./utils";
import * as path from "path";
import * as fs from "fs";

function getTextWithinString(text: string) {
    const start = text.indexOf('"');
    const end = text.lastIndexOf('"');

    return text.slice(start + 1, end);
}

function getWords(line: string, position: Position): string {
    const headText = line.slice(0, position.character);
    const tailText = line.slice(position.character);

    const startBySpace = headText.lastIndexOf(" ");
    const startByBracket = headText.lastIndexOf("{");

    const endBySpace = tailText.indexOf(" ");
    const endByBracket = tailText.indexOf("}");

    if (startBySpace === startByBracket) {
        return "";
    }

    if (startBySpace > startByBracket) {
        return `${headText.slice(startBySpace + 1)}${tailText.slice(0, endBySpace)}`;
    } else {
        return `${headText.slice(startByBracket + 1)}${tailText.slice(0, endByBracket)}`;
    }
}

function getPosition(filePath: string, className: string): Position {
    const content = fs.readFileSync(filePath, { encoding: "utf8" });
    const lines = content.split("\n");

    let index = -1;
    const keyWord = `.${className}`;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].indexOf(keyWord) !== -1) {
            index = i;
            break;
        }
    }

    if (index === -1) {
        return null;
    } else {
        return new Position(index, 0);
    }
}

export class CSSModuleDefinitionProvider implements DefinitionProvider {
    public provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Thenable<Location> {
        const currentLine = getCurrentLine(document, position);
        const words = getWords(currentLine, position);
        const currentDir = path.dirname(document.uri.fsPath);

        const [obj, field] = words.split(".");
        const importPath = findImportPath(document.getText(), obj, currentDir);
        if (!isCSSLikeFile(importPath)) {
            return Promise.resolve(null);
        }

        const targetPosition = getPosition(importPath, field);

        if (targetPosition === null) {
            return Promise.resolve(null);
        } else {
            return Promise.resolve(new Location(Uri.file(importPath), targetPosition));
        }
    }
}

export default CSSModuleDefinitionProvider;
