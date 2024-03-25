#! /opt/homebrew/bin/node

import yargs from "yargs/yargs"
import { hideBin } from "yargs/helpers"
import { clearTerm, searchFile, validateDirectory } from "./src/util.js"
import chalk from "chalk"
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

  const globPattern = path.resolve(internal.resolvedPath, "**/*.json");
  const jsonFiles = await glob(globPattern);

  Object.assign(internal, {
    jsonFiles
  });

  while (1) {
    internal.n = await main(internal);
  }
})();

async function main(internal) {
  clearTerm();

  process.stdout.write("Je bent in de volgende map aan het werken: " +
    chalk.green(internal.resolvedPath) + "\n");

  const file = await searchFile(internal); /* internal.selected === file */

  clearTerm();

  console.log(file);

  process.exit();
}

