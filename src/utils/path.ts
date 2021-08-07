import * as path from "path";
import * as fse from "fs-extra";
import { PathAlias } from "../options";

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

export function findImportModule(text: string, key: string): string {
  const re = genImportRegExp(key);
  const results = re.exec(text);
  if (!!results && results.length > 0) {
    return results[1];
  } else {
    return "";
  }
}
