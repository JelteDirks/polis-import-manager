#! /opt/homebrew/bin/node

import yargs from "yargs/yargs"
import { hideBin } from "yargs/helpers"
import { KEYSTROKE, clearTerm, paintWindow, validateDirectory } from "./src/util.js"
import chalk from "chalk"
import { Buffer } from "node:buffer"
import { glob } from "glob";
import path from "node:path"

(async () => {

  const argv = yargs(hideBin(process.argv))
    .command("manage-imports <directory>",
      "Beheer imports vanuit een directory", (yargs) => {
        return yargs.positional("directory", {
          describe: "De directory die als root gebruikt wordt voor alle imports",
          type: "string"
        });
      })
    .demandCommand(1)
    .parse();

  const resolvedPath = await validateDirectory(argv.directory);

  let internal = {
    resolvedPath: resolvedPath,
    n: 0
  };

  while (1) {
    internal.n = await main(internal);

    if (internal.n < 0) {
      process.exit();
    }
  }
})();

async function main(internal) {
  clearTerm();

  process.stdout.write("Je bent in de volgende map aan het werken: " +
    chalk.green(internal.resolvedPath) + "\n");

  const globPattern = path.resolve(internal.resolvedPath, "**/*.json");
  const jsonFiles = await glob(globPattern);

  Object.assign(internal, {
    jsonFiles
  });

  const file = await searchFile(internal); /* internal.selected === file */
  clearTerm();
  console.log(file);
  process.exit();
}

async function searchFile(internal) {
  Object.assign(internal, {
    input: "",
    pointerIndex: 0,
    maxIndex: 0,
  });

  process.stdin.setRawMode(true);

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
