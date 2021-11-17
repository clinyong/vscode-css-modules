import * as path from "path";
import * as fse from "fs-extra";
import { PathAlias } from "../options";

function isPathExist(p: string): Promise<boolean> {
  return (
    fse
      .pathExists(p)
      // ignore error
      .catch(() => false)
  );
}

export function genImportRegExp(key: string): RegExp {
  const file = "(.+\\.(\\S{1,2}ss|stylus|styl))";
  const fromOrRequire = "(?:from\\s+|=\\s+require(?:<any>)?\\()";
  const requireEndOptional = "\\)?";
  const pattern = `\\s${key}\\s+${fromOrRequire}["']${file}["']${requireEndOptional}`;
  return new RegExp(pattern);
}

async function resolveAliasPath(
  moduleName: string,
  aliasPrefix: string,
  aliasPath: string | string[]
): Promise<string> {
  const prefix = aliasPrefix.endsWith("/") ? aliasPrefix : aliasPrefix + "/";
  const replacedModuleName = moduleName.replace(prefix, "");

  const paths = typeof aliasPath === "string" ? [aliasPath] : aliasPath;
  for (let i = 0; i < paths.length; i++) {
    const targetPath = path.resolve(paths[i], replacedModuleName);
    if (await isPathExist(targetPath)) {
      return targetPath;
    }
  }

  return "";
}

export async function resolveImportPath(
  moduleName: string,
  currentDirPath: string,
  pathAlias: PathAlias
): Promise<string> {
  const realPath = path.resolve(currentDirPath, moduleName);
  if (await isPathExist(realPath)) {
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
