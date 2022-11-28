import en from "lib/lang/en.json";

export interface L10NLookup {
  [key: string]: string | boolean | undefined;
}

export interface L10NParams {
  [key: string]: string | number | undefined;
}

export const l10nStrings: L10NLookup = { ...en };
let debugMode = false;

const l10n = (key: string, params?: L10NParams): string => {
  if (debugMode) {
    return key;
  }
  const l10nString = l10nStrings[key] || key;
  if (typeof l10nString === "string") {
    if (params) {
      return replaceParams(l10nString, params);
    }
    return l10nString;
  }
  return String(l10nString);
};

export const replaceParams = (string: string, params: L10NParams) => {
  let outputString = string;
  Object.keys(params).forEach((param) => {
    const pattern = new RegExp(`{${param}}`, "g");
    const paramValue = String(params[param] || "");
    outputString = outputString.replace(pattern, paramValue);
  });
  return outputString;
};

export const setLanguageData = (data: L10NLookup) => {
  for (const [key, value] of Object.entries(data)) {
    l10nStrings[key] = value;
  }
};

export const isRTL = (): boolean => {
  return !!l10nStrings.RTL;
};

export const setDebug = (debug: boolean) => (debugMode = debug);

export default l10n;
