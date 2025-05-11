import {
  DefinitionProvider,
  TextDocument,
  Position,
  CancellationToken,
  Location,
  Uri,
} from "vscode";
import { getCurrentLine, dashesCamelCase } from "./utils";
import {
  findImportModule,
  genImportRegExp,
  resolveImportPath,
} from "./utils/path";
import {
  AliasFromUserOptions,
  CamelCaseValues,
  ExtensionOptions,
} from "./options";
import * as path from "path";
import * as fs from "fs";
import * as _ from "lodash";
import { getRealPathAlias } from "./path-alias";

type ClassTransformer = (cls: string) => string;

interface ClickInfo {
  importModule: string;
  targetClass: string;
}

interface Keyword {
  obj: string;
  field: string;
}

function getWords(line: string, position: Position): string {
  const splitRegex = /\.|\["|\['/;

  const headText = line.slice(0, position.character);
  const startIndex = headText.search(/[a-zA-Z0-9._["']*$/);
  // not found or not clicking object field
  if (startIndex === -1 || !splitRegex.test(headText.slice(startIndex))) {
    return "";
  }

  const match = /^([a-zA-Z0-9._["']*)/.exec(line.slice(startIndex));
  if (match === null) {
    return "";
  }

  if (match[1].includes('["') || match[1].includes("['")) {
    // Remove " or ' from end
    return match[1].slice(0, -1);
  }

  return match[1];
}

function getTransformer(
  camelCaseConfig: CamelCaseValues
): ClassTransformer | null {
  switch (camelCaseConfig) {
    case true:
      return _.camelCase;
    case "dashes":
      return dashesCamelCase;
    default:
      return null;
  }
}

function getPosition(
  filePath: string,
  className: string,
  camelCaseConfig: CamelCaseValues
): Position {
  const content = fs.readFileSync(filePath, { encoding: "utf8" });
  const lines = content.split("\n");

  let lineNumber = -1;
  let character = -1;
  let keyWord = className;
  const classTransformer = getTransformer(camelCaseConfig);
  if (camelCaseConfig !== true) {
    // is false or 'dashes'
    keyWord = `.${className}`;
  }

  /**
   * This is a simple solution for definition match.
   * Only guarantee keyword not follow normal characters
   *
   * if we want match [.main] classname
   * escaped dot char first and then use RegExp to match
   * more detail -> https://github.com/clinyong/vscode-css-modules/pull/41#discussion_r696247941
   *
   * 1. .main,   // valid
   * 2. .main    // valid
   *
   * 3. .main-sub   // invalid
   * 4. .main09     // invalid
   * 5. .main_bem   // invalid
   * 6. .mainsuffix // invalid
   *
   * @TODO Refact by new tokenizer later
   */
  const keyWordMatchReg = new RegExp(
    `${keyWord.replace(/^\./, "\\.")}(?![_0-9a-zA-Z-])`
  );

  for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i];
    /**
     * The only way to guarantee that a position will be returned for a camelized class
     * is to check after camelizing the source line.
     * Doing the opposite -- uncamelizing the used classname -- would not always give
     * correct result, as camelization is lossy.
     * i.e. `.button--disabled`, `.button-disabled` both give same
     * final class: `css.buttonDisabled`, and going back from this to that is not possble.
     *
     * But this has a drawback - camelization of a line may change the final
     * positions of classes. But as of now, I don't see a better way, and getting this
     * working is more important, also putting this functionality out there would help
     * get more eyeballs and hopefully a better way.
     */
    const line = !classTransformer
      ? originalLine
      : classTransformer(originalLine);

    /**
     * @isMatchChar for match check
     * @character for position
     */
    let isMatchChar = keyWordMatchReg.test(line);
    character = line.indexOf(keyWord);
    if (!isMatchChar && !!classTransformer) {
      // if camelized match fails, and transformer is there
      // try matching the un-camelized classnames too!
      character = originalLine.indexOf(keyWord);
      isMatchChar = keyWordMatchReg.test(originalLine);
    }

    if (isMatchChar) {
      lineNumber = i;
      break;
    }
  }

  if (lineNumber === -1) {
    return null;
  } else {
    return new Position(lineNumber, character + 1);
  }
}

function isImportLineMatch(
  line: string,
  matches: RegExpExecArray,
  current: number
): boolean {
  if (matches === null) {
    return false;
  }

  const start1 = line.indexOf(matches[1]) + 1;
  const start2 = line.indexOf(matches[2]) + 1;

  // check current character is between match words
  return (
    (current > start2 && current < start2 + matches[2].length) ||
    (current > start1 && current < start1 + matches[1].length)
  );
}

function getKeyword(currentLine: string, position: Position): Keyword | null {
  const splitRegex = /\.|\["|\['/;

  const words = getWords(currentLine, position);
  if (words === "" || !splitRegex.test(words)) {
    return null;
  }

  const [obj, field] = words.split(splitRegex);
  if (!obj || !field) {
    // probably a spread operator
    return null;
  }

  return { obj, field };
}

function getClickInfoByKeyword(
  document: TextDocument,
  currentLine: string,
  position: Position
): ClickInfo | null {
  const keyword = getKeyword(currentLine, position);
  if (!keyword) {
    return null;
  }

  const importModule = findImportModule(document.getText(), keyword.obj);
  const targetClass = keyword.field;
  return {
    importModule,
    targetClass,
  };
}

function getClickInfo(
  document: TextDocument,
  currentLine: string,
  position: Position
): ClickInfo | null {
  const matches = genImportRegExp("(\\S+)").exec(currentLine);
  if (isImportLineMatch(currentLine, matches, position.character)) {
    return {
      importModule: matches[2],
      targetClass: "",
    };
  }

  return getClickInfoByKeyword(document, currentLine, position);
}

export class CSSModuleDefinitionProvider implements DefinitionProvider {
  _camelCaseConfig: CamelCaseValues = false;
  pathAliasOptions: AliasFromUserOptions;

  constructor(options: ExtensionOptions) {
    this._camelCaseConfig = options.camelCase;
    this.pathAliasOptions = options.pathAlias;
  }

  public async provideDefinition(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Promise<Location> {
    const currentDir = path.dirname(document.uri.fsPath);
    const currentLine = getCurrentLine(document, position);

    const clickInfo = getClickInfo(document, currentLine, position);
    if (!clickInfo) {
      return Promise.resolve(null);
    }

    const importPath = await resolveImportPath(
      clickInfo.importModule,
      currentDir,
      await getRealPathAlias(this.pathAliasOptions, document)
    );
    if (importPath === "") {
      return Promise.resolve(null);
    }

    let targetPosition: Position | null = null;
    if (clickInfo.targetClass) {
      targetPosition = getPosition(
        importPath,
        clickInfo.targetClass,
        this._camelCaseConfig
      );
    } else {
      targetPosition = new Position(0, 0);
    }

    if (targetPosition === null) {
      return Promise.resolve(null);
    } else {
      return Promise.resolve(
        new Location(Uri.file(importPath), targetPosition)
      );
    }
  }
}

export default CSSModuleDefinitionProvider;
