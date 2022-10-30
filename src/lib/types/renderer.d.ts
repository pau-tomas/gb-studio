export interface SplashAPI {
  platform: string;
  openExternal: (path: string) => Promise<void>;
}

declare global {
  interface Window {
    SplashAPI: SplashAPI;
  }
}
