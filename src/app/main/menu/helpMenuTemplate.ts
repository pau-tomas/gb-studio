import { MenuItemConstructorOptions } from "electron";
import l10n from "lib/helpers/l10n";

interface HelpMenuTemplateProps {
  platform: string;
  openDocs: () => void;
  openLearnMore: () => void;
  openAbout: () => void;
  checkForUpdates: () => void;
}

export default ({
  platform,
  openDocs,
  openLearnMore,
  openAbout,
  checkForUpdates,
}: HelpMenuTemplateProps): MenuItemConstructorOptions => ({
  role: "help",
  label: l10n("MENU_HELP"),
  submenu: [
    {
      label: l10n("MENU_DOCUMENTATION"),
      click: openDocs,
    },
    {
      label: l10n("MENU_LEARN_MORE"),
      click: openLearnMore,
    },
    ...(platform !== "darwin"
      ? ([
          { type: "separator" },
          {
            label: l10n("MENU_ABOUT"),
            click: openAbout,
          },
          {
            label: l10n("MENU_CHECK_FOR_UPDATES"),
            click: checkForUpdates,
          },
        ] as MenuItemConstructorOptions[])
      : []),
  ],
});
