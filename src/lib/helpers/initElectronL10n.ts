import fs from "fs";
import en from "lib/lang/en.json";
import { localesRoot } from "lib/pathConsts";
import {
  setDebug,
  L10NLookup,
  l10nStrings,
  setLanguageData,
} from "shared/lib/l10n";
import { app } from "electron";
import settings from "electron-settings";

export const loadLanguage = (locale: string) => {
  setLanguageData(en);
  if (locale && locale !== "en") {
    try {
      const translation = JSON.parse(
        fs.readFileSync(`${localesRoot}/${locale}.json`, "utf-8")
      ) as L10NLookup;
      for (const key in translation) {
        l10nStrings[key] = translation[key];
      }
      return translation;
    } catch (e) {
      console.warn("No language pack for user setting, falling back to en");
      console.warn(
        `Add a language pack by making the file src/lib/lang/${locale}.json`
      );
    }
  }
  if (typeof locale === "string" && locale.length === 0) {
    console.warn("Locale is set but doesn't have a value.");
    console.warn("Have you used l10n from electron before app is ready?");
    console.trace();
  }
  return {};
};

const initElectronL10n = () => {
  if (process.env.DEBUG_L10N) {
    setDebug(true);
  }
  const settingsLocale = settings.getSync("locale");
  const systemLocale = app.getLocale();
  const appLocale = String(settingsLocale || systemLocale);
  loadLanguage(appLocale);
};

export default initElectronL10n;
