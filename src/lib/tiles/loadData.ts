import { readFile } from "fs-extra";
import { PNG } from "pngjs";
import type { MetaspriteTile } from "renderer/project/store/features/entities/entitiesTypes";
import {
  blitIndexedImageData,
  indexedImageTo2bppSpriteData,
  indexedUnknownToTransparent,
  isBlankIndexedImage,
  isIndexedImageEqual,
  mergeIndexedImages,
  OptimisedTile,
  removeIndexedImageMask,
  spriteDataIndexFn,
} from "shared/lib/sprites/spriteData";
import {
  flipIndexedImageX,
  flipIndexedImageY,
  ImageIndexFunction,
  IndexedImage,
  indexedImageTo2bppTileData,
  makeIndexedImage,
  pixelDataToIndexedImage,
  sliceIndexedImage,
} from "shared/lib/tiles/indexedImage";
import { tileDataIndexFn, TILE_SIZE } from "shared/lib/tiles/tileData";

/**
 * Load the given PNG image filename into an IndexedImage using the supplied index function.
 *
 * @param filename A local filename which is read using the NodeJS readFile method
 * @param indexFn Function to map an individual RGB pixel value to an 8-bit indexed value
 * @returns A new IndexedImage representing the image data provided
 */
export const readFileToIndexedImage = async (
  filename: string,
  indexFn: ImageIndexFunction
): Promise<IndexedImage> => {
  const fileData = await readFile(filename);
  return new Promise((resolve, reject) => {
    new PNG().parse(fileData, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(
        pixelDataToIndexedImage(data.width, data.height, data.data, indexFn)
      );
    });
  });
};

/**
 * Read an image filename into a GB 2bpp data array
 * @param filename Tiles image filename
 * @returns Uint8Array of 2bpp tile data
 */
export const readFileToTilesData = async (
  filename: string
): Promise<Uint8Array> => {
  const img = await readFileToIndexedImage(filename, tileDataIndexFn);
  const xTiles = Math.floor(img.width / TILE_SIZE);
  const yTiles = Math.floor(img.height / TILE_SIZE);
  const size = xTiles * yTiles * 16;
  const output = new Uint8Array(size);
  let index = 0;
  for (let tyi = 0; tyi < yTiles; tyi++) {
    for (let txi = 0; txi < xTiles; txi++) {
      const tileData = indexedImageTo2bppTileData(
        sliceIndexedImage(
          img,
          txi * TILE_SIZE,
          tyi * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE
        )
      );
      output.set(tileData, index);
      index += tileData.length;
    }
  }
  return output;
};

/**
 * Read an image filename into an array of GB 2bpp data array (one array per tile)
 * @param filename Tiles image filename
 * @returns Array of Uint8Array of 2bpp tile data
 */
export const readFileToTilesDataArray = async (
  filename: string
): Promise<Uint8Array[]> => {
  const img = await readFileToIndexedImage(filename, tileDataIndexFn);
  const xTiles = Math.floor(img.width / TILE_SIZE);
  const yTiles = Math.floor(img.height / TILE_SIZE);
  const output = [];
  for (let tyi = 0; tyi < yTiles; tyi++) {
    for (let txi = 0; txi < xTiles; txi++) {
      const tileData = indexedImageTo2bppTileData(
        sliceIndexedImage(
          img,
          txi * TILE_SIZE,
          tyi * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE
        )
      );
      output.push(tileData);
    }
  }
  return output;
};

/**
 * Read an image filename into a GB 2bpp data array
 * @param filename Tiles image filename
 * @returns Uint8Array of 2bpp tile data
 */
export const readFileToSpriteTilesData = async (
  filename: string
): Promise<Uint8Array> => {
  const img = await readFileToIndexedImage(filename, spriteDataIndexFn);
  const xTiles = Math.floor(img.width / TILE_SIZE);
  const yTiles = Math.floor(img.height / TILE_SIZE);
  const size = xTiles * yTiles * 16;
  const output = new Uint8Array(size);
  let index = 0;
  for (let txi = 0; txi < xTiles; txi++) {
    for (let tyi = 0; tyi < yTiles; tyi++) {
      const tileData = indexedImageTo2bppSpriteData(
        sliceIndexedImage(
          img,
          txi * TILE_SIZE,
          tyi * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE
        )
      );
      output.set(tileData, index);
      index += tileData.length;
    }
  }
  return output;
};

