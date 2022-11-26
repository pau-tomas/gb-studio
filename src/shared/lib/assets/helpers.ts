/* eslint-disable import/prefer-default-export */
import Path from "path";
import type { Asset } from "renderer/project/store/features/entities/entitiesTypes";

export const assetFilename = (
  projectRoot: string,
  assetType: string,
  asset?: Asset
) => {
  if (!asset) {
    return Path.join(projectRoot, "assets", assetType, "unknown");
  }
  return (
    asset.plugin
      ? Path.join(
          projectRoot,
          "plugins",
          asset.plugin,
          assetType,
          asset.filename
        )
      : Path.join(projectRoot, "assets", assetType, asset.filename)
  ).replace(/\\/g, "/");
};
