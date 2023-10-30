import fs from "fs-extra";
import { rimrafSync as rmdir } from "rimraf";
import { engineRoot } from "shared/consts";
import copy from "lib/helpers/fsCopy";

const ejectEngineToDir = async (ejectPath, { projectType = "gb" } = {}) => {
  const enginePath = `${engineRoot}/${projectType}`;
  const engineSrcPath = `${enginePath}/src`;
  const engineIncludePath = `${enginePath}/include`;
  const engineMetaPath = `${enginePath}/engine.json`;
  const ejectSrcPath = `${ejectPath}/src`;
  const ejectIncludePath = `${ejectPath}/include`;
  const ejectMetaPath = `${ejectPath}/engine.json`;

  rmdir(ejectPath);

  await fs.ensureDir(ejectPath);
  await fs.ensureDir(ejectSrcPath);
  await fs.ensureDir(ejectIncludePath);

  await copy(engineSrcPath, ejectSrcPath);
  await copy(engineIncludePath, ejectIncludePath);
  await copy(engineMetaPath, ejectMetaPath);
};

export default ejectEngineToDir;
