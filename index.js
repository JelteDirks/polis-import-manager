#! /opt/homebrew/bin/node

import yargs from "yargs/yargs"
import { hideBin } from "yargs/helpers"
import { KEYSTROKE, clearTerm, paintWindow, validateDirectory } from "./src/util.js"
import chalk from "chalk"
import { Buffer } from "node:buffer"

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
      break;
    }
  }

})();

async function main(internal) {
  clearTerm();
  process.stdout.write("Je bent in de volgende map aan het werken: " +
    chalk.green(internal.resolvedPath) + "\n");

  const file = await searchFile(internal);

  console.log(file);

  return -1;
}

async function searchFile(internal) {
  const paintObject = {
    input: "",
    resolvedPath: internal.resolvedPath
  };
  process.stdin.setRawMode(true);

  return new Promise((resolve) => {
    const onData = (data) => {
      if (Buffer.compare(data, KEYSTROKE.BACKSPACE) === 0) {
        paintObject.input = paintObject.input.slice(0, -1);
        paintWindow(paintObject);
      } else if (Buffer.compare(data, KEYSTROKE.ETX) === 0) {
        process.exit();
      } else if (Buffer.compare(data, KEYSTROKE.ENTER) === 0) {
        console.log("enter");
        process.stdin.removeListener("data", onData);
        resolve(paintObject);
      } else if (Buffer.compare(data, KEYSTROKE.LEFT_ARROW) === 0) {
        console.log("left arrow");
      } else if (Buffer.compare(data, KEYSTROKE.RIGHT_ARROW) === 0) {
        console.log("right arrow");
      } else if (Buffer.compare(data, KEYSTROKE.UP_ARROW) === 0) {
        console.log("up arrow");
      } else if (Buffer.compare(data, KEYSTROKE.DOWN_ARROW) === 0) {
        console.log("down arrow");
      } else {
        paintObject.input += data.toString();
        paintWindow(paintObject);
      }
    };

    process.stdin.on("data", onData);
  });
}
