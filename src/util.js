import fs from "node:fs"
import path from "node:path";

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

export function paintWindow(paintObject) {
  process.stdout.write(ESCAPE_SEQUENCE.CLEAR_TERM);
  console.log(paintObject);
}
