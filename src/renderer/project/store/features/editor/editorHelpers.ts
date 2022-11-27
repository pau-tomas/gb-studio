import { EditorState } from "./editorState";

export const zoomLevels = [25, 50, 100, 200, 400, 800] as const;

export const zoomForSection = (
  section: string,
  editor: EditorState
): number => {
  if (section === "world") {
    return editor.zoom;
  }
  if (section === "sprites") {
    return editor.zoomSprite;
  }
  if (section === "backgrounds") {
    return editor.zoomImage;
  }
  if (section === "ui") {
    return editor.zoomUI;
  }
  return 100;
};

export const zoomIn = (currentZoom: number) => {
  for (let i = 0; i < zoomLevels.length; i++) {
    if (zoomLevels[i] > currentZoom) {
      return zoomLevels[i];
    }
  }
  return zoomLevels[zoomLevels.length - 1];
};

export const zoomOut = (currentZoom: number) => {
  for (let i = zoomLevels.length - 1; i >= 0; i--) {
    if (zoomLevels[i] < currentZoom) {
      return zoomLevels[i];
    }
  }
  return zoomLevels[0];
};
