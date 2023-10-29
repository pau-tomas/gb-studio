import { MessageBoxSyncOptions, dialog } from "electron";
import l10n from "shared/lib/l10n";
import assertIsMainProcess from "lib/electron/assertIsMainProcess";

assertIsMainProcess();

const confirmDeleteCustomEvent = (
  name: string,
  sceneNames: string[],
  count: number
) => {
  const dialogOptions = {
    type: "info",
    buttons: [l10n("DIALOG_DELETE"), l10n("DIALOG_CANCEL")],
    defaultId: 0,
    cancelId: 1,
    title: l10n("DIALOG_DELETE_CUSTOM_EVENT", { name }),
    message: l10n("DIALOG_DELETE_CUSTOM_EVENT", { name }),
    detail: l10n(
      count === 1
        ? "DIALOG_DELETE_CUSTOM_EVENT_USED_SINGLAR"
        : "DIALOG_DELETE_CUSTOM_EVENT_USED",
      { count, sceneNames: sceneNames.join(", ") }
    ),
  } as MessageBoxSyncOptions;

  return dialog.showMessageBoxSync(dialogOptions);
};

export default confirmDeleteCustomEvent;
