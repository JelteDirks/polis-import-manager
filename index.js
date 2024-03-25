#! /opt/homebrew/bin/node

import yargs from "yargs/yargs"
import { hideBin } from "yargs/helpers"
import { validateDirectory } from "./src/util.js"

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

  console.dir(resolvedPath);
})();

