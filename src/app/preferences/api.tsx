import type { PreferencesAPI } from "./preload";

declare global {
  interface Window {
    PreferencesAPI: typeof PreferencesAPI;
  }
}

export default window.PreferencesAPI;
export const l10n = window.PreferencesAPI.l10n;
