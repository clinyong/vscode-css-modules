import * as assert from "assert";
import { WORKSPACE_FOLDER_VARIABLE } from "../../constants";
import {
  _removePathsSign,
  _getAliasFromTsConfigPaths,
} from "../../utils/ts-alias";
import * as path from "path";

test("_removePathsSign: only key has sign", () => {
  assert.deepStrictEqual(
    _removePathsSign({
      "styles/*": ["styles"],
    }),
    {
      "styles/": ["styles"],
    }
  );
});

test("_removePathsSign: only value has sign", () => {
  console.log("ok....");

  assert.deepStrictEqual(
    _removePathsSign({
      styles: ["styles/*"],
    }),
    {
      styles: ["styles/"],
    }
  );
});

test("_removePathsSign: Both has sign", () => {
  assert.deepStrictEqual(
    _removePathsSign({
      "styles/*": ["styles/*"],
    }),
    {
      "styles/": ["styles/"],
    }
  );
});

test("_getAliasFromTsConfigPaths: baseUrl is workspace root", () => {
  assert.deepStrictEqual(
    _getAliasFromTsConfigPaths({
      compilerOptions: {
        baseUrl: ".",
        paths: {
          styles: ["styles"],
        },
      },
    }),
    {
      styles: [path.join(WORKSPACE_FOLDER_VARIABLE, "styles")],
    }
  );
});

test("_getAliasFromTsConfigPaths: baseUrl is sub folder", () => {
  assert.deepStrictEqual(
    _getAliasFromTsConfigPaths({
      compilerOptions: {
        baseUrl: "src",
        paths: {
          styles: ["styles"],
        },
      },
    }),
    {
      styles: [path.join(WORKSPACE_FOLDER_VARIABLE, "src", "styles")],
    }
  );
});

test("_getAliasFromTsConfigPaths: baseUrl is sub folder with prefix", () => {
  assert.deepStrictEqual(
    _getAliasFromTsConfigPaths({
      compilerOptions: {
        baseUrl: "./src",
        paths: {
          styles: ["styles"],
        },
      },
    }),
    {
      styles: [path.join(WORKSPACE_FOLDER_VARIABLE, "src", "styles")],
    }
  );
});

test("_getAliasFromTsConfigPaths: only baseUrl is empty", () => {
  assert.deepStrictEqual(
    _getAliasFromTsConfigPaths({
      compilerOptions: {
        paths: {
          styles: ["styles"],
        },
      } as any,
    }),
    null
  );
});

test("_getAliasFromTsConfigPaths: only paths is empty", () => {
  assert.deepStrictEqual(
    _getAliasFromTsConfigPaths({
      compilerOptions: {
        baseUrl: "./src",
      } as any,
    }),
    null
  );
});

test("_getAliasFromTsConfigPaths: both baseUrl and paths are empty", () => {
  assert.deepStrictEqual(
    _getAliasFromTsConfigPaths({
      compilerOptions: {} as any,
    }),
    null
  );
});

test("_getAliasFromTsConfigPaths: path has trailing slash", () => {
  assert.deepStrictEqual(
    _getAliasFromTsConfigPaths({
      compilerOptions: {
        baseUrl: ".",
        paths: {
          styles: ["styles/*"],
        },
      },
    }),
    {
      styles: [path.join(WORKSPACE_FOLDER_VARIABLE, "styles")],
    }
  );
});

test("_getAliasFromTsConfigPaths: path without slash", () => {
  assert.deepStrictEqual(
    _getAliasFromTsConfigPaths({
      compilerOptions: {
        baseUrl: ".",
        paths: {
          styles: ["styles"],
        },
      },
    }),
    {
      styles: [path.join(WORKSPACE_FOLDER_VARIABLE, "styles")],
    }
  );
});
