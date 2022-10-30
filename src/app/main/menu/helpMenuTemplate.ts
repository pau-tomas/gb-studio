import { MenuItemConstructorOptions } from "electron";
import l10n from "lib/helpers/l10n";

interface HelpMenuTemplateProps {
  openDocs: () => void;
  openLearnMore: () => void;
}

export default ({
  openDocs,
  openLearnMore,
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
  ],
});
