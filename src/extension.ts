"use strict";
import { languages, ExtensionContext, DocumentFilter } from "vscode";
import { CSSModuleCompletionProvider } from "./CSSModuleCompletionProvider";
import { CSSModuleDefinitionProvider } from "./CSSModuleDefinitionProvider";

export function activate(context: ExtensionContext) {
    const mode: DocumentFilter = [
        { language: "typescriptreact", scheme: "file" },
        { language: "javascriptreact", scheme: "file" }
    ];
    context.subscriptions.push(
        languages.registerCompletionItemProvider(mode, new CSSModuleCompletionProvider(), ".")
    );
    context.subscriptions.push(
        languages.registerDefinitionProvider(mode, new CSSModuleDefinitionProvider())
    );
}

export function deactivate() {
}