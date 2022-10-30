import { MenuItemConstructorOptions } from "electron";
import l10n from "lib/helpers/l10n";

interface FileMenuTemplateProps {
  isProjectOpen: () => boolean;
  openNewProject: () => void;
  openProject: () => void;
  switchProject: () => void;
  saveProject: () => void;
  saveProjectAs: () => void;
  reloadAssets: () => void;
}

export default ({
  isProjectOpen,
  openNewProject,
  openProject,
  switchProject,
  saveProject,
  saveProjectAs,
  reloadAssets,
}: FileMenuTemplateProps): MenuItemConstructorOptions => ({
  label: l10n("MENU_FILE"),
  submenu: [
    {
      label: l10n("MENU_NEW_PROJECT"),
      accelerator: "CommandOrControl+N",
      click: openNewProject,
    },
    {
      label: l10n("MENU_OPEN"),
      accelerator: "CommandOrControl+O",
      click: openProject,
    },
    {
      label: l10n("MENU_SWITCH_PROJECT"),
      accelerator: "CommandOrControl+P",
      click: switchProject,
    },
    ...(isProjectOpen()
      ? ([
          {
            label: l10n("MENU_SAVE"),
            accelerator: "CommandOrControl+S",
            click: saveProject,
          },
          {
            label: l10n("MENU_SAVE_AS"),
            accelerator: "CommandOrControl+Alt+S",
            click: saveProjectAs,
          },
          { type: "separator" },
          {
            label: l10n("MENU_RELOAD_ASSETS"),
            accelerator: "CommandOrControl+Shift+R",
            click: reloadAssets,
          },
        ] as MenuItemConstructorOptions[])
      : []),
    { type: "separator" },
    { role: "close", label: l10n("MENU_CLOSE") },
  ],
});
