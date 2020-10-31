import { Position, TextDocument } from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as _ from "lodash";

export function getCurrentLine(document: TextDocument, position: Position): string {
    return document.getText(document.lineAt(position).range);
}

export function genImportRegExp(key: string ): RegExp {
    const file = "(.+\\.\\S{1,2}ss)";
    const fromOrRequire = "(?:from\\s+|=\\s+require(?:<any>)?\\()";
    const requireEndOptional = "\\)?";
    const pattern = `${key}\\s+${fromOrRequire}["']${file}["']${requireEndOptional}`;
    return new RegExp(pattern);
}

export function findImportPath(text: string, key: string, parentPath: string): string {
    const re = genImportRegExp(key);
    const results = re.exec(text);

    if (!results || results.length === 0) return "";
    if (results[1].charAt(0) === ".") return path.resolve(parentPath, results[1]);

    const configFilePath = findConfigFilePath(parentPath);
    if (!configFilePath) return "";
    const rawConfigFile = fs.readFileSync(configFilePath);
    const configFile = JSON.parse(rawConfigFile.toString());
    const baseUrl = configFile.compilerOptions.baseUrl;
    return path.resolve(configFilePath, "..", baseUrl, results[1]);
}

function findConfigFilePath(startPath: string): string {
    let output: string = undefined;

    const fileNames = ["jsconfig.json", "tsconfig.json"];
    fileNames.forEach(fileName => {
        try {
            const filePath = path.resolve(startPath, fileName);
            fs.accessSync(filePath, fs.constants.F_OK);
            output = filePath;
        } catch (err) {}
    });
    if (output) return output;

    const parentPath = path.resolve(startPath, "..");
    return parentPath === startPath ? "" : findConfigFilePath(parentPath);
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

// from css-loader's implementation
// source: https://github.com/webpack-contrib/css-loader/blob/22f6621a175e858bb604f5ea19f9860982305f16/lib/compile-exports.js
export function dashesCamelCase(str) {
  return str.replace(/-(\w)/g, function(match, firstLetter) {
    return firstLetter.toUpperCase();
  });
}

export type CamelCaseValues = false | true | "dashes";
