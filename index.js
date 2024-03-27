#! /opt/homebrew/bin/node

import yargs from "yargs/yargs"
import { hideBin } from "yargs/helpers"
import { clearTerm, readOne, searchFile, validateDirectory } from "./src/util.js"
import chalk from "chalk"
import { glob } from "glob";
import path from "node:path"
import fs from "node:fs";
import { JsonWrapper } from "./src/JsonFile.js"

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
    originalDir: argv.directory,
    resolvedPath: resolvedPath,
  };

  const globPattern = path.resolve(internal.resolvedPath, "**/*.json");
  const jsonFiles = await glob(globPattern);

  Object.assign(internal, {
    jsonFiles
  });

  while (1) {
    await main(internal);
  }
})();

async function main(internal) {
  clearTerm();

  process.stdout.write("Je bent in de volgende map aan het werken: " +
    chalk.green(internal.resolvedPath) + "\n");

  await searchFile(internal); /* internal.selected === return value */
  clearTerm();
  await processFile(internal);

  process.exit();
}

async function processFile(internal) {
  const file = internal.selected;

  process.stdout.write("Je bent het volgende bestand aan het bewerken: " +
    chalk.green(file) + "\n");

  process.stdout.write("Wat wil je doen met dit bestand?\n");
  process.stdout.write("i: Voeg import toe\n");
  process.stdout.write("d: Verwijder import\n");

  const fileWrapper = new JsonWrapper(file, internal.originalDir);
  const analysePromise = fileWrapper.analyse();

  const keuze = await readOne();

  if (keuze.trim() === "i") {
    await analysePromise;
    console.log("prom resolved");
  }
}

