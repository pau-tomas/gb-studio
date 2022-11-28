import { dialog, BrowserWindow } from "electron";
import l10n from "shared/lib/l10n";
import assertIsMainProcess from "lib/electron/assertIsMainProcess";

assertIsMainProcess();

const confirmEnableColorDialog = () => {
  const dialogOptions = {
    type: "info",
    buttons: [l10n("DIALOG_ENABLE_COLOR"), l10n("DIALOG_CANCEL")],
    defaultId: 0,
    cancelId: 1,
    title: l10n("DIALOG_ENABLE_COLOR_MODE"),
    message: l10n("DIALOG_ENABLE_COLOR_MODE"),
    detail: l10n("DIALOG_ENABLE_COLOR_MODE_DESCRIPTION"),
  };
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    return dialog.showMessageBoxSync(win, dialogOptions);
  }
  return false;
};

export default confirmEnableColorDialog;
