import type { L10NAPI } from "./preload/l10nPreload";

declare global {
  interface Window {
    L10NAPI: typeof L10NAPI;
  }
}

export const l10n = window.L10NAPI.l10n;
