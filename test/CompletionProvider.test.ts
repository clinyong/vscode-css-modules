import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import { CSSModuleCompletionProvider } from "../src/CompletionProvider";

import { CamelCaseValues } from "../src/utils";

const rootPath = path.join(__dirname, "../..");
const tsxFile = path.join(rootPath, "./test/fixtures/sample.jsx");
const uri = vscode.Uri.file(tsxFile);

function testCompletion(position: vscode.Position) {
    return vscode.workspace.openTextDocument(uri).then(text => {
        const provider = new CSSModuleCompletionProvider();
        return provider.provideCompletionItems(text, position).then(items => {
            assert.equal(5, items.length);
        });
    });
}

function testCompletionWithCase(position: vscode.Position, camelCaseConfig: CamelCaseValues, assertions: Array<Function>) {
    return vscode.workspace.openTextDocument(uri).then(text => {
        const provider = new CSSModuleCompletionProvider(camelCaseConfig);
        return provider.provideCompletionItems(text, position).then(items => {
            assertions.map((assertion) => assertion(items));
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

test("test camelCase:false style completion", () => {
    const position = new vscode.Position(5, 21);
    return Promise.resolve(
        testCompletionWithCase(position, false, [
            (items) => assert.equal(1, items.length),
            (items) => assert.equal("sidebar_without-header", items[0].label),
        ])
    ).catch(err => {
        assert.ok(false, `error in OpenTextDocument ${err}`);
    });
});

test("test camelCase:true style completion", () => {
    const position = new vscode.Position(5, 21);
    return Promise.resolve(
        testCompletionWithCase(position, true, [
            (items) => assert.equal(1, items.length),
            (items) => assert.equal("sidebarWithoutHeader", items[0].label),
        ])
    ).catch(err => {
        assert.ok(false, `error in OpenTextDocument ${err}`);
    });
});

test("test camelCase:dashes style completion", () => {
    const position = new vscode.Position(5, 21);
    return Promise.resolve(
        testCompletionWithCase(position, "dashes", [
            (items) => assert.equal(1, items.length),
            (items) => assert.equal("sidebar_withoutHeader", items[0].label),
        ])
    ).catch(err => {
        assert.ok(false, `error in OpenTextDocument ${err}`);
    });
});
