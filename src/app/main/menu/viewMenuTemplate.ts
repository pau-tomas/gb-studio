import { MenuItemConstructorOptions } from "electron";
import l10n, { locales } from "lib/helpers/l10n";

interface ViewMenuTemplateProps {
  isProjectOpen: () => boolean;
  setSection: (section: string) => void;
  theme?: string;
  setTheme: (theme: string) => void;
  resetTheme: () => void;
  locale: string | undefined;
  setLocale: (locale: string) => void;
  resetLocale: () => void;
  setShowCollisions: (value: boolean | undefined) => void;
  getShowConnections: () => string | undefined;
  setShowConnections: (value: string | undefined) => void;
  getShowNavigator: () => boolean | undefined;
  setShowNavigator: (value: boolean | undefined) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
}

export default ({
  isProjectOpen,
  setSection,
  theme,
  setTheme,
  resetTheme,
  setLocale,
  resetLocale,
  locale,
  setShowCollisions,
  getShowConnections,
  setShowConnections,
  getShowNavigator,
  setShowNavigator,
  zoomIn,
  zoomOut,
  zoomReset,
}: ViewMenuTemplateProps): MenuItemConstructorOptions => ({
  label: l10n("MENU_VIEW"),
  submenu: [
    ...(isProjectOpen()
      ? ([
          {
            label: l10n("MENU_GAME_WORLD"),
            accelerator: "CommandOrControl+1",
            click: () => setSection("world"),
          },
          {
            label: l10n("MENU_SPRITES"),
            accelerator: "CommandOrControl+2",
            click: () => setSection("sprites"),
          },
          {
            label: l10n("MENU_BACKGROUNDS"),
            accelerator: "CommandOrControl+3",
            click: () => setSection("backgrounds"),
          },
          {
            label: l10n("MENU_MUSIC"),
            accelerator: "CommandOrControl+4",
            click: () => setSection("music"),
          },
          {
            label: l10n("MENU_SFX"),
            accelerator: "CommandOrControl+5",
            click: () => setSection("sounds"),
          },
          {
            label: l10n("MENU_PALETTES"),
            accelerator: "CommandOrControl+6",
            click: () => setSection("palettes"),
          },
          {
            label: l10n("MENU_DIALOGUE_REVIEW"),
            accelerator: "CommandOrControl+7",
            click: () => setSection("dialogue"),
          },
          {
            label: l10n("MENU_BUILD_AND_RUN"),
            accelerator: "CommandOrControl+8",
            click: () => setSection("build"),
          },
          {
            label: l10n("MENU_SETTINGS"),
            accelerator: "CommandOrControl+9",
            click: () => setSection("settings"),
          },
          { type: "separator" },
        ] as MenuItemConstructorOptions[])
      : []),
    {
      label: l10n("MENU_THEME"),
      submenu: [
        {
          id: "themeDefault",
          label: l10n("MENU_THEME_DEFAULT"),
          type: "checkbox",
          checked: theme === undefined,
          click() {
            resetTheme();
          },
        },
        { type: "separator" },
        {
          id: "themeLight",
          label: l10n("MENU_THEME_LIGHT"),
          type: "checkbox",
          checked: theme === "light",
          click() {
            setTheme("light");
          },
        },
        {
          id: "themeDark",
          label: l10n("MENU_THEME_DARK"),
          type: "checkbox",
          checked: theme === "dark",
          click() {
            setTheme("dark");
          },
        },
      ],
    },
    {
      label: l10n("MENU_LANGUAGE"),
      submenu: [
        {
          id: "localeDefault",
          label: l10n("MENU_LANGUAGE_DEFAULT"),
          type: "checkbox",
          checked: locale === undefined,
          click() {
            resetLocale();
          },
        },
        { type: "separator" },
        ...locales.map((l) => {
          return {
            id: `locale-${l}`,
            label: l,
            type: "checkbox",
            checked: locale === l,
            click() {
              setLocale(l);
            },
          } as MenuItemConstructorOptions;
        }),
      ],
    },
    { type: "separator" },
    ...(isProjectOpen()
      ? ([
          {
            id: "showCollisions",
            label: l10n("MENU_SHOW_COLLISIONS"),
            type: "checkbox",
            checked: true,
            click: (item) => {
              setShowCollisions(item.checked);
            },
          },
          {
            label: l10n("MENU_SHOW_CONNECTIONS"),
            submenu: [
              {
                id: "showConnectionsAll",
                label: l10n("MENU_SHOW_CONNECTIONS_ALL"),
                type: "checkbox",
                checked: getShowConnections() === "all",
                click() {
                  setShowConnections("all");
                },
              },
              {
                id: "showConnectionsSelected",
                label: l10n("MENU_SHOW_CONNECTIONS_SELECTED"),
                type: "checkbox",
                checked: getShowConnections() === "selected",
                click() {
                  setShowConnections("selected");
                },
              },
              { type: "separator" },
              {
                id: "showConnectionsNone",
                label: l10n("MENU_SHOW_CONNECTIONS_NONE"),
                type: "checkbox",
                checked: !getShowConnections(),
                click() {
                  setShowConnections("");
                },
              },
            ],
          },
          {
            id: "showNavigator",
            label: l10n("MENU_SHOW_NAVIGATOR"),
            checked: getShowNavigator() !== false,
            type: "checkbox",
            click: (item) => {
              setShowNavigator(item.checked);
            },
          },
          { type: "separator" },
        ] as MenuItemConstructorOptions[])
      : []),
    {
      label: l10n("MENU_ZOOM_RESET"),
      accelerator: "CommandOrControl+0",
      click: zoomReset,
    },
    {
      label: l10n("MENU_ZOOM_IN"),
      accelerator: "CommandOrControl+=",
      click: zoomIn,
    },
    {
      label: l10n("MENU_ZOOM_OUT"),
      accelerator: "CommandOrControl+-",
      click: zoomOut,
    },
  ],
});
