import { dialog } from "electron";
import l10n from "lib/helpers/l10n";
import assertIsMainProcess from "lib/electron/assertIsMainProcess";

assertIsMainProcess();

const confirmReplaceCustomEvent = (name) => {
  const dialogOptions = {
    type: "info",
    buttons: [l10n("DIALOG_REPLACE"), l10n("DIALOG_KEEP")],
    defaultId: 0,
    cancelId: 1,
    title: l10n("DIALOG_REPLACE_CUSTOM_EVENT", { name }),
    message: l10n("DIALOG_REPLACE_CUSTOM_EVENT", { name }),
    detail: l10n("DIALOG_REPLACE_CUSTOM_EVENT_DESCRIPTION"),
  };

  return dialog.showMessageBoxSync(dialogOptions);
};

export default confirmReplaceCustomEvent;
