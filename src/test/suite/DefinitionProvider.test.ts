import * as assert from "assert";
import * as vscode from "vscode";

import { CSSModuleDefinitionProvider } from "../../DefinitionProvider";
import { CamelCaseValues } from "../../options";
import { JUMP_PRECISE_DEF_FILE, SAMPLE_JS_FILE } from "../constant";
import { readOptions } from "../utils";

const uri = vscode.Uri.file(SAMPLE_JS_FILE);
const uri2 = vscode.Uri.file(JUMP_PRECISE_DEF_FILE);

function testDefinition(position: vscode.Position, lineNum: number, characterNum: number, fixtureFile?: vscode.Uri) {
  return vscode.workspace.openTextDocument(fixtureFile || uri).then((text) => {
    const provider = new CSSModuleDefinitionProvider(readOptions());
    return provider
      .provideDefinition(text, position, undefined)
      .then((location) => {
        const { line, character } = location.range.start;
        assert.strictEqual(true, line === lineNum && character === characterNum);
      });
  });
}

function testDefinitionWithCase(
  position: vscode.Position,
  camelCaseConfig: CamelCaseValues,
  assertions: Array<any>
) {
  return vscode.workspace.openTextDocument(uri).then((text) => {
    const provider = new CSSModuleDefinitionProvider(
      readOptions({
        camelCase: camelCaseConfig,
      })
    );
    return provider
      .provideDefinition(text, position, undefined)
      .then((location) => {
        const position = location ? location.range.start : null;
        assertions.map((assertion) => assertion(position));
      });
  });
}

test("testing es6 style definition", () => {
  const position = new vscode.Position(3, 21);
  return Promise.resolve(testDefinition(position, 2, 1)).catch((err) =>
    assert.ok(true, `error in OpenTextDocument ${err}`)
  );
});

test("testing commonJS style definition", () => {
  const position = new vscode.Position(4, 21);
  return Promise.resolve(testDefinition(position, 2, 1)).catch((err) =>
    assert.ok(false, `error in OpenTextDocument ${err}`)
  );
});

test("testing es6 style jump to precise definition", () => {
  const position = new vscode.Position(4, 31);
  return Promise.resolve(testDefinition(position, 7, 1, uri2)).catch((err) =>
    assert.ok(false, `error in OpenTextDocument ${err}`)
  );
});

test("testing commonJS style jump to precise definition", () => {
  const position = new vscode.Position(5, 36);
  return Promise.resolve(testDefinition(position, 7, 1, uri2)).catch((err) =>
    assert.ok(false, `error in OpenTextDocument ${err}`)
  );
});

test("testing es6 style jump to precise definition case2", () => {
  const position = new vscode.Position(6, 32);
  return Promise.resolve(testDefinition(position, 19, 1, uri2)).catch((err) =>
    assert.ok(false, `error in OpenTextDocument ${err}`)
  );
});

test("testing commonJS style jump to precise definition case2", () => {
  const position = new vscode.Position(7, 32);
  return Promise.resolve(testDefinition(position, 19, 1, uri2)).catch((err) =>
    assert.ok(false, `error in OpenTextDocument ${err}`)
  );
});

test("test camelCase:false style definition", () => {
  const position = new vscode.Position(6, 21);
  return Promise.resolve(
    testDefinitionWithCase(position, false, [
      (position?: vscode.Position) => assert.equal(true, position === null),
    ])
  ).catch((err) => assert.ok(false, `error in OpenTextDocument ${err}`));
});

test("test camelCase:true style completion", () => {
  const position = new vscode.Position(6, 21);
  return Promise.resolve(
    testDefinitionWithCase(position, true, [
      (position?: vscode.Position) =>
        assert.strictEqual(true, position.line === 4 && position.character === 1),
    ])
  ).catch((err) => assert.ok(false, `error in OpenTextDocument ${err}`));
});

test("test camelCase:dashes style completion", () => {
  const position = new vscode.Position(7, 21);
  return Promise.resolve(
    testDefinitionWithCase(position, "dashes", [
      (position?: vscode.Position) =>
        assert.strictEqual(true, position.line === 4 && position.character === 1),
    ])
  ).catch((err) => assert.ok(false, `error in OpenTextDocument ${err}`));
});
