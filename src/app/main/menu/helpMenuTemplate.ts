import { MenuItemConstructorOptions } from "electron";
import l10n from "lib/helpers/l10n";

interface AppMenuTemplateProps {
  openDocs: () => void;
  openLearnMore: () => void;
}

export default ({
  openDocs,
  openLearnMore,
}: AppMenuTemplateProps): MenuItemConstructorOptions => ({
  role: "help",
  label: l10n("MENU_HELP"),
  submenu: [
    {
      label: l10n("MENU_DOCUMENTATION"),
      click() {
        openDocs();
      },
    },
    {
      label: l10n("MENU_LEARN_MORE"),
      click() {
        openLearnMore();
      },
    },
  ],
});
