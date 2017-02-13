import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import { CSSModuleDefinitionProvider } from "../src/DefinitionProvider";

const rootPath = path.join(__dirname, "../..");
const tsxFile = path.join(rootPath, "./test/fixtures/sample.jsx");
const uri = vscode.Uri.file(tsxFile);

test("testing definition", () => {
    return Promise.resolve(
        vscode.workspace.openTextDocument(uri).then(text => {
            const provider = new CSSModuleDefinitionProvider;
            const position = new vscode.Position(1, 20);
            return provider.provideDefinition(text, position, undefined).then(location => {
                const {line, character} = location.range.start;
                assert.equal(true, line === 2 && character === 1);
            });
        })
    ).catch(err => {
        assert.ok(false, `error in OpenTextDocument ${err}`);
    });
});
