import API from "renderer/lib/api";

export const acceleratorForPlatform = (accelerator: string) => {
  if (API.platform === "darwin") {
    return accelerator
      .replace(/CommandOrControl\+/g, "⌘")
      .replace(/Shift\+/g, "⇧")
      .replace(/Alt\+/g, "⌥");
  }
  return accelerator
    .replace(/CommandOrControl\+/g, "Ctrl+")
    .replace(/Shift\+/g, "Shift+")
    .replace(/Alt\+/g, "Alt+");
};
