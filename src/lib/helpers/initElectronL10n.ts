import { app } from "electron";
import settings from "electron-settings";
import { loadLanguage } from "./l10n";

const initElectronL10n = () => {
  const settingsLocale = settings.get("locale");
  const systemLocale = app.getLocale();
  const appLocale = String(settingsLocale || systemLocale);
  loadLanguage(appLocale);
};

export default initElectronL10n;
