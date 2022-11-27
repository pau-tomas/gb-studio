import { EditorState } from "./editorState";

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
