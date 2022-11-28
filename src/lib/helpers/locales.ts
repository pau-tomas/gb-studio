import glob from "glob";
import Path from "path";
import { localesRoot } from "lib/pathConsts";

const localesPath = `${localesRoot}/*.json`;

export const locales = glob
  .sync(localesPath)
  .map((path) => Path.basename(path, ".json"));
