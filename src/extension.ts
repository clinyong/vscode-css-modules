"use strict";
import { languages, ExtensionContext, DocumentFilter } from "vscode";
import { CSSModuleCompletionProvider } from "./CompletionProvider";
import { CSSModuleDefinitionProvider } from "./DefinitionProvider";
import { readOptions } from "./options";
import { subscribeToTsConfigChanges } from "./utils/ts-alias";

export function activate(context: ExtensionContext): void {
  const mode: DocumentFilter[] = [
    { language: "typescriptreact", scheme: "file" },
    { language: "javascriptreact", scheme: "file" },
    { language: "javascript", scheme: "file" },
  ];
  const options = readOptions();
  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      mode,
      new CSSModuleCompletionProvider(options),
      "."
    )
  );
  context.subscriptions.push(
    languages.registerDefinitionProvider(
      mode,
      new CSSModuleDefinitionProvider(options)
    )
  );

  /**
   * Subscribe to the ts config changes
   */
  context.subscriptions.push(...subscribeToTsConfigChanges());
}

export function deactivate(): void {}
