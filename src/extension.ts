"use strict";
import {
    languages,
    ExtensionContext,
    DocumentFilter,
    workspace,
} from "vscode";
import { CSSModuleCompletionProvider } from "./CompletionProvider";
import { CSSModuleDefinitionProvider } from "./DefinitionProvider";
import { CamelCaseValues } from "./utils";

const extName = "cssModules";

export function activate(context: ExtensionContext) {
    const mode: DocumentFilter = [
        { language: "typescriptreact", scheme: "file" },
        { language: "javascriptreact", scheme: "file" },
        { language: "typescript", scheme: "file" },
        { language: "javascript", scheme: "file" }
    ];
    const configuration = workspace.getConfiguration(extName);
    const camelCaseConfig: CamelCaseValues = configuration.get("camelCase", false);

    context.subscriptions.push(
        languages.registerCompletionItemProvider(mode, new CSSModuleCompletionProvider(camelCaseConfig), ".")
    );
    context.subscriptions.push(
        languages.registerDefinitionProvider(mode, new CSSModuleDefinitionProvider(camelCaseConfig))
    );
}

export function deactivate() {
}
