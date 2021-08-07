import * as vscode from "vscode";
import { WORKSPACE_FOLDER_VARIABLE } from "./constants";
import { PathAlias } from "./options";
import { memoize } from "lodash";
import * as JSON5 from "json5";
import * as fse from "fs-extra";

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

function getBaseUrlFromTsConfig(tsconfig: {
  compilerOptions: { baseUrl: string };
}): string {
  const baseUrl = tsconfig?.compilerOptions?.baseUrl;
  if (baseUrl) {
    return baseUrl.startsWith("./") ? baseUrl.replace("./", "") : baseUrl;
  }

  return "";
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

const getTsAlias = memoize(async function (
  workfolder: vscode.WorkspaceFolder
): Promise<PathAlias> {
  const include = new vscode.RelativePattern(workfolder, "[tj]sconfig.json");
  const exclude = new vscode.RelativePattern(workfolder, "**/node_modules/**");
  const files = await vscode.workspace.findFiles(include, exclude);

  const mapping: PathAlias = {};
  for (let i = 0; i < files.length; i++) {
    try {
      const fileContent = await fse.readFile(files[i].fsPath, "utf8");
      const configFile = JSON5.parse(fileContent);
      const baseUrl = getBaseUrlFromTsConfig(configFile);
      if (baseUrl) {
        mapping[baseUrl] = WORKSPACE_FOLDER_VARIABLE + "/" + baseUrl;
      }
    } catch (e) {
      console.error(e);
    }
  }

  return mapping;
});

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
