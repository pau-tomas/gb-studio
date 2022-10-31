import type { SplashAPI } from "./preload";

declare global {
  interface Window {
    SplashAPI: typeof SplashAPI;
  }
}

export default window.SplashAPI;
export const l10n = window.SplashAPI.l10n;
