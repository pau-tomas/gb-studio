import type { API as APIType } from "./preload";

declare global {
  interface Window {
    API: typeof APIType;
  }
}

const API = window.API;
export const settings = window.API.settings;
export const app = window.API.app;
export const paths = window.API.paths;
export const dialog = window.API.dialog;
export const l10n = window.API.l10n;

export default API;
