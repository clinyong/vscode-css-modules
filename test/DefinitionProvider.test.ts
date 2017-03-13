import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import { CSSModuleDefinitionProvider } from "../src/DefinitionProvider";

import { CamelCaseValues } from "../src/utils";

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

function testDefinitionWithCase(position: vscode.Position, camelCaseConfig: CamelCaseValues, assertions: Array<Function>) {
    return vscode.workspace.openTextDocument(uri).then(text => {
        const provider = new CSSModuleDefinitionProvider(camelCaseConfig);
        return provider.provideDefinition(text, position, undefined).then(location => {
            const position = location ? location.range.start : null;
            assertions.map((assertion) => assertion(position));
        });
    });
}

test("testing es6 style definition", () => {
    const position = new vscode.Position(3, 21);
    return Promise.resolve(
        testDefinition(position)
    ).catch(err => assert.ok(false, `error in OpenTextDocument ${err}`));
});

test("testing commonJS style definition", () => {
    const position = new vscode.Position(4, 21);
    return Promise.resolve(
        testDefinition(position)
    ).catch(err => assert.ok(false, `error in OpenTextDocument ${err}`));
});

test("test camelCase:false style definition", () => {
    const position = new vscode.Position(6, 21);
    return Promise.resolve(
        testDefinitionWithCase(position, false, [
            (position?: vscode.Position) => assert.equal(true, position === null),
        ])
    ).catch(err => assert.ok(false, `error in OpenTextDocument ${err}`));
});

test("test camelCase:true style completion", () => {
    const position = new vscode.Position(6, 21);
    return Promise.resolve(
        testDefinitionWithCase(position, true, [
            (position?: vscode.Position) => assert.equal(true, position.line === 4 && position.character === 1),
        ])
    ).catch(err => assert.ok(false, `error in OpenTextDocument ${err}`));
});

test("test camelCase:dashes style completion", () => {
    const position = new vscode.Position(7, 21);
    return Promise.resolve(
        testDefinitionWithCase(position, "dashes", [
            (position?: vscode.Position) => assert.equal(true, position.line === 4 && position.character === 1),
        ])
    ).catch(err => assert.ok(false, `error in OpenTextDocument ${err}`));
});
