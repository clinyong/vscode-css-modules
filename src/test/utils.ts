import { ExtensionOptions } from "../options";

export function readOptions(
    overrides: Partial<ExtensionOptions> = {}
): ExtensionOptions {
    return Object.assign(
        {},
        {
            camelCase: false,
            pathAlias: {},
        },
        overrides
    );
}
