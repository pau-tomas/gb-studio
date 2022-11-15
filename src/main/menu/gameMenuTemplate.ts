import { MenuItemConstructorOptions } from "electron";
import l10n from "lib/helpers/l10n";

interface GameMenuTemplateProps {
  runGame: () => void;
  buildROM: () => void;
  buildWeb: () => void;
  buildPocket: () => void;
  ejectEngine: () => void;
  exportProjectSrc: () => void;
  exportProjectData: () => void;
}

const gameMenuTemplate = ({
  runGame,
  buildROM,
  buildWeb,
  buildPocket,
  ejectEngine,
  exportProjectSrc,
  exportProjectData,
}: GameMenuTemplateProps): MenuItemConstructorOptions => ({
  label: l10n("MENU_GAME"),
  submenu: [
    {
      label: l10n("MENU_RUN"),
      accelerator: "CommandOrControl+B",
      click: runGame,
    },
    {
      label: l10n("MENU_EXPORT_AS"),
      submenu: [
        {
          label: l10n("MENU_EXPORT_ROM"),
          accelerator: "CommandOrControl+Shift+B",
          click: buildROM,
        },
        {
          label: l10n("MENU_EXPORT_WEB"),
          accelerator: "CommandOrControl+Shift+N",
          click: buildWeb,
        },
        {
          label: l10n("MENU_EXPORT_POCKET"),
          accelerator: "CommandOrControl+Shift+M",
          click: buildPocket,
        },
      ],
    },
    { type: "separator" },
    {
      label: l10n("MENU_ADVANCED"),
      submenu: [
        {
          label: l10n("MENU_EJECT_ENGINE"),
          click: ejectEngine,
        },
        { type: "separator" },
        {
          label: l10n("MENU_EJECT_PROJECT_BUILD"),
          click: exportProjectSrc,
        },
        {
          label: l10n("MENU_EJECT_PROJECT_DATA"),
          click: exportProjectData,
        },
      ],
    },
  ],
});

export default gameMenuTemplate;
