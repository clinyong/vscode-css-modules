import * as vscode from "vscode";
import { WORKSPACE_FOLDER_VARIABLE } from "./constants";
import { AliasFromUserOptions, PathAlias } from "./options";
import { getTsAlias } from "./utils/ts-alias";

function valueContainsWorkspaceFolder(value: string): boolean {
  return value.indexOf(WORKSPACE_FOLDER_VARIABLE) >= 0;
}

function filterWorkspaceFolderAlias(pathAlias: AliasFromUserOptions): AliasFromUserOptions {
  const newAlias: AliasFromUserOptions = {};
  for (const key in pathAlias) {
    if (!valueContainsWorkspaceFolder(pathAlias[key])) {
      newAlias[key] = pathAlias[key];
    }
  }
  return newAlias;
}

function replaceWorkspaceFolderWithRootPath(
  pathAlias: PathAlias,
  rootPath: string
): PathAlias {
  function replaceAlias(alias: string) {
    return alias.replace(WORKSPACE_FOLDER_VARIABLE, rootPath);
  }

  const newAlias: PathAlias = {};
  for (const key in pathAlias) {
    const aliasValue = pathAlias[key];
    newAlias[key] = Array.isArray(aliasValue)
      ? aliasValue.map(replaceAlias)
      : replaceAlias(aliasValue);
  }

  return newAlias;
}

export async function getRealPathAlias(
  pathAliasOptions: AliasFromUserOptions,
  doc: vscode.TextDocument
): Promise<PathAlias> {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(doc.uri);
  if (workspaceFolder) {
    const tsAlias = await getTsAlias(workspaceFolder);
    // Alias from extension option has higher priority.
    const alias: PathAlias = Object.assign({}, tsAlias, pathAliasOptions);

    return replaceWorkspaceFolderWithRootPath(alias, workspaceFolder.uri.fsPath);
  } else {
    return filterWorkspaceFolderAlias(pathAliasOptions);
  }
}
