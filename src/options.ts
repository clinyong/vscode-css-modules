import { workspace } from "vscode";
import { EXT_NAME } from "./constants";

export type CamelCaseValues = false | true | "dashes";
export type PathAlias = Record<string, string>;

export interface ExtensionOptions {
    camelCase: CamelCaseValues;
    pathAlias: PathAlias;
}

export function readOptions(): ExtensionOptions {
    const configuration = workspace.getConfiguration(EXT_NAME);
    const camelCase = configuration.get<CamelCaseValues>("camelCase", false);
    const pathAlias = configuration.get<PathAlias>("pathAlias", {});

    return {
        camelCase,
        pathAlias,
    };
}
