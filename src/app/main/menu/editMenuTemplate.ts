import { MenuItemConstructorOptions } from "electron";
import l10n from "lib/helpers/l10n";

interface EditMenuTemplateProps {
  isProjectOpen: () => boolean;
  undo: () => void;
  redo: () => void;
  pasteInPlace: () => void;
}

export default ({
  isProjectOpen,
  undo,
  redo,
  pasteInPlace,
}: EditMenuTemplateProps): MenuItemConstructorOptions => ({
  label: l10n("MENU_EDIT"),
  submenu: [
    {
      label: l10n("MENU_UNDO"),
      accelerator: "CommandOrControl+Z",
      click: undo,
    },
    {
      label: l10n("MENU_REDO"),
      accelerator: "CommandOrControl+Shift+Z",
      click: redo,
    },
    { type: "separator" },
    { role: "cut", label: l10n("MENU_CUT") },
    { role: "copy", label: l10n("MENU_COPY") },
    { role: "paste", label: l10n("MENU_PASTE") },
    ...(isProjectOpen()
      ? ([
          {
            label: l10n("MENU_PASTE_IN_PLACE"),
            accelerator: "Shift+CommandOrControl+V",
            click: pasteInPlace(),
          },
        ] as MenuItemConstructorOptions[])
      : []),
    { role: "delete", label: l10n("MENU_DELETE") },
    { role: "selectAll", label: l10n("MENU_SELECT_ALL") },
  ],
});
