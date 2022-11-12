import { MenuItemConstructorOptions } from "electron";
import l10n from "lib/helpers/l10n";

interface WindowMenuTemplateProps {
  platform: string;
}

const windowMenuTemplate = ({
  platform,
}: WindowMenuTemplateProps): MenuItemConstructorOptions => ({
  role: "window",
  label: l10n("MENU_WINDOW"),
  submenu: [
    { role: "minimize" },
    ...(platform === "darwin"
      ? ([
          { role: "zoom" },
          { type: "separator" },
          { role: "front" },
        ] as MenuItemConstructorOptions[])
      : []),
  ],
});

export default windowMenuTemplate;
