import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import { CSSModuleCompletionProvider } from "../src/CompletionProvider";

const rootPath = path.join(__dirname, "../..");
const tsxFile = path.join(rootPath, "./test/fixtures/sample.tsx");
const uri = vscode.Uri.file(tsxFile);

test("test completion items length", done => {
    return vscode.workspace.openTextDocument(uri).then(text => {
        const provider = new CSSModuleCompletionProvider();
        const position = new vscode.Position(1, 19);
        return provider.provideCompletionItems(text, position).then(items => {
            assert.equal(4, items.length);
            done();
        });
    }, err => {
        assert.ok(false, `error in OpenTextDocument ${err}`);
        done(err);
    });
});
