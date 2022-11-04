import l10n from "lib/helpers/l10n";

export const L10NApi = {
  l10n: (key: string, params?: Record<string, string | number>) =>
    l10n(key, params),
} as const;
