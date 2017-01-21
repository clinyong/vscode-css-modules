import { Position } from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as _ from "lodash";

export function getVar(line: string, position: Position): string {
    const text = line.slice(0, position.character - 1)

    const indexBySpace = text.lastIndexOf(" ");
    const indexByBracket = text.lastIndexOf("{");

    if (indexBySpace > indexByBracket) {
        return text.slice(indexBySpace + 1)
    } else {
        return text.slice(indexByBracket + 1)
    }
}

export function findImportPath(text: string, key: string, parentPath: string): string {
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

export function isCSSLikeFile(filePath: string): boolean {
    const ext = path.extname(filePath);
    return ext === ".css" || ext === ".scss";
}

export function getAllClassNames(filePath: string): string[] {
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