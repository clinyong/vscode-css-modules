import * as vscode from "vscode";
import * as JSON5 from "json5";
import * as fse from "fs-extra";
import { PathAlias } from "../options";
import { WORKSPACE_FOLDER_VARIABLE } from "../constants";

const cachedMappings = new Map<string, PathAlias>();

function memoize(
  fn: (workfolder: vscode.WorkspaceFolder) => Promise<PathAlias>
) {
  async function cachedFunction(
    workfolder?: vscode.WorkspaceFolder
  ): Promise<PathAlias> {
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

function getBaseUrlFromTsConfig(tsconfig: {
  compilerOptions: { baseUrl: string };
}): string {
  const baseUrl = tsconfig?.compilerOptions?.baseUrl;
  if (baseUrl) {
    return baseUrl.startsWith("./") ? baseUrl.replace("./", "") : baseUrl;
  }

  return "";
}

export const getTsAlias = memoize(async function (
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
