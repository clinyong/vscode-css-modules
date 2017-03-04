import { Position, TextDocument } from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as _ from "lodash";

export function getCurrentLine(document: TextDocument, position: Position): string {
    return document.getText(document.lineAt(position).range);
}

export function genImportRegExp(key: string ): RegExp {
    const file = "(.+\\.\\S{1,2}ss)";
    const fromOrRequire = "(?:from\\s+|=\\s+require\\()";
    const requireEndOptional = "\\)?";
    const pattern = `${key}\\s+${fromOrRequire}["']${file}["']${requireEndOptional}`;
    return new RegExp(pattern);
}

export function findImportPath(text: string, key: string, parentPath: string): string {
    const re = genImportRegExp(key);
    const results = re.exec(text);
    if (!!results && results.length > 0) {
        return path.resolve(parentPath, results[1]);
    } else {
        return "";
    }
}

export function getAllClassNames(filePath: string, keyword: string): string[] {
    const content = fs.readFileSync(filePath, { encoding: "utf8" });
    const lines = content.match(/.*[,{]/g);
    if (lines === null) {
        return [];
    }

    const classNames = lines.join(" ").match(/\.[_A-Za-z0-9\-]+/g);
    if (classNames === null) {
        return [];
    }

    const uniqNames = _.uniq(classNames).map(item => item.slice(1));
    return keyword !== "" ? uniqNames.filter(item => item.indexOf(keyword) !== -1) : uniqNames;
}

export type CamelCaseValues = false | true | "dashes";
