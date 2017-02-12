import { DefinitionProvider, TextDocument, Position, CancellationToken, Location, Uri } from "vscode";
import { getCurrentLine, findImportPath, genImportRegExp } from "./utils";
import * as path from "path";
import * as fs from "fs";
import * as _ from "lodash";

function getWords(line: string, position: Position): string {
    const headText = line.slice(0, position.character);
    const startIndex = headText.search(/[a-zA-Z0-9\._]*$/);
    // not found or not clicking object field
    if (startIndex === -1 || headText.slice(startIndex).indexOf(".") === -1) {
        return "";
    }

    const match = /^([a-zA-Z0-9\._]*)/.exec(line.slice(startIndex));
    if (match === null) {
        return "";
    }

    return match[1];
}

function getPosition(filePath: string, className: string): Position {
    const content = fs.readFileSync(filePath, { encoding: "utf8" });
    const lines = content.split("\n");

    let line = -1;
    let character = -1;
    const keyWord = `.${className}`;
    for (let i = 0; i < lines.length; i++) {
        character = lines[i].indexOf(keyWord);
        if (character !== -1) {
            line = i;
            break;
        }
    }

    if (line === -1) {
        return null;
    } else {
        return new Position(line, character + 1);
    }
}

function isImportLineMatch(line: string, matches: RegExpExecArray, current: number): boolean {
    if (matches === null) {
        return false;
    }

    const start1 = line.indexOf(matches[1]) + 1;
    const start2 = line.indexOf(matches[2]) + 1;

    // check current character is between match words
    return (current > start2 && current < start2 + matches[2].length) || (current > start1 && current < start1 + matches[1].length);
}

export class CSSModuleDefinitionProvider implements DefinitionProvider {
    public provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Thenable<Location> {
        const currentDir = path.dirname(document.uri.fsPath);
        const currentLine = getCurrentLine(document, position);

        const matches = genImportRegExp("(\\S+)").exec(currentLine);
        if (isImportLineMatch(currentLine, matches, position.character)) {
            return Promise.resolve(new Location(
                Uri.file(path.resolve(currentDir, matches[2])),
                new Position(0, 0)
            ));
        }

        const words = getWords(currentLine, position);
        if (words === "" || words.indexOf(".") === -1) {
            return Promise.resolve(null);
        }

        const [obj, field] = words.split(".");
        const importPath = findImportPath(document.getText(), obj, currentDir);
        if (importPath === "") {
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
