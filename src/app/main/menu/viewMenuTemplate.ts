import { MenuItemConstructorOptions } from "electron";
import l10n from "lib/helpers/l10n";

interface ViewMenuTemplateProps {
  isProjectOpen: () => boolean;
  setSection: (section: string) => void;
  getTheme: () => string | undefined;
  setTheme: (theme: string | undefined) => void;
  getLocale: () => string | undefined;
  getLocales: () => string[];
  setLocale: (locale: string | undefined) => void;
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
  setTheme,
  getTheme,
  setLocale,
  getLocale,
  getLocales,
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
          checked: getTheme() === undefined,
          click() {
            setTheme(undefined);
          },
        },
        { type: "separator" },
        {
          id: "themeLight",
          label: l10n("MENU_THEME_LIGHT"),
          type: "checkbox",
          checked: getTheme() === "light",
          click() {
            setTheme("light");
          },
        },
        {
          id: "themeDark",
          label: l10n("MENU_THEME_DARK"),
          type: "checkbox",
          checked: getTheme() === "dark",
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
          checked: getLocale() === undefined,
          click() {
            setLocale(undefined);
          },
        },
        { type: "separator" },
        ...getLocales().map((locale) => {
          return {
            id: `locale-${locale}`,
            label: locale,
            type: "checkbox",
            checked: getLocale() === locale,
            click() {
              setLocale(locale);
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
