import fs from "node:fs/promises"
import { sleep } from "./util.js";

export class JsonWrapper {

  /**
  * @param {string} path 
  * @param {string} originalDir 
  */
  constructor(path, originalDir) {
    this.path = path;
    this.originalDir = originalDir;
  }

  async analyse() {
    const chunks = [];
    const rows = [];

    const object = await fs.readFile(this.path, "utf8")
      .then((fileContent) => {
        return JSON.parse(fileContent);
      }).catch(console.error);

    const regels = object.regels;

    for (let i = 0; i < regels.length; i++) {
      let ref = regels[i];
      rows.push(JSON.stringify(ref));

      if (typeof ref.geimporteerd === true &&
        typeof ref.origin === "string") {
        if (chunks[chunks.length - 1] !== ref.origin) {
          /* new file found */
          chunks.push(ref.origin);
        }
      } else {
        /* this is a local object */
        if (chunks[chunks.length - 1] !== "local") {
          chunks.push("local");
        }
      }
    }

    /* save to this wrapper */
    this.chunks = chunks;
    this.rows = rows;
  }


}
