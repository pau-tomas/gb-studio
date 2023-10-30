import { globSync } from "glob";
import { promisify } from "util";
import uuidv4 from "uuid/v4";
import sizeOf from "image-size";
import { stat } from "fs-extra";
import { parseAssetPath } from "shared/lib/assets/helpers";
import { spriteTypeFromNumFrames } from "lib/helpers/gbstudio";
import { checksumFile } from "lib/helpers/checksum";
import { toValidSymbol } from "shared/lib/compiler/symbols";

const FRAME_SIZE = 16;

const sizeOfAsync = promisify(sizeOf);

const loadSpriteData = (projectRoot) => async (filename) => {
  const { file, plugin } = parseAssetPath(filename, projectRoot, "sprites");
  try {
    const size = await sizeOfAsync(filename);
    const fileStat = await stat(filename, { bigint: true });
    const inode = fileStat.ino.toString();
    const checksum = await checksumFile(filename);
    const numFrames = size.width / FRAME_SIZE;
    const name = file.replace(/.png/i, "");
    return {
      id: uuidv4(),
      plugin,
      name,
      symbol: toValidSymbol(`sprite_${name}`),
      numFrames,
      type: spriteTypeFromNumFrames(numFrames),
      filename: file,
      inode,
      checksum,
      width: size.width,
      height: size.height,
      states: [],
      numTiles: 0,
      canvasWidth: 32,
      canvasHeight: 32,
      boundsX: 0,
      boundsY: 0,
      boundsWidth: 16,
      boundsHeight: 16,
      animSpeed: 15,
      _v: Date.now(),
    };
  } catch (e) {
    console.error(e);
    return null;
  }
};

const loadAllSpriteData = async (projectRoot) => {
  const spritePaths = globSync(
    `${projectRoot}/assets/sprites/**/@(*.png|*.PNG)`
  );
  const pluginPaths = globSync(
    `${projectRoot}/plugins/*/sprites/**/@(*.png|*.PNG)`
  );
  const spriteData = (
    await Promise.all(
      [].concat(
        spritePaths.map(loadSpriteData(projectRoot)),
        pluginPaths.map(loadSpriteData(projectRoot))
      )
    )
  ).filter((i) => i);
  return spriteData;
};

export default loadAllSpriteData;
export { loadSpriteData };
