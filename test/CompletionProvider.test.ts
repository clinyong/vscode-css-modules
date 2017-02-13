import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import { CSSModuleCompletionProvider } from "../src/CompletionProvider";

const rootPath = path.join(__dirname, "../..");
const tsxFile = path.join(rootPath, "./test/fixtures/sample.jsx");
const uri = vscode.Uri.file(tsxFile);

function testCompletion(position: vscode.Position) {
    return vscode.workspace.openTextDocument(uri).then(text => {
        const provider = new CSSModuleCompletionProvider();
        return provider.provideCompletionItems(text, position).then(items => {
            assert.equal(4, items.length);
        });
    });
}

test("test es6 style completion", () => {
    const position = new vscode.Position(3, 20);
    return Promise.resolve(
        testCompletion(position)
    ).catch(err => {
        assert.ok(false, `error in OpenTextDocument ${err}`);
    });
});

test("test commonJS style completion", () => {
    const position = new vscode.Position(4, 20);
    return Promise.resolve(
        testCompletion(position)
    ).catch(err => {
        assert.ok(false, `error in OpenTextDocument ${err}`);
    });
});
