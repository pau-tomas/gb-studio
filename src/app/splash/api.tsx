export interface SplashAPI {
  platform: string;
  l10n: (key: string, params?: Record<string, string | number>) => string;
  openExternal: (path: string) => Promise<void>;
  theme: {
    getShouldUseDarkColors: () => Promise<boolean>;
    getThemeSetting: () => Promise<unknown>;
    onChange: (callback: () => void) => Promise<void>;
  };
  getRecentProjects: () => Promise<string[]>;
  path: {
    basename: (input: string) => string;
    dirname: (input: string) => string;
  };
}

declare global {
  interface Window {
    SplashAPI: SplashAPI;
  }
}

export default window.SplashAPI;
export const l10n = window.SplashAPI.l10n;
