import l10n from "../helpers/l10n";

export const id = "EVENT_CLEAR_BG_SCRIPT";

export const fields = [
  {
    label: l10n("FIELD_CLEAR_BG_SCRIPT")
  }
];

export const compile = (input, helpers) => {
  const { clearBGScript } = helpers;
  clearBGScript();
};
