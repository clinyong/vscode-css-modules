import * as vscode from "vscode";
import { WORKSPACE_FOLDER_VARIABLE } from "./constants";
import { PathAlias } from "./options";
import { getTsAlias } from "./utils/tsconfig";

function valueContainsWorkspaceFolder(value: string): boolean {
  return value.indexOf(WORKSPACE_FOLDER_VARIABLE) >= 0;
}

function filterWorkspaceFolderAlias(pathAlias: PathAlias): PathAlias {
  const newAlias: PathAlias = {};
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
  const newAlias: PathAlias = {};
  for (const key in pathAlias) {
    newAlias[key] = pathAlias[key].replace(WORKSPACE_FOLDER_VARIABLE, rootPath);
  }

  return newAlias;
}

export async function getRealPathAlias(
  pathAliasOptions: PathAlias,
  doc: vscode.TextDocument
): Promise<PathAlias> {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(doc.uri);
  if (workspaceFolder) {
    const tsAlias = await getTsAlias(workspaceFolder);
    const alias = Object.assign({}, tsAlias, pathAliasOptions);

    return replaceWorkspaceFolderWithRootPath(alias, workspaceFolder.uri.path);
  } else {
    return filterWorkspaceFolderAlias(pathAliasOptions);
  }
}
