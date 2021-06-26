import * as path from "path";
import * as fse from "fs-extra";
import { PathAlias } from "../options";
import { TextDocument, workspace, WorkspaceEdit } from "vscode";
import { WORKSPACE_FOLDER_VARIABLE } from "../constants";

export function genImportRegExp(key: string): RegExp {
  const file = "(.+\\.\\S{1,2}ss)";
  const fromOrRequire = "(?:from\\s+|=\\s+require(?:<any>)?\\()";
  const requireEndOptional = "\\)?";
  const pattern = `${key}\\s+${fromOrRequire}["']${file}["']${requireEndOptional}`;
  return new RegExp(pattern);
}

export function resolveAliasPath(
  moduleName: string,
  aliasPrefix: string,
  aliasPath: string
): string {
  const replacedModuleName = moduleName.replace(aliasPrefix + "/", "");
  return path.resolve(aliasPath, replacedModuleName);
}

export async function resolveImportPath(
  moduleName: string,
  currentDirPath: string,
  pathAlias: PathAlias
): Promise<string> {
  const realPath = path.resolve(currentDirPath, moduleName);
  if (await fse.pathExists(realPath)) {
    return realPath;
  }

  const aliasPrefix = Object.keys(pathAlias).find((prefix) =>
    moduleName.startsWith(prefix)
  );
  if (aliasPrefix) {
    const aliasPath = pathAlias[aliasPrefix];
    return resolveAliasPath(moduleName, aliasPrefix, aliasPath);
  }

  return "";
}

export async function findImportPath(
  text: string,
  key: string,
  parentPath: string,
  pathAlias: PathAlias
): Promise<string> {
  const re = genImportRegExp(key);
  const results = re.exec(text);
  if (!!results && results.length > 0) {
    return resolveImportPath(results[1], parentPath, pathAlias);
  } else {
    return "";
  }
}

export function replaceWorkspaceFolderWithRootPath(
  pathAlias: PathAlias,
  rootPath: string
): PathAlias {
  const newAlias: PathAlias = {};
  for (const key in pathAlias) {
    newAlias[key] = pathAlias[key].replace(WORKSPACE_FOLDER_VARIABLE, rootPath);
  }

  return newAlias;
}

export function valueContainsWorkspaceFolder(value: string): boolean {
  return value.indexOf(WORKSPACE_FOLDER_VARIABLE) >= 0;
}

export function filterWorkspaceFolderAlias(pathAlias: PathAlias): PathAlias {
  const newAlias: PathAlias = {};
  for (const key in pathAlias) {
    if (!valueContainsWorkspaceFolder(pathAlias[key])) {
      newAlias[key] = pathAlias[key];
    }
  }
  return newAlias;
}

export function replaceWorkspaceFolder(
  pathAlias: PathAlias,
  doc: TextDocument
): PathAlias {
  const workspaceFolder = workspace.getWorkspaceFolder(doc.uri);
  if (workspaceFolder) {
    return replaceWorkspaceFolderWithRootPath(
      pathAlias,
      workspaceFolder.uri.path
    );
  } else {
    return filterWorkspaceFolderAlias(pathAlias);
  }
}
