import fs from "node:fs"
import path from "node:path";

export async function validateDirectory(dir) {
  let resolvedPath = path.resolve(dir);

  try {
    let stats = fs.statSync(resolvedPath);
    if (!stats.isDirectory()) {
      console.error("Het opgegeven pad is geen directory: " + resolvedPath);
      console.error(stats);
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
};

export function clearTerm() {
  process.stdout.write(ESCAPE_SEQUENCE.CLEAR_TERM);
}
