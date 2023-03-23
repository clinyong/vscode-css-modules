import {
  Position,
  TextDocument,
  CompletionItem,
  CompletionItemKind,
  TextEdit,
  Range,
  workspace,
} from "vscode";
import * as fse from "fs-extra";
import * as _ from "lodash";
import { join } from "path";

export function getCurrentLine(
  document: TextDocument,
  position: Position
): string {
  return document.getText(document.lineAt(position).range);
}

// https://github.com/microsoft/vscode-eslint/blob/main/server/src/eslintServer.ts
// This makes loading work in a plain NodeJS and a WebPacked environment
declare const __webpack_require__: typeof require;
declare const __non_webpack_require__: typeof require;
export function loadNodeModule<T>(moduleName: string): T | undefined {
  const r =
    typeof __webpack_require__ === "function"
      ? __non_webpack_require__
      : require;
  try {
    return r(moduleName);
  } catch (err: any) {
    console.log(err);
  }
  return undefined;
}

/**
 * @TODO Refact by new Tokenizer
 */
export async function getAllClassNames(
  filePath: string,
  keyword: string,
  document: TextDocument
): Promise<string[]> {
  // check file exists, if not just return []
  const filePathStat = await fse.stat(filePath);
  if (!filePathStat.isFile()) {
    return [];
  }

  let content = await fse.readFile(filePath, { encoding: "utf8" });
  let matchLineRegexp = /.*[,{]/g;

  // experimental stylus support
  if (filePath.endsWith(".styl") || filePath.endsWith(".stylus")) {
    matchLineRegexp = /\..*/g;
  }

  if (filePath.endsWith(".less")) {
    const lessModulePath = join(
      workspace.getWorkspaceFolder(document.uri).uri.fsPath,
      "node_modules",
      "less"
    );
    const less = loadNodeModule(lessModulePath) as any;
    if (less) {
      // remove all @import
      content = content.replace(/@import.+;/g, "");
      // replace all variable to other value
      content = content.replace(/@.+/g, "unset");
      try {
        content = (await less.render(content)).css;
      } catch (error) {
        console.log(error);
      }
    }
  }

  const lines = content.match(matchLineRegexp);
  if (lines === null) {
    return [];
  }

  const classNames = lines.join(" ").match(/\.[_A-Za-z0-9-]+/g);
  if (classNames === null) {
    return [];
  }

  const uniqNames = _.uniq(classNames)
    .map((item) => item.slice(1))
    .filter((item) => !/^[0-9]/.test(item));
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

/**
 * check kebab-case classname
 */
export function isKebabCaseClassName(className: string): boolean {
  return className?.includes("-");
}

/**
 * BracketCompletionItem Factory
 */
export function createBracketCompletionItem(
  className: string,
  position: Position
): CompletionItem {
  const completionItem = new CompletionItem(
    className,
    CompletionItemKind.Variable
  );
  completionItem.detail = `['${className}']`;
  completionItem.documentation =
    "kebab-casing may cause unexpected behavior when trying to access style.class-name as a dot notation. You can still work around kebab-case with bracket notation (eg. style['class-name']) but style.className is cleaner.";
  completionItem.insertText = `['${className}']`;
  completionItem.additionalTextEdits = [
    new TextEdit(
      new Range(
        new Position(position.line, position.character - 1),
        new Position(position.line, position.character)
      ),
      ""
    ),
  ];
  return completionItem;
}
