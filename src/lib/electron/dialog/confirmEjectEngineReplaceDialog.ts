import { MessageBoxSyncOptions, dialog } from "electron";
import l10n from "shared/lib/l10n";
import assertIsMainProcess from "lib/electron/assertIsMainProcess";

assertIsMainProcess();

const confirmEjectEngineReplaceDialog = () => {
  const dialogOptions = {
    type: "info",
    buttons: [l10n("DIALOG_EJECT_REPLACE"), l10n("DIALOG_CANCEL")],
    defaultId: 0,
    cancelId: 1,
    title: l10n("DIALOG_EJECT_ENGINE_REPLACE"),
    message: l10n("DIALOG_EJECT_ENGINE_REPLACE"),
    detail: l10n("DIALOG_EJECT_ENGINE_REPLACE_DESCRIPTION"),
  } as MessageBoxSyncOptions;

  return dialog.showMessageBoxSync(dialogOptions);
};

export default confirmEjectEngineReplaceDialog;
