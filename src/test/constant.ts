import * as path from "path";

export const ROOT_PATH = path.join(__dirname, "..", "..");
export const FIXTURES_PATH = path.join(ROOT_PATH, "src", "test", "fixtures");

export const SAMPLE_JS_FILE = path.join(FIXTURES_PATH, "sample.jsx");
export const STYLUS_JS_FILE = path.join(FIXTURES_PATH, "stylus.jsx");
export const JUMP_PRECISE_DEF_FILE = path.join(FIXTURES_PATH, "jumpDef.jsx");
export const TSCONFIG_PATH_FILE = path.join(FIXTURES_PATH, "tsconfig.tsx");
export const TSCONFIG_PATH_FOLDER = path.join(FIXTURES_PATH, "styles");
