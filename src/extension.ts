"use strict";
import {
    languages,
    ExtensionContext,
    DocumentFilter
} from "vscode";
import { CSSModuleCompletionProvider } from "./CompletionProvider";
import { CSSModuleDefinitionProvider } from "./DefinitionProvider";
import { readOptions } from "./options";

export function activate(context: ExtensionContext) {
    const mode: DocumentFilter[] = [
        { language: "typescriptreact", scheme: "file" },
        { language: "javascriptreact", scheme: "file" },
        { language: "javascript", scheme: "file" }
    ];
    const options = readOptions()
    context.subscriptions.push(
        languages.registerCompletionItemProvider(mode, new CSSModuleCompletionProvider(options), ".")
    );
    context.subscriptions.push(
        languages.registerDefinitionProvider(mode, new CSSModuleDefinitionProvider(options))
    );
}

export function deactivate() {
}
