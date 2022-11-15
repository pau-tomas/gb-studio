// import { app, BrowserWindow, ipcMain, shell } from "electron";
import { Menu, app, shell, dialog, protocol } from "electron";
import open from "open";
import url from "url";
import initElectronL10n from "lib/helpers/initElectronL10n";
import { CreateProjectInput } from "lib/project/createProject";
import initIPC from "./ipc";
import appMenuTemplate from "./menu/appMenuTemplate";
import devMenuTemplate from "./menu/devMenuTemplate";
import editMenuTemplate from "./menu/editMenuTemplate";
import fileMenuTemplate from "./menu/fileMenuTemplate";
import gameMenuTemplate from "./menu/gameMenuTemplate";
import helpMenuTemplate from "./menu/helpMenuTemplate";
import viewMenuTemplate from "./menu/viewMenuTemplate";
import windowMenuTemplate from "./menu/windowMenuTemplate";
// import MenuManager from "./menuManager";
import WindowManager from "./windowManager";
import createProject from "lib/project/createProject";
import settings from "electron-settings";
import { isString } from "@byte.london/byteguards";
import switchLanguageDialog from "lib/electron/dialog/switchLanguageDialog";

const windowManager = new WindowManager();

const isDevMode = !!process.execPath.match(/[\\/]electron/);

const openDocs = () => shell.openExternal("https://www.gbstudio.dev/docs/");
const openLearnMore = () => shell.openExternal("https://www.gbstudio.dev");

const openPreferences = () => {
  windowManager.openPreferencesWindow();
};

const onOpenAbout = () => {
  windowManager.openAboutWindow();
};

const onOpenHelp = async (helpPage: string) => {
  if (helpPage === "sprites") {
    shell.openExternal("https://www.gbstudio.dev/docs/sprites/");
  } else if (helpPage === "backgrounds") {
    shell.openExternal("https://www.gbstudio.dev/docs/backgrounds/");
  } else if (helpPage === "ui-elements") {
    shell.openExternal("https://www.gbstudio.dev/docs/ui-elements/");
  } else if (helpPage === "music") {
    shell.openExternal("https://www.gbstudio.dev/docs/music/");
  } else if (helpPage === "error") {
    shell.openExternal("https://www.gbstudio.dev/docs/error/");
  }
};

const onOpenPlayWindow = async (url: string, sgbMode: boolean) => {
  windowManager.openPlayWindow(url, sgbMode);
};

const onCreateProject = async (
  input: CreateProjectInput,
  options?: {
    openOnSuccess?: boolean;
  }
): Promise<void> => {
  const projectDataPath = await createProject(input);
  if (options?.openOnSuccess) {
    await onOpenProject(projectDataPath);
  }
};

const onOpenProject = async (projectPath: string): Promise<void> => {
  windowManager.openProject(projectPath);
};

const onSelectProjectToOpen = async () => {
  const files = dialog.showOpenDialogSync({
    properties: ["openFile"],
    filters: [
      {
        name: "Projects",
        extensions: ["gbsproj", "json"],
      },
    ],
  });
  if (files && files[0]) {
    onOpenProject(files[0]);
  }
};

const onOpenAsset = async (filePath: string, type: string) => {
  if (type === "image") {
    const app = String(settings.get("imageEditorPath") || "") || undefined;
    open(filePath, { app });
  } else if (type === "music") {
    const app = String(settings.get("musicEditorPath") || "") || undefined;
    open(filePath, { app });
  } else {
    shell.openPath(filePath);
  }
};

const onSetTheme = async (theme: string) => {
  await settings.set("theme", theme);
  windowManager.notifyThemeUpdate();
  setApplicationMenu();
};

const onResetTheme = async () => {
  await settings.delete("theme");
  windowManager.notifyThemeUpdate();
  setApplicationMenu();
};

const onSetLocale = async (locale: string) => {
  await settings.set("locale", locale);
  initElectronL10n();
  setApplicationMenu();
  switchLanguageDialog();
};

const onResetLocale = async () => {
  await settings.delete("locale");
  initElectronL10n();
  setApplicationMenu();
  switchLanguageDialog();
};

const onSetWindowZoom = async (zoomLevel: number) => {
  await settings.set("zoomLevel", zoomLevel);
  windowManager.notifyWindowZoom(zoomLevel);
};

const onSetTrackerKeyBindings = async (value: number) => {
  await settings.set("trackerKeyBindings", value);
  windowManager.notifyTrackerKeyBindings(value);
};

const setApplicationMenu = async () => {
  const isProjectOpen = () => windowManager.isProjectWindowOpen();
  const platform = process.platform;
  const themeSetting = await settings.get("theme");
  const theme = isString(themeSetting) ? themeSetting : undefined;
  const localeSetting = await settings.get("locale");
  const locale = isString(localeSetting) ? localeSetting : undefined;
  const menus = [
    ...(platform === "darwin"
      ? [
          appMenuTemplate({
            openAbout: onOpenAbout,
            checkForUpdates: () => {},
            openPreferences,
          }),
        ]
      : []),
    fileMenuTemplate({
      isProjectOpen,
      openNewProject: () => windowManager.openSplashWindow("new"),
      openProject: onSelectProjectToOpen,
      switchProject: () => windowManager.openSplashWindow("recent"),
      saveProject: () => {},
      saveProjectAs: () => {},
      reloadAssets: () => {},
    }),
    editMenuTemplate({
      platform,
      isProjectOpen,
      undo: () => {},
      redo: () => {},
      pasteInPlace: () => {},
      openPreferences,
    }),
    ...(isProjectOpen()
      ? [
          gameMenuTemplate({
            runGame: () => {},
            buildROM: () => {},
            buildWeb: () => {},
            buildPocket: () => {},
            ejectEngine: () => {},
            exportProjectSrc: () => {},
            exportProjectData: () => {},
          }),
        ]
      : []),
    viewMenuTemplate({
      isProjectOpen,
      setSection: () => {},
      theme,
      setTheme: onSetTheme,
      resetTheme: onResetTheme,
      locale,
      setLocale: onSetLocale,
      resetLocale: onResetLocale,
      setShowCollisions: () => {},
      getShowConnections: () => undefined,
      setShowConnections: () => {},
      getShowNavigator: () => undefined,
      setShowNavigator: () => {},
      zoomIn: () => {},
      zoomOut: () => {},
      zoomReset: () => {},
    }),
    ...(isDevMode ? [devMenuTemplate] : []),
    windowMenuTemplate({
      platform,
    }),
    helpMenuTemplate({
      platform,
      openDocs,
      openLearnMore,
      openAbout: onOpenAbout,
      checkForUpdates: () => {},
    }),
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

protocol.registerSchemesAsPrivileged([
  { scheme: "atom", privileges: { bypassCSP: true } },
  { scheme: "file", privileges: { bypassCSP: true } },
]);

app.on("ready", () => {
  initElectronL10n();
  windowManager.init({
    setApplicationMenu,
  });
  initIPC({
    onCreateProject,
    onSelectProjectToOpen,
    onOpenProject,
    onSetWindowZoom,
    onSetTrackerKeyBindings,
    onOpenPlayWindow,
    onOpenHelp,
    onOpenAsset,
  });
  setApplicationMenu();
  console.warn(
    "@TODO Use custom protocol to only allow reading files within current project rather than allowing file:// directly"
  );
  protocol.registerFileProtocol("atom", (request, callback) => {
    const filePath = url.fileURLToPath(
      "file://" + request.url.slice("atom://".length)
    );
    callback(filePath);
  });
});
