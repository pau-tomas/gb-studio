import { globSync } from "glob";
import Path from "path";
import { localesRoot } from "lib/pathConsts";

const localesPath = `${localesRoot}/*.json`;

export const locales = globSync(localesPath)
  .map((path) => Path.basename(path, ".json"));