export const optimiseTiles = async (
  filename: string,
  spriteWidth: number,
  spriteHeight: number,
  metasprites: MetaspriteTile[][]
): Promise<{
  tiles: IndexedImage[];
  lookup: Record<string, OptimisedTile | undefined>;
}> => {
  const tileLookup: Record<string, number> = {};
  const allTiles: IndexedImage[] = [];
  const uniqTiles: IndexedImage[] = [];
  const uniqTileData: IndexedImage[] = [];
  const tileIds: string[] = [];
  const optimisedLookup2: Record<string, OptimisedTile | undefined> = {};
  const indexedImage = await readFileToIndexedImage(
    filename,
    spriteDataIndexFn
  );

  for (const myTiles of metasprites) {
    let mask = makeIndexedImage(spriteWidth, spriteHeight);
    for (let ti = myTiles.length - 1; ti >= 0; ti--) {
      const tileDef = myTiles[ti];
      let slicedTile = sliceIndexedImage(
        indexedImage,
        tileDef.sliceX,
        tileDef.sliceY,
        8,
        16
      );
      if (tileDef.flipX) {
        slicedTile = flipIndexedImageX(slicedTile);
      }
      if (tileDef.flipY) {
        slicedTile = flipIndexedImageY(slicedTile);
      }

      const visibleTile = removeIndexedImageMask(
        slicedTile,
        mask,
        spriteWidth / 2 - 8 + tileDef.x,
        spriteHeight - 16 - tileDef.y
      );

      mask = blitIndexedImageData(
        mask,
        slicedTile,
        spriteWidth / 2 - 8 + tileDef.x,
        spriteHeight - 16 - tileDef.y
      );

      tileLookup[tileDef.id] = allTiles.length;
      allTiles.push(visibleTile);
      tileIds.push(tileDef.id);
    }
  }

  for (let i = 0; i < allTiles.length; i++) {
    let found = false;
    const tile = allTiles[i];

    if (isBlankIndexedImage(tile)) {
      // If tile is empty (e.g. completely obscured)
      // then don't add to unique tiles
      const id = tileIds[i];
      optimisedLookup2[id] = undefined;
      continue;
    }

    for (let ui = 0; ui < uniqTiles.length; ui++) {
      const uniqTile = uniqTiles[ui];
      const tileFX = flipIndexedImageX(tile);
      const tileFY = flipIndexedImageY(tile);
      const tileFXY = flipIndexedImageX(flipIndexedImageY(tile));

      if (isIndexedImageEqual(tile, uniqTile)) {
        found = true;
        const id = tileIds[i];
        uniqTiles[ui] = mergeIndexedImages(uniqTile, tile);
        optimisedLookup2[id] = {
          tile: ui * 2,
          flipX: false,
          flipY: false,
        };
        break;
      } else if (isIndexedImageEqual(tileFX, uniqTile)) {
        found = true;
        const id = tileIds[i];
        uniqTiles[ui] = mergeIndexedImages(uniqTile, tileFX);
        optimisedLookup2[id] = {
          tile: ui * 2,
          flipX: true,
          flipY: false,
        };
        break;
      } else if (isIndexedImageEqual(tileFY, uniqTile)) {
        found = true;
        const id = tileIds[i];
        uniqTiles[ui] = mergeIndexedImages(uniqTile, tileFY);
        optimisedLookup2[id] = {
          tile: ui * 2,
          flipX: false,
          flipY: true,
        };
        break;
      } else if (isIndexedImageEqual(tileFXY, uniqTile)) {
        found = true;
        const id = tileIds[i];
        uniqTiles[ui] = mergeIndexedImages(uniqTile, tileFXY);
        optimisedLookup2[id] = {
          tile: ui * 2,
          flipX: true,
          flipY: true,
        };
        break;
      }
    }

    if (!found) {
      const id = tileIds[i];
      optimisedLookup2[id] = {
        tile: uniqTiles.length * 2,
        flipX: false,
        flipY: false,
      };
      uniqTiles.push(tile);
    }
  }

  for (const tile of uniqTiles) {
    uniqTileData.push(
      indexedUnknownToTransparent(sliceIndexedImage(tile, 0, 0, 8, 8))
    );
    uniqTileData.push(
      indexedUnknownToTransparent(sliceIndexedImage(tile, 0, 8, 8, 8))
    );
  }

  return {
    tiles: uniqTileData,
    lookup: optimisedLookup2,
  };
};
