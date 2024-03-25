import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";

export async function validateDirectory(dir) {
  let resolvedPath = path.resolve(dir);

  try {
    let stats = fs.statSync(resolvedPath);
    if (!stats.isDirectory()) {
      console.error("Het opgegeven pad is geen directory: " + resolvedPath);
      console.error(stats);
      process.exit();
    }
    return resolvedPath;
  } catch (err) {
    console.error("Het opgegeven pad kan niet gevonden worden: " + resolvedPath);
    console.error(err);
  }
}

export const POINTER = chalk.green(">");

export const ESCAPE_SEQUENCE = {
  CLEAR_TERM: "\x1Bc"
};

export const KEYSTROKE = {
  BACKSPACE: new Uint8Array([127]),
  ETX: new Uint8Array([3]), /* End of text (CTRL-C) */
  EOT: new Uint8Array([4]), /* End of transomission (CTRL-D) */
  UP_ARROW: new Uint8Array([27, 91, 65]),
  DOWN_ARROW: new Uint8Array([27, 91, 66]),
  RIGHT_ARROW: new Uint8Array([27, 91, 67]),
  LEFT_ARROW: new Uint8Array([27, 91, 68]),
  ENTER: new Uint8Array([13]),
};

export function clearTerm() {
  process.stdout.write(ESCAPE_SEQUENCE.CLEAR_TERM);
}

export function moveCursor(row, column) {
  if (typeof row !== "number") {
    console.error("row should be number");
  }

  if (typeof column !== "number") {
    console.error("column should be number");
  }

  const rowStr = row.toString();
  const colStr = column.toString();
  const rowAscii = [];
  const colAscii = [];

  for (let i = 0; i < rowStr.length; i++) {
    rowAscii.push(rowStr[i].charCodeAt());
  }

  for (let i = 0; i < colStr.length; i++) {
    colAscii.push(colStr[i].charCodeAt());
  }

  process.stdout.write(
    new Uint8Array([0x1B, 0x5B, ...rowAscii, 0x3B, ...colAscii, 0x48]));
}

export function paintWindow(paintObject) {
  process.stdout.write(ESCAPE_SEQUENCE.CLEAR_TERM);
  process.stdout.write("Je bent in de volgende map aan het werken: " +
    chalk.green(paintObject.resolvedPath) + "\n");
  process.stdout.write(paintObject.input + "\n");

  const maxRows = process.stdout.rows - 10;
  const maxCols = process.stdout.columns - 1;

  let rows = maxRows;
  let j = 0;

  for (let i = 0; i < paintObject.jsonFiles.length; i++) {
    if (rows < 0) {
      continue;
    }

    let ref = paintObject.jsonFiles[i];

    if (ref.indexOf(paintObject.input) > -1) {
      if (paintObject.pointerIndex === j) {
        paintObject.selected = ref;
        process.stdout.write(chalk.green(">" + ref + "\n"));
      } else {
        process.stdout.write(" " + ref + "\n");
      }
      --rows;
      ++j;
    }
  }

  paintObject.maxIndex = Math.abs(maxRows - rows);

  moveCursor(2, paintObject.input.length + 1);
}
