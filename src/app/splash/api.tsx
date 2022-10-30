export interface SplashAPI {
  platform: string;
  l10n: (key: string, params?: Record<string, string | number>) => string;
  openExternal: (path: string) => Promise<void>;
  theme: {
    getShouldUseDarkColors: () => boolean;
    getThemeSetting: () => string;
    onChange: (callback: () => void) => void;
  };
}

declare global {
  interface Window {
    SplashAPI: SplashAPI;
  }
}

export default window.SplashAPI;
export const l10n = window.SplashAPI.l10n;
