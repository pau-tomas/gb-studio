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

export const parseAssetPath = (
  filename: string,
  projectRoot: string,
  assetFolder: string
) => {
  const relativePath = Path.relative(projectRoot, filename);
  const plugin = relativePath.startsWith("plugins")
    ? relativePath.split(Path.sep)[1]
    : undefined;
  const file = plugin
    ? Path.relative(`plugins/${plugin}/${assetFolder}/`, relativePath)
    : Path.relative(`assets/${assetFolder}/`, relativePath);
  return {
    relativePath,
    plugin,
    file,
  };
};
