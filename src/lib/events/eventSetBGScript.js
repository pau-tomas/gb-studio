import l10n from "../helpers/l10n";

export const id = "EVENT_SET_BG_SCRIPT";

export const fields = [
  {
    label: l10n("FIELD_SET_BG_SCRIPT")
  }
];

export const compile = (input, helpers) => {
  const { setBGScript } = helpers;
  setBGScript();
};
