'use strict';
import { languages, ExtensionContext, DocumentFilter } from 'vscode';
import { CSSModuleCompletionProvider } from "./CSSModuleCompletionProvider";

export function activate(context: ExtensionContext) {
    const mode: DocumentFilter = { language: 'plaintext', scheme: 'file' };
    const trigger = "\.";
    context.subscriptions.push(
        languages.registerCompletionItemProvider(mode, new CSSModuleCompletionProvider(), trigger)
    );
}

export function deactivate() {
}