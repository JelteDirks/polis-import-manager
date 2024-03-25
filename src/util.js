import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { Buffer } from "node:buffer";

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

export function paintWindow(internal) {
  process.stdout.write(ESCAPE_SEQUENCE.CLEAR_TERM);
  process.stdout.write("Je bent in de volgende map aan het werken: " +
    chalk.green(internal.resolvedPath) + "\n");
  process.stdout.write(internal.input + "\n");

  const maxRows = process.stdout.rows - 4;

  let rows = maxRows;
  let j = 0;

  for (let i = 0; i < internal.jsonFiles.length; i++) {
    if (rows < 0) {
      break;
    }

    let ref = internal.jsonFiles[i];

    if (ref.indexOf(internal.input) > -1) {
      if (internal.pointerIndex === j) {
        internal.selected = ref;
        process.stdout.write(chalk.green(">" + ref + "\n"));
      } else {
        process.stdout.write(" " + ref + "\n");
      }
      --rows;
      ++j;
    }
  }

  if (rows < 0) {
    process.stdout.write(chalk.red("Er zijn meer bestanden, maar die passen niet meer op het scherm..."));
  }

  internal.maxIndex = Math.abs(maxRows - rows);

  moveCursor(2, internal.input.length + 1);
}

export async function searchFile(internal) {
  Object.assign(internal, {
    input: "",
    pointerIndex: 0,
    maxIndex: 0,
  });

  if (typeof internal.jsonFiles === "undefined") {
    console.error("jsonFiles is undefined");
    process.exit();
  }

  process.stdin.setRawMode(true);

  paintWindow(internal);

  return new Promise((resolve) => {
    const onData = (data) => {
      if (Buffer.compare(data, KEYSTROKE.BACKSPACE) === 0) {
        internal.input = internal.input.slice(0, -1);
        internal.pointerIndex = 0;
        paintWindow(internal);
      } else if (Buffer.compare(data, KEYSTROKE.ETX) === 0) {
        process.exit();
      } else if (Buffer.compare(data, KEYSTROKE.ENTER) === 0) {
        process.stdin.removeListener("data", onData);
        process.stdin.setRawMode(false);
        resolve(internal.selected);
      } else if (Buffer.compare(data, KEYSTROKE.LEFT_ARROW) === 0) {
        /* do something with this */
      } else if (Buffer.compare(data, KEYSTROKE.RIGHT_ARROW) === 0) {
        /* do something with this */
      } else if (Buffer.compare(data, KEYSTROKE.UP_ARROW) === 0) {
        internal.pointerIndex = (internal.pointerIndex +
          internal.maxIndex - 1) % internal.maxIndex;
        paintWindow(internal);
      } else if (Buffer.compare(data, KEYSTROKE.DOWN_ARROW) === 0) {
        internal.pointerIndex = (internal.pointerIndex +
          internal.maxIndex + 1) % internal.maxIndex;
        paintWindow(internal);
      } else {
        internal.input += data.toString();
        paintWindow(internal);
      }
    };

    process.stdin.on("data", onData);
  });
}
