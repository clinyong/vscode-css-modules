import { DefinitionProvider, TextDocument, Position, CancellationToken, Location, Uri } from "vscode";
import { getCurrentLine, findImportPath } from "./utils";
import * as path from "path";
import * as fs from "fs";

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

function isImportLine(line: string): RegExpExecArray | null {
    return /\s+(\S+)\s+=\s+require\(['"](.+\.\S{1,2}ss)['"]\)/.exec(line);
}

function isValidMatches(line: string, matches: RegExpExecArray, current: number): boolean {
    if (matches === null) {
        return false;
    }

    const start1 = line.indexOf(matches[1]) + 1;
    const start2 = line.indexOf(matches[2]) + 1;
    return (current > start2 && current < start2 + matches[2].length) || (current > start1 && current < start1 + matches[1].length);
}

export class CSSModuleDefinitionProvider implements DefinitionProvider {
    public provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Thenable<Location> {
        const currentDir = path.dirname(document.uri.fsPath);
        const currentLine = getCurrentLine(document, position);

        const matches = isImportLine(currentLine);
        if (isValidMatches(currentLine, matches, position.character)) {
            return Promise.resolve(new Location(
                Uri.file(path.resolve(currentDir, matches[2])),
                new Position(0, 0)
            ));
        }

        const words = getWords(currentLine, position);
        const [obj, field] = words.split(".");
        if (!field) {
            return Promise.resolve(null);
        }

        const importPath = findImportPath(document.getText(), obj, currentDir);
        const targetPosition = getPosition(importPath, field);

        if (targetPosition === null) {
            return Promise.resolve(null);
        } else {
            return Promise.resolve(new Location(Uri.file(importPath), targetPosition));
        }
    }
}

export default CSSModuleDefinitionProvider;
