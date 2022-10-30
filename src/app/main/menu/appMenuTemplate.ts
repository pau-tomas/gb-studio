import { app, MenuItemConstructorOptions } from "electron";
import l10n from "lib/helpers/l10n";

interface AppMenuTemplateProps {
  openAbout: () => void;
  checkForUpdates: () => void;
  openPreferences: () => void;
}

export default ({
  openAbout,
  checkForUpdates,
  openPreferences,
}: AppMenuTemplateProps): MenuItemConstructorOptions => ({
  label: app.name,
  submenu: [
    {
      label: l10n("MENU_ABOUT"),
      click() {
        openAbout();
      },
    },
    {
      label: l10n("MENU_CHECK_FOR_UPDATES"),
      click: () => {
        checkForUpdates();
      },
    },
    { type: "separator" },
    {
      label: l10n("MENU_PREFERENCES"),
      accelerator: "CommandOrControl+,",
      click: () => {
        openPreferences();
      },
    },
    { type: "separator" },
    { role: "services" },
    { type: "separator" },
    { role: "hide" },
    { role: "hideOthers" },
    { role: "unhide" },
    { type: "separator" },
    { role: "quit" },
  ],
});
