import promiseLimit from "../helpers/promiseLimit2";
import { assetFilename } from "../helpers/gbstudio";
import getFileModifiedTime from "../helpers/fs/getModifiedTime";
import { readFileToTilesData } from "../tiles/tileData";
import { TilesetAssetData } from "../project/loadTilesetData";

type CompileTilesetOptions = {
  warnings: (msg: string) => void;
};

export type PrecompiledTilesetData = TilesetAssetData & {
  data: Uint8Array;
  size: number;
};

const tilesetBuildCache: Record<
  string,
  {
    timestamp: number;
    data: Uint8Array;
  }
> = {};

const compileTilesets = async (
  tilesets: TilesetAssetData[],
  projectRoot: string,
  { warnings }: CompileTilesetOptions
): Promise<PrecompiledTilesetData[]> => {
  const tilesetData = await promiseLimit(
    10,
    tilesets.map((tileset) => {
      return async (): Promise<PrecompiledTilesetData> => {
        const filename = assetFilename(projectRoot, "tilesets", tileset);
        const modifiedTime = await getFileModifiedTime(filename);
        let data;

        if (
          tilesetBuildCache[tileset.id] &&
          tilesetBuildCache[tileset.id].timestamp >= modifiedTime
        ) {
          data = tilesetBuildCache[tileset.id].data;
        } else {
          data = await readFileToTilesData(filename);
          tilesetBuildCache[tileset.id] = {
            data,
            timestamp: modifiedTime,
          };
        }

        const size = data.length;

        return {
          ...tileset,
          data,
          size,
        };
      };
    })
  );

  return tilesetData;
};

export default compileTilesets;
