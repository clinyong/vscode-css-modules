import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import { CSSModuleDefinitionProvider } from "../src/DefinitionProvider";

const rootPath = path.join(__dirname, "../..");
const tsxFile = path.join(rootPath, "./test/fixtures/sample.jsx");
const uri = vscode.Uri.file(tsxFile);

function testDefinition(position: vscode.Position) {
    return vscode.workspace.openTextDocument(uri).then(text => {
        const provider = new CSSModuleDefinitionProvider;
        return provider.provideDefinition(text, position, undefined).then(location => {
            const {line, character} = location.range.start;
            assert.equal(true, line === 2 && character === 1);
        });
    });
}

test("testing es6 style definition", () => {
    const position = new vscode.Position(3, 21);
    return Promise.resolve(
        testDefinition(position)
    ).catch(err => {
        assert.ok(false, `error in OpenTextDocument ${err}`);
    });
});

test("testing commonJS style definition", () => {
    const position = new vscode.Position(4, 21);
    return Promise.resolve(
        testDefinition(position)
    ).catch(err => {
        assert.ok(false, `error in OpenTextDocument ${err}`);
    });
});
