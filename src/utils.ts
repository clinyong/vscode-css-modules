import { Position, TextDocument } from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as _ from "lodash";

export function getCurrentLine(document: TextDocument, position: Position): string {
    return document.getText(document.lineAt(position).range);
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