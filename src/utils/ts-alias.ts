import * as vscode from "vscode";
import * as path from "path";
import * as JSON5 from "json5";
import * as _ from "lodash";
import * as fse from "fs-extra";
import { AliasFromTsConfig } from "../options";
import { WORKSPACE_FOLDER_VARIABLE } from "../constants";

type TsConfigPaths = Record<string, string[]>;
const cachedMappings = new Map<string, AliasFromTsConfig>();

function memoize(
  fn: (workfolder: vscode.WorkspaceFolder) => Promise<AliasFromTsConfig>
) {
  async function cachedFunction(
    workfolder?: vscode.WorkspaceFolder
  ): Promise<AliasFromTsConfig> {
    if (!workfolder) {
      return Promise.resolve({});
    }

    const key = workfolder.name;
    const cachedMapping = cachedMappings.get(key);

    if (cachedMapping) {
      return cachedMapping;
    } else {
      const result = await fn(workfolder);
      cachedMappings.set(key, result);
      return result;
    }
  }

  return cachedFunction;
}

function invalidateCache(workfolder: vscode.WorkspaceFolder) {
  cachedMappings.delete(workfolder.name);
}

export function _removePathsSign(paths: TsConfigPaths): TsConfigPaths {
  const formatPaths: TsConfigPaths = {};
  function removeEndSign(str: string) {
    return str.endsWith("*") ? str.slice(0, str.length - 1) : str;
  }

  Object.keys(paths).forEach((k) => {
    formatPaths[removeEndSign(k)] = paths[k].map(removeEndSign);
  });

  return formatPaths;
}

export function _getAliasFromTsConfigPaths(tsconfig: {
  compilerOptions: {
    baseUrl: string;
    paths: TsConfigPaths;
  };
}): AliasFromTsConfig | null {
  function removeTrailingSlash(str: string) {
    return str.endsWith("/") ? str.slice(0, str.length - 1) : str;
  }
  function joinPath(p: string) {
    return path.join(WORKSPACE_FOLDER_VARIABLE, baseUrl, removeTrailingSlash(p));
  }

  let paths = tsconfig?.compilerOptions?.paths;
  const baseUrl = tsconfig?.compilerOptions?.baseUrl;
  if (!baseUrl || _.isEmpty(paths)) {
    return null;
  }

  paths = _removePathsSign(paths);
  const pathAlias: AliasFromTsConfig = {};
  Object.keys(paths).forEach((k) => {
    pathAlias[removeTrailingSlash(k)] = paths[k].map(joinPath);
  });

  return pathAlias;
}

export const getTsAlias = memoize(async function (
  workfolder: vscode.WorkspaceFolder
): Promise<AliasFromTsConfig> {
  const include = new vscode.RelativePattern(workfolder, "[tj]sconfig.json");
  const exclude = new vscode.RelativePattern(workfolder, "**/node_modules/**");
  const files = await vscode.workspace.findFiles(include, exclude);

  let mapping: AliasFromTsConfig = {};
  for (let i = 0; i < files.length; i++) {
    try {
      const fileContent = await fse.readFile(files[i].fsPath, "utf8");
      const configFile = JSON5.parse(fileContent);
      const aliasFromPaths = _getAliasFromTsConfigPaths(configFile);
      if (aliasFromPaths) {
        mapping = Object.assign({}, mapping, aliasFromPaths);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return mapping;
});

export function subscribeToTsConfigChanges(): vscode.Disposable[] {
  const disposables: vscode.Disposable[] = [];
  for (const workfolder of vscode.workspace.workspaceFolders || []) {
    const pattern = new vscode.RelativePattern(workfolder, "[tj]sconfig.json");
    const fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
    fileWatcher.onDidChange(() => invalidateCache(workfolder));
    disposables.push(fileWatcher);
  }
  return disposables;
}
