import path from "path";

const isDist = __dirname.indexOf(".webpack") > -1;
const isCli = __dirname.indexOf("out/cli") > -1;

let rootDir = __dirname.substr(0, __dirname.lastIndexOf("node_modules"));
if (isDist) {
  rootDir = __dirname.substr(0, __dirname.lastIndexOf(".webpack"));
} else if (isCli) {
  rootDir = __dirname.substr(0, __dirname.lastIndexOf("out/cli"));
} else if (process.env.NODE_ENV === "test") {
  rootDir = path.normalize(`${__dirname}/../`);
}

export const engineRoot = path.normalize(`${rootDir}/appData/src`);
export const buildToolsRoot = path.normalize(`${rootDir}/buildTools`);
export const emulatorRoot = path.normalize(`${rootDir}/appData/js-emulator`);
export const binjgbRoot = path.normalize(`${rootDir}/appData/wasm/binjgb`);
export const projectTemplatesRoot = path.normalize(
  `${rootDir}/appData/templates`
);
export const localesRoot = path.normalize(`${rootDir}/src/lib/lang`);
export const eventsRoot = path.normalize(`${rootDir}/src/lib/events`);
export const assetsRoot = path.normalize(`${rootDir}/src/assets`);
