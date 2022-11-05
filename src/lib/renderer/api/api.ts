import type { API } from "./preload/apiPreload";

declare global {
  interface Window {
    API: typeof API;
  }
}

export default window.API;
export const settings = window.API.settings;
export const path = window.API.path;
export const dialog = window.API.dialog;
