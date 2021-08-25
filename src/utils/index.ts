import { Position, TextDocument } from "vscode";
import * as fse from "fs-extra";
import * as _ from "lodash";

export function getCurrentLine(
  document: TextDocument,
  position: Position
): string {
  return document.getText(document.lineAt(position).range);
}

export async function getAllClassNames(filePath: string, keyword: string): Promise<string[]> {
  // check file exists, if not just return []
  const filePathStat = await fse.stat(filePath);
  if (!filePathStat.isFile()) {
    return [];
  }

  const content = await fse.readFile(filePath, { encoding: "utf8" });
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
