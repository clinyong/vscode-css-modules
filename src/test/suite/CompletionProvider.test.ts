import * as assert from "assert";
import * as vscode from "vscode";

import { CSSModuleCompletionProvider } from "../../CompletionProvider";
import { CamelCaseValues } from "../../options";
import { SAMPLE_JSX_FILE, SAMPLE_JS_FILE, SAMPLE_TSX_FILE, SAMPLE_TS_FILE, STYLUS_JSX_FILE } from "../constant";
import { readOptions } from "../utils";

const uri = vscode.Uri.file(SAMPLE_JSX_FILE);
const uri2 = vscode.Uri.file(STYLUS_JSX_FILE);
const uri3 = vscode.Uri.file(SAMPLE_JS_FILE);
const uri4 = vscode.Uri.file(SAMPLE_TSX_FILE);
const uri5 = vscode.Uri.file(SAMPLE_TS_FILE);

function testCompletion(position: vscode.Position, itemCount: number, fixtureFile?: vscode.Uri) {
  return vscode.workspace.openTextDocument(fixtureFile || uri).then((text) => {
    const provider = new CSSModuleCompletionProvider(readOptions());
    return provider.provideCompletionItems(text, position).then((items) => {
      assert.strictEqual(itemCount, items.length);
    });
  });
}

function testCompletionWithCase(
  position: vscode.Position,
  camelCaseConfig: CamelCaseValues,
  assertions: Array<any>
) {
  return vscode.workspace.openTextDocument(uri).then((text) => {
    const provider = new CSSModuleCompletionProvider(
      readOptions({
        camelCase: camelCaseConfig,
      })
    );
    return provider.provideCompletionItems(text, position).then((items) => {
      assertions.map((assertion) => assertion(items));
    });
  });
}

test("test es6 style completion", () => {
  const position = new vscode.Position(3, 20);
  return Promise.resolve(testCompletion(position, 5)).catch((err) => {
    assert.ok(false, `error in OpenTextDocument ${err}`);
  });
});

test("test commonJS style completion", () => {
  const position = new vscode.Position(4, 20);
  return Promise.resolve(testCompletion(position, 5)).catch((err) => {
    assert.ok(false, `error in OpenTextDocument ${err}`);
  });
});

test("test optional chain invalid match to fix issue #22", () => {
  const position = new vscode.Position(11, 4);
  return Promise.resolve(testCompletion(position, 0)).catch((err) => {
    assert.ok(false, `error in OpenTextDocument ${err}`);
  });
});

test("test optional chain valid match", () => {
  const position = new vscode.Position(12, 9);
  return Promise.resolve(testCompletion(position, 5)).catch((err) => {
    assert.ok(false, `error in OpenTextDocument ${err}`);
  });
});

test("test exact Match", () => {
  const position = new vscode.Position(14, 4);
  return Promise.resolve(testCompletion(position, 0)).catch((err) => {
    assert.ok(false, `error in OpenTextDocument ${err}`);
  });
});

test("test mix code style .styl completion", () => {
  const position = new vscode.Position(6, 29);
  return Promise.resolve(testCompletion(position, 3, uri2)).catch((err) => {
    assert.ok(false, `error in OpenTextDocument ${err}`);
  });
});

test("test .stylus extname stylus completion", () => {
  const position = new vscode.Position(8, 29);
  return Promise.resolve(testCompletion(position, 5, uri2)).catch((err) => {
    assert.ok(false, `error in OpenTextDocument ${err}`);
  });
});

test("test camelCase:false style completion", () => {
  const position = new vscode.Position(5, 21);
  return Promise.resolve(
    testCompletionWithCase(position, false, [
      (items) => assert.strictEqual(1, items.length),
      (items) => assert.strictEqual("sidebar_without-header", items[0].label),
    ])
  ).catch((err) => {
    assert.ok(false, `error in OpenTextDocument ${err}`);
  });
});

test("test camelCase:false style and kebab-case completion", () => {
  const position = new vscode.Position(5, 21);
  return Promise.resolve(
    testCompletionWithCase(position, false, [
      (items) => assert.strictEqual(1, items.length),
      (items) => assert.strictEqual(`['sidebar_without-header']`, items[0].insertText),
    ])
  ).catch((err) => {
    assert.ok(false, `error in OpenTextDocument ${err}`);
  });
});

test("test camelCase:true style completion", () => {
  const position = new vscode.Position(5, 21);
  return Promise.resolve(
    testCompletionWithCase(position, true, [
      (items) => assert.strictEqual(1, items.length),
      (items) => assert.strictEqual("sidebarWithoutHeader", items[0].label),
    ])
  ).catch((err) => {
    assert.ok(false, `error in OpenTextDocument ${err}`);
  });
});

test("test camelCase:dashes style completion", () => {
  const position = new vscode.Position(5, 21);
  return Promise.resolve(
    testCompletionWithCase(position, "dashes", [
      (items) => assert.strictEqual(1, items.length),
      (items) => assert.strictEqual("sidebar_withoutHeader", items[0].label),
    ])
  ).catch((err) => {
    assert.ok(false, `error in OpenTextDocument ${err}`);
  });
});

test("support js", () => {
  const position = new vscode.Position(3, 28);
  return Promise.resolve(testCompletion(position, 5, uri3)).catch((err) => {
    assert.ok(false, `error in OpenTextDocument ${err}`);
  });
});

test("support tsx", () => {
  const position = new vscode.Position(7, 28);
  return Promise.resolve(testCompletion(position, 5, uri4)).catch((err) => {
    assert.ok(false, `error in OpenTextDocument ${err}`);
  });
});

test("support ts", () => {
  const position = new vscode.Position(7, 28);
  return Promise.resolve(testCompletion(position, 5, uri5)).catch((err) => {
    assert.ok(false, `error in OpenTextDocument ${err}`);
  });
});
