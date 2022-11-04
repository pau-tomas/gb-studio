import type { DialogAPI } from "./preload/dialogPreload";

declare global {
  interface Window {
    DialogAPI: typeof DialogAPI;
  }
}

export const openFilePicker = window.DialogAPI.openFilePicker;
