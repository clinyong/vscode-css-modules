import { Position, TextDocument } from "vscode";
import * as fse from "fs-extra";
import * as _ from "lodash";

export function getCurrentLine(
  document: TextDocument,
  position: Position
): string {
  return document.getText(document.lineAt(position).range);
}

export function getAllClassNames(filePath: string, keyword: string): string[] {
  const content = fse.readFileSync(filePath, { encoding: "utf8" });
  const lines = content.match(/.*[,{]/g);
  if (lines === null) {
    return [];
  }

  const classNames = lines.join(" ").match(/\.[_A-Za-z0-9-]+/g);
  if (classNames === null) {
    return [];
  }

  const uniqNames = _.uniq(classNames).map((item) => item.slice(1));
  return keyword !== ""
    ? uniqNames.filter((item) => item.indexOf(keyword) !== -1)
    : uniqNames;
}

// from css-loader's implementation
// source: https://github.com/webpack-contrib/css-loader/blob/22f6621a175e858bb604f5ea19f9860982305f16/lib/compile-exports.js
export function dashesCamelCase(str: string): string {
  return str.replace(/-(\w)/g, function (match, firstLetter) {
    return firstLetter.toUpperCase();
  });
}
