import type { API } from "./preload";

declare global {
  interface Window {
    API: typeof API;
  }
}

export default window.API;
export const settings = window.API.settings;
export const app = window.API.app;
export const path = window.API.path;
export const dialog = window.API.dialog;
export const l10n = window.API.l10n;
