#! /opt/homebrew/bin/node

import yargs from "yargs/yargs"
import { hideBin } from "yargs/helpers"
import { clearTerm, validateDirectory } from "./src/util.js"
import chalk from "chalk"

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

  return -1;
}

async function searchFile(internal) {
  return;
}
