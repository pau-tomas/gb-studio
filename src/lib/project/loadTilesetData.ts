import glob from "glob";
import { promisify } from "util";
import uuid from "uuid/v4";
import { createReadStream } from "fs-extra";
import { stat } from "fs";
import { PNG } from "pngjs";

import parseAssetPath from "../helpers/path/parseAssetPath";

const TILE_SIZE = 8;

export interface TilesetAssetData {
  id: string;
  plugin: string | undefined;
  name: string;
  width: number;
  height: number;
  imageWidth: number;
  imageHeight: number;
  filename: string;
  inode: string;
  _v: number;
}

const globAsync = promisify(glob);
const statAsync = promisify(stat);
const sizeOfAsync = (
  filename: string
): Promise<TilesetAssetData> => {
  return new Promise((resolve, reject) => {
    createReadStream(filename)
      .pipe(new PNG())
      .on("metadata", resolve)
      .on("error", reject);
  });
};

const loadTilesetData = (projectRoot: string) => async (filename: string) => {
  const { file, plugin } = parseAssetPath(filename, projectRoot, "tilesets");
  try {
    const size = await sizeOfAsync(filename);
    const fileStat = await statAsync(filename, { bigint: true });
    const inode = fileStat.ino.toString();
    return {
      id: uuid(),
      plugin,
      name: file.replace(/.png/i, ""),
      width: Math.min(Math.floor(size.width / TILE_SIZE), 255),
      height: Math.min(Math.floor(size.height / TILE_SIZE), 255),
      imageWidth: size.width,
      imageHeight: size.height,
      filename: file,
      inode,
      _v: Date.now()
    } as TilesetAssetData;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const loadAllTilesetData = async (projectRoot: string): Promise<TilesetAssetData[]> => {
  const imagePaths = await globAsync(
    `${projectRoot}/assets/tilesets/**/@(*.png|*.PNG)`
  );
  const pluginPaths = await globAsync(
    `${projectRoot}/plugins/*/tilesets/**/@(*.png|*.PNG)`
  );
  const imageData = (
    await Promise.all(
      ([] as Promise<TilesetAssetData | null>[]).concat(
        imagePaths.map(loadTilesetData(projectRoot)),
        pluginPaths.map(loadTilesetData(projectRoot))
      )
    )
  ).filter(i => i);
  return imageData as TilesetAssetData[];
};

export default loadAllTilesetData;
export { loadTilesetData };
